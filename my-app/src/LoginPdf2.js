import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Slider,
  Stack,
  Divider,
} from "@mui/material";

import {
  ArrowBackIosNew,
  ArrowForwardIos,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  Fullscreen,
  FullscreenExit,
  MenuBook,
  Download,
} from "@mui/icons-material";

import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

import "./LoginPdf2.css";

// =====================================================
// CONFIG
// =====================================================

const DATA_API =
  "https://script.google.com/macros/s/AKfycbxNG3fuMW_DivRzBfhcPdwcJ3MTBgHOic1AhkWiMNhsXDq56a77Rg7UP4PpjeVQ116tbA/exec";

const PDF_PROXY =
  "https://goldendreams.onrender.com/api/pdf";

// =====================================================
// PDF.JS WORKER
// =====================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


// =====================================================
// FLIP PAGE
// =====================================================

const FlipPage = forwardRef(
  ({ src, pageNumber }, ref) => {
    return (
      <div
        ref={ref}
        className="pdf-book-page"
      >
        {src ? (
          <img
            src={src}
            alt={`PDF page ${pageNumber}`}
            draggable={false}
          />
        ) : (
          <div className="page-placeholder">
            <div className="small-loader" />
          </div>
        )}

        <div className="page-number">
          {pageNumber}
        </div>
      </div>
    );
  }
);

FlipPage.displayName = "FlipPage";


// =====================================================
// MAIN
// =====================================================

