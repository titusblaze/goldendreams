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
  const lastScrollY = useRef(0);

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
     LOGOUT
  ========================================================= */

  const handleLogout = useCallback(() => {
    // Clear all known login/session keys.
    const localKeysToRemove = [
      "sessionToken",
      "isLoggedIn",
      "username",
      "userName",
      "UserName",
      "goldenDreamsUserName",
    ];

    localKeysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    const sessionKeysToRemove = [
      "sessionToken",
      "isLoggedIn",
      "username",
      "userName",
      "UserName",
      "goldenDreamsUserName",
    ];

    sessionKeysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Notify other components that logout has occurred.
    window.dispatchEvent(new Event("golden-dreams-logout"));

    // Navigate to login without keeping the dashboard as
    // the current history entry.
    navigate("/login", { replace: true });

    // Start the login page at the top.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [navigate]);

  /* =========================================================
     UI
  ========================================================= */

  return (
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
          <IconButton
            onClick={handleLogout}
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
            }}
          >
            <LogoutIcon
              sx={{
                fontSize: { xs: 21, sm: 23 },
              }}
            />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}