import React from "react";
import { Box } from "@mui/material";

export default function GoogleImage() {
  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "300px", md: "600px" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <iframe
        src="https://drive.google.com/file/d/0B86P-57BWmIFcl82QndiTDdVU00/preview"
        width="80%"
        height="100%"
        allow="autoplay"
        style={{ border: "none", borderRadius: "8px" }}
        title="Google Drive Image"
      ></iframe>
    </Box>
  );
}
