import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import MobileNavbar from './MobileNavbar';
import CircleScrollIcon from './CircleScrollIcon';
import Home from './Home';
import Pricing from './Pricing';
import Features from './Features';
import Live from './Live';
import Login from './Login';
import LoginPage from './LoginPage';
import ContactUs from './ContactUs';
import DashboardNavbar from './DashboardNavbar';
import LoginImageGallery from './LoginImageGallery';
import Footer from './Footer';
import { useMediaQuery } from "@mui/material";
import { useQuery } from '@tanstack/react-query';



// Fetch API
const fetchData = async () => {
  const url =
    "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjCZKvcMAKMcSFu3uw6l-QsZfHa2AcL0EBb0Ee90fWujYGX0i0VyhKWlDGvjCoAoyRHCcn35BJ6PyLtFdVGaHfGrVURlCWBLHiPGw45nbQxLXeaKRRjNuASz3y1M-jCc3BR-7XvpGi0SDgDPgRplvJykVVxFlOgPEQNTYqO-PNSFPSQgl2ziR02b61S5JpHasW0jG8d8VCKYzdsyl5TLM0otFBx5zhOqQS0rt9Hk1dLl4wXZPXKnLCHlhMjnXuahSu_89UDsYDOB5r7HQxLv5Pb27O_zQ&lib=ME9LPB3JZtBZlz1PevbxUQfFnlO6455Uk";

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch data");

  return response.json();
};
// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.2, duration: 1 },
  },
};

  

function App() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const words = 'GOLDEN DREAMS'.split('');

  const location = useLocation();

  // Show Navbar ONLY on these pages
  const navbarPages = ["/", "/pricing", "/features", "/contact", "/live", "/login"];

  const showNavbar = navbarPages.includes(location.pathname);



  return (
    <div className="App">

      <Box 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        outline: 'none',
        border: 'none',
        boxSizing:'border-box',
        boxShadow: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(90deg,rgba(0, 0, 0, 1) 0%, rgba(50, 50, 51, 1) 50%, rgba(30, 30, 31, 1) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#fff',
        position: 'relative',
      }}>

        {/* Floating GOLDEN DREAMS Particles */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        {[...Array(40)].map((_, i) => {
          const char = words[Math.floor(Math.random() * words.length)];
          const randomDelay = Math.random() * 5;
          const randomDuration = 6 + Math.random() * 6;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                y: [0, -50 - Math.random() * 200],
                opacity: [0.2, 1, 0],
                scale: [1, 1.3, 1],
                x: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${14 + Math.random() * 20}px`,
                fontWeight: 700,
                color: 'gold',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                opacity: 0.8,
                pointerEvents: 'none', // prevent interaction
              }}
            >
              {char}
            </motion.div>
          );
        })}
      </Box>

        {/* Show navbar only when showNavbar = true */}
        {showNavbar && (
          isMobile ? <MobileNavbar /> : <Navbar />
        )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/live" element={<Live />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard should use its own navbar */}
        <Route
          path="/dashboard"
          element={
            <>
              <DashboardNavbar />
              <LoginPage />
              <LoginImageGallery/>

            </>
          }
        />
      </Routes>
      <Footer/>

      </Box>
      
      
    </div>
  );
}

export default App;
