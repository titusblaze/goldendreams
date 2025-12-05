import React from "react";
import { Box, Typography, Stack, IconButton, Link } from "@mui/material";
import { motion } from "framer-motion";

// Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";

export default function Footer() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      sx={{
        width: "100%",
        padding: "50px 20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 8,
      }}
    >
      {/* Brand Logo + Title */}
      <Typography
        component={motion.h2}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        sx={{
          fontSize: { xs: "28px", md: "40px" },
          fontWeight: "700",
          letterSpacing: "1px",
          mb: 2,
          textAlign: "center",
        }}
      >
        Golden Dreams
      </Typography>

      {/* Navigation Links */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ textAlign: "center", mb: 3 }}
      >
        {["Home", "Pricing", "Features", "Contact", "Live", "Login"].map(
          (item, index) => (
            <Link
              key={index}
              href="#"
              component={motion.a}
              whileHover={{ scale: 1.1, color: "#FFD700" }}
              underline="none"
              sx={{
                color: "#d8d8d8",
                fontSize: "18px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {item}
            </Link>
          )
        )}
      </Stack>

      {/* Social Icons */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {[ 
          { icon: <FacebookIcon />, link: "#" },
          { icon: <InstagramIcon />, link: "#" },
          { icon: <WhatsAppIcon />, link: "#" },
          { icon: <TwitterIcon />, link: "#" },
          { icon: <YouTubeIcon />, link: "#" },
        ].map((item, index) => (
          <IconButton
            key={index}
            component={motion.a}
            href={item.link}
            target="_blank"
            whileHover={{ scale: 1.2, rotate: 5 }}
            sx={{
              color: "white",
              background: "rgba(255,255,255,0.1)",
              "&:hover": {
                background: "rgba(255,255,255,0.25)",
              },
            }}
          >
            {item.icon}
          </IconButton>
        ))}
      </Stack>

      {/* Footer Bottom */}
      <Typography sx={{ color: "#888", fontSize: "14px", textAlign: "center" }}>
        © {new Date().getFullYear()} Golden Dreams. All Rights Reserved.
      </Typography>
    </Box>
  );
}