export default function LoginPdf2() {

  const username =
    (
      localStorage.getItem("username") ||
      ""
    ).trim();


  // ===================================================
  // ALBUM DATA
  // ===================================================

  const [albums, setAlbums] =
    useState([]);

  const [currentAlbum, setCurrentAlbum] =
    useState(0);


  // ===================================================
  // PDF STATE
  // ===================================================

  const [pages, setPages] =
    useState([]);

  const [totalPages, setTotalPages] =
    useState(0);

  const [currentPage, setCurrentPage] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [loadingText, setLoadingText] =
    useState("Loading Digital Album...");

  const [error, setError] =
    useState("");


  // ===================================================
  // DESIGN STATE
  // ===================================================

  const [zoom, setZoom] =
    useState(1);

  const [fullscreen, setFullscreen] =
    useState(false);


  // ===================================================
  // REFS
  // ===================================================

  const bookRef =
    useRef(null);

  const viewerRef =
    useRef(null);

  const pdfDocumentRef =
    useRef(null);

  const loadingTaskRef =
    useRef(null);

  const abortControllerRef =
    useRef(null);

  const pdfBlobCacheRef =
    useRef(new Map());

  const renderedPageCacheRef =
    useRef(new Map());

  const renderingPagesRef =
    useRef(new Set());

  const requestIdRef =
    useRef(0);

  const objectUrlRef =
    useRef(null);


  // ===================================================
  // SELECTED ALBUM
  // ===================================================

  const selectedAlbum =
    albums[currentAlbum];

  const selectedPDF =
    selectedAlbum?.pdf || "";

  const selectedHeading =
    selectedAlbum?.heading ||
    "Digital Album";


  // ===================================================
  // CLEAN PDF
  // ===================================================

  const cleanupPdf =
    useCallback(() => {

      // -----------------------------------------------
      // Destroy loading task
      // -----------------------------------------------

      try {

        if (loadingTaskRef.current) {

          loadingTaskRef.current.destroy();

          loadingTaskRef.current = null;

        }

      } catch (err) {

        console.warn(
          "Loading task cleanup:",
          err
        );

      }


      // -----------------------------------------------
      // Destroy PDF document
      // -----------------------------------------------

      try {

        if (pdfDocumentRef.current) {

          pdfDocumentRef.current.destroy();

          pdfDocumentRef.current = null;

        }

      } catch (err) {

        console.warn(
          "PDF cleanup:",
          err
        );

      }


      // -----------------------------------------------
      // Revoke old object URL if any
      // -----------------------------------------------

      if (objectUrlRef.current) {

        try {

          URL.revokeObjectURL(
            objectUrlRef.current
          );

        } catch {}

        objectUrlRef.current = null;

      }

    }, []);


  // ===================================================
  // ABORT REQUEST
  // ===================================================

  const abortCurrentRequest =
    useCallback(() => {

      if (
        abortControllerRef.current
      ) {

        try {

          abortControllerRef.current.abort();

        } catch {}

        abortControllerRef.current = null;

      }

    }, []);


  // ===================================================
  // GET ALBUM DATA
  // ===================================================

  useEffect(() => {

    let mounted = true;


    const getAlbums =
      async () => {

        try {

          setLoading(true);

          setLoadingText(
            "Loading Digital Albums..."
          );

          setError("");


          // -------------------------------------------
          // CHECK LOGIN
          // -------------------------------------------

          if (!username) {

            setError(
              "User session not found."
            );

            setAlbums([]);

            setLoading(false);

            return;

          }


          // -------------------------------------------
          // GET GOOGLE SHEET DATA
          // -------------------------------------------

          const response =
            await fetch(
              DATA_API,
              {
                cache: "no-store",
              }
            );


          if (!response.ok) {

            throw new Error(
              `API Error: ${response.status}`
            );

          }


          const jsonData =
            await response.json();


          if (
            !Array.isArray(jsonData)
          ) {

            throw new Error(
              "Invalid API response."
            );

          }


          // -------------------------------------------
          // FILTER USER
          // -------------------------------------------

          const filtered =
            jsonData.filter(
              (item) => {

                const apiUsername =
                  String(
                    item?.UserName || ""
                  ).trim();


                return (
                  apiUsername.toLowerCase() ===
                  username.toLowerCase()
                );

              }
            );


          // -------------------------------------------
          // CREATE ALBUM LIST
          // -------------------------------------------

          const albumList =
            filtered
              .map((item) => ({

                heading:
                  String(
                    item?.heading2 ||
                    "Digital Album"
                  ).trim(),

                pdf:
                  String(
                    item?.pdf2 || ""
                  ).trim(),

              }))
              .filter(
                (item) => item.pdf
              );


          if (!mounted)
            return;


          setAlbums(albumList);

          setCurrentAlbum(0);


          // -------------------------------------------
          // NO ALBUM
          // -------------------------------------------

          if (
            albumList.length === 0
          ) {

            setError(
              "No digital albums were found."
            );

          }


          setLoading(false);

        } catch (err) {

          console.error(
            "Album API Error:",
            err
          );


          if (!mounted)
            return;


          setAlbums([]);

          setError(
            err?.message ||
            "Unable to load albums."
          );

          setLoading(false);

        }

      };


    getAlbums();


    return () => {

      mounted = false;

    };

  }, [username]);


  // ===================================================
  // CREATE PAGE IMAGE
  // ===================================================

  const renderPage =
    useCallback(
      async (
        pdf,
        pageNumber,
        albumKey
      ) => {

        // ---------------------------------------------
        // CHECK PAGE CACHE
        // ---------------------------------------------

        const albumCache =
          renderedPageCacheRef.current.get(
            albumKey
          );


        if (
          albumCache?.has(pageNumber)
        ) {

          return albumCache.get(
            pageNumber
          );

        }


        // ---------------------------------------------
        // PREVENT DUPLICATE RENDER
        // ---------------------------------------------

        const renderKey =
          `${albumKey}-${pageNumber}`;


        if (
          renderingPagesRef.current.has(
            renderKey
          )
        ) {

          return null;

        }


        renderingPagesRef.current.add(
          renderKey
        );


        try {

          // -------------------------------------------
          // GET PDF PAGE
          // -------------------------------------------

          const page =
            await pdf.getPage(
              pageNumber
            );


          // -------------------------------------------
          // PAGE VIEWPORT
          // -------------------------------------------

          const viewport =
            page.getViewport({
              scale: 1.25,
            });


          // -------------------------------------------
          // DEVICE PIXEL RATIO
          // -------------------------------------------

          const dpr =
            Math.min(
              window.devicePixelRatio ||
              1,
              1.5
            );


          // -------------------------------------------
          // CREATE CANVAS
          // -------------------------------------------

          const canvas =
            document.createElement(
              "canvas"
            );


          const context =
            canvas.getContext(
              "2d",
              {
                alpha: false,
              }
            );


          if (!context) {

            throw new Error(
              "Unable to create canvas context."
            );

          }


          canvas.width =
            Math.floor(
              viewport.width * dpr
            );


          canvas.height =
            Math.floor(
              viewport.height * dpr
            );


          // -------------------------------------------
          // RENDER PDF PAGE
          // -------------------------------------------

          await page.render({

            canvasContext:
              context,

            viewport,

            transform: [
              dpr,
              0,
              0,
              dpr,
              0,
              0,
            ],

          }).promise;


          // -------------------------------------------
          // CONVERT CANVAS TO IMAGE
          // -------------------------------------------

          const image =
            canvas.toDataURL(
              "image/jpeg",
              0.82
            );


          // -------------------------------------------
          // SAVE PAGE CACHE
          // -------------------------------------------

          if (!albumCache) {

            renderedPageCacheRef.current.set(
              albumKey,
              new Map([
                [
                  pageNumber,
                  image,
                ],
              ])
            );

          } else {

            albumCache.set(
              pageNumber,
              image
            );

          }


          // -------------------------------------------
          // CLEAN CANVAS
          // -------------------------------------------

          canvas.width = 1;
          canvas.height = 1;


          return image;

        } finally {

          renderingPagesRef.current.delete(
            renderKey
          );

        }

      },
      []
    );


  // ===================================================
  // LOAD PDF
  // ===================================================

  const loadPDF =
    useCallback(
      async (
        shareUrl,
        heading
      ) => {

        if (!shareUrl)
          return;


        const albumKey =
          shareUrl.trim();


        if (!albumKey)
          return;


        const requestId =
          ++requestIdRef.current;


        // ---------------------------------------------
        // CANCEL PREVIOUS REQUEST
        // ---------------------------------------------

        abortCurrentRequest();

        cleanupPdf();


        const controller =
          new AbortController();


        abortControllerRef.current =
          controller;


        setError("");

        setLoading(true);

        setLoadingText(
          "Connecting to Digital Album..."
        );


        try {

          let blob =
            pdfBlobCacheRef.current.get(
              albumKey
            );


          // =========================================
          // DOWNLOAD PDF
          // =========================================

          if (!blob) {

            console.log(
              "================================="
            );

            console.log(
              "Downloading PDF..."
            );

            console.log(
              "My Cloud Share URL:",
              albumKey
            );

            console.log(
              "Render PDF Proxy:",
              PDF_PROXY
            );


            const proxyUrl =
              `${PDF_PROXY}?url=${encodeURIComponent(
                albumKey
              )}`;


            console.log(
              "PDF Proxy URL:",
              proxyUrl
            );


            // -----------------------------------------
            // FETCH FROM RENDER
            // -----------------------------------------

            const response =
              await fetch(
                proxyUrl,
                {
                  signal:
                    controller.signal,

                  cache:
                    "no-store",
                }
              );


            // -----------------------------------------
            // REQUEST CANCELLED
            // -----------------------------------------

            if (
              controller.signal.aborted ||
              requestId !==
                requestIdRef.current
            ) {

              return;

            }


            // -----------------------------------------
            // HTTP ERROR
            // -----------------------------------------

            if (!response.ok) {

              throw new Error(
                `PDF Server Error: ${response.status}`
              );

            }


            // -----------------------------------------
            // CHECK CONTENT TYPE
            // -----------------------------------------

            const contentType =
              response.headers.get(
                "content-type"
              ) || "";


            console.log(
              "PDF Content-Type:",
              contentType
            );


            if (
              !contentType
                .toLowerCase()
                .includes(
                  "application/pdf"
                )
            ) {

              throw new Error(
                `Invalid PDF response. Content-Type: ${contentType}`
              );

            }


            setLoadingText(
              "Receiving Digital Album..."
            );


            // -----------------------------------------
            // READ PDF AS ARRAY BUFFER
            // -----------------------------------------

            const arrayBuffer =
              await response.arrayBuffer();


            // -----------------------------------------
            // CHECK AGAIN
            // -----------------------------------------

            if (
              controller.signal.aborted ||
              requestId !==
                requestIdRef.current
            ) {

              return;

            }


            if (
              !arrayBuffer ||
              arrayBuffer.byteLength === 0
            ) {

              throw new Error(
                "Empty PDF received."
              );

            }


            console.log(
              "PDF received:",
              (
                arrayBuffer.byteLength /
                1024 /
                1024
              ).toFixed(2),
              "MB"
            );


            // -----------------------------------------
            // CREATE BLOB FOR DOWNLOAD
            // -----------------------------------------

            blob =
              new Blob(
                [arrayBuffer],
                {
                  type:
                    "application/pdf",
                }
              );


            // -----------------------------------------
            // CACHE PDF
            // -----------------------------------------

            pdfBlobCacheRef.current.set(
              albumKey,
              blob
            );

          } else {

            console.log(
              "Using cached PDF."
            );

          }


          // =========================================
          // PDF.JS
          // =========================================

          setLoadingText(
            "Opening Digital Album..."
          );


          // -----------------------------------------
          // GET ARRAY BUFFER FROM BLOB
          // -----------------------------------------

          const arrayBuffer =
            await blob.arrayBuffer();


          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {

            return;

          }


          console.log(
            "Sending PDF to PDF.js:",
            (
              arrayBuffer.byteLength /
              1024 /
              1024
            ).toFixed(2),
            "MB"
          );


          // -----------------------------------------
          // CREATE PDF.JS LOADING TASK
          // -----------------------------------------

          const loadingTask =
            pdfjsLib.getDocument({
              data:
                new Uint8Array(
                  arrayBuffer
                ),

              disableAutoFetch:
                false,

              disableStream:
                false,
            });


          loadingTaskRef.current =
            loadingTask;


          // -----------------------------------------
          // LOAD PDF
          // -----------------------------------------

          const pdf =
            await loadingTask.promise;


          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {

            return;

          }


          console.log(
            "PDF loaded successfully."
          );


          console.log(
            "Total pages:",
            pdf.numPages
          );


          pdfDocumentRef.current =
            pdf;


          const count =
            pdf.numPages;


          setTotalPages(
            count
          );


          // =========================================
          // CREATE EMPTY PAGE ARRAY
          // =========================================

          const emptyPages =
            Array.from(
              {
                length: count,
              },
              () => null
            );


          setPages(
            emptyPages
          );


          // =========================================
          // FIRST PAGE
          // =========================================

          setLoadingText(
            "Preparing first page..."
          );


          const firstPage =
            await renderPage(
              pdf,
              1,
              albumKey
            );


          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {

            return;

          }


          if (firstPage) {

            setPages(
              previous => {

                const next =
                  [...previous];

                next[0] =
                  firstPage;

                return next;

              }
            );

          }


          setCurrentPage(0);

          setLoading(false);

          setLoadingText("");


          // =========================================
          // BACKGROUND RENDERING
          // =========================================

          setTimeout(
            async () => {

              try {

                if (
                  controller.signal.aborted ||
                  requestId !==
                    requestIdRef.current
                ) {

                  return;

                }


                // -----------------------------------
                // FIRST EXTRA PAGES
                // -----------------------------------

                for (
                  let page = 2;
                  page <=
                    Math.min(
                      count,
                      3
                    );
                  page++
                ) {

                  if (
                    controller.signal.aborted ||
                    requestId !==
                      requestIdRef.current
                  ) {

                    return;

                  }


                  const image =
                    await renderPage(
                      pdf,
                      page,
                      albumKey
                    );


                  if (image) {

                    setPages(
                      previous => {

                        const next =
                          [...previous];

                        next[page - 1] =
                          image;

                        return next;

                      }
                    );

                  }

                }


                // -----------------------------------
                // REMAINING PAGES
                // -----------------------------------

                for (
                  let page = 4;
                  page <= count;
                  page++
                ) {

                  if (
                    controller.signal.aborted ||
                    requestId !==
                      requestIdRef.current
                  ) {

                    return;

                  }


                  const image =
                    await renderPage(
                      pdf,
                      page,
                      albumKey
                    );


                  if (image) {

                    setPages(
                      previous => {

                        const next =
                          [...previous];

                        next[page - 1] =
                          image;

                        return next;

                      }
                    );

                  }


                  // Small delay prevents
                  // browser from freezing

                  await new Promise(
                    resolve =>
                      setTimeout(
                        resolve,
                        10
                      )
                  );

                }

              } catch (backgroundError) {

                console.error(
                  "Background page rendering error:",
                  backgroundError
                );

              }

            },
            50
          );

        } catch (err) {

          // -------------------------------------------
          // IGNORE ABORTED REQUEST
          // -------------------------------------------

          if (
            controller.signal.aborted ||
            requestId !==
              requestIdRef.current
          ) {

            return;

          }


          console.error(
            "================================="
          );

          console.error(
            "PDF ERROR"
          );

          console.error(
            err
          );

          console.error(
            "================================="
          );


          setPages([]);

          setTotalPages(0);


          // -------------------------------------------
          // FRIENDLY ERROR
          // -------------------------------------------

          let errorMessage =
            err?.message ||
            "Unable to load PDF.";


          if (
            errorMessage
              .toLowerCase()
              .includes(
                "failed to fetch"
              )
          ) {

            errorMessage =
              "Unable to connect to the PDF server. Please check your internet connection or try again.";

          }


          setError(
            errorMessage
          );

          setLoading(false);

        } finally {

          if (
            abortControllerRef.current ===
            controller
          ) {

            abortControllerRef.current =
              null;

          }

        }

      },
      [
        abortCurrentRequest,
        cleanupPdf,
        renderPage,
      ]
    );


  // ===================================================
  // LOAD SELECTED PDF
  // ===================================================

  useEffect(() => {

    if (!selectedPDF)
      return;


    loadPDF(
      selectedPDF,
      selectedHeading
    );


    return () => {

      abortCurrentRequest();

    };

  }, [
    selectedPDF,
    selectedHeading,
    loadPDF,
    abortCurrentRequest,
  ]);


  // ===================================================
  // CHANGE ALBUM
  // ===================================================

  const changeAlbum =
    index => {

      if (
        index === currentAlbum
      ) {

        return;

      }


      abortCurrentRequest();


      setCurrentAlbum(index);

      setPages([]);

      setTotalPages(0);

      setCurrentPage(0);

      setZoom(1);

      setError("");

      setLoading(true);

      setLoadingText(
        "Opening Digital Album..."
      );

    };


  // ===================================================
  // PAGE FLIP
  // ===================================================

  const handleFlip =
    useCallback(
      event => {

        setCurrentPage(
          event.data || 0
        );

      },
      []
    );


  // ===================================================
  // NAVIGATION
  // ===================================================

  const nextPage =
    () => {

      if (!bookRef.current)
        return;


      bookRef.current
        .pageFlip()
        .flipNext();

    };


  const previousPage =
    () => {

      if (!bookRef.current)
        return;


      bookRef.current
        .pageFlip()
        .flipPrev();

    };


  // ===================================================
  // ZOOM
  // ===================================================

  const zoomIn =
    () => {

      setZoom(
        value =>
          Math.min(
            value + 0.1,
            2
          )
      );

    };


  const zoomOut =
    () => {

      setZoom(
        value =>
          Math.max(
            value - 0.1,
            0.7
          )
      );

    };


  const resetZoom =
    () => {

      setZoom(1);

    };


  // ===================================================
  // FULLSCREEN
  // ===================================================

  const toggleFullscreen =
    async () => {

      try {

        if (
          !document.fullscreenElement
        ) {

          await viewerRef.current
            ?.requestFullscreen();

        } else {

          await document.exitFullscreen();

        }

      } catch (err) {

        console.error(
          "Fullscreen error:",
          err
        );

      }

    };


  // ===================================================
  // FULLSCREEN EVENT
  // ===================================================

  useEffect(() => {

    const handleFullscreen =
      () => {

        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );

      };


    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );


    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );

    };

  }, []);


  // ===================================================
  // DOWNLOAD
  // ===================================================

  const downloadPDF =
    async () => {

      try {

        if (!selectedPDF)
          return;


        // ---------------------------------------------
        // USE CACHED PDF
        // ---------------------------------------------

        const blob =
          pdfBlobCacheRef.current.get(
            selectedPDF
          );


        if (blob) {

          const url =
            URL.createObjectURL(
              blob
            );


          const link =
            document.createElement(
              "a"
            );


          link.href =
            url;


          link.download =
            `${selectedHeading || "Digital-Album"}.pdf`;


          document.body.appendChild(
            link
          );


          link.click();


          link.remove();


          setTimeout(
            () =>
              URL.revokeObjectURL(
                url
              ),
            1000
          );


          return;

        }


        // ---------------------------------------------
        // FALLBACK
        // ---------------------------------------------

        const proxyUrl =
          `${PDF_PROXY}?url=${encodeURIComponent(
            selectedPDF
          )}`;


        window.open(
          proxyUrl,
          "_blank"
        );

      } catch (err) {

        console.error(
          "Download error:",
          err
        );

      }

    };


  // ===================================================
  // KEYBOARD
  // ===================================================

  useEffect(() => {

    const handleKeyboard =
      event => {

        if (
          event.key ===
          "ArrowRight"
        ) {

          nextPage();

        }


        if (
          event.key ===
          "ArrowLeft"
        ) {

          previousPage();

        }


        if (
          event.key === "+"
        ) {

          zoomIn();

        }


        if (
          event.key === "-"
        ) {

          zoomOut();

        }

      };


    window.addEventListener(
      "keydown",
      handleKeyboard
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );

    };

  });


  // ===================================================
  // UNMOUNT
  // ===================================================

  useEffect(() => {

    return () => {

      abortCurrentRequest();

      cleanupPdf();

    };

  }, [
    abortCurrentRequest,
    cleanupPdf,
  ]);


  // ===================================================
  // PAGE DIMENSIONS
  // ===================================================

  const bookWidth =
    fullscreen
      ? Math.min(
          window.innerWidth * 0.45,
          850
        )
      : Math.min(
          window.innerWidth * 0.43,
          700
        );


  const bookHeight =
    fullscreen
      ? Math.min(
          window.innerHeight * 0.82,
          1000
        )
      : Math.min(
          window.innerHeight * 0.76,
          850
        );


  // ===================================================
  // NO ALBUM
  // ===================================================

  if (
    !loading &&
    albums.length === 0
  ) {

    return (

      <Box
        className="pdf-viewer"
      >

        <Box
          className="no-album"
        >

          <MenuBook />

          <Typography>
            Digital Album
          </Typography>

          <Typography
            variant="body2"
          >
            {error ||
              "No digital albums are available."}
          </Typography>

        </Box>

      </Box>

    );

  }


  // ===================================================
  // MAIN UI
  // ===================================================

  return (

    <Box
      ref={viewerRef}
      className="pdf-viewer"
    >

      {/* =================================================
          TOP BAR
      ================================================= */}

      <Box
        className="pdf-topbar"
      >

        {/* LEFT */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
        >

          <Box
            className="book-icon"
          >

            <MenuBook />

          </Box>


          <Box>

            <Typography
              className="album-title"
            >

              {selectedHeading}

            </Typography>


            <Typography
              className="album-subtitle"
            >

              {albums.length}
              {" "}
              {albums.length === 1
                ? "Digital Album"
                : "Digital Albums"}

            </Typography>

          </Box>

        </Stack>


        {/* CENTER */}

        {!loading &&
          pages.length > 0 && (

            <Box
              className="top-page-counter"
            >

              {currentPage + 1}

              <span>
                /
              </span>

              {totalPages}

            </Box>

          )}


        {/* RIGHT */}

        <Stack
          direction="row"
          spacing={0.5}
        >

          <Tooltip
            title="Download PDF"
          >

            <IconButton
              onClick={
                downloadPDF
              }
              className="top-button"
            >

              <Download />

            </IconButton>

          </Tooltip>


          <Tooltip
            title={
              fullscreen
                ? "Exit Fullscreen"
                : "Fullscreen"
            }
          >

            <IconButton
              onClick={
                toggleFullscreen
              }
              className="top-button"
            >

              {fullscreen ? (
                <FullscreenExit />
              ) : (
                <Fullscreen />
              )}

            </IconButton>

          </Tooltip>

        </Stack>

      </Box>


      {/* =================================================
          ALBUM TABS
      ================================================= */}

      {albums.length > 1 && (

        <Box
          className="album-tabs"
        >

          {albums.map(
            (item, index) => (

              <button
                key={`${item.pdf}-${index}`}
                type="button"
                onClick={() =>
                  changeAlbum(index)
                }
                className={
                  index === currentAlbum
                    ? "album-tab active"
                    : "album-tab"
                }
              >

                <span
                  className="album-number"
                >
                  {index + 1}
                </span>


                <span
                  className="album-heading"
                >
                  {item.heading}
                </span>

              </button>

            )
          )}

        </Box>

      )}


      {/* =================================================
          BOOK STAGE
      ================================================= */}

      <Box
        className="pdf-stage"
      >

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <Box
            className="pdf-loading"
          >

            <Box
              className="book-loader"
            >

              <Box
                className="book-glow"
              />

              <Box
                className="book-ground-shadow"
              />


              <Box
                className="book-left"
              >

                <Box
                  className="page-stack left-stack-1"
                />

                <Box
                  className="page-stack left-stack-2"
                />

                <Box
                  className="book-page left-page"
                >

                  <Box className="page-line line-1" />
                  <Box className="page-line line-2" />
                  <Box className="page-line line-3" />
                  <Box className="page-line line-4" />

                </Box>

              </Box>


              <Box
                className="book-right"
              >

                <Box
                  className="page-stack right-stack-1"
                />

                <Box
                  className="page-stack right-stack-2"
                />

                <Box
                  className="book-page right-page"
                >

                  <Box className="page-line line-1" />
                  <Box className="page-line line-2" />
                  <Box className="page-line line-3" />
                  <Box className="page-line line-4" />

                </Box>

              </Box>


              <Box
                className="book-spine"
              >

                <Box
                  className="spine-light"
                />

              </Box>


              <Box
                className="turning-page"
              >

                <Box
                  className="turning-page-front"
                >

                  <Box className="page-line line-1" />
                  <Box className="page-line line-2" />
                  <Box className="page-line line-3" />
                  <Box className="page-line line-4" />

                </Box>

                <Box
                  className="turning-page-back"
                />

              </Box>

            </Box>


            <Box
              className="loading-dots"
            >

              <span className="loader-dot blue-dot" />
              <span className="loader-dot cyan-dot" />
              <span className="loader-dot purple-dot" />

            </Box>


            <Typography
              className="loading-text"
            >

              {loadingText}

            </Typography>


            {pages.length > 0 && (

              <Typography
                className="loading-small"
              >

                {pages.length} pages ready

              </Typography>

            )}

          </Box>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {!loading &&
          error &&
          pages.length === 0 && (

            <Box
              className="pdf-error"
            >

              <MenuBook />

              <Typography>
                {error}
              </Typography>

              <button
                onClick={() =>
                  loadPDF(
                    selectedPDF,
                    selectedHeading
                  )
                }
              >
                Try Again
              </button>

            </Box>

          )}


        {/* =================================================
            BOOK
        ================================================= */}

        {!loading &&
          pages.length > 0 && (

            <Box
              className="book-wrapper"
              sx={{
                transform:
                  `scale(${zoom})`,
              }}
            >

              <HTMLFlipBook

                ref={bookRef}

                width={bookWidth}

                height={bookHeight}

                size="fixed"

                minWidth={280}

                maxWidth={850}

                minHeight={400}

                maxHeight={1000}

                showCover={true}

                drawShadow={true}

                maxShadowOpacity={0.75}

                flippingTime={1100}

                usePortrait={
                  window.innerWidth < 768
                }

                autoSize={false}

                mobileScrollSupport={true}

                swipeDistance={25}

                clickEventForward={true}

                useMouseEvents={true}

                startZIndex={0}

                startPage={0}

                onFlip={
                  handleFlip
                }

                className="pdf-book"

              >

                {pages.map(
                  (image, index) => (

                    <FlipPage
                      key={index}
                      src={image}
                      pageNumber={
                        index + 1
                      }
                    />

                  )
                )}

              </HTMLFlipBook>

            </Box>

          )}

      </Box>


      {/* =================================================
          BOTTOM TOOLBAR
      ================================================= */}

      {!loading &&
        pages.length > 0 && (

          <Box
            className="pdf-toolbar"
          >

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
            >

              {/* PREVIOUS */}

              <Tooltip
                title="Previous page"
              >

                <span>

                  <IconButton
                    onClick={
                      previousPage
                    }
                    disabled={
                      currentPage <= 0
                    }
                    className="nav-button"
                  >

                    <ArrowBackIosNew
                      fontSize="small"
                    />

                  </IconButton>

                </span>

              </Tooltip>


              {/* ZOOM OUT */}

              <Tooltip
                title="Zoom out"
              >

                <IconButton
                  onClick={
                    zoomOut
                  }
                  className="control-button"
                >

                  <ZoomOut />

                </IconButton>

              </Tooltip>


              {/* ZOOM SLIDER */}

              <Box
                sx={{
                  width: {
                    xs: 60,
                    sm: 110,
                    md: 150,
                  },
                }}
              >

                <Slider
                  value={zoom}
                  min={0.7}
                  max={2}
                  step={0.1}
                  onChange={(
                    _,
                    value
                  ) =>
                    setZoom(value)
                  }
                  className="zoom-slider"
                />

              </Box>


              {/* ZOOM VALUE */}

              <Typography
                className="zoom-value"
              >

                {Math.round(
                  zoom * 100
                )}
                %

              </Typography>


              {/* ZOOM IN */}

              <Tooltip
                title="Zoom in"
              >

                <IconButton
                  onClick={
                    zoomIn
                  }
                  className="control-button"
                >

                  <ZoomIn />

                </IconButton>

              </Tooltip>


              {/* RESET */}

              <Tooltip
                title="Reset zoom"
              >

                <IconButton
                  onClick={
                    resetZoom
                  }
                  className="reset-button"
                >

                  <RestartAlt />

                </IconButton>

              </Tooltip>


              <Divider
                orientation="vertical"
                flexItem
                className="toolbar-divider"
              />


              {/* NEXT */}

              <Tooltip
                title="Next page"
              >

                <span>

                  <IconButton
                    onClick={
                      nextPage
                    }
                    disabled={
                      currentPage >=
                      totalPages - 1
                    }
                    className="next-button"
                  >

                    <ArrowForwardIos
                      fontSize="small"
                    />

                  </IconButton>

                </span>

              </Tooltip>

            </Stack>

          </Box>

        )}

    </Box>

  );

}