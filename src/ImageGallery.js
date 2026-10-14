import React, { useState } from "react";

import {
  Box,
  Grid,
  Dialog,
  IconButton,
  Typography,
  CircularProgress,
  Fade,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAllApiData } from "./api";

export default function ImageGallery() {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Fetch all Google Sheets records
  const {
    data: apiData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["goldenDreamsGallery"],
    queryFn: getAllApiData,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Get every image record with Id = 3
  const images = apiData.filter(
    (item) =>
      Number(item?.Id) === 3 &&
      typeof item?.link === "string" &&
      item.link.trim() !== "" &&
      /^https?:\/\//i.test(item.link.trim())
  );

  // Gallery title from the first matching record
  const galleryTitle =
    images.find((item) => item.Title?.trim())?.Title ||
    "Golden Dreams Gallery";

  const currentImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  const handleOpen = (index) => {
    if (!images[index]) return;

    setSelectedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIndex(null);
  };

  const handleNext = () => {
    if (images.length < 2) return;

    setSelectedIndex((previous) => (previous + 1) % images.length);
  };

  const handlePrev = () => {
    if (images.length < 2) return;

    setSelectedIndex(
      (previous) => (previous - 1 + images.length) % images.length
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        p: { xs: 2, sm: 3, md: 4 },
        background: "transparent",
        backgroundImage: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* GALLERY TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Typography
          component="h1"
          sx={{
            textAlign: "center",
            fontWeight: 900,
            mb: { xs: 3, md: 4 },
            fontSize: {
              xs: "1.55rem",
              sm: "2rem",
              md: "2.5rem",
            },
            letterSpacing: { xs: 1, sm: 2 },
            textTransform: "uppercase",
            background:
              "linear-gradient(90deg, #FFDB4D, #FFB300, #FFD95A, #FFF07A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {galleryTitle}
        </Typography>
      </motion.div>

      {/* LOADING */}
      {isLoading && (
        <Box
          sx={{
            minHeight: 250,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#D4AF37" }} />
          <Typography sx={{ color: "text.secondary" }}>
            Loading gallery images...
          </Typography>
        </Box>
      )}

      {/* API ERROR */}
      {isError && (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography color="error">
            Unable to load gallery:{" "}
            {error?.message || "An unexpected error occurred."}
          </Typography>

          <Button
            onClick={() => refetch()}
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "#D4AF37",
              color: "#111",
              fontWeight: 700,
              "&:hover": { bgcolor: "#F0CB53" },
            }}
          >
            Retry
          </Button>
        </Box>
      )}

      {/* GALLERY CONTENT */}
      {!isLoading && !isError && (
        <>
          {images.length === 0 ? (
            <Typography sx={{ py: 5, textAlign: "center" }}>
              No gallery images found for Id 3.
            </Typography>
          ) : (
            <>
              {/* IMAGE COUNT */}
              <Typography
                sx={{
                  width: "100%",
                  maxWidth: 1250,
                  mb: 2,
                  color: "text.secondary",
                  fontSize: 13,
                  textAlign: "right",
                }}
              >
                {images.length} photos
              </Typography>

              {/* RESPONSIVE IMAGE COLLAGE */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1250,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "stretch",
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                {images.map((img, index) => {
                  const isLarge = index % 3 === 0;

                  return (
                    <motion.div
                      key={`${img.Id}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 20,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index * 0.06, 0.4),
                      }}
                      whileHover={{ scale: 1.025 }}
                      onClick={() => handleOpen(index)}
                      style={{
                        width: isLarge
                          ? "calc(50% - 12px)"
                          : "calc(25% - 12px)",
                        minWidth: 0,
                        height: isLarge ? 280 : 220,
                        cursor: "pointer",
                        borderRadius: 18,
                        overflow: "hidden",
                        position: "relative",
                        background: "rgba(255,255,255,0.035)",
                        border:
                          "1px solid rgba(212,175,55,0.28)",
                        boxShadow:
                          "0 10px 25px rgba(0,0,0,0.3), 0 0 12px rgba(212,175,55,0.08)",
                      }}
                    >
                      <motion.img
                        src={img.link}
                        alt={
                          img.LabelText ||
                          `${galleryTitle} photo ${index + 1}`
                        }
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.opacity = "0.25";
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                      />

                      {/* GOLD IMAGE NUMBER */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 2,
                          color: "#FFD95A",
                          bgcolor: "rgba(0,0,0,0.65)",
                          fontSize: 12,
                          fontWeight: 700,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </>
          )}
        </>
      )}

      {/* FULLSCREEN IMAGE VIEWER */}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            background: "rgba(8,8,8,0.97)",
            color: "#fff",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
          }}
        >
          {/* CLOSE */}
          <IconButton
            onClick={handleClose}
            aria-label="Close image viewer"
            sx={{
              position: "absolute",
              top: { xs: 12, sm: 22 },
              right: { xs: 12, sm: 22 },
              zIndex: 50,
              color: "#FFD95A",
              bgcolor: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                bgcolor: "rgba(212,175,55,0.25)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 32 }} />
          </IconButton>

          {/* PREVIOUS */}
          {images.length > 1 && (
            <IconButton
              onClick={handlePrev}
              aria-label="Previous image"
              sx={{
                position: "absolute",
                top: "50%",
                left: { xs: 8, sm: 22 },
                transform: "translateY(-50%)",
                zIndex: 40,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.13)",
                "&:hover": {
                  bgcolor: "rgba(212,175,55,0.35)",
                },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* NEXT */}
          {images.length > 1 && (
            <IconButton
              onClick={handleNext}
              aria-label="Next image"
              sx={{
                position: "absolute",
                top: "50%",
                right: { xs: 8, sm: 22 },
                transform: "translateY(-50%)",
                zIndex: 40,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.13)",
                "&:hover": {
                  bgcolor: "rgba(212,175,55,0.35)",
                },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}

          {/* ACTIVE IMAGE */}
          {currentImage && (
            <motion.img
              key={selectedIndex}
              src={currentImage.link}
              alt={
                currentImage.LabelText ||
                `Gallery image ${(selectedIndex ?? 0) + 1}`
              }
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                boxSizing: "border-box",
                padding: "60px 50px 100px",
              }}
            />
          )}

          {/* IMAGE COUNTER */}
          {currentImage && (
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                px: 1.5,
                py: 0.7,
                borderRadius: 2,
                color: "#FFD95A",
                bgcolor: "rgba(0,0,0,0.55)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {(selectedIndex ?? 0) + 1} / {images.length}
            </Box>
          )}

          {/* MOBILE THUMBNAILS */}
          {images.length > 1 && (
            <Grid
              container
              wrap="nowrap"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 10,
                left: 0,
                width: "100%",
                px: 2,
                boxSizing: "border-box",
                display: { xs: "flex", md: "none" },
                overflowX: "auto",
                flexWrap: "nowrap",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { height: 4 },
                "&::-webkit-scrollbar-thumb": {
                  background: "#D4AF37",
                  borderRadius: 4,
                },
              }}
            >
              {images.map((img, index) => (
                <Grid
                  item
                  key={`thumb-${img.Id}-${index}`}
                  sx={{ flex: "0 0 auto" }}
                >
                  <Box
                    onClick={() => setSelectedIndex(index)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      border:
                        selectedIndex === index
                          ? "2px solid #FFD700"
                          : "2px solid rgba(255,255,255,0.2)",
                      opacity: selectedIndex === index ? 1 : 0.7,
                    }}
                  >
                    <Box
                      component="img"
                      src={img.link}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}