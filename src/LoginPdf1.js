import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";

import {
  MenuBook,
  KeyboardArrowDown,
  Check,
  Fullscreen,
  CloseFullscreen,
} from "@mui/icons-material";

// =====================================================
// GOOGLE APPS SCRIPT API
// =====================================================

const DATA_API =
  "https://script.google.com/macros/s/AKfycbxNG3fuMW_DivRzBfhcPdwcJ3MTBgHOic1AhkWiMNhsXDq56a77Rg7UP4PpjeVQ116tbA/exec";

// =====================================================
// EXTRACT GOOGLE DRIVE FILE ID
// =====================================================

const getDriveFileId = (url) => {
  if (!url) return null;

  const value = String(url).trim();
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);

  if (fileMatch) return fileMatch[1];

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.searchParams.get("id");
  } catch {
    return null;
  }
};

export default function LoginPdf1() {
  const username = localStorage.getItem("username") || "";

  const viewerRef = useRef(null);
  const menuContainerRef = useRef(null);

  const [data, setData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [albumMenuOpen, setAlbumMenuOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [scrollDirection, setScrollDirection] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // =====================================================
  // FETCH ALBUMS
  // =====================================================

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!username.trim()) {
        setError("Please login again to view your albums.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(DATA_API);

        if (!response.ok) {
          throw new Error("Unable to connect to the API.");
        }

        const result = await response.json();

        const albums = Array.isArray(result)
          ? result.filter(
              (item) =>
                String(item.UserName ?? "").trim() ===
                  username.trim() &&
                String(item.heading1 ?? "").trim() &&
                String(item.pdf1 ?? "").trim()
            )
          : [];

        setData(albums);
        setSelectedIndex(0);

        if (!albums.length) {
          setError("No albums are available for this account.");
        }
      } catch (err) {
        console.error("Album API error:", err);
        setError("Unable to load albums. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [username]);

  // =====================================================
  // CURRENT ALBUM
  // =====================================================

  const currentAlbum = data[selectedIndex];
  const currentHeading = currentAlbum?.heading1 || "Golden Dreams";

  const fileId = getDriveFileId(currentAlbum?.pdf1);

  const pdfUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`
    : "";

  // =====================================================
  // OUTSIDE CLICK / ESCAPE CLOSES ALBUM MENU
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setAlbumMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setAlbumMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =====================================================
  // FULLSCREEN
  // =====================================================

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await viewerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(
        document.fullscreenElement === viewerRef.current
      );
      setAlbumMenuOpen(false);
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // =====================================================
  // SELECT ALBUM
  // =====================================================

  const selectAlbum = (index) => {
    setSelectedIndex(index);
    setAlbumMenuOpen(false);
    setScrollDirection(null);
    setShowScrollIndicator(false);
  };

  // =====================================================
  // SCROLL INDICATOR
  // =====================================================

  useEffect(() => {
    let hideTimer;

    const handleWheel = (event) => {
      setScrollDirection(event.deltaY > 0 ? "down" : "up");
      setShowScrollIndicator(true);

      clearTimeout(hideTimer);

      hideTimer = setTimeout(() => {
        setShowScrollIndicator(false);
      }, 900);
    };

    window.addEventListener("wheel", handleWheel, {
      passive: true,
    });

    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <Box
        sx={{
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          color: "#D8B46A",
          background:
            "radial-gradient(circle, #20202A 0%, #090C14 60%, #020307 100%)",
        }}
      >
        <MenuBook sx={{ fontSize: 48 }} />

        <Typography
          sx={{
            fontSize: 11,
            letterSpacing: 3,
            color: "#B8B5AD",
          }}
        >
          LOADING YOUR COLLECTION
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#D8B46A",
                animation: "albumPulse 1s infinite",
                animationDelay: `${dot * 0.2}s`,
              }}
            />
          ))}
        </Box>

        <style>
          {`
            @keyframes albumPulse {
              0%, 100% { opacity: .25; transform: translateY(0); }
              50% { opacity: 1; transform: translateY(-4px); }
            }
          `}
        </style>
      </Box>
    );
  }

  // =====================================================
  // ERROR SCREEN
  // =====================================================

  if (error || !data.length) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          gap: 2,
          color: "#F8F0DF",
          background:
            "radial-gradient(circle, #20202A 0%, #090C14 60%, #020307 100%)",
        }}
      >
        <MenuBook sx={{ fontSize: 46, color: "#D8B46A" }} />

        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          {error || "No albums found"}
        </Typography>

        <Typography sx={{ color: "#8F94A3", fontSize: 12 }}>
          Please check your login and Google Sheet data.
        </Typography>
      </Box>
    );
  }

  // =====================================================
  // MAIN VIEWER
  // =====================================================

  return (
    <Box
      ref={viewerRef}
      id="golden-dreams-viewer"
      sx={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "100dvh",
        minHeight: "100vh",
        overflow: "hidden",
        color: "#F8F0DF",
        bgcolor: "#080A10",

        "&:fullscreen": {
          width: "100%",
          height: "100%",
          minHeight: 0,
          background: "#080A10",
        },
      }}
    >
      {/* PDF VIEWER */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          bgcolor: "#111",
        }}
      >
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            title={currentHeading}
            allow="fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width: "100%",
              height: "100%",
              border: 0,
              display: "block",
              background: "#111",
            }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              p: 3,
            }}
          >
            <Typography>
              This album does not have a valid Google Drive link.
            </Typography>
          </Box>
        )}
      </Box>

      {/* TOP HEADER */}

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pointerEvents: "none",
        }}
      >
        {/* LEFT PANEL: COMPACT BRAND AND TITLE */}

        <Box
          sx={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.8, sm: 1.2 },
            minWidth: 0,
            width: "fit-content",
            maxWidth: { xs: "55%", sm: "42%", md: "35%" },
            flex: "0 1 auto",
            p: { xs: 0.7, sm: 1 },
            borderRadius: "0 0 15px 0",
            bgcolor: "rgba(10,12,19,0.90)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(216,180,106,0.25)",
            borderBottom: "1px solid rgba(216,180,106,0.25)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
          }}
        >
          <Box
            sx={{
              width: { xs: 32, sm: 38 },
              height: { xs: 32, sm: 38 },
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: "10px",
              color: "#E2C17C",
              bgcolor: "#211C14",
              border: "1px solid rgba(216,180,106,0.3)",
            }}
          >
            <MenuBook sx={{ fontSize: { xs: 18, sm: 21 } }} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: 8, sm: 9 },
                fontWeight: 800,
                letterSpacing: { xs: 0.8, sm: 1.5 },
                color: "#D8B46A",
                lineHeight: 1.3,
              }}
            >
              GOLDEN DREAMS
            </Typography>

            <Typography
              title={currentHeading}
              noWrap
              sx={{
                mt: 0.3,
                fontSize: { xs: 10, sm: 12 },
                fontWeight: 600,
                color: "#F8F0DF",
                lineHeight: 1.4,
              }}
            >
              {currentHeading}
            </Typography>
          </Box>
        </Box>

        {/* RIGHT PANEL: ALBUM MENU AND FULLSCREEN */}

        <Box
          ref={menuContainerRef}
          sx={{
            position: "relative",
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.7, sm: 1 },
            flexShrink: 0,
            p: { xs: 0.7, sm: 1 },
            borderRadius: "0 0 0 15px",
            bgcolor: "rgba(10,12,19,0.90)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderLeft: "1px solid rgba(216,180,106,0.25)",
            borderBottom: "1px solid rgba(216,180,106,0.25)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
          }}
        >
          {/* ALBUM MENU */}

          {data.length > 1 && (
            <Box>
              <Tooltip title="Choose an album">
                <Box
                  component="button"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={albumMenuOpen}
                  onClick={() =>
                    setAlbumMenuOpen((open) => !open)
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 0.3, sm: 0.8 },
                    minHeight: { xs: 36, sm: 40 },
                    px: { xs: 0.9, sm: 1.4 },
                    borderRadius: "11px",
                    color: "#E8CC91",
                    bgcolor: albumMenuOpen
                      ? "rgba(216,180,106,0.18)"
                      : "rgba(216,180,106,0.07)",
                    border: "1px solid rgba(216,180,106,0.32)",
                    fontFamily: "inherit",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      bgcolor: "rgba(216,180,106,0.17)",
                    },
                  }}
                >
                  <MenuBook sx={{ fontSize: 19 }} />

                  <Box
                    component="span"
                    sx={{
                      display: { xs: "none", sm: "inline" },
                    }}
                  >
                    ALBUMS
                  </Box>

                  <KeyboardArrowDown
                    sx={{
                      fontSize: 19,
                      transition: "transform .2s",
                      transform: albumMenuOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </Box>
              </Tooltip>

              {/* CUSTOM DROPDOWN */}

              {albumMenuOpen && (
                <Box
                  role="menu"
                  sx={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 8,
                    zIndex: 1000,
                    width: { xs: 260, sm: 310 },
                    maxWidth: "calc(100vw - 20px)",
                    maxHeight: "min(65dvh, 500px)",
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    borderRadius: "16px",
                    p: 1,
                    bgcolor: "#11141D",
                    border: "1px solid rgba(216,180,106,0.32)",
                    boxShadow: "0 18px 55px rgba(0,0,0,0.65)",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#6C5934 #11141D",
                  }}
                >
                  <Box sx={{ px: 1.3, py: 1.2 }}>
                    <Typography
                      sx={{
                        color: "#D8B46A",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 2,
                      }}
                    >
                      YOUR COLLECTION
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        color: "#8F94A3",
                        fontSize: 11,
                      }}
                    >
                      Choose an album to continue
                    </Typography>
                  </Box>

                  {data.map((item, index) => {
                    const active = selectedIndex === index;

                    return (
                      <Box
                        key={`${item.heading1}-${index}`}
                        component="button"
                        type="button"
                        role="menuitem"
                        onClick={() => selectAlbum(index)}
                        sx={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.2,
                          p: 1.2,
                          mb: 0.5,
                          textAlign: "left",
                          border: active
                            ? "1px solid rgba(216,180,106,0.32)"
                            : "1px solid transparent",
                          borderRadius: "12px",
                          color: "#F8F0DF",
                          bgcolor: active
                            ? "rgba(216,180,106,0.12)"
                            : "transparent",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          "&:hover": {
                            bgcolor: "rgba(216,180,106,0.12)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "10px",
                            color: "#E2C17C",
                            bgcolor: "#211C14",
                          }}
                        >
                          <MenuBook sx={{ fontSize: 19 }} />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: active ? 700 : 500,
                              lineHeight: 1.5,
                              overflowWrap: "anywhere",
                              color: active
                                ? "#E6C780"
                                : "#E4E5EA",
                            }}
                          >
                            {item.heading1}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.3,
                              fontSize: 10,
                              color: "#858A99",
                            }}
                          >
                            Album {String(index + 1).padStart(2, "0")}
                          </Typography>
                        </Box>

                        {active && (
                          <Check
                            sx={{
                              fontSize: 19,
                              color: "#D8B46A",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          {/* FULLSCREEN BUTTON */}

          <Tooltip
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <IconButton
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                flexShrink: 0,
                borderRadius: "11px",
                color: "#E6C780",
                bgcolor: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.12)",
                "&:hover": {
                  bgcolor: "rgba(216,180,106,0.13)",
                  borderColor: "rgba(216,180,106,0.4)",
                },
              }}
            >
              {fullscreen ? (
                <CloseFullscreen />
              ) : (
                <Fullscreen />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* SCROLL INDICATOR */}

      {showScrollIndicator && scrollDirection && (
        <Box
          sx={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            pointerEvents: "none",
            width: 34,
            height: 110,
            borderRadius: 20,
            bgcolor: "rgba(10,12,19,0.5)",
            border: "1px solid rgba(216,180,106,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D8B46A",
            opacity: 0.85,
          }}
        >
          <Box
            sx={{
              fontSize: 25,
              animation:
                "scrollHint .7s ease-in-out infinite alternate",
            }}
          >
            {scrollDirection === "down" ? "↓" : "↑"}
          </Box>
        </Box>
      )}

      {/* ANIMATIONS */}

      <style>
        {`
          @keyframes scrollHint {
            from { transform: translateY(-4px); }
            to { transform: translateY(4px); }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </Box>
  );
}