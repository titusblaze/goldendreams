import { Box } from '@mui/material';
import Banner from './Banner';
import CutCornerBox from './CutCornerBox';
import ImageSlider from './ImageSlider';
import ImageGallery from './ImageGallery';
import GoogleImage from './GoogleImage';
import GoogleReview from './GoogleReview';
import AboutUs from './AboutUs';



const Home = () => {

  return (
    <Box>
      
      
      <Banner />
      <AboutUs />
        {/* <ImageSlider/> */}
        {/* <GoogleImage/> */}
        <ImageGallery/>
        <GoogleReview/>
      {/* <CutCornerBox /> */}
    </Box>
  );
};

export default Home;
