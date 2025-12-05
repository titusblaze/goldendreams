import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogContent, TextField, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";


// SAMPLE SLIDES (replace with your images & titles)
const slides = [
  {
    img: "https://plus.unsplash.com/premium_photo-1661391241585-6f866804a238?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZmVzc2lvbmFsJTIwcGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D",
    title: "Professional Photography",
    phone: "+919976149065",

  },
  {
    img: "https://media.istockphoto.com/id/801862134/photo/video-camera-operator-working-with-his-equipment.webp?a=1&b=1&s=612x612&w=0&k=20&c=wuQyM5kmWQYSSgIXwS2hGZ8AYB2pmwJQXUdG6sSPgwE=",
    title: "4K Cinematic Videography",
    phone: "+919976149065",
  },
  {
    img: "https://images.unsplash.com/photo-1541617050654-c85f22ad1aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRyb25lJTIwcGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D",
    title: "Drone Aerial Shots",
    phone: "+919976149065",
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1661456223098-132c67cde6a3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8d2VkZGluZyUyMGNlbGVicmF0aW9ufGVufDB8fDB8fHww",
    title: "Creative Wedding Highlights",
    phone: "+919976149065",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  //Whats app
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", mobile: "", mail: "", message: "" });
  ///

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  //Whats App
    const [formData, setFormData] = useState({
      name: "",
      mobile: "",
      mail: "",
      message: "",
    });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });

  setErrors({ ...errors, [e.target.name]: "" }); // remove error when user types
  };

  
  
    const sendWhatsApp = () => {
  let newErrors = {};

  if (!formData.name) newErrors.name = "Name is required";
  if (!formData.mobile) newErrors.mobile = "Mobile number is required";
  if (!formData.mail) newErrors.mail = "Email is required";
  if (!formData.message) newErrors.message = "Message cannot be empty";

  // If there are errors, stop submission
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Continue sending WhatsApp message
  const { name, mobile, mail, message } = formData;

  const url = `https://wa.me/919976149065?text=
Name: ${form.name}%0A
Mobile: ${form.mobile}%0A
Mail: ${form.mail}%0A
Message: ${form.message}`;

  window.open(url, "_blank");

  // Clear form
  setFormData({
    name: "",
    mobile: "",
    mail: "",
    message: "",
  });

  setOpen(false);
};

  ////whats app---end
  

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "300px", sm: "400px", md: "100vh" },
        position: "relative",
        overflow: "hidden",
        borderRadius: "0px",
      }}
    >
      {/* Slide */}
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{ height: "100%" }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${slides[current].img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        >
          {/* Dark Gradient for readability */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))",
            }}
          />

          {/* Title */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: "80px", md: "120px" },
              left: { xs: "15px", sm: "40px", md: "60px" },
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "22px", sm: "32px", md: "48px" },
                  fontWeight: "900",
                  color: "#FFD700",
                  textShadow: "0px 4px 15px rgba(0,0,0,0.8)",
                  maxWidth: "80%",
                }}
              >
                {slides[current].title}
              </Typography>
            </motion.div>
          </Box>

          {/* Book Now Button */}
          <Box
            sx={{
              position: "absolute",
              right: { xs: 50, sm: 30, md: 40 },
              bottom: { xs: 15, sm: 25, md: 40 },
              zIndex: 3,
            }}
          >
            <Button
              onClick={() => setOpen(true)}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#FFB300,#FF8C00)",
                fontWeight: "bold",
                px: 3,
                py: 1,
                borderRadius: "12px",
                fontSize: { xs: "14px", md: "18px" },
                boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
                ":hover": {
                  background: "linear-gradient(90deg,#FFC107,#FF9800)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Book Now
            </Button>
            <Button
              onClick={() => window.open(`tel:${slides[current].phone}`)}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg,#FFB300,#FF8C00)",
                fontWeight: "bold",
                ml:3,
                px: 3,
                py: 1,
                borderRadius: "12px",
                fontSize: { xs: "14px", md: "18px" },
                boxShadow: "0px 4px 15px rgba(0,0,0,0.5)",
                ":hover": {
                  background: "linear-gradient(90deg,#FFC107,#FF9800)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Call Now
            </Button>
          </Box>

          {/* Prev Button */}
          <IconButton
            onClick={prevSlide}
            sx={{
              position: "absolute",
              top: "50%",
              left: 10,
              transform: "translateY(-50%)",
              color: "white",
              zIndex: 3,
              bgcolor: "rgba(0,0,0,0.4)",
              ":hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          {/* Next Button */}
          <IconButton
            onClick={nextSlide}
            sx={{
              position: "absolute",
              top: "50%",
              right: 10,
              transform: "translateY(-50%)",
              color: "white",
              zIndex: 3,
              bgcolor: "rgba(0,0,0,0.4)",
              ":hover": { bgcolor: "rgba(0,0,0,0.6)" },
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </motion.div>
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
      value={formData.name}
      onChange={handleChange}
      error={Boolean(errors.name)}
      helperText={errors.name}
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
      value={formData.mobile}
      onChange={handleChange}
      error={Boolean(errors.mobile)}
      helperText={errors.mobile}
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
      value={formData.mail}
      onChange={handleChange}
      error={Boolean(errors.mail)}
      helperText={errors.mail}
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
      value={formData.message}
      onChange={handleChange}
      error={Boolean(errors.message)}
      helperText={errors.message}
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