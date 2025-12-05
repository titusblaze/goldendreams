// Features.js
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const slides = [
  {
    id: "A",
    title: "Mirrorless Pro Mastery",
    desc:
      "Next-gen mirrorless bodies with AI autofocus, superior dynamic range and cinematic color.\nPerfect for portrait and studio pros.",
    bg:
      "https://images.unsplash.com/photo-1519183071298-a2962be96f47?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    accent: ["#FFD54F", "#FFB300"],
  },
  {
    id: "B",
    title: "CrystalPrime Lens Series",
    desc:
      "Ultra-sharp prime & zoom lenses for bokeh perfection and low-light dominance.\nIdeal for weddings and editorial shoots.",
    bg:
      "https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
    accent: ["#00E5FF", "#0077FF"],
  },
  {
    id: "C",
    title: "CineRig 8K Tools",
    desc:
      "Film-level rigs, gimbals and 8K-capable cameras for cinematic motion and buttery stabilization.\nIncludes pro grading workflow.",
    bg:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    accent: ["#FF6B6B", "#FF3D00"],
  },
  {
    id: "D",
    title: "Mobile Creators Suite",
    desc:
      "Turn smartphones into film tools with gimbals, RGB panels, and pro audio.\nCompact, powerful, and travel-friendly.",
    bg:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    accent: ["#8E2DE2", "#FF416C"],
  },
  {
    id: "E",
    title: "Broadcast HD & 4K Options",
    desc:
      "High-frame-rate capture, HDR workflows, and easy streaming setups for live events.\nDeliver crisp HD & 4K content reliably.",
    bg:
      "https://images.unsplash.com/photo-1470123808288-6ccdb62f86ef?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    accent: ["#00C9A7", "#0052D4"],
  },
];

