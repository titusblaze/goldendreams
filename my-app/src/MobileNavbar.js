// MobileNavbar.js
import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Drawer,
  Typography,
  Stack,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import WidgetsIcon from "@mui/icons-material/Widgets";
import {
  Home,
  KeyboardDoubleArrowUpOutlined,
  Info,
  ContactMail,
  Star,
  AccountCircle,
  Build,
  LocationOn ,
  Phone,
} from "@mui/icons-material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StarsIcon from '@mui/icons-material/Stars';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const radius = 130; // semi-circle radius
const iconSize = 60;
const visibleCount = 3;

const buttonStyle = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  border: "none",
  background: "rgba(30,30,31,0.16)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  outline: "none",
  WebkitTapHighlightColor: "transparent",
  WebkitFocusRingColor: "transparent",
  MozOutlineStyle: "none",
};

// icons factory so we can access navigate inside component
const makeIcons = (navigate) => [
  {
    icon: <Home sx={{ color: "#FFD700" }} />,
    label: "Home",
    action: () => navigate("/"),
  },
  {
    icon: <Star sx={{ color: "#FFD700" }} />,
    label: "Features",
    action: () => navigate("/features"),
  },
  {
    icon: <Info sx={{ color: "#FFD700" }} />,
    label: "Pricing",
    action: () => navigate("/pricing"),
  },
  {
    icon: <ContactMail sx={{ color: "#FFD700" }} />,
    label: "Contact",
    action: () => navigate("/contact"),
  },
  {
    icon: <AccountCircle sx={{ color: "#FFD700" }} />,
    label: "Login",
    action: () => navigate("/login"),
  },

  // Utility buttons
  {
    icon: <KeyboardDoubleArrowUpOutlined sx={{ color: "#FFD700" }} />,
    label: "Page Top",
    action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  },
  {
    icon: <Phone sx={{ color: "#FFD700" }} />,
    label: "Quick Call",
    action: () => {
      // Replace number with your support number
      window.location.href = "tel:+919976149065";
    },
  },
  {
  icon: <LocationOn sx={{ color: "#FFD700" }} />,
  label: "Location",
  action: () => {
    const mapUrl = "https://maps.app.goo.gl/oy93k3BMgRToh1gYA";

    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = mapUrl;  // opens Google Maps app
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = mapUrl;  // also opens Google Maps app
    } else {
      window.open(mapUrl, "_blank");  // desktop browser
    }
  }
},

 {
    icon: <WhatsAppIcon sx={{ color: "#FFD700" }} />,
    label: "WhatsApp",
    action: () => {
      window.location.href = "https://wa.me/919876543210";
    }
  },
  {
    icon: <StarsIcon sx={{ color: "#FFD700" }} />,
    label: "Review",
    action: () => {
      window.location.href = "https://g.page/r/YOUR-GOOGLE-REVIEW-LINK/review";
    }
  },
];

