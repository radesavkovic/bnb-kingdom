import { Box } from "@mui/material";
import backgroundImage from "../assets/bg-img.png";
import BakeCard from "./components/BakeCard";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Connect from "./components/Connect";

export default function Home() {
  return (
    <>
      <Box
        component="div"
        sx={{
          background: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          textAlign: "right"        
        }}
      >
        {/* <Connect /> */}
        <Header />
        <Box px={2}>
          <BakeCard />
        </Box>
        <Footer />
      </Box>

    </>
  );
}
