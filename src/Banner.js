
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";

import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";

import { getApiDataArray } from "./api";

/* =====================================================
   GOLDEN DREAMS - FALLBACK BANNERS
   Display immediately while API data is loading.
===================================================== */

const WHATSAPP_NUMBER = "919976149065";
const GOLD = "#FFD700";

const fallbackSlides = [
  {
    id: "fallback-1",
    link: "https://res.cloudinary.com/db3qhuau/image/upload/v1789465204/682A5673.jpg",
    Title: "Golden Moments, Timeless Memories",
    Phone: WHATSAPP_NUMBER,
  },
  {
    id: "fallback-2",
    link: "https://res.cloudinary.com/db3qhuau/image/upload/v1788086884/cld-sample.jpg",
    Title: "Professional Photography",
    Phone: WHATSAPP_NUMBER,
  },
  {
    id: "fallback-3",
    link: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=1600&auto=format&fit=crop",
    Title: "4K Cinematic Videography",
    Phone: WHATSAPP_NUMBER,
  },
  {
    id: "fallback-4",
    link: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    Title: "Every Frame Tells a Story",
    Phone: WHATSAPP_NUMBER,
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
  return phone || WHATSAPP_NUMBER;
};

const fieldSx = {
  mb: 0.5,

  "& .MuiInputBase-root": {
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
  },

  "& .MuiInputBase-input": {
    color: "#fff",
  },

  "& .MuiInputLabel-root": {
    color: GOLD,
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: GOLD,
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,215,0,0.35)",
  },

  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,215,0,0.75)",
  },

  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: GOLD,
  },

  "& .MuiFormHelperText-root": {
    color: "#ff8585",
  },
};

/* =====================================================
   BANNER COMPONENT
===================================================== */

