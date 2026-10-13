import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Typography,
  IconButton,
  Dialog,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";

import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Close,
  Collections,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  Refresh,
} from "@mui/icons-material";

import "./LoginPageGallery.css";

/* =========================================================
   GOLDEN DREAMS GALLERY API
========================================================= */

const GALLERY_API =
  "https://script.google.com/macros/s/AKfycbwfUMf3FFFvaBZVz9mLYzBQKEmkPuT1MeL1x83cRCQ4luzcLZ4aYyWoWqEirbbr2El2/exec";

/* =========================================================
   USER STORAGE
========================================================= */

const POSSIBLE_USER_KEYS = [
  "goldenDreamsUserName",
  "UserName",
  "username",
  "userName",
];

/* =========================================================
   GET STORED USERNAME
========================================================= */

const getStoredUsername = () => {
  try {
    for (const key of POSSIBLE_USER_KEYS) {
      const value = localStorage.getItem(key)?.trim();

      if (value) {
        return value;
      }
    }

    return "";
  } catch (error) {
    console.error("Unable to read username:", error);
    return "";
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function LoginPageGallery() {
  const [loggedUser, setLoggedUser] = useState("");
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Identifies the latest gallery request.
  // Older requests cannot update the gallery after logout.
  const requestIdRef = useRef(0);

  /* =======================================================
     LOGOUT HANDLER
  ======================================================= */

  const clearGallerySession = useCallback(() => {
    // Invalidate any outstanding API request.
    requestIdRef.current += 1;

    setLoggedUser("");
    setAlbums([]);
    setSelectedAlbum(null);
    setSelectedIndex(null);
    setZoom(1);
    setImageLoading(true);
    setError("You have been logged out. Please log in again.");
    setLoading(false);
  }, []);

  /* =======================================================
     LISTEN FOR LOGOUT
  ======================================================= */

  useEffect(() => {
    window.addEventListener(
      "golden-dreams-logout",
      clearGallerySession
    );

    return () => {
      window.removeEventListener(
        "golden-dreams-logout",
        clearGallerySession
      );
    };
  }, [clearGallerySession]);

  /* =======================================================
     READ USER WHEN COMPONENT MOUNTS
  ======================================================= */

  useEffect(() => {
    const username = getStoredUsername();

    if (!username) {
      setLoggedUser("");
      setAlbums([]);
      setError("No logged-in user was found. Please login again.");
      setLoading(false);
      return;
    }

    setError("");
    setLoggedUser(username);
  }, []);

  /* =======================================================
     LOAD GALLERY
  ======================================================= */

  const loadGallery = useCallback(async () => {
    const username = getStoredUsername();

    if (!username) {
      requestIdRef.current += 1;

      setLoggedUser("");
      setAlbums([]);
      setSelectedAlbum(null);
      setSelectedIndex(null);
      setError("No logged-in user was found. Please login again.");
      setLoading(false);
      return;
    }

    // Each request gets a unique ID.
    const requestId = ++requestIdRef.current;

    const normalizedUsername = username.trim().toLowerCase();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${GALLERY_API}?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gallery server error: ${response.status}`
        );
      }

      const result = await response.json();

      // Discard the response if a newer request or logout occurred.
      if (requestId !== requestIdRef.current) {
        return;
      }

      // Ensure the same user is still present after the request.
      const currentUsername = getStoredUsername();

      if (
        !currentUsername ||
        currentUsername.trim().toLowerCase() !== normalizedUsername
      ) {
        setAlbums([]);
        setSelectedAlbum(null);
        setSelectedIndex(null);
        setLoggedUser("");
        setError("Your session has ended. Please log in again.");
        return;
      }

      console.log("Golden Dreams API:", result);

      if (result.success !== true) {
        throw new Error(
          result.error ||
          "Gallery API returned an unsuccessful response."
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error(
          "Gallery API returned invalid data."
        );
      }

      const userAlbums = result.data.filter((album) => {
        const sheetUsername = String(album?.UserName || "")
          .trim()
          .toLowerCase();

        return sheetUsername === normalizedUsername;
      });

      // Check again before updating component state.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setLoggedUser(currentUsername);
      setAlbums(userAlbums);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.error("Golden Dreams Gallery Error:", err);

      setAlbums([]);
      setSelectedAlbum(null);
      setSelectedIndex(null);

      setError(
        err?.message || "Unable to load your gallery."
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /* =======================================================
     LOAD GALLERY AFTER USER IS FOUND
  ======================================================= */

  useEffect(() => {
    if (loggedUser) {
      loadGallery();
    }
  }, [loggedUser, loadGallery]);

  /* =======================================================
     TOTAL PHOTOS
  ======================================================= */

  const totalPhotos = useMemo(() => {
    return albums.reduce((total, album) => {
      return (
        total +
        (Array.isArray(album?.images)
          ? album.images.length
          : 0)
      );
    }, 0);
  }, [albums]);

  /* =======================================================
     OPEN ALBUM
  ======================================================= */

  const openAlbum = (album) => {
    if (!getStoredUsername()) {
      clearGallerySession();
      return;
    }

    setSelectedAlbum(album);
    setSelectedIndex(null);
    setZoom(1);
  };

  /* =======================================================
     CLOSE ALBUM
  ======================================================= */

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setSelectedIndex(null);
    setZoom(1);
  };

  /* =======================================================
     OPEN IMAGE
  ======================================================= */

  const openImage = (index) => {
    if (!getStoredUsername()) {
      clearGallerySession();
      return;
    }

    setImageLoading(true);
    setZoom(1);
    setSelectedIndex(index);
  };

  /* =======================================================
     CLOSE IMAGE
  ======================================================= */

  const closeImage = () => {
    setSelectedIndex(null);
    setZoom(1);
  };

  /* =======================================================
     NEXT IMAGE
  ======================================================= */

  const nextImage = useCallback(() => {
    if (!selectedAlbum || selectedIndex === null) {
      return;
    }

    const images = Array.isArray(selectedAlbum.images)
      ? selectedAlbum.images
      : [];

    if (images.length <= 1) {
      return;
    }

    setImageLoading(true);
    setZoom(1);

    setSelectedIndex(
      (current) => ((current ?? 0) + 1) % images.length
    );
  }, [selectedAlbum, selectedIndex]);

  /* =======================================================
     PREVIOUS IMAGE
  ======================================================= */

  const previousImage = useCallback(() => {
    if (!selectedAlbum || selectedIndex === null) {
      return;
    }

    const images = Array.isArray(selectedAlbum.images)
      ? selectedAlbum.images
      : [];

    if (images.length <= 1) {
      return;
    }

    setImageLoading(true);
    setZoom(1);

    setSelectedIndex(
      (current) =>
        ((current ?? 0) - 1 + images.length) % images.length
    );
  }, [selectedAlbum, selectedIndex]);

  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  useEffect(() => {
    const keyboard = (event) => {
      if (selectedIndex === null) {
        return;
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "Escape") {
        closeImage();
      }

      if (event.key === "+" || event.key === "=") {
        setZoom((value) => Math.min(3, value + 0.25));
      }

      if (event.key === "-") {
        setZoom((value) => Math.max(1, value - 0.25));
      }
    };

    window.addEventListener("keydown", keyboard);

    return () => {
      window.removeEventListener("keydown", keyboard);
    };
  }, [selectedIndex, nextImage, previousImage]);

  /* =======================================================
     LOCK BODY SCROLL WHEN VIEWER IS OPEN
  ======================================================= */

  useEffect(() => {
    if (selectedIndex !== null) {
      const originalOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedIndex]);

  /* =======================================================
     CURRENT IMAGE
  ======================================================= */

  const currentImage =
    selectedAlbum && selectedIndex !== null
      ? selectedAlbum.images?.[selectedIndex]
      : null;

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <Box className="gd-page">
        <Box className="gd-loading-screen">
          <Box className="gd-loading-logo">
            <Collections />
          </Box>

          <Typography className="gd-loading-brand">
            GOLDEN DREAMS
          </Typography>

          <Typography className="gd-loading-text">
            Preparing your memories
          </Typography>

          <Box className="gd-loading-dots">
            <span />
            <span />
            <span />
          </Box>
        </Box>
      </Box>
    );
  }

  /* =======================================================
     ERROR SCREEN
  ======================================================= */

  if (error) {
    return (
      <Box className="gd-page">
        <Box className="gd-error-screen">
          <Box className="gd-error-icon">
            <Collections />
          </Box>

          <Typography className="gd-error-title">
            Gallery Unavailable
          </Typography>

          <Typography className="gd-error-message">
            {error}
          </Typography>

          {getStoredUsername() && (
            <Button
              onClick={loadGallery}
              startIcon={<Refresh />}
              className="gd-gold-button"
            >
              Try Again
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  /* =======================================================
     ALBUM COLLECTION PAGE
  ======================================================= */

  if (!selectedAlbum) {
    return (
      <Box className="gd-page">
        {/* HERO */}

        <Box className="gd-hero">
          <Box className="gd-hero-orb orb-one" />
          <Box className="gd-hero-orb orb-two" />

          <Typography className="gd-hero-small">
            YOUR PRIVATE COLLECTION
          </Typography>

          <Typography className="gd-hero-title">
            Golden Dreams
          </Typography>

          <Typography className="gd-hero-description">
            A beautiful place for your most precious memories.
          </Typography>

          <Box className="gd-stats">
            <Box className="gd-stat">
              <strong>{albums.length}</strong>
              <span>ALBUMS</span>
            </Box>

            <Box className="gd-stat-divider" />

            <Box className="gd-stat">
              <strong>{totalPhotos}</strong>
              <span>PHOTOS</span>
            </Box>
          </Box>
        </Box>

        {/* CONTENT */}

        <Box className="gd-content">
          <Box className="gd-section-header">
            <Box>
              <Typography className="gd-section-kicker">
                COLLECTION
              </Typography>

              <Typography className="gd-section-title">
                Your Albums
              </Typography>
            </Box>

            <Typography className="gd-section-count">
              {albums.length} COLLECTION
              {albums.length !== 1 ? "S" : ""}
            </Typography>
          </Box>

          {/* NO ALBUMS */}

          {albums.length === 0 ? (
            <Box className="gd-no-albums">
              <Collections />

              <Typography>
                No albums are available for your account yet.
              </Typography>

              <Button
                onClick={loadGallery}
                startIcon={<Refresh />}
                className="gd-gold-button"
                sx={{ marginTop: "18px" }}
              >
                Refresh Gallery
              </Button>
            </Box>
          ) : (
            /* ALBUM GRID */

            <Box className="gd-album-grid">
              {albums.map((album, index) => {
                const cover = album?.images?.[0]?.secure_url;

                const photoCount = Array.isArray(album?.images)
                  ? album.images.length
                  : 0;

                return (
                  <Box
                    key={
                      album?.CloudinaryFolder ||
                      `${album?.heading}-${index}`
                    }
                    className="gd-album-card"
                    onClick={() => openAlbum(album)}
                  >
                    <Box className="gd-album-image">
                      {cover ? (
                        <img
                          src={cover}
                          alt={
                            album?.heading ||
                            "Golden Dreams Album"
                          }
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                      ) : (
                        <Box className="gd-empty-cover">
                          <Collections />
                        </Box>
                      )}

                      <Box className="gd-album-shade" />

                      <Box className="gd-album-count">
                        <Collections />
                        <span>{photoCount}</span>
                      </Box>

                      <Box className="gd-album-open">
                        OPEN ALBUM
                      </Box>
                    </Box>

                    <Box className="gd-album-details">
                      <Typography className="gd-album-name">
                        {album?.heading || "Untitled Album"}
                      </Typography>

                      <Box className="gd-album-detail-row">
                        <Typography className="gd-album-owner">
                          Golden Dreams
                        </Typography>

                        <Typography className="gd-album-arrow">
                          →
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  /* =======================================================
     PHOTO ALBUM PAGE
  ======================================================= */

  return (
    <Box className="gd-page">
      {/* ALBUM TOOLBAR */}

      <Box className="gd-album-toolbar">
        <Tooltip title="Back to Albums">
          <IconButton
            onClick={closeAlbum}
            className="gd-back"
            aria-label="Back to albums"
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>

        <Box className="gd-album-toolbar-info">
          <Typography className="gd-toolbar-label">
            GOLDEN DREAMS
          </Typography>

          <Typography className="gd-toolbar-title">
            {selectedAlbum?.heading}
          </Typography>
        </Box>

        <Box className="gd-toolbar-count">
          {selectedAlbum?.images?.length || 0}
          {" PHOTOS"}
        </Box>
      </Box>

      {/* PHOTO CONTENT */}

      <Box className="gd-photo-content">
        <Box className="gd-photo-heading">
          <Typography className="gd-photo-heading-title">
            {selectedAlbum?.heading}
          </Typography>

          <Typography className="gd-photo-heading-sub">
            Captured moments
          </Typography>
        </Box>

        {/* PHOTO GRID */}

        <Box className="gd-masonry">
          {selectedAlbum?.images?.map((image, index) => (
            <Box
              key={
                image?.asset_id ||
                image?.public_id ||
                index
              }
              className="gd-photo"
              onClick={() => openImage(index)}
            >
              <img
                src={image?.secure_url}
                alt={
                  image?.display_name || `Photo ${index + 1}`
                }
                loading={index < 8 ? "eager" : "lazy"}
              />

              <Box className="gd-photo-hover">
                <Fullscreen />
              </Box>
            </Box>
          ))}
        </Box>

        {/* NO PHOTOS */}

        {(!selectedAlbum?.images ||
          selectedAlbum.images.length === 0) && (
          <Box className="gd-no-photos">
            <Collections />

            <Typography>
              No photos in this album.
            </Typography>
          </Box>
        )}
      </Box>

      {/* FULLSCREEN IMAGE VIEWER */}

      <Dialog
        open={selectedIndex !== null}
        onClose={closeImage}
        fullScreen
        disableEscapeKeyDown={false}
        className="gd-viewer-dialog"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.96)",
            },
          },
        }}
        sx={{
          zIndex: 99999,
        }}
      >
        <Box
          className="gd-viewer"
          onClick={(event) => event.stopPropagation()}
        >
          {/* VIEWER HEADER */}

          <Box className="gd-viewer-top">
            <Box>
              <Typography className="gd-viewer-brand">
                GOLDEN DREAMS
              </Typography>

              <Typography className="gd-viewer-album">
                {selectedAlbum?.heading}
              </Typography>
            </Box>

            <Typography className="gd-viewer-counter">
              {(selectedIndex ?? 0) + 1}
              {" / "}
              {selectedAlbum?.images?.length || 0}
            </Typography>

            <IconButton
              onClick={closeImage}
              className="gd-viewer-close"
              aria-label="Close image"
            >
              <Close />
            </IconButton>
          </Box>

          {/* IMAGE STAGE */}

          <Box className="gd-viewer-stage">
            {selectedAlbum?.images?.length > 1 && (
              <IconButton
                onClick={previousImage}
                className="gd-viewer-nav gd-viewer-prev"
                aria-label="Previous image"
              >
                <ChevronLeft />
              </IconButton>
            )}

            <Box className="gd-viewer-image-container">
              {imageLoading && (
                <Box className="gd-image-loader">
                  <CircularProgress size={35} />
                </Box>
              )}

              {currentImage && (
                <img
                  src={currentImage.secure_url}
                  alt={
                    currentImage.display_name ||
                    "Golden Dreams"
                  }
                  className={
                    imageLoading
                      ? "gd-viewer-image image-loading"
                      : "gd-viewer-image"
                  }
                  style={{
                    transform: `scale(${zoom})`,
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              )}
            </Box>

            {selectedAlbum?.images?.length > 1 && (
              <IconButton
                onClick={nextImage}
                className="gd-viewer-nav gd-viewer-next"
                aria-label="Next image"
              >
                <ChevronRight />
              </IconButton>
            )}
          </Box>

          {/* ZOOM CONTROLS */}

          <Box className="gd-viewer-controls">
            <IconButton
              onClick={() =>
                setZoom((value) => Math.max(1, value - 0.25))
              }
              className="gd-viewer-control"
              aria-label="Zoom out"
            >
              <ZoomOut />
            </IconButton>

            <Typography className="gd-viewer-zoom">
              {Math.round(zoom * 100)}%
            </Typography>

            <IconButton
              onClick={() =>
                setZoom((value) => Math.min(3, value + 0.25))
              }
              className="gd-viewer-control"
              aria-label="Zoom in"
            >
              <ZoomIn />
            </IconButton>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}