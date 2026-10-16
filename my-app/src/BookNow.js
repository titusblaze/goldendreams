
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  CloseRounded,
  CalendarMonthRounded,
  PersonOutlineRounded,
  PhoneIphoneRounded,
  EmailOutlined,
  CameraAltOutlined,
  MessageOutlined,
  ArrowForwardRounded,
  CheckCircleOutlineRounded,
  WhatsApp,
} from "@mui/icons-material";

import { getAllApiData } from "./api";

const API_URL =
  "https://script.google.com/macros/s/AKfycbxUgaJGstTiqyKIfDQzgv5zgR0OVROWCQUMdwv2pMMp-rMq1VP_4vkJDtltQtSr1poR/exec";

const GOLD = "#D8B15A";
const LIGHT_GOLD = "#F5D990";
const MIDNIGHT = "#080808";

const INITIAL_FORM = {
  name: "",
  mobile: "",
  email: "",
  service: "",
  message: "",
};

const SERVICES = [
  "Wedding Photography",
  "Wedding Videography",
  "Pre-Wedding Shoot",
  "Birthday Photography",
  "Baby Photography",
  "Portrait Photography",
  "Photo Albums",
  "Other",
];

// Read the WhatsApp contact from Sheet1 record Id 8.
function findWhatsAppNumber(records) {
  if (!Array.isArray(records)) return "";

  const contact = records.find(
    (record) => String(record?.Id ?? "").trim() === "8"
  );

  if (!contact?.Phone) return "";

  let number = String(contact.Phone).replace(/\D/g, "");

  if (number.length === 10) {
    number = `91${number}`;
  } else if (number.length === 11 && number.startsWith("0")) {
    number = `91${number.slice(1)}`;
  }

  return number.length >= 11 && number.length <= 15 ? number : "";
}

function InputField({
  label,
  icon,
  value,
  onChange,
  error,
  helperText,
  ...props
}) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      error={Boolean(error)}
      helperText={helperText}
      variant="outlined"
      {...props}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment position="start">
            {React.cloneElement(icon, {
              sx: { color: GOLD, fontSize: 20 },
            })}
          </InputAdornment>
        ) : undefined,
        ...props.InputProps,
      }}
      sx={{
        "& .MuiInputLabel-root": { color: "#AAA18F" },
        "& .MuiInputLabel-root.Mui-focused": { color: LIGHT_GOLD },
        "& .MuiOutlinedInput-root": {
          color: "#FFF8E8",
          borderRadius: "12px",
          backgroundColor: alpha("#FFFFFF", 0.035),
          "& fieldset": { borderColor: alpha(GOLD, 0.25) },
          "&:hover fieldset": { borderColor: alpha(GOLD, 0.65) },
          "&.Mui-focused fieldset": { borderColor: GOLD },
        },
        "& .MuiFormHelperText-root": { marginLeft: "3px" },
        ...props.sx,
      }}
    />
  );
}

