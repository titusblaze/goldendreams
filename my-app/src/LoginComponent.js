
import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Fade,
} from "@mui/material";

import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";

import LoginPageGallery from "./LoginPageGallery";
import LoginPdf1 from "./LoginPdf1";
import LoginVideos from "./LoginVideos";

const GOLD = "#D9B568";
const GOLD_LIGHT = "#F5E4B2";
const TEXT_MUTED = "rgba(239,231,214,0.58)";

export default function LoginComponent() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: "Photos",
      icon: <PhotoLibraryRoundedIcon />,
    },
    {
      label: "Albums",
      icon: <MenuBookRoundedIcon />,
    },
    {
      label: "Videos",
      icon: <VideoLibraryRoundedIcon />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        isolation: "isolate",
        overflowX: "clip",
        color: "#F5F0E6",

        background: `
          radial-gradient(
            ellipse at 15% 5%,
            rgba(201,161,77,0.11),
            transparent 32%
          ),
          radial-gradient(
            ellipse at 90% 55%,
            rgba(145,108,45,0.065),
            transparent 35%
          ),
          linear-gradient(
            145deg,
            #08090D 0%,
            #111116 48%,
            #08090C 100%
          )
        `,

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: -1,
          opacity: 0.22,
          backgroundImage:
            "radial-gradient(rgba(235,210,158,0.18) 0.6px, transparent 0.6px)",
          backgroundSize: "26px 26px",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          boxSizing: "border-box",

          // Space below the fixed DashboardNavbar
          pt: {
            xs: "76px",
            sm: "88px",
            md: "96px",
          },

          px: {
            xs: 1.5,
            sm: 3,
            md: 5,
          },
        }}
      >
        {/* BRAND TITLE */}
        <Box
          sx={{
            textAlign: "center",
            mb: {
              xs: 2.2,
              sm: 2.7,
              md: 3,
            },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "1.65rem",
                sm: "2.2rem",
                md: "2.7rem",
              },
              lineHeight: 1.2,
              fontWeight: 750,
              letterSpacing: {
                xs: "0.025em",
                sm: "0.055em",
              },

              background:
                "linear-gradient(100deg, #F7E8BE 5%, #D7B15F 48%, #F4DDA0 95%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",

              filter:
                "drop-shadow(0 3px 18px rgba(211,174,93,0.13))",
            }}
          >
            Golden Dreams
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              color: TEXT_MUTED,
              fontSize: {
                xs: "0.59rem",
                sm: "0.72rem",
                md: "0.78rem",
              },
              fontWeight: 500,
              letterSpacing: {
                xs: "0.11em",
                sm: "0.21em",
              },
              lineHeight: 1.8,
            }}
          >
            YOUR MEMORIES · YOUR MOMENTS · YOUR STORY
          </Typography>

          {/* Gold accent */}
          <Box
            sx={{
              width: { xs: 42, sm: 55 },
              height: 2,
              mx: "auto",
              mt: 1.5,
              borderRadius: 5,
              background:
                "linear-gradient(90deg, transparent, #D9B568, transparent)",
            }}
          />
        </Box>

        {/* NAVIGATION */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 780,
            mx: "auto",
            overflow: "hidden",
            boxSizing: "border-box",

            background:
              "linear-gradient(135deg, rgba(29,28,26,0.92), rgba(13,14,18,0.96))",

            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",

            border: "1px solid rgba(217,181,104,0.23)",
            borderRadius: {
              xs: "15px",
              sm: "19px",
            },

            boxShadow:
              "0 12px 34px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            aria-label="Gallery sections"
            sx={{
              minHeight: {
                xs: 61,
                sm: 69,
                md: 73,
              },

              "& .MuiTabs-indicator": {
                height: 2,
                borderRadius: "3px 3px 0 0",
                background:
                  "linear-gradient(90deg, #B58A3A, #F5E0A5, #C59B4A)",
                boxShadow:
                  "0 0 12px rgba(217,181,104,0.3)",
              },

              "& .MuiTab-root": {
                minWidth: 0,
                minHeight: {
                  xs: 61,
                  sm: 69,
                  md: 73,
                },

                px: {
                  xs: 0.5,
                  sm: 1.5,
                },

                py: 1,
                gap: {
                  xs: 0.4,
                  sm: 0.65,
                },

                color: "rgba(239,231,214,0.53)",
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.82rem",
                  md: "0.86rem",
                },

                fontWeight: 600,
                letterSpacing: "0.02em",
                textTransform: "none",

                transition:
                  "color 0.22s ease, background 0.22s ease",

                "& .MuiSvgIcon-root": {
                  fontSize: {
                    xs: 20,
                    sm: 22,
                  },
                },

                "&:hover": {
                  color: GOLD_LIGHT,
                  background:
                    "rgba(217,181,104,0.045)",
                },

                "&.Mui-selected": {
                  color: GOLD_LIGHT,
                  background:
                    "linear-gradient(180deg, rgba(217,181,104,0.08), transparent)",
                },

                "&:focus-visible": {
                  outline: `2px solid ${GOLD}`,
                  outlineOffset: -3,
                },
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.label}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          mt: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          pb: {
            xs: 3,
            sm: 4,
            md: 5,
          },
        }}
      >
        {/* PHOTOS */}
        {activeTab === 0 && (
          <Fade in timeout={250}>
            <Box sx={{ width: "100%" }}>
              <LoginPageGallery />
            </Box>
          </Fade>
        )}

        {/* SINGLE ALBUM */}
        {activeTab === 1 && (
          <Fade in timeout={250}>
            <Box sx={{ width: "100%" }}>
              <LoginPdf1 />
            </Box>
          </Fade>
        )}

        {/* VIDEOS */}
        {activeTab === 2 && (
          <Fade in timeout={250}>
            <Box sx={{ width: "100%" }}>
              <LoginVideos />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
}