export default function MobileNavbar() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [angleOffset, setAngleOffset] = useState(0);

  const lastScrollRef = useRef(0);
  const tickingRef = useRef(false);
  const dragStartX = useRef(null);

  const icons = makeIcons(navigate);

  const toggleDrawer = () => setDrawerOpen((s) => !s);
  const toggleWidget = () => setWidgetOpen((s) => !s);
  const closeWidget = () => setWidgetOpen(false);

  const glassBg = {
    backgroundColor: "rgba(30, 30, 31, 0.10)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  };

  // scroll hide/show appbar
  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const last = lastScrollRef.current;
        if (current > last + 10 && current > 50) {
          setShowBar(false);
        } else if (current < last - 10 || current <= 50) {
          setShowBar(true);
        }
        lastScrollRef.current = current;
        tickingRef.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const blossomVisible = !showBar;

  // Drag handlers for arc
  const handleDragStart = (e) => {
    dragStartX.current = e.clientX ?? (e.touches && e.touches[0].clientX) ?? null;
  };
  const handleDragMove = (e) => {
    if (dragStartX.current !== null) {
      const currentX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? null;
      if (currentX === null) return;
      const deltaX = currentX - dragStartX.current;
      setAngleOffset((prev) => prev - deltaX * 0.005); // change sensitivity if needed
      dragStartX.current = currentX;
    }
  };
  const handleDragEnd = () => {
    dragStartX.current = null;
    // optionally snap angleOffset to nearest step
  };

  // compute positions for icons along semicircle (angles from 0 to PI)
  const renderArcIcons = () => {
    const count = icons.length;


    
    const startAngle = 0;
    const endAngle = Math.PI;
    return icons.map((item, index) => {
      const baseAngle = Math.PI / 2; // semi-circle bottom
               // const angleStep = Math.PI / (icons.length - 1);
                const angleStep = Math.PI / (visibleCount + 1);
                const angle = baseAngle + ((index - icons.length / 2) * angleStep) + angleOffset;

                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);

      return (
        <Paper
          key={index}
          elevation={6}
          onClick={() => {
            try {
              item.action?.();
            } catch (err) {
              // fallback
              console.error(err);
            }
            closeWidget();
          }}
          sx={{
            position: "absolute",
            left: `calc(50% + ${x}px - ${iconSize / 2}px)`,
            bottom: `${y}px`,
            width: iconSize,
            height: iconSize,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.7)",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
            "&:hover": { transform: "scale(1.08)", boxShadow: "0 6px 18px rgba(0,0,0,0.5)" },
            userSelect: "none",
          }}
        >
          {item.icon}
          <Typography variant="caption" fontSize={10} color="#FFD700">
            {item.label}
          </Typography>
        </Paper>
      );
    });
  };

  return (
    <>
      {/* Animated AppBar */}
      <motion.div
        animate={{ y: showBar ? 0 : -88 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 2000 }}
      >
        <AppBar position="static" elevation={0} sx={{ ...glassBg, px: 2, py: 1, }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src="/logo512.png"
                alt="Logo"
                sx={{ width: 36, height: 36, borderRadius: "8px" }}
              />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  background: "linear-gradient(90deg, #FFD700, #FFB300)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  letterSpacing: 0.3,
                }}
              >
                Golden Dream
              </Typography>
            </Box>

            <IconButton aria-label="open menu" onClick={toggleDrawer} sx={{ color: "#FFD700" }}>
              <MenuIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* Floating Widget Icon */}
      <motion.div
        animate={{ y: blossomVisible ? 0 : 90, opacity: blossomVisible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          bottom: 22,
          transform: "translateX(-50%)",
          zIndex: 2000,
          pointerEvents: blossomVisible ? "auto" : "none",
        }}
      >
        <motion.button
          onClick={toggleWidget}
          whileTap={{ scale: 0.92 }}
          animate={{
            rotate: blossomVisible ? [0, -8, 8, -6, 6, 0] : 0,
          }}
          transition={{ duration: 0.9, repeat: blossomVisible ? Infinity : 0 }}
          style={buttonStyle}
        >
          <WidgetsIcon sx={{ fontSize: 30, color: "#FFD700" }} />
        </motion.button>
      </motion.div>

      {/* Semi-circle Arc Menu */}
      {widgetOpen && (
        <ClickAwayListener onClickAway={closeWidget}>
          <Box
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            sx={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: radius * 2 + 50,
              height: radius + 50,
              zIndex: 1999,
              overflow: "visible",
              background: "rgba(30,30,31,0.16)",
              borderTopLeftRadius: radius + 25,
              borderTopRightRadius: radius + 25,
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
              {renderArcIcons()}
            </Box>
          </Box>
        </ClickAwayListener>
      )}

      {/* Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            marginTop: "64px",
            height: "calc(100% - 64px)",
            width: 260,
            backgroundColor: "rgba(30,30,31,0.10)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ height: "100%", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={toggleDrawer} sx={{ color: "#FFD700" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Stack spacing={2}>
            {[
              { label: "Home", path: "/" },
              { label: "Features", path: "/features" },
              { label: "Pricing", path: "/pricing" },
              { label: "Contact", path: "/contact" },
              { label: "Live", path: "/live" },
              { label: "Login", path: "/login" },
            ].map((item) => (
              <Typography
                key={item.label}
                sx={{ color: "#FFD700", fontSize: "1.05rem", fontWeight: 600, cursor: "pointer" }}
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(item.path);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
