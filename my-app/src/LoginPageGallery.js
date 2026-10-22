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
   VALIDATE LOCAL SESSION
========================================================= */

const getStoredUsername = () => {
  try {
    const isLoggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    const sessionToken =
      localStorage.getItem("sessionToken");

    // Require the session values used by the login component.
    if (!isLoggedIn || !sessionToken) {
      return "";
    }

    for (const key of POSSIBLE_USER_KEYS) {
      const value = localStorage.getItem(key)?.trim();

      if (value) {
        return value;
      }
    }

    return "";
  } catch (error) {
    console.error("Unable to read session:", error);
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

  // Prevent stale requests from restoring gallery content.
  const requestIdRef = useRef(0);

  // Prevent repeated session checks from creating duplicate requests.
  const lastUsernameRef = useRef("");

  /* =======================================================
     CLEAR GALLERY SESSION
  ======================================================= */

  const clearGallerySession = useCallback(() => {
    requestIdRef.current += 1;
    lastUsernameRef.current = "";

    setLoggedUser("");
    setAlbums([]);
    setSelectedAlbum(null);
    setSelectedIndex(null);
    setZoom(1);
    setImageLoading(true);
    setError("Your session has ended. Please log in again.");
    setLoading(false);
  }, []);

  /* =======================================================
     CHECK SESSION
  ======================================================= */

  const checkSession = useCallback(() => {
    const username = getStoredUsername();

    if (!username) {
      clearGallerySession();
      return;
    }

    const normalizedUsername = username.toLowerCase();

    if (lastUsernameRef.current !== normalizedUsername) {
      lastUsernameRef.current = normalizedUsername;
      setError("");
      setLoggedUser(username);
    }
  }, [clearGallerySession]);

  /* =======================================================
     LISTEN FOR LOGOUT AND SESSION CHANGES
  ======================================================= */

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("goldenDreamsUserName");
      localStorage.removeItem("UserName");
      localStorage.removeItem("userName");

      window.dispatchEvent(new Event("golden-dreams-logout"));
      clearGallerySession();
    };

    const handleStorage = (event) => {
      // Check session changes made in another browser tab.
      if (
        event.key === null ||
        event.key === "sessionToken" ||
        event.key === "isLoggedIn" ||
        POSSIBLE_USER_KEYS.includes(event.key)
      ) {
        checkSession();
      }
    };

    const handlePageShow = () => {
      // Recheck when returning through browser Back/Forward.
      checkSession();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener(
      "golden-dreams-logout",
      handleLogout
    );

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pageshow", handlePageShow);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    // Validate the session when the component mounts.
    checkSession();

    return () => {
      window.removeEventListener(
        "golden-dreams-logout",
        handleLogout
      );

      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pageshow", handlePageShow);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [checkSession]);

  /* =======================================================
     LOAD GALLERY
  ======================================================= */

  const loadGallery = useCallback(async () => {
    const username = getStoredUsername();

    if (!username) {
      clearGallerySession();
      return;
    }

    const normalizedUsername = username.trim().toLowerCase();
    const requestId = ++requestIdRef.current;

    lastUsernameRef.current = normalizedUsername;

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

      // Ignore a response if a newer request or logout occurred.
      if (requestId !== requestIdRef.current) {
        return;
      }

      // Validate the session again after the network request.
      const currentUsername = getStoredUsername();

      if (
        !currentUsername ||
        currentUsername.trim().toLowerCase() !==
          normalizedUsername
      ) {
        clearGallerySession();
        return;
      }

      if (result.success !== true) {
        throw new Error(
          result.error ||
            "Gallery API returned an unsuccessful response."
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error("Gallery API returned invalid data.");
      }

      // Keep only albums belonging to the logged-in username.
      const userAlbums = result.data.filter((album) => {
        const sheetUsername = String(album?.UserName || "")
          .trim()
          .toLowerCase();

        return sheetUsername === normalizedUsername;
      });

      // Final guard before updating the UI.
      if (requestId !== requestIdRef.current) {
        return;
      }

      const finalUsername = getStoredUsername();

      if (
        !finalUsername ||
        finalUsername.trim().toLowerCase() !==
          normalizedUsername
      ) {
        clearGallerySession();
        return;
      }

      setLoggedUser(finalUsername);
      setAlbums(userAlbums);
      setSelectedAlbum(null);
      setSelectedIndex(null);
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
  }, [clearGallerySession]);

  /* =======================================================
     LOAD GALLERY AFTER LOGIN
  ======================================================= */

  useEffect(() => {
    if (loggedUser && getStoredUsername()) {
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
    if (!getStoredUsername()) {
      clearGallerySession();
      return;
    }

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
  }, [
    selectedAlbum,
    selectedIndex,
    clearGallerySession,
  ]);

  /* =======================================================
     PREVIOUS IMAGE
  ======================================================= */

  const previousImage = useCallback(() => {
    if (!getStoredUsername()) {
      clearGallerySession();
      return;
    }

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
  }, [
    selectedAlbum,
    selectedIndex,
    clearGallerySession,
  ]);

  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  useEffect(() => {
    const keyboard = (event) => {
      if (selectedIndex === null) {
        return;
      }

      if (!getStoredUsername()) {
        clearGallerySession();
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
  }, [
    selectedIndex,
    nextImage,
    previousImage,
    clearGallerySession,
  ]);

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

      <Box className="gd-photo-content">
        <Box className="gd-photo-heading">
          <Typography className="gd-photo-heading-title">
            {selectedAlbum?.heading}
          </Typography>

          <Typography className="gd-photo-heading-sub">
            Captured moments
          </Typography>
        </Box>

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