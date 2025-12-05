/* --- FINAL CONTACT US PAGE (GLASS UI + SOLID BUTTONS) --- */

import React, { useState } from 'react';
import {
  Avatar, Box, Button, CircularProgress, IconButton,
  TextField, Typography
} from '@mui/material';

import PhoneIcon from '@mui/icons-material/Phone';
import MailIcon from '@mui/icons-material/Mail';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareIcon from '@mui/icons-material/Share';
import { useQuery } from '@tanstack/react-query';
import emailjs from 'emailjs-com';
import { motion } from "framer-motion";
import Logo from "./logo.svg"; // <-- your logo
import "./App.css";

// Fetch API
const fetchData = async () => {
  const url =
    "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjCZKvcMAKMcSFu3uw6l-QsZfHa2AcL0EBb0Ee90fWujYGX0i0VyhKWlDGvjCoAoyRHCcn35BJ6PyLtFdVGaHfGrVURlCWBLHiPGw45nbQxLXeaKRRjNuASz3y1M-jCc3BR-7XvpGi0SDgDPgRplvJykVVxFlOgPEQNTYqO-PNSFPSQgl2ziR02b61S5JpHasW0jG8d8VCKYzdsyl5TLM0otFBx5zhOqQS0rt9Hk1dLl4wXZPXKnLCHlhMjnXuahSu_89UDsYDOB5r7HQxLv5Pb27O_zQ&lib=ME9LPB3JZtBZlz1PevbxUQfFnlO6455Uk";

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch data");

  return response.json();
};

const SERVICE_ID = 'your_service_id';
const TEMPLATE_ID = 'your_template_id';
const PUBLIC_KEY = 'your_public_key';

