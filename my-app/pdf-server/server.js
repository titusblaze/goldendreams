const express = require("express");
const cors = require("cors");
const https = require("https");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

console.log("");
console.log("==========================================");
console.log("GOLDEN DREAMS PDF SERVER");
console.log("==========================================");
console.log("Server starting...");
console.log("Port:", PORT);
console.log("==========================================");


/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Golden Dreams PDF Server",
    api: "/api/pdf",
  });
});


/* =========================================================
   VALIDATE MY CLOUD SHARE URL
========================================================= */

function isValidMyCloudShareUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      (
        parsed.hostname === "os5.mycloud.com" ||
        parsed.hostname.endsWith(".mycloud.com")
      ) &&
      parsed.pathname.includes("/action/share/")
    );
  } catch (error) {
    return false;
  }
}


/* =========================================================
   CONVERT PLAYWRIGHT COOKIES TO COOKIE HEADER
========================================================= */

function cookiesToHeader(cookies) {
  return cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}


/* =========================================================
   FIND MY CLOUD PDF
   IMPORTANT:
   LISTENERS ARE REGISTERED BEFORE page.goto()
========================================================= */

async function findMyCloudPdf(page, shareUrl) {
  console.log("");
  console.log("==========================================");
  console.log("SEARCHING FOR MY CLOUD PDF");
  console.log("==========================================");

  let pdfUrl = null;

  const requests = [];
  const responses = [];


  /* -------------------------------------------------------
     REQUEST LISTENER
  ------------------------------------------------------- */

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
      lower.includes("/files/") ||
      lower.includes("/sdk/")
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


  /* -------------------------------------------------------
     RESPONSE LISTENER
  ------------------------------------------------------- */

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    let contentType = "";

    try {
      contentType =
        response.headers()["content-type"] || "";
    } catch (error) {
      contentType = "";
    }

    responses.push({
      url,
      status,
      contentType,
    });

    const lower = url.toLowerCase();
    const type = contentType.toLowerCase();


    if (
      type.includes("application/pdf") ||
      lower.includes(".pdf") ||
      lower.includes("/content") ||
      lower.includes("/download") ||
      lower.includes("/sdk/")
    ) {
      console.log("");
      console.log("==========================================");
      console.log("POSSIBLE FILE RESPONSE");
      console.log("==========================================");
      console.log("Status:", status);
      console.log("Content-Type:", contentType);
      console.log("URL:", url);
      console.log("==========================================");


      if (
        status >= 200 &&
        status < 400 &&
        (
          type.includes("application/pdf") ||
          lower.includes(".pdf") ||
          lower.includes("/content")
        )
      ) {
        pdfUrl = url;

        console.log("");
        console.log(">>> POSSIBLE PDF URL CAPTURED <<<");
        console.log(pdfUrl);
      }
    }
  });


  /* -------------------------------------------------------
     OPEN MY CLOUD SHARE
     LISTENERS ABOVE ARE ALREADY ACTIVE
  ------------------------------------------------------- */

  console.log("");
  console.log("Opening My Cloud share...");

  await page.goto(shareUrl, {
    waitUntil: "commit",
    timeout: 120000,
  });

  console.log("My Cloud navigation committed.");


  /* -------------------------------------------------------
     WAIT FOR MY CLOUD JAVASCRIPT / API REQUESTS
  ------------------------------------------------------- */

  console.log("");
  console.log("Waiting for My Cloud content...");

  await page.waitForTimeout(15000);


  /* -------------------------------------------------------
     PAGE INFORMATION
  ------------------------------------------------------- */

  console.log("");
  console.log("Current page URL:");
  console.log(page.url());

  try {
    console.log("Page title:");
    console.log(await page.title());
  } catch (error) {
    console.log("Unable to read page title.");
  }


  /* =======================================================
     SEARCH CAPTURED RESPONSES
  ======================================================= */

  if (!pdfUrl) {
    console.log("");
    console.log("------------------------------------------");
    console.log("SEARCHING CAPTURED RESPONSES");
    console.log("------------------------------------------");

    for (const item of responses) {
      const url = item.url.toLowerCase();

      const type =
        (item.contentType || "").toLowerCase();


      if (
        type.includes("application/pdf") ||
        (
          item.status >= 200 &&
          item.status < 400 &&
          (
            url.includes(".pdf") ||
            url.includes("/content") ||
            url.includes("/download") ||
            url.includes("/sdk/")
          )
        )
      ) {
        console.log("");
        console.log("FOUND RESPONSE");
        console.log("Status:", item.status);
        console.log("Content-Type:", item.contentType);
        console.log("URL:", item.url);

        pdfUrl = item.url;

        break;
      }
    }
  }


  /* =======================================================
     SEARCH CAPTURED REQUESTS
  ======================================================= */

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
        url.includes("/files/") ||
        url.includes("/sdk/")
      ) {
        console.log("");
        console.log("FOUND REQUEST");
        console.log(item.url);

        pdfUrl = item.url;

        break;
      }
    }
  }


  /* =======================================================
     SEARCH PAGE LINKS
  ======================================================= */

  if (!pdfUrl) {
    try {
      const links =
        await page.locator("a").evaluateAll(
          (elements) =>
            elements.map((a) => ({
              text: a.innerText || "",
              href: a.href || "",
            }))
        );


      for (const link of links) {
        const href =
          (link.href || "").toLowerCase();


        if (
          href.includes(".pdf") ||
          href.includes("/content") ||
          href.includes("/download") ||
          href.includes("/files/")
        ) {
          console.log("");
          console.log("PAGE LINK FOUND");
          console.log("Text:", link.text);
          console.log("URL:", link.href);

          pdfUrl = link.href;

          break;
        }
      }
    } catch (error) {
      console.log(
        "Link inspection error:",
        error.message
      );
    }
  }


  /* =======================================================
     PDF FOUND
  ======================================================= */

  if (pdfUrl) {
    console.log("");
    console.log("==========================================");
    console.log("MY CLOUD PDF URL FOUND");
    console.log("==========================================");
    console.log(pdfUrl);
    console.log("==========================================");

    return pdfUrl;
  }


  /* =======================================================
     PDF NOT FOUND
  ======================================================= */

  console.log("");
  console.log("==========================================");
  console.log("NO PDF URL FOUND");
  console.log("==========================================");

  console.log(
    "Total requests:",
    requests.length
  );

  console.log(
    "Total responses:",
    responses.length
  );


  console.log("");
  console.log("ALL REQUESTS:");

  requests.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.method} | ${item.resourceType} | ${item.url}`
    );
  });


  console.log("");
  console.log("ALL RESPONSES:");

  responses.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.status} | ${item.contentType} | ${item.url}`
    );
  });


  throw new Error(
    "Unable to find My Cloud PDF content URL."
  );
}


