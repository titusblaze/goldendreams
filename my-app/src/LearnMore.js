
import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import MovieCreationRoundedIcon from "@mui/icons-material/MovieCreationRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";

const pageContent = {
  title: "Discover Golden Dreams",
  subtitle: "Every Moment Has a Story",
  intro:
    "Golden Dreams is a creative photography and design studio dedicated to transforming special moments into timeless memories. We bring together photography, filmmaking, album design and creative storytelling to preserve the people, emotions and experiences that matter most.",
  vision:
    "Our vision is to become a trusted creative partner for families and individuals by preserving meaningful memories through thoughtful photography, beautiful films and carefully designed albums.",
  mission:
    "Our mission is to capture genuine emotions, create lasting visual stories and deliver creative work with care, imagination and attention to detail.",
  photography:
    "Every photograph holds a moment that can never be repeated. We aim to capture natural expressions, meaningful details and authentic emotions so that every image becomes a treasured memory.",
  films:
    "Video brings movement, voices, expressions and atmosphere together. Our filmmaking approach focuses on preserving the feeling of special occasions and turning them into stories that can be revisited and shared.",
  albums:
    "A thoughtfully designed album brings photographs together into a beautiful visual journey. We combine image selection, creative layouts and careful presentation to help your memories live beyond a screen.",
  approach:
    "We believe every customer and every occasion has a unique story. We listen to your ideas, understand your preferences and approach each project with creativity, care and attention to detail.",
  whyUs:
    "We value meaningful storytelling, creative presentation, personal attention and the importance of preserving memories. Our goal is to make your experience thoughtful and enjoyable while creating work you will be proud to revisit for years to come.",
};

const services = [
  {
    icon: <CameraAltRoundedIcon />,
    title: "Photography",
    description: pageContent.photography,
  },
  {
    icon: <MovieCreationRoundedIcon />,
    title: "Videography & Films",
    description: pageContent.films,
  },
  {
    icon: <CollectionsRoundedIcon />,
    title: "Creative Album Design",
    description: pageContent.albums,
  },
];

function ContentSection({ title, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <Box
        sx={{
          height: "100%",
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          border: "1px solid rgba(216,177,90,0.2)",
          background: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(12px)",
          transition: "border-color 0.3s ease, transform 0.3s ease",
          "&:hover": {
            borderColor: "rgba(216,177,90,0.55)",
            transform: "translateY(-3px)",
          },
        }}
      >
        <Typography
          component="h2"
          sx={{
            mb: 1.5,
            color: LIGHT_GOLD,
            fontSize: { xs: "1.15rem", sm: "1.3rem" },
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "0.95rem",
            lineHeight: 1.9,
          }}
        >
          {children}
        </Typography>
      </Box>
    </motion.div>
  );
}

export default function LearnMore() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "#fff",
        overflow: "hidden",
        background: `
          radial-gradient(ellipse at top, rgba(216,177,90,0.12), transparent 48%),
          linear-gradient(145deg, #080808, #11100D 55%, #080808)
        `,
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: { xs: 3, md: 4 },
            color: LIGHT_GOLD,
            textTransform: "none",
            "&:hover": {
              background: "rgba(216,177,90,0.08)",
            },
          }}
        >
          Go Back
        </Button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box
            sx={{
              textAlign: "center",
              maxWidth: 850,
              mx: "auto",
              mb: { xs: 5, md: 7 },
            }}
          >
            <AutoAwesomeRoundedIcon
              sx={{
                color: GOLD,
                fontSize: 42,
                mb: 1.5,
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "2.1rem", sm: "3rem", md: "4rem" },
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: { xs: 0.5, sm: 1.5 },
                background: `linear-gradient(110deg, ${GOLD}, ${LIGHT_GOLD}, ${GOLD})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 2,
              }}
            >
              {pageContent.title}
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontSize: { xs: "1rem", sm: "1.25rem" },
                letterSpacing: { xs: 1.5, sm: 3 },
                fontWeight: 600,
                mb: 2.5,
              }}
            >
              {pageContent.subtitle}
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                lineHeight: 2,
              }}
            >
              {pageContent.intro}
            </Typography>
          </Box>
        </motion.div>

        {/* Vision and mission */}
        <Grid container spacing={2.5} sx={{ mb: { xs: 5, md: 7 } }}>
          <Grid item xs={12} md={6}>
            <ContentSection title="Our Vision" index={0}>
              {pageContent.vision}
            </ContentSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <ContentSection title="Our Mission" index={1}>
              {pageContent.mission}
            </ContentSection>
          </Grid>
        </Grid>

        {/* Services */}
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography
            component="h2"
            sx={{
              color: LIGHT_GOLD,
              fontSize: { xs: "1.65rem", sm: "2.1rem" },
              fontWeight: 800,
              textAlign: "center",
              mb: 1,
            }}
          >
            What We Create
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              color: "rgba(255,255,255,0.58)",
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            Thoughtful creativity for the memories you treasure.
          </Typography>

          <Grid container spacing={2.5}>
            {services.map((service, index) => (
              <Grid item xs={12} md={4} key={service.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      boxSizing: "border-box",
                      p: { xs: 2.5, sm: 3 },
                      borderRadius: 3,
                      border: "1px solid rgba(216,177,90,0.22)",
                      background: "rgba(255,255,255,0.025)",
                      textAlign: "center",
                      transition: "border-color 0.3s ease",
                      "&:hover": {
                        borderColor: GOLD,
                      },
                    }}
                  >
                    <Box sx={{ color: GOLD, mb: 1.5 }}>
                      {React.cloneElement(service.icon, {
                        sx: { fontSize: 38 },
                      })}
                    </Box>

                    <Typography
                      component="h3"
                      sx={{
                        color: LIGHT_GOLD,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    >
                      {service.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.9rem",
                        lineHeight: 1.9,
                        textAlign: "left",
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Creative approach */}
        <Grid container spacing={2.5} sx={{ mb: { xs: 5, md: 7 } }}>
          <Grid item xs={12} md={6}>
            <ContentSection title="Our Creative Approach" index={0}>
              {pageContent.approach}
            </ContentSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <ContentSection title="Why Choose Golden Dreams?" index={1}>
              {pageContent.whyUs}
            </ContentSection>
          </Grid>
        </Grid>

        {/* Closing section */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: "1px solid rgba(216,177,90,0.32)",
            background:
              "linear-gradient(135deg, rgba(216,177,90,0.09), rgba(255,255,255,0.015))",
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: LIGHT_GOLD,
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 800,
              mb: 1.5,
            }}
          >
            Your Memories. Your Moments. Your Story.
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.9,
              maxWidth: 650,
              mx: "auto",
              mb: 3,
            }}
          >
            Let Golden Dreams help preserve the moments that matter most.
            Every memory deserves to be remembered, celebrated and shared.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate("/contact")}
            sx={{
              px: 3.5,
              py: 1.2,
              borderRadius: 6,
              borderColor: GOLD,
              color: LIGHT_GOLD,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                borderColor: LIGHT_GOLD,
                color: "#080808",
                background: `linear-gradient(110deg, ${GOLD}, ${LIGHT_GOLD})`,
              },
            }}
          >
            Contact Golden Dreams
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