function ContactUs() {

  const { data = [] } = useQuery({
    queryKey: ['goldendreams'],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5,
  });

  const persons = data.filter((item) => item.Id === 9);
  const branches = data.filter((item) => item.Id === 10);
  const filteredItem = data.find((item) => item.Id === 12);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Message from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nMobile: ${formData.mobile}\nEmail: ${formData.email}\nMessage: ${formData.message}`
    );

    window.location.href = `mailto:${filteredItem?.Email}?subject=${subject}&body=${body}`;

    emailjs.send(SERVICE_ID, TEMPLATE_ID, formData, PUBLIC_KEY)
      .then(() => alert("Email sent successfully!"));
  };

  const sendWhatsApp = () => {
    const message = `Name: ${formData.name}\nPhone: ${formData.mobile}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
    const phone = `+91${filteredItem?.Phone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShare = async (data) => {
    const message = `
🏢 ${data.LabelText}
📝 ${data.LabelText1}
📞 +91 ${data.Phone}
📧 ${data.Email}
📍 ${data.LabelText2}
🌐 ${data.Location}
    `;

    if (!navigator.share) return alert("Sharing not supported");
    await navigator.share({ title: data.LabelText, text: message });
  };

  // Logo Loader Progress
    const { dataprogress = [], isLoading, error } = useQuery({
        queryKey: ['Golden Dreams'],
        queryFn: fetchData,
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
      });
     if (isLoading) {
          return (
            <Box
                  sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    //bgcolor: "#0d0d0d",
                  }}
                >
                  <motion.img
                    src={Logo}
                    alt="Loading..."
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: "20px",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Box>
          );
        }
      
        if (error) {
          return (
            <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography color="error">Failed to fetch data.</Typography>
      </Box>
          );
        }

  return (
    <Box sx={{
      width:'100%',
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      //px: { xs: 2, sm: 4 },
      pt: { xs: 10, md: 14 },
      //pb: 10,
      color: "white"
    }}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography className="gradient-text"
          sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: "bold", textAlign: "center" }}>
          Contact Us
        </Typography>
      </motion.div>

      {/* Person Cards */}
      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems:'center',
        justifyContent: "center",
        gap: 3,
        padding:'50px 0',
      }}>
        {persons.map((data, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }}>
            <Box sx={{
              width: { xs: "80%", sm: "250px" },
              maxWidth: 500,
              mx: 'auto',
              background: "rgba(38,38,39,0.65)",
              borderRadius: "20px",
              padding: "25px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "relative"
            }}>
              <Avatar src={data.link} sx={{ width: 130, height: 130, margin: "auto" }} />
              <Typography className="gradient-text" sx={{ fontSize: 22, fontWeight: 700, mt: 2 }}>
                {data.LabelText}
              </Typography>
              <Typography sx={{ color: "#ccc" }}>{data.LabelText1}</Typography>
              <Typography sx={{ color: "#ccc" }}>{data.LabelText2}</Typography>

              <Typography sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                <PhoneIcon /> +91 {data.Phone}
              </Typography>

              <Typography sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <MailIcon /> {data.Email}
              </Typography>

              <Button variant="contained"
                href={`tel:+91${data.Phone}`}
                sx={{
                  mt: 2,
                  bgcolor: "#FFD700",
                  "&:hover": { bgcolor: "#fae880ff" },
                  textTransform: "none",
                  borderRadius: "10px"
                }}>
                Call Now
              </Button>
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Branch Section */}
      <Typography className="gradient-text"
        sx={{ mt: 10, fontSize: { xs: 24, md: 35 }, fontWeight: 700 }}>
        Branch Contact Details
      </Typography>

      <Box sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems:'center',
        justifyContent: "center",
        gap: 3,
        padding:'50px 0',
        
      }}>
        {branches.map((data, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }}>
            <Box sx={{
              width: { xs: "75%", sm: "430px" },
              maxWidth: 500,
              mx: 'auto',
              background: "rgba(38,38,39,0.65)",
              borderRadius: "20px",
              padding: "25px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              position: "relative"
            }}>

              <IconButton onClick={() => handleShare(data)}
                sx={{ position: "absolute", top: 10, right: 10, color: "#FFD700" }}>
                <ShareIcon />
              </IconButton>

              <Typography className="gradient-text" sx={{ fontSize: 22, fontWeight: 700 }}>
                {data.LabelText}
              </Typography>

              <Typography sx={{ color: "#ccc", mb: 1 }}>{data.LabelText1}</Typography>

              <Button href={`tel:+91${data.Phone}`} sx={{ color: "#FFD700", textTransform: "none" }}>
                <PhoneIcon /> +91 {data.Phone}
              </Button>

              <Button href={`mailto:${data.Email}`} sx={{ color: "#FFD700", textTransform: "none" }}>
                <MailIcon /> {data.Email}
              </Button>

              <Button href={data.Location} target="_blank" sx={{ color: "#FFD700", textTransform: "none" }}>
                <LocationOnIcon /> {data.LabelText2}
              </Button>

            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Contact Form */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{
          width: { xs: "75%", sm: "350px" },
          maxWidth: 500,
          mx: 'auto',
          p: 3,
          background: "rgba(30,30,31,0.65)",
          borderRadius: "25px",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.4)"
        }}>

          <Typography className="gradient-text"
            sx={{ fontSize: 30, fontWeight: 700, textAlign: "center", mb: 2 }}>
            Contact Form
          </Typography>

          <form onSubmit={sendEmail}>
            <TextField fullWidth margin="normal" label="Name"
              name="name" value={formData.name} onChange={handleChange}
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }} />

            <TextField fullWidth margin="normal" label="Phone Number"
              name="mobile" value={formData.mobile} onChange={handleChange}
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }} />

            <TextField fullWidth margin="normal" label="Email"
              name="email" value={formData.email} onChange={handleChange}
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }} />

            <TextField fullWidth margin="normal" label="Message"
              name="message" multiline rows={4}
              value={formData.message} onChange={handleChange}
              InputLabelProps={{ style: { color: "#bbb" } }}
              InputProps={{ style: { color: "#fff" } }} />

            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 3
            }}>

              {/* Solid Modern Button */}
              <Button type="submit" variant="contained"
                sx={{
                  bgcolor: "#1E88E5",
                  "&:hover": { bgcolor: "#1565C0" },
                  color: "#fff",
                  fontWeight: 600,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none"
                }}>
                Send <MailIcon sx={{ ml: 1 }} />
              </Button>

              <Button onClick={sendWhatsApp}
                sx={{
                  bgcolor: "#00A859",
                  "&:hover": { bgcolor: "#008F4A" },
                  color: "#fff",
                  fontWeight: 600,
                  px: 3,
                  borderRadius: "12px",
                  textTransform: "none"
                }}>
                WhatsApp <WhatsAppIcon sx={{ ml: 1 }} />
              </Button>

            </Box>
          </form>

        </Box>
      </motion.div>
    </Box>
  );
}

export default ContactUs;
