
import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  ArrowBackIosNewRounded,
  ArrowForwardIosRounded,
  CameraAltRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";

import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { getAllApiData } from "./api";

/* -------------------------------------------------------
   FALLBACK PACKAGES
   These appear if the API fails or returns no valid slides.
------------------------------------------------------- */

const fallbackSlides = [
  {
    id: "basic",
    title: "Basic Shoot",
    price: "Rs.50,000.00",
    desc:
      "Perfect for small indoor shoots and portraits. 1 hour session, basic retouching.",
    bg: "https://images.unsplash.com/photo-1519183071298-a2962be96dcd?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    accent: ["#FFD54F", "#FFB300"],
  },
  {
    id: "pro",
    title: "Professional",
    price: "Rs.1,00,000.00",
    desc:
      "Ideal for weddings, events, and outdoor sessions. 3 hour coverage + editing.",
    bg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    accent: ["#00E5FF", "#0077FF"],
  },
  {
    id: "cinematic",
    title: "Cinematic Premium",
    price: "2,00,000.00",
    desc:
      "High-end lighting, drone shots, and advanced editing. Full production crew.",
    bg: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=1600&auto=format&fit=crop",
    sample:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    accent: ["#FF6B6B", "#FF3D00"],
  },
];

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

// Extract both hexadecimal colors from Accent.
// Handles values such as:
// #FF6B6B, #FF3D00
// "#FF6B6B", "#FF3D00"
// #FF6B6B
const getAccentColors = (value, fallback = ["#D4AF37", "#F5A623"]) => {
  if (!value) return fallback;

  const colors = String(value).match(/#[0-9a-fA-F]{3,8}\b/g);

  if (colors?.length >= 2) {
    return [colors[0], colors[1]];
  }

  if (colors?.length === 1) {
    return [colors[0], colors[0]];
  }

  return fallback;
};

const getFirstValue = (record, keys, fallback = "") => {
  for (const key of keys) {
    const value = record?.[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return fallback;
};

const isValidImageUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(String(value).trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const getImageUrl = (value, fallback) =>
  isValidImageUrl(value) ? String(value).trim() : fallback;

/* -------------------------------------------------------
   PRICING COMPONENT
------------------------------------------------------- */

export default function Pricing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [slides, setSlides] = useState(fallbackSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  /* -----------------------------------------------------
     FETCH API DATA

     Id       = 4
     link     = Sample image
     link1    = Background image
     Accent   = Two gradient colors
     Title    = Package name
     Title1   = Price
     Description1 = Description
  ----------------------------------------------------- */

  useEffect(() => {
    let isMounted = true;

    const loadPricing = async () => {
      try {
        setLoading(true);

        const response = await getAllApiData();

        const records = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        const pricingRecords = records.filter(
          (item) => String(item?.Id ?? "").trim() === "4"
        );

        const validSlides = pricingRecords
          .filter((item) => {
            const title = getFirstValue(item, ["Title", "title"]);
            const sample = getFirstValue(item, ["link", "Link"]);
            const background = getFirstValue(item, ["link1", "Link1"]);

            return Boolean(
              title && (isValidImageUrl(sample) || isValidImageUrl(background))
            );
          })
          .map((item, index) => {
            const title = getFirstValue(
              item,
              ["Title", "title"],
              `Photography Package ${index + 1}`
            );

            // Title1 is the actual price field in your API.
            // Other names are included as compatibility fallbacks.
            const price = getFirstValue(
              item,
              [
                "Title1",
                "title1",
                "Price",
                "price",
                "Pricing",
                "pricing",
                "Amount",
                "amount",
              ],
              fallbackSlides[index % fallbackSlides.length].price
            );

            const desc = getFirstValue(
              item,
              ["Description1", "description1", "Description", "description"],
              "Contact us to learn more about this photography package."
            );

            const accent = getAccentColors(
              item?.Accent ?? item?.accent,
              fallbackSlides[index % fallbackSlides.length].accent
            );

            return {
              id: `api-${String(item?.Id ?? "4")}-${index}`,
              title,
              price,
              desc,
              sample: getImageUrl(
                getFirstValue(item, ["link", "Link"]),
                fallbackSlides[index % fallbackSlides.length].sample
              ),
              bg: getImageUrl(
                getFirstValue(item, ["link1", "Link1"]),
                fallbackSlides[index % fallbackSlides.length].bg
              ),
              accent,
            };
          });

        if (isMounted) {
          if (validSlides.length > 0) {
            setSlides(validSlides);
            setUsingFallback(false);
          } else {
            setSlides(fallbackSlides);
            setUsingFallback(true);
          }

          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Failed to load pricing data:", error);

        if (isMounted) {
          setSlides(fallbackSlides);
          setUsingFallback(true);
          setActiveIndex(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPricing();

    return () => {
      isMounted = false;
    };
  }, []);

  /* -----------------------------------------------------
     MANUAL SLIDE NAVIGATION
     No autoplay and no automatic slide changes.
  ----------------------------------------------------- */

  const nextSlide = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 1 ? (current + 1) % slides.length : 0
    );
  }, [slides.length]);

  const previousSlide = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 1
        ? (current - 1 + slides.length) % slides.length
        : 0
    );
  }, [slides.length]);

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  const currentSlide = slides[activeIndex] || fallbackSlides[0];

  const gradient = `linear-gradient(135deg, ${currentSlide.accent[0]}, ${currentSlide.accent[1]})`;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: previousSlide,
    preventScrollOnSwipe: false,
    trackMouse: false,
  });

  const openEnquiry = () => {
    const subject = encodeURIComponent(
      `Golden Dreams - ${currentSlide.title} Enquiry`
    );

    const body = encodeURIComponent(
      `Hello Golden Dreams,\n\nI am interested in the ${currentSlide.title} package.\nPrice: ${currentSlide.price}\n\nPlease share more details.\n\nThank you.`
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const learnMore = () => {
    const message = encodeURIComponent(
      `Hello Golden Dreams, I would like to know more about the ${currentSlide.title} package.`
    );

    window.location.href = `mailto:?subject=Package%20Details&body=${message}`;
  };

  return (
    <Box
      component="section"
      id="pricing"
      sx={{
        position: "relative",
        mt: { xs: "50px", md: "40px" }, // Mobile only
        isolation: "isolate",
        width: "100%",
        minHeight: { xs: "auto", md: "100vh" },
        boxSizing: "border-box",
        overflow: "hidden",
        bgcolor: "#090909",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        py: { xs: 5, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 5 },
      }}
    >
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.bg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -2,
            backgroundImage: `url("${currentSlide.bg}")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </AnimatePresence>

      {/* Dark glass overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(100deg, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.87) 45%, rgba(5,5,5,0.63) 100%)",
          backdropFilter: "blur(2px)",
        }}
      />

      <Box
        sx={{
          width: "100%",
          maxWidth: 1440,
          mx: "auto",
        }}
      >
        {/* Heading */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 2,
              py: 0.8,
              mb: 2,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.17)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            <CameraAltRounded
              sx={{
                fontSize: 18,
                color: currentSlide.accent[0],
              }}
            />

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: "#f4e8c7",
              }}
            >
              Golden Dreams Studio
            </Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.5rem" },
              lineHeight: 1.12,
              fontWeight: 900,
              letterSpacing: { xs: -0.8, md: -1.5 },
              color: "#fff",
            }}
          >
            Choose Your{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #FFE8A3, #C89532)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Perfect Package
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 620,
              mx: "auto",
              mt: 2,
              color: "rgba(255,255,255,0.7)",
              fontSize: { xs: 13, sm: 15 },
              lineHeight: 1.8,
            }}
          >
            Every moment tells a story. Choose a photography experience
            designed to preserve yours beautifully.
          </Typography>
        </Box>

        {/* Loading indicator */}
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
              color: "#f3d58a",
            }}
          >
            <CircularProgress
              size={18}
              thickness={4}
              sx={{ color: "#e0b65c" }}
            />

            <Typography sx={{ fontSize: 12 }}>
              Loading photography packages...
            </Typography>
          </Box>
        )}

        {/* Main slider */}
        <Box
          {...swipeHandlers}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            maxWidth: 1180,
            mx: "auto",
            touchAction: "pan-y",
          }}
        >
          {/* Sample photograph */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: 440, md: 520 },
              mx: "auto",
              position: "relative",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.sample}
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 260, sm: 350, md: 480 },
                    overflow: "hidden",
                    borderRadius: { xs: 3, md: 4 },
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: `0 25px 70px ${currentSlide.accent[0]}22`,
                  }}
                >
                  <Box
                    component="img"
                    src={currentSlide.sample}
                    alt={`${currentSlide.title} photography sample`}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0.15";
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.6,
                        py: 0.8,
                        borderRadius: 2,
                        background: "rgba(0,0,0,0.52)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          fontWeight: 800,
                          color: "#fff",
                        }}
                      >
                        Featured Work
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        background: gradient,
                        color: "#111",
                        boxShadow: `0 5px 24px ${currentSlide.accent[0]}55`,
                      }}
                    >
                      <AutoAwesomeRounded />
                    </Avatar>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* Mobile arrows */}
            {isMobile && slides.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <IconButton
                  aria-label="Previous package"
                  onClick={previousSlide}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.07)",
                    "&:hover": { background: "rgba(255,255,255,0.15)" },
                  }}
                >
                  <ArrowBackIosNewRounded sx={{ fontSize: 17 }} />
                </IconButton>

                <Typography
                  sx={{
                    minWidth: 58,
                    textAlign: "center",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {activeIndex + 1} / {slides.length}
                </Typography>

                <IconButton
                  aria-label="Next package"
                  onClick={nextSlide}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.07)",
                    "&:hover": { background: "rgba(255,255,255,0.15)" },
                  }}
                >
                  <ArrowForwardIosRounded sx={{ fontSize: 17 }} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Package details */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: 520, md: 500 },
              mx: "auto",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    p: { xs: 2.5, sm: 3.5, md: 4 },
                    borderRadius: { xs: 3, md: 4 },
                    background:
                      "linear-gradient(145deg, rgba(20,20,20,0.87), rgba(8,8,8,0.73))",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderTop: `2px solid ${currentSlide.accent[0]}`,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(22px)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: currentSlide.accent[0],
                      mb: 1.5,
                    }}
                  >
                    Photography Collection
                  </Typography>

                  <Typography
                    component="h3"
                    sx={{
                      fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.6rem" },
                      lineHeight: 1.15,
                      fontWeight: 900,
                      letterSpacing: -0.8,
                      overflowWrap: "anywhere",
                      color: "#fff",
                    }}
                  >
                    {currentSlide.title}
                  </Typography>

                  <Box
                    sx={{
                      height: 3,
                      width: 75,
                      borderRadius: 5,
                      background: gradient,
                      mt: 2,
                      mb: 2.5,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: { xs: 13, sm: 14 },
                      lineHeight: 1.9,
                      color: "rgba(255,255,255,0.72)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {currentSlide.desc}
                  </Typography>

                  {/* Price */}
                  <Box
                    sx={{
                      mt: 3,
                      mb: 3,
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 3,
                      border: `1px solid ${currentSlide.accent[0]}55`,
                      background: `linear-gradient(120deg, ${currentSlide.accent[0]}13, ${currentSlide.accent[1]}18)`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.6)",
                        mb: 0.8,
                      }}
                    >
                      Package Price
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: { xs: "1.8rem", sm: "2.2rem" },
                        lineHeight: 1.25,
                        fontWeight: 900,
                        overflowWrap: "anywhere",
                        background: gradient,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {currentSlide.price}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1.5,
                    }}
                  >
                    <Button
                      fullWidth
                      onClick={openEnquiry}
                      variant="contained"
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 900,
                        fontSize: 14,
                        color: "#101010",
                        background: gradient,
                        boxShadow: `0 8px 26px ${currentSlide.accent[0]}30`,
                        "&:hover": {
                          background: gradient,
                          filter: "brightness(1.08)",
                          boxShadow: `0 10px 30px ${currentSlide.accent[0]}45`,
                        },
                      }}
                    >
                      Enquire Now
                    </Button>

                    <Button
                      fullWidth
                      onClick={learnMore}
                      variant="outlined"
                      sx={{
                        minHeight: 48,
                        px: 2.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.27)",
                        "&:hover": {
                          borderColor: currentSlide.accent[0],
                          background: `${currentSlide.accent[0]}12`,
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>

                  {usingFallback && !loading && (
                    <Typography
                      sx={{
                        mt: 2,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.42)",
                        textAlign: "center",
                      }}
                    >
                      Showing default packages. Live pricing data is currently
                      unavailable.
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </AnimatePresence>

            {/* Desktop arrows */}
            {!isMobile && slides.length > 1 && (
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    aria-label="Previous package"
                    onClick={previousSlide}
                    sx={{
                      width: 46,
                      height: 46,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.06)",
                      "&:hover": {
                        borderColor: currentSlide.accent[0],
                        background: "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    <ArrowBackIosNewRounded sx={{ fontSize: 17 }} />
                  </IconButton>

                  <IconButton
                    aria-label="Next package"
                    onClick={nextSlide}
                    sx={{
                      width: 46,
                      height: 46,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.06)",
                      "&:hover": {
                        borderColor: currentSlide.accent[0],
                        background: "rgba(255,255,255,0.12)",
                      },
                    }}
                  >
                    <ArrowForwardIosRounded sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    letterSpacing: 1.2,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {String(activeIndex + 1).padStart(2, "0")}{" "}
                  <Box component="span" sx={{ mx: 0.5, opacity: 0.5 }}>
                    /
                  </Box>{" "}
                  {String(slides.length).padStart(2, "0")}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Clickable slide indicators */}
        {slides.length > 1 && (
          <Box
            sx={{
              mt: { xs: 4, md: 5 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            {slides.map((slide, index) => (
              <Box
                key={slide.id}
                component="button"
                type="button"
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goToSlide(index)}
                sx={{
                  width: index === activeIndex ? 34 : 9,
                  height: 9,
                  border: 0,
                  p: 0,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  background:
                    index === activeIndex
                      ? gradient
                      : "rgba(255,255,255,0.28)",
                  boxShadow:
                    index === activeIndex
                      ? `0 0 15px ${currentSlide.accent[0]}55`
                      : "none",
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
