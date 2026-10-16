
import React, { useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Typography,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShareIcon from "@mui/icons-material/Share";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { getAllApiData } from "./api";
import Logo from "../src/assets/image/logo512.png";
import BookNow from "./BookNow";
import "./App.css";

// --------------------------------------------------
// MIDNIGHT GOLD THEME
// --------------------------------------------------

const GOLD = "#E8C56E";
const GOLD_LIGHT = "#FFE6A3";
const MUTED = "#C5C0B4";

// --------------------------------------------------
// FETCH CONTACT DATA THROUGH COMMON API.JS
// --------------------------------------------------

const fetchData = async () => {
  const result = await getAllApiData();

  if (!Array.isArray(result)) {
    throw new Error(
      "The API did not return a valid contact list."
    );
  }

  return result;
};

// --------------------------------------------------
// PHONE NUMBER HELPER
// --------------------------------------------------

const getPhoneNumber = (value) => {
  let phone = String(value || "").replace(/\D/g, "");

  if (phone.length === 10) {
    phone = `91${phone}`;
  } else if (phone.length === 11 && phone.startsWith("0")) {
    phone = `91${phone.slice(1)}`;
  }

  return phone;
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
// BRANCH LINK STYLING
// --------------------------------------------------

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
    flexShrink: 0,
  },

  "&:hover": {
    color: "#FFF2C9",
    background: "rgba(232,197,110,0.055)",
  },
};

// --------------------------------------------------
// CONTACT US
// --------------------------------------------------

