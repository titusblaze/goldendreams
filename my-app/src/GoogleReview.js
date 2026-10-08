import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Box,
  Typography,
  Avatar,
  Rating,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

import {
  Google,
  Close,
  RateReview,
} from "@mui/icons-material";

/* =========================================================
   GOOGLE SHEETS REVIEW API
========================================================= */

const REVIEW_API =
  "https://script.google.com/macros/s/AKfycby0IEqIAsdGmhCCaiLPpItQ8g8UwQg9IfAN1p3UKgb2z3r2ouZHVeOfd4Ok0FludKr2/exec";

/* =========================================================
   GOOGLE CLIENT ID
========================================================= */

const GOOGLE_CLIENT_ID =
  "681956349087-4hd698pj1lnkegie2s6fg49kaau38t8e.apps.googleusercontent.com";

/* =========================================================
   DECODE GOOGLE JWT
========================================================= */

function decodeJwtResponse(token) {
  try {
    const base64Url = token.split(".")[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(
          (c) =>
            "%" +
            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error(
      "Google JWT decode error:",
      error
    );

    return null;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function GoogleReview() {
  /* =======================================================
     REVIEWS
  ======================================================= */

  const [reviews, setReviews] = useState([]);

  const [loadingReviews, setLoadingReviews] =
    useState(true);

  const [reviewError, setReviewError] =
    useState("");

  /* =======================================================
     DIALOG
  ======================================================= */

  const [openDialog, setOpenDialog] =
    useState(false);

  const [dialogStep, setDialogStep] =
    useState("login");

  /* =======================================================
     GOOGLE USER
  ======================================================= */

  const [googleUser, setGoogleUser] =
    useState(null);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  /* =======================================================
     FORM
  ======================================================= */

  const [rating, setRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitMessage, setSubmitMessage] =
    useState("");

  const [submitError, setSubmitError] =
    useState("");

  /* =======================================================
     CAROUSEL
  ======================================================= */

  const reviewSliderRef =
    useRef(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  /* =======================================================
     FETCH REVIEWS
  ======================================================= */

  const fetchReviews = useCallback(
    async () => {
      try {
        setLoadingReviews(true);
        setReviewError("");

        const response = await fetch(
          REVIEW_API,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}`
          );
        }

        const data =
          await response.json();

        if (data.success) {
          setReviews(
            Array.isArray(data.reviews)
              ? data.reviews
              : []
          );
        } else {
          throw new Error(
            data.message ||
              "Unable to load reviews"
          );
        }
      } catch (error) {
        console.error(
          "Review fetch error:",
          error
        );

        setReviewError(
          "Unable to load reviews right now."
        );
      } finally {
        setLoadingReviews(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* =======================================================
     GOOGLE IDENTITY SCRIPT
  ======================================================= */

  useEffect(() => {
    if (
      document.getElementById(
        "google-identity-script"
      )
    ) {
      return;
    }

    const script =
      document.createElement("script");

    script.id =
      "google-identity-script";

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    document.head.appendChild(script);
  }, []);

  /* =======================================================
     GOOGLE LOGIN BUTTON
  ======================================================= */

  useEffect(() => {
    if (
      !openDialog ||
      dialogStep !== "login"
    ) {
      return;
    }

    let interval;

    const initializeGoogle = () => {
      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        return false;
      }

      const buttonContainer =
        document.getElementById(
          "google-signin-button"
        );

      if (!buttonContainer) {
        return false;
      }

      buttonContainer.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id:
          GOOGLE_CLIENT_ID,

        callback: (response) => {
          setGoogleLoading(true);

          const user =
            decodeJwtResponse(
              response.credential
            );

          if (!user) {
            setGoogleLoading(false);

            setSubmitError(
              "Unable to sign in with Google."
            );

            return;
          }

          const userData = {
            name:
              user.name ||
              user.given_name ||
              "Google User",

            email:
              user.email || "",

            photo:
              user.picture || "",

            googleId:
              user.sub || "",
          };

          setGoogleUser(userData);

          setGoogleLoading(false);

          setSubmitError("");
          setSubmitMessage("");

          setDialogStep("profile");
        },
      });

      window.google.accounts.id.renderButton(
        buttonContainer,
        {
          theme: "filled_black",
          size: "large",
          shape: "rectangular",
          width: 320,
          text: "continue_with",
        }
      );

      return true;
    };

    if (!initializeGoogle()) {
      interval = setInterval(() => {
        if (initializeGoogle()) {
          clearInterval(interval);
        }
      }, 300);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    openDialog,
    dialogStep,
  ]);

  /* =======================================================
     OPEN REVIEW
  ======================================================= */

  const handleOpenReview = () => {
    setSubmitMessage("");
    setSubmitError("");

    setRating(0);
    setComment("");

    if (googleUser) {
      setDialogStep("profile");
    } else {
      setDialogStep("login");
    }

    setOpenDialog(true);
  };

  /* =======================================================
     CLOSE DIALOG
  ======================================================= */

  const handleCloseDialog = () => {
    if (submitting) {
      return;
    }

    setOpenDialog(false);

    setSubmitError("");
    setSubmitMessage("");
  };

  /* =======================================================
     SUBMIT REVIEW
  ======================================================= */

  const handleSubmitReview = async () => {
    setSubmitError("");
    setSubmitMessage("");

    if (!googleUser) {
      setSubmitError(
        "Please sign in with Google first."
      );

      setDialogStep("login");

      return;
    }

    if (!rating) {
      setSubmitError(
        "Please select a star rating."
      );

      return;
    }

    if (!comment.trim()) {
      setSubmitError(
        "Please write your review."
      );

      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        name: googleUser.name,
        email: googleUser.email,
        rating: Number(rating),
        review: comment.trim(),
        photo: googleUser.photo,
        googleId:
          googleUser.googleId,
      };

      const response =
        await fetch(REVIEW_API, {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8",
          },

          body: JSON.stringify(
            reviewData
          ),
        });

      if (!response.ok) {
        throw new Error(
          `HTTP error ${response.status}`
        );
      }

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Review submission failed"
        );
      }

      setSubmitMessage(
        "Thank you! Your review has been submitted and is now visible."
      );

      setRating(0);
      setComment("");

      await fetchReviews();

      setTimeout(() => {
        setOpenDialog(false);
        setSubmitMessage("");
      }, 1800);
    } catch (error) {
      console.error(
        "Review submission error:",
        error
      );

      setSubmitError(
        "Unable to submit your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CENTER REVIEW
  ======================================================= */

  const centerReview = useCallback(
    (index, smooth = true) => {
      const slider =
        reviewSliderRef.current;

      if (!slider) {
        return;
      }

      const cards =
        slider.querySelectorAll(
          "[data-review-card]"
        );

      const card = cards[index];

      if (!card) {
        return;
      }

      /*
        Calculate the exact distance required
        to put the selected card in the
        center of the slider.
      */

      const sliderRect =
        slider.getBoundingClientRect();

      const cardRect =
        card.getBoundingClientRect();

      const sliderCenter =
        sliderRect.left +
        sliderRect.width / 2;

      const cardCenter =
        cardRect.left +
        cardRect.width / 2;

      const distance =
        cardCenter -
        sliderCenter;

      slider.scrollBy({
        left: distance,
        behavior: smooth
          ? "smooth"
          : "auto",
      });

      setActiveIndex(index);
    },
    []
  );

  /* =======================================================
     DETECT CENTER CARD
  ======================================================= */

  const updateActiveIndex =
    useCallback(() => {
      const slider =
        reviewSliderRef.current;

      if (!slider) {
        return;
      }

      const cards =
        slider.querySelectorAll(
          "[data-review-card]"
        );

      if (!cards.length) {
        return;
      }

      const sliderRect =
        slider.getBoundingClientRect();

      const sliderCenter =
        sliderRect.left +
        sliderRect.width / 2;

      let closestIndex = 0;

      let closestDistance =
        Infinity;

      cards.forEach(
        (card, index) => {
          const rect =
            card.getBoundingClientRect();

          const cardCenter =
            rect.left +
            rect.width / 2;

          const distance =
            Math.abs(
              cardCenter -
                sliderCenter
            );

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            closestIndex =
              index;
          }
        }
      );

      setActiveIndex(
        closestIndex
      );
    }, []);

  /* =======================================================
     SCROLL EVENT
  ======================================================= */

  useEffect(() => {
    const slider =
      reviewSliderRef.current;

    if (!slider) {
      return;
    }

    let scrollTimer;

    const handleScroll = () => {
      updateActiveIndex();

      clearTimeout(
        scrollTimer
      );

      /*
        After scrolling stops,
        precisely center the nearest card.
      */

      scrollTimer = setTimeout(() => {
        const cards =
          slider.querySelectorAll(
            "[data-review-card]"
          );

        if (!cards.length) {
          return;
        }

        const sliderRect =
          slider.getBoundingClientRect();

        const sliderCenter =
          sliderRect.left +
          sliderRect.width / 2;

        let closestIndex = 0;

        let closestDistance =
          Infinity;

        cards.forEach(
          (card, index) => {
            const rect =
              card.getBoundingClientRect();

            const cardCenter =
              rect.left +
              rect.width / 2;

            const distance =
              Math.abs(
                cardCenter -
                  sliderCenter
              );

            if (
              distance <
              closestDistance
            ) {
              closestDistance =
                distance;

              closestIndex =
                index;
            }
          }
        );

        centerReview(
          closestIndex,
          true
        );
      }, 160);
    };

    slider.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      slider.removeEventListener(
        "scroll",
        handleScroll
      );

      clearTimeout(
        scrollTimer
      );
    };
  }, [
    reviews,
    updateActiveIndex,
    centerReview,
  ]);

  /* =======================================================
     INITIAL CENTER
  ======================================================= */

  useEffect(() => {
    if (!reviews.length) {
      return;
    }

    const timer =
      setTimeout(() => {
        centerReview(
          0,
          false
        );
      }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    reviews,
    centerReview,
  ]);

  /* =======================================================
     RESIZE
  ======================================================= */

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        centerReview(
          activeIndex,
          false
        );
      }, 150);
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [
    activeIndex,
    centerReview,
  ]);

  /* =======================================================
     MOUSE WHEEL
  ======================================================= */

  useEffect(() => {
    const slider =
      reviewSliderRef.current;

    if (!slider) {
      return;
    }

    const handleWheel = (
      event
    ) => {
      /*
        Normal mouse wheel:
        vertical movement becomes
        horizontal carousel movement.
      */

      if (
        Math.abs(event.deltaY) >
        Math.abs(event.deltaX)
      ) {
        event.preventDefault();

        slider.scrollLeft +=
          event.deltaY;
      }
    };

    slider.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
      }
    );

    return () => {
      slider.removeEventListener(
        "wheel",
        handleWheel
      );
    };
  }, [reviews]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        py: {
          xs: 5,
          sm: 6,
          md: 8,
        },
        overflow: "hidden",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Box
        sx={{
          textAlign: "center",
          mb: {
            xs: 3,
            sm: 4,
            md: 5,
          },
          px: 2,
        }}
      >
        <Typography
          sx={{
            color: "#FFD700",

            fontSize: {
              xs: "1.8rem",
              sm: "2.2rem",
              md: "2.7rem",
            },

            fontWeight: 700,

            letterSpacing: 0.5,
          }}
        >
          What Our Customers Say
        </Typography>

        <Typography
          sx={{
            mt: 1,

            color:
              "rgba(255,255,255,0.65)",

            fontSize: {
              xs: "0.9rem",
              sm: "1rem",
            },
          }}
        >
          Real experiences from our
          customers
        </Typography>
      </Box>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loadingReviews && (
        <Box
          sx={{
            minHeight: 220,

            display: "flex",

            justifyContent:
              "center",

            alignItems:
              "center",
          }}
        >
          <CircularProgress
            size={35}
            sx={{
              color: "#FFD700",
            }}
          />
        </Box>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {!loadingReviews &&
        reviewError && (
          <Box
            sx={{
              maxWidth: 600,
              mx: "auto",
              px: 2,
            }}
          >
            <Alert severity="error">
              {reviewError}
            </Alert>
          </Box>
        )}

      {/* ===================================================
          REVIEW CAROUSEL
      =================================================== */}

      {!loadingReviews &&
        !reviewError &&
        reviews.length > 0 && (
          <Box
            sx={{
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              ref={reviewSliderRef}
              sx={{
                width: "100%",

                display: "flex",

                alignItems:
                  "center",

                gap: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },

                overflowX: "auto",

                overflowY:
                  "visible",

                /*
                  Smooth horizontal scrolling
                */

                scrollBehavior:
                  "smooth",

                scrollSnapType:
                  "x mandatory",

                /*
                  Important:
                  This makes the browser treat
                  the center as the snap position.
                */

                scrollPaddingInline:
                  "50%",

                scrollbarWidth:
                  "none",

                msOverflowStyle:
                  "none",

                "&::-webkit-scrollbar":
                  {
                    display: "none",
                  },

                /*
                  Large side padding is required
                  so first and last cards can
                  reach the exact center.
                */

                px: {
                  xs: "0%",
                  sm: "19%",
                  md: "26%",
                  lg: "29%",
                  xl: "30%",
                },

                py: {
                  xs: 4,
                  sm: 5,
                  md: 6,
                },

                boxSizing:
                  "border-box",

                cursor: "grab",

                "&:active": {
                  cursor:
                    "grabbing",
                },

                userSelect:
                  "none",

                WebkitOverflowScrolling:
                  "touch",
              }}
            >
              {reviews.map(
                (review, index) => {
                  const isHero =
                    index ===
                    activeIndex;

                  return (
                    <Box
                      key={
                        review.ID ||
                        review.GoogleID ||
                        `${review.Name}-${index}`
                      }
                      data-review-card
                      onClick={() =>
                        centerReview(
                          index,
                          true
                        )
                      }
                      sx={{
                        /*
                          =================================
                          CARD WIDTH
                        =================================
                        */

                        width: {
                          xs: "100%",
                          sm: "62%",
                          md: "48%",
                          lg: "42%",
                          xl: "40%",
                        },

                        minWidth: {
                          xs: "100%",
                          sm: "62%",
                          md: "48%",
                          lg: "42%",
                          xl: "40%",
                        },

                        /*
                          =================================
                          AUTOMATIC HEIGHT
                        =================================
                        */

                        height: "auto",

                        minHeight: {
                          xs: 200,
                          sm: 215,
                          md: 225,
                        },

                        alignSelf:
                          "center",

                        display:
                          "flex",

                        flexDirection:
                          "column",

                        p: {
                          xs: 2.2,
                          sm: 2.5,
                          md: 2.8,
                        },

                        borderRadius: 3,

                        /*
                          =================================
                          90% TRANSPARENT BACKGROUND
                          =================================

                          The background is mostly
                          transparent so the page
                          background remains visible.
                        */

                        background:
                          isHero
                            ? "linear-gradient(145deg, rgba(30,30,30,0.10), rgba(12,12,12,0.08))"
                            : "linear-gradient(145deg, rgba(30,30,30,0.08), rgba(12,12,12,0.06))",

                        /*
                          NO SHADOW
                        */

                        boxShadow:
                          "none",

                        /*
                          GOLD BORDER
                        */

                        border:
                          isHero
                            ? "1px solid rgba(255,215,0,0.85)"
                            : "1px solid rgba(255,215,0,0.22)",

                        /*
                          HERO EFFECT
                        */

                        transform:
                          isHero
                            ? "scale(1.08)"
                            : "scale(0.93)",

                        opacity:
                          isHero
                            ? 1
                            : 0.58,

                        transition:
                          "transform 0.35s ease, opacity 0.35s ease, border-color 0.35s ease",

                        boxSizing:
                          "border-box",

                        textAlign:
                          "left",

                        zIndex:
                          isHero
                            ? 5
                            : 1,

                        flexShrink: 0,

                        scrollSnapAlign:
                          "center",

                        scrollSnapStop:
                          "always",

                        cursor:
                          "pointer",

                        /*
                          Keep the hero visually
                          above neighboring cards.
                        */

                        position:
                          "relative",

                        "&:hover": {
                          opacity: 1,

                          borderColor:
                            "rgba(255,215,0,0.65)",
                        },
                      }}
                    >
                      {/* =================================
                          PROFILE
                      ================================= */}

                      <Box
                        sx={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "flex-start",

                          gap: {
                            xs: 1.2,
                            sm: 1.5,
                          },

                          mb: 2,

                          width:
                            "100%",

                          textAlign:
                            "left",
                        }}
                      >
                        <Avatar
                          src={
                            review.Photo ||
                            ""
                          }
                          alt={
                            review.Name ||
                            "Customer"
                          }
                          sx={{
                            width: {
                              xs: 48,
                              sm: 54,
                            },

                            height: {
                              xs: 48,
                              sm: 54,
                            },

                            flexShrink: 0,

                            border:
                              "2px solid rgba(255,215,0,0.75)",

                            background:
                              "rgba(0,0,0,0.15)",

                            color:
                              "#FFD700",
                          }}
                        >
                          {String(
                            review.Name ||
                              "C"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        <Box
                          sx={{
                            minWidth: 0,

                            display:
                              "flex",

                            flexDirection:
                              "column",

                            alignItems:
                              "flex-start",

                            justifyContent:
                              "center",

                            gap: 0.2,

                            textAlign:
                              "left",
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                "#fff",

                              fontWeight:
                                600,

                              fontSize: {
                                xs: "0.95rem",
                                sm: "1rem",
                              },

                              lineHeight:
                                1.3,

                              wordBreak:
                                "break-word",
                            }}
                          >
                            {review.Name ||
                              "Customer"}
                          </Typography>

                          <Rating
                            value={
                              Number(
                                review.Rating
                              ) || 0
                            }
                            readOnly
                            size="small"
                            sx={{
                              color:
                                "#FFD700",

                              "& .MuiRating-iconEmpty":
                                {
                                  color:
                                    "rgba(255,255,255,0.25)",
                                },
                            }}
                          />
                        </Box>
                      </Box>

                      {/* =================================
                          DIVIDER
                      ================================= */}

                      <Divider
                        sx={{
                          borderColor:
                            "rgba(255,215,0,0.12)",

                          mb: 2,
                        }}
                      />

                      {/* =================================
                          REVIEW TEXT
                      ================================= */}

                      <Typography
                        sx={{
                          color:
                            "rgba(255,255,255,0.90)",

                          fontSize: {
                            xs: "0.9rem",
                            sm: "0.95rem",
                          },

                          lineHeight:
                            1.7,

                          textAlign:
                            "left",

                          whiteSpace:
                            "normal",

                          wordBreak:
                            "break-word",

                          overflowWrap:
                            "anywhere",

                          width:
                            "100%",

                          height:
                            "auto",

                          overflow:
                            "visible",
                        }}
                      >
                        {review.Review}
                      </Typography>

                      {/* =================================
                          DATE
                      ================================= */}

                      {review.Date && (
                        <Typography
                          sx={{
                            mt: 2,

                            color:
                              "rgba(255,255,255,0.4)",

                            fontSize:
                              "0.75rem",

                            textAlign:
                              "left",
                          }}
                        >
                          {new Date(
                            review.Date
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month:
                                "short",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      )}
                    </Box>
                  );
                }
              )}
            </Box>
          </Box>
        )}

      {/* ===================================================
          NO REVIEWS
      =================================================== */}

      {!loadingReviews &&
        !reviewError &&
        reviews.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 5,
              px: 2,
            }}
          >
            <Typography
              sx={{
                color:
                  "rgba(255,255,255,0.65)",

                mb: 2,
              }}
            >
              Be the first to share
              your experience.
            </Typography>
          </Box>
        )}

      {/* ===================================================
          WRITE REVIEW BUTTON
      =================================================== */}

      <Box
        sx={{
          display: "flex",

          justifyContent:
            "center",

          mt: {
            xs: 3,
            sm: 4,
            md: 5,
          },

          px: 2,
        }}
      >
        <Button
          onClick={
            handleOpenReview
          }
          startIcon={
            <RateReview />
          }
          variant="contained"
          sx={{
            px: {
              xs: 3,
              sm: 4,
            },

            py: 1.3,

            borderRadius: 2,

            textTransform:
              "none",

            fontWeight: 600,

            fontSize: {
              xs: "0.9rem",
              sm: "1rem",
            },

            color: "#111",

            background:
              "linear-gradient(135deg, #FFD700, #F4B400)",

            boxShadow:
              "none",

            "&:hover": {
              background:
                "linear-gradient(135deg, #FFE44D, #FFD000)",

              boxShadow:
                "none",
            },
          }}
        >
          Write a Review
        </Button>
      </Box>

      {/* ===================================================
          REVIEW DIALOG
      =================================================== */}

      <Dialog
        open={openDialog}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            background:
              "linear-gradient(145deg, #202020, #0c0c0c)",

            border:
              "1px solid rgba(255,215,0,0.3)",

            borderRadius: 3,

            boxShadow:
              "none",

            overflow:
              "hidden",
          },
        }}
      >
        {/* ===============================================
            CLOSE
        =============================================== */}

        <IconButton
          onClick={
            handleCloseDialog
          }
          disabled={submitting}
          sx={{
            position:
              "absolute",

            right: 10,
            top: 10,

            zIndex: 5,

            color:
              "rgba(255,255,255,0.75)",

            "&:hover": {
              color: "#FFD700",
            },
          }}
        >
          <Close />
        </IconButton>

        <DialogContent
          sx={{
            p: {
              xs: 3,
              sm: 4,
            },
          }}
        >
          {/* =============================================
              GOOGLE LOGIN
          ============================================= */}

          {dialogStep ===
            "login" && (
            <Box
              sx={{
                textAlign:
                  "center",
              }}
            >
              <Typography
                sx={{
                  color:
                    "#FFD700",

                  fontSize: {
                    xs: "1.5rem",
                    sm: "1.8rem",
                  },

                  fontWeight: 700,

                  mb: 1,
                }}
              >
                Write a Review
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.65)",

                  fontSize:
                    "0.9rem",

                  lineHeight:
                    1.6,

                  mb: 3,
                }}
              >
                Please sign in with
                your Google account
                to continue.
              </Typography>

              {submitError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    textAlign:
                      "left",
                  }}
                >
                  {submitError}
                </Alert>
              )}

              {googleLoading ? (
                <Box
                  sx={{
                    py: 3,

                    display:
                      "flex",

                    justifyContent:
                      "center",
                  }}
                >
                  <CircularProgress
                    size={32}
                    sx={{
                      color:
                        "#FFD700",
                    }}
                  />
                </Box>
              ) : (
                <Box
                  id="google-signin-button"
                  sx={{
                    display:
                      "flex",

                    justifyContent:
                      "center",

                    minHeight: 45,
                  }}
                />
              )}
            </Box>
          )}

          {/* =============================================
              REVIEW FORM
          ============================================= */}

          {dialogStep ===
            "profile" &&
            googleUser && (
              <Box>
                <Typography
                  sx={{
                    color:
                      "#FFD700",

                    fontSize: {
                      xs: "1.5rem",
                      sm: "1.8rem",
                    },

                    fontWeight: 700,

                    mb: 3,

                    textAlign:
                      "center",
                  }}
                >
                  Share Your Experience
                </Typography>

                {/* =========================================
                    GOOGLE PROFILE
                ========================================= */}

                <Box
                  sx={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 1.5,

                    mb: 3,

                    p: 1.5,

                    borderRadius: 2,

                    background:
                      "rgba(255,255,255,0.04)",

                    border:
                      "1px solid rgba(255,215,0,0.12)",
                  }}
                >
                  <Avatar
                    src={
                      googleUser.photo
                    }
                    alt={
                      googleUser.name
                    }
                    sx={{
                      width: 52,
                      height: 52,

                      border:
                        "2px solid rgba(255,215,0,0.7)",
                    }}
                  >
                    {googleUser.name
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>

                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          "#fff",

                        fontWeight:
                          600,

                        fontSize:
                          "0.95rem",

                        wordBreak:
                          "break-word",
                      }}
                    >
                      {googleUser.name}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          "rgba(255,255,255,0.55)",

                        fontSize:
                          "0.78rem",

                        wordBreak:
                          "break-word",
                      }}
                    >
                      {googleUser.email}
                    </Typography>
                  </Box>
                </Box>

                {/* =========================================
                    RATING
                ========================================= */}

                <Box
                  sx={{
                    mb: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        "#fff",

                      fontWeight:
                        600,

                      mb: 1,

                      fontSize:
                        "0.95rem",
                    }}
                  >
                    Your Rating
                  </Typography>

                  <Rating
                    value={rating}
                    onChange={(
                      _,
                      newValue
                    ) => {
                      setRating(
                        newValue || 0
                      );

                      setSubmitError(
                        ""
                      );
                    }}
                    size="large"
                    sx={{
                      color:
                        "#FFD700",

                      "& .MuiRating-iconEmpty":
                        {
                          color:
                            "rgba(255,255,255,0.22)",
                        },
                    }}
                  />
                </Box>

                {/* =========================================
                    COMMENT
                ========================================= */}

                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={12}
                  value={comment}
                  onChange={(e) => {
                    setComment(
                      e.target.value
                    );

                    setSubmitError(
                      ""
                    );
                  }}
                  placeholder="Write your review..."
                  variant="outlined"
                  sx={{
                    mb: 2.5,

                    "& .MuiOutlinedInput-root":
                      {
                        color:
                          "#fff",

                        borderRadius:
                          2,

                        background:
                          "rgba(255,255,255,0.03)",

                        "& fieldset": {
                          borderColor:
                            "rgba(255,255,255,0.18)",
                        },

                        "&:hover fieldset":
                          {
                            borderColor:
                              "rgba(255,215,0,0.5)",
                          },

                        "&.Mui-focused fieldset":
                          {
                            borderColor:
                              "#FFD700",
                          },
                      },

                    "& .MuiInputBase-input::placeholder":
                      {
                        color:
                          "rgba(255,255,255,0.45)",

                        opacity: 1,
                      },
                  }}
                />

                {/* =========================================
                    ERROR
                ========================================= */}

                {submitError && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                    }}
                  >
                    {submitError}
                  </Alert>
                )}

                {/* =========================================
                    SUCCESS
                ========================================= */}

                {submitMessage && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: 2,
                    }}
                  >
                    {submitMessage}
                  </Alert>
                )}

                {/* =========================================
                    SUBMIT
                ========================================= */}

                <Button
                  fullWidth
                  onClick={
                    handleSubmitReview
                  }
                  disabled={
                    submitting
                  }
                  variant="contained"
                  sx={{
                    py: 1.35,

                    borderRadius: 2,

                    textTransform:
                      "none",

                    fontWeight: 600,

                    color: "#111",

                    background:
                      "linear-gradient(135deg, #FFD700, #F4B400)",

                    boxShadow:
                      "none",

                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #FFE44D, #FFD000)",

                      boxShadow:
                        "none",
                    },

                    "&.Mui-disabled":
                      {
                        color:
                          "rgba(0,0,0,0.55)",

                        background:
                          "rgba(255,215,0,0.45)",
                      },
                  }}
                >
                  {submitting ? (
                    <Box
                      sx={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 1,
                      }}
                    >
                      <CircularProgress
                        size={20}
                        sx={{
                          color:
                            "#111",
                        }}
                      />

                      Submitting...
                    </Box>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </Box>
            )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}