export default function BookNow({
  serviceTitle = "",
  accentColor = GOLD,
  buttonText = "Book Now",
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    service: SERVICES.includes(serviceTitle) ? serviceTitle : "",
  }));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleOpen = () => {
    setNotice(null);
    setErrors({});
    setForm((previous) => ({
      ...previous,
      service: SERVICES.includes(serviceTitle)
        ? serviceTitle
        : previous.service,
    }));
    setOpen(true);
  };

  const handleClose = () => {
    if (!loading) setOpen(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    } else if (form.name.trim().length > 100) {
      nextErrors.name = "Name must be under 100 characters.";
    }

    const mobile = form.mobile.trim();

    if (!mobile) {
      nextErrors.mobile = "Please enter your mobile number.";
    } else if (!/^[0-9+\s()-]{7,20}$/.test(mobile)) {
      nextErrors.mobile = "Enter a valid mobile number.";
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.service) {
      nextErrors.service = "Please select a service.";
    }

    if (form.message.length > 1000) {
      nextErrors.message = "Message must be under 1000 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || !validateForm()) return;

    // Open the blank tab synchronously during the user's click.
    // Browsers are less likely to block this than a delayed window.open().
    const whatsappWindow = window.open("about:blank", "_blank");

    if (whatsappWindow) {
      try {
        whatsappWindow.opener = null;
      } catch {
        // Continue; the opener reference is not required for submission.
      }
    }

    setLoading(true);
    setNotice(null);

    try {
      // Keep the existing Sheet2 submission payload and endpoint unchanged.
      const payload = new URLSearchParams({
        action: "bookNow",
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        service: form.service,
        message: form.message.trim(),
      });

      const response = await fetch(API_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Booking request failed. Please try again.");
      }

      const result = await response.json();

      if (!result || result.success !== true) {
        throw new Error(
          result?.error || "We couldn't save your booking."
        );
      }

      // Look up the WhatsApp number only after the save is confirmed.
      let whatsappNumber = "";

      try {
        const records = await getAllApiData();
        whatsappNumber = findWhatsAppNumber(records);
      } catch (apiError) {
        console.error("Unable to load WhatsApp number:", apiError);
      }

      if (whatsappNumber) {
        const whatsappMessage = [
          "Hello Golden Dreams!",
          "",
          "I have submitted a booking request.",
          `Booking ID: ${result.bookingId || "New booking"}`,
          `Name: ${form.name.trim()}`,
          `Mobile: ${form.mobile.trim()}`,
          `Email: ${form.email.trim() || "Not provided"}`,
          `Service: ${form.service}`,
          `Message: ${form.message.trim() || "No additional message"}`,
        ].join("\n");

        const whatsappUrl =
          `https://wa.me/${whatsappNumber}?text=` +
          encodeURIComponent(whatsappMessage);

        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.location.href = whatsappUrl;
          setNotice({
            type: "success",
            text: "Booking saved successfully! Continue in WhatsApp and press Send.",
          });
          setForm(INITIAL_FORM);
        } else {
          setNotice({
            type: "success",
            text:
              "Booking saved successfully, but your browser blocked the WhatsApp tab. " +
              "Please allow pop-ups and submit no further duplicate booking.",
          });
        }
      } else {
        if (whatsappWindow && !whatsappWindow.closed) {
          whatsappWindow.close();
        }

        setNotice({
          type: "success",
          text:
            "Booking saved successfully, but the WhatsApp number could not be loaded. " +
            "Please check Sheet1 record Id 8 and its Phone field.",
        });
        setForm(INITIAL_FORM);
      }
    } catch (error) {
      // Close the blank tab when the save/response fails.
      if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
      }

      console.error("Book Now submission error:", error);

      setNotice({
        type: "error",
        text:
          error.message ||
          "Unable to confirm your booking. Check Sheet2 before retrying.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = {
    size: "small",
    InputLabelProps: { shrink: true },
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<CalendarMonthRounded />}
        endIcon={<ArrowForwardRounded />}
        sx={{
          width: "max-content",
          maxWidth: "100%",
          flexShrink: 0,
          whiteSpace: "nowrap",
          px: { xs: 2.3, sm: 3 },
          py: 1.15,
          borderRadius: "30px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: { xs: "0.85rem", sm: "0.95rem" },
          color: MIDNIGHT,
          background: accentColor === GOLD
                        ? "linear-gradient(90deg,#FFD700,#FF9800)"
                        : accentColor,
          boxShadow: `0 5px 24px ${alpha(GOLD, 0.18)}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${GOLD}, ${LIGHT_GOLD})`,
            boxShadow: `0 7px 28px ${alpha(GOLD, 0.3)}`,
          },
        }}
      >
        {buttonText}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        PaperProps={{
          sx: {
            m: { xs: 1.2, sm: 2 },
            width: "100%",
            maxWidth: "540px",
            maxHeight: "92dvh",
            overflowX: "hidden",
            borderRadius: { xs: "20px", sm: "26px" },
            color: "#FFF8E8",
            background: `
              radial-gradient(circle at 100% 0%, ${alpha(GOLD, 0.13)}, transparent 38%),
              linear-gradient(145deg, #15130F, #080808 72%)
            `,
            border: `1px solid ${alpha(GOLD, 0.35)}`,
            boxShadow: `0 25px 100px ${alpha("#000000", 0.7)}`,
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: alpha("#000000", 0.78),
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        <DialogContent

            sx={{
                p: { xs: 2.2, sm: 3.5 },
                overflowY: "auto",
                scrollbarWidth: "thin", // Firefox
                scrollbarColor: "#D8B15A rgba(216, 177, 90, 0.08)",

                "&::-webkit-scrollbar": {
                width: "7px",
                },

                "&::-webkit-scrollbar-track": {
                background: "rgba(216, 177, 90, 0.07)",
                borderRadius: "20px",
                marginBlock: "10px",
                border: "1px solid rgba(216, 177, 90, 0.12)",
                },

                "&::-webkit-scrollbar-thumb": {
                background:
                    "linear-gradient(180deg, #FFE6A3 0%, #D8B15A 45%, #9C7528 100%)",
                borderRadius: "20px",
                border: "1px solid rgba(255, 230, 163, 0.45)",
                boxShadow: "0 0 8px rgba(216, 177, 90, 0.25)",
                transition: "all 0.3s ease",
                },

                "&::-webkit-scrollbar-thumb:hover": {
                background:
                    "linear-gradient(180deg, #FFF0BF 0%, #F5D990 45%, #D8B15A 100%)",
                boxShadow: "0 0 12px rgba(245, 217, 144, 0.55)",
                },

                "&::-webkit-scrollbar-corner": {
                background: "#080808",
                },
            }}
            >
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Box
                  sx={{
                    width: 43,
                    height: 43,
                    mb: 1.6,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "14px",
                    color: GOLD,
                    backgroundColor: alpha(GOLD, 0.1),
                    border: `1px solid ${alpha(GOLD, 0.25)}`,
                  }}
                >
                  <CameraAltOutlined />
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.8rem" },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    background: `linear-gradient(100deg, #FFF8E8, ${LIGHT_GOLD}, ${GOLD})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Let's Capture Your Moments
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "#AAA18F",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                  }}
                >
                  Tell us about your special occasion. We'll help you
                  turn it into a timeless memory.
                </Typography>
              </Box>

              <IconButton
                onClick={handleClose}
                disabled={loading}
                aria-label="Close booking form"
                sx={{
                  flexShrink: 0,
                  color: "#D8D0C0",
                  border: `1px solid ${alpha(GOLD, 0.2)}`,
                  "&:hover": {
                    color: LIGHT_GOLD,
                    backgroundColor: alpha(GOLD, 0.1),
                  },
                }}
              >
                <CloseRounded />
              </IconButton>
            </Stack>

            {notice && (
              <Alert
                severity={notice.type}
                icon={
                  notice.type === "success" ? (
                    <CheckCircleOutlineRounded />
                  ) : undefined
                }
                sx={{
                  mb: 2.5,
                  borderRadius: "12px",
                  overflowWrap: "anywhere",
                }}
              >
                {notice.text}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              autoComplete="on"
            >
              <Stack spacing={2}>
                <InputField
                  {...fieldProps}
                  label="Full Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                  helperText={errors.name}
                  icon={<PersonOutlineRounded />}
                  autoComplete="name"
                  inputProps={{ maxLength: 100 }}
                />

                <InputField
                  {...fieldProps}
                  label="Mobile Number *"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  error={errors.mobile}
                  helperText={errors.mobile}
                  icon={<PhoneIphoneRounded />}
                  autoComplete="tel"
                  inputProps={{ maxLength: 20 }}
                />

                <InputField
                  {...fieldProps}
                  label="Email Address (Optional)"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  helperText={errors.email}
                  icon={<EmailOutlined />}
                  autoComplete="email"
                  inputProps={{ maxLength: 150 }}
                />

                <InputField
                  {...fieldProps}
                  select
                  label="Select a Service *"
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  error={errors.service}
                  helperText={errors.service}
                  icon={<CameraAltOutlined />}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          bgcolor: "#17130F",
                          color: "#FFF8E8",
                          border: `1px solid ${alpha(GOLD, 0.25)}`,
                          "& .MuiMenuItem-root:hover": {
                            bgcolor: alpha(GOLD, 0.12),
                          },
                        },
                      },
                    },
                  }}
                >
                  {SERVICES.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </InputField>

                <InputField
                  {...fieldProps}
                  label="Tell Us More (Optional)"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  error={errors.message}
                  helperText={
                    errors.message ||
                    `${form.message.length}/1000 characters`
                  }
                  icon={<MessageOutlined />}
                  multiline
                  minRows={3}
                  maxRows={5}
                  inputProps={{ maxLength: 1000 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  endIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <WhatsApp />
                    )
                  }
                  sx={{
                    mt: 0.5,
                    minHeight: 49,
                    borderRadius: "13px",
                    textTransform: "none",
                    fontSize: "0.96rem",
                    fontWeight: 800,
                    color: MIDNIGHT,
                    background: `linear-gradient(120deg, ${LIGHT_GOLD}, ${GOLD})`,
                    boxShadow: `0 6px 24px ${alpha(GOLD, 0.15)}`,
                    "&:hover": {
                      background: `linear-gradient(120deg, ${GOLD}, ${LIGHT_GOLD})`,
                    },
                    "&.Mui-disabled": {
                      color: "#6B6250",
                      background: "#29251C",
                    },
                  }}
                >
                  {loading
                    ? "Saving Your Booking..."
                    : "Submit & Continue to WhatsApp"}
                </Button>

                <Typography
                  sx={{
                    textAlign: "center",
                    color: "#898171",
                    fontSize: "0.73rem",
                    lineHeight: 1.6,
                  }}
                >
                  Your booking details will be saved before WhatsApp opens.
                  You will need to press Send in WhatsApp.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
