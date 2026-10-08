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
console.log("API: /api/pdf");
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
   COOKIES
========================================================= */

function cookiesToHeader(cookies) {
  return cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}


/* =========================================================
   EXTRACT POSSIBLE URLS FROM TEXT
========================================================= */

function extractPossibleUrls(text) {
  const urls = [];

  if (!text) {
    return urls;
  }

  const matches =
    text.match(
      /https?:\/\/[^\s"'<>\\]+/gi
    ) || [];

  for (let url of matches) {

    url = url
      .replace(/\\u0026/g, "&")
      .replace(/\\\//g, "/")
      .replace(/\\+"/g, "")
      .replace(/[",)}\]]+$/g, "");

    if (!urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}


/* =========================================================
   CHECK IF URL LOOKS LIKE ACTUAL FILE URL
========================================================= */

function looksLikePdfUrl(url) {
  if (!url) {
    return false;
  }

  const lower = url.toLowerCase();

  /*
     IMPORTANT:
     /sdk/v1/batch IS NOT A PDF.
  */

  if (
    lower.includes("/sdk/v1/batch") ||
    lower.includes("/sdk/v1/device")
  ) {
    return false;
  }

  return (
    lower.includes(".pdf") ||
    lower.includes("/content/") ||
    lower.includes("/content?") ||
    lower.includes("/download/") ||
    lower.includes("/download?") ||
    lower.includes("/file/") ||
    lower.includes("/files/")
  );
}


/* =========================================================
   FIND MY CLOUD PDF
========================================================= */

async function findMyCloudPdf(page, shareUrl) {

  console.log("");
  console.log("==========================================");
  console.log("SEARCHING FOR MY CLOUD PDF");
  console.log("==========================================");


  let pdfUrl = null;

  const requests = [];
  const responses = [];


  /* =======================================================
     REQUEST LISTENER
  ======================================================= */

  page.on("request", (request) => {

    const url = request.url();

    let postData = "";

    try {
      postData =
        request.postData() || "";
    } catch (error) {
      postData = "";
    }


    requests.push({
      url,
      method: request.method(),
      resourceType: request.resourceType(),
      postData,
    });


    const lower =
      url.toLowerCase();


    /*
       Do NOT call /sdk/v1/batch a PDF.
       We only log it because it may contain
       information about the actual file.
    */

    if (
      lower.includes("/sdk/v1/batch") ||
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
      console.log(
        "Type:",
        request.resourceType()
      );


      if (postData) {

        console.log("");
        console.log("POST DATA:");

        console.log(
          postData.substring(0, 5000)
        );
      }
    }
  });


  /* =======================================================
     RESPONSE LISTENER
  ======================================================= */

  page.on("response", async (response) => {

    const url =
      response.url();

    const status =
      response.status();

    let contentType = "";

    try {
      contentType =
        response.headers()["content-type"] ||
        "";
    } catch (error) {
      contentType = "";
    }


    responses.push({
      url,
      status,
      contentType,
    });


    const lower =
      url.toLowerCase();

    const type =
      contentType.toLowerCase();


    /*
       ACTUAL PDF RESPONSE
    */

    if (
      type.includes("application/pdf") &&
      status >= 200 &&
      status < 400
    ) {

      console.log("");
      console.log("==========================================");
      console.log("ACTUAL PDF RESPONSE FOUND");
      console.log("==========================================");
      console.log("Status:", status);
      console.log("Content-Type:", contentType);
      console.log("URL:", url);
      console.log("==========================================");


      pdfUrl = url;

      return;
    }


    /*
       PDF-looking URL
    */

    if (
      looksLikePdfUrl(url) &&
      status >= 200 &&
      status < 400
    ) {

      console.log("");
      console.log("==========================================");
      console.log("POSSIBLE PDF URL");
      console.log("==========================================");
      console.log("Status:", status);
      console.log("Content-Type:", contentType);
      console.log("URL:", url);
      console.log("==========================================");


      /*
         Only accept it if it isn't an SDK endpoint.
      */

      if (!pdfUrl) {
        pdfUrl = url;
      }

      return;
    }


    /*
       IMPORTANT:
       Inspect My Cloud multipart batch response.
    */

    if (
      lower.includes("/sdk/v1/batch") &&
      status >= 200 &&
      status < 400
    ) {

      console.log("");
      console.log("------------------------------------------");
      console.log("MY CLOUD BATCH RESPONSE");
      console.log("------------------------------------------");
      console.log("Status:", status);
      console.log(
        "Content-Type:",
        contentType
      );
      console.log("URL:", url);


      try {

        const body =
          await response.text();


        console.log("");
        console.log("BATCH RESPONSE SIZE:");
        console.log(body.length);


        console.log("");
        console.log("BATCH RESPONSE PREVIEW:");
        console.log(
          body.substring(0, 10000)
        );


        /*
           Search for URLs inside batch response.
        */

        const foundUrls =
          extractPossibleUrls(body);


        console.log("");
        console.log(
          "URLS FOUND INSIDE BATCH:",
          foundUrls.length
        );


        for (const foundUrl of foundUrls) {

          console.log("");
          console.log(
            "BATCH URL:",
            foundUrl
          );


          if (
            looksLikePdfUrl(foundUrl)
          ) {

            console.log("");
            console.log(
              ">>> PDF URL FOUND INSIDE BATCH <<<"
            );

            console.log(
              foundUrl
            );


            if (!pdfUrl) {
              pdfUrl = foundUrl;
            }

            break;
          }
        }


        /*
           Sometimes the response may contain escaped
           JSON instead of a normal URL.
        */

        if (!pdfUrl) {

          const decoded =
            body
              .replace(/\\u002F/g, "/")
              .replace(/\\u0026/g, "&")
              .replace(/\\"/g, '"');


          const decodedUrls =
            extractPossibleUrls(
              decoded
            );


          for (
            const foundUrl of decodedUrls
          ) {

            if (
              looksLikePdfUrl(
                foundUrl
              )
            ) {

              console.log("");
              console.log(
                ">>> PDF URL FOUND IN DECODED BATCH <<<"
              );

              console.log(
                foundUrl
              );


              pdfUrl =
                foundUrl;

              break;
            }
          }
        }

      } catch (error) {

        console.log(
          "Unable to inspect batch response:",
          error.message
        );
      }
    }
  });


  /* =======================================================
     OPEN MY CLOUD
  ======================================================= */

  console.log("");
  console.log("Opening My Cloud share...");


  await page.goto(
    shareUrl,
    {
      waitUntil: "commit",
      timeout: 120000,
    }
  );


  console.log(
    "My Cloud navigation committed."
  );


  /* =======================================================
     WAIT
  ======================================================= */

  console.log("");
  console.log(
    "Waiting for My Cloud content..."
  );


  await page.waitForTimeout(
    20000
  );


  /* =======================================================
     PAGE INFORMATION
  ======================================================= */

  console.log("");
  console.log("Current page URL:");
  console.log(
    page.url()
  );


  try {

    console.log("Page title:");

    console.log(
      await page.title()
    );

  } catch (error) {}


  /* =======================================================
     SEARCH RESPONSES
  ======================================================= */

  if (!pdfUrl) {

    console.log("");
    console.log("------------------------------------------");
    console.log("SEARCHING CAPTURED RESPONSES");
    console.log("------------------------------------------");


    for (
      const item of responses
    ) {

      const url =
        item.url.toLowerCase();

      const type =
        (
          item.contentType ||
          ""
        ).toLowerCase();


      /*
         Only actual PDF or file-looking URLs.
         NEVER accept /sdk/v1/batch.
      */

      if (
        item.status >= 200 &&
        item.status < 400 &&
        (
          type.includes(
            "application/pdf"
          ) ||
          looksLikePdfUrl(
            item.url
          )
        )
      ) {

        console.log("");
        console.log("FOUND RESPONSE");
        console.log(
          "Status:",
          item.status
        );
        console.log(
          "Content-Type:",
          item.contentType
        );
        console.log(
          "URL:",
          item.url
        );


        pdfUrl =
          item.url;

        break;
      }
    }
  }


  /* =======================================================
     SEARCH REQUESTS
  ======================================================= */

  if (!pdfUrl) {

    console.log("");
    console.log("------------------------------------------");
    console.log("SEARCHING CAPTURED REQUESTS");
    console.log("------------------------------------------");


    for (
      const item of requests
    ) {

      if (
        looksLikePdfUrl(
          item.url
        )
      ) {

        console.log("");
        console.log("FOUND FILE REQUEST");
        console.log(
          "Method:",
          item.method
        );
        console.log(
          "URL:",
          item.url
        );


        pdfUrl =
          item.url;

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
        await page
          .locator("a")
          .evaluateAll(
            (elements) =>
              elements.map(
                (a) => ({
                  text:
                    a.innerText ||
                    "",

                  href:
                    a.href ||
                    "",
                })
              )
          );


      for (
        const link of links
      ) {

        if (
          looksLikePdfUrl(
            link.href
          )
        ) {

          console.log("");
          console.log(
            "PAGE FILE LINK FOUND"
          );

          console.log(
            "Text:",
            link.text
          );

          console.log(
            "URL:",
            link.href
          );


          pdfUrl =
            link.href;

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

  requests.forEach(
    (item, index) => {

      console.log(
        `${index + 1}. ${item.method} | ${item.resourceType} | ${item.url}`
      );

      if (item.postData) {

        console.log(
          "   POST:",
          item.postData.substring(
            0,
            1000
          )
        );
      }
    }
  );


  console.log("");
  console.log("ALL RESPONSES:");

  responses.forEach(
    (item, index) => {

      console.log(
        `${index + 1}. ${item.status} | ${item.contentType} | ${item.url}`
      );
    }
  );


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

  return new Promise(
    (resolve, reject) => {

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


      const request =
        https.request(
          pdfUrl,
          requestOptions,
          (upstream) => {

            const status =
              upstream.statusCode || 0;

            const contentType =
              upstream.headers[
                "content-type"
              ] || "";

            const contentLength =
              upstream.headers[
                "content-length"
              ] || "";


            console.log("");
            console.log("------------------------------------------");
            console.log("MY CLOUD CONTENT RESPONSE");
            console.log("------------------------------------------");
            console.log(
              "Status:",
              status
            );
            console.log(
              "Content-Type:",
              contentType
            );
            console.log(
              "PDF Content-Length:",
              contentLength ||
              "unknown"
            );


            /* -----------------------------------------
               UPSTREAM ERROR
            ----------------------------------------- */

            if (
              status < 200 ||
              status >= 300
            ) {

              let errorBody = "";


              upstream.on(
                "data",
                (chunk) => {
                  errorBody +=
                    chunk.toString();
                }
              );


              upstream.on(
                "end",
                () => {

                  console.log("");
                  console.log(
                    "MY CLOUD RETURNED ERROR"
                  );

                  console.log(
                    "Status:",
                    status
                  );

                  console.log(
                    "Response:",
                    errorBody.substring(
                      0,
                      2000
                    )
                  );


                  if (
                    !res.headersSent
                  ) {

                    res.status(
                      status
                    ).json({
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
                }
              );


              return;
            }


            /* -----------------------------------------
               HEADERS
            ----------------------------------------- */

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
            console.log(
              "PDF STREAM STARTED"
            );


            let totalBytes = 0;


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

                console.log("");
                console.log(
                  "PDF STREAM COMPLETED"
                );

                console.log(
                  "Total bytes:",
                  totalBytes
                );


                if (
                  totalBytes === 0
                ) {

                  console.log(
                    "ERROR: Empty PDF received."
                  );


                  if (
                    !res.writableEnded
                  ) {

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


            upstream.on(
              "error",
              (error) => {

                console.log(
                  "PDF STREAM ERROR:",
                  error.message
                );


                if (
                  !res.writableEnded
                ) {

                  res.end();
                }


                reject(error);
              }
            );


            upstream.pipe(res);
          }
        );


      /* ---------------------------------------------
         REQUEST ERROR
      --------------------------------------------- */

      request.on(
        "error",
        (error) => {

          console.log(
            "HTTPS REQUEST ERROR:",
            error.message
          );


          if (
            !res.headersSent
          ) {

            res.status(500).json({
              error:
                "Unable to connect to My Cloud.",

              message:
                error.message,
            });

          } else if (
            !res.writableEnded
          ) {

            res.end();
          }


          reject(error);
        }
      );


      /* ---------------------------------------------
         TIMEOUT
      --------------------------------------------- */

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
    }
  );
}


/* =========================================================
   PDF API
========================================================= */

app.get(
  "/api/pdf",
  async (req, res) => {

    console.log("");
    console.log("==========================================");
    console.log("GOLDEN DREAMS PDF REQUEST");
    console.log("==========================================");


    const shareUrl =
      req.query.url;


    console.log(
      "Share URL:"
    );

    console.log(
      shareUrl
    );


    if (!shareUrl) {

      return res.status(400).json({
        error:
          "Missing My Cloud share URL.",
      });
    }


    if (
      !isValidMyCloudShareUrl(
        shareUrl
      )
    ) {

      return res.status(400).json({
        error:
          "Invalid My Cloud share URL.",
      });
    }


    let browser =
      null;


    try {

      /* -----------------------------------------
         LAUNCH CHROMIUM
      ----------------------------------------- */

      console.log("");
      console.log(
        "Launching Chromium..."
      );


      browser =
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


      /* -----------------------------------------
         BROWSER CONTEXT
      ----------------------------------------- */

      const context =
        await browser.newContext({

          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36",

          viewport: {
            width: 1440,
            height: 900,
          },

          ignoreHTTPSErrors:
            true,
        });


      const page =
        await context.newPage();


      /* -----------------------------------------
         FIND PDF
      ----------------------------------------- */

      const pdfUrl =
        await findMyCloudPdf(
          page,
          shareUrl
        );


      /* -----------------------------------------
         COOKIES
      ----------------------------------------- */

      const cookies =
        await context.cookies();


      const cookieHeader =
        cookiesToHeader(
          cookies
        );


      console.log("");
      console.log(
        "Browser cookies:",
        cookies.length
      );


      /* -----------------------------------------
         USER AGENT
      ----------------------------------------- */

      const userAgent =
        await page.evaluate(
          () =>
            navigator.userAgent
        );


      /* -----------------------------------------
         STREAM
      ----------------------------------------- */

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

      console.log(
        error
      );

      console.log("==========================================");


      if (
        !res.headersSent
      ) {

        res.status(500).json({

          error:
            "Unable to load PDF from My Cloud.",

          message:
            error.message,
        });

      } else if (
        !res.writableEnded
      ) {

        res.end();
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
            "Chromium close error:",
            error.message
          );
        }
      }
    }
  }
);


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