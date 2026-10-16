
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import BookNow from "./BookNow";
import { getApiDataArray } from "./api";

/* =====================================================
   GOLDEN DREAMS - MIDNIGHT GOLD THEME
===================================================== */

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";
const MIDNIGHT = "#080808";

/* =====================================================
   FALLBACK BANNERS

   These images appear immediately while API data loads.
   If the API fails, the fallback banners remain visible.
===================================================== */

const fallbackSlides = [
  {
    id: "fallback-1",
    link: "https://res.cloudinary.com/db3qhuau/image/upload/v1789465204/682A5673.jpg",
    Title: "Golden Moments, Timeless Memories",
    Phone: "",
  },
  {
    id: "fallback-2",
    link: "https://res.cloudinary.com/db3qhuau/image/upload/v1788086884/cld-sample.jpg",
    Title: "Professional Photography",
    Phone: "",
  },
  {
    id: "fallback-3",
    link: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=1600&auto=format&fit=crop",
    Title: "4K Cinematic Videography",
    Phone: "",
  },
  {
    id: "fallback-4",
    link: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    Title: "Every Frame Tells a Story",
    Phone: "",
  },
];

/* =====================================================
   HELPERS
===================================================== */

const isValidImageUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(String(value).trim());

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

const normalizePhone = (value) => {
  const phone = String(value || "").replace(/\D/g, "");
  return phone;
};

/* =====================================================
   BANNER COMPONENT
===================================================== */

