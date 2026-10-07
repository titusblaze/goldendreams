const express = require("express");
const cors = require("cors");
const https = require("https");
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

/*
----------------------------------------------------
Download PDF using Node HTTPS
----------------------------------------------------
*/

function downloadPdf(pdfUrl, cookieHeader, userAgent) {
  return new Promise((resolve, reject) => {
    console.log("");
    console.log("------------------------------------------");
    console.log(" DOWNLOADING AUTHENTICATED PDF");
    console.log("------------------------------------------");

    const request = https.get(
      pdfUrl,
      {
        headers: {
          Accept:
            "application/pdf,application/octet-stream,*/*",

          "User-Agent": userAgent,

          Referer:
            "https://os5.mycloud.com/",

          Cookie: cookieHeader || "",
        },

        timeout: 180000,
      },
      (response) => {
        console.log(
          "PDF HTTP Status:",
          response.statusCode
        );

        console.log(
          "PDF Content-Type:",
          response.headers["content-type"]
        );

        console.log(
          "PDF Content-Length:",
          response.headers["content-length"] || "unknown"
        );

        if (
          response.statusCode < 200 ||
          response.statusCode >= 300
        ) {
          let errorData = "";

          response.on("data", (chunk) => {
            errorData += chunk.toString();
          });

          response.on("end", () => {
            reject(
              new Error(
                `My Cloud PDF download returned HTTP ${response.statusCode}: ${errorData.substring(
                  0,
                  500
                )}`
              )
            );
          });

          return;
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const buffer = Buffer.concat(chunks);

          console.log("");
          console.log(
            "PDF bytes received:",
            buffer.length
          );

          resolve(buffer);
        });

        response.on("error", (error) => {
          reject(error);
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(
        new Error(
          "PDF download timed out after 180 seconds."
        )
      );
    });

    request.on("error", (error) => {
      reject(error);
    });
  });
}

/*
----------------------------------------------------
ROOT
----------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Golden Dreams PDF server running",
    port: PORT,
  });
});

/*
----------------------------------------------------
PDF API
----------------------------------------------------
*/

app.get("/api/pdf", async (req, res) => {
  const shareUrl = req.query.url;

  console.log("");
  console.log("==========================================");
  console.log(" GOLDEN DREAMS PDF REQUEST");
  console.log("==========================================");

  console.log("Share URL:");
  console.log(shareUrl);

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

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/154.0.0.0 Safari/537.36";

    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 1000,
      },

      userAgent,

      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const page = await context.newPage();

    let authenticatedPdfUrl = null;

    /*
    ------------------------------------------------
    Watch My Cloud network requests
    ------------------------------------------------
    */

    page.on("response", (response) => {
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

          console.log(
            "Status:",
            response.status()
          );

          console.log(
            "Content-Type:",
            contentType
          );

          if (
            response.status() === 200 &&
            contentType
              .toLowerCase()
              .includes("application/pdf")
          ) {
            authenticatedPdfUrl = url;

            console.log("");
            console.log(
              "AUTHENTICATED PDF URL CAPTURED!"
            );
          }
        }
      } catch (error) {
        console.log(
          "Response listener error:",
          error.message
        );
      }
    });

    /*
    ------------------------------------------------
    Open My Cloud
    ------------------------------------------------
    */

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

    /*
    ------------------------------------------------
    Wait for authenticated PDF URL
    ------------------------------------------------
    */

    console.log("");
    console.log(
      "Waiting for My Cloud PDF URL..."
    );

    const startTime = Date.now();

    while (
      !authenticatedPdfUrl &&
      Date.now() - startTime < 90000
    ) {
      await page.waitForTimeout(500);
    }

    if (!authenticatedPdfUrl) {
      throw new Error(
        "My Cloud did not generate an authenticated PDF URL within 90 seconds."
      );
    }

    console.log("");
    console.log("==========================================");
    console.log(" AUTHENTICATED PDF URL FOUND");
    console.log("==========================================");

    /*
    ------------------------------------------------
    Get browser cookies
    ------------------------------------------------
    */

    const cookies = await context.cookies();

    const cookieHeader = cookies
      .map(
        (cookie) =>
          `${cookie.name}=${cookie.value}`
      )
      .join("; ");

    console.log("");
    console.log(
      "Browser cookies:",
      cookies.length
    );

    /*
    ------------------------------------------------
    Download using Node HTTPS
    ------------------------------------------------
    */

    const pdfBuffer = await downloadPdf(
      authenticatedPdfUrl,
      cookieHeader,
      userAgent
    );

    /*
    ------------------------------------------------
    Validate PDF
    ------------------------------------------------
    */

    console.log("");
    console.log("------------------------------------------");
    console.log(" VALIDATING PDF");
    console.log("------------------------------------------");

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
        "First 100 bytes:"
      );

      console.log(
        pdfBuffer
          .subarray(0, 100)
          .toString("utf8")
      );

      throw new Error(
        "Downloaded content is not a valid PDF."
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

    /*
    ------------------------------------------------
    Send PDF to client
    ------------------------------------------------
    */

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

/*
----------------------------------------------------
START SERVER
----------------------------------------------------
*/

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