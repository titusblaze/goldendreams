const express = require("express");
const cors = require("cors");
const https = require("https");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 10000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["*"],
  })
);

app.use(express.json());

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Golden Dreams PDF server running",
    api: "/api/pdf",
    port: String(PORT),
  });
});

// ==========================================
// VALIDATE MY CLOUD URL
// ==========================================

function isValidMyCloudShareUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.hostname === "os5.mycloud.com" ||
      parsed.hostname.endsWith(".mycloud.com")
    );
  } catch (error) {
    return false;
  }
}

// ==========================================
// CONVERT PLAYWRIGHT COOKIES
// ==========================================

function cookiesToHeader(cookies) {
  return cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

// ==========================================
// FIND MY CLOUD PDF
// ==========================================

async function findMyCloudPdf(page) {
  console.log("");
  console.log("==========================================");
  console.log("SEARCHING FOR MY CLOUD PDF");
  console.log("==========================================");

  let pdfUrl = null;

  const requests = [];
  const responses = [];

  // ----------------------------------------
  // REQUEST MONITOR
  // ----------------------------------------

  page.on("request", (request) => {
    const url = request.url();

    requests.push({
      url,
      method: request.method(),
      resourceType: request.resourceType(),
    });

    const lower = url.toLowerCase();

    if (
      lower.includes(".pdf") ||
      lower.includes("/content") ||
      lower.includes("/download") ||
      lower.includes("/file") ||
      lower.includes("/files/")
    ) {
      console.log("");
      console.log("------------------------------------------");
      console.log("INTERESTING REQUEST");
      console.log("------------------------------------------");
      console.log("URL:", url);
      console.log("Method:", request.method());
      console.log("Type:", request.resourceType());
    }
  });

  // ----------------------------------------
  // RESPONSE MONITOR
  // ----------------------------------------

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    let contentType = "";

    try {
      contentType = response.headers()["content-type"] || "";
    } catch (error) {
      contentType = "";
    }

    responses.push({
      url,
      status,
      contentType,
    });

    const lower = url.toLowerCase();
    const lowerType = contentType.toLowerCase();

    if (
      lowerType.includes("application/pdf") ||
      lower.includes(".pdf") ||
      lower.includes("/content") ||
      lower.includes("/download")
    ) {
      console.log("");
      console.log("==========================================");
      console.log("POSSIBLE PDF RESPONSE");
      console.log("==========================================");
      console.log("Status:", status);
      console.log("Content-Type:", contentType);
      console.log("URL:", url);
      console.log("==========================================");

      if (
        status >= 200 &&
        status < 400 &&
        (
          lowerType.includes("application/pdf") ||
          lower.includes(".pdf")
        )
      ) {
        pdfUrl = url;
      }
    }
  });

  // ----------------------------------------
  // WAIT FOR MY CLOUD
  // ----------------------------------------

  console.log("");
  console.log("Waiting for My Cloud page...");

  await page.waitForTimeout(8000);

  // ----------------------------------------
  // PAGE INFORMATION
  // ----------------------------------------

  try {
    console.log("");
    console.log("Current page URL:");
    console.log(page.url());

    console.log("");
    console.log("Page title:");
    console.log(await page.title());
  } catch (error) {
    console.log("Page information error:", error.message);
  }

  // ----------------------------------------
  // CHECK PAGE LINKS
  // ----------------------------------------

  try {
    const links = await page.locator("a").evaluateAll((elements) =>
      elements.map((a) => ({
        text: a.innerText || "",
        href: a.href || "",
      }))
    );

    console.log("");
    console.log("------------------------------------------");
    console.log("PAGE LINKS");
    console.log("------------------------------------------");

    for (const link of links) {
      const href = link.href || "";
      const lower = href.toLowerCase();

      if (
        lower.includes(".pdf") ||
        lower.includes("/content") ||
        lower.includes("/download") ||
        lower.includes("/file") ||
        lower.includes("/files/")
      ) {
        console.log("TEXT:", link.text);
        console.log("HREF:", href);
        console.log("------------------------------------------");

        if (!pdfUrl && lower.includes(".pdf")) {
          pdfUrl = href;
        }
      }
    }
  } catch (error) {
    console.log("Link inspection error:", error.message);
  }

  // ----------------------------------------
  // CHECK IFRAMES
  // ----------------------------------------

  try {
    const frames = await page.locator("iframe").evaluateAll((elements) =>
      elements.map((iframe) => iframe.src || "")
    );

    console.log("");
    console.log("------------------------------------------");
    console.log("IFRAMES");
    console.log("------------------------------------------");

    for (const frame of frames) {
      console.log(frame);

      const lower = frame.toLowerCase();

      if (
        lower.includes(".pdf") ||
        lower.includes("/content") ||
        lower.includes("/download")
      ) {
        if (!pdfUrl) {
          pdfUrl = frame;
        }
      }
    }
  } catch (error) {
    console.log("Iframe inspection error:", error.message);
  }

  // ----------------------------------------
  // SEARCH RESPONSES
  // ----------------------------------------

  if (!pdfUrl) {
    console.log("");
    console.log("------------------------------------------");
    console.log("SEARCHING CAPTURED RESPONSES");
    console.log("------------------------------------------");

    for (const item of responses) {
      const type = (item.contentType || "").toLowerCase();
      const url = item.url.toLowerCase();

      if (
        type.includes("application/pdf") ||
        (
          item.status >= 200 &&
          item.status < 400 &&
          (
            url.includes(".pdf") ||
            url.includes("/content") ||
            url.includes("/download")
          )
        )
      ) {
        console.log("FOUND RESPONSE");
        console.log("Status:", item.status);
        console.log("Content-Type:", item.contentType);
        console.log("URL:", item.url);

        pdfUrl = item.url;
        break;
      }
    }
  }

  // ----------------------------------------
  // SEARCH REQUESTS
  // ----------------------------------------

  if (!pdfUrl) {
    console.log("");
    console.log("------------------------------------------");
    console.log("SEARCHING CAPTURED REQUESTS");
    console.log("------------------------------------------");

    for (const item of requests) {
      const url = item.url.toLowerCase();

      if (
        url.includes(".pdf") ||
        url.includes("/content") ||
        url.includes("/download") ||
        url.includes("/files/")
      ) {
        console.log("FOUND REQUEST");
        console.log(item.url);

        pdfUrl = item.url;
        break;
      }
    }
  }

  // ----------------------------------------
  // RESULT
  // ----------------------------------------

  if (pdfUrl) {
    console.log("");
    console.log("==========================================");
    console.log("MY CLOUD PDF URL FOUND");
    console.log("==========================================");
    console.log(pdfUrl);
    console.log("==========================================");

    return pdfUrl;
  }

  // ----------------------------------------
  // DEBUG INFORMATION
  // ----------------------------------------

  console.log("");
  console.log("==========================================");
  console.log("NO PDF URL FOUND");
  console.log("==========================================");

  console.log("Total requests:", requests.length);
  console.log("Total responses:", responses.length);

  console.log("");
  console.log("LAST REQUESTS:");

  requests.slice(-30).forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.method} ${item.url}`
    );
  });

  console.log("");
  console.log("LAST RESPONSES:");

  responses.slice(-30).forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.status} | ${item.contentType} | ${item.url}`
    );
  });

  throw new Error(
    "Unable to find My Cloud PDF content URL."
  );
}

