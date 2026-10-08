async function findMyCloudPdf(page, shareUrl) {
  console.log("\n==========================================");
  console.log("SEARCHING FOR MY CLOUD PDF");
  console.log("==========================================");

  let pdfUrl = null;

  const requests = [];
  const responses = [];

  // --------------------------------------------------
  // Monitor ALL requests
  // --------------------------------------------------
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
      console.log("\n------------------------------------------");
      console.log("INTERESTING REQUEST");
      console.log("URL:", url);
      console.log("Method:", request.method());
      console.log("Type:", request.resourceType());
      console.log("------------------------------------------");
    }
  });

  // --------------------------------------------------
  // Monitor ALL responses
  // --------------------------------------------------
  page.on("response", async (response) => {
    const url = response.url();
    const status = response.status();

    let contentType = "";

    try {
      contentType =
        response.headers()["content-type"] || "";
    } catch (e) {}

    responses.push({
      url,
      status,
      contentType,
    });

    const lower = url.toLowerCase();

    if (
      contentType.toLowerCase().includes("application/pdf") ||
      lower.includes(".pdf") ||
      lower.includes("/content") ||
      lower.includes("/download")
    ) {
      console.log("\n==========================================");
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
          contentType.toLowerCase().includes("application/pdf") ||
          lower.includes(".pdf")
        )
      ) {
        pdfUrl = url;
      }
    }
  });

  // --------------------------------------------------
  // Give My Cloud more time to load
  // --------------------------------------------------
  console.log("\nWaiting for My Cloud page...");

  await page.waitForTimeout(5000);

  // --------------------------------------------------
  // Try to inspect page
  // --------------------------------------------------
  try {
    console.log("\nCurrent page URL:");
    console.log(page.url());

    console.log("\nPage title:");
    console.log(await page.title());
  } catch (e) {}

  // --------------------------------------------------
  // Check links on the page
  // --------------------------------------------------
  try {
    const links = await page.locator("a").evaluateAll((elements) =>
      elements.map((a) => ({
        text: a.innerText || "",
        href: a.href || "",
      }))
    );

    console.log("\n------------------------------------------");
    console.log("PAGE LINKS");
    console.log("------------------------------------------");

    for (const link of links) {
      const href = (link.href || "").toLowerCase();

      if (
        href.includes(".pdf") ||
        href.includes("/content") ||
        href.includes("/download") ||
        href.includes("/file") ||
        href.includes("/files/")
      ) {
        console.log("TEXT:", link.text);
        console.log("HREF:", link.href);
        console.log("------------------------------------------");

        if (!pdfUrl && href.includes(".pdf")) {
          pdfUrl = link.href;
        }
      }
    }
  } catch (e) {
    console.log("Link inspection failed:", e.message);
  }

  // --------------------------------------------------
  // Check iframe sources
  // --------------------------------------------------
  try {
    const frames = await page.locator("iframe").evaluateAll((elements) =>
      elements.map((iframe) => iframe.src || "")
    );

    console.log("\n------------------------------------------");
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
  } catch (e) {
    console.log("Iframe inspection failed:", e.message);
  }

  // --------------------------------------------------
  // Search captured responses
  // --------------------------------------------------
  if (!pdfUrl) {
    console.log("\n------------------------------------------");
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
        console.log("FOUND:");
        console.log("Status:", item.status);
        console.log("Content-Type:", item.contentType);
        console.log("URL:", item.url);

        pdfUrl = item.url;
        break;
      }
    }
  }

  // --------------------------------------------------
  // Search captured requests
  // --------------------------------------------------
  if (!pdfUrl) {
    console.log("\n------------------------------------------");
    console.log("SEARCHING CAPTURED REQUESTS");
    console.log("------------------------------------------");

    for (const item of requests) {
      const url = item.url.toLowerCase();

      if (
        url.includes(".pdf") ||
        url.includes("/content") ||
        url.includes("/download")
      ) {
        console.log("FOUND REQUEST:");
        console.log(item.url);

        pdfUrl = item.url;
        break;
      }
    }
  }

  // --------------------------------------------------
  // Final result
  // --------------------------------------------------
  if (pdfUrl) {
    console.log("\n==========================================");
    console.log("MY CLOUD PDF URL FOUND");
    console.log("==========================================");
    console.log(pdfUrl);
    console.log("==========================================");

    return pdfUrl;
  }

  console.log("\n==========================================");
  console.log("NO PDF URL FOUND");
  console.log("==========================================");

  console.log("\nTotal requests captured:", requests.length);
  console.log("Total responses captured:", responses.length);

  console.log("\nLast 30 requests:");

  requests.slice(-30).forEach((item, index) => {
    console.log(`${index + 1}. ${item.method} ${item.url}`);
  });

  console.log("\nLast 30 responses:");

  responses.slice(-30).forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.status} | ${item.contentType} | ${item.url}`
    );
  });

  throw new Error("Unable to find My Cloud PDF content URL.");
}