export default function Banner() {
  // Fallback data is available from the first render.
  const [slides, setSlides] = useState(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    mail: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  /* ===================================================
     LOAD API BANNERS

     API:
       Id    = 1
       link  = Banner image URL
       Title = Banner heading
       Phone = Contact number

     If API fails or returns empty/invalid records,
     the fallback slides remain visible.
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
      slides.length > 0 ? (previous + 1) % slides.length : 0
    );
  };

  const currentSlide = slides[current] || fallbackSlides[0];

  /* ===================================================
     BOOKING FORM
  =================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const sendWhatsApp = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[+]?[\d\s()-]{7,18}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid mobile number";
    }

    if (!formData.mail.trim()) {
      newErrors.mail = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mail.trim())
    ) {
      newErrors.mail = "Enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const phone = normalizePhone(currentSlide.Phone);

    const message = [
      "GOLDEN DREAMS - BOOKING ENQUIRY",
      "",
      `Package/Banner: ${currentSlide.Title}`,
      `Name: ${formData.name.trim()}`,
      `Mobile: ${formData.mobile.trim()}`,
      `Email: ${formData.mail.trim()}`,
      `Message: ${formData.message.trim()}`,
    ].join("\n");

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    setFormData({
      name: "",
      mobile: "",
      mail: "",
      message: "",
    });

    setErrors({});
    setOpen(false);
  };

  const callNow = () => {
    window.location.href = `tel:${normalizePhone(currentSlide.Phone)}`;
  };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <>
      {/* MAIN BANNER */}
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
          background: "#080808",
          borderRadius: 0,
          isolation: "isolate",
        }}
      >
        {/* Current background image */}
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
              {/* Readability overlay */}
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
                  top: { xs: 24, sm: 36, md: 15 },
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

                  <Box
                    sx={{
                      width: 85,
                      height: 3,
                      mt: 2.2,
                      borderRadius: 5,
                      background: "linear-gradient(90deg,#FFD700,#FF9800)",
                      boxShadow: "0 0 18px rgba(255,215,0,0.35)",
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
                  justifyContent: { xs: "center", sm: "flex-end" },
                  gap: { xs: 1.2, sm: 1.5 },
                }}
              >
                <Button
                  onClick={() => setOpen(true)}
                  variant="contained"
                  sx={{
                    background: "linear-gradient(90deg,#FFD700,#FF9800)",
                    color: "#171000",
                    fontWeight: 900,
                    px: { xs: 2.3, sm: 3.2 },
                    py: { xs: 1, sm: 1.3 },
                    borderRadius: "12px",
                    fontSize: { xs: 12, sm: 15, md: 16 },
                    textTransform: "none",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#FFE866,#FFB300)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Book Now
                </Button>

                <Button
                  onClick={callNow}
                  variant="contained"
                  sx={{
                    background: "linear-gradient(90deg,#FFD700,#FF9800)",
                    color: "#171000",
                    fontWeight: 900,
                    px: { xs: 2.3, sm: 3.2 },
                    py: { xs: 1, sm: 1.3 },
                    borderRadius: "12px",
                    fontSize: { xs: 12, sm: 15, md: 16 },
                    textTransform: "none",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.45)",
                    "&:hover": {
                      background: "linear-gradient(90deg,#FFE866,#FFB300)",
                      transform: "translateY(-2px)",
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
                    border: "1px solid rgba(255,215,0,0.5)",
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
                    border: "1px solid rgba(255,215,0,0.5)",
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
                      aria-current={current === index ? "true" : undefined}
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
                            ? "linear-gradient(90deg,#FFD700,#FF9800)"
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

        {/* API LOADING STATUS - does not hide fallback */}
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
            }}
          >
            <Typography sx={{ color: "#fff", fontSize: 10 }}>
              Featured photography
            </Typography>
          </Box>
        )}
      </Box>

      {/* ================================================
          BOOKING DIALOG
      ================================================ */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: "94%", sm: "100%" },
            maxWidth: 520,
            m: { xs: 1, sm: 2 },
            borderRadius: { xs: "18px", sm: "25px" },
            background: "rgba(15,15,15,0.96)",
            color: "#fff",
            boxShadow: "0 0 30px rgba(255,215,0,0.2)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,215,0,0.4)",
            backgroundImage: "none",
          },
        }}
      >
        <DialogContent
          sx={{
            position: "relative",
            p: { xs: 2.5, sm: 4 },
            pt: { xs: 5, sm: 4 },
          }}
        >
          <IconButton
            aria-label="Close booking form"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
              color: GOLD,
              "&:hover": {
                background: "rgba(255,215,0,0.12)",
                transform: "scale(1.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              fontSize: { xs: 22, sm: 27 },
              fontWeight: 900,
              mb: 3,
              textAlign: "center",
              letterSpacing: 1,
              background: "linear-gradient(90deg,#FFD700,#FFB300,#FFE066)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textTransform: "uppercase",
            }}
          >
            Booking Form
          </Typography>

          {[
            { name: "name", label: "Name", type: "text" },
            { name: "mobile", label: "Mobile", type: "tel" },
            { name: "mail", label: "Email", type: "email" },
          ].map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              fullWidth
              value={formData[field.name]}
              onChange={handleChange}
              error={Boolean(errors[field.name])}
              helperText={errors[field.name] || " "}
              autoComplete={
                field.name === "name"
                  ? "name"
                  : field.name === "mobile"
                    ? "tel"
                    : "email"
              }
              sx={fieldSx}
            />
          ))}

          <TextField
            label="Message"
            name="message"
            fullWidth
            multiline
            minRows={3}
            value={formData.message}
            onChange={handleChange}
            error={Boolean(errors.message)}
            helperText={errors.message || " "}
            sx={fieldSx}
          />

          <Box
            component="button"
            type="button"
            onClick={sendWhatsApp}
            sx={{
              mt: 1,
              width: "100%",
              cursor: "pointer",
              py: 1.6,
              px: 2,
              border: 0,
              borderRadius: "14px",
              textAlign: "center",
              fontWeight: 900,
              fontSize: { xs: 15, sm: 17 },
              background: "linear-gradient(90deg,#25D366,#128C4A)",
              color: "#fff",
              boxShadow: "0 0 12px rgba(37,211,102,0.35)",
              transition: "0.25s",
              "&:hover": {
                boxShadow: "0 0 22px rgba(37,211,102,0.65)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Send via WhatsApp
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