const bgVariants = {
  enter: { opacity: 0, scale: 1.06 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export default function Features() {
  const [index, setIndex] = useState(0);
  const slideCount = slides.length;

  // autoplay
  const autoplayRef = useRef(null);
  const containerRef = useRef(null);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function startAutoplay() {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setIndex((s) => (s + 1) % slideCount);
    }, 5200);
  }
  function stopAutoplay() {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }

  // pointer swipe handling (no external lib)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = null;
    let startTime = null;

    function onPointerDown(e) {
      stopAutoplay();
      startX = e.clientX ?? (e.touches && e.touches[0].clientX);
      startTime = Date.now();
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointermove", onPointerMove);
    }
    function onPointerMove(e) {
      // no-op (we do not track dragging visual)
    }
    function onPointerUp(e) {
      const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX);
      const dx = endX - startX;
      const dt = Date.now() - startTime;
      // quick swipe threshold
      if (Math.abs(dx) > 50 && dt < 600) {
        if (dx < 0) setIndex((s) => (s + 1) % slideCount);
        else setIndex((s) => (s - 1 + slideCount) % slideCount);
      }
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
      startAutoplay();
    }

    el.addEventListener("pointerdown", onPointerDown);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goPrev = () => {
    stopAutoplay();
    setIndex((s) => (s - 1 + slideCount) % slideCount);
    startAutoplay();
  };
  const goNext = () => {
    stopAutoplay();
    setIndex((s) => (s + 1) % slideCount);
    startAutoplay();
  };

  const current = slides[index];

  return (
    <Box
      ref={containerRef}
      component="section"
      sx={{
        width: "100%",
        minHeight: { xs: "110vh", md: "95vh" },
        position: "relative",
        overflow: "hidden",
        background: "#070707",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 6, md: 10 },
      }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Background image (animated swap) */}
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={current.bg}
          src={current.bg}
          alt={current.title}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            filter: "brightness(0.32) contrast(0.98)",
            transformOrigin: "center",
          }}
        />
      </AnimatePresence>

      {/* Subtle ambient blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.6 }}
        style={{
          position: "absolute",
          left: -80,
          top: 40,
          width: 260,
          height: 260,
          borderRadius: "40% 60% 50% 50%",
          background: `linear-gradient(135deg, ${current.accent[0]}, ${current.accent[1]})`,
          filter: "blur(56px)",
          zIndex: 1,
          mixBlendMode: "screen",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.16 }}
        transition={{ duration: 1.9 }}
        style={{
          position: "absolute",
          right: -100,
          bottom: -80,
          width: 360,
          height: 360,
          borderRadius: "60% 40% 50% 50%",
          background: `linear-gradient(225deg, ${current.accent[1]}, ${current.accent[0]})`,
          filter: "blur(80px)",
          zIndex: 1,
          mixBlendMode: "screen",
        }}
      />

      {/* Navigation arrows (always visible on desktop, present on mobile) */}
      <IconButton
        onClick={goPrev}
        sx={{
          position: "absolute",
          left: { xs: 12, md: 100 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9,
          bgcolor: "rgba(0,0,0,0.72)",
          color: "#FFD700",
          border: "1px solid rgba(255,255,255,0.08)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
        aria-label="previous"
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      <IconButton
        onClick={goNext}
        sx={{
          position: "absolute",
          right: { xs: 12, md: 100 },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9,
          bgcolor: "rgba(0,0,0,0.72)",
          color: "#FFD700",
          border: "1px solid rgba(255,255,255,0.08)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
        aria-label="next"
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Main container: sample image + hero content */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          zIndex: 6,
          display: "flex",
          gap: { xs: 3, md: 6 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* LEFT: Sample image with shape mask */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current.sample}
            initial={{ opacity: 0, x: -30, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.9 }}
            style={{
              flex: isMd ? "0 0 100%" : "0 0 46%",
              display: "flex",
              justifyContent: "center",
              //alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: "95%", sm: 420, md: 520 },
                height: { xs: 240, sm: 360, md: 420 },
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                mx: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.28))",
              }}
            >
              {/* glossy overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.18 }}
                transition={{ duration: 1.2 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 2,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.00))",
                  mixBlendMode: "overlay",
                }}
              />

              {/* FIXED MOBILE IMAGE */}
                          <motion.img
                            src={current.sample}
                            alt="sample"
                            initial={{ scale: 1.08, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.9 }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
              
                              clipPath: isSm
                                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                                : "polygon(10% 5%, 100% 0%, 95% 100%, 5% 90%)",
              
                              WebkitClipPath: isSm
                                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                                : "polygon(10% 5%, 100% 0%, 95% 100%, 5% 90%)",
              
                              transition: "clip-path 0.8s ease",
                            }}
                          />

              {/* small floating badge */}
              <motion.div
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  zIndex: 6,
                  padding: "8px 12px",
                  borderRadius: 16,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  color: "#fff",
                  fontWeight: 800,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {current.id}
              </motion.div>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* RIGHT: Hero content */}
        <Box
          sx={{
            flex: isMd ? "0 0 100%" : "0 0 46%",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            justifyContent: "center",
          }}
        >
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 44 },
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.02,
                textShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                style={{ display: "inline-block" }}
              >
                {current.title}
              </motion.span>
            </Typography>
          </motion.div>

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.12 }}>
            <Typography
              sx={{
                color: "#e6e6e6",
                fontSize: { xs: 13, md: 16 },
                maxWidth: 640,
                whiteSpace: "pre-line",
                overflowWrap: "break-word",
              }}
            >
              {current.desc}
            </Typography>
          </motion.div>

          {/* Price-ish / features badges row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.22 }}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              <Box sx={{ px: 2, py: 0.7, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                <Typography sx={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>HD</Typography>
              </Box>
              <Box sx={{ px: 2, py: 0.7, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                <Typography sx={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>4K</Typography>
              </Box>
              <Box sx={{ px: 2, py: 0.7, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                <Typography sx={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Gimbal</Typography>
              </Box>
              <Box sx={{ px: 2, py: 0.7, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
                <Typography sx={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Pro Lenses</Typography>
              </Box>
            </Box>
          </motion.div>

          {/* CTA card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}>
            <Box
              sx={{
                mt: 1.5,
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.32))",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
                maxWidth: 720,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: 15, md: 18 } }}>
                  What's included
                </Typography>
                <Typography sx={{ color: "#ccc", fontSize: 13, mt: 0.5 }}>
                  HD photos, color correction, online gallery and 5 retouched images.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: current.accent[0],
                    color: "#000",
                    fontWeight: 800,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": { filter: "brightness(0.95)" },
                  }}
                >
                  Book Now
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.12)",
                    textTransform: "none",
                    px: 2,
                    py: 0.8,
                    borderRadius: 2,
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 18, md: 36 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9,
          display: "flex",
          gap: 1.25,
          alignItems: "center",
        }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <Box
              key={s.id}
              onClick={() => {
                setIndex(i);
                stopAutoplay();
                startAutoplay();
              }}
              sx={{
                width: active ? 18 : 8,
                height: 8,
                borderRadius: 8,
                background: active ? `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})` : "rgba(255,255,255,0.12)",
                cursor: "pointer",
                transition: "all 0.25s",
                boxShadow: active ? "0 6px 18px rgba(0,0,0,0.5)" : "none",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );

  // helpers defined here to avoid lint warnings (start/stop functions used earlier)
  function startAutoplay() {
    if (autoplayRef.current) return;
    autoplayRef.current = setInterval(() => {
      setIndex((s) => (s + 1) % slideCount);
    }, 5200);
  }
  function stopAutoplay() {
    if (!autoplayRef.current) return;
    clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  }
}
