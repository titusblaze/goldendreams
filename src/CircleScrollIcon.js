// CircleScrollIcon.js
import React, { useState, useRef } from "react";
import { Box, Paper, Typography, ClickAwayListener } from "@mui/material";
import { motion } from "framer-motion";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { Home, Star, Login, LiveTv, Call } from "@mui/icons-material";

const icons = [
  { icon: <Home sx={{ color: "#FFD700" }} />, label: "Home" },
  { icon: <Star sx={{ color: "#FFD700" }} />, label: "Features" },
  { icon: <Login sx={{ color: "#FFD700" }} />, label: "Login" },
  { icon: <LiveTv sx={{ color: "#FFD700" }} />, label: "Live" },
  { icon: <Call sx={{ color: "#FFD700" }} />, label: "Call" },
];

const radius = 120;
const iconSize = 60;

export default function CircleScrollIcon({ blossomVisible }) {
  const [open, setOpen] = useState(false);
  const [angleOffset, setAngleOffset] = useState(0);
  const dragStartX = useRef(null);

  const toggleMenu = () => setOpen(!open);
  const closeMenu = () => setOpen(false);

  const handleDragStart = (e) => {
    dragStartX.current = e.clientX || e.touches[0].clientX;
  };
  const handleDragMove = (e) => {
    if (dragStartX.current !== null) {
      const currentX = e.clientX || e.touches[0].clientX;
      const deltaX = currentX - dragStartX.current;
      setAngleOffset((prev) => prev - deltaX * 0.01);
      dragStartX.current = currentX;
    }
  };
  const handleDragEnd = () => {
    dragStartX.current = null;
  };

  return (
    <ClickAwayListener onClickAway={closeMenu}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pb: 6,
          userSelect: "none",
        }}
      >
        {/* Bottom Blossom Menu Icon */}
        {blossomVisible && (
          <motion.div
            animate={{
              y: blossomVisible ? 0 : 120,
              opacity: blossomVisible ? 1 : 0,
              rotate: blossomVisible ? [0, -10, 10, -8, 8, 0] : 0,
            }}
            transition={{
              duration: 1,
              repeat: blossomVisible ? Infinity : 0,
              ease: "easeInOut",
            }}
            style={{
              position: "fixed",
              bottom: 22,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2000,
            }}
          >
            <motion.button
              onClick={toggleMenu}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                background: "rgba(30,30,31,0.16)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: "#FFD700",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.35), 0 0 18px rgba(255,215,0,0.08)",
              }}
            >
              <WidgetsIcon sx={{ fontSize: 30 }} />
            </motion.button>
          </motion.div>
        )}

        {/* Arc Menu */}
        {open && (
          <Box
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            sx={{
              position: "absolute",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: 500,
              height: 220,
              background: "rgba(20,15,10,0.85)",
              borderTopLeftRadius: "200px",
              borderTopRightRadius: "200px",
              backdropFilter: "blur(10px)",
              borderTop: "2px solid rgba(255,215,0,0.35)",
              borderLeft: "2px solid rgba(255,215,0,0.25)",
              borderRight: "2px solid rgba(255,215,0,0.25)",
              overflow: "hidden",
              zIndex: 4,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 110,
                height: 90,
                background: "#1A120D",
                borderTopLeftRadius: "180px",
                borderTopRightRadius: "180px",
                borderTop: "2px solid rgba(255,215,0,0.3)",
              }}
            />

            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {icons.map((item, index) => {
                const baseAngle = Math.PI / 2;
                const angleStep = Math.PI / (icons.length + 1);
                const angle =
                  baseAngle + (index - icons.length / 2) * angleStep + angleOffset;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);

                return (
                  <Paper
                    key={index}
                    elevation={6}
                    onClick={() => {
                      alert(`Clicked ${item.label}`);
                      closeMenu();
                    }}
                    sx={{
                      position: "absolute",
                      left: `calc(50% + ${x}px - ${iconSize / 2}px)`,
                      bottom: `${y}px`,
                      width: iconSize,
                      height: iconSize,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.65)",
                      border: "1px solid rgba(255,215,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {item.icon}
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 10, mt: 0.3, color: "#FFD700" }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
