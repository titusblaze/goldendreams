
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Groups,
  AutoAwesome,
  FormatQuote,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { getAllApiData } from "./api";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";
const MIDNIGHT = "#080808";

export default function ReliableCustomer() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const visibleCount = isMobile ? 1 : isTablet ? 2 : 3;

  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedLogos, setFailedLogos] = useState({});

  // Fetch data through the existing shared API.
  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["reliable-customers"],
    queryFn: getAllApiData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Google Sheets mapping for Id = 12.
  const customers = useMemo(() => {
    const rows = Array.isArray(apiData)
      ? apiData
      : Array.isArray(apiData?.data)
        ? apiData.data
        : [];

    return rows
      .filter(
        (item) =>
          String(item?.Id ?? "").trim() === "12" &&
          String(item?.LabelText ?? "").trim() !== ""
      )
      .map((item, index) => ({
        id: `${item.Id}-${item.LabelText}-${index}`,
        logo: String(item.link ?? "").trim(),
        name: String(item.LabelText ?? "").trim(),
        year: String(item.LabelText1 ?? "").trim(),
        description: String(item.LabelText2 ?? "").trim(),
      }));
  }, [apiData]);

  const pageCount = Math.ceil(customers.length / visibleCount);

  // Keep carousel position valid when screen size or data changes.
  useEffect(() => {
    setCurrentPage((page) =>
      Math.min(page, Math.max(pageCount - 1, 0))
    );
  }, [pageCount]);

  // Automatic carousel: changes the visible group every 5 seconds.
  useEffect(() => {
    if (isPaused || pageCount <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentPage((page) => (page + 1) % pageCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, pageCount]);

  const visibleCustomers = customers.slice(
    currentPage * visibleCount,
    currentPage * visibleCount + visibleCount
  );

  const changePage = (direction) => {
    setCurrentPage((page) =>
      pageCount <= 1
        ? 0
        : (page + direction + pageCount) % pageCount
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <Box
      component="section"
      aria-label="Our reliable customers"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 5, sm: 6, md: 8 },
        color: "#fff",
        background: 'transparent',
      }}
    >
      
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Section heading */}
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 700,
            mx: "auto",
            mb: { xs: 3.5, md: 5 },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 1.5,
              px: 2,
              py: 0.7,
              border: "1px solid rgba(216,177,90,0.28)",
              borderRadius: "30px",
              background: "rgba(216,177,90,0.07)",
            }}
          >
            <AutoAwesome sx={{ fontSize: 16, color: LIGHT_GOLD }} />
            <Typography
              sx={{
                color: LIGHT_GOLD,
                fontSize: 11,
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              TRUSTED RELATIONSHIPS
            </Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontFamily: "Georgia, serif",
              fontWeight: 600,
              fontSize: { xs: 28, sm: 35, md: 43 },
              lineHeight: 1.2,
              background: `linear-gradient(100deg, #FFFFFF 15%, ${LIGHT_GOLD} 55%, ${GOLD} 95%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Our Reliable Customers
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              mx: "auto",
              maxWidth: 550,
              color: "rgba(255,255,255,0.66)",
              fontSize: { xs: 13, sm: 14 },
              lineHeight: 1.8,
            }}
          >
            Building lasting relationships through trust, creativity,
            and memorable experiences.
          </Typography>

          <Box
            sx={{
              width: 72,
              height: 2,
              mx: "auto",
              mt: 2.5,
              borderRadius: 5,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            }}
          />
        </Box>

        {/* Loading state */}
        {isLoading && (
          <Box
            sx={{
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress size={32} sx={{ color: GOLD }} />
            <Typography
              sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}
            >
              Loading our customers...
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: LIGHT_GOLD, mb: 2 }}>
              Customer information could not be loaded.
            </Typography>

            <Box
              component="button"
              type="button"
              onClick={() => refetch()}
              sx={{
                cursor: "pointer",
                border: `1px solid ${GOLD}`,
                borderRadius: 2,
                px: 2.5,
                py: 1,
                background: "rgba(216,177,90,0.08)",
                color: LIGHT_GOLD,
                font: "inherit",
                fontSize: 13,
              }}
            >
              Try Again
            </Box>
          </Box>
        )}

        {/* Empty state */}
        {!isLoading && !isError && customers.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Groups sx={{ color: GOLD, fontSize: 38, mb: 1 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
              Our customer stories will appear here soon.
            </Typography>
          </Box>
        )}

        {/* Customer cards and carousel */}
        {!isLoading && !isError && customers.length > 0 && (
          <Box
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsPaused(false);
              }
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 2, sm: 2.5, md: 3 },
                alignItems: "stretch",
              }}
            >
              <AnimatePresence mode="wait">
                {visibleCustomers.map((customer) => {
                  const logoFailed = failedLogos[customer.id];

                  return (
                    <Box
                      component={motion.div}
                      key={`${customer.id}-${currentPage}`}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      sx={{
                        minWidth: 0,
                        minHeight: { xs: 205, sm: 220, md: 230 },
                        display: "flex",
                        flexDirection: "column",
                        p: { xs: 1.8, sm: 2.2, md: 2.5 },
                        borderRadius: { xs: 3, md: 4 },
                        border: "1px solid rgba(216,177,90,0.30)",
                        background: `
                          linear-gradient(
                            135deg,
                            rgba(255,255,255,0.075),
                            rgba(255,255,255,0.018)
                          )
                        `,
                        backdropFilter: "blur(18px)",
                        WebkitBackdropFilter: "blur(18px)",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 35px rgba(0,0,0,0.22)",
                        transition:
                          "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                        "&:hover": {
                          borderColor: "rgba(245,217,144,0.65)",
                          boxShadow:
                            "0 12px 38px rgba(216,177,90,0.09), inset 0 1px 0 rgba(255,255,255,0.08)",
                          transform: "translateY(-3px)",
                        },
                      }}
                    >
                      {/* TOP PART: Logo + name | Customer Since + year */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          alignItems: "center",
                          gap: { xs: 1.5, sm: 2 },
                          minHeight: 95,
                          pb: 2,
                        }}
                      >
                        {/* Left: customer logo and name */}
                        <Box
                          sx={{
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 52, sm: 60, md: 66 },
                              height: { xs: 52, sm: 60, md: 66 },
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              overflow: "hidden",
                              background:
                                "linear-gradient(145deg, rgba(245,217,144,0.16), rgba(216,177,90,0.035))",
                              border: "1px solid rgba(245,217,144,0.42)",
                              boxShadow:
                                "0 0 22px rgba(216,177,90,0.08)",
                            }}
                          >
                            {customer.logo && !logoFailed ? (
                              <Box
                                component="img"
                                src={customer.logo}
                                alt={`${customer.name} logo`}
                                loading="lazy"
                                onError={() =>
                                  setFailedLogos((previous) => ({
                                    ...previous,
                                    [customer.id]: true,
                                  }))
                                }
                                sx={{
                                  width: "76%",
                                  height: "76%",
                                  objectFit: "contain",
                                }}
                              />
                            ) : (
                              <Groups
                                sx={{
                                  fontSize: 31,
                                  color: LIGHT_GOLD,
                                }}
                              />
                            )}
                          </Box>

                          <Typography
                            sx={{
                              width: "100%",
                              color: LIGHT_GOLD,
                              fontWeight: 700,
                              fontSize: { xs: 12, sm: 13, md: 14 },
                              lineHeight: 1.4,
                              overflowWrap: "anywhere",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {customer.name}
                          </Typography>
                        </Box>

                        {/* Right: Customer Since, left-aligned */}
                        <Box
                          sx={{
                            minWidth: 0,
                            alignSelf: "stretch",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            pl: { xs: 1.3, sm: 2 },
                            borderLeft: "1px solid rgba(216,177,90,0.28)",
                          }}
                        >
                          <Typography
                            sx={{
                              color: GOLD,
                              fontSize: { xs: 12, sm: 13, md: 15 },
                              fontWeight: 700,
                              letterSpacing: { xs: 0.5, sm: 1.1 },
                              lineHeight: 1.6,
                              textTransform: "uppercase",
                            }}
                          >
                            CUSTOMER SINCE
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.4,
                              fontFamily: "Georgia, serif",
                              fontSize: { xs: 27, sm: 31, md: 35 },
                              lineHeight: 1.15,
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              color: LIGHT_GOLD,
                              overflowWrap: "anywhere",
                              textShadow:
                                "0 0 18px rgba(216,177,90,0.15)",
                            }}
                          >
                            {customer.year || "—"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Divider between top and bottom parts */}
                      <Box
                        sx={{
                          width: "100%",
                          height: "1px",
                          flexShrink: 0,
                          background:
                            "linear-gradient(90deg, rgba(216,177,90,0.8), rgba(216,177,90,0.12))",
                        }}
                      />

                      {/* BOTTOM PART: Full-width description */}
                      <Box
                        sx={{
                          pt: 1.8,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.8,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <FormatQuote
                          sx={{
                            color: "rgba(216,177,90,0.8)",
                            fontSize: 23,
                            flexShrink: 0,
                            mt: -0.25,
                          }}
                        />

                        <Typography
                          sx={{
                            minWidth: 0,
                            color: "rgba(255,255,255,0.76)",
                            fontSize: { xs: 11.5, sm: 12, md: 12.5 },
                            lineHeight: 1.8,
                            overflowWrap: "anywhere",
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {customer.description ||
                            "A valued relationship built on trust, quality, and shared success."}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </AnimatePresence>
            </Box>

            {/* Carousel navigation */}
            {pageCount > 1 && (
              <Box
                sx={{
                  mt: { xs: 3, md: 3.5 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <IconButton
                  aria-label="Previous customers"
                  onClick={() => changePage(-1)}
                  size="small"
                  sx={{
                    width: 35,
                    height: 35,
                    color: LIGHT_GOLD,
                    border: "1px solid rgba(216,177,90,0.35)",
                    background: "rgba(216,177,90,0.06)",
                    "&:hover": {
                      background: "rgba(216,177,90,0.16)",
                    },
                  }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {Array.from({ length: pageCount }, (_, index) => (
                    <Box
                      component="button"
                      key={index}
                      type="button"
                      aria-label={`Show customer group ${index + 1}`}
                      aria-current={
                        currentPage === index ? "true" : undefined
                      }
                      onClick={() => setCurrentPage(index)}
                      sx={{
                        cursor: "pointer",
                        width: currentPage === index ? 23 : 7,
                        height: 7,
                        p: 0,
                        border: 0,
                        borderRadius: 5,
                        background:
                          currentPage === index
                            ? `linear-gradient(90deg, ${GOLD}, ${LIGHT_GOLD})`
                            : "rgba(255,255,255,0.25)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>

                <IconButton
                  aria-label="Next customers"
                  onClick={() => changePage(1)}
                  size="small"
                  sx={{
                    width: 35,
                    height: 35,
                    color: LIGHT_GOLD,
                    border: "1px solid rgba(216,177,90,0.35)",
                    background: "rgba(216,177,90,0.06)",
                    "&:hover": {
                      background: "rgba(216,177,90,0.16)",
                    },
                  }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        )}

        {/* Footer accent */}
        {!isLoading && !isError && customers.length > 0 && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              opacity: 0.65,
            }}
          >
            <AutoAwesome sx={{ fontSize: 13, color: GOLD }} />

            <Typography
              sx={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 10,
                letterSpacing: 1.5,
                textAlign: "center",
              }}
            >
              EVERY RELATIONSHIP TELLS A STORY
            </Typography>

            <AutoAwesome sx={{ fontSize: 13, color: GOLD }} />
          </Box>
        )}
      </Container>
    </Box>
  );
}
