
import React, { useState, useEffect, useRef } from "react";
import { Box, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  ["HOME", "/"],
  ["PRICING", "/pricing"],
  ["FEATURES", "/features"],
  ["STORE", "/store"],
  ["CONTACT", "/contact"],
  ["LIVE", "/live"],
  ["LOGIN", "/login"],
];

const Navbar = () => {
  const location = useLocation();

  const [hoverBtn, setHoverBtn] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  const buttonsRef = useRef({});

  // Automatically identify active page from current URL
  const activeBtn =
    navItems.find(([, link]) => link === location.pathname)?.[0] || null;

  // Update indicator on page change, Back, Forward and hover
  useEffect(() => {
    const current = hoverBtn || activeBtn;
    const btn = buttonsRef.current[current];

    if (btn) {
      const rect = btn.getBoundingClientRect();
      const parentRect = btn.parentElement.getBoundingClientRect();

      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [hoverBtn, activeBtn, location.pathname]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1200,
        display: { xs: "none", md: "flex" },
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          position: "relative",
          backgroundColor: "rgba(30,30,31,0.3)",
          backdropFilter: "blur(10px)",
          padding: "0.6rem 0rem",
          gap: "1rem",
          borderRadius: "40px",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        }}
      >
        {(activeBtn || hoverBtn) && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              height: "100%",
              backgroundColor: "#5858586b",
              borderRadius: "30px",
              transition: "all 0.4s ease",
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        )}

        {navItems.map(([label, link]) => (
          <Button
            key={label}
            component={Link}
            to={link}
            disableRipple
            ref={(el) => (buttonsRef.current[label] = el)}
            onMouseEnter={() => setHoverBtn(label)}
            onMouseLeave={() => setHoverBtn(null)}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            sx={{
              zIndex: 1,
              padding: "0.6rem 1.6rem",
              fontSize: "1rem",
              color: activeBtn === label ? "#FFD700" : "#fff",
              fontWeight: activeBtn === label ? "bold" : "normal",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "transparent",
                color: "#FFD700",
              },
              "&:focus": {
                backgroundColor: "transparent",
              },
              "&:active": {
                backgroundColor: "transparent",
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default Navbar;
