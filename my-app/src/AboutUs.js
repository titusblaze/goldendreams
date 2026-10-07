import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const images = {
  image1: "https://res.cloudinary.com/db3qhuau/image/upload/v1788086884/cld-sample.jpg",
  image2: "https://res.cloudinary.com/db3qhuau/image/upload/v1789465204/682A5673.jpg",
  image3: "https://images.unsplash.com/photo-1541617050654-c85f22ad1aa6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRyb25lJTIwcGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D",
};

function AboutUs() {
  return (
    <Box
      sx={{
        width: "100%",
        background: "#080808",
        color: "#fff",
        py: { xs: 7, md: 12 },
        px: { xs: 2, sm: 4, md: 7, lg: 10 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "0.9fr 1.1fr",
          },
          gap: { xs: 6, md: 10 },
          alignItems: "center",
        }}
      >
        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              color: "#D4AF37",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "4px",
              mb: 2,
            }}
          >
            GOLDEN DREAMS
          </Typography>

          <Typography
            component="h2"
            sx={{
              fontFamily: "Georgia, serif",
              fontSize: {
                xs: "38px",
                sm: "48px",
                md: "58px",
              },
              lineHeight: 1.1,
              fontWeight: 500,
              mb: 3,
            }}
          >
            Capture.
            <br />

            <Box
              component="span"
              sx={{
                color: "#D4AF37",
                fontStyle: "italic",
              }}
            >
              Create.
            </Box>

            <br />

            Inspire.
          </Typography>

          <Box
            sx={{
              width: "60px",
              height: "2px",
              background: "#D4AF37",
              mb: 3,
            }}
          />

          <Typography
            sx={{
              maxWidth: "550px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "16px",
              lineHeight: 1.9,
              mb: 3,
            }}
          >
            Golden Dreams is a creative photography and design studio
            dedicated to transforming special moments into timeless
            memories. We capture stories through photography, film and
            creative design with passion, imagination and attention to
            detail.
          </Typography>

          <Button
            endIcon={<ArrowForwardIcon />}
            sx={{
              background:
                "linear-gradient(90deg,#F5D76E,#D4AF37)",
              color: "#000",
              px: 3,
              py: 1.3,
              borderRadius: "4px",
              fontWeight: 700,
              "&:hover": {
                background:
                  "linear-gradient(90deg,#FFE58A,#D4AF37)",
              },
            }}
          >
            Discover Golden Dreams
          </Button>
        </motion.div>

        {/* RIGHT - IMAGE COLLAGE */}

        <Box
          sx={{
            position: "relative",
            height: {
              xs: "450px",
              sm: "550px",
              md: "600px",
            },
          }}
        >
          {/* IMAGE 1 */}

          <Box
            sx={{
              position: "absolute",
              width: "62%",
              height: "62%",
              right: 0,
              top: 0,
              zIndex: 2,
              overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.5)",
            }}
          >
            <Box
              component="img"
              src={images.image1}
              alt="Golden Dreams"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>

          {/* IMAGE 2 */}

          <Box
            sx={{
              position: "absolute",
              width: "40%",
              height: "45%",
              left: 0,
              bottom: 0,
              zIndex: 3,
              overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.5)",
            }}
          >
            <Box
              component="img"
              src={images.image2}
              alt="Golden Dreams Photography"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>

          {/* IMAGE 3 */}

          <Box
            sx={{
              position: "absolute",
              width: "52%",
              height: "38%",
              right: "3%",
              bottom: "4%",
              zIndex: 4,
              overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.5)",
            }}
          >
            <Box
              component="img"
              src={images.image3}
              alt="Golden Dreams Creative Work"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AboutUs;