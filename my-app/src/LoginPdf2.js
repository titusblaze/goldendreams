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
  Refresh,
  ArrowBack,
} from "@mui/icons-material";

import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

import "./LoginPdf2.css";

/* =========================================================
   API CONFIG
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

  const [albums, setAlbums] = useState([]);

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
     REFS
  ======================================================= */

  const flipBookRef =
    useRef(null);

  const containerRef =
    useRef(null);

  const abortControllerRef =
    useRef(null);

  const pdfBlobCacheRef =
    useRef(new Map());

  const pdfBytesCacheRef =
    useRef(new Map());

  const renderedPageCacheRef =
    useRef(new Map());


  /* =======================================================
     LOAD ALBUM LIST
  ======================================================= */

  useEffect(() => {

    let cancelled = false;

    const loadAlbums = async () => {

      try {

        setLoading(true);
        setLoadingText("Loading albums...");
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
                    item?.heading2 || "Digital Album",

                  pdf:
                    item?.pdf2 || "",
                }))
                .filter(
                  (item) => item.pdf
                )
            : [];

        setAlbums(userAlbums);

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

        }

      }

    };

    loadAlbums();

    return () => {
      cancelled = true;
    };

  }, [username, retryKey]);


  /* =======================================================
     SELECT ALBUM
  ======================================================= */

  const selectAlbum = useCallback(
    (album) => {

      if (!album?.pdf) return;

      setSelectedPDF(album.pdf);
      setSelectedHeading(
        album.heading || "Digital Album"
      );

      setPdf(null);
      setPages([]);
      setTotalPages(0);
      setCurrentPage(0);
      setZoom(1);
      setError("");

    },
    []
  );


  /* =======================================================
     DOWNLOAD PDF FROM RENDER
  ======================================================= */

  const downloadPDF = useCallback(
    async (albumKey) => {

      if (!albumKey) {
        throw new Error(
          "PDF link is missing."
        );
      }


      /* ---------------------------------------------------
         CACHE CHECK
      --------------------------------------------------- */

      if (
        pdfBytesCacheRef.current.has(
          albumKey
        )
      ) {

        console.log(
          "PDF found in byte cache."
        );

        return {
          bytes:
            pdfBytesCacheRef.current.get(
              albumKey
            ),

          blob:
            pdfBlobCacheRef.current.get(
              albumKey
            ),
        };

      }


      /* ---------------------------------------------------
         ABORT PREVIOUS REQUEST
      --------------------------------------------------- */

      if (
        abortControllerRef.current
      ) {

        abortControllerRef.current.abort();

      }

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;


      /* ---------------------------------------------------
         PROXY URL
      --------------------------------------------------- */

      const proxyUrl =
        `${PDF_PROXY}?url=${encodeURIComponent(
          albumKey
        )}`;


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

      console.log(
        "PDF Proxy URL:",
        proxyUrl
      );

      console.log(
        "================================="
      );


      setLoadingText(
        "Connecting to PDF server..."
      );


      /* ---------------------------------------------------
         FETCH PDF
      --------------------------------------------------- */

      const response =
        await fetch(
          proxyUrl,
          {
            method: "GET",

            signal:
              controller.signal,

            cache: "no-store",

            headers: {
              Accept:
                "application/pdf",
            },
          }
        );


      console.log(
        "PDF HTTP Status:",
        response.status
      );


      /* ---------------------------------------------------
         HTTP ERROR
      --------------------------------------------------- */

      if (!response.ok) {

        let serverMessage = "";

        try {

          const text =
            await response.text();

          serverMessage =
            text.substring(0, 500);

        } catch (_) {}

        throw new Error(
          `PDF Server Error: ${response.status}${
            serverMessage
              ? ` - ${serverMessage}`
              : ""
          }`
        );

      }


      /* ---------------------------------------------------
         CONTENT TYPE
      --------------------------------------------------- */

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
          .includes("application/pdf")
      ) {

        throw new Error(
          `Invalid PDF response. Content-Type: ${contentType}`
        );

      }


      /* ---------------------------------------------------
         CONTENT LENGTH
      --------------------------------------------------- */

      console.log(
        "PDF Content-Length:",
        response.headers.get(
          "content-length"
        )
      );


      console.log(
        "PDF Transfer-Encoding:",
        response.headers.get(
          "transfer-encoding"
        )
      );


      setLoadingText(
        "Downloading PDF..."
      );


      /* ===================================================
         IMPORTANT FIX
         
         Read response ONCE.
         Do NOT do:
         
         response.arrayBuffer()
         -> Blob
         -> blob.arrayBuffer()
         
         because this can create unnecessary
         memory copies for an 80 MB PDF.
      =================================================== */

      const arrayBuffer =
        await response.arrayBuffer();


      console.log(
        "PDF ArrayBuffer bytes:",
        arrayBuffer.byteLength
      );


      /* ---------------------------------------------------
         EMPTY PDF CHECK
      --------------------------------------------------- */

      if (
        !arrayBuffer ||
        arrayBuffer.byteLength === 0
      ) {

        throw new Error(
          "Empty PDF received from PDF server."
        );

      }


      /* ---------------------------------------------------
         SIZE
      --------------------------------------------------- */

      const sizeMB =
        (
          arrayBuffer.byteLength /
          1024 /
          1024
        ).toFixed(2);


      console.log(
        `PDF received: ${sizeMB} MB`
      );


      /* ---------------------------------------------------
         BASIC PDF HEADER CHECK
      --------------------------------------------------- */

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


      console.log(
        "PDF Header:",
        header
      );


      if (
        header !== "%PDF-"
      ) {

        throw new Error(
          "The server response is not a valid PDF file."
        );

      }


      /* ---------------------------------------------------
         CREATE BYTES
      --------------------------------------------------- */

      const pdfBytes =
        new Uint8Array(
          arrayBuffer
        );


      /* ---------------------------------------------------
         CACHE BYTES
      --------------------------------------------------- */

      pdfBytesCacheRef.current.set(
        albumKey,
        pdfBytes
      );


      /* ---------------------------------------------------
         CREATE BLOB ONLY ONCE
      --------------------------------------------------- */

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


      console.log(
        `Sending PDF to PDF.js: ${sizeMB} MB`
      );


      return {
        bytes: pdfBytes,
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

    const loadPDF = async () => {

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


        /* -------------------------------------------------
           DOWNLOAD
        ------------------------------------------------- */

        const result =
          await downloadPDF(
            selectedPDF
          );


        if (cancelled) return;


        const pdfBytes =
          result.bytes;


        /* -------------------------------------------------
           PDF.JS
        ------------------------------------------------- */

        setLoadingText(
          "Opening digital album..."
        );


        console.log(
          "Loading PDF with PDF.js..."
        );


        const loadingTask =
          pdfjsLib.getDocument({
            data: pdfBytes,
          });


        const loadedPdf =
          await loadingTask.promise;


        if (cancelled) {

          try {
            await loadedPdf.destroy();
          } catch (_) {}

          return;

        }


        console.log(
          "PDF loaded successfully."
        );

        console.log(
          "Total pages:",
          loadedPdf.numPages
        );


        setPdf(
          loadedPdf
        );

        setTotalPages(
          loadedPdf.numPages
        );


        /* -------------------------------------------------
           RENDER PAGES
        ------------------------------------------------- */

        const renderedPages = [];


        for (
          let pageNumber = 1;
          pageNumber <=
          loadedPdf.numPages;
          pageNumber++
        ) {

          if (cancelled) {
            break;
          }


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


          /* ---------------------------------------------
             SCALE
          --------------------------------------------- */

          const baseScale =
            1.25 * zoom;


          const viewport =
            page.getViewport({
              scale: baseScale,
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
                alpha: false,
              }
            );


          canvas.width =
            Math.floor(
              viewport.width * dpr
            );

          canvas.height =
            Math.floor(
              viewport.height * dpr
            );


          canvas.style.width =
            `${viewport.width}px`;

          canvas.style.height =
            `${viewport.height}px`;


          await page.render({
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
          }).promise;


          /* ---------------------------------------------
             JPEG PAGE IMAGE
          --------------------------------------------- */

          const image =
            canvas.toDataURL(
              "image/jpeg",
              0.82
            );


          renderedPageCacheRef.current.set(
            cacheKey,
            image
          );


          renderedPages.push(
            image
          );


          /* ---------------------------------------------
             RELEASE CANVAS
          --------------------------------------------- */

          canvas.width = 1;
          canvas.height = 1;


          /* ---------------------------------------------
             ALLOW BROWSER TO BREATHE
          --------------------------------------------- */

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

        if (
          err?.name ===
          "AbortError"
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

    };

  }, [
    selectedPDF,
    downloadPDF,
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
     PREVIOUS PAGE
  ======================================================= */

  const previousPage =
    useCallback(() => {

      const book =
        flipBookRef.current?.pageFlip?.();

      if (!book) return;

      try {

        book.flipPrev();

      } catch (_) {}

    }, []);


  /* =======================================================
     NEXT PAGE
  ======================================================= */

  const nextPage =
    useCallback(() => {

      const book =
        flipBookRef.current?.pageFlip?.();

      if (!book) return;

      try {

        book.flipNext();

      } catch (_) {}

    }, []);


  /* =======================================================
     ZOOM IN
  ======================================================= */

  const zoomIn =
    useCallback(() => {

      setZoom(
        (value) =>
          Math.min(
            2,
            Number(
              (
                value + 0.1
              ).toFixed(1)
            )
          )
      );

    }, []);


  /* =======================================================
     ZOOM OUT
  ======================================================= */

  const zoomOut =
    useCallback(() => {

      setZoom(
        (value) =>
          Math.max(
            0.7,
            Number(
              (
                value - 0.1
              ).toFixed(1)
            )
          )
      );

    }, []);


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const toggleFullscreen =
    useCallback(async () => {

      try {

        if (
          !document.fullscreenElement
        ) {

          await containerRef.current?.requestFullscreen();

          setIsFullscreen(true);

        } else {

          await document.exitFullscreen();

          setIsFullscreen(false);

        }

      } catch (err) {

        console.error(
          "Fullscreen error:",
          err
        );

      }

    }, []);


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
     DOWNLOAD ORIGINAL PDF
  ======================================================= */

  const handleDownload =
    useCallback(async () => {

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

        link.href = url;

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

    }, [
      selectedPDF,
      selectedHeading,
      downloadPDF,
    ]);


  /* =======================================================
     RETRY
  ======================================================= */

  const retry =
    useCallback(() => {

      setError("");

      setRetryKey(
        (value) =>
          value + 1
      );

    }, []);


  /* =======================================================
     KEYBOARD CONTROLS
  ======================================================= */

  useEffect(() => {

    const handleKeyDown =
      (event) => {

        if (!selectedPDF) return;


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
          event.key === "+"
          ||
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
     BOOK DIMENSIONS
  ======================================================= */

  const getBookSize =
    () => {

      const width =
        window.innerWidth;

      if (width <= 600) {

        return {
          width: 320,
          height: 450,
        };

      }

      if (width <= 900) {

        return {
          width: 400,
          height: 560,
        };

      }

      return {
        width: 500,
        height: 700,
      };

    };


  const [
    bookSize,
    setBookSize,
  ] = useState(
    getBookSize()
  );


  useEffect(() => {

    const resize =
      () => {

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
     ALBUM LIST
  ======================================================= */

  if (!selectedPDF) {

    return (

      <Box
        sx={{
          minHeight:
            "100vh",

          background:
            "linear-gradient(135deg,#050505,#111,#050505)",

          color:
            "#fff",

          padding:
            {
              xs: "25px 15px",
              md: "40px",
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

            mb: 4,

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

              gap: 2,
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
                  onClick={retry}
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
                    "linear-gradient(145deg,#151515,#080808)",

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
                        "0 10px 30px rgba(0,0,0,.5)",
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
      ref={containerRef}

      sx={{
        position:
          "relative",

        width:
          "100%",

        minHeight:
          "100vh",

        background:
          "radial-gradient(circle at center,#181818 0%,#050505 75%)",

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
          minHeight:
            "60px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            1,

          padding:
            "8px 15px",

          borderBottom:
            "1px solid rgba(255,255,255,.08)",

          background:
            "rgba(0,0,0,.7)",

          backdropFilter:
            "blur(10px)",

          zIndex:
            20,
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
              onClick={() => {

                setSelectedPDF("");

                setPages([]);

                setPdf(null);

                setError("");

              }}

              sx={{
                color:
                  "#fff",
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
              0.5,
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
                "50px",

              textAlign:
                "center",

              fontSize:
                "14px",
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
              50,
          }}
        >

          <Alert
            severity="error"
            action={

              <Button
                color="inherit"
                size="small"
                onClick={() => {

                  setError("");

                  setSelectedPDF(
                    (value) =>
                      value
                  );

                }}
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
          VIEWER
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

          padding:
            {
              xs:
                "15px 5px 80px",

              md:
                "20px 20px 80px",
            },

          overflow:
            "auto",
        }}
      >


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
                10,

              background:
                "rgba(0,0,0,.5)",

              backdropFilter:
                "blur(5px)",
            }}
          >

            <CircularProgress
              size={45}
            />

            <Typography
              sx={{
                mt:
                  2,

                fontSize:
                  "14px",

                opacity:
                  0.85,
              }}
            >
              {loadingText}
            </Typography>

          </Box>

        )}


        {/* ===============================================
            BOOK
        =============================================== */}

        {!loading &&
          pages.length > 0 && (

            <Box
              sx={{
                transform:
                  `scale(${zoom})`,

                transformOrigin:
                  "center center",

                transition:
                  "transform .2s ease",

                display:
                  "flex",

                justifyContent:
                  "center",

                alignItems:
                  "center",
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

                size="fixed"

                minWidth={
                  280
                }

                maxWidth={
                  900
                }

                minHeight={
                  380
                }

                maxHeight={
                  1200
                }

                drawShadow={
                  true
                }

                flippingTime={
                  650
                }

                usePortrait={
                  true
                }

                startPage={
                  0
                }

                autoSize={
                  true
                }

                maxShadowOpacity={
                  0.5
                }

                showCover={
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
                  30
                }

                onFlip={
                  handleFlip
                }
              >

                {pages.map(
                  (
                    image,
                    index
                  ) => (

                    <div
                      key={
                        `page-${index}`
                      }

                      style={{
                        width:
                          "100%",

                        height:
                          "100%",

                        background:
                          "#fff",

                        overflow:
                          "hidden",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",
                      }}
                    >

                      <img
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

                        style={{
                          width:
                            "100%",

                          height:
                            "100%",

                          objectFit:
                            "contain",

                          display:
                            "block",

                          userSelect:
                            "none",
                        }}
                      />

                    </div>

                  )
                )}

              </HTMLFlipBook>

            </Box>

          )}


        {/* ===============================================
            EMPTY STATE
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
                "15px",

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
                "30px",

              background:
                "rgba(0,0,0,.75)",

              border:
                "1px solid rgba(255,255,255,.12)",

              backdropFilter:
                "blur(10px)",

              zIndex:
                30,
            }}
          >

            <Tooltip title="Previous Page">

              <span>

                <IconButton
                  onClick={
                    previousPage
                  }

                  disabled={
                    currentPage <= 0
                  }

                  sx={{
                    color:
                      "#fff",
                  }}
                >

                  <ChevronLeft />

                </IconButton>

              </span>

            </Tooltip>


            <Typography
              sx={{
                minWidth:
                  "90px",

                textAlign:
                  "center",

                fontSize:
                  "13px",
              }}
            >

              Page{" "}
              {currentPage + 1}{" "}
              /{" "}
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