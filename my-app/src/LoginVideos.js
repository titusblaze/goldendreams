
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Divider,
  Tooltip,
  Dialog,
} from "@mui/material";

import {
  PlayArrowRounded,
  CloseRounded,
  YouTube,
  OpenInNewRounded,
  MovieCreationRounded,
  RefreshRounded,
} from "@mui/icons-material";

const API_BASE =
  "https://golden-dreams-api-proxy.titus-blaze.workers.dev";

// ======================================================
// HELPERS
// ======================================================

function extractVideoId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  let videoId = raw;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase();

      if (host === "youtu.be" || host.endsWith(".youtu.be")) {
        videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      } else if (
        host === "youtube.com" ||
        host.endsWith(".youtube.com") ||
        host === "youtube-nocookie.com" ||
        host.endsWith(".youtube-nocookie.com")
      ) {
        videoId =
          url.searchParams.get("v") ||
          url.pathname.match(
            /^\/(?:embed|shorts|live)\/([^/?]+)/
          )?.[1] ||
          "";
      } else {
        return "";
      }
    } else {
      videoId = raw.split(/[?&#/]/)[0];
    }
  } catch {
    return "";
  }

  return /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : "";
}

function hasValidLocalSession() {
  return Boolean(
    localStorage.getItem("sessionToken") &&
    localStorage.getItem("isLoggedIn") === "true"
  );
}

// ======================================================
// LOGIN VIDEOS
// ======================================================

