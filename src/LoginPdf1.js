import React, { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

import {
  Fullscreen,
  CloseFullscreen,
  OpenInNew,
  MenuBook,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from "@mui/icons-material";

// =========================================================
// GOOGLE APPS SCRIPT GET API
// =========================================================

const DATA_API =
  "https://script.google.com/macros/s/AKfycbxNG3fuMW_DivRzBfhcPdwcJ3MTBgHOic1AhkWiMNhsXDq56a77Rg7UP4PpjeVQ116tbA/exec";

// =========================================================
// EXTRACT GOOGLE DRIVE FILE ID
// =========================================================

const getDriveFileId = (url) => {
  if (!url) return null;

  const value = String(url).trim();

  // Normal Google Drive:
  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch =
    value.match(
      /\/file\/d\/([^/]+)/
    );

  if (fileMatch) {
    return fileMatch[1];
  }

  // Also support:
  // https://drive.google.com/open?id=FILE_ID
  try {
    const urlObject = new URL(value);

    const id =
      urlObject.searchParams.get("id");

    if (id) {
      return id;
    }
  } catch (error) {
    console.warn(
      "Invalid Google Drive URL:",
      value
    );
  }

  return null;
};

export default function LoginPdf1() {
  // =========================================================
  // LOGIN USER
  // =========================================================

  const username =
    localStorage.getItem("username");

  // =========================================================
  // API DATA
  // =========================================================

  const [data, setData] = useState([]);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [apiError, setApiError] =
    useState("");

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const [fullscreen, setFullscreen] =
    useState(false);

  // =========================================================
  // SCROLL INDICATOR
  // =========================================================

  const [scrollDirection, setScrollDirection] =
    useState(null);

  const [scrollAnimation, setScrollAnimation] =
    useState(false);

  // =========================================================
  // FETCH API
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError("");

        const res =
          await fetch(DATA_API);

        if (!res.ok) {
          throw new Error(
            `API error: ${res.status}`
          );
        }

        const jsonData =
          await res.json();

        // ===================================================
        // FILTER BY LOGGED-IN USERNAME
        // ===================================================

        const filtered =
          Array.isArray(jsonData)
            ? jsonData.filter(
                (item) =>
                  String(
                    item.UserName ?? ""
                  ).trim() ===
                  String(
                    username ?? ""
                  ).trim()
              )
            : [];

        // ===================================================
        // ONLY RECORDS HAVING heading1 + pdf1
        // ===================================================

        const validData =
          filtered.filter(
            (item) =>
              String(
                item.heading1 ?? ""
              ).trim() &&
              String(
                item.pdf1 ?? ""
              ).trim()
          );

        setData(validData);

        setSelectedIndex(0);
      } catch (error) {
        console.error(
          "Error fetching API:",
          error
        );

        setApiError(
          "Unable to load PDF information."
        );
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    } else {
      setLoading(false);

      setApiError(
        "User session not found. Please login again."
      );
    }
  }, [username]);

  // =========================================================
  // CURRENT RECORD
  // =========================================================

  const selectedData =
    data[selectedIndex];

  // =========================================================
  // CURRENT GOOGLE DRIVE LINK
  // =========================================================

  const driveLink =
    selectedData?.pdf1 || "";

  // =========================================================
  // EXTRACT FILE ID
  // =========================================================

  const fileId =
    getDriveFileId(driveLink);

  // =========================================================
  // GOOGLE DRIVE PREVIEW URL
  //
  // SAME FORMAT AS YOUR OLD WORKING CODE
  // =========================================================

  const PDF_URL = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`
    : "";

  // =========================================================
  // GOOGLE DRIVE OPEN URL
  //
  // SAME FORMAT AS YOUR OLD WORKING CODE
  // =========================================================

  const PDF_VIEW_URL = fileId
    ? `https://drive.google.com/file/d/${fileId}/view`
    : "";

  // =========================================================
  // CURRENT HEADING
  // =========================================================

  const currentHeading =
    selectedData?.heading1 ||
    "Golden Dreams";

  // =========================================================
  // SCROLL DIRECTION
  // =========================================================

  useEffect(() => {
    let wheelStopTimer;

    const handleWheel = (event) => {
      const direction =
        event.deltaY > 0
          ? "down"
          : "up";

      setScrollDirection(direction);

      setScrollAnimation(false);

      requestAnimationFrame(() => {
        setScrollAnimation(true);
      });

      clearTimeout(wheelStopTimer);

      wheelStopTimer =
        setTimeout(() => {
          setScrollAnimation(false);
        }, 900);
    };

    window.addEventListener(
      "wheel",
      handleWheel,
      { passive: true }
    );

    return () => {
      clearTimeout(wheelStopTimer);

      window.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, []);

  // =========================================================
  // TOUCH SWIPE
  // =========================================================

  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (event) => {
      if (
        event.touches &&
        event.touches.length > 0
      ) {
        touchStartY =
          event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      if (
        !event.touches ||
        event.touches.length === 0
      ) {
        return;
      }

      const currentY =
        event.touches[0].clientY;

      const difference =
        touchStartY - currentY;

      if (Math.abs(difference) < 8) {
        return;
      }

      const direction =
        difference > 0
          ? "down"
          : "up";

      setScrollDirection(direction);

      setScrollAnimation(false);

      requestAnimationFrame(() => {
        setScrollAnimation(true);
      });

      setTimeout(() => {
        setScrollAnimation(false);
      }, 900);
    };

    window.addEventListener(
      "touchstart",
      handleTouchStart,
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      handleTouchMove,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "touchstart",
        handleTouchStart
      );

      window.removeEventListener(
        "touchmove",
        handleTouchMove
      );
    };
  }, []);

  // =========================================================
  // SELECT PDF
  // =========================================================

  const selectPDF = (index) => {
    setSelectedIndex(index);

    setScrollDirection(null);
    setScrollAnimation(false);
  };

  // =========================================================
  // OPEN PDF
  // =========================================================

  const openPDF = () => {
    if (!PDF_VIEW_URL) {
      return;
    }

    window.open(
      PDF_VIEW_URL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================================================
  // FULLSCREEN
  // =========================================================

  const toggleFullscreen =
    async () => {
      const viewer =
        document.getElementById(
          "golden-dreams-viewer"
        );

      try {
        if (
          !document.fullscreenElement
        ) {
          await viewer?.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        console.error(
          "Fullscreen error:",
          error
        );
      }
    };

  // =========================================================
  // FULLSCREEN STATE
  // =========================================================

  useEffect(() => {
    const handleFullscreenChange =
      () => {
        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100dvh",
          minHeight: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          flexDirection: "column",

          background:
            "radial-gradient(circle at center, #1b1e23 0%, #090a0d 55%, #020203 100%)",

          color: "#fff",
        }}
      >
        <MenuBook
          sx={{
            fontSize: 48,
            color: "#d6b56d",
            mb: 2,

            filter:
              "drop-shadow(0 0 15px rgba(214,181,109,.5))",
          }}
        />

        <Typography
          sx={{
            fontSize: 13,
            letterSpacing: 2,
            color:
              "rgba(255,255,255,.55)",
          }}
        >
          LOADING DIGITAL ALBUM
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 0.7,
            mt: 2,
          }}
        >
          {[0, 1, 2].map(
            (item) => (
              <Box
                key={item}
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    "#d6b56d",

                  animation:
                    `loginPdfDot 1.2s ${item * 0.2}s infinite ease-in-out`,
                }}
              />
            )
          )}
        </Box>
      </Box>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    apiError ||
    data.length === 0
  ) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100dvh",
          minHeight: "100vh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          flexDirection: "column",

          background:
            "radial-gradient(circle at center, #1b1e23 0%, #090a0d 55%, #020203 100%)",

          color: "#fff",

          textAlign: "center",

          px: 3,
        }}
      >
        <MenuBook
          sx={{
            fontSize: 48,
            color: "#d6b56d",
            mb: 2,
          }}
        />

        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 700,
            mb: 1,
          }}
        >
          {apiError ||
            "No PDF found for this user"}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color:
              "rgba(255,255,255,.45)",
          }}
        >
          Please check your login
          or Google Sheet data.
        </Typography>
      </Box>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      id="golden-dreams-viewer"
      sx={{
        width: "100%",
        height: "100dvh",
        minHeight: "100vh",

        position: "relative",

        overflow: "hidden",

        background:
          "radial-gradient(circle at center, #1b1e23 0%, #090a0d 55%, #020203 100%)",

        color: "#fff",

        userSelect: "none",

        WebkitTapHighlightColor:
          "transparent",
      }}
    >
      {/* BACKGROUND */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,

          pointerEvents: "none",

          background:
            "radial-gradient(circle at 50% 45%, rgba(255,255,255,.055), transparent 48%)",

          zIndex: 0,
        }}
      />

      {/* =====================================================
          PDF FRAME
      ===================================================== */}

      <Box
        sx={{
          position: "absolute",

          top: {
            xs:
              data.length > 1
                ? 112
                : 66,

            sm:
              data.length > 1
                ? 122
                : 76,

            md:
              data.length > 1
                ? 132
                : 84,
          },

          bottom: {
            xs: 55,
            sm: 62,
            md: 70,
          },

          left: {
            xs: 4,
            sm: 14,
            md: 38,
          },

          right: {
            xs: 4,
            sm: 14,
            md: 38,
          },

          overflow: "hidden",

          borderRadius: {
            xs: "10px",
            sm: "15px",
            md: "20px",
          },

          background: "#111",

          border:
            "1px solid rgba(255,255,255,.09)",

          boxShadow:
            "0 30px 100px rgba(0,0,0,.82)",

          zIndex: 2,
        }}
      >
        <iframe
          key={PDF_URL}
          src={PDF_URL}
          title={currentHeading}
          allow="autoplay"
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",

            border: "none",

            display: "block",

            background: "#111",
          }}
        />

        {/* EDGE EFFECT */}

        <Box
          sx={{
            position: "absolute",
            inset: 0,

            pointerEvents: "none",

            background:
              "linear-gradient(90deg, rgba(0,0,0,.20), transparent 12%, transparent 88%, rgba(0,0,0,.20))",

            zIndex: 4,
          }}
        />
      </Box>

      {/* =====================================================
          LEFT SCROLL INDICATOR
      ===================================================== */}

      {scrollDirection && (
        <Box
          sx={{
            position: "absolute",

            left: {
              xs: 14,
              sm: 24,
              md: 48,
            },

            top: "50%",

            transform:
              "translateY(-50%)",

            width: {
              xs: 34,
              sm: 38,
              md: 42,
            },

            height: {
              xs: 145,
              sm: 165,
              md: 185,
            },

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            pointerEvents: "none",

            zIndex: 60,

            opacity:
              scrollAnimation ? 1 : 0,

            transition:
              "opacity .3s ease",

            "&::before": {
              content: '""',

              position: "absolute",

              inset: 0,

              borderRadius: "30px",

              background:
                "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",

              border:
                "1px solid rgba(255,255,255,.08)",

              backdropFilter:
                "blur(12px)",

              boxShadow:
                "0 10px 35px rgba(0,0,0,.35)",

              opacity: .75,
            },

            "@media (max-width:600px)":
              {
                left: 10,
                height: 135,
              },
          }}
        >
          {/* TRACK */}

          <Box
            sx={{
              position: "absolute",

              top: 27,
              bottom: 27,

              left: "50%",

              width: "1px",

              transform:
                "translateX(-50%)",

              background:
                "linear-gradient(180deg, transparent, rgba(214,181,109,.55) 25%, rgba(214,181,109,.55) 75%, transparent)",

              boxShadow:
                "0 0 7px rgba(214,181,109,.25)",
            }}
          />

          {/* UP */}

          <Box
            sx={{
              position: "absolute",

              top: 8,

              left: "50%",

              transform:
                "translateX(-50%)",

              color:
                scrollDirection ===
                "up"
                  ? "#d6b56d"
                  : "rgba(255,255,255,.22)",

              filter:
                scrollDirection ===
                "up"
                  ? "drop-shadow(0 0 7px rgba(214,181,109,.75))"
                  : "none",

              animation:
                scrollDirection ===
                "up"
                  ? "indicatorArrowUp .8s ease-in-out infinite"
                  : "none",

              zIndex: 3,

              "& svg": {
                fontSize: {
                  xs: 19,
                  sm: 21,
                  md: 23,
                },
              },
            }}
          >
            <KeyboardArrowUp />
          </Box>

          {/* DOWN */}

          <Box
            sx={{
              position: "absolute",

              bottom: 8,

              left: "50%",

              transform:
                "translateX(-50%)",

              color:
                scrollDirection ===
                "down"
                  ? "#d6b56d"
                  : "rgba(255,255,255,.22)",

              filter:
                scrollDirection ===
                "down"
                  ? "drop-shadow(0 0 7px rgba(214,181,109,.75))"
                  : "none",

              animation:
                scrollDirection ===
                "down"
                  ? "indicatorArrowDown .8s ease-in-out infinite"
                  : "none",

              zIndex: 3,

              "& svg": {
                fontSize: {
                  xs: 19,
                  sm: 21,
                  md: 23,
                },
              },
            }}
          >
            <KeyboardArrowDown />
          </Box>

          {/* PARTICLE */}

          <Box
            sx={{
              position: "absolute",

              left: "50%",

              width: {
                xs: 6,
                sm: 7,
                md: 8,
              },

              height: {
                xs: 6,
                sm: 7,
                md: 8,
              },

              transform:
                "translateX(-50%)",

              borderRadius: "50%",

              background:
                "radial-gradient(circle, #fff8d8 0%, #d6b56d 42%, rgba(214,181,109,.15) 72%, transparent 100%)",

              boxShadow:
                "0 0 8px rgba(214,181,109,.95), 0 0 20px rgba(214,181,109,.55), 0 0 35px rgba(214,181,109,.25)",

              zIndex: 4,

              animation:
                scrollDirection ===
                "down"
                  ? "indicatorMoveDown .8s cubic-bezier(.22,.61,.36,1) forwards"
                  : "indicatorMoveUp .8s cubic-bezier(.22,.61,.36,1) forwards",
            }}
          />
        </Box>
      )}

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <Box
        sx={{
          position: "absolute",

          top: 0,
          left: 0,
          right: 0,

          minHeight: {
            xs: 65,
            sm: 74,
            md: 82,
          },

          display: "flex",

          alignItems: "center",

          justifyContent:
            "space-between",

          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },

          py: 1,

          background:
            "linear-gradient(180deg, rgba(0,0,0,.92), rgba(0,0,0,.40), transparent)",

          zIndex: 30,
        }}
      >
        {/* LEFT TITLE */}

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: .8,

            px: {
              xs: 1.4,
              sm: 2,
            },

            py: {
              xs: .65,
              sm: .8,
            },

            borderRadius: "50px",

            background:
              "rgba(12,12,13,.72)",

            backdropFilter:
              "blur(20px)",

            border:
              "1px solid rgba(255,255,255,.09)",

            maxWidth: {
              xs: "65%",
              sm: "70%",
              md: "60%",
            },

            minWidth: 0,
          }}
        >
          <MenuBook
            sx={{
              flexShrink: 0,

              fontSize: {
                xs: 17,
                sm: 19,
              },

              color: "#d6b56d",

              filter:
                "drop-shadow(0 0 8px rgba(214,181,109,.45))",
            }}
          />

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: {
                  xs: 11.5,
                  sm: 13.5,
                  md: 15,
                },

                fontWeight: 700,

                letterSpacing: .5,

                overflow: "hidden",

                textOverflow:
                  "ellipsis",

                whiteSpace:
                  "nowrap",
              }}
            >
              {currentHeading}
            </Typography>

            <Typography
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },

                fontSize: 9,

                color:
                  "rgba(255,255,255,.40)",

                letterSpacing: 1,
              }}
            >
              DIGITAL ALBUM
            </Typography>
          </Box>
        </Box>

        {/* RIGHT CONTROLS */}

        <Box
          sx={{
            display: "flex",

            gap: .6,

            alignItems: "center",

            flexShrink: 0,
          }}
        >
          {/* FULLSCREEN */}

          <Tooltip
            title={
              fullscreen
                ? "Exit fullscreen"
                : "Fullscreen"
            }
          >
            <IconButton
              onClick={
                toggleFullscreen
              }
              sx={{
                width: {
                  xs: 42,
                  sm: 46,
                },

                height: {
                  xs: 42,
                  sm: 46,
                },

                color: "#fff",

                background:
                  "rgba(255,255,255,.065)",

                border:
                  "1px solid rgba(255,255,255,.12)",

                backdropFilter:
                  "blur(18px)",

                "&:hover": {
                  background:
                    "rgba(255,255,255,.13)",
                },
              }}
            >
              {fullscreen ? (
                <CloseFullscreen
                  sx={{
                    fontSize: 20,
                  }}
                />
              ) : (
                <Fullscreen
                  sx={{
                    fontSize: 21,
                  }}
                />
              )}
            </IconButton>
          </Tooltip>

          {/* OPEN PDF */}

          <Tooltip title="Open PDF">
            <IconButton
              onClick={openPDF}
              sx={{
                width: {
                  xs: 42,
                  sm: 46,
                },

                height: {
                  xs: 42,
                  sm: 46,
                },

                color: "#d6b56d",

                background:
                  "rgba(214,181,109,.10)",

                border:
                  "1px solid rgba(214,181,109,.25)",

                backdropFilter:
                  "blur(18px)",

                "&:hover": {
                  background:
                    "rgba(214,181,109,.20)",
                },
              }}
            >
              <OpenInNew
                sx={{
                  fontSize: 19,
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* =====================================================
          PDF SELECTOR
      ===================================================== */}

      {data.length > 1 && (
        <Box
          sx={{
            position: "absolute",

            top: {
              xs: 68,
              sm: 77,
              md: 86,
            },

            left: "50%",

            transform:
              "translateX(-50%)",

            width: {
              xs: "calc(100% - 20px)",
              sm: "calc(100% - 40px)",
              md: "auto",
            },

            maxWidth: "90%",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: .7,

            overflowX: "auto",

            px: .5,
            py: .5,

            zIndex: 40,

            scrollbarWidth: "none",

            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {data.map(
            (item, index) => {
              const active =
                selectedIndex ===
                index;

              return (
                <Box
                  key={`${item.heading1}-${index}`}
                  component="button"
                  type="button"
                  onClick={() =>
                    selectPDF(index)
                  }
                  sx={{
                    flexShrink: 0,

                    border: active
                      ? "1px solid rgba(214,181,109,.55)"
                      : "1px solid rgba(255,255,255,.10)",

                    background: active
                      ? "rgba(214,181,109,.16)"
                      : "rgba(10,10,11,.70)",

                    color: active
                      ? "#d6b56d"
                      : "rgba(255,255,255,.65)",

                    borderRadius:
                      "30px",

                    px: {
                      xs: 1.5,
                      sm: 2,
                    },

                    py: {
                      xs: .55,
                      sm: .7,
                    },

                    fontSize: {
                      xs: 9.5,
                      sm: 11,
                    },

                    fontWeight: active
                      ? 700
                      : 500,

                    cursor:
                      "pointer",

                    backdropFilter:
                      "blur(18px)",

                    boxShadow: active
                      ? "0 0 18px rgba(214,181,109,.12)"
                      : "none",

                    whiteSpace:
                      "nowrap",

                    maxWidth: {
                      xs: 150,
                      sm: 220,
                    },

                    overflow: "hidden",

                    textOverflow:
                      "ellipsis",

                    "&:hover": {
                      borderColor:
                        "rgba(214,181,109,.45)",

                      color:
                        "#d6b56d",
                    },
                  }}
                >
                  {item.heading1}
                </Box>
              );
            }
          )}
        </Box>
      )}

      {/* =====================================================
          BOTTOM LABEL
      ===================================================== */}

      <Box
        sx={{
          position: "absolute",

          left: "50%",

          bottom: {
            xs: 10,
            sm: 14,
            md: 18,
          },

          transform:
            "translateX(-50%)",

          px: {
            xs: 1.5,
            sm: 2,
          },

          py: .7,

          borderRadius: "30px",

          background:
            "rgba(8,8,9,.72)",

          backdropFilter:
            "blur(18px)",

          border:
            "1px solid rgba(255,255,255,.08)",

          zIndex: 20,

          opacity: 1,

          pointerEvents:
            "none",

          whiteSpace:
            "nowrap",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 8,
              sm: 9,
              md: 10,
            },

            letterSpacing: {
              xs: 1,
              sm: 1.5,
            },

            color:
              "rgba(255,255,255,.42)",

            textTransform:
              "uppercase",
          }}
        >
          Scroll to explore
        </Typography>
      </Box>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`

          @keyframes loginPdfDot {

            0%,
            100% {
              opacity: .25;
              transform: translateY(0);
            }

            50% {
              opacity: 1;
              transform: translateY(-5px);
            }
          }


          @keyframes indicatorMoveDown {

            0% {
              top: 25%;
              opacity: 0;

              transform:
                translateX(-50%)
                scale(.45);
            }

            15% {
              opacity: 1;
            }

            50% {
              transform:
                translateX(-50%)
                scale(1);
            }

            82% {
              opacity: 1;
            }

            100% {
              top: 75%;
              opacity: 0;

              transform:
                translateX(-50%)
                scale(1.15);
            }
          }


          @keyframes indicatorMoveUp {

            0% {
              top: 75%;
              opacity: 0;

              transform:
                translateX(-50%)
                scale(.45);
            }

            15% {
              opacity: 1;
            }

            50% {
              transform:
                translateX(-50%)
                scale(1);
            }

            82% {
              opacity: 1;
            }

            100% {
              top: 25%;
              opacity: 0;

              transform:
                translateX(-50%)
                scale(1.15);
            }
          }


          @keyframes indicatorArrowUp {

            0%,
            100% {
              transform:
                translateX(-50%)
                translateY(2px);

              opacity: .45;
            }

            50% {
              transform:
                translateX(-50%)
                translateY(-4px);

              opacity: 1;
            }
          }


          @keyframes indicatorArrowDown {

            0%,
            100% {
              transform:
                translateX(-50%)
                translateY(-2px);

              opacity: .45;
            }

            50% {
              transform:
                translateX(-50%)
                translateY(4px);

              opacity: 1;
            }
          }


          @media (max-width: 600px) {

            #golden-dreams-viewer iframe {
              touch-action: pan-y;
            }

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