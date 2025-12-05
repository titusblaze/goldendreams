import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Logo from '../src/assets/image/logo512.png';
import LogoutIcon from '@mui/icons-material/Logout';

export default function DashboardNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0.0)",
        color: "black",
        zIndex: 9999,
        padding:'20px 0px'
      }}
    >
      <Toolbar>
        
        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <img
            src={Logo}
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              marginRight: 10,
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            Goolden Dreams
          </Typography>
        </Box>

        {/* Logout Button with Tooltip */}
        <Tooltip title="Logout" arrow>
          <Button
            color="primary"
            variant="contained"
            onClick={handleLogout}
            sx={{
              height: '60px',
              width: '60px',
              backgroundColor: '#1e1e1f',
              borderRadius: '50%',
              minWidth: 0,
              "&:hover": { backgroundColor: "#125ea8" },
            }}
          >
            <LogoutIcon />
          </Button>
        </Tooltip>

      </Toolbar>
    </AppBar>
  );
}
