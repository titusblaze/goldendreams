import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { getApiData } from "./api";

// Fallback content if the API is unavailable
const fallbackContent = {
  Title: "GOLDEN DREAMS",
  Heading1: "Capture.",
  Heading2: "Create.",
  Heading3: "Inspire.",
  Description1:
    "Golden Dreams is a creative photography and design studio dedicated to transforming special moments into timeless memories. We capture stories through photography, film and creative design with passion, imagination and attention to detail.",
  LabelText: "Discover Golden Dreams",
  Target: "/contact",
};

const fallbackImages = {
  image1:
    "https://res.cloudinary.com/db3qhuau/image/upload/v1788086884/cld-sample.jpg",
  image2:
    "https://res.cloudinary.com/db3qhuau/image/upload/v1789465204/682A5673.jpg",
  image3:
    "https://images.unsplash.com/photo-1541617050654-c85f22ad1aa6?w=500&auto=format&fit=crop&q=60",
};

function AboutUs() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchAboutData = async () => {
      try {
        // ID 2 = Golden Dreams About Us content
        const result = await getApiData(2);

        if (active) {
          setData(result);
          setApiError(false);
        }
      } catch (error) {
        console.error("About Us API error:", error);

        if (active) {
          setApiError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAboutData();

    return () => {
      active = false;
    };
  }, []);

  // API content with fallback values
  const content = {
    Title: data?.Title || fallbackContent.Title,
    Heading1: data?.Heading1 || fallbackContent.Heading1,
    Heading2: data?.Heading2 || fallbackContent.Heading2,
    Heading3: data?.Heading3 || fallbackContent.Heading3,

    Description1:
      data?.Description1 || fallbackContent.Description1,

    LabelText:
      data?.LabelText || fallbackContent.LabelText,

    image1: data?.link || fallbackImages.image1,
    image2: data?.link1 || fallbackImages.image2,
    image3: data?.link2 || fallbackImages.image3,

    Target: data?.Target || fallbackContent.Target,
  };

  // Correct Contact Us navigation
  const handleDiscover = () => {
    const target = content.Target?.trim();

    if (!target) {
      navigate("/contact");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Navigate to internal React Router pages
    if (target.startsWith("/")) {
      navigate(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Open external URLs in a new tab
    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box
      component="section"
      id="about-us"
      sx={{
        width: "100%",
        background: "transparent",
        color: "#fff",
        py: { xs: 7, md: 12 },
        px: { xs: 2, sm: 4, md: 7, lg: 10 },
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          width: "100%",
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "0.9fr 1.1fr",
          },
          gap: { xs: 6, md: 10 },
          alignItems: "center",
        }}
      >
        {/* LEFT: ABOUT US CONTENT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            component="p"
            sx={{
              color: "#D4AF37",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "4px",
              mb: 2,
              textTransform: "uppercase",
            }}
          >
            {content.Title}
          </Typography>

          {/* Main heading */}

          <Typography
            component="h2"
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: {
                xs: "38px",
                sm: "48px",
                md: "58px",
              },
              lineHeight: 1.1,
              fontWeight: 500,
              mb: 3,
              overflowWrap: "anywhere",
            }}
          >
            {content.Heading1}
            <br />

            <Box
              component="span"
              sx={{
                color: "#D4AF37",
                fontStyle: "italic",
              }}
            >
              {content.Heading2}
            </Box>

            <br />

            {content.Heading3}
          </Typography>

          {/* Gold separator */}

          <Box
            sx={{
              width: "60px",
              height: "2px",
              background:
                "linear-gradient(90deg,#F5D76E,#D4AF37)",
              mb: 3,
            }}
          />

          {/* Description */}

          <Typography
            component="p"
            sx={{
              maxWidth: "550px",
              color: "rgba(255,255,255,0.72)",
              fontSize: "16px",
              lineHeight: 1.9,
              mb: 3,
              whiteSpace: "pre-line",
            }}
          >
            {content.Description1}
          </Typography>

          {/* Discover button */}

          <Button
            type="button"
            endIcon={<ArrowForwardIcon />}
            onClick={handleDiscover}
            sx={{
              background:
                "linear-gradient(90deg,#F5D76E,#D4AF37)",
              color: "#000",
              px: 3,
              py: 1.3,
              borderRadius: "4px",
              fontWeight: 700,
              textTransform: "none",
              boxShadow:
                "0 5px 22px rgba(212,175,55,0.12)",
              transition: "all 0.3s ease",

              "&:hover": {
                background:
                  "linear-gradient(90deg,#FFE58A,#D4AF37)",
                boxShadow:
                  "0 7px 28px rgba(212,175,55,0.25)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {content.LabelText}
          </Button>
        </motion.div>

        {/* RIGHT: ORIGINAL THREE-IMAGE COLLAGE */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: {
                xs: "390px",
                sm: "500px",
                md: "600px",
              },
              maxWidth: "650px",
              mx: "auto",
            }}
          >
            {/* IMAGE 1: MAIN IMAGE */}

            <Box
              sx={{
                position: "absolute",
                width: "62%",
                height: "62%",
                right: 0,
                top: 0,
                zIndex: 2,
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,0.5)",
                background: "#151515",
              }}
            >
              <Box
                component="img"
                src={content.image1}
                alt="Golden Dreams photography studio"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImages.image1;
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.6s ease",
                  "&:hover": {
                    transform: "scale(1.04)",
                  },
                }}
              />
            </Box>

            {/* IMAGE 2: BOTTOM LEFT */}

            <Box
              sx={{
                position: "absolute",
                width: "40%",
                height: "45%",
                left: 0,
                bottom: 0,
                zIndex: 3,
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,0.5)",
                background: "#151515",
              }}
            >
              <Box
                component="img"
                src={content.image2}
                alt="Golden Dreams creative photography"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImages.image2;
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.6s ease",
                  "&:hover": {
                    transform: "scale(1.04)",
                  },
                }}
              />
            </Box>

            {/* IMAGE 3: BOTTOM RIGHT */}

            <Box
              sx={{
                position: "absolute",
                width: "52%",
                height: "38%",
                right: "3%",
                bottom: "4%",
                zIndex: 4,
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,0.5)",
                background: "#151515",
              }}
            >
              <Box
                component="img"
                src={content.image3}
                alt="Golden Dreams creative work"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImages.image3;
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.6s ease",
                  "&:hover": {
                    transform: "scale(1.04)",
                  },
                }}
              />
            </Box>

            {/* GOLD DECORATIVE ELEMENT */}

            <Box
              sx={{
                position: "absolute",
                width: "90px",
                height: "90px",
                left: "32%",
                top: "25%",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: "50%",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
          </Box>
        </motion.div>
      </Box>

      {/* API STATUS */}

      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mt: 3,
          }}
        >
          <CircularProgress
            size={17}
            sx={{ color: "#D4AF37" }}
          />

          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 12,
            }}
          >
            Loading content...
          </Typography>
        </Box>
      )}

      {apiError && (
        <Typography
          component="p"
          sx={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            textAlign: "center",
            mt: 2,
          }}
        >
          Showing default content. API data could not be loaded.
        </Typography>
      )}
    </Box>
  );
}

export default AboutUs;