export default function ContactUs() {
  // Scroll to the top whenever the page mounts.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  // Load data through the shared API file.
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["goldendreams-contact"],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5,
  });

  // Contact person records.
  const persons = data.filter(
    (item) => String(item.Id) === "6"
  );

  // Branch records.
  const branches = data.filter(
    (item) => String(item.Id) === "7"
  );

  // --------------------------------------------------
  // SHARE CONTACT DETAILS
  // --------------------------------------------------

  const handleShare = async (item) => {
    const message = [
      "Golden Dreams",
      "",
      item.LabelText || "",
      item.LabelText1 || "",
      `Phone: ${item.Phone || ""}`,
      `Email: ${item.Email || ""}`,
      `Address: ${item.LabelText2 || ""}`,
      `Location: ${item.Location || ""}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.LabelText || "Golden Dreams Contact",
          text: message,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message);
        window.alert("Contact details copied.");
      } else {
        window.alert(
          "Sharing is not supported on this device."
        );
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
          alt="Golden Dreams"
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

        <Typography
          sx={{
            color: MUTED,
            fontSize: 12,
            maxWidth: 450,
            overflowWrap: "anywhere",
          }}
        >
          {error.message}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{
            color: GOLD,
            borderColor: GOLD,
            textTransform: "none",
            "&:hover": {
              borderColor: GOLD_LIGHT,
              background: "rgba(232,197,110,0.08)",
            },
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
        mt: { xs: "50px", md: "40px" },
        minHeight: "100vh",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        color: "#FFF8E8",
        background: "transparent",
        pt: { xs: 5, sm: 7, md: 9 },
        pb: { xs: 6, md: 10 },
        px: { xs: "5%", sm: 3, md: 5 },
      }}
    >
      {/* DECORATIVE BACKGROUND GLOW */}

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
          <Box
            sx={{
              textAlign: "center",
              mb: { xs: 5, md: 7 },
            }}
          >
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
              Have a question or planning a special occasion?
              Contact our team or send a booking enquiry.
              We would love to help you preserve your precious
              memories.
            </Typography>
          </Box>
        </motion.div>

        {/* CONTACT PERSON CARDS */}

        {persons.length > 0 && (
          <Box
            component="section"
            sx={{ mb: { xs: 6, md: 9 } }}
          >
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
                  sm: "repeat(auto-fit, minmax(280px, 320px))",
                  md: "repeat(auto-fit, minmax(280px, 340px))",
                },
                gap: { xs: 2, sm: 3 },
                justifyContent: "center",
                alignItems: "stretch",
              }}
            >
              {persons.map((item, index) => {
                const phone = getPhoneNumber(item.Phone);

                return (
                  <motion.div
                    key={`${item.Id}-${item.Phone || index}`}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.1,
                    }}
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
                          border:
                            "1px solid rgba(232,197,110,0.75)",
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
                            border:
                              "2px solid rgba(255,230,163,0.13)",
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

                      {phone && (
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
                            sx={{
                              color: GOLD,
                              fontSize: 18,
                              mt: 0.25,
                            }}
                          />

                          <Typography
                            component="a"
                            href={`tel:+${phone}`}
                            sx={{
                              color: "#F0E8D7",
                              fontSize: 13,
                              textDecoration: "none",
                              overflowWrap: "anywhere",
                              "&:hover": { color: GOLD },
                            }}
                          >
                            +{phone}
                          </Typography>
                        </Box>
                      )}

                      {item.Email && (
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
                            sx={{
                              color: GOLD,
                              fontSize: 18,
                              mt: 0.25,
                            }}
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
                      )}

                      {phone && (
                        <Button
                          component="a"
                          href={`tel:+${phone}`}
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
                      )}
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </Box>
        )}

        {/* BRANCH CONTACT CARDS */}

        {branches.length > 0 && (
          <Box
            component="section"
            sx={{ mb: { xs: 6, md: 9 } }}
          >
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
              {branches.map((item, index) => {
                const phone = getPhoneNumber(item.Phone);

                return (
                  <motion.div
                    key={`${item.Id}-${item.Phone || index}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.1,
                    }}
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
                          border:
                            "1px solid rgba(232,197,110,0.25)",
                          background:
                            "rgba(232,197,110,0.05)",
                          "&:hover": {
                            color: GOLD_LIGHT,
                            background:
                              "rgba(232,197,110,0.14)",
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
                          color: GOLD_LIGHT,
                          fontSize: 18,
                          fontWeight: 700,
                          mt: 1,
                          mb: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
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
                        {phone && (
                          <Button
                            component="a"
                            href={`tel:+${phone}`}
                            startIcon={<PhoneIcon />}
                            sx={branchLinkSx}
                          >
                            +{phone}
                          </Button>
                        )}

                        {item.Email && (
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
                        )}

                        {item.LabelText2 && (
                          <Button
                            component={item.Location ? "a" : "button"}
                            href={item.Location || undefined}
                            target={
                              item.Location ? "_blank" : undefined
                            }
                            rel={
                              item.Location
                                ? "noopener noreferrer"
                                : undefined
                            }
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
                );
              })}
            </Box>
          </Box>
        )}

        {/* BOOKING & ENQUIRY SECTION
            Reuses the existing BookNow.js component.
            Booking submission and Sheet2 logic are unchanged.
        */}

        <Box
          component="section"
          id="booking-enquiry"
          sx={{ width: "100%" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55 }}
          >
            <Box
              sx={{
                width: { xs: "100%", sm: "min(100%, 700px)" },
                mx: "auto",
                boxSizing: "border-box",
                p: { xs: 3, sm: 4.5, md: 5 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
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
              <Typography
                sx={{
                  color: GOLD,
                  fontSize: 11,
                  letterSpacing: { xs: 3, sm: 4 },
                  fontWeight: 700,
                  textTransform: "uppercase",
                  mb: 1.5,
                }}
              >
                LET'S CREATE SOMETHING BEAUTIFUL
              </Typography>

              <Typography
                component="h2"
                sx={{
                  color: GOLD_LIGHT,
                  fontSize: { xs: 25, sm: 31, md: 35 },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Book Your Special Moments
              </Typography>

              <Box
                sx={{
                  width: 65,
                  height: 2,
                  borderRadius: 5,
                  my: 2,
                  background:
                    "linear-gradient(90deg, transparent, #E8C56E, transparent)",
                }}
              />

              <Typography
                sx={{
                  color: MUTED,
                  maxWidth: 480,
                  fontSize: { xs: 13, sm: 14 },
                  lineHeight: 1.9,
                  mb: 3,
                }}
              >
                Tell us about your photography, videography, album
                design, or special event requirements. Submit your
                enquiry through our booking form and continue to
                WhatsApp to send your message to Golden Dreams.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <BookNow
                  buttonText="Book Now / Send Enquiry"
                />
              </Box>

              <Typography
                sx={{
                  color: "#938B7C",
                  textAlign: "center",
                  fontSize: 11,
                  mt: 2.5,
                  lineHeight: 1.7,
                }}
              >
                Your booking is saved before WhatsApp opens.
                You must press Send in WhatsApp to deliver the message.
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
