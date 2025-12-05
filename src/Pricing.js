// Pricing.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


// ----------------------------------
// SLIDES
// ----------------------------------
const slides = [
  {
    id: "basic",
    title: "Basic Shoot",
    price: "Rs.50,000.00",
    desc: "Perfect for small indoor shoots and portraits. 1 hour session, basic retouching.",
    bg: "https://images.unsplash.com/photo-1519183071298-a2962be96dcd?q=80&w=1600&auto=format&fit=crop",
    sample: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
    accent: ["#FFD54F", "#FFB300"],
  },
  {
    id: "pro",
    title: "Professional",
    price: "Rs.1,00,000.00",
    desc: "Ideal for weddings, events, and outdoor sessions. 3 hour coverage + editing.",
    bg: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop",
    sample: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
    accent: ["#00E5FF", "#0077FF"],
  },
  {
    id: "cinematic",
    title: "Cinematic Premium",
    price: "2,00,000.00",
    desc: "High-end lighting, drone shots, and advanced editing. Full production crew.",
    bg: "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?q=80&w=1600&auto=format&fit=crop",
    sample: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    accent: ["#FF6B6B", "#FF3D00"],
  },
];

// ------------------------
// MOTION VARIANTS
// ------------------------
const bgVariants = {
  enter: { opacity: 0, scale: 1.05 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } },
};

// ===================================================
// MAIN COMPONENT
// ===================================================
export default function Pricing() {
  const [index, setIndex] = React.useState(0);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  // -----------------------
  // SLIDE CONTROLS
  // -----------------------
  const prev = () =>
    setIndex((s) => (s === 0 ? slides.length - 1 : s - 1));

  const next = () =>
    setIndex((s) => (s === slides.length - 1 ? 0 : s + 1));

  const current = slides[index];

  // -----------------------
  // SWIPE SUPPORT
  // -----------------------
  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // -----------------------
  // AUTOPLAY (every 5 seconds)
  // -----------------------
  React.useEffect(() => {
    const timer = setInterval(() => next(), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      {...handlers}
      component="section"
      sx={{
        width: "100%",
        minHeight: { xs: "120vh", md: "100vh" },
        position: "relative",
        overflow: "hidden",
        background: "#080808",
        px: { xs: 2, sm: 4, md: 8 },
        py: { xs: 6, md: 12 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
      }}
    >
      {/* BACKGROUND IMAGE WITH ANIMATION */}
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={current.bg}
          src={current.bg}
          variants={bgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.9 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.35) blur(2px)",
            zIndex: 0,
          }}
        />
      </AnimatePresence>

      {/* LEFT BUTTON */}
      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          left: { xs: 8, md: 100 },
          top: "50%",
          display:{xs:'none'},
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#FFD700",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* RIGHT BUTTON */}
      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          right: { xs: 8, md: 100 },
          top: "50%",
          display:{xs:'none'},
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#FFD700",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 3, md: 6 },
          alignItems: "center",
          zIndex: 3,
        }}
      >
        {/* SAMPLE IMAGE */}
        <motion.div
          key={current.sample}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.9 }}
          style={{
            flex: isMd ? "0 0 100%" : "0 0 46%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: { xs: "300px", sm: 420, md: 520 },
              height: { xs: 360, sm: 360, md: 420 },
              mx: "auto",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
            }}
          >
            {/* FIXED MOBILE IMAGE */}
            <motion.img
              src={current.sample}
              alt="sample"
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",

                clipPath: isSm
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(10% 5%, 100% 0%, 95% 100%, 5% 90%)",

                WebkitClipPath: isSm
                  ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                  : "polygon(10% 5%, 100% 0%, 95% 100%, 5% 90%)",

                transition: "clip-path 0.8s ease",
              }}
            />
          </Box>
        </motion.div>

        {/* RIGHT CONTENT */}
        <Box sx={{ flex: isMd ? "0 0 100%" : "0 0 46%" }}>
          <motion.div initial="hidden" animate="show" custom={0} variants={contentVariants}>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 44 },
                fontWeight: 900,
                color: "#fff",
              }}
            >
              {current.title}
            </Typography>
          </motion.div>

          <motion.div initial="hidden" animate="show" custom={1} variants={contentVariants}>
            <Typography sx={{ mx:{xs:50,md:0},color: "#e6e6e6", fontSize: { xs: 14, md: 16 },textWrap:'warp' }}>
              {current.desc}
            </Typography>
          </motion.div>

          <motion.div initial="hidden" animate="show" custom={2} variants={contentVariants}>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 48 },
                fontWeight: 900,
                background: `linear-gradient(90deg, ${current.accent[0]}, ${current.accent[1]})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
                mt: 1,
              }}
            >
              {current.price}
            </Typography>
          </motion.div>


        {/* Mobile Navigator Icon Button */}
          <Box sx={{
            display:{xs:'flex',md:'none'},
            justifyContent:'center',
            alignItems:'center',
            gap:'50px',
            padding:'30px 0'
          }}>
            {/* LEFT BUTTON */}
      <IconButton
        onClick={prev}
        sx={{
          
          bgcolor: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#FFD700",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>

      {/* RIGHT BUTTON */}
      <IconButton
        onClick={next}
        sx={{
          
          bgcolor: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#FFD700",
          "&:hover": { bgcolor: "rgba(0,0,0,0.9)" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
          </Box>

          {/* PRICING CARD */}
          <motion.div initial="hidden" animate="show" custom={3} variants={cardVariants}>
            <Box
              sx={{
                width:{xs:'300px',md:'550px'},
                mx:{xs:50, md:0},
                mt: 3,
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: 800 }}>
                What’s included
              </Typography>

              <Typography sx={{ color: "#ccc", mt: 1 }}>
                HD photos, color correction, online gallery, and 5 retouched images.
              </Typography>

              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: current.accent[0],
                    color: "#000",
                    fontWeight: 700,
                  }}
                >
                  Book Now
                </Button>

                <Button
                  variant="outlined"
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* DOTS */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 18, md: 32 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.5,
        }}
      >
        {slides.map((s, i) => (
          <Box
            key={s.id}
            onClick={() => setIndex(i)}
            sx={{
              width: i === index ? 18 : 8,
              height: 8,
              borderRadius: 8,
              cursor: "pointer",
              background:
                i === index
                  ? `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})`
                  : "rgba(255,255,255,0.3)",
              transition: "all 0.25s",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
