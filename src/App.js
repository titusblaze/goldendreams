import "./App.css";

import { useMemo, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { App as CapacitorApp } from "@capacitor/app";
import { Box, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import SplashScreen from "./SplashScreen";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import Home from "./Home";
import Pricing from "./Pricing";
import Features from "./Features";
import Live from "./Live";
import Login from "./Login";
import ContactUs from "./ContactUs";
import ScrollToTop from "./ScrollToTop";
import DashboardNavbar from "./DashboardNavbar";
import LoginComponent from "./LoginComponent";
import LoginFooter from "./LoginFooter";
import Footer from "./Footer";
import LearnMore from "./LearnMore";
import Store from "./Store/Store";

/* =========================================================
   SESSION CHECK
========================================================= */

function hasValidLocalSession() {
  return (
    localStorage.getItem("isLoggedIn") === "true" &&
    Boolean(localStorage.getItem("sessionToken"))
  );
}

/* =========================================================
   PROTECTED DASHBOARD ROUTE
========================================================= */

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => hasValidLocalSession()
  );

  useEffect(() => {
    const checkSession = () => {
      setIsAuthenticated(hasValidLocalSession());
    };

    window.addEventListener("pageshow", checkSession);
    window.addEventListener("storage", checkSession);

    window.addEventListener(
      "golden-dreams-logout",
      checkSession
    );

    document.addEventListener(
      "visibilitychange",
      checkSession
    );

    checkSession();

    return () => {
      window.removeEventListener("pageshow", checkSession);
      window.removeEventListener("storage", checkSession);

      window.removeEventListener(
        "golden-dreams-logout",
        checkSession
      );

      document.removeEventListener(
        "visibilitychange",
        checkSession
      );
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================================
   MIDNIGHT GOLD BACKGROUND ANIMATION
   PRESERVED FOR ALL PAGES
========================================================= */

function MidnightGoldAnimation() {
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 3.5,
        duration: 7 + Math.random() * 10,
        delay: Math.random() * 8,
        drift: 28 + Math.random() * 55,
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
  const navigate = useNavigate();

  const [showSplash, setShowSplash] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  /* =========================================================
     SINGLE DASHBOARD SESSION MONITOR
     1 HOUR INACTIVITY - GOOGLE SHEETS STATUS VIA WORKER
  ========================================================= */

  useEffect(() => {
    if (location.pathname !== "/dashboard" || !hasValidLocalSession()) {
      return undefined;
    }

    const token =
      localStorage.getItem("sessionToken") ||
      sessionStorage.getItem("sessionToken");

    if (!token) return undefined;

    const WORKER_URL =
      "https://golden-dreams-api-proxy.titus-blaze.workers.dev";
    const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
    const HEARTBEAT_INTERVAL_MS = 30 * 1000;
    const CHECK_INTERVAL_MS = 15 * 1000;

    let lastActivityAt = 0;
    let lastHeartbeatAt = 0;
    let disposed = false;
    let checkInterval = null;
    let expiryStarted = false;

    const clearLocalSession = () => {
      [
        "sessionToken",
        "isLoggedIn",
        "username",
        "userName",
        "UserName",
        "goldenDreamsUserName",
      ].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      window.dispatchEvent(new Event("golden-dreams-logout"));
    };

    const sendWorkerRequest = async (path) => {
      const response = await fetch(`${WORKER_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        // Keep an empty response object if the service returns invalid JSON.
      }

      return { response, result };
    };

    const expireSession = async () => {
      if (expiryStarted || disposed) return;
      expiryStarted = true;

      try {
        await sendWorkerRequest("/expire");
      } catch (error) {
        console.warn("Session expiry update will be retried by the server:", error);
      } finally {
        clearLocalSession();
        navigate("/login", { replace: true });
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    const checkIdleTime = () => {
      if (
        lastActivityAt &&
        Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS
      ) {
        expireSession();
      }
    };

    const markActivity = () => {
      if (!lastActivityAt || expiryStarted) return;

      // Do not allow an event after the one-hour deadline to revive the session.
      if (Date.now() - lastActivityAt >= IDLE_TIMEOUT_MS) {
        expireSession();
        return;
      }

      lastActivityAt = Date.now();

      // Send a lightweight heartbeat at most once every 30 seconds.
      if (Date.now() - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatAt = Date.now();

        sendWorkerRequest("/activity")
          .then(({ response, result }) => {
            if (!response.ok || result.success !== true) {
              if (response.status === 401 || result.expired === true) {
                expireSession();
              }
            }
          })
          .catch((error) => {
            console.warn("Session heartbeat failed:", error);
          });
      }
    };

    const initializeSessionMonitor = async () => {
      try {
        const { response, result } = await sendWorkerRequest("/session");

        if (!response.ok || result.success !== true) {
          clearLocalSession();
          navigate("/login", { replace: true });
          return;
        }

        if (disposed) return;

        lastActivityAt = Number(result.lastActivityAt) * 1000;

        if (!Number.isFinite(lastActivityAt) || lastActivityAt <= 0) {
          await expireSession();
          return;
        }

        lastHeartbeatAt = Date.now();
        checkIdleTime();

        if (!expiryStarted) {
          checkInterval = window.setInterval(
            checkIdleTime,
            CHECK_INTERVAL_MS
          );
        }
      } catch (error) {
        console.error("Unable to validate the dashboard session:", error);
        // Fail closed: do not leave a dashboard session active if it cannot
        // be validated against the session service.
        clearLocalSession();
        navigate("/login", { replace: true });
      }
    };

    const activityEvents = [
      "pointerdown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    initializeSessionMonitor();

    return () => {
      disposed = true;
      if (checkInterval) window.clearInterval(checkInterval);

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
    };
  }, [location.pathname, navigate]);


  /* =========================================================
     SPLASH SCREEN
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

    /* =========================================================
     GLOBAL PULL TO REFRESH
     MIDNIGHT GOLDEN GLOW
  ========================================================= */

  useEffect(() => {
    let startY = 0;
    let isPulling = false;
    let shouldRefresh = false;
    let refreshTimer;

    const REFRESH_THRESHOLD = 85;

    const getScrollTop = () => {
      return Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      );
    };

    const isModalOpen = () =>
      Boolean(
        document.querySelector(
          '[role="dialog"], .MuiModal-root, .MuiPopover-root'
        )
      );

    const handleTouchStart = (event) => {
      const target =
        event.target instanceof Element ? event.target : null;

      if (
        isRefreshing ||
        getScrollTop() > 0 ||
        isModalOpen() ||
        event.touches.length !== 1 ||
        target?.closest(
          'input, textarea, select, iframe, [role="dialog"], .MuiModal-root'
        )
      ) {
        isPulling = false;
        shouldRefresh = false;
        return;
      }

      startY = event.touches[0].clientY;
      isPulling = true;
      shouldRefresh = false;

      setPullProgress(0);
    };

    const handleTouchMove = (event) => {
      if (
        !isPulling ||
        isRefreshing ||
        isModalOpen() ||
        event.touches.length !== 1
      ) {
        return;
      }

      const currentY = event.touches[0].clientY;
      const distance = currentY - startY;

      if (distance <= 0) {
        setPullProgress(0);
        shouldRefresh = false;
        return;
      }

      if (getScrollTop() <= 0) {
        if (event.cancelable) {
          event.preventDefault();
        }

        // Pull indicator progress (85px threshold)
        setPullProgress(
          Math.min(distance / REFRESH_THRESHOLD, 1)
        );

        // Refresh threshold
        shouldRefresh = distance >= REFRESH_THRESHOLD;
      }
    };

    const handleTouchEnd = () => {
      if (shouldRefresh && isPulling && !isRefreshing) {
        setPullProgress(1);
        setIsRefreshing(true);

        // Show Splash Screen before refreshing
        setShowSplash(true);

        // Reload the current page
        refreshTimer = setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setPullProgress(0);
      }

      isPulling = false;
      shouldRefresh = false;
      startY = 0;
    };

    const handleTouchCancel = () => {
      isPulling = false;
      shouldRefresh = false;
      startY = 0;

      if (!isRefreshing) {
        setPullProgress(0);
      }
    };

    // Touch event listeners
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });

    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });

    document.addEventListener("touchend", handleTouchEnd, {
      capture: true,
    });

    document.addEventListener("touchcancel", handleTouchCancel, {
      capture: true,
    });

    // Cleanup
    return () => {
      clearTimeout(refreshTimer);

      document.removeEventListener(
        "touchstart",
        handleTouchStart,
        true
      );

      document.removeEventListener(
        "touchmove",
        handleTouchMove,
        true
      );

      document.removeEventListener(
        "touchend",
        handleTouchEnd,
        true
      );

      document.removeEventListener(
        "touchcancel",
        handleTouchCancel,
        true
      );
    };
  }, [isRefreshing]);


  /* =========================================================
     MOBILE HORIZONTAL SWIPE NAVIGATION
     PUBLIC PAGES ONLY
  ========================================================= */

  useEffect(() => {
    const pages = [
      "/",
      "/pricing",
      "/features",
      "/contact",
      "/store",
      "/live",
      "/login",
    ];

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    let tracking = false;
    let horizontalSwipe = false;

    const SWIPE_THRESHOLD = 75;
    const VERTICAL_LIMIT = 60;

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) {
        tracking = false;
        return;
      }

      const target =
        event.target instanceof Element ? event.target : null;

      if (
        !target ||
        target.closest(
          'button, a, input, textarea, select, [role="button"], [role="link"], nav, [data-no-swipe]'
        )
      ) {
        tracking = false;
        return;
      }

      if (
        location.pathname === "/dashboard" ||
        !pages.includes(location.pathname)
      ) {
        tracking = false;
        return;
      }

      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      endX = startX;
      endY = startY;

      tracking = true;
      horizontalSwipe = false;
    };

    const handleTouchMove = (event) => {
      if (!tracking || event.touches.length !== 1) return;

      endX = event.touches[0].clientX;
      endY = event.touches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (Math.abs(deltaY) > VERTICAL_LIMIT &&
          Math.abs(deltaY) > Math.abs(deltaX)) {
        tracking = false;
        return;
      }

      if (Math.abs(deltaX) > 15 &&
          Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        horizontalSwipe = true;
      }
    };

    const handleTouchEnd = () => {
      if (!tracking || !horizontalSwipe) {
        tracking = false;
        return;
      }

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (
        Math.abs(deltaX) >= SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.3
      ) {
        const currentIndex = pages.indexOf(location.pathname);

        if (currentIndex !== -1) {
          if (deltaX < 0 && currentIndex < pages.length - 1) {
            navigate(pages[currentIndex + 1]);
          } else if (deltaX > 0 && currentIndex > 0) {
            navigate(pages[currentIndex - 1]);
          }
        }
      }

      tracking = false;
      horizontalSwipe = false;
    };

    const handleTouchCancel = () => {
      tracking = false;
      horizontalSwipe = false;
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      capture: true,
    });

    document.addEventListener("touchmove", handleTouchMove, {
      passive: true,
      capture: true,
    });

    document.addEventListener("touchend", handleTouchEnd, {
      passive: true,
      capture: true,
    });

    document.addEventListener("touchcancel", handleTouchCancel, {
      passive: true,
      capture: true,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("touchend", handleTouchEnd, true);
      document.removeEventListener("touchcancel", handleTouchCancel, true);
    };
  }, [location.pathname, navigate]);


    /* =========================================================
     ANDROID BACK BUTTON HANDLING
  ========================================================= */

  useEffect(() => {
    let backButtonListener;
    let isMounted = true;

    const setupBackButton = async () => {
      const listener = await CapacitorApp.addListener(
        "backButton",
        ({ canGoBack }) => {
          const historyIndex = window.history.state?.idx;

          if (
            typeof historyIndex === "number" &&
            historyIndex > 0
          ) {
            navigate(-1);
          } else if (canGoBack) {
            window.history.back();
          } else {
            CapacitorApp.exitApp();
          }
        }
      );

      if (isMounted) {
        backButtonListener = listener;
      } else {
        listener.remove();
      }
    };

    setupBackButton();

    return () => {
      isMounted = false;
      backButtonListener?.remove();
    };
  }, [navigate]);

  /* =========================================================
     NAVBAR CONFIGURATION
  ========================================================= */

  const navbarPages = [
    "/",
    "/pricing",
    "/features",
    "/contact",
    "/store",
    "/live",
    "/login",
  ];

  const showNavbar = navbarPages.includes(location.pathname);

  /* =========================================================
     APP RETURN
  ========================================================= */

  return (
    <div className="App">

      {/* TOP-ONLY PULL TO REFRESH GOLDEN GLOW */}

      {(pullProgress > 0 || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "28px",
            zIndex: 99999,
            pointerEvents: "none",
            overflow: "hidden",
            background:
              "radial-gradient(ellipse at top, rgba(218,165,32,0.25), transparent 75%)",
          }}
        >
          <motion.div
            animate={{
              scaleX: isRefreshing ? 1 : pullProgress,
              opacity: isRefreshing ? 1 : 0.4 + pullProgress * 0.6,
            }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "3px",
              transformOrigin: "left",
              background:
                "linear-gradient(90deg, transparent, #B8860B, #FFE6A0, #D4AF37, transparent)",
              boxShadow:
                "0 0 8px #D4AF37, 0 0 18px rgba(255,215,0,0.7)",
            }}
          />
        </motion.div>
      )}

      {/* SPLASH SCREEN */}

      {showSplash && <SplashScreen />}

      {/* APP BACKGROUND */}

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

        {/* EXISTING MIDNIGHT GOLD BACKGROUND ANIMATION */}

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
            <ScrollToTop />

            <Routes>

              {/* PUBLIC PAGES */}

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
                path="/store"
                element={<Store />}
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
                path="/learn-more"
                element={<LearnMore />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              {/* PROTECTED DASHBOARD */}

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <>
                      <DashboardNavbar />
                      <LoginComponent />
                      <LoginFooter />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* UNKNOWN URLS RETURN TO HOME */}

              <Route
                path="*"
                element={<Navigate to="/" replace />}
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