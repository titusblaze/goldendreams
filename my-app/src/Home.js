import { Box } from '@mui/material';
import Banner from './Banner';
import ImageGallery from './ImageGallery';
import GoogleReview from './GoogleReview';
import AboutUs from './AboutUs';
import ReliableCustomer from './ReliableCustomer';



const Home = () => {

  return (
    <Box>
      
      
      <Banner />
      <AboutUs />
        <ImageGallery/>
        <ReliableCustomer/>
        <GoogleReview/>
    </Box>
  );
};

export default Home;
