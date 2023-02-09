import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/system";
import TwitterIcon from '@mui/icons-material/Twitter';  
import TelegramIcon from '@mui/icons-material/Telegram';
import { BscscanIcon } from "../../components/Icons";
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import { IconButton } from "@mui/material";
import '../index'

const SocailIcon = styled(IconButton)(({ theme }) => ({
  background: "#FACC1E",
  color: "#000",
  margin: "30px 3px",
  border: "1px solid #FACC1E",
  "&:hover" :{
    color: "#FACC1E",
    background: "trasparent",   
    transition: ".5s all"
  }

}));



export default function Footer() {
  return (
    <>
      <Box component="div" sx={{ px: 2, textAlign: "center" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box className="socialicon_wrap">
              <a href="https://twitter.com/BNBKingdom" target="_blank">
                <SocailIcon><TwitterIcon  /></SocailIcon>
              </a>
              <a href="https://t.me/BNBKingdom" target="_blank">
                <SocailIcon><TelegramIcon /></SocailIcon>
              </a>
              <a href="https://bscscan.com/address/0x2fe004ae1b6718b09380f8392aa91cd2d5039b98" target="_blank">
                <SocailIcon><BscscanIcon  /></SocailIcon>                       
              </a>
              <a href="./audit.pdf" target="_blank">
                <SocailIcon><VerifiedUserRoundedIcon  /></SocailIcon>
              </a>
            </Box>
          </Grid>
        </Grid> 
      </Box>
    </>
  );
}
