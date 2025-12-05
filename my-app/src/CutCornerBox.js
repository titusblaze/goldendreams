import React from 'react';
import { Box } from '@mui/material';

export default function CutCornerBox() {
  return (
    <Box
      sx={{
       width: "80%",
        height: "80vh",
        borderRadius:'100px',
        background: "linear-gradient(135deg, #ffd700, #ff8c00)",
        position: "relative",
        clipPath: "polygon(0 0, 60% 0, 60% 50%, 100% 50%, 100% 100%, 0 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    />
  );
}