export default function LoginVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Invalidates any outstanding request after logout/session loss.
  const requestVersion = useRef(0);

  const clearProtectedData = useCallback((message) => {
    requestVersion.current += 1;
    setVideos([]);
    setSelectedVideo(null);
    setLoading(false);
    setError(message);
    document.body.style.overflow = "";
  }, []);

  // ====================================================
  // FETCH AUTHENTICATED VIDEO DATA
  // ====================================================

  const fetchVideos = useCallback(async () => {
    const token = localStorage.getItem("sessionToken");

    if (!token || !hasValidLocalSession()) {
      clearProtectedData(
        "Your session has expired. Please login again."
      );
      return;
    }

    const requestId = ++requestVersion.current;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/albums`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      // Ignore any response belonging to an older request.
      if (requestId !== requestVersion.current) return;

      // Logout may have happened while the request was running.
      if (
        !hasValidLocalSession() ||
        localStorage.getItem("sessionToken") !== token
      ) {
        clearProtectedData(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        window.dispatchEvent(new Event("golden-dreams-logout"));


        clearProtectedData(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load videos. Please try again."
        );
      }

      if (
        result.success !== true ||
        !Array.isArray(result.albums)
      ) {
        throw new Error(
          "Video data is unavailable. Please try again."
        );
      }

      const validVideos = result.albums
        .map((item, index) => {
          const heading = String(item?.heading3 ?? "").trim();
          const videoId = extractVideoId(item?.video);

          if (!heading || !videoId) return null;

          return {
            id: `${videoId}-${index}`,
            heading,
            videoId,
          };
        })
        .filter(Boolean);

      // Final check before displaying protected data.
      if (
        requestId !== requestVersion.current ||
        !hasValidLocalSession() ||
        localStorage.getItem("sessionToken") !== token
      ) {
        return;
      }

      setVideos(validVideos);
      setSelectedVideo(null);
    } catch (err) {
      if (requestId !== requestVersion.current) return;

      console.error("Video API Error:", err);

      if (!hasValidLocalSession()) {
        clearProtectedData(
          "Your session has expired. Please login again."
        );
      } else {
        setVideos([]);
        setSelectedVideo(null);
        setError(
          err?.message ||
            "Unable to load videos. Please try again."
        );
      }
    } finally {
      if (requestId === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [clearProtectedData]);

  // ====================================================
  // SESSION CHECK: BACK BUTTON, RESTORE, LOGOUT
  // ====================================================

  useEffect(() => {
    let active = true;

    const checkSession = () => {
      if (!active) return;

      if (!hasValidLocalSession()) {
        clearProtectedData(
          "Your session has expired. Please login again."
        );
        return;
      }

      fetchVideos();
    };

    const handleStorage = (event) => {
      if (
        event.key === "sessionToken" ||
        event.key === "isLoggedIn" ||
        event.key === null
      ) {
        checkSession();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    window.addEventListener("pageshow", checkSession);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(
      "golden-dreams-logout",
      checkSession
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    checkSession();

    return () => {
      active = false;
      requestVersion.current += 1;

      window.removeEventListener("pageshow", checkSession);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "golden-dreams-logout",
        checkSession
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      document.body.style.overflow = "";
    };
  }, [fetchVideos, clearProtectedData]);

  // ====================================================
  // YOUTUBE URLS
  // ====================================================

  const getEmbedUrl = (id) =>
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`;

  const getThumbnailUrl = (id) =>
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  const getYouTubeUrl = (id) =>
    `https://www.youtube.com/watch?v=${id}`;

  // ====================================================
  // GROUP VIDEOS
  // ====================================================

  const groupedVideos = useMemo(() => {
    const groups = new Map();

    videos.forEach((video) => {
      if (!groups.has(video.heading)) {
        groups.set(video.heading, []);
      }
      groups.get(video.heading).push(video);
    });

    return Array.from(groups, ([heading, items]) => ({
      heading,
      items,
    }));
  }, [videos]);

  // ====================================================
  // OPEN / CLOSE VIDEO
  // ====================================================

  const openVideo = (video) => {
    if (!hasValidLocalSession()) {
      clearProtectedData(
        "Your session has expired. Please login again."
      );
      return;
    }

    setSelectedVideo(video);
    document.body.style.overflow = "hidden";
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "";
  };

  // ====================================================
  // STYLES
  // ====================================================

  const pageBackground =
    "radial-gradient(circle at 15% 0%, rgba(214,181,109,0.10), transparent 28%), radial-gradient(circle at 85% 100%, rgba(214,181,109,0.08), transparent 30%), #080808";

  const glassCard = {
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 15px 45px rgba(0,0,0,0.28)",
    backdropFilter: "blur(15px)",
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: pageBackground,
          color: "#fff",
        }}
      >
        <Box sx={{ textAlign: "center", px: 3 }}>
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              mx: "auto",
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              border: "1px solid rgba(214,181,109,0.35)",
              boxShadow: "0 15px 50px rgba(0,0,0,0.45)",
            }}
          >
            <CircularProgress
              size={30}
              thickness={3}
              sx={{ color: "#d6b56d" }}
            />
          </Box>

          <Typography
            sx={{
              color: "#fff",
              fontSize: { xs: 16, sm: 18 },
              fontWeight: 600,
            }}
          >
            Loading your memories...
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.45)",
              mt: 0.7,
              fontSize: 13,
            }}
          >
            Golden Dreams
          </Typography>
        </Box>
      </Box>
    );
  }

  // ====================================================
  // MAIN PAGE
  // ====================================================

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        background: pageBackground,
        color: "#fff",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 5, lg: 7 },
          mb: { xs: 2.5, md: 4 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight: { xs: 70, md: 82 },
            px: { xs: 2, sm: 3, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderRadius: { xs: 3, md: 4 },
            ...glassCard,
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.2, sm: 1.7 },
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: { xs: 43, sm: 50 },
                height: { xs: 43, sm: 50 },
                flexShrink: 0,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(145deg, rgba(214,181,109,0.22), rgba(214,181,109,0.05))",
                border: "1px solid rgba(214,181,109,0.35)",
              }}
            >
              <MovieCreationRounded
                sx={{
                  color: "#d6b56d",
                  fontSize: { xs: 23, sm: 27 },
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  color: "#d6b56d",
                  fontWeight: 700,
                  fontSize: { xs: 20, sm: 25, md: 28 },
                  lineHeight: 1.1,
                  whiteSpace: "nowrap",
                }}
              >
                Golden Dreams
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: { xs: 9, sm: 10, md: 11 },
                  letterSpacing: { xs: 1.5, sm: 2.5 },
                  mt: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Your Video Memories
              </Typography>
            </Box>
          </Box>

          <Chip
            icon={
              <YouTube
                sx={{
                  color: "#d6b56d !important",
                  fontSize: 19,
                }}
              />
            }
            label={`${videos.length} ${
              videos.length === 1 ? "Video" : "Videos"
            }`}
            sx={{
              flexShrink: 0,
              color: "#fff",
              fontWeight: 600,
              background: "rgba(214,181,109,0.08)",
              border: "1px solid rgba(214,181,109,0.22)",
              "& .MuiChip-label": {
                px: { xs: 1, sm: 1.5 },
              },
            }}
          />
        </Box>
      </Box>

      {/* ERROR / RETRY */}
      {error && (
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 7 },
            mb: 3,
          }}
        >
          <Alert
            severity="error"
            action={
              <Button
                onClick={fetchVideos}
                startIcon={<RefreshRounded />}
                sx={{ color: "#fff" }}
              >
                Retry
              </Button>
            }
            sx={{
              background: "rgba(211,47,47,0.10)",
              color: "#fff",
              border: "1px solid rgba(211,47,47,0.25)",
              "& .MuiAlert-icon": {
                color: "#ef5350",
              },
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* EMPTY STATE */}
      {!error && videos.length === 0 && (
        <Box sx={{ px: 2, py: 8, textAlign: "center" }}>
          <MovieCreationRounded
            sx={{
              fontSize: 65,
              color: "rgba(214,181,109,0.35)",
              mb: 2,
            }}
          />

          <Typography sx={{ fontSize: 22, fontWeight: 600 }}>
            No videos found
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.45)",
              mt: 1,
            }}
          >
            No video memories are available for this account.
          </Typography>

          <Button
            onClick={fetchVideos}
            startIcon={<RefreshRounded />}
            sx={{ mt: 2, color: "#d6b56d" }}
          >
            Try Again
          </Button>
        </Box>
      )}

      {/* VIDEO GROUPS */}
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, sm: 3, md: 5, lg: 7 },
        }}
      >
        {groupedVideos.map((group) => (
          <Box key={group.heading} sx={{ mb: { xs: 4, md: 5 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: { xs: 1.7, md: 2.2 },
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: { xs: 27, md: 32 },
                  borderRadius: 5,
                  background:
                    "linear-gradient(180deg, #e7c980, #9f7d39)",
                  boxShadow: "0 0 18px rgba(214,181,109,0.35)",
                }}
              />

              <Typography
                sx={{
                  fontFamily: "Georgia, serif",
                  fontSize: { xs: 20, sm: 24, md: 28 },
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {group.heading}
              </Typography>

              <Chip
                label={group.items.length}
                size="small"
                sx={{
                  color: "#d6b56d",
                  background: "rgba(214,181,109,0.08)",
                  border: "1px solid rgba(214,181,109,0.20)",
                }}
              />
            </Box>

            <Divider
              sx={{
                mb: { xs: 2, md: 2.5 },
                borderColor: "rgba(255,255,255,0.07)",
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm:
                    group.items.length === 1
                      ? "minmax(0, 760px)"
                      : "repeat(2, minmax(0, 1fr))",
                  lg:
                    group.items.length === 1
                      ? "minmax(0, 760px)"
                      : "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 2, sm: 2.3, md: 2.6 },
              }}
            >
              {group.items.map((video, index) => (
                <Card
                  key={video.id}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: { xs: 3, md: 3.5 },
                    ...glassCard,
                    transition:
                      "transform .3s ease, border-color .3s ease, box-shadow .3s ease",
                    "&:hover": {
                      transform: {
                        xs: "none",
                        md: "translateY(-4px)",
                      },
                      borderColor: "rgba(214,181,109,0.30)",
                      boxShadow: "0 22px 55px rgba(0,0,0,0.38)",
                    },
                  }}
                >
                  {/* THUMBNAIL */}
                  <Box
                    onClick={() => openVideo(video)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${video.heading}`}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        openVideo(video);
                      }
                    }}
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 8.2",
                      cursor: "pointer",
                      overflow: "hidden",
                      background: "#111",
                    }}
                  >
                    <Box
                      component="img"
                      src={getThumbnailUrl(video.videoId)}
                      alt={video.heading}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          getThumbnailUrl(video.videoId);
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        objectFit: "cover",
                        transition: "transform .4s ease",
                        "&:hover": {
                          transform: "scale(1.035)",
                        },
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.48))",
                        pointerEvents: "none",
                      }}
                    />

                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 52, sm: 58, md: 62 },
                          height: { xs: 52, sm: 58, md: 62 },
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(214,181,109,0.94)",
                          boxShadow:
                            "0 10px 35px rgba(0,0,0,0.45), 0 0 30px rgba(214,181,109,0.15)",
                        }}
                      >
                        <PlayArrowRounded
                          sx={{
                            color: "#090909",
                            fontSize: { xs: 31, sm: 35, md: 39 },
                            ml: 0.4,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        px: 1,
                        py: 0.45,
                        borderRadius: 2,
                        background: "rgba(0,0,0,0.55)",
                        border:
                          "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#d6b56d",
                          letterSpacing: 1,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.55)",
                      }}
                    >
                      <YouTube sx={{ color: "#fff", fontSize: 18 }} />
                    </Box>
                  </Box>

                  {/* VIDEO DETAILS */}
                  <CardContent
                    sx={{
                      p: { xs: 1.7, md: 2 },
                      "&:last-child": {
                        pb: { xs: 1.7, md: 2 },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 15 },
                          lineHeight: 1.4,
                          flex: 1,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {video.heading}
                      </Typography>

                      <Tooltip title="Open on YouTube">
                        <IconButton
                          component="a"
                          href={getYouTubeUrl(video.videoId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open video on YouTube"
                          sx={{
                            flexShrink: 0,
                            width: 36,
                            height: 36,
                            color: "#d6b56d",
                            background: "rgba(214,181,109,0.07)",
                            border:
                              "1px solid rgba(214,181,109,0.15)",
                            "&:hover": {
                              background:
                                "rgba(214,181,109,0.14)",
                            },
                          }}
                        >
                          <OpenInNewRounded sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.6,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.35)",
                        letterSpacing: 0.6,
                      }}
                    >
                      TAP TO RELIVE THIS MEMORY
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* FULLSCREEN VIDEO VIEWER */}
      <Dialog
        open={Boolean(selectedVideo) && hasValidLocalSession()}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          closeVideo();
        }}
        fullScreen
        sx={{ zIndex: 999999 }}
        slotProps={{
          backdrop: {
            sx: { background: "rgba(0,0,0,0.97)" },
          },
        }}
        PaperProps={{
          sx: {
            width: "100%",
            height: "100%",
            maxWidth: "none",
            m: 0,
            borderRadius: 0,
            overflow: "hidden",
            background: "#000",
            position: "relative",
            zIndex: 999999,
            boxShadow: "none",
          },
        }}
      >
        {/* TOP BAR */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            minHeight: { xs: 62, sm: 70, md: 76 },
            zIndex: 1000000,
            px: { xs: 1.5, sm: 2.5, md: 3 },
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0))",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{ minWidth: 0, pr: 2, pointerEvents: "auto" }}
          >
            <Typography
              sx={{
                color: "#d6b56d",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Golden Dreams
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontSize: { xs: 14, sm: 17, md: 19 },
                fontWeight: 600,
                mt: 0.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: {
                  xs: "65vw",
                  sm: "70vw",
                  md: "75vw",
                },
              }}
            >
              {selectedVideo?.heading}
            </Typography>
          </Box>

          <IconButton
            onClick={closeVideo}
            aria-label="Close video"
            sx={{
              pointerEvents: "auto",
              flexShrink: 0,
              width: { xs: 42, sm: 46 },
              height: { xs: 42, sm: 46 },
              color: "#fff",
              background: "rgba(0,0,0,0.60)",
              border: "1px solid rgba(214,181,109,0.35)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 5px 25px rgba(0,0,0,0.5)",
              "&:hover": {
                background: "rgba(214,181,109,0.18)",
                color: "#d6b56d",
              },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Box>

        {/* VIDEO PLAYER */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            position: "relative",
          }}
        >
          {selectedVideo && hasValidLocalSession() && (
            <Box
              sx={{
                width: "100%",
                maxWidth: "1800px",
                aspectRatio: "16 / 9",
                position: "relative",
                background: "#000",
              }}
            >
              <Box
                component="iframe"
                key={selectedVideo.videoId}
                src={getEmbedUrl(selectedVideo.videoId)}
                title={selectedVideo.heading}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                sx={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  display: "block",
                  background: "#000",
                }}
              />
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
