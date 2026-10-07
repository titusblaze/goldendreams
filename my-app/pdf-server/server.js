const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();

// ======================================================
// PORT
// ======================================================
// Local  -> 5000
// Render -> Uses Render's PORT environment variable

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

const ALLOWED_HOST = "os5.mycloud.com";

// ======================================================
// Validate My Cloud share URL
// ======================================================

function isValidShareUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === ALLOWED_HOST &&
      url.pathname.startsWith("/action/share/")
    );
  } catch {
    return false;
  }
}

// ======================================================
// Health check
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Golden Dreams PDF server running",
    port: PORT,
  });
});

// ======================================================
// PDF API
// ======================================================

app.get("/api/pdf", async (req, res) => {
  const shareUrl = req.query.url;

  console.log("");
  console.log("==========================================");
  console.log(" GOLDEN DREAMS PDF REQUEST");
  console.log("==========================================");

  console.log("Share URL:");
  console.log(shareUrl);

  // --------------------------------------------------
  // Check URL
  // --------------------------------------------------

  if (!shareUrl) {
    console.log("ERROR: Missing share URL");

    return res.status(400).json({
      success: false,
      message: "Missing My Cloud share URL",
    });
  }

  if (!isValidShareUrl(shareUrl)) {
    console.log("ERROR: Invalid My Cloud URL");

    return res.status(400).json({
      success: false,
      message: "Invalid My Cloud OS 5 share URL",
    });
  }

  let browser = null;

  try {
    // ==================================================
    // Launch browser
    // ==================================================

    console.log("");
    console.log("Launching Chromium...");

    browser = await chromium.launch({
      headless: true,
    });

    // ==================================================
    // Browser context
    // ==================================================

    const context = await browser.newContext({
      acceptDownloads: false,

      viewport: {
        width: 1440,
        height: 1000,
      },

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/154.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    // ==================================================
    // Variables
    // ==================================================

    let authenticatedPdfUrl = null;

    let pdfResponsePromise = null;

    // ==================================================
    // Watch responses from My Cloud
    // ==================================================

    page.on("response", async (response) => {
      try {
        const url = response.url();

        if (
          url.includes("/sdk/v2/files/") &&
          url.includes("/content")
        ) {
          console.log("");
          console.log("------------------------------------------");
          console.log(" MY CLOUD CONTENT RESPONSE FOUND");
          console.log("------------------------------------------");

          console.log("Status:", response.status());

          console.log(
            "Content-Type:",
            response.headers()["content-type"]
          );

          console.log("URL:");
          console.log(url);

          authenticatedPdfUrl = url;

          pdfResponsePromise = response;
        }
      } catch (error) {
        console.log(
          "Response listener error:",
          error.message
        );
      }
    });

    // ==================================================
    // Open My Cloud
    // ==================================================

    console.log("");
    console.log("Opening My Cloud share...");

    await page.goto(shareUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    console.log("My Cloud page opened.");

    // ==================================================
    // Wait for PDF URL
    // ==================================================

    console.log("");
    console.log(
      "Waiting for My Cloud PDF content request..."
    );

    const startTime = Date.now();

    while (
      !authenticatedPdfUrl &&
      Date.now() - startTime < 90000
    ) {
      await page.waitForTimeout(500);
    }

    // ==================================================
    // Check PDF URL
    // ==================================================

    if (!authenticatedPdfUrl) {
      throw new Error(
        "My Cloud did not generate a PDF content URL within 90 seconds."
      );
    }

    console.log("");
    console.log("==========================================");
    console.log(" AUTHENTICATED PDF URL FOUND");
    console.log("==========================================");

    console.log(authenticatedPdfUrl);

    // ==================================================
    // IMPORTANT
    //
    // Use Playwright browser context request.
    // This shares the My Cloud browser cookies/session.
    // ==================================================

    console.log("");
    console.log(
      "Downloading PDF using authenticated browser session..."
    );

    const apiRequest = context.request;

    const pdfResponse = await apiRequest.get(
      authenticatedPdfUrl,
      {
        timeout: 180000,

        failOnStatusCode: false,

        headers: {
          Accept:
            "application/pdf,application/octet-stream,*/*",
        },
      }
    );

    // ==================================================
    // Response information
    // ==================================================

    console.log("");
    console.log("------------------------------------------");
    console.log(" PDF DOWNLOAD RESPONSE");
    console.log("------------------------------------------");

    console.log(
      "HTTP Status:",
      pdfResponse.status()
    );

    console.log(
      "Content-Type:",
      pdfResponse.headers()["content-type"]
    );

    console.log(
      "Content-Length:",
      pdfResponse.headers()["content-length"]
    );

    // ==================================================
    // Check HTTP status
    // ==================================================

    if (!pdfResponse.ok()) {
      let errorText = "";

      try {
        errorText = await pdfResponse.text();
      } catch {
        errorText = "";
      }

      console.log("");
      console.log("My Cloud returned an error:");
      console.log(errorText.substring(0, 500));

      throw new Error(
        `My Cloud returned HTTP ${pdfResponse.status()}`
      );
    }

    // ==================================================
    // Get PDF buffer
    // ==================================================

    const pdfBuffer = await pdfResponse.body();

    console.log("");
    console.log(
      "Downloaded bytes:",
      pdfBuffer.length
    );

    console.log(
      "PDF Size:",
      (
        pdfBuffer.length /
        1024 /
        1024
      ).toFixed(2),
      "MB"
    );

    // ==================================================
    // Validate PDF
    // ==================================================

    const pdfHeader = pdfBuffer
      .subarray(0, 4)
      .toString("ascii");

    console.log(
      "PDF Header:",
      pdfHeader
    );

    if (pdfHeader !== "%PDF") {
      console.log("");
      console.log(
        "ERROR: Downloaded content is NOT a PDF."
      );

      console.log(
        "First 100 bytes:"
      );

      console.log(
        pdfBuffer
          .subarray(0, 100)
          .toString("utf8")
      );

      throw new Error(
        "My Cloud returned data that is not a valid PDF."
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log("");
    console.log("==========================================");
    console.log(" PDF DOWNLOADED SUCCESSFULLY");
    console.log("==========================================");

    // ==================================================
    // Send PDF to React
    // ==================================================

    res.status(200);

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      'inline; filename="golden-dreams.pdf"'
    );

    res.setHeader(
      "Content-Length",
      pdfBuffer.length
    );

    // Important for browser/PDF.js access
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );

    res.send(pdfBuffer);

    console.log("");
    console.log("PDF SENT TO REACT SUCCESSFULLY.");
    console.log("");

  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error(" PDF SERVER ERROR");
    console.error("==========================================");

    console.error(
      "Error:",
      error.message
    );

    console.error("");

    if (!res.headersSent) {
      res.status(500).json({
        success: false,

        message:
          "Unable to retrieve PDF from My Cloud.",

        error: error.message,
      });
    }

  } finally {
    // ==================================================
    // Close browser
    // ==================================================

    if (browser) {
      try {
        await browser.close();

        console.log(
          "Chromium closed."
        );

      } catch (error) {
        console.log(
          "Browser close error:",
          error.message
        );
      }
    }
  }
});

// ======================================================
// Start server
// ======================================================

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log(" Golden Dreams PDF Server");
  console.log("==========================================");

  console.log(
    `Server running on port: ${PORT}`
  );

  console.log(
    `PDF API: /api/pdf`
  );

  console.log("==========================================");
  console.log("");
});