export default function Banner() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  /* ===================================================
     LOAD BANNER DATA FROM GOOGLE APPS SCRIPT API

     API:
       Id    = 1
       link  = Banner image URL
       Title = Banner heading
       Phone = Contact number

     The existing API implementation in api.js is reused.
  =================================================== */

  useEffect(() => {
    let active = true;

    const loadBanner = async () => {
      try {
        const records = await getApiDataArray(1);

        const validSlides = (Array.isArray(records) ? records : [])
          .filter((item) => isValidImageUrl(item?.link))
          .map((item, index) => ({
            ...item,
            id: `api-banner-${index}`,
            link: String(item.link).trim(),
            Title:
              String(item.Title || "").trim() ||
              "Golden Dreams Photography",
            Phone: normalizePhone(item.Phone),
          }));

        if (!active) return;

        if (validSlides.length > 0) {
          setSlides(validSlides);
          setApiError(false);
        } else {
          setSlides(fallbackSlides);
          setApiError(true);
        }

        setCurrent(0);
      } catch (error) {
        console.error("Golden Dreams banner API error:", error);

        if (active) {
          setSlides(fallbackSlides);
          setApiError(true);
          setCurrent(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBanner();

    return () => {
      active = false;
    };
  }, []);

  /* ===================================================
     AUTOMATIC BANNER ROTATION
  =================================================== */

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((previous) => (previous + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  /* ===================================================
     SLIDE NAVIGATION
  =================================================== */

  const prevSlide = () => {
    setCurrent((previous) =>
      slides.length > 0
        ? (previous - 1 + slides.length) % slides.length
        : 0
    );
  };

  const nextSlide = () => {
    setCurrent((previous) =>
      slides.length > 0
        ? (previous + 1) % slides.length
        : 0
    );
  };

  const currentSlide = slides[current] || fallbackSlides[0];

  /* ===================================================
     CALL NOW

     Uses the phone number from the current API banner.
     If a fallback banner is displayed, it shows an alert.
  =================================================== */

  const callNow = () => {
    const phone = normalizePhone(currentSlide?.Phone);

    if (!phone) {
      window.alert(
        "Contact number is currently unavailable. Please try again later."
      );
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <Box
      component="section"
      id="home-banner"
      sx={{
        width: "100%",
        mt: { xs: "50px", md: 0 },
        height: { xs: 440, sm: 540, md: "100vh" },
        minHeight: { xs: 400, md: 560 },
        maxHeight: { md: 950 },
        position: "relative",
        overflow: "hidden",
        background: MIDNIGHT,
        borderRadius: 0,
        isolation: "isolate",
      }}
    >
      {/* CURRENT BACKGROUND IMAGE */}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${current}-${currentSlide.link}`}
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `url("${currentSlide.link}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
              backgroundColor: "#17130a",
            }}
          >
            {/* READABILITY OVERLAY */}

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.37) 62%, rgba(0,0,0,0.14) 100%), linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 70%)",
              }}
            />

            {/* GOLDEN DREAMS BRAND LABEL */}

            <Box
              sx={{
                position: "absolute",
                top: { xs: 24, sm: 36, md: 5 },
                left: { xs: 18, sm: 45, md: 75 },
                right: { xs: 18, sm: 45, md: 75 },
                zIndex: 2,
              }}
            >
              <Typography
                sx={{
                  color: GOLD,
                  fontWeight: 900,
                  letterSpacing: { xs: 2, sm: 4 },
                  fontSize: { xs: 10, sm: 12, md: 14 },
                  textTransform: "uppercase",
                  textShadow: "0 2px 12px #000",
                }}
              >
                ✦ Golden Dreams Studio
              </Typography>
            </Box>

            {/* BANNER TITLE */}

            <Box
              sx={{
                position: "absolute",
                left: { xs: 38, sm: 65, md: 95 },
                right: { xs: 25, sm: 50, md: 90 },
                bottom: { xs: 100, sm: 120, md: 130 },
                zIndex: 2,
              }}
            >
              <motion.div
                key={`title-${current}`}
                initial={{ y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: {
                      xs: "clamp(25px, 7vw, 35px)",
                      sm: "clamp(34px, 4.5vw, 52px)",
                      md: "clamp(44px, 4.5vw, 68px)",
                    },
                    fontWeight: 900,
                    lineHeight: 1.15,
                    color: GOLD,
                    textShadow: "0 4px 22px rgba(0,0,0,0.95)",
                    maxWidth: 900,
                    overflowWrap: "anywhere",
                  }}
                >
                  {currentSlide.Title}
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: "rgba(255,255,255,0.92)",
                    fontSize: { xs: 11, sm: 14, md: 17 },
                    letterSpacing: { xs: 1.1, sm: 2, md: 2.5 },
                    textTransform: "uppercase",
                    textShadow: "0 2px 8px #000",
                  }}
                >
                  Capture your beautiful moments
                </Typography>

                {/* GOLD ACCENT LINE */}

                <Box
                  sx={{
                    width: 85,
                    height: 3,
                    mt: 2.2,
                    borderRadius: 5,
                    background:
                      "linear-gradient(90deg, #D8B15A, #F5D990)",
                    boxShadow: "0 0 18px rgba(216,177,90,0.35)",
                  }}
                />
              </motion.div>
            </Box>

            {/* ACTION BUTTONS */}

            <Box
              sx={{
                position: "absolute",
                right: { xs: 14, sm: 35, md: 60 },
                bottom: { xs: 42, sm: 48, md: 54 },
                left: { xs: 14, sm: "auto" },
                zIndex: 3,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: {
                  xs: "center",
                  sm: "flex-end",
                },
                alignItems: "center",
                gap: { xs: 1.2, sm: 1.5 },
              }}
            >
              {/* SEPARATE BOOKING COMPONENT */}

              <BookNow />

              {/* CALL NOW BUTTON */}

              <Button
                onClick={callNow}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(90deg,#FFD700,#FF9800)",
                  width: "max-content",
                  maxWidth: "100%",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  px: { xs: 2.3, sm: 3 },
                  py: 1.15,
                  borderRadius: "30px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  color: MIDNIGHT,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #D8B15A, #F5D990)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 7px 24px rgba(216,177,90,0.3)",
                  },
                }}
              >
                Call Now
              </Button>
            </Box>

            {/* PREVIOUS ARROW */}

            {slides.length > 1 && (
              <IconButton
                aria-label="Previous banner"
                onClick={prevSlide}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: { xs: 5, sm: 15 },
                  transform: "translateY(-50%)",
                  color: "#fff",
                  zIndex: 3,
                  width: { xs: 34, sm: 44 },
                  height: { xs: 34, sm: 44 },
                  backgroundColor: "rgba(0,0,0,0.48)",
                  border: "1px solid rgba(216,177,90,0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: GOLD,
                  },
                }}
              >
                <ArrowBackIosNewIcon
                  sx={{ fontSize: { xs: 15, sm: 21 } }}
                />
              </IconButton>
            )}

            {/* NEXT ARROW */}

            {slides.length > 1 && (
              <IconButton
                aria-label="Next banner"
                onClick={nextSlide}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: { xs: 5, sm: 15 },
                  transform: "translateY(-50%)",
                  color: "#fff",
                  zIndex: 3,
                  width: { xs: 34, sm: 44 },
                  height: { xs: 34, sm: 44 },
                  backgroundColor: "rgba(0,0,0,0.48)",
                  border: "1px solid rgba(216,177,90,0.5)",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    color: GOLD,
                  },
                }}
              >
                <ArrowForwardIosIcon
                  sx={{ fontSize: { xs: 15, sm: 21 } }}
                />
              </IconButton>
            )}

            {/* SLIDE INDICATORS */}

            {slides.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  bottom: { xs: 18, sm: 22 },
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  zIndex: 3,
                }}
              >
                {slides.map((slide, index) => (
                  <Box
                    key={`${slide.id || slide.link}-${index}`}
                    component="button"
                    type="button"
                    aria-label={`Show banner ${index + 1}`}
                    aria-current={
                      current === index ? "true" : undefined
                    }
                    onClick={() => setCurrent(index)}
                    sx={{
                      width: current === index ? 27 : 8,
                      height: 8,
                      p: 0,
                      border: 0,
                      borderRadius: 10,
                      cursor: "pointer",
                      background:
                        current === index
                          ? "linear-gradient(90deg, #D8B15A, #F5D990)"
                          : "rgba(255,255,255,0.65)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* API LOADING STATUS */}

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.3,
            py: 0.8,
            borderRadius: 2,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          <CircularProgress
            size={13}
            thickness={5}
            sx={{ color: GOLD }}
          />

          <Typography sx={{ color: "#fff", fontSize: 10 }}>
            Loading...
          </Typography>
        </Box>
      )}

      {/* FALLBACK STATUS */}

      {apiError && !loading && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 5,
            px: 1.2,
            py: 0.7,
            borderRadius: 2,
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(216,177,90,0.25)",
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: 10 }}>
            Featured photography
          </Typography>
        </Box>
      )}
    </Box>
  );
}
