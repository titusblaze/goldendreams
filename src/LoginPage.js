import React, { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const DATA_API = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLixu47H9HtywwLI50sZJYndM4nN7vu7Teyi7QbqoQjrWHjXO_2lf9ueIJfGrVYXX2Avdy9qQawcWZPHGJYqkLoUmAsPtLSalMAv_R5hoxMHXs0cGkn0xAv-VAEH8MC3vtHnn7hQVtF_0OWtuvSODmJliWGhCHXGuVE1juqSllxVUWmlplJsjezWVeclHpRMa_Y-h2ZvCFPHCdkfWYOs2LQs9Sf4baCn-zZ0d1ZLUG0bG7MBgwnsYE2_mr-_14d3RocYJje13gUZKjeCB9lHhudcBTnMB2rXhRj8w2Qq&lib=MDa2LEuS5fAlvUrBGznTW_9Txsk909hX6"; // GET API

const LoginPage = () => {
  const [data, setData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username"); // Get logged-in username

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(DATA_API);
        const jsonData = await res.json();

        // Filter by logged-in username
        const filtered = jsonData.filter(item => item.UserName === username);
        setData(filtered);
      } catch (err) {
        console.error("Error fetching API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % data.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + data.length) % data.length);

  if (loading)
    return <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</Box>;

  if (data.length === 0)
    return <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>No images found</Box>;

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${data[currentSlide]?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      />
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          top: "50%",
          left: 20,
          transform: "translateY(-50%)",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
        }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          top: "50%",
          right: 20,
          transform: "translateY(-50%)",
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export default LoginPage;
