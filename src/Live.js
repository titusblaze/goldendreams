
import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import LiveTvRoundedIcon from "@mui/icons-material/LiveTvRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { getAllApiData } from "./api";
import "./App.css";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";

const fetchLiveData = async () => {
  const result = await getAllApiData();

  if (!Array.isArray(result)) {
    throw new Error("The API did not return a valid data array.");
  }

  return result;
};

// Extract YouTube video ID from supported YouTube URLs.
const extractYouTubeID = (url) => {
  if (!url) return "";

  const value = String(url).trim();

  // Accept a plain YouTube video ID.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`
    );

    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (hostname === "youtu.be" || hostname === "m.youtu.be") {
      return parts[0] || "";
    }

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v");
      }

      const typeIndex = parts.findIndex((part) =>
        ["embed", "shorts", "live", "v"].includes(part)
      );

      if (typeIndex !== -1) {
        return parts[typeIndex + 1] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
};

export default function Live() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [thumbnailErrors, setThumbnailErrors] = useState({});

  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["goldendreams-live-tv"],
    queryFn: fetchLiveData,
    staleTime: 1000 * 60 * 5,
  });

  // Google Sheets API field mapping:
  // Id         = 11
  // link       = YouTube URL
  // LabelText  = Yes / No
  // LabelText1 = Title
  // LabelText2 = Description

  const enabledStreams = useMemo(() => {
    return data
      .filter((item) => String(item.Id).trim() === "11")
      .filter(
        (item) =>
          String(item.LabelText || "").trim().toLowerCase() === "yes"
      )
      .map((item, index) => {
        const videoID = extractYouTubeID(item.link);

        return {
          id: `${videoID}-${index}`,
          videoID,
          title: item.LabelText1,
          description: item.LabelText2,
        };
      })
      .filter((item) => item.videoID);
  }, [data]);

  const handleOpenVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        mt:{ xs: 5, sm: 5, md: 5 },
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 1.5, sm: 2, md: 3 },
        color: "#fff",
        background: 'transparent',
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ mb: 1.5 }}
          >
            <LiveTvRoundedIcon
              sx={{
                fontSize: { xs: 32, sm: 40 },
                color: GOLD,
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.6rem", md: "3.2rem" },
                fontWeight: 800,
                letterSpacing: { xs: 1, sm: 2.5 },
                textAlign: "center",
                color: LIGHT_GOLD,
                textShadow: "0 0 25px rgba(216,177,90,0.2)",
              }}
            >
              GOLDEN DREAMS LIVE
            </Typography>
          </Stack>

          <Typography
            sx={{
              textAlign: "center",
              maxWidth: 650,
              mx: "auto",
              color: "rgba(255,255,255,0.65)",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              lineHeight: 1.8,
              mb: 1,
            }}
          >
            Your moments, your memories, your stories — watch them here.
          </Typography>

          <Stack
            direction="row"
            justifyContent="center"
            sx={{ mt: 2, mb: { xs: 4, md: 5 } }}
          >
            <Chip
              icon={<LiveTvRoundedIcon />}
              label={`${enabledStreams.length} ${
                enabledStreams.length === 1 ? "VIDEO" : "VIDEOS"
              } AVAILABLE`}
              sx={{
                color: LIGHT_GOLD,
                background: "rgba(216,177,90,0.09)",
                border: "1px solid rgba(216,177,90,0.35)",
                fontWeight: 700,
                letterSpacing: 1,
                "& .MuiChip-icon": { color: GOLD },
              }}
            />
          </Stack>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ py: 10 }}
          >
            <CircularProgress sx={{ color: GOLD }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
              Loading videos...
            </Typography>
          </Stack>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => refetch()}
              >
                Retry
              </Button>
            }
            sx={{
              maxWidth: 700,
              mx: "auto",
              background: "rgba(100,20,20,0.2)",
              color: "#fff",
              border: "1px solid rgba(255,100,100,0.3)",
              "& .MuiAlert-icon": { color: "#ff8a80" },
            }}
          >
            {error?.message || "Unable to load videos. Please try again."}
          </Alert>
        )}

        {/* No enabled videos */}
        {!isLoading && !isError && enabledStreams.length === 0 && (
          <Box
            sx={{
              maxWidth: 650,
              mx: "auto",
              p: { xs: 3, sm: 5 },
              textAlign: "center",
              borderRadius: 4,
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(216,177,90,0.2)",
              boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
            }}
          >
            <LiveTvRoundedIcon
              sx={{ fontSize: 52, color: GOLD, mb: 1.5 }}
            />

            <Typography
              sx={{
                color: LIGHT_GOLD,
                fontSize: "1.25rem",
                fontWeight: 700,
                mb: 1,
              }}
            >
              No videos available
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.8,
              }}
            >
              Please check back later for new videos.
            </Typography>
          </Box>
        )}

        {/* Responsive clickable thumbnail gallery */}
        {!isLoading && !isError && enabledStreams.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
            }}
          >
            {enabledStreams.map((video, index) => {
              const thumbnailUrl = thumbnailErrors[video.videoID]
                ? `https://img.youtube.com/vi/${video.videoID}/hqdefault.jpg`
                : `https://img.youtube.com/vi/${video.videoID}/maxresdefault.jpg`;

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.07, 0.4),
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      overflow: "hidden",
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(216,177,90,0.22)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
                      transition:
                        "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        borderColor: GOLD,
                        boxShadow: "0 16px 40px rgba(216,177,90,0.12)",
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleOpenVideo(video)}
                      aria-label={`Play ${video.title}`}
                      sx={{ height: "100%" }}
                    >
                      {/* Video thumbnail */}
                      <Box
                        sx={{
                          position: "relative",
                          aspectRatio: "16 / 9",
                          overflow: "hidden",
                          background: "#171717",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={thumbnailUrl}
                          alt={video.title}
                          onError={() => {
                            if (!thumbnailErrors[video.videoID]) {
                              setThumbnailErrors((previous) => ({
                                ...previous,
                                [video.videoID]: true,
                              }));
                            }
                          }}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.45s ease",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0.02) 70%)",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PlayCircleFilledRoundedIcon
                            sx={{
                              fontSize: { xs: 56, sm: 64 },
                              color: LIGHT_GOLD,
                              filter:
                                "drop-shadow(0 3px 14px rgba(0,0,0,0.7))",
                            }}
                          />
                        </Box>

                        <Chip
                          label="WATCH VIDEO"
                          size="small"
                          sx={{
                            position: "absolute",
                            left: 12,
                            bottom: 12,
                            color: "#fff",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            letterSpacing: 0.7,
                            background: "rgba(0,0,0,0.65)",
                            border: "1px solid rgba(216,177,90,0.6)",
                            backdropFilter: "blur(8px)",
                          }}
                        />
                      </Box>

                      {/* API title and description: left aligned */}
                      <CardContent
                        sx={{
                          p: 2,
                          textAlign: "left",
                          "&:last-child": { pb: 2 },
                        }}
                      >
                        <Typography
                          component="h2"
                          sx={{
                            color: LIGHT_GOLD,
                            fontSize: { xs: "1rem", sm: "1.05rem" },
                            fontWeight: 700,
                            lineHeight: 1.5,
                            textAlign: "left",
                            mb: 1,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {video.title}
                        </Typography>

                        <Typography
                          component="p"
                          sx={{
                            color: "rgba(255,255,255,0.68)",
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            fontWeight: 400,
                            lineHeight: 1.7,
                            textAlign: "left",
                            whiteSpace: "pre-line",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {video.description}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 1.5,
                            color: GOLD,
                            fontSize: "0.78rem",
                            textAlign: "left",
                          }}
                        >
                          Tap to watch
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              );
            })}
          </Box>
        )}

        {/* Refresh button */}
        {!isLoading && (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => refetch()}
              disabled={isFetching}
              sx={{
                color: LIGHT_GOLD,
                borderColor: "rgba(216,177,90,0.45)",
                borderRadius: 5,
                px: 3,
                "&:hover": {
                  borderColor: GOLD,
                  background: "rgba(216,177,90,0.08)",
                },
              }}
            >
              {isFetching ? "Refreshing..." : "Refresh Videos"}
            </Button>
          </Stack>
        )}
      </Container>

      {/* Full-screen video player */}
      <Dialog
        open={Boolean(selectedVideo)}
        onClose={handleCloseVideo}
        fullScreen
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            m: 0,
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            borderRadius: 0,
            color: "#fff",
            background:
              "radial-gradient(ellipse at top, rgba(216,177,90,0.08), transparent 45%), #050505",
          },
        }}
      >
        {selectedVideo && (
          <>
            {/* Player header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                px: { xs: 1.5, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                borderBottom: "1px solid rgba(216,177,90,0.2)",
                background: "rgba(8,8,8,0.9)",
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 0.4 }}
                >
                  <LiveTvRoundedIcon sx={{ color: GOLD, fontSize: 22 }} />

                  <Typography
                    sx={{
                      color: LIGHT_GOLD,
                      fontWeight: 800,
                      letterSpacing: { xs: 0.5, sm: 1.2 },
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                    }}
                  >
                    GOLDEN DREAMS
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: { xs: "0.82rem", sm: "1rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedVideo.title}
                </Typography>
              </Box>

              <Tooltip title="Close video">
                <IconButton
                  onClick={handleCloseVideo}
                  aria-label="Close video player"
                  sx={{
                    flexShrink: 0,
                    color: LIGHT_GOLD,
                    border: "1px solid rgba(216,177,90,0.35)",
                    "&:hover": {
                      color: "#fff",
                      background: "rgba(216,177,90,0.12)",
                    },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Video and description */}
            <DialogContent
                sx={{
                  p: { xs: 1, sm: 2, md: 3 },
                  display: "block",
                  overflowY: "auto",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                  WebkitOverflowScrolling: "touch",
                }}
              >
              <Box sx={{ width: "100%", maxWidth: 1500, mx: "auto" }}>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    maxHeight: "78vh",
                    overflow: "hidden",
                    borderRadius: { xs: 1.5, sm: 2.5 },
                    border: "1px solid rgba(216,177,90,0.35)",
                    boxShadow: "0 0 45px rgba(216,177,90,0.09)",
                    background: "#000",
                  }}
                >
                  <Box
                    component="iframe"
                    key={selectedVideo.videoID}
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoID}?autoplay=1&controls=1&rel=0&playsinline=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      border: 0,
                    }}
                  />
                </Box>

                <Box sx={{ mt: 2, textAlign: "left" }}>
                  <Typography
                    component="h2"
                    sx={{
                      color: LIGHT_GOLD,
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      fontWeight: 700,
                      textAlign: "left",
                      mb: 1,
                    }}
                  >
                    {selectedVideo.title}
                  </Typography>

                  <Typography
                    component="p"
                    sx={{
                      color: "rgba(255,255,255,0.68)",
                      fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                      textAlign: "left",
                    }}
                  >
                    {selectedVideo.description}
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                      lineHeight: 1.7,
                    }}
                  >
                    Enjoy watching with Golden Dreams.
                  </Typography>

                  <Button
                    component="a"
                    href={`https://www.youtube.com/watch?v=${selectedVideo.videoID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewRoundedIcon />}
                    sx={{
                      alignSelf: { xs: "flex-start", sm: "center" },
                      color: LIGHT_GOLD,
                      border: "1px solid rgba(216,177,90,0.35)",
                      borderRadius: 5,
                      px: 2,
                      "&:hover": {
                        background: "rgba(216,177,90,0.1)",
                        borderColor: GOLD,
                      },
                    }}
                  >
                    Open on YouTube
                  </Button>
                </Stack>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