/* =========================================================
   STREAM PDF FROM MY CLOUD
========================================================= */

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

        "Accept":
          "application/pdf,application/octet-stream,*/*",

        "Accept-Encoding":
          "identity",

        "Referer":
          referer ||
          "https://os5.mycloud.com/",

        "Cookie":
          cookies || "",
      },

      timeout: 180000,
    };


    const request = https.request(
      pdfUrl,
      requestOptions,
      (upstream) => {

        const status =
          upstream.statusCode || 0;

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
        console.log(
          "PDF Content-Length:",
          contentLength || "unknown"
        );


        /* -------------------------------------------------
           UPSTREAM ERROR
        ------------------------------------------------- */

        if (
          status < 200 ||
          status >= 300
        ) {
          let errorBody = "";

          upstream.on("data", (chunk) => {
            errorBody += chunk.toString();
          });

          upstream.on("end", () => {

            console.log("");
            console.log("MY CLOUD RETURNED ERROR");
            console.log("Status:", status);
            console.log(
              "Response:",
              errorBody.substring(0, 1000)
            );


            if (!res.headersSent) {
              res.status(status).json({
                error:
                  "My Cloud returned an error.",
                status,
              });
            }


            reject(
              new Error(
                `My Cloud returned HTTP ${status}`
              )
            );
          });

          return;
        }


        /* -------------------------------------------------
           SEND PDF HEADERS
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           COUNT BYTES
        ------------------------------------------------- */

        upstream.on(
          "data",
          (chunk) => {
            totalBytes += chunk.length;
          }
        );


        /* -------------------------------------------------
           UPSTREAM END
        ------------------------------------------------- */

        upstream.on(
          "end",
          () => {

            console.log("");
            console.log("PDF STREAM COMPLETED");
            console.log(
              "Total bytes:",
              totalBytes
            );


            if (totalBytes === 0) {

              console.log(
                "ERROR: Empty PDF received."
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
              "=========================================="
            );

            console.log(
              "PDF SENT SUCCESSFULLY"
            );

            console.log(
              "=========================================="
            );


            resolve();
          }
        );


        /* -------------------------------------------------
           UPSTREAM ERROR
        ------------------------------------------------- */

        upstream.on(
          "error",
          (error) => {

            console.log("");
            console.log(
              "PDF STREAM ERROR:",
              error.message
            );


            if (!res.writableEnded) {
              res.end();
            }


            reject(error);
          }
        );


        /* -------------------------------------------------
           PIPE PDF TO BROWSER
        ------------------------------------------------- */

        upstream.pipe(res);
      }
    );


    /* -----------------------------------------------------
       REQUEST ERROR
    ----------------------------------------------------- */

    request.on(
      "error",
      (error) => {

        console.log("");
        console.log(
          "HTTPS REQUEST ERROR:",
          error.message
        );


        if (!res.headersSent) {
          res.status(500).json({
            error:
              "Unable to connect to My Cloud.",
            message:
              error.message,
          });
        } else if (!res.writableEnded) {
          res.end();
        }


        reject(error);
      }
    );


    /* -----------------------------------------------------
       REQUEST TIMEOUT
    ----------------------------------------------------- */

    request.on(
      "timeout",
      () => {

        console.log(
          "My Cloud request timed out."
        );

        request.destroy(
          new Error(
            "My Cloud PDF request timed out."
          )
        );
      }
    );


    request.end();
  });
}


