import React, { useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLixu47H9HtywwLI50sZJYndM4nN7vu7Teyi7QbqoQjrWHjXO_2lf9ueIJfGrVYXX2Avdy9qQawcWZPHGJYqkLoUmAsPtLSalMAv_R5hoxMHXs0cGkn0xAv-VAEH8MC3vtHnn7hQVtF_0OWtuvSODmJliWGhCHXGuVE1juqSllxVUWmlplJsjezWVeclHpRMa_Y-h2ZvCFPHCdkfWYOs2LQs9Sf4baCn-zZ0d1ZLUG0bG7MBgwnsYE2_mr-_14d3RocYJje13gUZKjeCB9lHhudcBTnMB2rXhRj8w2Qq&lib=MDa2LEuS5fAlvUrBGznTW_9Txsk909hX6");
      const data = await res.json();
      const user = data.find(item => item.UserName === username && item.Password === password);

      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        navigate('/dashboard');
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{
        width:'100%',
        display:'flex',
        alignContent:'center',
        justifyContent:'center',
        padding:'110px 0',
      }}>
      <Box
        sx={{
          width: { xs: "70%", md: "380px" },
          margin: "auto",
          mt: 8,
          p: 4,
          background: "rgba(30, 30, 31, 0.85)",
          borderRadius: "25px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          sx={{ fontSize: "32px", fontWeight: "bold", textAlign: "center", mb: 3, color: "#FFD700" }}
        >
          Login
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputLabelProps={{ style: { color: "#bbb" } }}
          InputProps={{ style: { color: "white" } }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ style: { color: "#bbb" } }}
          InputProps={{ style: { color: "white" } }}
        />

        {error && <Typography color="error" mt={1}>{error}</Typography>}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, background: "linear-gradient(90deg, #FFD700, #FFB300, #FFC700, #FFEA00)", color: "black", fontWeight: "bold", py: 1.5, borderRadius: "12px", textTransform: "none", boxShadow: "0 4px 12px rgba(255,215,0,0.3)" }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : "Login"}
        </Button>
      </Box>
      </Box>
    </motion.div>
  );
}