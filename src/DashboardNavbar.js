
import React, { useRef, useState, useEffect, useCallback } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import Logo from "../src/assets/image/logo512.png";

export default function DashboardNavbar() {
  const navigate = useNavigate();

  const [showNavbar, setShowNavbar] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const lastScrollY = useRef(0);
  const logoutStarted = useRef(false);

  /* =========================================================
     NAVBAR SCROLL ANIMATION
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     FINAL LOGOUT
  ========================================================= */

  const finishLogout = useCallback(() => {
    const keysToRemove = [
      "sessionToken",
      "isLoggedIn",
      "username",
      "userName",
      "UserName",
      "goldenDreamsUserName",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Notify other components that logout has occurred.
    window.dispatchEvent(new Event("golden-dreams-logout"));

    // Navigate to login.
    navigate("/login", { replace: true });

    // Start login page at the top.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [navigate]);

  /* =========================================================
     LOGOUT WITH GOOGLE SHEETS ACTIVITY LOG
  ========================================================= */

  const handleLogout = useCallback(async () => {
    // Prevent duplicate logout requests from rapid clicks.
    if (logoutStarted.current) return;
    logoutStarted.current = true;

    setIsLoggingOut(true);

    // Show the existing Thank You screen immediately.
    setShowThankYou(true);

    // Read the token before clearing any session data.
    const token =
      localStorage.getItem("sessionToken") ||
      sessionStorage.getItem("sessionToken");

    try {
      if (token) {
        const response = await fetch(
          "https://golden-dreams-api-proxy.titus-blaze.workers.dev/logout",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success === true) {
          console.log("Logout activity successfully recorded.");
        } else {
          console.warn(
            "Logout activity could not be recorded:",
            result.error || "Unknown error"
          );
        }
      }
    } catch (error) {
      console.warn("Logout activity request failed:", error);
    } finally {
      // Navigate only after the Google Sheets logging request has settled.
      // If the request fails, still complete local logout for safety.
      finishLogout();
    }
  }, [finishLogout]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          background:
            "linear-gradient(110deg, #090A0F 0%, #15130F 50%, #090A0F 100%)",
          color: "#F5E7C1",
          zIndex: 999999,
          transform: showNavbar
            ? "translateY(0)"
            : "translateY(-110%)",
          transition: "transform 0.35s ease-in-out",
          pointerEvents: showNavbar ? "auto" : "none",
          borderBottom: "1px solid rgba(212,175,91,0.35)",
          boxShadow: "0 5px 24px rgba(0,0,0,0.28)",

          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: "80%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(231,199,121,0.65), transparent)",
          },
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            width: "100%",
            minHeight: {
              xs: "62px",
              sm: "72px",
              md: "78px",
            },
            px: {
              xs: 1.5,
              sm: 3,
              md: 5,
              lg: 7,
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Logo and Brand */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              minWidth: 0,
              flex: "1 1 auto",
            }}
          >
            <Box
              component="img"
              src={Logo}
              alt="Golden Dreams Logo"
              sx={{
                width: { xs: 38, sm: 46, md: 50 },
                height: { xs: 38, sm: 46, md: 50 },
                flexShrink: 0,
                objectFit: "contain",
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "1rem",
                    sm: "1.25rem",
                    md: "1.45rem",
                  },
                  fontWeight: 750,
                  lineHeight: 1.2,
                  letterSpacing: {
                    xs: "0.02em",
                    sm: "0.045em",
                  },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  background:
                    "linear-gradient(90deg, #F5E5B5 0%, #D5AE5D 48%, #F4DCA0 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Golden Dreams
              </Typography>

              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                  mt: 0.35,
                  fontSize: "0.62rem",
                  letterSpacing: "0.25em",
                  color: "rgba(235,221,188,0.65)",
                }}
              >
                CREATIVE STUDIO
              </Typography>
            </Box>
          </Box>

          {/* Logout Button */}

          <Tooltip title="Logout" arrow>
            <span>
              <IconButton
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Logout"
                sx={{
                  width: { xs: 40, sm: 46, md: 48 },
                  height: { xs: 40, sm: 46, md: 48 },
                  flexShrink: 0,
                  color: "#E6C477",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(145deg, rgba(214,175,87,0.13), rgba(214,175,87,0.035))",
                  border: "1px solid rgba(214,175,87,0.28)",
                  transition: "all 0.25s ease",

                  "&:hover": {
                    color: "#111111",
                    background:
                      "linear-gradient(135deg, #F1D995, #C69B42)",
                    borderColor: "#F1D995",
                    boxShadow: "0 0 20px rgba(214,175,87,0.22)",
                    transform: "translateY(-1px)",
                  },

                  "&:active": {
                    transform: "scale(0.96)",
                  },

                  "&.Mui-disabled": {
                    color: "rgba(230,196,119,0.45)",
                  },
                }}
              >
                <LogoutIcon
                  sx={{
                    fontSize: { xs: 21, sm: 23 },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* =====================================================
          GOLDEN DREAMS THANK YOU SCREEN
      ===================================================== */}

      {showThankYou && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label="Thank you for choosing Golden Dreams"
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            px: 2,
            background:
              "radial-gradient(ellipse at center, #242016 0%, #11110F 48%, #07080D 100%)",
            animation: "gdFadeIn 0.65s ease both",

            "@keyframes gdFadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },

            "@keyframes gdLogoReveal": {
              "0%": {
                opacity: 0,
                transform: "scale(0.72)",
              },
              "70%": {
                opacity: 1,
                transform: "scale(1.06)",
              },
              "100%": {
                opacity: 1,
                transform: "scale(1)",
              },
            },

            "@keyframes gdGoldGlow": {
              "0%, 100%": {
                textShadow: "0 0 10px rgba(224,187,103,0.25)",
              },
              "50%": {
                textShadow: "0 0 25px rgba(224,187,103,0.7)",
              },
            },

            "@keyframes gdFloat": {
              "0%, 100%": {
                transform: "translateY(0px)",
              },
              "50%": {
                transform: "translateY(-9px)",
              },
            },

            "@keyframes gdSparkle": {
              "0%, 100%": {
                opacity: 0.25,
                transform: "scale(0.7) rotate(0deg)",
              },
              "50%": {
                opacity: 1,
                transform: "scale(1.2) rotate(45deg)",
              },
            },

            "&::before": {
              content: '""',
              position: "absolute",
              width: "min(85vw, 620px)",
              height: "min(85vw, 620px)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(211,170,83,0.10), transparent 70%)",
              pointerEvents: "none",
            },
          }}
        >
          {/* Decorative Gold Sparkles */}

          <Typography
            sx={{
              position: "absolute",
              top: "16%",
              left: "15%",
              color: "#D9B76B",
              fontSize: "25px",
              animation: "gdSparkle 2.5s ease-in-out infinite",
            }}
          >
            ✦
          </Typography>

          <Typography
            sx={{
              position: "absolute",
              top: "24%",
              right: "17%",
              color: "#F0D795",
              fontSize: "19px",
              animation: "gdSparkle 3s ease-in-out infinite 0.5s",
            }}
          >
            ✧
          </Typography>

          <Typography
            sx={{
              position: "absolute",
              bottom: "20%",
              left: "20%",
              color: "#D9B76B",
              fontSize: "18px",
              animation: "gdSparkle 2.8s ease-in-out infinite 0.8s",
            }}
          >
            ✧
          </Typography>

          <Typography
            sx={{
              position: "absolute",
              bottom: "18%",
              right: "16%",
              color: "#E7C77D",
              fontSize: "26px",
              animation: "gdSparkle 2.4s ease-in-out infinite 0.3s",
            }}
          >
            ✦
          </Typography>

          {/* Thank You Content */}

          <Box
            sx={{
              width: "100%",
              maxWidth: 540,
              textAlign: "center",
              position: "relative",
              zIndex: 1,
              px: { xs: 2, sm: 4 },
              py: { xs: 4, sm: 5 },
              borderRadius: "28px",
              border: "1px solid rgba(215,177,94,0.25)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
              boxShadow:
                "0 0 70px rgba(205,165,78,0.09), inset 0 0 35px rgba(215,177,94,0.025)",
            }}
          >
            {/* Big Golden Dreams Logo */}

            <Box
              component="img"
              src={Logo}
              alt="Golden Dreams"
              sx={{
                width: { xs: 145, sm: 185, md: 205 },
                height: { xs: 145, sm: 185, md: 205 },
                objectFit: "contain",
                mb: 2,
                filter:
                  "drop-shadow(0 0 18px rgba(221,184,103,0.35))",
                animation: "gdLogoReveal 1s ease both",
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: "1.65rem",
                  sm: "2.1rem",
                  md: "2.4rem",
                },
                fontWeight: 800,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                background:
                  "linear-gradient(90deg, #F7E7BA, #D5AC58, #F7E7BA)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gdGoldGlow 3s ease-in-out infinite",
              }}
            >
              Golden Dreams
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "0.68rem",
                letterSpacing: "0.35em",
                color: "rgba(239,220,177,0.65)",
              }}
            >
              CREATIVE STUDIO
            </Typography>

            {/* Gold Divider */}

            <Box
              sx={{
                width: 110,
                height: "1px",
                mx: "auto",
                my: 3,
                background:
                  "linear-gradient(90deg, transparent, #D8B66A, transparent)",
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.25rem" },
                fontWeight: 700,
                color: "#F1D797",
                mb: 1.5,
              }}
            >
              Thank You! ❤️
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.12rem",
                },
                color: "#F5E7C8",
                fontWeight: 500,
                lineHeight: 1.7,
              }}
            >
              Thank you for choosing Golden Dreams.
            </Typography>

            {/* Cute Smile */}

            <Typography
              sx={{
                fontSize: "2.7rem",
                mt: 2,
                display: "inline-block",
                animation: "gdFloat 2.5s ease-in-out infinite",
              }}
            >
              😊
            </Typography>

            {/* Quote */}

            <Typography
              sx={{
                mt: 1.5,
                color: "#DCC38D",
                fontSize: {
                  xs: "0.92rem",
                  sm: "1rem",
                },
                fontStyle: "italic",
                lineHeight: 1.8,
                px: 1,
              }}
            >
              "Every beautiful moment deserves to be remembered."
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                color: "rgba(245,231,193,0.68)",
                fontSize: "0.88rem",
                letterSpacing: "0.04em",
              }}
            >
              We look forward to seeing you again!
            </Typography>

            <Typography
              sx={{
                mt: 2,
                color: "#D7B66D",
                fontSize: "0.8rem",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              — TEAM GOLDEN DREAMS
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}
