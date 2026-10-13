import React, { useState } from "react";
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
} from "@mui/material";

import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";
const MIDNIGHT = "#080808";
const DARK_GOLD = "#80601F";

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

export default function LoginFooter() {
  const [activePolicy, setActivePolicy] = useState(null);

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
      action: () => {
        const contact = document.getElementById("contact");

        if (contact) {
          contact.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = "/contact";
        }
      },
    },
  ];

  const policy = activePolicy ? policyData[activePolicy] : null;

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
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
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
                      fontFamily: "Georgia, serif",
                      fontSize: { xs: 25, sm: 29, md: 31 },
                      fontWeight: 500,
                      letterSpacing: "-0.8px",
                      lineHeight: 1.15,
                      background:
                        "linear-gradient(90deg, #FFF0B5, #D8B15A, #F8E4A0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
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
                      transition:
                        "color 0.25s ease, transform 0.25s ease",
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

          <Divider
            sx={{ borderColor: "rgba(216,177,90,0.25)" }}
          />

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
        onClose={() => setActivePolicy(null)}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        aria-labelledby="policy-modal-title"
        sx={{
          // Higher than most application components
          zIndex: 999999,
        }}
        PaperProps={{
          sx: {
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
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(7px)",
            },
          },
        }}
      >
        {policy && (
          <>
            {/* MODAL HEADER */}
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
                onClick={() => setActivePolicy(null)}
                sx={{
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
                }}
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
                  fontFamily: "Georgia, serif",
                  fontSize: { xs: 28, sm: 34 },
                  lineHeight: 1.2,
                  fontWeight: 500,
                  background:
                    "linear-gradient(90deg, #FFF0B5, #D8B15A, #F8E4A0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
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

            {/* SCROLLABLE POLICY CONTENT */}
            <DialogContent
              dividers={false}
              sx={{
                flex: "1 1 auto",
                minHeight: 0,
                px: { xs: 2.5, sm: 3.5 },
                py: 2.5,
                overflowY: "auto",
                overflowX: "hidden",
                overscrollBehavior: "contain",
                scrollbarWidth: "thin",
                scrollbarColor: `${GOLD} ${MIDNIGHT}`,

                // Chrome, Edge and Safari scrollbar
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
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
                  minHeight: "40px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background:
                    "linear-gradient(180deg, #FFF0B5 0%, #E5BF67 50%, #A37A2C 100%)",
                },
                "&::-webkit-scrollbar-corner": {
                  background: MIDNIGHT,
                },
              }}
            >
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
                          boxShadow:
                            "0 0 9px rgba(216,177,90,0.4)",
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

            {/* MODAL FOOTER */}
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
                onClick={() => setActivePolicy(null)}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  color: "#15120B",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  background:
                    "linear-gradient(110deg, #F5D990, #D8B15A)",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(110deg, #FFE9A8, #E4BC65)",
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
    </>
  );
}
