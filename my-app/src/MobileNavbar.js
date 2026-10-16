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
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import WidgetsIcon from "@mui/icons-material/Widgets";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardDoubleArrowUpRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowUpRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import StarsRoundedIcon from "@mui/icons-material/Stars";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./assets/image/logo512.png";

// ======================================================
// MIDNIGHT GOLD THEME
// ======================================================

const GOLD = "#FFD700";
const GOLD_LIGHT = "#FFF1A8";
const GOLD_DARK = "#B8860B";
const MIDNIGHT = "#07090D";
const GLASS = "rgba(12, 14, 19, 0.92)";

const radius = 130;
const iconSize = 62;
const visibleCount = 3;

const buttonStyle = {
  width: 62,
  height: 62,
  borderRadius: "50%",
  border: "1px solid rgba(255, 215, 0, 0.7)",
  background:
    "radial-gradient(circle at 30% 20%, rgba(255,215,0,0.15), rgba(9,11,16,0.97) 70%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  outline: "none",
  WebkitTapHighlightColor: "transparent",
  boxShadow:
    "0 0 18px rgba(255,215,0,0.13), inset 0 0 12px rgba(255,215,0,0.06)",
};

// ======================================================
// ARC MENU ITEMS
// ======================================================

const makeIcons = (navigate) => [
  {
    icon: <HomeRoundedIcon />,
    label: "Home",
    action: () => navigate("/"),
  },
  {
    icon: <StarRoundedIcon />,
    label: "Features",
    action: () => navigate("/features"),
  },
  {
    icon: <InfoRoundedIcon />,
    label: "Pricing",
    action: () => navigate("/pricing"),
  },
  {
    icon: <ContactMailRoundedIcon />,
    label: "Contact",
    action: () => navigate("/contact"),
  },
  {
    icon: <AccountCircleRoundedIcon />,
    label: "Login",
    action: () => navigate("/login"),
  },
  {
    icon: <KeyboardDoubleArrowUpRoundedIcon />,
    label: "Page Top",
    action: () =>
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      }),
  },
  {
    icon: <PhoneRoundedIcon />,
    label: "Quick Call",
    action: () => {
      window.location.href = "tel:+919976149065";
    },
  },
  {
    icon: <LocationOnRoundedIcon />,
    label: "Location",
    action: () => {
      window.open(
        "https://maps.app.goo.gl/oy93k3BMgRToh1gYA",
        "_blank",
        "noopener,noreferrer"
      );
    },
  },
  {
    icon: <WhatsAppIcon />,
    label: "WhatsApp",
    action: () => {
      window.location.href = "https://wa.me/919876543210";
    },
  },
  {
    icon: <StarsRoundedIcon />,
    label: "Review",
    action: () => {
      window.location.href =
        "https://g.page/r/YOUR-GOOGLE-REVIEW-LINK/review";
    },
  },
];

// ======================================================
// COMPONENT
// ======================================================