// ==========================================
// STREAM PDF FROM MY CLOUD
// ==========================================

function streamPdfFromMyCloud(
  pdfUrl,
  cookies,
  userAgent,
  referer,
  res
) {
  return new Promise((resolve, reject) => {
    console.log("");
    console.log("------------------------------------------");
    console.log("STREAMING PDF FROM MY CLOUD");
    console.log("------------------------------------------");

    const requestOptions = {
      method: "GET",

      headers: {
        "User-Agent":
          userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",

        Accept:
          "application/pdf,application/octet-stream,*/*",

        "Accept-Encoding": "identity",

        Referer:
          referer ||
          "https://os5.mycloud.com/",

        Cookie: cookies || "",
      },

      timeout: 180000,
    };

    console.log("");
    console.log("MY CLOUD CONTENT REQUEST");
    console.log("URL:", pdfUrl);

    const request = https.request(
      pdfUrl,
      requestOptions,
      (upstream) => {
        const status = upstream.statusCode || 0;

        const contentType =
          upstream.headers["content-type"] || "";

        const contentLength =
          upstream.headers["content-length"] || "";

        console.log("");
        console.log("------------------------------------------");
        console.log("MY CLOUD CONTENT RESPONSE");
        console.log("------------------------------------------");
        console.log("Status:", status);
        console.log("Content-Type:", contentType);
        console.log("Content-Length:", contentLength);
        console.log("------------------------------------------");

        if (status < 200 || status >= 300) {
          let errorBody = "";

          upstream.setEncoding("utf8");

          upstream.on("data", (chunk) => {
            errorBody += chunk;
          });

          upstream.on("end", () => {
            console.log("My Cloud error body:");
            console.log(errorBody.substring(0, 1000));

            reject(
              new Error(
                `My Cloud returned HTTP ${status}`
              )
            );
          });

          return;
        }

        const isPdf =
          contentType
            .toLowerCase()
            .includes("application/pdf") ||
          pdfUrl.toLowerCase().includes(".pdf");

        if (!isPdf) {
          console.log(
            "WARNING: Response does not identify itself as PDF."
          );
        }

        // ------------------------------------
        // RESPONSE HEADERS
        // ------------------------------------

        res.status(200);

        res.setHeader(
          "Content-Type",
          "application/pdf"
        );

        res.setHeader(
          "Content-Disposition",
          'inline; filename="golden-dreams-album.pdf"'
        );

        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate"
        );

        res.setHeader(
          "Pragma",
          "no-cache"
        );

        res.setHeader(
          "Expires",
          "0"
        );

        res.setHeader(
          "X-Content-Type-Options",
          "nosniff"
        );

        if (contentLength) {
          res.setHeader(
            "Content-Length",
            contentLength
          );
        }

        console.log("");
        console.log("PDF STREAM STARTED");

        let totalBytes = 0;

        upstream.on("data", (chunk) => {
          totalBytes += chunk.length;
        });

        upstream.on("error", (error) => {
          console.error(
            "PDF upstream stream error:",
            error.message
          );

          if (!res.headersSent) {
            res.status(502);
          }

          reject(error);
        });

        upstream.on("end", () => {
          console.log("");
          console.log("PDF STREAM COMPLETED");
          console.log(
            "Total bytes:",
            totalBytes
          );

          if (totalBytes === 0) {
            console.error(
              "ERROR: My Cloud returned an empty PDF."
            );

            if (!res.writableEnded) {
              res.end();
            }

            reject(
              new Error(
                "Empty PDF received from My Cloud."
              )
            );

            return;
          }

          console.log("");
          console.log(
            "PDF SENT SUCCESSFULLY"
          );

          resolve();
        });

        // IMPORTANT:
        // Let pipe() handle the response ending.
        upstream.pipe(res);
      }
    );

    request.on("timeout", () => {
      console.error(
        "My Cloud PDF request timed out."
      );

      request.destroy(
        new Error(
          "My Cloud PDF request timed out."
        )
      );
    });

    request.on("error", (error) => {
      console.error(
        "My Cloud HTTPS error:",
        error.message
      );

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: error.message,
        });
      }

      reject(error);
    });

    request.end();
  });
}

