import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography, Grid, Paper } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const DATA_API =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhtC4DP-H55SiwHVgl4v5uoMZPR3TvMtWDcQL89_TuVs9qukPj-0FmIUvfPFoM7iKODfKobT446FaYJyIARQHwcIz5_ob1Tbt2WtZyv5UoSt61w9yBG4RAT2anMy2BcfEwlZAOD8ej0iKRJqSjuIDWgndRB2FXY5kWbXqx842_UjUlEUHoDQyubacriZ4C0Ek4kg-mG2PSdHtHCjustQ58FeSzY0hbY5MxiL29ZhZz7eN_T4cF_2B6BgeGebg-Xk9wQ-40Su9_14I9rWgOEbM2uW-ebfNQIHVgq4cYc&lib=MDa2LEuS5fAlvUrBGznTW_9Txsk909hX6";

export default function ImageGallery() {
  const [driveFiles, setDriveFiles] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(DATA_API);
        const data = await res.json();

        // ✅ Get ALL rows for same username (not only first)
        const userRows = data.filter((r) => r.UserName === username);

        if (userRows.length === 0) {
          setDriveFiles([]);
          setLoading(false);
          return;
        }

        // ✅ Collect ALL image keys for ALL rows
        const collected = userRows
          .flatMap((row) =>
            Object.keys(row)
              .filter((key) => key.toLowerCase().startsWith("image1"))
              .map((key) => row[key])
          )
          .filter((val) => val && val !== "");

        setDriveFiles(collected);
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username]);

  if (loading) return <Typography>Loading...</Typography>;
  if (driveFiles.length === 0) return <Typography>No images found.</Typography>;

  const nextImage = () =>
    setCurrent((prev) => (prev + 1) % driveFiles.length);

  const prevImage = () =>
    setCurrent((prev) => (prev - 1 + driveFiles.length) % driveFiles.length);

  return (
    <Box sx={{ 
              width: "100%", 
              
              padding:'50px 0px', 
              display:'flex', 
              flexDirection:'column', 
              alignItems:'center', 
              justifyContent:'center',
              backgroundColor:'#1e1e1f'
              }}>
      <Typography variant="h2" fontWeight={200} textAlign="center" mb={2} 
      sx={{
        fontWeight: 700,
        background: "linear-gradient(90deg, #FFD700, #FFB300, #FFC700, #FFEA00)",
        WebkitBackgroundClip: "text",
        color: "transparent"
      }}>
        GALLERY
      </Typography>

      {/* MAIN IMAGE */}
      <Box
  sx={{
    position: "relative",
    width: "100%",
    height:'100vh',
    overflow: "hidden",
    borderRadius: "12px",
    padding:'50px 0px'
  }}
>
  <iframe
    src={`https://drive.google.com/file/d/${driveFiles[current]}/preview`}
    width="100%"
    height="100%"
    style={{
      border: "none",
      backgroundColor: "transparent",
      position: "absolute",
      top: 0,
      left: 0,
      pointerEvents: "auto",    // allow clicking inside iframe
    }}
  ></iframe>

  {/* Transparent Buttons */}
  <IconButton
    onClick={prevImage}
    sx={{
      position: "absolute",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      backgroundColor: "rgba(0,0,0,0)",  // fully transparent
      color: "white",
      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }, // light hover
    }}
  >
    <ArrowBackIos />
  </IconButton>

  <IconButton
    onClick={nextImage}
    sx={{
      position: "absolute",
      top: "50%",
      right: "10px",
      transform: "translateY(-50%)",
      backgroundColor: "rgba(0,0,0,0)", // fully transparent
      color: "white",
      "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
    }}
  >
    <ArrowForwardIos />
  </IconButton>
</Box>

      {/* THUMBNAILS */}
      <Grid container spacing={1} justifyContent="center">
        {driveFiles.map((id, index) => (
          <Grid item key={id}>
            <Paper
              elevation={current === index ? 8 : 1}
              sx={{
                width: 100,
                height: 60,
                
                overflow: "hidden",
                border: current === index ? "2px solid #1976d2" : "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => setCurrent(index)}
            >
              <iframe
                src={`https://drive.google.com/file/d/${id}/preview`}
                width="100%"
                height="100%"
                style={{ border: "none", pointerEvents: "none", overflow: "hidden" }}
                title={`Thumbnail ${index}`}
              ></iframe>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
