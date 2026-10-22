
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

const GOLD = "#E8C66A";

const particles = [
  { left: "10%", top: "20%", delay: 0 },
  { left: "87%", top: "17%", delay: 1 },
  { left: "16%", top: "76%", delay: 0.5 },
  { left: "91%", top: "70%", delay: 1.5 },
  { left: "74%", top: "87%", delay: 0.8 },
  { left: "30%", top: "10%", delay: 1.3 },
  { left: "55%", top: "92%", delay: 0.3 },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://golden-dreams-api-proxy.titus-blaze.workers.dev/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to connect to the login service."
        );
      }

      if (result.success === true && result.token) {
        localStorage.setItem("sessionToken", result.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username.trim());

        navigate("/dashboard", { replace: true });
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      setError(
        err.message || "Connection failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Compact, transparent credential fields
  const fieldSx = {
    mt: 1.7,

    "& .MuiOutlinedInput-root": {
      color: "#FFF8E6",
      borderRadius: "11px",
      background: "rgba(255,255,255,0.018)",
      transition: "all 0.3s ease",

      "& fieldset": {
        borderColor: "rgba(232,198,106,0.17)",
      },

      "&:hover fieldset": {
        borderColor: "rgba(232,198,106,0.42)",
      },

      "&.Mui-focused": {
        background: "rgba(232,198,106,0.035)",
        boxShadow: "0 0 18px rgba(232,198,106,0.045)",
      },

      "&.Mui-focused fieldset": {
        borderColor: GOLD,
        borderWidth: "1px",
      },
    },

    "& .MuiInputLabel-root": {
      color: "rgba(255,248,230,0.52)",
      fontSize: 13,

      "&.Mui-focused": {
        color: GOLD,
      },
    },

    "& .MuiInputBase-input": {
      py: 1.35,
      fontSize: 13,
    },
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100svh",
        width: "100%",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        boxSizing: "border-box",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        px: 2,
        py: { xs: 5, sm: 6 },

        color: "#fff",

        background:
          "radial-gradient(ellipse at 50% 42%, #211C12 0%, #100E0B 43%, #050505 100%)",
      }}
    >
      {/* Soft golden ambient glow */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 280, sm: 420 },
          height: { xs: 280, sm: 420 },

          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(210,160,55,0.12), rgba(210,160,55,0.035) 48%, transparent 72%)",

          filter: "blur(20px)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      {/* Floating golden particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -15, 0],
            opacity: [0.15, 0.65, 0.15],
            scale: [0.8, 1.15, 0.8],
          }}
          transition={{
            duration: 4 + (i % 3),
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: particle.left,
            top: particle.top,

            width: i % 2 === 0 ? 4 : 3,
            height: i % 2 === 0 ? 4 : 3,

            borderRadius: "50%",
            background: GOLD,
            boxShadow: "0 0 10px rgba(232,198,106,0.7)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Delicate outer frame */}
      <Box
        sx={{
          position: "absolute",
          inset: { xs: 10, sm: 20 },

          border: "1px solid rgba(232,198,106,0.075)",
          borderRadius: { xs: "17px", sm: "25px" },

          pointerEvents: "none",
        }}
      />

      {/* Login entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          width: "100%",
          maxWidth: 360,
          zIndex: 2,
        }}
      >
        {/* Main transparent glass card */}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 360,
            mx: "auto",
            boxSizing: "border-box",
            overflow: "hidden",

            p: { xs: 2.5, sm: 3.2 },

            borderRadius: { xs: "20px", sm: "24px" },

            background:
              "linear-gradient(145deg, rgba(30,26,18,0.48), rgba(10,10,10,0.32))",

            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",

            border: "1px solid rgba(232,198,106,0.22)",

            boxShadow:
              "0 20px 55px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.07)",

            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "20%",
              width: "60%",
              height: "1px",

              background:
                "linear-gradient(90deg, transparent, rgba(255,225,155,0.65), transparent)",
            },
          }}
        >
          {/* Golden icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,

                mx: "auto",
                mb: 2,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: "17px",

                color: GOLD,

                background:
                  "linear-gradient(145deg, rgba(232,198,106,0.15), rgba(232,198,106,0.025))",

                border: "1px solid rgba(232,198,106,0.30)",

                boxShadow:
                  "0 0 25px rgba(232,198,106,0.07), inset 0 1px 0 rgba(255,255,255,0.09)",
              }}
            >
              <AutoAwesomeRoundedIcon sx={{ fontSize: 27 }} />
            </Box>
          </motion.div>

          {/* Heading */}
          <Typography
            component="h1"
            sx={{
              textAlign: "center",
              fontSize: { xs: 26, sm: 29 },
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: "0.3px",
              color: "#FFF7E3",
            }}
          >
            Welcome{" "}
            <Box
              component="span"
              sx={{
                background:
                  "linear-gradient(100deg, #FFF1B8 0%, #E8C66A 48%, #B88628 100%)",

                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Back
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              mb: 2.2,

              textAlign: "center",
              color: "rgba(255,248,230,0.53)",
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            Sign in to your Golden Dreams account
          </Typography>

          {/* Username field */}
          <TextField
            fullWidth
            size="small"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError("");
            }}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineRoundedIcon
                    sx={{
                      color: "rgba(232,198,106,0.72)",
                      fontSize: 19,
                    }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Password field */}
          <TextField
            fullWidth
            size="small"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    sx={{
                      color: "rgba(232,198,106,0.72)",
                      fontSize: 18,
                    }}
                  />
                </InputAdornment>
              ),

              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    edge="end"
                    size="small"
                    sx={{
                      color: "rgba(255,248,230,0.50)",

                      "&:hover": {
                        color: GOLD,
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOffRoundedIcon fontSize="small" />
                    ) : (
                      <VisibilityRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Typography
                role="alert"
                sx={{
                  mt: 1.5,
                  p: 1.1,

                  borderRadius: "10px",

                  fontSize: 11.5,
                  lineHeight: 1.5,
                  color: "#FFB4A9",

                  background: "rgba(255,75,75,0.06)",
                  border: "1px solid rgba(255,100,100,0.13)",
                }}
              >
                {error}
              </Typography>
            </motion.div>
          )}

          {/* Sign-in button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2.5,
              py: 1.25,

              borderRadius: "11px",

              color: "#171108",
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: "0.8px",
              textTransform: "uppercase",

              background:
                "linear-gradient(110deg, #B88728 0%, #FBE7A0 28%, #D8AE4E 60%, #A9761D 100%)",

              boxShadow:
                "0 7px 22px rgba(205,157,49,0.16), inset 0 1px 0 rgba(255,255,255,0.55)",

              transition: "transform 0.25s, box-shadow 0.25s",

              "&:hover": {
                background:
                  "linear-gradient(110deg, #D3A13C, #FFF0B2, #E4BF60)",

                boxShadow: "0 10px 28px rgba(205,157,49,0.24)",
                transform: "translateY(-1px)",
              },

              "&:active": {
                transform: "translateY(0)",
              },

              "&.Mui-disabled": {
                color: "rgba(20,15,5,0.65)",
                background:
                  "linear-gradient(110deg, #A98535, #D6BC72)",
              },
            }}
          >
            {loading ? (
              <CircularProgress
                size={21}
                sx={{ color: "#171108" }}
              />
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Brand signature */}
          <Box
            sx={{
              mt: 2.7,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Box
              sx={{
                height: "1px",
                width: 24,
                background:
                  "linear-gradient(90deg, transparent, rgba(232,198,106,0.45))",
              }}
            />

            <Typography
              sx={{
                color: "rgba(232,198,106,0.68)",
                fontSize: 9,
                letterSpacing: "2.5px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              GOLDEN DREAMS
            </Typography>

            <Box
              sx={{
                height: "1px",
                width: 24,
                background:
                  "linear-gradient(90deg, rgba(232,198,106,0.45), transparent)",
              }}
            />
          </Box>
        </Box>
      </motion.div>

      {/* Bottom caption */}
      <Typography
        sx={{
          position: "absolute",
          bottom: { xs: 17, sm: 24 },
          left: 0,
          right: 0,

          textAlign: "center",
          color: "rgba(255,255,255,0.30)",
          fontSize: 9,
          letterSpacing: "1.6px",
          px: 2,
        }}
      >
        EVERY FRAME TELLS A STORY
      </Typography>
    </Box>
  );
}
