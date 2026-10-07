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
====================================================
DOWNLOAD PDF
====================================================
*/

function downloadPdf(pdfUrl, cookieHeader, userAgent) {
  return new Promise((resolve, reject) => {
    console.log("");
    console.log("------------------------------------------");
    console.log(" DOWNLOADING PDF");
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
          response.headers["content-length"] ||
            "unknown"
        );

        if (
          response.statusCode < 200 ||
          response.statusCode >= 300
        ) {
          let errorText = "";

          response.on("data", (chunk) => {
            errorText += chunk.toString();
          });

          response.on("end", () => {
            reject(
              new Error(
                `PDF download returned HTTP ${response.statusCode}: ${errorText.substring(
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

          console.log(
            "PDF bytes received:",
            buffer.length
          );

          resolve(buffer);
        });

        response.on("error", reject);
      }
    );

    request.on("timeout", () => {
      request.destroy(
        new Error(
          "PDF download timed out."
        )
      );
    });

    request.on("error", reject);
  });
}

/*
====================================================
ROOT
====================================================
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Golden Dreams PDF server running",
    port: PORT,
  });
});

/*
====================================================
PDF API
====================================================
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
        "Accept-Language":
          "en-US,en;q=0.9",
      },
    });

    const page = await context.newPage();

    /*
    ==================================================
    CAPTURE REQUEST URL
    ==================================================
    */

    let authenticatedPdfUrl = null;

    page.on("request", (request) => {
      try {
        const url = request.url();

        if (
          url.includes("/sdk/v2/files/") &&
          url.includes("/content")
        ) {
          console.log("");
          console.log("------------------------------------------");
          console.log(" MY CLOUD CONTENT REQUEST");
          console.log("------------------------------------------");

          console.log(
            "Method:",
            request.method()
          );

          console.log(
            "URL:",
            url
          );

          authenticatedPdfUrl = url;

          console.log("");
          console.log(
            "AUTHENTICATED PDF REQUEST CAPTURED!"
          );
        }
      } catch (error) {
        console.log(
          "Request listener error:",
          error.message
        );
      }
    });

    /*
    ==================================================
    ALSO WATCH RESPONSES
    ==================================================
    */

    page.on("response", (response) => {
      try {
        const url = response.url();

        if (
          url.includes("/sdk/v2/files/") &&
          url.includes("/content")
        ) {
          console.log("");
          console.log(
            "MY CLOUD CONTENT RESPONSE:"
          );

          console.log(
            "Status:",
            response.status()
          );

          console.log(
            "Content-Type:",
            response.headers()[
              "content-type"
            ] || ""
          );
        }
      } catch (error) {
        console.log(
          "Response listener error:",
          error.message
        );
      }
    });

    /*
    ==================================================
    OPEN MY CLOUD
    ==================================================
    */

    console.log("");
    console.log(
      "Opening My Cloud share..."
    );

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
    }

    /*
    ==================================================
    WAIT FOR PDF REQUEST
    ==================================================
    */

    console.log("");
    console.log(
      "Waiting for My Cloud PDF request..."
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
        "My Cloud did not create the PDF content request within 90 seconds."
      );
    }

    console.log("");
    console.log("==========================================");
    console.log(
      " AUTHENTICATED PDF URL FOUND"
    );
    console.log("==========================================");

    /*
    ==================================================
    GET BROWSER COOKIES
    ==================================================
    */

    const cookies =
      await context.cookies();

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
    ==================================================
    DOWNLOAD PDF
    ==================================================
    */

    const pdfBuffer =
      await downloadPdf(
        authenticatedPdfUrl,
        cookieHeader,
        userAgent
      );

    /*
    ==================================================
    VALIDATE
    ==================================================
    */

    console.log("");
    console.log(
      "Validating PDF..."
    );

    const pdfHeader = pdfBuffer
      .subarray(0, 4)
      .toString("ascii");

    console.log(
      "PDF Header:",
      pdfHeader
    );

    if (pdfHeader !== "%PDF") {
      throw new Error(
        "Downloaded content is not a valid PDF."
      );
    }

    console.log("");
    console.log("==========================================");
    console.log(
      " PDF DOWNLOADED SUCCESSFULLY"
    );
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
    ==================================================
    SEND PDF
    ==================================================
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

  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error(
      " PDF SERVER ERROR"
    );
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
====================================================
START SERVER
====================================================
*/

app.listen(PORT, () => {
  console.log("");
  console.log("==========================================");
  console.log(
    " Golden Dreams PDF Server"
  );
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