import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Download,
  ArrowBack,
} from "@mui/icons-material";

import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

/* =========================================================
   API
========================================================= */

const DATA_API =
  "https://script.google.com/macros/s/AKfycbxNG3fuMW_DivRzBfhcPdwcJ3MTBgHOic1AhkWiMNhsXDq56a77Rg7UP4PpjeVQ116tbA/exec";

const PDF_PROXY =
  "https://goldendreams.onrender.com/api/pdf";

/* =========================================================
   PDF.JS WORKER
========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


/* =========================================================
   COMPONENT
========================================================= */

const LoginPdf2 = () => {

  /* =======================================================
     USER
  ======================================================= */

  const username =
    localStorage.getItem("username") || "";


  /* =======================================================
     ALBUM STATE
  ======================================================= */

  const [albums, setAlbums] =
    useState([]);

  const [selectedPDF, setSelectedPDF] =
    useState("");

  const [selectedHeading, setSelectedHeading] =
    useState("");


  /* =======================================================
     PDF STATE
  ======================================================= */

  const [pdf, setPdf] =
    useState(null);

  const [pages, setPages] =
    useState([]);

  const [totalPages, setTotalPages] =
    useState(0);

  const [currentPage, setCurrentPage] =
    useState(0);


  /* =======================================================
     LOADING / ERROR
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [loadingText, setLoadingText] =
    useState("");

  const [error, setError] =
    useState("");

  const [retryKey, setRetryKey] =
    useState(0);

  const [pdfReloadKey, setPdfReloadKey] =
    useState(0);


  /* =======================================================
     ZOOM
  ======================================================= */

  const [zoom, setZoom] =
    useState(1);


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const [isFullscreen, setIsFullscreen] =
    useState(false);


  /* =======================================================
     BOOK SIZE
  ======================================================= */

  const getBookSize = () => {

    const width =
      window.innerWidth;

    if (width <= 600) {

      return {
        width: 290,
        height: 410,
      };

    }

    if (width <= 900) {

      return {
        width: 360,
        height: 510,
      };

    }

    if (width <= 1200) {

      return {
        width: 430,
        height: 610,
      };

    }

    return {
      width: 500,
      height: 700,
    };

  };


  const [bookSize, setBookSize] =
    useState(getBookSize());


  /* =======================================================
     REFS
  ======================================================= */

  const flipBookRef =
    useRef(null);

  const containerRef =
    useRef(null);

  const abortControllerRef =
    useRef(null);


  /*
   * IMPORTANT:
   *
   * Keep ArrayBuffer cache.
   * Never directly reuse Uint8Array with PDF.js.
   */

  const pdfBufferCacheRef =
    useRef(new Map());

  const pdfBlobCacheRef =
    useRef(new Map());

  const renderedPageCacheRef =
    useRef(new Map());

  const pdfLoadingTaskRef =
    useRef(null);

  const pdfDocumentRef =
    useRef(null);

  const renderTaskRef =
    useRef(null);


  /* =======================================================
     RESIZE
  ======================================================= */

  useEffect(() => {

    const resize = () => {

      setBookSize(
        getBookSize()
      );

    };

    window.addEventListener(
      "resize",
      resize
    );

    return () => {

      window.removeEventListener(
        "resize",
        resize
      );

    };

  }, []);


  /* =======================================================
     LOAD ALBUM LIST
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const loadAlbums = async () => {

      try {

        setLoading(true);

        setLoadingText(
          "Loading albums..."
        );

        setError("");

        const response =
          await fetch(
            `${DATA_API}?t=${Date.now()}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {

          throw new Error(
            `Album API Error: ${response.status}`
          );

        }

        const data =
          await response.json();

        if (cancelled) return;

        const userAlbums =
          Array.isArray(data)
            ? data
                .filter((item) => {

                  const apiUser =
                    String(
                      item?.UserName || ""
                    )
                      .trim()
                      .toLowerCase();

                  return (
                    apiUser ===
                    String(username)
                      .trim()
                      .toLowerCase()
                  );

                })
                .map((item) => ({

                  heading:
                    item?.heading2 ||
                    "Digital Album",

                  pdf:
                    item?.pdf2 ||
                    "",

                }))
                .filter(
                  (item) =>
                    item.pdf
                )
            : [];

        setAlbums(
          userAlbums
        );

      } catch (err) {

        console.error(
          "Album API Error:",
          err
        );

        if (!cancelled) {

          setError(
            "Unable to load your albums."
          );

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

          setLoadingText("");

        }

      }

    };

    loadAlbums();

    return () => {

      cancelled = true;

    };

  }, [
    username,
    retryKey,
  ]);


  /* =======================================================
     SELECT ALBUM
  ======================================================= */

  const selectAlbum =
    useCallback(
      (album) => {

        if (!album?.pdf) return;

        try {

          if (
            renderTaskRef.current
          ) {

            renderTaskRef.current.cancel();

          }

        } catch (_) {}

        try {

          if (
            pdfLoadingTaskRef.current
          ) {

            pdfLoadingTaskRef.current.destroy();

          }

        } catch (_) {}

        try {

          if (
            pdfDocumentRef.current
          ) {

            pdfDocumentRef.current.destroy();

          }

        } catch (_) {}

        renderTaskRef.current = null;

        pdfLoadingTaskRef.current = null;

        pdfDocumentRef.current = null;

        setSelectedPDF(
          album.pdf
        );

        setSelectedHeading(
          album.heading ||
          "Digital Album"
        );

        setPdf(null);

        setPages([]);

        setTotalPages(0);

        setCurrentPage(0);

        setZoom(1);

        setError("");

        setLoading(true);

        setLoadingText(
          "Preparing digital album..."
        );

      },
      []
    );


  /* =======================================================
     DOWNLOAD / FETCH PDF
  ======================================================= */

  const downloadPDF =
    useCallback(
      async (albumKey) => {

        if (!albumKey) {

          throw new Error(
            "PDF link is missing."
          );

        }


        /* =================================================
           CACHE
        ================================================= */

        if (
          pdfBufferCacheRef.current.has(
            albumKey
          )
        ) {

          const cachedBuffer =
            pdfBufferCacheRef.current.get(
              albumKey
            );

          /*
           * VERY IMPORTANT:
           * Make fresh ArrayBuffer.
           */

          const freshBuffer =
            cachedBuffer.slice(0);

          const freshBytes =
            new Uint8Array(
              freshBuffer
            );

          return {

            bytes:
              freshBytes,

            blob:
              pdfBlobCacheRef.current.get(
                albumKey
              ),

          };

        }


        /* =================================================
           ABORT PREVIOUS
        ================================================= */

        if (
          abortControllerRef.current
        ) {

          try {

            abortControllerRef.current.abort();

          } catch (_) {}

        }


        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;


        /* =================================================
           PROXY
        ================================================= */

        const proxyUrl =
          `${PDF_PROXY}?url=${encodeURIComponent(
            albumKey
          )}`;


        setLoadingText(
          "Connecting to PDF server..."
        );


        /* =================================================
           FETCH
        ================================================= */

        const response =
          await fetch(
            proxyUrl,
            {
              method:
                "GET",

              signal:
                controller.signal,

              cache:
                "no-store",

              headers: {

                Accept:
                  "application/pdf",

              },

            }
          );


        if (!response.ok) {

          let serverMessage = "";

          try {

            const text =
              await response.text();

            serverMessage =
              text.substring(
                0,
                500
              );

          } catch (_) {}


          throw new Error(
            `PDF Server Error: ${response.status}${
              serverMessage
                ? ` - ${serverMessage}`
                : ""
            }`
          );

        }


        const contentType =
          response.headers.get(
            "content-type"
          ) || "";


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
          "Downloading PDF..."
        );


        const arrayBuffer =
          await response.arrayBuffer();


        if (
          !arrayBuffer ||
          arrayBuffer.byteLength === 0
        ) {

          throw new Error(
            "Empty PDF received."
          );

        }


        /* =================================================
           PDF HEADER
        ================================================= */

        const headerBytes =
          new Uint8Array(
            arrayBuffer.slice(
              0,
              5
            )
          );

        const header =
          String.fromCharCode(
            ...headerBytes
          );


        if (
          header !==
          "%PDF-"
        ) {

          throw new Error(
            "The server response is not a valid PDF."
          );

        }


        /* =================================================
           CACHE ORIGINAL ARRAYBUFFER
        ================================================= */

        pdfBufferCacheRef.current.set(
          albumKey,
          arrayBuffer
        );


        /* =================================================
           BLOB
        ================================================= */

        const blob =
          new Blob(
            [arrayBuffer],
            {
              type:
                "application/pdf",
            }
          );


        pdfBlobCacheRef.current.set(
          albumKey,
          blob
        );


        /*
         * Fresh copy for PDF.js.
         */

        const freshBuffer =
          arrayBuffer.slice(0);

        const freshBytes =
          new Uint8Array(
            freshBuffer
          );


        return {

          bytes:
            freshBytes,

          blob,

        };

      },
      []
    );


  /* =======================================================
     LOAD PDF
  ======================================================= */

  useEffect(() => {

    if (!selectedPDF) return;

    let cancelled = false;

    let currentLoadingTask = null;

    let currentLoadedPdf = null;

    let currentRenderTask = null;


    const cleanupPDF =
      async () => {

        try {

          if (
            currentRenderTask
          ) {

            currentRenderTask.cancel();

          }

        } catch (_) {}


        try {

          if (
            renderTaskRef.current
          ) {

            renderTaskRef.current.cancel();

          }

        } catch (_) {}


        try {

          if (
            currentLoadingTask
          ) {

            await currentLoadingTask.destroy();

          }

        } catch (_) {}


        try {

          if (
            pdfLoadingTaskRef.current
          ) {

            await pdfLoadingTaskRef.current.destroy();

          }

        } catch (_) {}


        try {

          if (
            currentLoadedPdf
          ) {

            await currentLoadedPdf.destroy();

          }

        } catch (_) {}


        try {

          if (
            pdfDocumentRef.current
          ) {

            await pdfDocumentRef.current.destroy();

          }

        } catch (_) {}


        currentLoadingTask = null;

        currentLoadedPdf = null;

        currentRenderTask = null;

        pdfLoadingTaskRef.current = null;

        pdfDocumentRef.current = null;

        renderTaskRef.current = null;

      };


    const loadPDF =
      async () => {

        try {

          setLoading(true);

          setLoadingText(
            "Preparing digital album..."
          );

          setError("");

          setPages([]);

          setPdf(null);

          setTotalPages(0);

          setCurrentPage(0);


          /* ============================================
             FETCH
          ============================================ */

          const result =
            await downloadPDF(
              selectedPDF
            );


          if (cancelled) return;


          /*
           * Create fresh PDF.js buffer.
           */

          const sourceBytes =
            result.bytes;

          const pdfBytes =
            new Uint8Array(
              sourceBytes
            );


          /* ============================================
             PDF.JS
          ============================================ */

          setLoadingText(
            "Opening digital album..."
          );


          currentLoadingTask =
            pdfjsLib.getDocument({

              data:
                pdfBytes,

            });


          pdfLoadingTaskRef.current =
            currentLoadingTask;


          const loadedPdf =
            await currentLoadingTask.promise;


          currentLoadedPdf =
            loadedPdf;

          pdfDocumentRef.current =
            loadedPdf;


          if (cancelled) {

            await cleanupPDF();

            return;

          }


          setPdf(
            loadedPdf
          );

          setTotalPages(
            loadedPdf.numPages
          );


          /* ============================================
             RENDER ALL PAGES
          ============================================ */

          const renderedPages =
            [];


          for (
            let pageNumber = 1;
            pageNumber <=
            loadedPdf.numPages;
            pageNumber++
          ) {

            if (cancelled) break;


            setLoadingText(
              `Preparing page ${pageNumber} of ${loadedPdf.numPages}...`
            );


            const cacheKey =
              `${selectedPDF}__${pageNumber}__${zoom}`;


            if (
              renderedPageCacheRef.current.has(
                cacheKey
              )
            ) {

              renderedPages.push(
                renderedPageCacheRef.current.get(
                  cacheKey
                )
              );

              continue;

            }


            const page =
              await loadedPdf.getPage(
                pageNumber
              );


            if (cancelled) {

              try {

                page.cleanup();

              } catch (_) {}

              break;

            }


            /*
             * Slightly higher quality for
             * photographic albums.
             */

            const baseScale =
              1.35 * zoom;


            const viewport =
              page.getViewport({
                scale:
                  baseScale,
              });


            const dpr =
              Math.min(
                window.devicePixelRatio ||
                  1,
                1.5
              );


            const canvas =
              document.createElement(
                "canvas"
              );


            const context =
              canvas.getContext(
                "2d",
                {
                  alpha:
                    false,
                }
              );


            canvas.width =
              Math.floor(
                viewport.width *
                  dpr
              );

            canvas.height =
              Math.floor(
                viewport.height *
                  dpr
              );


            canvas.style.width =
              `${viewport.width}px`;

            canvas.style.height =
              `${viewport.height}px`;


            /* ==========================================
               RENDER
            ========================================== */

            currentRenderTask =
              page.render({

                canvasContext:
                  context,

                viewport,

                transform:
                  dpr !== 1
                    ? [
                        dpr,
                        0,
                        0,
                        dpr,
                        0,
                        0,
                      ]
                    : null,

              });


            renderTaskRef.current =
              currentRenderTask;


            await currentRenderTask.promise;


            if (cancelled) {

              try {

                currentRenderTask.cancel();

              } catch (_) {}

              break;

            }


            /* ==========================================
               IMAGE
            ========================================== */

            const image =
              canvas.toDataURL(
                "image/jpeg",
                0.9
              );


            renderedPageCacheRef.current.set(
              cacheKey,
              image
            );


            renderedPages.push(
              image
            );


            canvas.width = 1;

            canvas.height = 1;


            try {

              page.cleanup();

            } catch (_) {}


            currentRenderTask =
              null;

            renderTaskRef.current =
              null;


            if (
              pageNumber % 2 === 0
            ) {

              await new Promise(
                (resolve) =>
                  setTimeout(
                    resolve,
                    10
                  )
              );

            }

          }


          if (!cancelled) {

            setPages(
              renderedPages
            );

            setCurrentPage(0);

            setLoading(false);

            setLoadingText("");

          }

        } catch (err) {

          if (cancelled) return;


          if (
            err?.name ===
            "AbortError"
          ) {

            return;

          }


          if (
            err?.name ===
            "RenderingCancelledException"
          ) {

            return;

          }


          console.error(
            "PDF ERROR:",
            err
          );


          if (!cancelled) {

            setError(
              err?.message ||
                "Unable to open PDF."
            );

            setLoading(false);

            setLoadingText("");

          }

        }

      };


    loadPDF();


    return () => {

      cancelled = true;


      try {

        if (
          abortControllerRef.current
        ) {

          abortControllerRef.current.abort();

        }

      } catch (_) {}


      void cleanupPDF();

    };

  }, [
    selectedPDF,
    downloadPDF,
    pdfReloadKey,
  ]);


  /* =======================================================
     PAGE FLIP
  ======================================================= */

  const handleFlip =
    useCallback(
      (e) => {

        const page =
          e?.data ?? 0;

        setCurrentPage(
          page
        );

      },
      []
    );


  /* =======================================================
     PREVIOUS
  ======================================================= */

  const previousPage =
    useCallback(() => {

      const book =
        flipBookRef.current
          ?.pageFlip?.();

      if (!book) return;

      try {

        book.flipPrev();

      } catch (_) {}

    }, []);


  /* =======================================================
     NEXT
  ======================================================= */

  const nextPage =
    useCallback(() => {

      const book =
        flipBookRef.current
          ?.pageFlip?.();

      if (!book) return;

      try {

        book.flipNext();

      } catch (_) {}

    }, []);


  /* =======================================================
     ZOOM
  ======================================================= */

  const zoomIn =
    useCallback(() => {

      setZoom(
        (value) =>
          Math.min(
            1.5,
            Number(
              (
                value +
                0.1
              ).toFixed(1)
            )
          )
      );

    }, []);


  const zoomOut =
    useCallback(() => {

      setZoom(
        (value) =>
          Math.max(
            0.7,
            Number(
              (
                value -
                0.1
              ).toFixed(1)
            )
          )
      );

    }, []);


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const toggleFullscreen =
    useCallback(
      async () => {

        try {

          if (
            !document.fullscreenElement
          ) {

            await containerRef.current
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

      },
      []
    );


  /* =======================================================
     FULLSCREEN EVENT
  ======================================================= */

  useEffect(() => {

    const handleFullscreen =
      () => {

        setIsFullscreen(
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


  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const handleDownload =
    useCallback(
      async () => {

        try {

          if (!selectedPDF) return;


          let blob =
            pdfBlobCacheRef.current.get(
              selectedPDF
            );


          if (!blob) {

            const result =
              await downloadPDF(
                selectedPDF
              );

            blob =
              result.blob;

          }


          if (!blob) {

            throw new Error(
              "PDF file is not available."
            );

          }


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
            `${
              selectedHeading ||
              "Digital Album"
            }.pdf`;


          document.body.appendChild(
            link
          );


          link.click();


          link.remove();


          setTimeout(
            () => {

              URL.revokeObjectURL(
                url
              );

            },
            1000
          );


        } catch (err) {

          console.error(
            "Download error:",
            err
          );

          setError(
            err?.message ||
              "Unable to download PDF."
          );

        }

      },
      [
        selectedPDF,
        selectedHeading,
        downloadPDF,
      ]
    );


  /* =======================================================
     RETRY
  ======================================================= */

  const retry =
    useCallback(() => {

      setError("");


      if (!selectedPDF) {

        setRetryKey(
          (value) =>
            value + 1
        );

        return;

      }


      setPdfReloadKey(
        (value) =>
          value + 1
      );

    }, [
      selectedPDF,
    ]);


  /* =======================================================
     BACK
  ======================================================= */

  const backToAlbums =
    useCallback(() => {

      try {

        abortControllerRef.current?.abort();

      } catch (_) {}


      try {

        renderTaskRef.current?.cancel();

      } catch (_) {}


      try {

        pdfLoadingTaskRef.current?.destroy();

      } catch (_) {}


      try {

        pdfDocumentRef.current?.destroy();

      } catch (_) {}


      renderTaskRef.current =
        null;

      pdfLoadingTaskRef.current =
        null;

      pdfDocumentRef.current =
        null;


      setSelectedPDF("");

      setSelectedHeading("");

      setPages([]);

      setPdf(null);

      setTotalPages(0);

      setCurrentPage(0);

      setZoom(1);

      setError("");

      setLoading(false);

      setLoadingText("");

    }, []);


  /* =======================================================
     KEYBOARD
  ======================================================= */

  useEffect(() => {

    const handleKeyDown =
      (event) => {

        if (!selectedPDF)
          return;


        if (
          event.key ===
          "ArrowLeft"
        ) {

          event.preventDefault();

          previousPage();

        }


        if (
          event.key ===
          "ArrowRight"
        ) {

          event.preventDefault();

          nextPage();

        }


        if (
          event.key === "+" ||
          event.key === "="
        ) {

          event.preventDefault();

          zoomIn();

        }


        if (
          event.key === "-"
        ) {

          event.preventDefault();

          zoomOut();

        }


        if (
          event.key ===
          "Escape"
        ) {

          if (
            document.fullscreenElement
          ) {

            document.exitFullscreen();

          }

        }

      };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    selectedPDF,
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
  ]);


  /* =======================================================
     ALBUM LIST
  ======================================================= */

  if (!selectedPDF) {

    return (

      <Box
        sx={{
          minHeight:
            "100vh",

          background:
            "radial-gradient(circle at top,#171717 0%,#080808 45%,#020202 100%)",

          color:
            "#fff",

          padding:
            {
              xs:
                "25px 15px",

              md:
                "40px",
            },

        }}
      >

        <Typography
          variant="h4"
          sx={{
            textAlign:
              "center",

            fontWeight:
              700,

            mb:
              4,

            letterSpacing:
              "1px",

          }}
        >

          Golden Dreams

          <br />

          Digital Albums

        </Typography>


        {loading && (

          <Box
            sx={{
              display:
                "flex",

              justifyContent:
                "center",

              alignItems:
                "center",

              gap:
                2,

              mb:
                3,

            }}
          >

            <CircularProgress
              size={25}
            />

            <Typography>
              {loadingText}
            </Typography>

          </Box>

        )}


        {error && (

          <Box
            sx={{
              maxWidth:
                600,

              mx:
                "auto",

              mb:
                3,

            }}
          >

            <Alert
              severity="error"
              action={

                <Button
                  color="inherit"
                  size="small"
                  onClick={
                    retry
                  }
                >
                  Retry
                </Button>

              }
            >

              {error}

            </Alert>

          </Box>

        )}


        <Box
          sx={{
            display:
              "grid",

            gridTemplateColumns:
              {
                xs:
                  "1fr",

                sm:
                  "repeat(2,1fr)",

                md:
                  "repeat(3,1fr)",
              },

            gap:
              2,

            maxWidth:
              1100,

            mx:
              "auto",

          }}
        >

          {albums.map(
            (
              album,
              index
            ) => (

              <Box
                key={
                  `${album.pdf}-${index}`
                }

                onClick={() =>
                  selectAlbum(
                    album
                  )
                }

                sx={{
                  cursor:
                    "pointer",

                  padding:
                    "25px",

                  borderRadius:
                    "15px",

                  background:
                    "linear-gradient(145deg,#191919,#080808)",

                  border:
                    "1px solid rgba(255,255,255,.12)",

                  transition:
                    "all .25s ease",

                  "&:hover":
                    {

                      transform:
                        "translateY(-5px)",

                      borderColor:
                        "rgba(255,193,7,.6)",

                      boxShadow:
                        "0 15px 40px rgba(0,0,0,.6)",

                    },

                }}
              >

                <Typography
                  sx={{
                    fontWeight:
                      600,

                    fontSize:
                      "18px",

                    textAlign:
                      "center",

                  }}
                >

                  {album.heading}

                </Typography>

              </Box>

            )
          )}

        </Box>


        {!loading &&
          albums.length === 0 &&
          !error && (

            <Typography
              sx={{
                textAlign:
                  "center",

                opacity:
                  0.7,

                mt:
                  5,

              }}
            >

              No digital albums found.

            </Typography>

          )}

      </Box>

    );

  }


  /* =======================================================
     PDF VIEWER
  ======================================================= */

  return (

    <Box
      ref={
        containerRef
      }

      sx={{
        position:
          "relative",

        width:
          "100%",

        height:
          "100vh",

        minHeight:
          "100vh",

        background:
          "radial-gradient(circle at center,#171717 0%,#090909 45%,#020202 100%)",

        color:
          "#fff",

        overflow:
          "hidden",

        display:
          "flex",

        flexDirection:
          "column",

      }}
    >


      {/* =================================================
          TOP BAR
      ================================================= */}

      <Box
        sx={{
          height:
            "60px",

          flexShrink:
            0,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          padding:
            "8px 15px",

          borderBottom:
            "1px solid rgba(255,255,255,.08)",

          background:
            "rgba(0,0,0,.78)",

          backdropFilter:
            "blur(16px)",

          zIndex:
            100,

        }}
      >

        <Box
          sx={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              1,

            minWidth:
              0,

          }}
        >

          <Tooltip title="Albums">

            <IconButton
              onClick={
                backToAlbums
              }

              sx={{
                color:
                  "#fff",

                "&:hover":
                  {
                    background:
                      "rgba(255,255,255,.1)",
                  },

              }}
            >

              <ArrowBack />

            </IconButton>

          </Tooltip>


          <Typography
            sx={{
              fontWeight:
                600,

              fontSize:
                {
                  xs:
                    "14px",

                  md:
                    "18px",
                },

              whiteSpace:
                "nowrap",

              overflow:
                "hidden",

              textOverflow:
                "ellipsis",

            }}
          >

            {selectedHeading}

          </Typography>

        </Box>


        <Box
          sx={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              0.3,

          }}
        >

          <Tooltip title="Zoom Out">

            <IconButton
              onClick={
                zoomOut
              }

              sx={{
                color:
                  "#fff",
              }}
            >

              <ZoomOut />

            </IconButton>

          </Tooltip>


          <Typography
            sx={{
              minWidth:
                "45px",

              textAlign:
                "center",

              fontSize:
                "13px",

              opacity:
                0.8,

            }}
          >

            {Math.round(
              zoom * 100
            )}%

          </Typography>


          <Tooltip title="Zoom In">

            <IconButton
              onClick={
                zoomIn
              }

              sx={{
                color:
                  "#fff",
              }}
            >

              <ZoomIn />

            </IconButton>

          </Tooltip>


          <Tooltip
            title={
              isFullscreen
                ? "Exit Fullscreen"
                : "Fullscreen"
            }
          >

            <IconButton
              onClick={
                toggleFullscreen
              }

              sx={{
                color:
                  "#fff",
              }}
            >

              {isFullscreen ? (
                <FullscreenExit />
              ) : (
                <Fullscreen />
              )}

            </IconButton>

          </Tooltip>


          <Tooltip title="Download PDF">

            <IconButton
              onClick={
                handleDownload
              }

              sx={{
                color:
                  "#fff",
              }}
            >

              <Download />

            </IconButton>

          </Tooltip>

        </Box>

      </Box>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <Box
          sx={{
            position:
              "absolute",

            top:
              75,

            left:
              "50%",

            transform:
              "translateX(-50%)",

            width:
              "min(90%,600px)",

            zIndex:
              500,

          }}
        >

          <Alert
            severity="error"
            action={

              <Button
                color="inherit"
                size="small"
                onClick={
                  retry
                }
              >
                Retry
              </Button>

            }
          >

            {error}

          </Alert>

        </Box>

      )}


      {/* =================================================
          BOOK STAGE
      ================================================= */}

      <Box
        sx={{
          flex:
            1,

          position:
            "relative",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          overflow:
            "hidden",

          perspective:
            "2200px",

          background:
            "radial-gradient(circle at center,rgba(255,255,255,.025),transparent 55%)",

        }}
      >


        {/* ===============================================
            AMBIENT BOOK SHADOW
        =============================================== */}

        {!loading &&
          pages.length > 0 && (

            <Box
              sx={{
                position:
                  "absolute",

                width:
                  {
                    xs:
                      "80%",

                    md:
                      "700px",
                  },

                height:
                  "90px",

                bottom:
                  "8%",

                left:
                  "50%",

                transform:
                  "translateX(-50%)",

                background:
                  "rgba(0,0,0,.85)",

                filter:
                  "blur(35px)",

                borderRadius:
                  "50%",

                opacity:
                  0.9,

                pointerEvents:
                  "none",

              }}
            />

          )}


        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (

          <Box
            sx={{
              position:
                "absolute",

              inset:
                0,

              display:
                "flex",

              flexDirection:
                "column",

              alignItems:
                "center",

              justifyContent:
                "center",

              zIndex:
                300,

              background:
                "rgba(0,0,0,.7)",

              backdropFilter:
                "blur(10px)",

            }}
          >

            {/* 3D loading book */}

            <Box
              sx={{
                width:
                  "80px",

                height:
                  "105px",

                position:
                  "relative",

                transform:
                  "perspective(500px) rotateY(-25deg)",

                transformStyle:
                  "preserve-3d",

                mb:
                  3,

                animation:
                  "albumLoading 1.6s ease-in-out infinite",

                "@keyframes albumLoading":
                  {

                    "0%":
                      {
                        transform:
                          "perspective(500px) rotateY(-30deg) rotateZ(-1deg)",
                      },

                    "50%":
                      {
                        transform:
                          "perspective(500px) rotateY(20deg) rotateZ(1deg)",
                      },

                    "100%":
                      {
                        transform:
                          "perspective(500px) rotateY(-30deg) rotateZ(-1deg)",
                      },

                  },

              }}
            >

              <Box
                sx={{
                  position:
                    "absolute",

                  inset:
                    0,

                  background:
                    "linear-gradient(135deg,#292929,#080808)",

                  border:
                    "1px solid rgba(255,255,255,.3)",

                  borderRadius:
                    "3px 8px 8px 3px",

                  boxShadow:
                    "8px 12px 25px rgba(0,0,0,.7)",

                }}
              />

              <Box
                sx={{
                  position:
                    "absolute",

                  inset:
                    0,

                  top:
                    5,

                  left:
                    6,

                  right:
                    8,

                  bottom:
                    5,

                  border:
                    "1px solid rgba(255,255,255,.18)",

                  borderRadius:
                    "2px 6px 6px 2px",

                }}
              />

              <Box
                sx={{
                  position:
                    "absolute",

                  left:
                    8,

                  top:
                    "50%",

                  width:
                    2,

                  height:
                    "90%",

                  transform:
                    "translateY(-50%)",

                  background:
                    "rgba(255,255,255,.25)",

                  boxShadow:
                    "2px 0 4px rgba(0,0,0,.7)",

                }}
              />

            </Box>


            <CircularProgress
              size={32}
            />


            <Typography
              sx={{
                mt:
                  2,

                fontSize:
                  "14px",

                opacity:
                  0.8,

              }}
            >

              {loadingText}

            </Typography>

          </Box>

        )}


        {/* ===============================================
            3D BOOK
        =============================================== */}

        {!loading &&
          pages.length > 0 && (

            <Box
              sx={{
                position:
                  "relative",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                transform:
                  `scale(${zoom})`,

                transformOrigin:
                  "center center",

                transition:
                  "transform .25s ease",

                transformStyle:
                  "preserve-3d",

                zIndex:
                  20,

                /*
                 * Important:
                 * Do not clip react-pageflip's
                 * 3D turning sheet.
                 */
                overflow:
                  "visible",

              }}
            >


              {/* =========================================
                  BOOK BACK / DEPTH
              ========================================= */}

              <Box
                sx={{
                  position:
                    "absolute",

                  width:
                    bookSize.width * 2,

                  height:
                    bookSize.height,

                  borderRadius:
                    "5px",

                  background:
                    "linear-gradient(90deg,#151515,#050505 50%,#151515)",

                  transform:
                    "translateZ(-18px)",

                  boxShadow:
                    "0 30px 80px rgba(0,0,0,.9)",

                  pointerEvents:
                    "none",

                  zIndex:
                    0,

                }}
              />


              {/* =========================================
                  FLIP BOOK
              ========================================= */}

              <Box
                sx={{
                  position:
                    "relative",

                  zIndex:
                    5,

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  overflow:
                    "visible",

                  /*
                   * Keep the page-flip 3D
                   * transform chain intact.
                   */
                  transformStyle:
                    "preserve-3d",

                }}
              >

                <HTMLFlipBook

                  ref={
                    flipBookRef
                  }

                  width={
                    bookSize.width
                  }

                  height={
                    bookSize.height
                  }

                  /*
                   * LANDSCAPE / OPEN BOOK
                   *
                   * Page 1 = LEFT
                   * Page 2 = RIGHT
                   *
                   * This is important.
                   */
                  usePortrait={
                    false
                  }

                  size="fixed"

                  minWidth={
                    280
                  }

                  maxWidth={
                    600
                  }

                  minHeight={
                    390
                  }

                  maxHeight={
                    800
                  }

                  /*
                   * Smooth realistic turning.
                   */
                  flippingTime={
                    1050
                  }

                  drawShadow={
                    true
                  }

                  maxShadowOpacity={
                    0.65
                  }

                  /*
                   * IMPORTANT:
                   *
                   * false allows the first page
                   * to participate in the normal
                   * two-page open-book spread.
                   *
                   * Page 1 -> left
                   * Page 2 -> right
                   */
                  showCover={
                    false
                  }

                  startPage={
                    0
                  }

                  autoSize={
                    false
                  }

                  mobileScrollSupport={
                    true
                  }

                  clickEventForward={
                    true
                  }

                  useMouseEvents={
                    true
                  }

                  swipeDistance={
                    25
                  }

                  showPageCorners={
                    true
                  }

                  disableFlipByClick={
                    false
                  }

                  onFlip={
                    handleFlip
                  }

                  style={{
                    overflow:
                      "visible",

                    margin:
                      "0 auto",

                  }}

                >

                  {pages.map(
                    (
                      image,
                      index
                    ) => (

                      <Box
                        key={
                          `page-${index}`
                        }

                        sx={{
                          width:
                            "100%",

                          height:
                            "100%",

                          position:
                            "relative",

                          overflow:
                            "hidden",

                          background:
                            "#fff",

                          display:
                            "block",

                          boxSizing:
                            "border-box",

                          /*
                           * Prevent the
                           * bottom/corner
                           * rendering glitch
                           * during rotation.
                           */
                          backfaceVisibility:
                            "hidden",

                          WebkitBackfaceVisibility:
                            "hidden",

                          transformStyle:
                            "preserve-3d",

                          isolation:
                            "isolate",

                          boxShadow:
                            "inset 0 0 18px rgba(0,0,0,.08)",

                        }}
                      >

                        <Box
                          component="img"

                          src={
                            image
                          }

                          alt={
                            `Page ${
                              index + 1
                            }`
                          }

                          draggable={
                            false
                          }

                          sx={{
                            width:
                              "100%",

                            height:
                              "100%",

                            /*
                             * CONTAIN is important.
                             *
                             * Your PDF page will
                             * remain completely visible.
                             */
                            objectFit:
                              "contain",

                            objectPosition:
                              "center",

                            display:
                              "block",

                            userSelect:
                              "none",

                            pointerEvents:
                              "none",

                            backfaceVisibility:
                              "hidden",

                            WebkitBackfaceVisibility:
                              "hidden",

                          }}

                        />

                      </Box>

                    )
                  )}

                </HTMLFlipBook>

              </Box>

            </Box>

          )}


        {/* ===============================================
            EMPTY
        =============================================== */}

        {!loading &&
          !error &&
          pages.length === 0 && (

            <Typography
              sx={{
                opacity:
                  0.7,
              }}
            >

              Preparing album...

            </Typography>

          )}

      </Box>


      {/* =================================================
          BOTTOM CONTROLS
      ================================================= */}

      {!loading &&
        pages.length > 0 && (

          <Box
            sx={{
              position:
                "absolute",

              bottom:
                "18px",

              left:
                "50%",

              transform:
                "translateX(-50%)",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                1,

              padding:
                "6px 12px",

              borderRadius:
                "40px",

              background:
                "rgba(0,0,0,.78)",

              border:
                "1px solid rgba(255,255,255,.15)",

              boxShadow:
                "0 10px 30px rgba(0,0,0,.5)",

              backdropFilter:
                "blur(15px)",

              zIndex:
                200,

            }}
          >

            <Tooltip title="Previous Page">

              <span>

                <IconButton
                  onClick={
                    previousPage
                  }

                  disabled={
                    currentPage <=
                    0
                  }

                  sx={{
                    color:
                      "#fff",

                    "&:disabled":
                      {
                        color:
                          "rgba(255,255,255,.2)",
                      },

                  }}
                >

                  <ChevronLeft />

                </IconButton>

              </span>

            </Tooltip>


            <Typography
              sx={{
                minWidth:
                  "95px",

                textAlign:
                  "center",

                fontSize:
                  "13px",

                fontWeight:
                  500,

              }}
            >

              Page{" "}
              {currentPage + 1}
              {" / "}
              {totalPages}

            </Typography>


            <Tooltip title="Next Page">

              <span>

                <IconButton
                  onClick={
                    nextPage
                  }

                  disabled={
                    currentPage >=
                    totalPages - 1
                  }

                  sx={{
                    color:
                      "#fff",

                    "&:disabled":
                      {
                        color:
                          "rgba(255,255,255,.2)",
                      },

                  }}
                >

                  <ChevronRight />

                </IconButton>

              </span>

            </Tooltip>

          </Box>

        )}

    </Box>

  );

};


export default LoginPdf2;