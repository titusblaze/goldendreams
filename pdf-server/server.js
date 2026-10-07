const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

const ALLOWED_HOST = "os5.mycloud.com";

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

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Golden Dreams PDF server running",
    port: PORT,
  });
});

app.get("/api/pdf", async (req, res) => {
  const shareUrl = req.query.url;

  console.log("");
  console.log("==========================================");
  console.log(" GOLDEN DREAMS PDF REQUEST");
  console.log("==========================================");

  console.log("Share URL:");
  console.log(shareUrl);

  if (!shareUrl) {
    return res.status(400).json({
      success: false,
      message: "Missing My Cloud share URL",
    });
  }

  if (!isValidShareUrl(shareUrl)) {
    return res.status(400).json({
      success: false,
      message: "Invalid My Cloud OS 5 share URL",
    });
  }

  let browser = null;

  try {
    console.log("");
    console.log("Launching Chromium...");

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    console.log("Chromium launched.");

    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000,
      },

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/154.0.0.0 Safari/537.36",

      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const page = await context.newPage();

    // This will contain the actual PDF bytes.
    let pdfBuffer = null;

    // Promise that resolves when the PDF is captured.
    let pdfResolve;

    let pdfReject;

    const pdfPromise = new Promise((resolve, reject) => {
      pdfResolve = resolve;
      pdfReject = reject;
    });

    // --------------------------------------------------
    // IMPORTANT:
    // Read the PDF body IMMEDIATELY when response arrives.
    // Do NOT save the Playwright Response object.
    // --------------------------------------------------

    page.on("response", async (response) => {
      try {
        const url = response.url();

        const contentType =
          response.headers()["content-type"] || "";

        if (
          url.includes("/sdk/v2/files/") &&
          url.includes("/content")
        ) {
          console.log("");
          console.log("------------------------------------------");
          console.log(" MY CLOUD CONTENT RESPONSE");
          console.log("------------------------------------------");

          console.log("Status:", response.status());
          console.log("Content-Type:", contentType);

          if (
            response.status() === 200 &&
            contentType
              .toLowerCase()
              .includes("application/pdf")
          ) {
            console.log("");
            console.log("PDF RESPONSE FOUND!");
            console.log("Reading PDF body immediately...");

            try {
              const body = await response.body();

              if (!body || body.length === 0) {
                throw new Error(
                  "PDF response body is empty."
                );
              }

              const header = body
                .subarray(0, 4)
                .toString("ascii");

              console.log(
                "Captured bytes:",
                body.length
              );

              console.log(
                "PDF Header:",
                header
              );

              if (header !== "%PDF") {
                throw new Error(
                  "Captured response is not a valid PDF."
                );
              }

              pdfBuffer = body;

              console.log("");
              console.log(
                "PDF BODY CAPTURED SUCCESSFULLY!"
              );

              pdfResolve(body);
            } catch (error) {
              console.error("");
              console.error(
                "PDF body capture error:",
                error.message
              );

              pdfReject(error);
            }
          }
        }
      } catch (error) {
        console.error(
          "Response listener error:",
          error.message
        );
      }
    });

    console.log("");
    console.log("Opening My Cloud share...");

    try {
      await page.goto(shareUrl, {
        waitUntil: "commit",
        timeout: 30000,
      });

      console.log(
        "My Cloud navigation committed."
      );
    } catch (error) {
      console.log("");
      console.log(
        "Navigation warning:",
        error.message
      );

      console.log(
        "Continuing because My Cloud may still be loading..."
      );
    }

    console.log("");
    console.log(
      "Waiting for My Cloud PDF response..."
    );

    // Wait for the PDF body to be captured.
    await Promise.race([
      pdfPromise,

      new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "My Cloud did not provide the PDF within 90 seconds."
            )
          );
        }, 90000);
      }),
    ]);

    if (!pdfBuffer) {
      throw new Error(
        "PDF was not captured."
      );
    }

    console.log("");
    console.log("==========================================");
    console.log(" PDF DOWNLOADED SUCCESSFULLY");
    console.log("==========================================");

    console.log(
      "PDF Size:",
      (
        pdfBuffer.length /
        1024 /
        1024
      ).toFixed(2),
      "MB"
    );

    // --------------------------------------------------
    // SEND PDF TO CLIENT
    // --------------------------------------------------

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
    console.log(
      "PDF SENT TO CLIENT SUCCESSFULLY."
    );

  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error(" PDF SERVER ERROR");
    console.error("==========================================");

    console.error(
      "Error:",
      error.message
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          "Unable to retrieve PDF from My Cloud.",
        error: error.message,
      });
    }

  } finally {
    if (browser) {
      try {
        await browser.close();

        console.log("");
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

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log(" Golden Dreams PDF Server");
  console.log("==========================================");

  console.log(
    `Server running on port: ${PORT}`
  );

  console.log(
    "PDF API: /api/pdf"
  );

  console.log("==========================================");
  console.log("");
});