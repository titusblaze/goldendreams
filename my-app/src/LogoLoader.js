// LogoLoader.js
import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import Logo from "../assets/logo512.png"; // <-- your logo

export default function LogoLoader() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0d0d0d",
      }}
    >
      <motion.img
        src={Logo}
        alt="Loading..."
        style={{
          width: 120,
          height: 120,
          borderRadius: "20px",
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </Box>
  );
}
