import "./App.css";

import { useMemo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";

import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import Home from "./Home";
import Pricing from "./Pricing";
import Features from "./Features";
import Live from "./Live";
import Login from "./Login";
import ContactUs from "./ContactUs";

import DashboardNavbar from "./DashboardNavbar";
import LoginComponent from "./LoginComponent";
import LoginFooter from "./LoginFooter";
import Footer from "./Footer";

// Keep your existing API function if you use it elsewhere.
const fetchData = async () => {
  const url =
    "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjCZKvcMAKMcSFu3uw6l-QsZfHa2AcL0EBb0Ee90fWujYGX0i0VyhKWlDGvjCoAoyRHCcn35BJ6PyLtFdVGaHfGrVURlCWBLHiPGw45nbQxLXeaKRRjNuASz3y1M-jCc3BR-7XvpGi0SDgDPgRplvJykVVxFlOgPEQNTYqO-PNSFPSQgl2ziR02b61S5JpHasW0jG8d8VCKYzdsyl5TLM0otFBx5zhOqQS0rt9Hk1dLl4wXZPXKnLCHlhMjnXuahSu_89UDsYDOB5r7HQxLv5Pb27O_zQ&lib=ME9LPB3JZtBZlz1PevbxUQfFnlO6455Uk";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

/* =========================================================
   MIDNIGHT GOLD BACKGROUND ANIMATION
========================================================= */

function MidnightGoldAnimation() {
  // Random positions are generated only once per component mount.
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3.5,
        duration: 7 + Math.random() * 10,
        delay: Math.random() * 8,
        drift: 18 + Math.random() * 55,
        brightness: 0.35 + Math.random() * 0.65,
      })),
    []
  );

  const lightTrails = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: i,
        top: 18 + i * 31 + Math.random() * 12,
        duration: 14 + Math.random() * 8,
        delay: i * 5,
        width: 100 + Math.random() * 100,
      })),
    []
  );

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        background: `
          radial-gradient(
            ellipse at 50% 0%,
            rgba(116, 82, 12, 0.13) 0%,
            transparent 48%
          ),
          radial-gradient(
            ellipse at 90% 80%,
            rgba(184, 134, 11, 0.07) 0%,
            transparent 45%
          )
        `,
      }}
    >
      {/* Subtle ambient gold glow */}

      <motion.div
        animate={{
          opacity: [0.25, 0.55, 0.25],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: "min(70vw, 650px)",
          height: "min(70vw, 650px)",
          left: "50%",
          top: "38%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(218,165,32,0.09) 0%, rgba(184,134,11,0.035) 38%, transparent 70%)",
          filter: "blur(25px)",
        }}
      />

      {/* Floating golden dust */}

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0,
            scale: 0.4,
          }}
          animate={{
            y: [
              0,
              -particle.drift,
              -particle.drift * 0.4,
              0,
            ],
            x: [
              0,
              particle.drift * 0.25,
              -particle.drift * 0.2,
              0,
            ],
            opacity: [
              0.08,
              particle.brightness,
              0.2,
              particle.brightness * 0.8,
              0.08,
            ],
            scale: [0.6, 1.25, 0.85, 1.15, 0.6],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #fff9dc 0%, #ffd76a 38%, #b8860b 100%)",
            boxShadow: `
              0 0 5px rgba(255, 215, 0, 0.7),
              0 0 12px rgba(218, 165, 32, 0.32)
            `,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Slow-moving celestial light trails */}

      {lightTrails.map((trail) => (
        <motion.div
          key={`trail-${trail.id}`}
          initial={{
            x: "-30vw",
            opacity: 0,
          }}
          animate={{
            x: ["-30vw", "130vw"],
            opacity: [0, 0.5, 0.35, 0],
          }}
          transition={{
            duration: trail.duration,
            delay: trail.delay,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${trail.top}%`,
            left: 0,
            width: `${trail.width}px`,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,100,0.8), rgba(255,248,220,0.9), transparent)",
            boxShadow: "0 0 8px rgba(255, 215, 0, 0.35)",
            transform: "rotate(-18deg)",
            transformOrigin: "left center",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Occasional larger golden sparkles */}

      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={`sparkle-${i}`}
          animate={{
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.5, 0.5],
            rotate: [0, 45, 90],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: i * 1.7,
            repeat: Infinity,
            repeatDelay: 4 + i,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: `${12 + ((i * 17) % 76)}%`,
            left: `${8 + ((i * 19) % 84)}%`,
            width: "5px",
            height: "5px",
            background: "#ffe6a0",
            borderRadius: "50%",
            boxShadow:
              "0 0 8px 2px rgba(255, 215, 0, 0.65)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </Box>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const location = useLocation();

  // Public navigation pages.
  const navbarPages = [
    "/",
    "/pricing",
    "/features",
    "/contact",
    "/live",
    "/login",
  ];

  const showNavbar = navbarPages.includes(location.pathname);

  return (
    <div className="App">
      <Box
        sx={{
          position: "relative",
          isolation: "isolate",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #030303 0%, #0a0906 48%, #11100c 100%)",
        }}
      >
        {/* BACKGROUND MOTION */}

        <MidnightGoldAnimation />

        {/* ALL PAGE CONTENT STAYS ABOVE THE ANIMATION */}

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* PUBLIC NAVBAR */}

          {showNavbar &&
            (isMobile ? <MobileNavbar /> : <Navbar />)}

          {/* ROUTES */}

          <Box
            component="main"
            sx={{
              width: "100%",
              flex: "1 0 auto",
              position: "relative",
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/pricing"
                element={<Pricing />}
              />

              <Route
                path="/features"
                element={<Features />}
              />

              <Route
                path="/contact"
                element={<ContactUs />}
              />

              <Route
                path="/live"
                element={<Live />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/dashboard"
                element={
                  <>
                    <DashboardNavbar />
                    <LoginComponent />
                    <LoginFooter />
                  </>
                }
              />
            </Routes>
          </Box>

          {/* PUBLIC FOOTER: HIDDEN ON DASHBOARD */}

          {location.pathname !== "/dashboard" && (
            <Footer />
          )}
        </Box>
      </Box>
    </div>
  );
}

export default App;