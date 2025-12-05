import React, { useState } from "react";
import {
  Box,
  Grid,
  Dialog,
  IconButton,
  Typography,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { motion } from "framer-motion";

// Sample Images
const images = [
  "https://picsum.photos/id/1005/1000/700",
  "https://picsum.photos/id/1011/1000/700",
  "https://picsum.photos/id/1025/1000/700",
  "https://picsum.photos/id/1039/1000/700",
  "https://picsum.photos/id/1043/1000/700",
  "https://picsum.photos/id/1050/1000/700",
];

export default function ImageGallery() {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleOpen = (index) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIndex(null);
  };

  const nextImage = () =>
    setSelectedIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Box
      sx={{
        p: 4,
        background: "linear-gradient(135deg, #0f0f0f, #1c1c1e)",
        minHeight: "100vh",
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
      }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 900,
            mb: 4,
            background:
              "linear-gradient(90deg, #FFDB4D, #FFB300, #FFD95A, #FFF07A)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Sample Image Gallery
        </Typography>
      </motion.div>

      {/* Image Grid */}
      <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center", // center align
        gap: '10px', // spacing between images
      }}
    >
      {images.map((img, index) => {
        // Collage size logic (change sizes for each image)
        const width = index % 3 === 0 ? "48%" : index % 4 === 0 ? "30%" : "22%";
        const height = index % 3 === 0 ? 260 : index % 4 === 0 ? 220 : 200;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.08 }}
        style={{
          width: width,
          height: height,
          cursor: "pointer",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0px 10px 25px rgba(0,0,0,0.45), inset 0px 0px 25px rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(8px)",
        }}
        onClick={() => handleOpen(index)}
      >
        <motion.img
          src={img}
          alt="gallery"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    );
  })}
</Box>


      {/* Fullscreen Modal */}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        PaperProps={{
          style: {
            background: "rgba(10, 10, 10, 0.92)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ position: "relative", width: "100%", height: "100vh" }}>
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 25,
              right: 25,
              zIndex: 50,
              color: "white",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              '&:hover': { background: "rgba(255,255,255,0.25)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 35 }} />
          </IconButton>

          {/* Previous Button */}
          <IconButton
            onClick={prevImage}
            sx={{
              position: "absolute",
              top: "50%",
              left: 15,
              transform: "translateY(-50%)",
              color: "white",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              '&:hover': { background: "rgba(255,255,255,0.3)" },
              zIndex: 40,
            }}
          >
            <ArrowBackIosNewIcon fontSize="large" />
          </IconButton>

          {/* Next Button */}
          <IconButton
            onClick={nextImage}
            sx={{
              position: "absolute",
              top: "50%",
              right: 15,
              transform: "translateY(-50%)",
              color: "white",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              '&:hover': { background: "rgba(255,255,255,0.3)" },
              zIndex: 40,
            }}
          >
            <ArrowForwardIosIcon fontSize="large" />
          </IconButton>

          {/* Fullscreen Image */}
          {selectedIndex !== null && (
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt="fullscreen"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.22 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )}

          {/* Mobile Thumbnail Grid */}
          <Grid
            container
            spacing={1}
            sx={{
              width:'100%',
              position: "absolute",
              bottom: 10,
              width: "100%",
              px: 2,
              display: { xs: "flex", md: "none" },
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {images.map((img, i) => (
              <Grid item key={i}>
                <Box
                  onClick={() => setSelectedIndex(i)}
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: selectedIndex === i ? "2px solid #FFD700" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={img}
                    alt="thumb"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
}