export default function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [angleOffset, setAngleOffset] = useState(0);

  const lastScrollRef = useRef(0);
  const tickingRef = useRef(false);
  const dragStartX = useRef(null);

  const icons = makeIcons(navigate);

  const toggleDrawer = () => setDrawerOpen((state) => !state);
  const toggleWidget = () => setWidgetOpen((state) => !state);
  const closeWidget = () => setWidgetOpen(false);

  // ====================================================
  // HIDE NAVBAR WHILE SCROLLING DOWN
  // ====================================================

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;

      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const previous = lastScrollRef.current;

        if (current > previous + 10 && current > 50) {
          setShowBar(false);
        } else if (current < previous - 10 || current <= 50) {
          setShowBar(true);
        }

        lastScrollRef.current = current;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close menus when the route changes.
  useEffect(() => {
    setDrawerOpen(false);
    setWidgetOpen(false);
  }, [location.pathname]);

  const blossomVisible = !showBar;

  // ====================================================
  // ARC DRAG ROTATION
  // ====================================================

  const getPointerX = (event) => {
    if (event.touches?.length) {
      return event.touches[0].clientX;
    }

    if (event.changedTouches?.length) {
      return event.changedTouches[0].clientX;
    }

    return event.clientX ?? null;
  };

  const handleDragStart = (event) => {
    dragStartX.current = getPointerX(event);
  };

  const handleDragMove = (event) => {
    if (dragStartX.current === null) return;

    const currentX = getPointerX(event);

    if (currentX === null) return;

    const deltaX = currentX - dragStartX.current;

    setAngleOffset((previous) => previous - deltaX * 0.005);

    dragStartX.current = currentX;
  };

  const handleDragEnd = () => {
    dragStartX.current = null;
  };

  // ====================================================
  // RENDER ARC ICONS
  // ====================================================

  const renderArcIcons = () => {
    const angleStep = Math.PI / (visibleCount + 1);

    return icons.map((item, index) => {
      const baseAngle = Math.PI / 2;

      const angle =
        baseAngle +
        ((index - icons.length / 2) * angleStep) +
        angleOffset;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      return (
        <Paper
          key={item.label}
          elevation={0}
          onClick={() => {
            try {
              item.action?.();
            } catch (error) {
              console.error("Arc menu action failed:", error);
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
            gap: "2px",
            boxSizing: "border-box",
            borderRadius: "50%",
            border: "1px solid rgba(255, 215, 0, 0.65)",
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,215,0,0.16), rgba(8,10,15,0.97) 75%)",
            color: GOLD,
            cursor: "pointer",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.42), inset 0 0 10px rgba(255,215,0,0.05)",
            transition:
              "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "scale(1.1)",
              borderColor: GOLD_LIGHT,
              boxShadow:
                "0 0 22px rgba(255,215,0,0.3), inset 0 0 12px rgba(255,215,0,0.1)",
              zIndex: 5,
            },
            "& .MuiSvgIcon-root": {
              fontSize: 23,
              color: GOLD,
            },
          }}
        >
          {item.icon}

          <Typography
            variant="caption"
            sx={{
              color: GOLD_LIGHT,
              fontSize: "9px",
              lineHeight: 1,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Typography>
        </Paper>
      );
    });
  };

  // ====================================================
  // DRAWER ITEMS
  // ====================================================

  const drawerItems = [
    { label: "Home", path: "/", icon: <HomeRoundedIcon /> },
    { label: "Pricing", path: "/pricing", icon: <InfoRoundedIcon /> },
    { label: "Features", path: "/features", icon: <StarRoundedIcon /> },
    { label: "Contact", path: "/contact", icon: <ContactMailRoundedIcon /> },
    { label: "Live", path: "/live", icon: <AutoAwesomeRoundedIcon /> },
    { label: "Login", path: "/login", icon: <AccountCircleRoundedIcon /> },
  ];

  // ====================================================
  // UI
  // ====================================================

  return (
    <>
      {/* ================= MIDNIGHT GOLD NAVBAR ================= */}

      <motion.div
        animate={{ y: showBar ? 0 : -100 }}
        transition={{ duration: 0.32, ease: "easeInOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 2000,
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            color: GOLD,
            background:
              "linear-gradient(110deg, rgba(7,9,13,0.98), rgba(17,17,19,0.95), rgba(7,9,13,0.98))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,215,0,0.32)",
            boxShadow: "0 5px 28px rgba(0,0,0,0.35)",
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 64, sm: 72 },
              px: { xs: 2, sm: 3 },
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* BRAND */}
            <Box
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                minWidth: 0,
              }}
            >
              {/* Logo intentionally has NO background, border, or shadow */}
              <Box
                component="img"
                src={logo}
                alt="Golden Dream Logo"
                sx={{
                  width: { xs: 39, sm: 44 },
                  height: { xs: 39, sm: 44 },
                  objectFit: "contain",
                  flexShrink: 0,
                  background: "transparent",
                  border: "none",
                  borderRadius: 0,
                  boxShadow: "none",
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "1.02rem", sm: "1.25rem" },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: { xs: 0.4, sm: 1 },
                    background:
                      "linear-gradient(100deg, #FFF5B8 0%, #FFD700 42%, #B8860B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  GOLDEN DREAMS
                </Typography>

                <Typography
                  sx={{
                    mt: 0.35,
                    color: "rgba(255,241,168,0.7)",
                    fontSize: { xs: "8px", sm: "9px" },
                    letterSpacing: { xs: 1.5, sm: 2.4 },
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  DREAM • CREATE • SHINE
                </Typography>
              </Box>
            </Box>

            {/* MENU BUTTON */}
            <IconButton
              aria-label="Open navigation menu"
              onClick={toggleDrawer}
              sx={{
                ml: 1,
                width: 43,
                height: 43,
                color: GOLD,
                border: "1px solid rgba(255,215,0,0.45)",
                borderRadius: "13px",
                background: "rgba(255,215,0,0.055)",
                transition: "all 0.25s ease",
                "&:hover": {
                  color: GOLD_LIGHT,
                  background: "rgba(255,215,0,0.14)",
                  borderColor: GOLD,
                  boxShadow: "0 0 18px rgba(255,215,0,0.14)",
                },
              }}
            >
              <MenuIcon sx={{ fontSize: 25 }} />
            </IconButton>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* ================= FLOATING ARC BUTTON ================= */}

      <motion.div
        animate={{
          y: blossomVisible ? 0 : 90,
          opacity: blossomVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed",
          left: "42%",
          bottom: 22,
          transform: "translateX(-50%)",
          zIndex: 2000,
          pointerEvents: blossomVisible ? "auto" : "none",
        }}
      >
        <motion.button
          type="button"
          aria-label={widgetOpen ? "Close quick menu" : "Open quick menu"}
          aria-expanded={widgetOpen}
          onClick={toggleWidget}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: blossomVisible ? [0, -6, 6, -4, 4, 0] : 0,
          }}
          transition={{
            duration: 1.4,
            repeat: blossomVisible ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            ...buttonStyle,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              border: "1px solid rgba(255,215,0,0.18)",
              pointerEvents: "none",
            }}
          />

          <WidgetsIcon sx={{ fontSize: 29, color: GOLD }} />
        </motion.button>
      </motion.div>

      {/* ================= SEMICIRCLE ARC MENU ================= */}

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
              width: `min(${radius * 2 + 50}px, 100vw)`,
              height: radius + 50,
              zIndex: 1999,
              overflow: "visible",
              background:
                "linear-gradient(180deg, rgba(18,17,14,0.90), rgba(5,7,11,0.98))",
              borderTop: "1px solid rgba(255,215,0,0.5)",
              borderLeft: "1px solid rgba(255,215,0,0.15)",
              borderRight: "1px solid rgba(255,215,0,0.15)",
              borderTopLeftRadius: `${radius + 25}px`,
              borderTopRightRadius: `${radius + 25}px`,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow:
                "0 -12px 45px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,215,0,0.1)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              touchAction: "pan-y",
              userSelect: "none",
            }}
          >
            {/* Decorative gold arc highlight */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "42%",
                height: 2,
                borderRadius: 10,
                boxShadow: "0 0 14px rgba(255,215,0,0.3)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {renderArcIcons()}
            </Box>
          </Box>
        </ClickAwayListener>
      )}

      {/* ================= MIDNIGHT GOLD DRAWER ================= */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            mt: { xs: "64px", sm: "72px" },
            height: {
              xs: "calc(100% - 64px)",
              sm: "calc(100% - 72px)",
            },
            width: { xs: 285, sm: 310 },
            maxWidth: "88vw",
            color: GOLD,

            // 80% visible midnight-black background
            background:
              "linear-gradient(155deg, rgba(17,19,15,0.96) 0%, rgba(8,10,14,0.96) 55%, rgba(3,4,6,0.96) 100%)",

            // Gold border and depth
            borderRight: "1px solid rgba(255,215,0,0.4)",
            boxShadow: "15px 0 45px rgba(0,0,0,0.55)",

            // Gold ambient glow
            backgroundImage:
              "radial-gradient(ellipse at top left, rgba(255,215,0,0.12), transparent 55%)",

            // Frosted glass effect
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",

            // Keep the drawer itself readable
            backgroundColor: "rgba(7,9,13,0.96)",
          }
        }}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{
            height: "100%",
            p: { xs: 2.5, sm: 3 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer heading */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  background:
                    "linear-gradient(90deg, #FFF1A8, #FFD700, #B8860B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                GOLDEN DREAM
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: "9px",
                  color: "rgba(255,241,168,0.58)",
                  letterSpacing: 1.3,
                }}
              >
                ROYAL • ELEGANT • LUXURY
              </Typography>
            </Box>

            <IconButton
              aria-label="Close navigation menu"
              onClick={toggleDrawer}
              sx={{
                color: GOLD,
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: "11px",
                "&:hover": {
                  background: "rgba(255,215,0,0.12)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider
            sx={{
              borderColor: "rgba(255,215,0,0.22)",
              mb: 2.5,
            }}
          />

          {/* Drawer links */}
          <Stack spacing={1.15}>
            {drawerItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Box
                  key={item.label}
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate(item.path);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.7,
                    px: 1.7,
                    py: 1.45,
                    borderRadius: "12px",
                    cursor: "pointer",
                    color: active ? GOLD_LIGHT : "rgba(255,215,0,0.78)",
                    background: active
                      ? "linear-gradient(100deg, rgba(255,215,0,0.15), rgba(255,215,0,0.035))"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(255,215,0,0.3)"
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(255,215,0,0.09)",
                      borderColor: "rgba(255,215,0,0.22)",
                      transform: "translateX(3px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: GOLD,
                      "& .MuiSvgIcon-root": {
                        fontSize: 22,
                      },
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "0.98rem",
                      fontWeight: active ? 700 : 500,
                      letterSpacing: 0.25,
                    }}
                  >
                    {item.label}
                  </Typography>

                  {active && (
                    <Box
                      sx={{
                        ml: "auto",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: GOLD,
                        boxShadow: "0 0 10px rgba(255,215,0,0.6)",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* Drawer footer */}
          <Divider
            sx={{
              borderColor: "rgba(255,215,0,0.18)",
              mb: 1.8,
            }}
          />

          <Box
            sx={{
              p: 1.8,
              borderRadius: "14px",
              border: "1px solid rgba(255,215,0,0.18)",
              background: "rgba(255,215,0,0.035)",
              textAlign: "center",
            }}
          >
            <StarsRoundedIcon
              sx={{
                fontSize: 23,
                color: GOLD,
                mb: 0.4,
              }}
            />

            <Typography
              sx={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: GOLD_LIGHT,
              }}
            >
              Make Every Dream Shine
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "0.7rem",
                color: "rgba(255,241,168,0.5)",
              }}
            >
              Golden Moments • Golden details
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}