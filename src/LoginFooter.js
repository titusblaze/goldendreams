
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";

import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import apiLogin from "./apiLogin";

const API_URL = apiLogin;

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";
const MIDNIGHT = "#080808";

const policyData = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "Your memories deserve privacy.",
    icon: <ShieldRoundedIcon />,
    sections: [
      {
        heading: "Your Privacy Matters",
        text: "Golden Dreams respects your privacy. Information provided during login is used to manage access to the website and its available content.",
      },
      {
        heading: "Personal Content & Access",
        text: "Personal photos, videos, and albums should only be accessible to authorized users.",
      },
      {
        heading: "Data Protection",
        text: "We take reasonable steps to protect information and limit unauthorized access. Certain services, such as file storage or website hosting, may process data to provide their functionality.",
      },
      {
        heading: "Questions & Requests",
        text: "For privacy-related questions or requests, please contact the website administrator.",
      },
    ],
  },

  terms: {
    title: "Terms of Use",
    subtitle: "Respect the memories. Use responsibly.",
    icon: <GavelRoundedIcon />,
    sections: [
      {
        heading: "Responsible Website Use",
        text: "By using Golden Dreams, you agree to use the website responsibly and access only content you are authorized to view.",
      },
      {
        heading: "Copyright & Permissions",
        text: "Photos, videos, and documents may be protected by privacy rights or copyright. You must obtain the appropriate permission before copying, distributing, or publishing content belonging to others.",
      },
      {
        heading: "Account Security",
        text: "Users must not attempt to bypass access controls or misuse another person's account.",
      },
      {
        heading: "Website Availability",
        text: "Website availability and features may change from time to time.",
      },
    ],
  },
};

const modalPaperSx = {
  m: { xs: 1.5, sm: 3 },
  width: { xs: "calc(100% - 24px)", sm: "100%" },
  maxWidth: 620,
  maxHeight: { xs: "88dvh", sm: "85vh" },
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  borderRadius: { xs: "20px", sm: "25px" },
  color: "#E8E5DE",
  border: "1px solid rgba(216,177,90,0.4)",
  background:
    "radial-gradient(ellipse at 50% 0%, rgba(173,127,39,0.13), transparent 55%), linear-gradient(145deg, #141414, #080808)",
  boxShadow:
    "0 25px 90px rgba(0,0,0,0.75), 0 0 30px rgba(216,177,90,0.08)",
  backgroundClip: "padding-box",
};

const modalSx = {
  zIndex: 999999,
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0,0,0,0.82)",
    backdropFilter: "blur(7px)",
  },
};

const goldHeadingSx = {
  fontFamily: "Georgia, serif",
  fontWeight: 500,
  background:
    "linear-gradient(90deg, #FFF0B5, #D8B15A, #F8E4A0)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const closeButtonSx = {
  position: "absolute",
  top: 14,
  right: 14,
  color: "rgba(232,229,222,0.75)",
  border: "1px solid rgba(216,177,90,0.25)",
  background: "rgba(8,8,8,0.65)",
  "&:hover": {
    color: LIGHT_GOLD,
    background: "rgba(216,177,90,0.12)",
    borderColor: GOLD,
  },
};

const dialogContentSx = {
  flex: "1 1 auto",
  minHeight: 0,
  px: { xs: 2.5, sm: 3.5 },
  py: 2.5,
  overflowY: "auto",
  overflowX: "hidden",
  overscrollBehavior: "contain",
  scrollbarWidth: "thin",
  scrollbarColor: `${GOLD} ${MIDNIGHT}`,
  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": {
    background: MIDNIGHT,
    borderLeft: "1px solid rgba(216,177,90,0.12)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background:
      "linear-gradient(180deg, #F5D990 0%, #D8B15A 45%, #80601F 100%)",
    border: "2px solid #080808",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background:
      "linear-gradient(180deg, #FFF0B5 0%, #E5BF67 50%, #A37A2C 100%)",
  },
};