/* =========================================================
   PDF API
========================================================= */

app.get("/api/pdf", async (req, res) => {

  console.log("");
  console.log("==========================================");
  console.log("GOLDEN DREAMS PDF REQUEST");
  console.log("==========================================");


  const shareUrl =
    req.query.url;


  console.log("Share URL:");
  console.log(shareUrl);


  /* -------------------------------------------------------
     VALIDATE URL
  ------------------------------------------------------- */

  if (!shareUrl) {

    return res.status(400).json({
      error:
        "Missing My Cloud share URL.",
    });
  }


  if (!isValidMyCloudShareUrl(shareUrl)) {

    return res.status(400).json({
      error:
        "Invalid My Cloud share URL.",
    });
  }


  let browser = null;


  try {

    /* -----------------------------------------------------
       LAUNCH CHROMIUM
    ----------------------------------------------------- */

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
        "--disable-software-rasterizer",
      ],
    });


    console.log(
      "Chromium launched."
    );


    /* -----------------------------------------------------
       CREATE BROWSER CONTEXT
    ----------------------------------------------------- */

    const context =
      await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",

        viewport: {
          width: 1440,
          height: 900,
        },

        ignoreHTTPSErrors: true,
      });


    /* -----------------------------------------------------
       CREATE PAGE
    ----------------------------------------------------- */

    const page =
      await context.newPage();


    /* -----------------------------------------------------
       FIND PDF
       IMPORTANT:
       findMyCloudPdf() now performs page.goto()
       AFTER registering listeners.
    ----------------------------------------------------- */

    const pdfUrl =
      await findMyCloudPdf(
        page,
        shareUrl
      );


    /* -----------------------------------------------------
       GET COOKIES
    ----------------------------------------------------- */

    const cookies =
      await context.cookies();


    const cookieHeader =
      cookiesToHeader(cookies);


    console.log("");
    console.log(
      "Browser cookies:",
      cookies.length
    );


    /* -----------------------------------------------------
       USER AGENT
    ----------------------------------------------------- */

    const userAgent =
      await page.evaluate(
        () => navigator.userAgent
      );


    /* -----------------------------------------------------
       STREAM PDF
    ----------------------------------------------------- */

    await streamPdfFromMyCloud(
      pdfUrl,
      cookieHeader,
      userAgent,
      shareUrl,
      res
    );

  } catch (error) {

    console.log("");
    console.log("==========================================");
    console.log("PDF SERVER ERROR");
    console.log("==========================================");
    console.log(error);
    console.log("==========================================");


    if (!res.headersSent) {

      res.status(500).json({
        error:
          "Unable to load PDF from My Cloud.",
        message:
          error.message,
      });

    } else if (!res.writableEnded) {

      res.end();

    }

  } finally {

    /* -----------------------------------------------------
       CLOSE BROWSER
    ----------------------------------------------------- */

    if (browser) {

      try {

        await browser.close();

        console.log("");
        console.log(
          "Chromium closed."
        );

      } catch (error) {

        console.log(
          "Chromium close error:",
          error.message
        );

      }
    }
  }
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");
    console.log("==========================================");
    console.log("GOLDEN DREAMS PDF SERVER");
    console.log("==========================================");
    console.log(
      `Server running on port ${PORT}`
    );
    console.log(
      "API: /api/pdf"
    );
    console.log("==========================================");
  }
);