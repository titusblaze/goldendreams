// Live.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { useQuery } from '@tanstack/react-query';

// 🔥 Replace axios with fetch()
const fetchData = async () => {
  const response = await fetch(
    'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjJyZqMcOzyhkuUQVuDnu_Dlbe__L996YGmMQ3oJ2g91jwg1rbshbGUInpS-VpgWkHqveua_JzCS_7swRgUxvGPiDCxsg6k0N5PsJImAlKRvdqsEh4mjLzXwg_8i53UQVI4ejR1-Y3dJSY1-ovELccXB08b14i9sZBB6EblcBlTyIXoMIzaGNoGUiAhv5516E8ovIw-kZqyqbMxmFHbhwrgDrky-FpXk8KVUACijt675Msux4etCG0yAMoXfEJRtr0a-P1HAXt9yhGdw9neftWPgEVR1w&lib=ME9LPB3JZtBZlz1PevbxUQfFnlO6455Uk'
  );

  if (!response.ok) {
    throw new Error("Network error");
  }

  return response.json();
};

// Extract video ID from any YouTube link format
const extractYouTubeID = (url) => {
  if (!url) return "";

  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[7].length === 11) ? match[7] : null;
};

const Live = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['Golden Dreams'],
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5,
  });

  const filteredData2 = data.filter((item) => item.Id === 4);

  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleOpen = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '110px 0',
      }}
    >
      <Typography
        className='gradient-text'
        sx={{
          fontSize: { xs: '30px', md: '50px' },
          fontWeight: 'bold',
          
          padding: '15px 0',
        }}
      >
        Live
      </Typography>

      {filteredData2
        .filter((link) => link?.LabelText?.toLowerCase() === 'yes')
        .map((link, index) => (
          <React.Fragment key={index}>
            

            <Box
              sx={{
                display: 'flex',
                width: { xs: '360px', md: '1385px' },
                height: { xs: '200px', md: '768px' },
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeID(link.link)}?autoplay=1&controls=1&rel=0`}
                title={link.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                
                style={{
                  position: 'relative',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />

            </Box>
          </React.Fragment>
        ))}

    </Box>
  );
};

export default Live;
