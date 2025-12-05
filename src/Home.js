import { Box } from '@mui/material';
import Banner from './Banner';
import CutCornerBox from './CutCornerBox';
import ImageSlider from './ImageSlider';
import ImageGallery from './ImageGallery';
import GoogleImage from './GoogleImage';



const Home = () => {

  return (
    <Box>
      
      
      <Banner />
        <ImageSlider/>
        <GoogleImage/>
        <ImageGallery/>
      {/* <CutCornerBox /> */}
    </Box>
  );
};

export default Home;
