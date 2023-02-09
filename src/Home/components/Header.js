import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import logo from "../../assets/bnbking-logo.png";
import Connect from "./Connect";

const Wrapper = styled("div")(({ theme }) => ({
  textAlign: "center",
  paddingTop: 50,
  [theme.breakpoints.down("md")]: {
    paddingTop: 10,
    h5: {
      fontSize: 20,
      margin: 0,
    },
  },
}));

export default function Header() {
  const [countdown, setCountdown] = useState({
    alive: true,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const getCountdown = (deadline) => {
    const now = Date.now() / 1000;
    const total = deadline - now;
    const seconds = Math.floor((total) % 60);
    const minutes = Math.floor((total / 60) % 60);
    const hours = Math.floor((total / (60 * 60)) % 24);
    const days = Math.floor(total / (60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
        try {
            const data = getCountdown(1653746400)
            setCountdown({
                alive: data.total > 0,
                days: data.days,
                hours: data.hours,
                minutes: data.minutes,
                seconds: data.seconds
            })
        } catch (err) {
            console.log(err);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [])

  return (
    <Box
      component="div"
      sx={{ px: { lg: 0, xs: 2 }, maxWidth: "calc(100% - 10%)", mx: "auto" }}
    >
      <Wrapper>
        <div className="d-flex flex-row justify-content-between align-items-center gap-5 header_logo">
          <span style={{width: "100px"}}></span>
          <img src={logo} alt="" width={"600px"} />
          <Connect />
        </div>

        <Box sx={{ textAlign: "right"}}>
          <Connect responsive = {false}/>
        </Box>
      </Wrapper>
    </Box>
  );
}
