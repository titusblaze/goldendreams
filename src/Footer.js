
import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Link,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";

import { getAllApiData } from "./api";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";

const fetchFooterData = async () => {
  const result = await getAllApiData();

  if (!Array.isArray(result)) {
    throw new Error("Invalid API response.");
  }

  return result;
};

const normalizeUrl = (value) => {
  if (value === null || value === undefined) return "";

  const url = String(value).trim();

  if (!url || url === "#" || url.toLowerCase() === "null") {
    return "";
  }

  // Accept only valid HTTP or HTTPS URLs.
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return "";
};

const normalizePhone = (value) => {
  if (value === null || value === undefined) return "";

  const phone = String(value).replace(/\D/g, "");

  if (!phone) return "";

  // Assume an Indian number if the country code is omitted.
  if (phone.length === 10) return `91${phone}`;

  return phone;
};

export default function Footer() {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["goldendreams-footer"],
    queryFn: fetchFooterData,
    staleTime: 1000 * 60 * 10,
  });

  const socialLinks = useMemo(() => {
    const record = data.find(
      (item) => String(item?.Id ?? "").trim() === "9"
    );

    if (!record) return [];

    const facebook = normalizeUrl(record.link);
    const instagram = normalizeUrl(record.link1);
    const whatsappPhone = normalizePhone(record.link2);
    const twitter = normalizeUrl(record.mlink);
    const youtube = normalizeUrl(record.LabelText);

    const links = [
      {
        name: "Facebook",
        url: facebook,
        icon: <FacebookIcon />,
      },
      {
        name: "Instagram",
        url: instagram,
        icon: <InstagramIcon />,
      },
      {
        name: "WhatsApp",
        url: whatsappPhone
          ? `https://wa.me/${whatsappPhone}`
          : "",
        icon: <WhatsAppIcon />,
      },
      {
        name: "X",
        url: twitter,
        icon: <TwitterIcon />,
      },
      {
        name: "YouTube",
        url: youtube,
        icon: <YouTubeIcon />,
      },
    ];

    return links.filter((item) => item.url);
  }, [data]);

  const navigationLinks = [
    { label: "Home", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Features", path: "/features" },
    { label: "Contact", path: "/contact" },
    { label: "Live", path: "/live" },
    { label: "Login", path: "/login" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        width: "100%",
        transformOrigin: "bottom center",
      }}
    >
      <Box
        component="footer"
        sx={{
          position: "relative",
          isolation: "isolate",
          width: "100%",
          boxSizing: "border-box",
          mt: { xs: 5, md: 7 },
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 4, md: 5 },
          pb: { xs: 2.5, md: 3 },
          overflow: "hidden",
          color: "#fff",
          background: "rgba(8, 8, 8, 0.18)",
          borderTop: "1px solid rgba(216, 177, 90, 0.28)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: -1,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at top, rgba(216,177,90,0.08), transparent 65%)",
          },
        }}
      >
        {/* Brand */}
        <Typography
          component={motion.h2}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          sx={{
            m: 0,
            mb: 1,
            textAlign: "center",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
            fontWeight: 800,
            letterSpacing: { xs: 1, md: 2 },
            lineHeight: 1.3,
            background: `linear-gradient(110deg, ${GOLD}, ${LIGHT_GOLD}, ${GOLD})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 15px rgba(216,177,90,0.12))",
          }}
        >
          Golden Dreams
        </Typography>

        <Typography
          sx={{
            mb: 3,
            color: "rgba(255,255,255,0.58)",
            fontSize: { xs: "0.72rem", sm: "0.8rem" },
            letterSpacing: { xs: 1.2, sm: 2.2 },
            textAlign: "center",
          }}
        >
          YOUR MEMORIES · YOUR MOMENTS · YOUR STORY
        </Typography>

        {/* Navigation */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          spacing={{ xs: 1.5, sm: 3, md: 4 }}
          sx={{
            maxWidth: 850,
            mx: "auto",
            mb: 3,
            rowGap: 1.5,
          }}
        >
          {navigationLinks.map((item) => (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              underline="none"
              sx={{
                position: "relative",
                px: 0.4,
                py: 0.5,
                color: "rgba(255,255,255,0.76)",
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                fontWeight: 500,
                transition: "color 0.25s ease",
                "&:hover": {
                  color: LIGHT_GOLD,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: 0,
                  height: "1px",
                  background: GOLD,
                  transition: "width 0.25s ease",
                },
                "&:hover::after": {
                  width: "100%",
                },
              }}
            >
              {item.label}
            </Link>
          ))}
        </Stack>

        {/* Social media links */}
        {(isLoading || socialLinks.length > 0) && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
            spacing={1.5}
            sx={{ mb: 3, rowGap: 1.5 }}
          >
            {isLoading ? (
              <CircularProgress
                size={20}
                sx={{ color: GOLD }}
                aria-label="Loading social media links"
              />
            ) : (
              socialLinks.map((item) => (
                <Tooltip title={item.name} key={item.name}>
                  <IconButton
                    component={motion.a}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Golden Dreams on ${item.name}`}
                    whileHover={{ scale: 1.12, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    sx={{
                      width: 42,
                      height: 42,
                      color: LIGHT_GOLD,
                      background: "rgba(216,177,90,0.055)",
                      border: "1px solid rgba(216,177,90,0.28)",
                      backdropFilter: "blur(8px)",
                      transition:
                        "background 0.25s ease, border-color 0.25s ease",
                      "&:hover": {
                        color: "#080808",
                        background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
                        borderColor: LIGHT_GOLD,
                      },
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))
            )}
          </Stack>
        )}

        {isError && (
          <Typography
            sx={{
              mb: 2,
              textAlign: "center",
              color: "rgba(255,255,255,0.45)",
              fontSize: "0.75rem",
            }}
          >
            Social links are temporarily unavailable.
          </Typography>
        )}

        {/* Tagline */}
        <Typography
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.58)",
            fontSize: { xs: "0.8rem", sm: "0.88rem" },
            fontStyle: "italic",
            mb: 2.5,
          }}
        >
          Every moment tells a story.
        </Typography>

        {/* Subtle gold divider */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 900,
            height: "1px",
            mx: "auto",
            mb: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(216,177,90,0.4), transparent)",
          }}
        />

        {/* Copyright */}
        <Typography
          sx={{
            color: "rgba(255,255,255,0.48)",
            fontSize: { xs: "0.7rem", sm: "0.8rem" },
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          © {new Date().getFullYear()} Golden Dreams. All Rights Reserved.
        </Typography>
      </Box>
    </motion.div>
  );
}