export default function LoginFooter() {
  const [activePolicy, setActivePolicy] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);

  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [contactError, setContactError] = useState("");

  // Fetch only the common Office contact record.
  // "Office" is NOT a login credential.
  useEffect(() => {
    const controller = new AbortController();

    const fetchOfficeContact = async () => {
      try {
        setContactLoading(true);
        setContactError("");

        const response = await fetch(API_URL, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load contact details.");
        }

        const data = await response.json();

        // Supports an array, a single object, or common wrapped arrays.
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.records)
          ? data.records
          : data && typeof data === "object"
          ? [data]
          : [];

        const officeRecord = records.find(
            (item) =>
              String(item?.Phone ?? "").trim() !== "" &&
              String(item?.WhatsApp ?? "").trim() !== ""
          );

        if (!officeRecord) {
          throw new Error(
            'Office contact record was not found in the API.'
          );
        }

        setContact({
          phone: String(officeRecord.Phone ?? "").trim(),
          whatsapp: String(officeRecord.WhatsApp ?? "").trim(),
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Office contact API error:", error);
          setContactError(
            "Contact details are temporarily unavailable. Please try again later."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setContactLoading(false);
        }
      }
    };

    fetchOfficeContact();

    return () => controller.abort();
  }, []);

  const footerLinks = [
    {
      label: "Privacy Policy",
      action: () => setActivePolicy("privacy"),
    },
    {
      label: "Terms of Use",
      action: () => setActivePolicy("terms"),
    },
    {
      label: "Contact",
      action: () => setContactOpen(true),
    },
  ];

  const policy = activePolicy ? policyData[activePolicy] : null;

  // Normalize numbers for telephone and WhatsApp URLs.
  const getPhoneNumber = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    return digits.length >= 7 ? digits : "";
  };

  const phoneNumber = getPhoneNumber(contact?.phone);
  const whatsappNumber = getPhoneNumber(contact?.whatsapp);

  const handleCall = () => {
    if (!phoneNumber) return;
    window.location.href = `tel:+${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    if (!whatsappNumber) return;

    window.open(
      `https://wa.me/${whatsappNumber}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const closePolicy = () => setActivePolicy(null);

  return (
    <>
      {/* FULL-WIDTH FOOTER */}
      <Box
        component="footer"
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "none",
          boxSizing: "border-box",
          overflow: "hidden",
          mt: 0,
          color: "#E8E5DE",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(173,127,39,0.12), transparent 48%), linear-gradient(145deg, #101010 0%, #050505 55%, #10100D 100%)",
          borderTop: "1px solid rgba(216,177,90,0.35)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "15%",
            width: "70%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #D8B15A, transparent)",
          },
          "@keyframes footerSparkle": {
            "0%, 100%": {
              transform: "translateY(0) rotate(0deg)",
              opacity: 0.35,
            },
            "50%": {
              transform: "translateY(-8px) rotate(15deg)",
              opacity: 0.9,
            },
          },
        }}
      >
        {/* Animated sparkle */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            right: { xs: 18, md: "8%" },
            top: 28,
            color: "rgba(216,177,90,0.23)",
            pointerEvents: "none",
            animation: "footerSparkle 4s ease-in-out infinite",
          }}
        >
          <AutoAwesomeRoundedIcon
            sx={{ fontSize: { xs: 28, md: 42 } }}
          />
        </Box>

        <Container
          maxWidth={false}
          sx={{
            width: "100%",
            maxWidth: "1440px",
            mx: "auto",
            px: { xs: 2.5, sm: 4, md: 6, lg: 8 },
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              py: { xs: 4, sm: 5, md: 6 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.2fr 1fr",
                lg: "1.25fr 1fr 0.7fr",
              },
              gap: { xs: 3.5, md: 4, lg: 5 },
              alignItems: "center",
            }}
          >
            {/* BRAND */}
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 49,
                    height: 49,
                    flexShrink: 0,
                    borderRadius: "15px",
                    display: "grid",
                    placeItems: "center",
                    color: LIGHT_GOLD,
                    border: "1px solid rgba(216,177,90,0.65)",
                    background:
                      "linear-gradient(145deg, rgba(216,177,90,0.15), rgba(216,177,90,0.025))",
                    boxShadow: "0 0 22px rgba(216,177,90,0.08)",
                  }}
                >
                  <CameraAltRoundedIcon sx={{ fontSize: 29 }} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      ...goldHeadingSx,
                      fontSize: { xs: 25, sm: 29, md: 31 },
                      letterSpacing: "-0.8px",
                      lineHeight: 1.15,
                    }}
                  >
                    Golden Dreams
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      color: GOLD,
                      fontSize: 11,
                      letterSpacing: { xs: 2, sm: 3 },
                    }}
                  >
                    Every moment tells a story.
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  mt: 2.5,
                  maxWidth: 390,
                  color: "rgba(232,229,222,0.72)",
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                Preserving your precious memories in photos, videos
                and albums — forever.
              </Typography>
            </Box>

            {/* QUICK LINKS */}
            <Box
              sx={{
                borderLeft: {
                  xs: "none",
                  md: "1px solid rgba(216,177,90,0.2)",
                },
                pl: { xs: 0, md: 4 },
                py: { xs: 0, md: 1 },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeRoundedIcon
                  sx={{ fontSize: 15, color: GOLD }}
                />

                <Typography
                  sx={{
                    color: LIGHT_GOLD,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 3,
                  }}
                >
                  QUICK LINKS
                </Typography>
              </Stack>

              <Stack
                direction="row"
                useFlexGap
                flexWrap="wrap"
                spacing={{ xs: 2.2, sm: 2.5 }}
                sx={{ mt: 2.5 }}
              >
                {footerLinks.map((item) => (
                  <Link
                    key={item.label}
                    component="button"
                    type="button"
                    underline="none"
                    onClick={item.action}
                    sx={{
                      color: "rgba(232,229,222,0.8)",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      font: "inherit",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.25s ease, transform 0.25s ease",
                      "&:hover": {
                        color: LIGHT_GOLD,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </Box>

            {/* BRAND VALUES */}
            <Box
              sx={{
                borderLeft: {
                  xs: "none",
                  lg: "1px solid rgba(216,177,90,0.2)",
                },
                pl: { xs: 0, lg: 4 },
                py: { xs: 0, lg: 1 },
              }}
            >
              <Typography
                sx={{
                  color: LIGHT_GOLD,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                }}
              >
                MADE FOR MEMORIES
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: "rgba(232,229,222,0.65)",
                  fontSize: 13,
                  lineHeight: 1.9,
                }}
              >
                Memories fade from sight, but the moments we cherish
                live on.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: GOLD,
                  fontSize: 10,
                  letterSpacing: 2.2,
                }}
              >
                MEMORIES · MOMENTS · FOREVER
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(216,177,90,0.25)" }} />

          {/* COPYRIGHT */}
          <Box
            sx={{
              py: 2.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 24,
                height: "1px",
                background: GOLD,
                display: { xs: "none", sm: "block" },
              }}
            />

            <Typography
              sx={{
                color: "rgba(232,229,222,0.62)",
                fontSize: 11,
                letterSpacing: 0.5,
              }}
            >
              © {new Date().getFullYear()} Golden Dreams.
              All rights reserved.
            </Typography>

            <Box
              sx={{
                width: 24,
                height: "1px",
                background: GOLD,
                display: { xs: "none", sm: "block" },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* PRIVACY POLICY / TERMS MODAL */}
      <Dialog
        open={Boolean(activePolicy)}
        onClose={closePolicy}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby="policy-modal-title"
        sx={modalSx}
        PaperProps={{ sx: modalPaperSx }}
      >
        {policy && (
          <>
            <Box
              sx={{
                flexShrink: 0,
                px: { xs: 2.5, sm: 3.5 },
                pt: { xs: 3, sm: 3.5 },
                pb: 2.5,
                position: "relative",
                borderBottom: "1px solid rgba(216,177,90,0.2)",
              }}
            >
              <IconButton
                aria-label="Close policy"
                onClick={closePolicy}
                sx={closeButtonSx}
              >
                <CloseRoundedIcon />
              </IconButton>

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "15px",
                  color: LIGHT_GOLD,
                  border: "1px solid rgba(216,177,90,0.4)",
                  background: "rgba(216,177,90,0.08)",
                  mb: 2,
                  "& svg": { fontSize: 25 },
                }}
              >
                {policy.icon}
              </Box>

              <Typography
                id="policy-modal-title"
                component="h2"
                sx={{
                  ...goldHeadingSx,
                  fontSize: { xs: 28, sm: 34 },
                  lineHeight: 1.2,
                  pr: 4,
                }}
              >
                {policy.title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "rgba(232,229,222,0.65)",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {policy.subtitle}
              </Typography>
            </Box>

            <DialogContent sx={dialogContentSx}>
              <Stack spacing={2.5}>
                {policy.sections.map((section, index) => (
                  <Box
                    key={section.heading}
                    sx={{
                      animation: `policySectionIn .4s ease ${
                        index * 0.07
                      }s both`,
                      "@keyframes policySectionIn": {
                        from: {
                          opacity: 0,
                          transform: "translateY(7px)",
                        },
                        to: {
                          opacity: 1,
                          transform: "translateY(0)",
                        },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.2}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          mt: 0.8,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: GOLD,
                          boxShadow: "0 0 9px rgba(216,177,90,0.4)",
                        }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: LIGHT_GOLD,
                            fontSize: 14,
                            fontWeight: 600,
                            mb: 0.7,
                          }}
                        >
                          {section.heading}
                        </Typography>

                        <Typography
                          sx={{
                            color: "rgba(232,229,222,0.76)",
                            fontSize: 13.5,
                            lineHeight: 1.9,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {section.text}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid rgba(216,177,90,0.17)",
                  background: "rgba(216,177,90,0.045)",
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(232,229,222,0.5)",
                    fontSize: 11,
                    lineHeight: 1.8,
                    fontStyle: "italic",
                  }}
                >
                  Please adapt this wording to your actual website
                  practices, applicable requirements, and security
                  measures before publishing.
                </Typography>
              </Box>
            </DialogContent>

            <Box
              sx={{
                flexShrink: 0,
                px: { xs: 2.5, sm: 3.5 },
                py: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderTop: "1px solid rgba(216,177,90,0.2)",
                background: "rgba(255,255,255,0.015)",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(232,229,222,0.42)",
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                GOLDEN DREAMS
              </Typography>

              <Button
                onClick={closePolicy}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  color: "#15120B",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  background: "linear-gradient(110deg, #F5D990, #D8B15A)",
                  "&:hover": {
                    background: "linear-gradient(110deg, #FFE9A8, #E4BC65)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 5px 18px rgba(216,177,90,0.16)",
                  },
                }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* CONTACT OPTIONS MODAL */}
      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="contact-modal-title"
        sx={modalSx}
        PaperProps={{
          sx: {
            ...modalPaperSx,
            maxWidth: 430,
            borderRadius: { xs: "22px", sm: "26px" },
          },
        }}
      >
        {/* CONTACT HEADER */}
        <Box
          sx={{
            position: "relative",
            textAlign: "center",
            px: 3,
            pt: 4,
            pb: 3,
            borderBottom: "1px solid rgba(216,177,90,0.2)",
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(216,177,90,0.12), transparent 70%)",
          }}
        >
          <IconButton
            aria-label="Close contact options"
            onClick={() => setContactOpen(false)}
            sx={closeButtonSx}
          >
            <CloseRoundedIcon />
          </IconButton>

          <Box
            sx={{
              width: 62,
              height: 62,
              mx: "auto",
              mb: 2,
              display: "grid",
              placeItems: "center",
              borderRadius: "20px",
              color: LIGHT_GOLD,
              border: "1px solid rgba(216,177,90,0.5)",
              background:
                "linear-gradient(145deg, rgba(216,177,90,0.18), rgba(216,177,90,0.035))",
              boxShadow: "0 0 30px rgba(216,177,90,0.08)",
            }}
          >
            <CameraAltRoundedIcon sx={{ fontSize: 32 }} />
          </Box>

          <Typography
            id="contact-modal-title"
            component="h2"
            sx={{
              ...goldHeadingSx,
              fontSize: { xs: 27, sm: 30 },
            }}
          >
            Let's Connect
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "rgba(232,229,222,0.65)",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            Have a question? Choose how you'd like to reach us.
          </Typography>
        </Box>

        {/* CONTACT ACTIONS */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          {contactLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 3 }}>
              <CircularProgress
                size={30}
                sx={{ color: GOLD }}
              />
              <Typography
                sx={{ color: "rgba(232,229,222,0.65)", fontSize: 13 }}
              >
                Loading contact details...
              </Typography>
            </Stack>
          ) : contactError ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography
                sx={{
                  color: "#F0B5A9",
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                {contactError}
              </Typography>

              <Button
                onClick={() => window.location.reload()}
                sx={{
                  mt: 2,
                  color: LIGHT_GOLD,
                  textTransform: "none",
                }}
              >
                Try Again
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {/* CALL BUTTON */}
              <Button
                fullWidth
                onClick={handleCall}
                disabled={!phoneNumber}
                startIcon={<CallRoundedIcon />}
                sx={{
                  justifyContent: "flex-start",
                  gap: 1,
                  px: 2.2,
                  py: 1.8,
                  borderRadius: "15px",
                  textTransform: "none",
                  color: "#171208",
                  fontSize: 14,
                  fontWeight: 700,
                  background:
                    "linear-gradient(110deg, #F5D990, #D8B15A)",
                  boxShadow: "0 7px 22px rgba(216,177,90,0.10)",
                  "&:hover": {
                    background:
                      "linear-gradient(110deg, #FFE9A8, #E4BC65)",
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(232,229,222,0.35)",
                    background: "rgba(255,255,255,0.06)",
                  },
                  "& .MuiButton-startIcon": {
                    mr: 1.2,
                    "& svg": { fontSize: 23 },
                  },
                }}
              >
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography
                    component="span"
                    sx={{ display: "block", fontSize: 14, fontWeight: 700 }}
                  >
                    Call Us
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      mt: 0.3,
                      fontSize: 11,
                      opacity: 0.75,
                      fontWeight: 400,
                    }}
                  >
                    Speak with us directly
                  </Typography>
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
              </Button>

              {/* WHATSAPP BUTTON */}
              <Button
                fullWidth
                onClick={handleWhatsApp}
                disabled={!whatsappNumber}
                startIcon={<WhatsAppIcon />}
                sx={{
                  justifyContent: "flex-start",
                  gap: 1,
                  px: 2.2,
                  py: 1.8,
                  borderRadius: "15px",
                  textTransform: "none",
                  color: "#E8E5DE",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "1px solid rgba(37,211,102,0.45)",
                  background:
                    "linear-gradient(110deg, rgba(37,211,102,0.13), rgba(37,211,102,0.045))",
                  "&:hover": {
                    background: "rgba(37,211,102,0.16)",
                    borderColor: "#25D366",
                    transform: "translateY(-2px)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(232,229,222,0.35)",
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                  },
                  "& .MuiButton-startIcon": {
                    color: "#25D366",
                    mr: 1.2,
                    "& svg": { fontSize: 25 },
                  },
                }}
              >
                <Box sx={{ flex: 1, textAlign: "left" }}>
                  <Typography
                    component="span"
                    sx={{ display: "block", fontSize: 14, fontWeight: 700 }}
                  >
                    WhatsApp Us
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      mt: 0.3,
                      fontSize: 11,
                      color: "rgba(232,229,222,0.62)",
                      fontWeight: 400,
                    }}
                  >
                    Chat with us on WhatsApp
                  </Typography>
                </Box>
                <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
              </Button>

              {!phoneNumber && !whatsappNumber && (
                <Typography
                  sx={{
                    pt: 1,
                    textAlign: "center",
                    color: "rgba(232,229,222,0.5)",
                    fontSize: 11,
                  }}
                >
                  No valid phone numbers are available in the Office record.
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        {/* CONTACT MODAL FOOTER */}
        <Box
          sx={{
            px: 3,
            py: 2,
            textAlign: "center",
            borderTop: "1px solid rgba(216,177,90,0.18)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <Typography
            sx={{
              color: "rgba(232,229,222,0.42)",
              fontSize: 10,
              letterSpacing: 1.5,
            }}
          >
            GOLDEN DREAMS · MEMORIES FOREVER
          </Typography>
        </Box>
      </Dialog>
    </>
  );
}
