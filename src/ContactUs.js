import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";

import { useQuery } from "@tanstack/react-query";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";

import Logo from "../src/assets/image/logo512.png";
import "./App.css";

// --------------------------------------------------
// GOOGLE APPS SCRIPT API
// --------------------------------------------------

const API_URL =
  "https://script.google.com/macros/s/AKfycbxUgaJGstTiqyKIfDQzgv5zgR0OVROWCQUMdwv2pMMp-rMq1VP_4vkJDtltQtSr1poR/exec";

// Configure these with your actual EmailJS credentials.
const SERVICE_ID = "your_service_id";
const TEMPLATE_ID = "your_template_id";
const PUBLIC_KEY = "your_public_key";

const EMAILJS_CONFIGURED = [
  SERVICE_ID,
  TEMPLATE_ID,
  PUBLIC_KEY,
].every((value) => value && !value.startsWith("your_"));

const GOLD = "#E8C56E";
const GOLD_LIGHT = "#FFE6A3";
const MUTED = "#C5C0B4";

const fetchData = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch contact details.");
  }

  const result = await response.json();

  if (!Array.isArray(result)) {
    throw new Error("The API did not return a valid contact list.");
  }

  return result;
};

// --------------------------------------------------
// SHARED GLASS CARD STYLING
// --------------------------------------------------

const glassCardSx = {
  position: "relative",
  width: "100%",
  minWidth: 0,
  height: "100%",
  boxSizing: "border-box",
  p: { xs: 2.5, sm: 3.5 },
  overflow: "hidden",
  borderRadius: { xs: "20px", sm: "25px" },

  background: `
    linear-gradient(
      145deg,
      rgba(255, 221, 145, 0.075),
      rgba(255, 255, 255, 0.018) 42%,
      rgba(16, 14, 11, 0.78)
    )
  `,

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  border: "1px solid rgba(232, 197, 110, 0.24)",

  boxShadow: `
    0 12px 36px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 230, 163, 0.09)
  `,

  transition:
    "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",

  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "12%",
    width: "76%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255,230,163,0.7), transparent)",
    pointerEvents: "none",
  },

  "&:hover": {
    transform: { xs: "none", md: "translateY(-5px)" },
    borderColor: "rgba(232, 197, 110, 0.52)",
    boxShadow: `
      0 18px 42px rgba(0, 0, 0, 0.34),
      0 0 22px rgba(232, 197, 110, 0.07),
      inset 0 1px 0 rgba(255, 230, 163, 0.13)
    `,
  },
};

// --------------------------------------------------
// TEXT FIELD STYLING
// --------------------------------------------------

const textFieldSx = {
  "& .MuiInputLabel-root": {
    color: "#BDB5A4",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: GOLD_LIGHT,
  },

  "& .MuiOutlinedInput-root": {
    color: "#FFF9EC",
    borderRadius: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.17)",

    "& fieldset": {
      borderColor: "rgba(232, 197, 110, 0.23)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(232, 197, 110, 0.58)",
    },

    "&.Mui-focused fieldset": {
      borderColor: GOLD,
      borderWidth: "1px",
      boxShadow: "0 0 12px rgba(232, 197, 110, 0.08)",
    },
  },

  "& .MuiFormHelperText-root": {
    color: "#E9B7A5",
    mx: 0.5,
  },
};

