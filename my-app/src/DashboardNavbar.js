import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Logo from "../src/assets/image/logo512.png";
import LogoutIcon from "@mui/icons-material/Logout";

export default function DashboardNavbar() {
  const navigate = useNavigate();

  const [showNavbar, setShowNavbar] = useState(true);

  // Store previous scroll position without causing re-renders
  const lastScrollY = useRef(0);

  useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // At the top → always show
    if (currentScrollY <= 10) {
      setShowNavbar(true);
    }
    // Scroll DOWN ↓ → hide
    else if (currentScrollY > lastScrollY.current) {
      setShowNavbar(false);
    }
    // Scroll UP ↑ → show
    else if (currentScrollY < lastScrollY.current) {
      setShowNavbar(true);
    }

    // Save current position
    lastScrollY.current = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0)",
        color: "black",
        zIndex: 999999,
        padding: "20px 0px",

        // Animation
        transform: showNavbar
          ? "translateY(0)"
          : "translateY(-120%)",

        transition: "transform 0.35s ease-in-out",

        // Prevent clicking when hidden
        pointerEvents: showNavbar ? "auto" : "none",
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              marginRight: 10,
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "white",
            }}
          >
            Goolden Dreams
          </Typography>
        </Box>

        <Tooltip title="Logout" arrow>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              height: "60px",
              width: "60px",
              backgroundColor: "#1e1e1f",
              borderRadius: "50%",
              minWidth: 0,

              "&:hover": {
                backgroundColor: "#125ea8",
              },
            }}
          >
            <LogoutIcon />
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}