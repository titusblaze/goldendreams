import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";

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


/* =========================================================
   GOOGLE APPS SCRIPT API
========================================================= */

const DATA_API =
  "https://script.google.com/macros/s/AKfycbxNG3fuMW_DivRzBfhcPdwcJ3MTBgHOic1AhkWiMNhsXDq56a77Rg7UP4PpjeVQ116tbA/exec";


/* =========================================================
   PDF.JS WORKER
========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;


/* =========================================================
   FLIP PAGE
========================================================= */

const FlipPage = React.forwardRef(
  ({ image, pageNumber }, ref) => {

    return (
      <div
        ref={ref}
        className="pdf-book-page"
      >

        <img
          src={image}
          alt={`PDF page ${pageNumber}`}
          draggable={false}
        />

        <div className="page-number">
          {pageNumber}
        </div>

      </div>
    );
  }
);


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LoginPdf() {

  const bookRef = useRef(null);

  const viewerRef = useRef(null);


  /* =======================================================
     ALBUM DATA
  ======================================================= */

  const [data, setData] =
    useState([]);


  const [currentAlbum, setCurrentAlbum] =
    useState(0);


  /* =======================================================
     PDF PAGES
  ======================================================= */

  const [pages, setPages] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [loadingText, setLoadingText] =
    useState("Loading albums...");


  const [currentPage, setCurrentPage] =
    useState(0);


  const [zoom, setZoom] =
    useState(1);


  const [fullscreen, setFullscreen] =
    useState(false);


  /* =======================================================
     LOGGED-IN USERNAME
     
     SAME AS YOUR LOGINPAGE CODE
  ======================================================= */

  const username =
    localStorage.getItem("username");


  /* =======================================================
     FETCH API DATA
     
     SAME FILTERING METHOD AS YOUR LOGINPAGE
  ======================================================= */

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        setLoadingText(
          "Loading your albums..."
        );


        const res =
          await fetch(DATA_API);


        const jsonData =
          await res.json();


        console.log(
          "API DATA:",
          jsonData
        );


        /* -----------------------------------------------
           FILTER BY LOGGED-IN USERNAME

           SAME AS YOUR LOGINPAGE:
           
           item.UserName === username
        ------------------------------------------------ */

        const filtered =
          jsonData.filter(
            item =>
              item.UserName ===
              username
          );


        console.log(
          "USER ALBUM DATA:",
          filtered
        );


        /*
         * Create only the required array:
         *
         * heading
         * pdf
         */

        const albumArray =
          filtered
            .map(item => ({

              heading:
                item.heading,

              pdf:
                item.pdf,

            }))
            .filter(item =>
              item.heading &&
              item.pdf
            );


        console.log(
          "ALBUM ARRAY:",
          albumArray
        );


        setData(
          albumArray
        );


        /*
         * Automatically select
         * first album
         */

        setCurrentAlbum(0);


      } catch (err) {

        console.error(
          "Error fetching API:",
          err
        );


        setData([]);


      } finally {

        /*
         * Do not keep the loading
         * screen here forever.
         *
         * PDF loading will handle
         * the next loading stage.
         */

        setLoading(false);

      }

    };


    fetchData();

  }, [username]);


  /* =======================================================
     SELECTED PDF URL
  ======================================================= */

  const selectedPDF =
    data[currentAlbum]?.pdf || "";


  /* =======================================================
     SELECTED HEADING
  ======================================================= */

  const selectedHeading =
    data[currentAlbum]?.heading ||
    "Digital Album";


  /* =======================================================
     LOAD SELECTED PDF
  ======================================================= */

  useEffect(() => {

    if (!selectedPDF) {

      setPages([]);

      return;

    }


    let cancelled = false;


    const loadPDF = async () => {

      try {

        setLoading(true);

        setPages([]);

        setCurrentPage(0);

        setZoom(1);


        setLoadingText(
          `Opening ${selectedHeading}...`
        );


        console.log(
          "PDF URL:",
          selectedPDF
        );


        const loadingTask =
          pdfjsLib.getDocument({

            url:
              selectedPDF,

            withCredentials:
              false,

          });


        const pdf =
          await loadingTask.promise;


        const generatedPages = [];


        for (
          let pageNumber = 1;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {

          if (cancelled)
            return;


          setLoadingText(
            `Preparing page ${pageNumber} of ${pdf.numPages}`
          );


          const page =
            await pdf.getPage(
              pageNumber
            );


          /*
           * High quality rendering
           */

          const scale = 2;


          const viewport =
            page.getViewport({
              scale,
            });


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
            viewport.width;


          canvas.height =
            viewport.height;


          await page.render({

            canvasContext:
              context,

            viewport,

          }).promise;


          const image =
            canvas.toDataURL(
              "image/jpeg",
              0.94
            );


          generatedPages.push(
            image
          );


          /*
           * Progressive page loading
           */

          setPages([
            ...generatedPages,
          ]);

        }


        if (!cancelled) {

          setLoading(false);

          setLoadingText("");

        }

      } catch (error) {

        console.error(
          "PDF loading error:",
          error
        );


        if (!cancelled) {

          setPages([]);

          setLoading(false);

          setLoadingText(
            "Unable to load PDF"
          );

        }

      }

    };


    loadPDF();


    return () => {

      cancelled = true;

    };

  }, [
    selectedPDF,
    selectedHeading,
  ]);


  /* =======================================================
     CHANGE ALBUM
  ======================================================= */

  const changeAlbum = (index) => {

    if (
      index === currentAlbum
    ) {

      return;

    }


    setCurrentAlbum(index);

  };


  /* =======================================================
     PAGE FLIP
  ======================================================= */

  const handleFlip =
    useCallback((event) => {

      setCurrentPage(
        event.data
      );

    }, []);


  /* =======================================================
     NEXT
  ======================================================= */

  const nextPage = () => {

    if (!bookRef.current)
      return;


    bookRef.current
      .pageFlip()
      .flipNext();

  };


  /* =======================================================
     PREVIOUS
  ======================================================= */

  const previousPage = () => {

    if (!bookRef.current)
      return;


    bookRef.current
      .pageFlip()
      .flipPrev();

  };


  /* =======================================================
     ZOOM
  ======================================================= */

  const zoomIn = () => {

    setZoom(value =>
      Math.min(
        value + 0.1,
        2
      )
    );

  };


  const zoomOut = () => {

    setZoom(value =>
      Math.max(
        value - 0.1,
        0.7
      )
    );

  };


  const resetZoom = () => {

    setZoom(1);

  };


  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const toggleFullscreen =
    async () => {

      try {

        if (
          !document.fullscreenElement
        ) {

          await viewerRef.current
            ?.requestFullscreen();

        } else {

          await document
            .exitFullscreen();

        }

      } catch (error) {

        console.error(
          "Fullscreen error:",
          error
        );

      }

    };


  /* =======================================================
     FULLSCREEN CHANGE
  ======================================================= */

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


  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadPDF = () => {

    if (!selectedPDF)
      return;


    window.open(
      selectedPDF,
      "_blank"
    );

  };


  /* =======================================================
     KEYBOARD
  ======================================================= */

  useEffect(() => {

    const handleKeyboard =
      (event) => {

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


  /* =======================================================
     PAGE DIMENSIONS
  ======================================================= */

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


  /* =======================================================
     NO USER DATA
  ======================================================= */

  if (
    !loading &&
    data.length === 0
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
            No albums found
          </Typography>

          <Typography
            variant="body2"
          >
            No PDF albums are available
            for this user.
          </Typography>

        </Box>


        <style>
          {`

          .pdf-viewer {

            width: 100%;

            height: 100vh;

            background: #05070b;

            color: white;

            display: flex;

            align-items: center;

            justify-content: center;

          }


          .no-album {

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 12px;

            color:
              rgba(255,255,255,0.65);

          }


          .no-album svg {

            font-size: 60px;

            color: #00c6ff;

          }

          `}
        </style>

      </Box>

    );

  }


  /* =======================================================
     MAIN UI
  ======================================================= */

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

              {data.length}
              {" "}
              {data.length === 1
                ? "Digital Album"
                : "Digital Albums"}

            </Typography>

          </Box>

        </Stack>


        {/* CENTER PAGE */}

        {!loading &&
          pages.length > 0 && (

            <Box
              className="top-page-counter"
            >

              {currentPage + 1}

              <span>
                /
              </span>

              {pages.length}

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
          ALBUM HEADING TABS
      ================================================= */}

      {data.length > 1 && (

        <Box
          className="album-tabs"
        >

          {data.map(
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
          BOOK AREA
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


              {/* LEFT */}

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

                  <Box
                    className="page-line line-1"
                  />

                  <Box
                    className="page-line line-2"
                  />

                  <Box
                    className="page-line line-3"
                  />

                  <Box
                    className="page-line line-4"
                  />

                </Box>

              </Box>


              {/* RIGHT */}

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

                  <Box
                    className="page-line line-1"
                  />

                  <Box
                    className="page-line line-2"
                  />

                  <Box
                    className="page-line line-3"
                  />

                  <Box
                    className="page-line line-4"
                  />

                </Box>

              </Box>


              {/* SPINE */}

              <Box
                className="book-spine"
              >

                <Box
                  className="spine-light"
                />

              </Box>


              {/* TURNING PAGE */}

              <Box
                className="turning-page"
              >

                <Box
                  className="turning-page-front"
                >

                  <Box
                    className="page-line line-1"
                  />

                  <Box
                    className="page-line line-2"
                  />

                  <Box
                    className="page-line line-3"
                  />

                  <Box
                    className="page-line line-4"
                  />

                </Box>

                <Box
                  className="turning-page-back"
                />

              </Box>

            </Box>


            {/* LOADING DOTS */}

            <Box
              className="loading-dots"
            >

              <span
                className="loader-dot blue-dot"
              />

              <span
                className="loader-dot cyan-dot"
              />

              <span
                className="loader-dot purple-dot"
              />

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
                  (
                    image,
                    index
                  ) => (

                    <FlipPage
                      key={index}
                      image={image}
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


              {/* ZOOM % */}

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
                      pages.length - 1
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


      {/* =================================================
          CSS
      ================================================= */}

      <style>
        {`

        * {
          box-sizing: border-box;
        }


        /* ================================================
           MAIN VIEWER
        ================================================ */

        .pdf-viewer {

          width: 100%;

          height: 100vh;

          min-height: 100vh;

          overflow: hidden;

          background: #05070b;

          color: white;

          display: flex;

          flex-direction: column;

        }


        /* ================================================
           TOP BAR
        ================================================ */

        .pdf-topbar {

          height: 64px;

          min-height: 64px;

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 0 18px;

          background:
            rgba(4,8,15,0.96);

          border-bottom:
            1px solid
            rgba(255,255,255,0.08);

          z-index: 100;

        }


        .book-icon {

          width: 38px;

          height: 38px;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #1976d2,
              #00c6ff
            );

          box-shadow:
            0 5px 20px
            rgba(0,150,255,0.3);

        }


        .book-icon svg {

          font-size: 21px;

        }


        .album-title {

          font-size: 15px !important;

          font-weight: 700 !important;

          line-height: 1.1 !important;

          max-width: 45vw;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

        }


        .album-subtitle {

          font-size: 10px !important;

          color:
            rgba(255,255,255,0.45);

          margin-top: 2px;

        }


        .top-page-counter {

          position: absolute;

          left: 50%;

          transform:
            translateX(-50%);

          font-size: 13px;

          font-weight: 600;

          padding: 6px 15px;

          border-radius: 30px;

          background:
            rgba(255,255,255,0.06);

          border:
            1px solid
            rgba(255,255,255,0.1);

        }


        .top-page-counter span {

          margin: 0 6px;

          color:
            rgba(255,255,255,0.3);

        }


        .top-button {

          color: white !important;

          width: 40px;

          height: 40px;

        }


        .top-button:hover {

          background:
            rgba(0,198,255,0.12)
            !important;

        }


        /* ================================================
           ALBUM TABS
        ================================================ */

        .album-tabs {

          width: 100%;

          min-height: 48px;

          display: flex;

          align-items: center;

          gap: 8px;

          padding:
            6px 14px;

          overflow-x: auto;

          background:
            rgba(6,10,18,0.98);

          border-bottom:
            1px solid
            rgba(255,255,255,0.08);

          scrollbar-width: thin;

          z-index: 90;

        }


        .album-tabs::-webkit-scrollbar {

          height: 3px;

        }


        .album-tabs::-webkit-scrollbar-thumb {

          background:
            rgba(0,198,255,0.5);

          border-radius: 20px;

        }


        .album-tab {

          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 7px;

          border:
            1px solid
            rgba(255,255,255,0.1);

          border-radius: 20px;

          padding:
            6px 13px;

          min-height: 34px;

          max-width: 280px;

          background:
            rgba(255,255,255,0.04);

          color:
            rgba(255,255,255,0.6);

          cursor: pointer;

          transition:
            all 0.25s ease;

          font-family: inherit;

        }


        .album-tab:hover {

          color: white;

          background:
            rgba(0,198,255,0.1);

          border-color:
            rgba(0,198,255,0.4);

        }


        .album-tab.active {

          color: white;

          background:
            linear-gradient(
              135deg,
              #1976d2,
              #00a8ff
            );

          border-color:
            rgba(0,198,255,0.8);

          box-shadow:
            0 5px 18px
            rgba(0,150,255,0.25);

        }


        .album-number {

          width: 20px;

          height: 20px;

          min-width: 20px;

          border-radius: 50%;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 10px;

          font-weight: 700;

          background:
            rgba(255,255,255,0.12);

        }


        .album-heading {

          font-size: 12px;

          font-weight: 600;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

        }


        /* ================================================
           BOOK STAGE
        ================================================ */

        .pdf-stage {

          flex: 1;

          width: 100%;

          min-height: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: auto;

          position: relative;

          background: #05070b;

          padding: 10px;

        }


        /* ================================================
           BOOK WRAPPER
        ================================================ */

        .book-wrapper {

          display: flex;

          align-items: center;

          justify-content: center;

          transform-origin:
            center center;

          transition:
            transform
            0.25s ease;

          background:
            transparent;

        }


        /* ================================================
           FLIP BOOK
        ================================================ */

        .pdf-book {

          background:
            transparent !important;

          margin:
            0 auto;

        }


        .pdf-book .stf__parent {

          background:
            transparent !important;

        }


        /* ================================================
           PDF PAGE
        ================================================ */

        .pdf-book-page {

          width: 100%;

          height: 100%;

          position: relative;

          overflow: hidden;

          background: white;

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0 0 12px
            rgba(0,0,0,0.35);

        }


        .pdf-book-page img {

          width: 100%;

          height: 100%;

          object-fit: contain;

          display: block;

          user-select: none;

          pointer-events: none;

          -webkit-user-drag: none;

        }


        /* ================================================
           PAGE NUMBER
        ================================================ */

        .page-number {

          position: absolute;

          right: 10px;

          bottom: 8px;

          font-size: 10px;

          padding: 3px 8px;

          border-radius: 15px;

          background:
            rgba(0,0,0,0.5);

          color: white;

          opacity: 0.65;

          backdrop-filter:
            blur(5px);

        }


        /* ================================================
           LOADING
        ================================================ */

        .pdf-loading {

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 15px;

        }


        .loading-text {

          color:
            rgba(255,255,255,0.7) !important;

          font-size:
            13px !important;

          text-align: center;

        }


        .loading-small {

          font-size:
            11px !important;

          color:
            rgba(255,255,255,0.35) !important;

        }


        /* ================================================
           LOADING BOOK ANIMATION
        ================================================ */

        .book-loader {

          position: relative;

          width: 150px;

          height: 105px;

          perspective: 700px;

        }


        .book-glow {

          position: absolute;

          left: 50%;

          top: 50%;

          width: 150px;

          height: 80px;

          transform:
            translate(-50%, -50%);

          background:
            radial-gradient(
              ellipse,
              rgba(0,198,255,0.18),
              transparent 70%
            );

          filter: blur(15px);

        }


        .book-ground-shadow {

          position: absolute;

          left: 50%;

          bottom: 4px;

          width: 125px;

          height: 15px;

          transform:
            translateX(-50%);

          border-radius: 50%;

          background:
            rgba(0,0,0,0.65);

          filter: blur(7px);

        }


        .book-left,
        .book-right {

          position: absolute;

          top: 15px;

          width: 65px;

          height: 78px;

          transform-style: preserve-3d;

        }


        .book-left {

          left: 10px;

        }


        .book-right {

          right: 10px;

        }


        .book-page {

          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #e9edf3
            );

          border-radius:
            5px 2px 2px 5px;

          box-shadow:
            0 3px 12px
            rgba(0,0,0,0.3);

        }


        .right-page {

          border-radius:
            2px 5px 5px 2px;

        }


        .page-stack {

          position: absolute;

          inset: 2px;

          border-radius: 4px;

          background:
            #d6dbe2;

          opacity: 0.7;

        }


        .left-stack-1 {

          transform:
            translateX(-4px);

        }


        .left-stack-2 {

          transform:
            translateX(-2px);

        }


        .right-stack-1 {

          transform:
            translateX(4px);

        }


        .right-stack-2 {

          transform:
            translateX(2px);

        }


        .page-line {

          position: absolute;

          left: 12px;

          right: 12px;

          height: 4px;

          border-radius: 5px;

          background:
            rgba(0,0,0,0.12);

        }


        .line-1 {

          top: 20px;

        }


        .line-2 {

          top: 33px;

        }


        .line-3 {

          top: 46px;

        }


        .line-4 {

          top: 59px;

        }


        .book-spine {

          position: absolute;

          left: 50%;

          top: 15px;

          width: 6px;

          height: 78px;

          transform:
            translateX(-50%);

          z-index: 10;

          background:
            linear-gradient(
              90deg,
              #111923,
              #607080,
              #111923
            );

          border-radius: 4px;

        }


        .spine-light {

          width: 1px;

          height: 100%;

          margin: auto;

          background:
            rgba(255,255,255,0.55);

        }


        .turning-page {

          position: absolute;

          left: 50%;

          top: 15px;

          width: 65px;

          height: 78px;

          transform-origin:
            left center;

          transform-style:
            preserve-3d;

          animation:
            pageTurn 1.8s
            ease-in-out
            infinite;

          z-index: 20;

        }


        .turning-page-front,
        .turning-page-back {

          position: absolute;

          inset: 0;

          backface-visibility:
            hidden;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #e8edf2
            );

          border-radius:
            2px 5px 5px 2px;

        }


        .turning-page-back {

          transform:
            rotateY(180deg);

        }


        @keyframes pageTurn {

          0% {

            transform:
              rotateY(0deg);

          }

          45% {

            transform:
              rotateY(-155deg);

          }

          65% {

            transform:
              rotateY(-175deg);

          }

          100% {

            transform:
              rotateY(-180deg);

          }

        }


        .loading-dots {

          display: flex;

          align-items: center;

          gap: 7px;

          height: 14px;

        }


        .loader-dot {

          width: 7px;

          height: 7px;

          border-radius: 50%;

          animation:
            loadingDot
            1.2s
            ease-in-out
            infinite;

        }


        .blue-dot {

          background:
            #1976d2;

          animation-delay:
            0s;

        }


        .cyan-dot {

          background:
            #00c6ff;

          animation-delay:
            0.15s;

        }


        .purple-dot {

          background:
            #9c27b0;

          animation-delay:
            0.3s;

        }


        @keyframes loadingDot {

          0%,
          100% {

            transform:
              translateY(0)
              scale(0.75);

            opacity:
              0.45;

          }

          50% {

            transform:
              translateY(-5px)
              scale(1.1);

            opacity:
              1;

          }

        }


        /* ================================================
           BOTTOM TOOLBAR
        ================================================ */

        .pdf-toolbar {

          height: 64px;

          min-height: 64px;

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            rgba(4,8,15,0.96);

          border-top:
            1px solid
            rgba(255,255,255,0.08);

          z-index: 100;

        }


        .nav-button {

          width: 42px;

          height: 42px;

          color: white !important;

          background:
            rgba(255,255,255,0.05)
            !important;

        }


        .nav-button:hover {

          background:
            rgba(25,118,210,0.3)
            !important;

        }


        .control-button {

          color:
            rgba(255,255,255,0.75)
            !important;

        }


        .control-button:hover {

          color: white !important;

          background:
            rgba(0,198,255,0.1)
            !important;

        }


        .reset-button {

          color:
            rgba(255,255,255,0.55)
            !important;

        }


        .zoom-value {

          width: 42px;

          text-align: center;

          font-size:
            11px !important;

          color:
            rgba(255,255,255,0.55);

        }


        .zoom-slider {

          color:
            #00c6ff !important;

        }


        .zoom-slider .MuiSlider-thumb {

          width: 12px;

          height: 12px;

          box-shadow:
            0 0 12px
            rgba(0,198,255,0.8);

        }


        .toolbar-divider {

          margin: 0 7px;

          border-color:
            rgba(255,255,255,0.1)
            !important;

        }


        .next-button {

          width: 42px;

          height: 42px;

          color: white !important;

          background:
            linear-gradient(
              135deg,
              #1976d2,
              #00a8ff
            ) !important;

          box-shadow:
            0 5px 20px
            rgba(0,140,255,0.25);

        }


        .next-button:hover {

          background:
            linear-gradient(
              135deg,
              #2196f3,
              #00c6ff
            ) !important;

        }


        .nav-button.Mui-disabled,
        .next-button.Mui-disabled {

          opacity: 0.25;

        }


        /* ================================================
           FULLSCREEN
        ================================================ */

        .pdf-viewer:fullscreen {

          width: 100vw;

          height: 100vh;

          background:
            #05070b;

        }


        .pdf-viewer:fullscreen
        .pdf-stage {

          padding: 5px;

        }


        .pdf-viewer:fullscreen
        .pdf-book-page {

          box-shadow:
            0 0 25px
            rgba(0,0,0,0.55);

        }


        /* ================================================
           TABLET
        ================================================ */

        @media
        (max-width: 900px) {

          .pdf-stage {

            padding: 5px;

          }

        }


        /* ================================================
           MOBILE
        ================================================ */

        @media
        (max-width: 767px) {

          .pdf-topbar {

            height: 56px;

            min-height: 56px;

            padding:
              0 10px;

          }


          .book-icon {

            width: 34px;

            height: 34px;

          }


          .album-title {

            font-size:
              13px !important;

            max-width:
              45vw;

          }


          .album-subtitle {

            display:
              none;

          }


          .top-page-counter {

            font-size:
              11px;

            padding:
              5px 10px;

          }


          .top-button {

            width:
              36px;

            height:
              36px;

          }


          .album-tabs {

            min-height:
              44px;

            padding:
              5px 8px;

          }


          .album-tab {

            max-width:
              210px;

            padding:
              5px 10px;

          }


          .album-heading {

            font-size:
              11px;

          }


          .pdf-stage {

            padding:
              3px;

          }


          .book-wrapper {

            width:
              100%;

            max-width:
              100%;

          }


          .pdf-book {

            max-width:
              100vw !important;

          }


          .pdf-toolbar {

            height:
              58px;

            min-height:
              58px;

          }


          .reset-button {

            display:
              none !important;

          }


          .toolbar-divider {

            margin:
              0 3px;

          }


          .zoom-value {

            width:
              36px;

          }

        }


        /* ================================================
           VERY SMALL MOBILE
        ================================================ */

        @media
        (max-width: 400px) {

          .album-title {

            display:
              none;

          }


          .pdf-toolbar {

            padding:
              0 3px;

          }


          .control-button {

            width:
              34px;

            height:
              34px;

          }


          .nav-button,
          .next-button {

            width:
              38px;

            height:
              38px;

          }


          .zoom-slider {

            width:
              55px;

          }

        }

        `}
      </style>

    </Box>

  );

}