// --------------------------------------------------
// CONTACT US
// --------------------------------------------------

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  // Scroll to top whenever this page mounts, including refresh.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch contact information only once.
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goldendreams"],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5,
  });

  const persons = data.filter((item) => String(item.Id) === "9");
  const branches = data.filter((item) => String(item.Id) === "10");
  const contactInfo = data.find((item) => String(item.Id) === "12");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // SEND CONTACT FORM
  // --------------------------------------------------

  const sendEmail = async (event) => {
    event.preventDefault();

    if (sending) return;

    if (!formData.name.trim() || !formData.mobile.trim() ||
        !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill in all the fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!contactInfo?.Email) {
      alert("The contact email address is unavailable. Please try WhatsApp.");
      return;
    }

    setSending(true);

    try {
      if (EMAILJS_CONFIGURED) {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            name: formData.name.trim(),
            mobile: formData.mobile.trim(),
            email: formData.email.trim(),
            message: formData.message.trim(),
          },
          PUBLIC_KEY
        );

        alert("Your message has been sent successfully!");

        setFormData({
          name: "",
          mobile: "",
          email: "",
          message: "",
        });
      } else {
        // Fallback until actual EmailJS credentials are configured.
        const subject = encodeURIComponent(
          `Contact message from ${formData.name.trim()}`
        );

        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Mobile: ${formData.mobile}\n` +
          `Email: ${formData.email}\n\n` +
          `Message:\n${formData.message}`
        );

        window.location.href =
          `mailto:${contactInfo.Email}?subject=${subject}&body=${body}`;
      }
    } catch (err) {
      console.error("Contact form error:", err);
      alert("Unable to send your message. Please try WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  // --------------------------------------------------
  // WHATSAPP
  // --------------------------------------------------

  const sendWhatsApp = () => {
    if (!formData.name.trim() || !formData.mobile.trim() ||
        !formData.message.trim()) {
      alert("Please enter your name, phone number and message.");
      return;
    }

    const rawPhone = String(contactInfo?.Phone || "").replace(/\D/g, "");

    if (!rawPhone) {
      alert("The WhatsApp contact number is unavailable.");
      return;
    }

    const phone = rawPhone.startsWith("91")
      ? rawPhone
      : `91${rawPhone}`;

    const message =
      `Hello Golden Dream,\n\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.mobile}\n` +
      `Email: ${formData.email || "Not provided"}\n` +
      `Message: ${formData.message}`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // --------------------------------------------------
  // SHARE CONTACT DETAILS
  // --------------------------------------------------

  const handleShare = async (item) => {
    const message =
      `Golden Dream\n\n` +
      `${item.LabelText || ""}\n` +
      `${item.LabelText1 || ""}\n` +
      `Phone: ${item.Phone || ""}\n` +
      `Email: ${item.Email || ""}\n` +
      `Address: ${item.LabelText2 || ""}\n` +
      `Location: ${item.Location || ""}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.LabelText || "Golden Dream Contact",
          text: message,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        alert("Contact details copied.");
      } else {
        alert("Sharing is not supported on this device.");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
      }
    }
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100svh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(ellipse at center, #211B10 0%, #0A0A0B 65%, #050505 100%)",
        }}
      >
        <motion.img
          src={Logo}
          alt="Golden Dream"
          style={{
            width: 150,
            height: 150,
            objectFit: "contain",
            borderRadius: 20,
          }}
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.7, 1, 0.7],
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

  // --------------------------------------------------
  // ERROR SCREEN
  // --------------------------------------------------

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          p: 3,
          color: "#FFF5DD",
          background: "#080808",
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "#F0B9A9" }}>
          Failed to load contact details.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            color: GOLD,
            borderColor: GOLD,
            textTransform: "none",
          }}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        color: "#FFF8E8",

        background: `
          radial-gradient(
            ellipse at 12% 12%,
            rgba(128, 91, 31, 0.13),
            transparent 36%
          ),
          radial-gradient(
            ellipse at 90% 45%,
            rgba(151, 111, 39, 0.08),
            transparent 35%
          ),
          linear-gradient(145deg, #090909, #10100F 48%, #070707)
        `,

        pt: { xs: 5, sm: 7, md: 9 },
        pb: { xs: 6, md: 10 },
        px: { xs: "5%", sm: 3, md: 5 },
      }}
    >
      {/* Decorative background glow */}
      <Box
        sx={{
          position: "absolute",
          top: 100,
          left: "-100px",
          width: 230,
          height: 230,
          borderRadius: "50%",
          background: "rgba(218, 165, 60, 0.055)",
          filter: "blur(75px)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 500,
          right: "-100px",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(218, 165, 60, 0.045)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* PAGE HEADING */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
            <Typography
              sx={{
                color: GOLD,
                fontSize: { xs: 11, sm: 12 },
                letterSpacing: { xs: 3, sm: 5 },
                textTransform: "uppercase",
                mb: 1.2,
              }}
            >
              WE WOULD LOVE TO HEAR FROM YOU
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 32, sm: 42, md: 52 },
                fontWeight: 800,
                letterSpacing: "-1.2px",
                lineHeight: 1.15,
                background:
                  "linear-gradient(110deg, #FFF0C1 5%, #D9AE51 48%, #FFF1C9 85%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Contact Us
            </Typography>

            <Box
              sx={{
                width: 70,
                height: 2,
                borderRadius: 5,
                mx: "auto",
                mt: 2,
                background:
                  "linear-gradient(90deg, transparent, #E8C56E, transparent)",
              }}
            />

            <Typography
              sx={{
                mt: 2,
                mx: "auto",
                maxWidth: 560,
                fontSize: { xs: 13, sm: 15 },
                lineHeight: 1.8,
                color: MUTED,
              }}
            >
              Have a question or need assistance? Connect with our team using
              the contact details below or send us a message.
            </Typography>
          </Box>
        </motion.div>

        {/* CONTACT PERSON CARDS */}
        {persons.length > 0 && (
          <Box component="section" sx={{ mb: { xs: 6, md: 9 } }}>
            <Typography
              component="h2"
              sx={{
                textAlign: "center",
                fontSize: { xs: 21, sm: 26 },
                fontWeight: 700,
                color: GOLD_LIGHT,
                mb: 3,
              }}
            >
              Get in Touch
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(auto-fit, minmax(260px, 1fr))",
                },
                gap: { xs: 2.5, sm: 3 },
                alignItems: "stretch",
              }}
            >
              {persons.map((item, index) => (
                <motion.div
                  key={`${item.Id}-${item.Phone || index}`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  style={{ minWidth: 0, height: "100%" }}
                >
                  <Box
                    sx={{
                      ...glassCardSx,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        p: "4px",
                        mb: 2,
                        borderRadius: "50%",
                        border: "1px solid rgba(232,197,110,0.75)",
                        boxShadow:
                          "0 0 25px rgba(232,197,110,0.12)",
                      }}
                    >
                      <Avatar
                        src={item.link || undefined}
                        alt={item.LabelText || "Contact"}
                        sx={{
                          width: { xs: 100, sm: 115 },
                          height: { xs: 100, sm: 115 },
                          bgcolor: "#211B10",
                          border: "2px solid rgba(255,230,163,0.13)",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: GOLD_LIGHT,
                        fontSize: { xs: 20, sm: 22 },
                        fontWeight: 750,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.LabelText}
                    </Typography>

                    <Typography
                      sx={{
                        color: MUTED,
                        fontSize: 13,
                        mt: 0.5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.LabelText1}
                    </Typography>

                    {item.LabelText2 && (
                      <Typography
                        sx={{
                          color: "#9D9789",
                          fontSize: 12,
                          mt: 0.5,
                          mb: 1.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.LabelText2}
                      </Typography>
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 1,
                        mt: 1,
                        maxWidth: "100%",
                      }}
                    >
                      <PhoneIcon
                        sx={{ color: GOLD, fontSize: 18, mt: 0.25 }}
                      />

                      <Typography
                        component="a"
                        href={`tel:+91${item.Phone}`}
                        sx={{
                          color: "#F0E8D7",
                          fontSize: 13,
                          textDecoration: "none",
                          overflowWrap: "anywhere",
                          "&:hover": { color: GOLD },
                        }}
                      >
                        +91 {item.Phone}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: 1,
                        mt: 1,
                        maxWidth: "100%",
                      }}
                    >
                      <MailIcon
                        sx={{ color: GOLD, fontSize: 18, mt: 0.25 }}
                      />

                      <Typography
                        component="a"
                        href={`mailto:${item.Email}`}
                        sx={{
                          color: "#F0E8D7",
                          fontSize: 12,
                          textDecoration: "none",
                          overflowWrap: "anywhere",
                          "&:hover": { color: GOLD },
                        }}
                      >
                        {item.Email}
                      </Typography>
                    </Box>

                    <Button
                      component="a"
                      href={`tel:+91${item.Phone}`}
                      startIcon={<PhoneIcon />}
                      sx={{
                        mt: 2.5,
                        minWidth: 145,
                        py: 1,
                        px: 3,
                        borderRadius: "12px",
                        color: "#17120A",
                        fontWeight: 750,
                        textTransform: "none",
                        background:
                          "linear-gradient(110deg, #F9E3A0, #D8AE51)",
                        boxShadow:
                          "0 4px 16px rgba(218,165,60,0.12)",
                        "&:hover": {
                          background:
                            "linear-gradient(110deg, #FFF0BF, #E5BF65)",
                          boxShadow:
                            "0 6px 22px rgba(218,165,60,0.25)",
                        },
                      }}
                    >
                      Call Now
                    </Button>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        {/* BRANCH CONTACT CARDS */}
        {branches.length > 0 && (
          <Box component="section" sx={{ mb: { xs: 6, md: 9 } }}>
            <Typography
              component="h2"
              sx={{
                textAlign: "center",
                fontSize: { xs: 21, sm: 27 },
                fontWeight: 700,
                color: GOLD_LIGHT,
                mb: 1,
              }}
            >
              Branch Contact Details
            </Typography>

            <Typography
              sx={{
                textAlign: "center",
                color: MUTED,
                fontSize: 13,
                mb: 3.5,
              }}
            >
              Find our branch information and directions.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(auto-fit, minmax(280px, 1fr))",
                },
                gap: { xs: 2.5, sm: 3 },
                alignItems: "stretch",
              }}
            >
              {branches.map((item, index) => (
                <motion.div
                  key={`${item.Id}-${item.Phone || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  style={{ minWidth: 0, height: "100%" }}
                >
                  <Box sx={glassCardSx}>
                    <IconButton
                      aria-label="Share branch details"
                      onClick={() => handleShare(item)}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        color: GOLD,
                        border: "1px solid rgba(232,197,110,0.25)",
                        background: "rgba(232,197,110,0.05)",
                        "&:hover": {
                          color: GOLD_LIGHT,
                          background: "rgba(232,197,110,0.14)",
                        },
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>

                    <Typography
                      sx={{
                        color: GOLD_LIGHT,
                        fontSize: { xs: 19, sm: 21 },
                        fontWeight: 750,
                        pr: 4,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.LabelText}
                    </Typography>

                    <Typography
                      sx={{
                        color: MUTED,
                        fontSize: 13,
                        mt: 1,
                        mb: 2,
                        lineHeight: 1.8,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.LabelText1}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Button
                        component="a"
                        href={`tel:+91${item.Phone}`}
                        startIcon={<PhoneIcon />}
                        sx={branchLinkSx}
                      >
                        +91 {item.Phone}
                      </Button>

                      <Button
                        component="a"
                        href={`mailto:${item.Email}`}
                        startIcon={<MailIcon />}
                        sx={{
                          ...branchLinkSx,
                          maxWidth: "100%",
                          "& .MuiButton-startIcon": {
                            flexShrink: 0,
                          },
                          "& .MuiButton-endIcon": {
                            flexShrink: 0,
                          },
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            overflowWrap: "anywhere",
                            whiteSpace: "normal",
                            textAlign: "left",
                          }}
                        >
                          {item.Email}
                        </Box>
                      </Button>

                      {item.LabelText2 && (
                        <Button
                          component="a"
                          href={item.Location || undefined}
                          target={item.Location ? "_blank" : undefined}
                          rel={item.Location ? "noopener noreferrer" : undefined}
                          startIcon={<LocationOnIcon />}
                          sx={{
                            ...branchLinkSx,
                            alignItems: "flex-start",
                            "& .MuiButton-startIcon": {
                              mt: "3px",
                              flexShrink: 0,
                            },
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              whiteSpace: "normal",
                              textAlign: "left",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {item.LabelText2}
                          </Box>
                        </Button>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        )}

        {/* CONTACT FORM */}
        <Box component="section" sx={{ width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55 }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "min(100%, 580px)" },
                mx: "auto",
                boxSizing: "border-box",
                p: { xs: 2.5, sm: 4, md: 4.5 },
                borderRadius: { xs: "22px", sm: "28px" },

                background: `
                  linear-gradient(
                    145deg,
                    rgba(255, 224, 157, 0.075),
                    rgba(19, 17, 13, 0.88) 48%,
                    rgba(9, 9, 9, 0.96)
                  )
                `,

                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",

                border: "1px solid rgba(232,197,110,0.35)",

                boxShadow: `
                  0 20px 60px rgba(0,0,0,0.35),
                  0 0 30px rgba(232,197,110,0.055),
                  inset 0 1px 0 rgba(255,230,163,0.12)
                `,
              }}
            >
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  component="h2"
                  sx={{
                    color: GOLD_LIGHT,
                    fontSize: { xs: 25, sm: 31 },
                    fontWeight: 800,
                  }}
                >
                  Send Us a Message
                </Typography>

                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: 13,
                    mt: 1,
                    lineHeight: 1.7,
                  }}
                >
                  Fill in the details below and our team will get in touch.
                </Typography>
              </Box>

              <form onSubmit={sendEmail}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    name="name"
                    label="Your Name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    sx={textFieldSx}
                  />

                  <TextField
                    fullWidth
                    required
                    name="mobile"
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    inputProps={{ maxLength: 20 }}
                    sx={textFieldSx}
                  />

                  <TextField
                    fullWidth
                    required
                    name="email"
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={textFieldSx}
                  />

                  <TextField
                    fullWidth
                    required
                    name="message"
                    label="Your Message"
                    multiline
                    minRows={4}
                    maxRows={8}
                    value={formData.message}
                    onChange={handleChange}
                    sx={textFieldSx}
                  />
                </Box>

                {/* RESPONSIVE ACTION BUTTONS */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                    mt: 3,
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={sending}
                    startIcon={
                      sending ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <MailIcon />
                      )
                    }
                    sx={{
                      minHeight: 48,
                      borderRadius: "13px",
                      color: "#17120A",
                      fontWeight: 750,
                      textTransform: "none",
                      background:
                        "linear-gradient(110deg, #F9E3A0, #D8AE51)",
                      boxShadow: "0 5px 18px rgba(218,165,60,0.12)",
                      "&:hover": {
                        background:
                          "linear-gradient(110deg, #FFF0BF, #E5BF65)",
                        boxShadow:
                          "0 6px 24px rgba(218,165,60,0.22)",
                      },
                      "&.Mui-disabled": {
                        color: "#6C5B35",
                        background: "rgba(218,165,60,0.2)",
                      },
                    }}
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </Button>

                  <Button
                    type="button"
                    onClick={sendWhatsApp}
                    variant="outlined"
                    startIcon={<WhatsAppIcon />}
                    sx={{
                      minHeight: 48,
                      borderRadius: "13px",
                      color: "#D7F5DC",
                      borderColor: "rgba(91, 202, 121, 0.45)",
                      background: "rgba(35, 139, 69, 0.10)",
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": {
                        background: "rgba(35, 139, 69, 0.20)",
                        borderColor: "#6AD58B",
                      },
                    }}
                  >
                    WhatsApp
                  </Button>
                </Box>
              </form>

              <Typography
                sx={{
                  color: "#938B7C",
                  textAlign: "center",
                  fontSize: 11,
                  mt: 2.5,
                  lineHeight: 1.7,
                }}
              >
                Your details are used to respond to your enquiry.
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}

// Branch link styles, shared by all branch cards.
const branchLinkSx = {
  color: GOLD_LIGHT,
  textTransform: "none",
  fontSize: 13,
  justifyContent: "flex-start",
  px: 0,
  minWidth: 0,
  maxWidth: "100%",
  lineHeight: 1.6,
  overflowWrap: "anywhere",
  "& .MuiButton-startIcon": {
    color: GOLD,
    mr: 1,
  },
  "&:hover": {
    color: "#FFF2C9",
    background: "rgba(232,197,110,0.055)",
  },
};

export default ContactUs;