// ==========================================
// PDF API
// ==========================================

app.get("/api/pdf", async (req, res) => {
  let browser = null;

  try {
    console.log("");
    console.log("==========================================");
    console.log("GOLDEN DREAMS PDF REQUEST");
    console.log("==========================================");

    const shareUrl = req.query.url;

    console.log("Share URL:");
    console.log(shareUrl);

    // --------------------------------------
    // VALIDATE URL
    // --------------------------------------

    if (!shareUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing url parameter.",
      });
    }

    if (!isValidMyCloudShareUrl(shareUrl)) {
      return res.status(400).json({
        success: false,
        error: "Invalid My Cloud URL.",
      });
    }

    // --------------------------------------
    // LAUNCH CHROMIUM
    // --------------------------------------

    console.log("");
    console.log("Launching Chromium...");

    browser = await chromium.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    });

    console.log("Chromium launched.");

    // --------------------------------------
    // CREATE CONTEXT
    // --------------------------------------

    const context = await browser.newContext({
      acceptDownloads: true,

      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",

      viewport: {
        width: 1440,
        height: 900,
      },
    });

    const page = await context.newPage();

    // --------------------------------------
    // OPEN MY CLOUD
    // --------------------------------------

    console.log("");
    console.log("Opening My Cloud share...");

    await page.goto(shareUrl, {
      waitUntil: "commit",
      timeout: 120000,
    });

    console.log(
      "My Cloud navigation committed."
    );

    // --------------------------------------
    // WAIT FOR PDF URL
    // --------------------------------------

    console.log("");
    console.log(
      "Waiting for My Cloud PDF URL..."
    );

    const pdfUrl =
      await findMyCloudPdf(page);

    // --------------------------------------
    // GET COOKIES
    // --------------------------------------

    const cookies =
      await context.cookies();

    const cookieHeader =
      cookiesToHeader(cookies);

    console.log("");
    console.log(
      "Browser cookies:",
      cookies.length
    );

    // --------------------------------------
    // USER AGENT
    // --------------------------------------

    const userAgent =
      await page.evaluate(
        () => navigator.userAgent
      );

    // --------------------------------------
    // REFERER
    // --------------------------------------

    const referer =
      page.url() ||
      shareUrl;

    // --------------------------------------
    // CLOSE BROWSER
    // --------------------------------------

    await browser.close();

    browser = null;

    console.log(
      "Chromium closed."
    );

    // --------------------------------------
    // STREAM PDF
    // --------------------------------------

    await streamPdfFromMyCloud(
      pdfUrl,
      cookieHeader,
      userAgent,
      referer,
      res
    );

  } catch (error) {
    console.error("");
    console.error("==========================================");
    console.error("PDF SERVER ERROR");
    console.error("==========================================");
    console.error(
      "Error:",
      error.message
    );

    if (error.stack) {
      console.error(error.stack);
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }

  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log(
          "Chromium closed in finally."
        );
      } catch (closeError) {
        console.error(
          "Browser close error:",
          closeError.message
        );
      }
    }
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log("");
    console.log("==========================================");
    console.log("GOLDEN DREAMS PDF SERVER");
    console.log("==========================================");
    console.log(
      "Server running on port",
      PORT
    );
    console.log(
      "API: /api/pdf"
    );
    console.log("==========================================");
  }
);