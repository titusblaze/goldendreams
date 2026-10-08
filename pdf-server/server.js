const express = require("express");
const cors = require("cors");
const https = require("https");
const { chromium } = require("playwright");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["*"],
  })
);

app.use(express.json());


/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Golden Dreams PDF server running",
    api: "/api/pdf",
    port: String(PORT),
  });
});


/* =========================================================
   VALIDATE MY CLOUD URL
========================================================= */

function isValidMyCloudShareUrl(url) {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "os5.mycloud.com" &&
      parsed.pathname.startsWith("/action/share/")
    );
  } catch (error) {
    return false;
  }
}


/* =========================================================
   GET COOKIES
========================================================= */

function cookiesToHeader(cookies) {
  return cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}


/* =========================================================
   STREAM PDF USING NODE HTTPS
========================================================= */

function streamPdfFromMyCloud({
  contentUrl,
  cookies,
  userAgent,
  referer,
  res,
}) {
  return new Promise((resolve, reject) => {

    console.log("------------------------------------------");
    console.log("STREAMING PDF FROM MY CLOUD");
    console.log("------------------------------------------");

    console.log("Content URL:");
    console.log(contentUrl);

    let finished = false;
    let totalBytes = 0;


    const requestOptions = {
      method: "GET",

      headers: {
        "User-Agent":
          userAgent ||
          "Mozilla/5.0",

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


    const request =
      https.request(
        contentUrl,
        requestOptions,
        (upstream) => {

          console.log("------------------------------------------");
          console.log("MY CLOUD CONTENT RESPONSE");
          console.log("------------------------------------------");

          console.log(
            "Status:",
            upstream.statusCode
          );

          console.log(
            "Content-Type:",
            upstream.headers[
              "content-type"
            ]
          );

          console.log(
            "Content-Length:",
            upstream.headers[
              "content-length"
            ]
          );


          /* ==========================================
             HANDLE REDIRECT
          ========================================== */

          if (
            upstream.statusCode >= 300 &&
            upstream.statusCode < 400 &&
            upstream.headers.location
          ) {

            console.log(
              "My Cloud redirected PDF request."
            );

            upstream.resume();

            return streamPdfFromMyCloud({
              contentUrl:
                new URL(
                  upstream.headers.location,
                  contentUrl
                ).toString(),

              cookies,

              userAgent,

              referer,

              res,
            })
              .then(resolve)
              .catch(reject);

          }


          /* ==========================================
             UPSTREAM ERROR
          ========================================== */

          if (
            upstream.statusCode !== 200
          ) {

            let errorBody = "";

            upstream.setEncoding(
              "utf8"
            );

            upstream.on(
              "data",
              (chunk) => {

                if (
                  errorBody.length < 2000
                ) {

                  errorBody += chunk;

                }

              }
            );

            upstream.on(
              "end",
              () => {

                reject(
                  new Error(
                    `My Cloud returned HTTP ${upstream.statusCode}: ${errorBody}`
                  )
                );

              }
            );

            return;

          }


          /* ==========================================
             CHECK CONTENT TYPE
          ========================================== */

          const contentType =
            String(
              upstream.headers[
                "content-type"
              ] || ""
            ).toLowerCase();


          if (
            !contentType.includes(
              "application/pdf"
            )
          ) {

            let body = "";

            upstream.setEncoding(
              "utf8"
            );

            upstream.on(
              "data",
              (chunk) => {

                if (
                  body.length < 2000
                ) {

                  body += chunk;

                }

              }
            );

            upstream.on(
              "end",
              () => {

                reject(
                  new Error(
                    `My Cloud did not return PDF. Content-Type: ${contentType}. ${body}`
                  )
                );

              }
            );

            return;

          }


          /* ==========================================
             SET RESPONSE HEADERS
          ========================================== */

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


          /* ==========================================
             CONTENT LENGTH
          ========================================== */

          const contentLength =
            upstream.headers[
              "content-length"
            ];


          if (contentLength) {

            res.setHeader(
              "Content-Length",
              contentLength
            );

          }


          console.log(
            "PDF HTTP Status:",
            upstream.statusCode
          );

          console.log(
            "PDF Content-Type:",
            contentType
          );

          console.log(
            "PDF Content-Length:",
            contentLength ||
              "unknown"
          );

          console.log(
            "PDF STREAM STARTED"
          );


          /* ==========================================
             STREAM DATA
          ========================================== */

          upstream.on(
            "data",
            (chunk) => {

              totalBytes +=
                chunk.length;

            }
          );


          upstream.on(
            "end",
            () => {

              console.log(
                "PDF STREAM COMPLETED"
              );

              console.log(
                "Total bytes:",
                totalBytes
              );

              console.log(
                "=========================================="
              );


              if (
                totalBytes === 0
              ) {

                if (!res.headersSent) {

                  reject(
                    new Error(
                      "My Cloud returned an empty PDF."
                    )
                  );

                } else {

                  res.end();

                  reject(
                    new Error(
                      "My Cloud returned an empty PDF."
                    )
                  );

                }

                return;

              }


              if (!res.writableEnded) {

                res.end();

              }


              finished = true;

              resolve();

            }
          );


          upstream.on(
            "error",
            (error) => {

              console.error(
                "My Cloud stream error:",
                error
              );


              if (
                !res.headersSent
              ) {

                reject(error);

              } else {

                res.destroy(
                  error
                );

                reject(error);

              }

            }
          );


          /* ==========================================
             PIPE PDF TO CLIENT
          ========================================== */

          upstream.pipe(res);

        }
      );


    request.on(
      "timeout",
      () => {

        console.error(
          "My Cloud request timeout."
        );

        request.destroy(
          new Error(
            "My Cloud PDF request timed out."
          )
        );

      }
    );


    request.on(
      "error",
      (error) => {

        console.error(
          "HTTPS request error:",
          error
        );


        if (!finished) {

          reject(error);

        }

      }
    );


    request.end();

  });
}


/* =========================================================
   FIND MY CLOUD PDF URL
========================================================= */

async function findMyCloudPdf(
  shareUrl
) {

  console.log(
    "=========================================="
  );

  console.log(
    "GOLDEN DREAMS PDF REQUEST"
  );

  console.log(
    "=========================================="
  );

  console.log(
    "Share URL:"
  );

  console.log(
    shareUrl
  );


  /* ==========================================
     LAUNCH CHROMIUM
  ========================================== */

  console.log(
    "Launching Chromium..."
  );


  const browser =
    await chromium.launch({
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


  try {

    const context =
      await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36",

        acceptDownloads:
          true,

        ignoreHTTPSErrors:
          true,
      });


    const page =
      await context.newPage();


    /* ==========================================
       CAPTURE CONTENT URL
    ========================================== */

    let capturedContentUrl =
      null;


    let capturedPdfUrl =
      null;


    const captureUrl =
      (url) => {

        if (!url) return;


        const lower =
          url.toLowerCase();


        /* --------------------------------------
           My Cloud SDK content endpoint
        -------------------------------------- */

        if (
          lower.includes(
            "/sdk/v2/files/"
          ) &&
          lower.includes(
            "/content"
          )
        ) {

          if (
            !capturedContentUrl
          ) {

            capturedContentUrl =
              url;

            console.log(
              "CONTENT URL CAPTURED"
            );

          }

        }


        /* --------------------------------------
           PDF / download fallback
        -------------------------------------- */

        if (
          lower.includes(
            ".pdf"
          ) ||
          lower.includes(
            "download"
          )
        ) {

          if (
            !capturedPdfUrl
          ) {

            capturedPdfUrl =
              url;

            console.log(
              "POSSIBLE PDF URL CAPTURED"
            );

          }

        }

      };


    /* ==========================================
       REQUEST LISTENER
    ========================================== */

    page.on(
      "request",
      (request) => {

        const url =
          request.url();


        if (
          url.includes(
            "mycloud.com"
          )
        ) {

          captureUrl(url);

        }

      }
    );


    /* ==========================================
       RESPONSE LISTENER
    ========================================== */

    page.on(
      "response",
      (response) => {

        const url =
          response.url();


        if (
          url.includes(
            "mycloud.com"
          )
        ) {

          const contentType =
            String(
              response.headers()[
                "content-type"
              ] || ""
            ).toLowerCase();


          if (
            contentType.includes(
              "application/pdf"
            )
          ) {

            console.log(
              "PDF RESPONSE DETECTED"
            );

            console.log(
              "Status:",
              response.status()
            );


            capturedPdfUrl =
              url;

          }


          captureUrl(url);

        }

      }
    );


    /* ==========================================
       OPEN MY CLOUD
    ========================================== */

    console.log(
      "Opening My Cloud share..."
    );


    await page.goto(
      shareUrl,
      {
        waitUntil:
          "domcontentloaded",

        timeout:
          120000,
      }
    );


    console.log(
      "My Cloud navigation committed."
    );


    /* ==========================================
       WAIT FOR CONTENT REQUEST
    ========================================== */

    console.log(
      "Waiting for My Cloud PDF URL..."
    );


    const startTime =
      Date.now();


    while (
      !capturedContentUrl &&
      !capturedPdfUrl &&
      Date.now() -
        startTime <
        120000
    ) {

      await page.waitForTimeout(
        1000
      );


      /* --------------------------------------
         Check page URL
      -------------------------------------- */

      captureUrl(
        page.url()
      );


      /* --------------------------------------
         Check performance resources
      -------------------------------------- */

      try {

        const resources =
          await page.evaluate(
            () =>
              performance
                .getEntriesByType(
                  "resource"
                )
                .map(
                  (entry) =>
                    entry.name
                )
          );


        for (
          const url of resources
        ) {

          captureUrl(url);

        }

      } catch (_) {}

    }


    /* ==========================================
       WAIT A LITTLE AFTER CAPTURE
    ========================================== */

    await page.waitForTimeout(
      1500
    );


    /* ==========================================
       GET COOKIES
    ========================================== */

    const cookies =
      await context.cookies();


    const cookieHeader =
      cookiesToHeader(
        cookies
      );


    console.log(
      "Browser cookies:",
      cookies.length
    );


    /* ==========================================
       SELECT CONTENT URL
    ========================================== */

    const contentUrl =
      capturedContentUrl ||
      capturedPdfUrl;


    if (!contentUrl) {

      throw new Error(
        "Unable to find My Cloud PDF content URL."
      );

    }


    console.log(
      "=========================================="
    );

    console.log(
      "AUTHENTICATED PDF URL FOUND"
    );

    console.log(
      "=========================================="
    );


    console.log(
      "Content URL captured."
    );


    return {
      contentUrl,

      cookies:
        cookieHeader,

      userAgent:
        await page.evaluate(
          () =>
            navigator.userAgent
        ),

      referer:
        page.url(),
    };

  } finally {

    await browser.close();

    console.log(
      "Chromium closed."
    );

  }
}


/* =========================================================
   PDF API
========================================================= */

app.get(
  "/api/pdf",
  async (req, res) => {

    const shareUrl =
      req.query.url;


    /* ==========================================
       VALIDATE URL
    ========================================== */

    if (!shareUrl) {

      return res.status(400).json({
        success: false,
        message:
          "Missing My Cloud share URL",
      });

    }


    if (
      !isValidMyCloudShareUrl(
        shareUrl
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid My Cloud share URL",
      });

    }


    let pdfInfo = null;


    try {

      pdfInfo =
        await findMyCloudPdf(
          shareUrl
        );


      await streamPdfFromMyCloud({
        contentUrl:
          pdfInfo.contentUrl,

        cookies:
          pdfInfo.cookies,

        userAgent:
          pdfInfo.userAgent,

        referer:
          pdfInfo.referer,

        res,
      });


    } catch (error) {

      console.error(
        "=========================================="
      );

      console.error(
        "PDF SERVER ERROR"
      );

      console.error(
        error
      );

      console.error(
        "=========================================="
      );


      if (
        !res.headersSent
      ) {

        return res.status(500).json({
          success: false,

          message:
            error?.message ||
            "Unable to retrieve PDF",
        });

      }


      try {

        res.destroy(
          error
        );

      } catch (_) {}

    }

  }
);


/* =========================================================
   SERVER
========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "=========================================="
    );

    console.log(
      "GOLDEN DREAMS PDF SERVER"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      "API: /api/pdf"
    );

  }
);