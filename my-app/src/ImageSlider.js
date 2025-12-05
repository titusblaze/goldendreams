import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogContent, TextField, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";

// SAMPLE BANNERS
const slides = [
  {
    id: 1,
    img: "https://images.pexels.com/photos/313707/pexels-photo-313707.jpeg",
    title: "Professional Photography",
    phone: "+919976149065",
  },
  {
    id: 2,
    img: "https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg",
    title: "Wedding Shoot Experts",
    phone: "+919976149065",
  },
  {
    id: 3,
    img: "https://images.pexels.com/photos/1704508/pexels-photo-1704508.jpeg",
    title: "Cinematic Videography",
    phone: "+919976149065",
  },
];

export default function ImageSlider() {
  const [current, setCurrent] = useState(0);
  //Whats app
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", mail: "", message: "" });
///
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  // AUTO SLIDE CHANGE
useEffect(() => {
  const interval = setInterval(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, 4000); // 4 seconds

  return () => clearInterval(interval);
}, []);

  
//Whats App
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    mail: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const sendWhatsApp = () => {
  const { name, mobile, mail, message } = formData;

  const url = `https://wa.me/919976149065?text=
    Name: ${form.name}%0A
    Mobile: ${form.mobile}%0A
    Mail: ${form.mail}%0A
    Message: ${form.message}`;

      window.open(url, "_blank");

      // CLEAR FORM AFTER SEND
      setFormData({
        name: "",
        mobile: "",
        mail: "",
        message: "",
      });

      // CLOSE DIALOG
      setOpen(false);
    };


  return (
    <Box sx={{ width: "100%", position: "relative", overflow: "hidden" }}>
      {/* SLIDE */}
      <motion.div
  key={current}
  initial={{ opacity: 0, scale: 1.1 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8 }}
>
  <Box
    sx={{
      width: "100%",
      height: { xs: "250px", sm: "400px", md: "650px" },
      backgroundImage: `url(${slides[current].img})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "flex-end",
      p: 3,
    }}
  >

    {/* 🔥 DARK GRADIENT OVERLAY */}
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.6))",
        zIndex: 1,
      }}
    />

    {/* TEXT + BUTTONS */}
    <Box sx={{ position: "relative", zIndex: 2, color: "#FFD700", maxWidth: "80%" }}>
      <Typography
        sx={{
          fontSize: { xs: "24px", md: "40px" },
          fontWeight: "bold",
          textShadow: "0px 2px 10px rgba(0,0,0,0.7)", // clearer on bright bg
        }}
      >
        {slides[current].title}
      </Typography>

      <Button
        variant="contained"
        onClick={() => window.open(`tel:${slides[current].phone}`)}
        sx={{ ml: { xs: 2, md: 2 }, background: "#ff9800" }}
      >
        Call Now
      </Button>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ ml: { xs: 2, md: 2 }, background: "#00bcd4" }}
      >
        Book Now
      </Button>
    </Box>
  </Box>
</motion.div>


      {/* NAV BUTTONS */}
      <Button
        onClick={prevSlide}
        sx={{ position: "absolute", top: "50%", left: {xs:0,sm:0,md:20}, color: "white", fontSize: "20px" }}
      >
        ◀
      </Button>

      <Button
        onClick={nextSlide}
        sx={{ position: "absolute", top: "50%", right:  {xs:0,sm:0,md:20}, color: "white", fontSize: "20px" }}
      >
        ▶
      </Button>

      {/* BOOK NOW DIALOG */}
      <Dialog
  open={open}
  onClose={() => setOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: "25px",
      background: "rgba(15, 15, 15, 0.65)",
      boxShadow: "0 0 25px rgba(255, 215, 0, 0.25)",
      backdropFilter: "blur(12px)",
      border: "1.5px solid rgba(255,215,0,0.4)",
    },
  }}
>
  <DialogContent sx={{ position: "relative", p: 4 }}>
    {/* Close Button */}
    <IconButton
      onClick={() => setOpen(false)}
      sx={{
        position: "absolute",
        right: 15,
        top: 15,
        color: "#FFD700",
        "&:hover": {
          transform: "scale(1.2)",
          transition: "0.2s",
        },
      }}
    >
      <CloseIcon />
    </IconButton>

    {/* Title */}
    <Typography
      sx={{
        fontSize: "26px",
        fontWeight: 900,
        mb: 3,
        textAlign: "center",
        letterSpacing: "1px",
        background: "linear-gradient(90deg, #FFD700, #FFB300, #FFE066)",
        WebkitBackgroundClip: "text",
        color: "transparent",
        textTransform: "uppercase",
      }}
    >
      Booking Form
    </Typography>

    {/* INPUT FIELDS */}
    <TextField
      label="Name"
      name="name"
      fullWidth
      onChange={handleChange}
      sx={{
        mb: 2,
        "& .MuiInputBase-root": {
          borderRadius: "12px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
        },
        "& .MuiInputBase-input": {
          color: "#FFD700",
        },
        "& label": { color: "#FFD700" },
        "& fieldset": { borderColor: "rgba(255,215,0,0.4)" },
      }}
    />

    <TextField
      label="Mobile"
      name="mobile"
      fullWidth
      onChange={handleChange}
      sx={{
        mb: 2,
        "& .MuiInputBase-root": {
          borderRadius: "12px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
        },
        "& .MuiInputBase-input": {
          color: "#FFD700",
        },
        "& label": { color: "#FFD700" },
        "& fieldset": { borderColor: "rgba(255,215,0,0.4)" },
      }}
    />

    <TextField
      label="Mail"
      name="mail"
      fullWidth
      onChange={handleChange}
      sx={{
        mb: 2,
        "& .MuiInputBase-root": {
          borderRadius: "12px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
        },
        "& .MuiInputBase-input": {
          color: "#FFD700",
        },
        "& label": { color: "#FFD700" },
        "& fieldset": { borderColor: "rgba(255,215,0,0.4)" },
      }}
    />

    <TextField
      label="Message"
      name="message"
      fullWidth
      multiline
      rows={3}
      onChange={handleChange}
      sx={{
        mb: 2,
        "& .MuiInputBase-root": {
          borderRadius: "12px",
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(6px)",
        },
        "& .MuiInputBase-input": {
          color: "#FFD700",
        },
        "& label": { color: "#FFD700" },
        "& fieldset": { borderColor: "rgba(255,215,0,0.4)" },
      }}
    />

    {/* WHATSAPP BUTTON */}
    <Box sx={{ mt: 1 }}>
      <Box
        onClick={sendWhatsApp}
        sx={{
          width: "100%",
          cursor: "pointer",
          py: 1.5,
          borderRadius: "15px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          background: "linear-gradient(90deg, #25D366, #128C4A)",
          color: "white",
          boxShadow: "0 0 12px rgba(37, 211, 102, 0.6)",
          transition: "0.4s",
          "&:hover": {
            boxShadow: "0 0 25px rgba(37, 211, 102, 1)",
            transform: "scale(1.03)",
          },
        }}
      >
        Send via WhatsApp
      </Box>
    </Box>
  </DialogContent>
</Dialog>

    </Box>
  );
}