// LoginComponent.js

import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Fade,
} from "@mui/material";

import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

import LoginPageGallery from "./LoginPageGallery";
import LoginPdf from "./LoginPdf";
import LoginPdf1 from "./LoginPdf1";
import LoginPdf2 from "./LoginPdf2";

import LoginVideos from "./LoginVideos";

export default function LoginComponent() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeAlbum, setActiveAlbum] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",

        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 193, 7, 0.10), transparent 30%),
          radial-gradient(circle at 80% 80%, rgba(0, 150, 255, 0.10), transparent 30%),
          linear-gradient(135deg, #050505 0%, #101010 45%, #050505 100%)
        `,

        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.025) 50%, transparent 70%)",
          zIndex: 0,
        },
      }}
    >
      {/* Main Header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          pt: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          px: {
            xs: 1.5,
            sm: 3,
            md: 5,
          },
        }}
      >
        {/* Title */}
        <Box
          sx={{
            textAlign: "center",
            mb: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2.1rem",
                md: "2.5rem",
              },
              fontWeight: 700,
              letterSpacing: {
                xs: 1,
                md: 2,
              },
              color: "#fff",

              textShadow: `
                0 0 10px rgba(255,255,255,0.15),
                0 0 25px rgba(255,193,7,0.12)
              `,
            }}
          >
            Golden Dreams
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "rgba(255,255,255,0.55)",
              fontSize: {
                xs: "0.75rem",
                sm: "0.85rem",
              },
              letterSpacing: 2,
            }}
          >
            YOUR MEMORIES • YOUR MOMENTS • YOUR STORY
          </Typography>
        </Box>

        {/* Glass Navigation */}
        <Paper
          elevation={0}
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: "900px",

            background: "rgba(255,255,255,0.055)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",

            border: "1px solid rgba(255,255,255,0.10)",

            borderRadius: {
              xs: "18px",
              sm: "24px",
            },

            boxShadow: `
              0 15px 50px rgba(0,0,0,0.45),
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,

            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: {
                xs: 68,
                sm: 76,
              },

              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "10px 10px 0 0",

                background:
                  "linear-gradient(90deg, #ffd54f, #ffb300, #fff176)",

                boxShadow:
                  "0 0 15px rgba(255,193,7,0.65)",
              },

              "& .MuiTab-root": {
                minHeight: {
                  xs: 68,
                  sm: 76,
                },

                color: "rgba(255,255,255,0.45)",
                fontWeight: 600,

                fontSize: {
                  xs: "0.72rem",
                  sm: "0.85rem",
                },

                transition: "all 0.3s ease",

                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.04)",
                },
              },

              "& .Mui-selected": {
                color: "#ffd54f !important",
                textShadow: "0 0 12px rgba(255,193,7,0.35)",
              },
            }}
          >
            <Tab
              icon={<PhotoLibraryIcon />}
              iconPosition="top"
              label="Photos"
            />

            <Tab
              icon={<MenuBookIcon />}
              iconPosition="top"
              label="Album"
            />

            <Tab
              icon={<VideoLibraryIcon />}
              iconPosition="top"
              label="Video"
            />
          </Tabs>
        </Paper>
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          mt: {
            xs: 2,
            sm: 3,
          },
          pb: 5,
        }}
      >
        {/* ================= PHOTOS ================= */}
        {activeTab === 0 && (
          <Fade in timeout={350}>
            <Box sx={{ width: "100%" }}>
              <LoginPageGallery />
            </Box>
          </Fade>
        )}

        {/* ================= ALBUM ================= */}
        {activeTab === 1 && (
          <Fade in timeout={350}>
            <Box
              sx={{
                width: "100%",
              }}
            >
              {/* Album selector */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  px: 2,
                  mb: 2,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex",
                    gap: 1,
                    p: 0.7,

                    maxWidth: "600px",
                    width: "100%",

                    background: "rgba(255,255,255,0.045)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",

                    border:
                      "1px solid rgba(255,255,255,0.09)",

                    borderRadius: "18px",

                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  {[
                    {
                      label: "Album 1",
                      icon: "01",
                    },
                    {
                      label: "Album 2",
                      icon: "02",
                    },
                    {
                      label: "Album 3",
                      icon: "03",
                    },
                  ].map((album, index) => (
                    <Box
                      key={album.label}
                      onClick={() => setActiveAlbum(index)}
                      sx={{
                        flex: 1,

                        py: {
                          xs: 1,
                          sm: 1.2,
                        },

                        px: 1,

                        textAlign: "center",

                        cursor: "pointer",

                        borderRadius: "13px",

                        color:
                          activeAlbum === index
                            ? "#ffd54f"
                            : "rgba(255,255,255,0.5)",

                        background:
                          activeAlbum === index
                            ? "rgba(255,193,7,0.10)"
                            : "transparent",

                        border:
                          activeAlbum === index
                            ? "1px solid rgba(255,193,7,0.20)"
                            : "1px solid transparent",

                        transition: "all 0.25s ease",

                        "&:hover": {
                          background:
                            "rgba(255,255,255,0.07)",
                          color: "#fff",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.65rem",
                          opacity: 0.55,
                        }}
                      >
                        {album.icon}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.72rem",
                            sm: "0.82rem",
                          },
                          fontWeight: 600,
                        }}
                      >
                        {album.label}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>

              {/* Album components */}
              {activeAlbum === 0 && <LoginPdf />}
              {activeAlbum === 1 && <LoginPdf1 />}
              {activeAlbum === 2 && <LoginPdf2 />}
            </Box>
          </Fade>
        )}

        {/* ================= VIDEO ================= */}
        {activeTab === 2 && (
          <Fade in timeout={350}>
            <Box sx={{ width: "100%" }}>
              <LoginVideos />
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
}