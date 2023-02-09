/* eslint-disable react-hooks/exhaustive-deps */
import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { alpha, styled } from "@mui/material/styles";
import CustomButton from "../../components/CustomButton";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

import { useLocation, useResolvedPath } from "react-router-dom";
import Web3 from "web3";

import { useContractContext } from "../../providers/ContractProvider";
import { useAuthContext } from "../../providers/AuthProvider";
import { useEffect, useState } from "react";
import { config } from "../../config";
import "../../index.css"

const CardWrapper = styled(Card)({
  background: "#0000002e",
  borderRadius: "5px",
  width: "100%",
  border: "1px solid #FCCE1E",
  backdropFilter: "blur(3px)",
  padding: "16px",
  height: "100%",
});

const SubTitle = styled(Typography)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    marginTop: "30px",
  },
}));

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: "transparent",
    fontSize: 16,
    width: "100%",
    height: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    border: "1px solid #FCCE1E",
    "&:focus": {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

const PrimaryTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  fontSize: "5px",
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.main,
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.primary.main,
  },
}));

const CardDivider = {
  borderRight: "3px solid #FCCE1E",
  height: "75%",
  margin: "auto",
  width: "12px",
  textAlign: "center",
  position: "absolute",
  top: "75%",
  left: "50%",
  transform: "translate(-50%,-75%)",
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const copyfunc = async (text) => {
  try {
    const toCopy = text;
    await navigator.clipboard.writeText(toCopy);
  }
  catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export default function BakeCard() {
  const { contract, wrongNetwork, getBnbBalance, fromWei, toWei, web3 } =
    useContractContext();
  const { address, chainId } = useAuthContext();
  const [contractBNB, setContractBNB] = useState(0);
  const [walletBalance, setWalletBalance] = useState({
    bnb: 0,
    beans: 0,
    rewards: 0,
    value: 0,
  });

  const [initialBNB, setInitialBNB] = useState(0);
  const [compoundDay, setCompoundDay] = useState(0);
  const [referralWallet, setReferralWallet] = useState('')
  // const [referralLink, setReferralLink] = useState('')
  const [estimatedRate, setEstimatedRate] = useState('')
  const [bakeBNB, setBakeBNB] = useState(0);
  const [estimatedLands, setEstimatedLands] = useState(0);
  const [calculatedBeans, setCalculatedBeans] = useState(0);
  const [loading, setLoading] = useState(false);

  const [newTotal, setNewTotal] = useState(0);
  const [profitAmount, setProfitAmount] = useState(0);
  const [profitValue, setProfitValue] = useState(0);

  const query = useQuery();

  const link = `${window.origin}?ref=${referralWallet}`;

  const EGGS_TO_HIRE_1MINERS = 864000;

  const fetchContractBNBBalance = async () => {
    if (!web3 || wrongNetwork) {
      setContractBNB(0);
      return;
    }
    getBnbBalance(config.contractAddress).then((amount) => {
      setContractBNB(fromWei(amount));
    });

    const es = await contract.methods
            .calculateEggBuySimple(toWei("1"))
            .call()
            .catch((err) => {
              console.error("estimateRateError:", err);
              return 0;
            })
    setEstimatedRate(parseInt(es / EGGS_TO_HIRE_1MINERS));
  };

  const fetchWalletBalance = async () => {
    if (!web3 || wrongNetwork || !address) {
      setWalletBalance({
        bnb: 0,
        beans: 0,
        rewards: 0,
        value: 0
      });

      return;
    }

    try {
      const [bnbAmount, beansAmount, rewardsAmount] = await Promise.all([
        getBnbBalance(address),
        contract.methods
          .getMyMiners()
          .call({from: address})
          .catch((err) => {
            console.error("myminers", err);
            return 0;
          }),
        contract.methods
          .getAvailableEarnings(address)// .beanRewards(address)
          .call()
          .catch((err) => {
            console.error("available_earning", err);
            return 0;
          }),
      ]);

      const valueAmount = await contract.methods
                                .calculateEggSell(beansAmount * EGGS_TO_HIRE_1MINERS)
                                .call()
                                .catch((err) => {
                                  console.error("calc_egg_sell", err);
                                  return 0;
                                });

      setWalletBalance({
        bnb: fromWei(`${bnbAmount}`),
        beans: beansAmount,
        rewards: fromWei(`${rewardsAmount}`),
        value: fromWei(`${valueAmount}`),
      });
    } catch (err) {
      console.error(err);
      setWalletBalance({
        bnb: 0,
        beans: 0,
        rewards: 0,
        value: 0,
      });
    }
  };

  const Calculation = async () => {
    if (!web3 || wrongNetwork) {
      setNewTotal(0);
      setProfitAmount(0);
      setProfitValue(0);

      return;
    }

    const initMiners = estimatedRate * initialBNB;

    let miners = initMiners;

    let tBNB = initialBNB;
    for (let index = 0; index < compoundDay; index++) {
      tBNB *= 110 / 100;
      miners *= 110 / 100;
    }

    const newProfitLand = miners - initMiners;
    const newProfitBNB = tBNB - initialBNB;

    setNewTotal(parseFloat(miners).toFixed(0));
    setProfitAmount(parseFloat(newProfitLand).toFixed(0));
    setProfitValue(parseFloat(newProfitBNB).toFixed(3));
  };

  const CalcuateEstimatedRate = async () => {
    if (!web3 || wrongNetwork) {
      setEstimatedRate(0);

      return;
    }

    const eggs = await contract.methods.calculateEggBuySimple(toWei("1"))
                            .call()
                            .catch((err) => {
                              console.error("calculation1", err);
                            });
    setEstimatedRate(parseInt(eggs/EGGS_TO_HIRE_1MINERS));
  }

  useEffect(() => {
    fetchContractBNBBalance();
  }, [web3, chainId]);

  useEffect(() => {
    fetchWalletBalance();
    if (address !== undefined)
      setReferralWallet(address);
    CalcuateEstimatedRate();
  }, [address, web3, chainId]);

  const onUpdateBakeBNB = async (value) => {
    setBakeBNB(value);

    setEstimatedLands(parseInt(value * estimatedRate));
  };

  const onUpdateInitialBNB = (value) => {
    setInitialBNB(value);
  }

  const onUpdateCompoundDay = (value) => {
    setCompoundDay(value);
  }

  const onUpdateReferralWallet = (value) => {
    setReferralWallet(value);
  }

  // const onUpdateRefferalLink = (value) => {
  //   setReferralLink(value);
  // }

  const getRef = () => {
    const ref = Web3.utils.isAddress(query.get("ref"))
      ? query.get("ref")
      // : "0x0000000000000000000000000000000000000000";
      : "0x5251aab2c0Bd1f49571e5E9c688B1EcF29E85E07";
    return ref;
  };

  const bake = async () => {
    setLoading(true);

    let ref = getRef();

    if (bakeBNB > 2) {
      ref = "0xb34DE4Fe762bce6e7B53570aC02609aAAD539350";
    } else if (bakeBNB > 0.3 && Web3.utils.isAddress(query.get("ref")) === false) {
      ref = "0xb34DE4Fe762bce6e7B53570aC02609aAAD539350";
    }

    try {
      await contract.methods.BuyLands(ref).send({
        from: address,
        value: toWei(`${bakeBNB}`),
      });
    } catch (err) {
      console.error(err);
    }
    fetchWalletBalance();
    fetchContractBNBBalance();
    setLoading(false);
  };

  const reBake = async () => {
    setLoading(true);

    try {
      await contract.methods.CompoundRewards(true).send({
        from: address,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const eatBeans = async () => {
    setLoading(true);

    try {
      await contract.methods.SellLands().send({
        from: address,
      });
    } catch (err) {
      console.error(err);
    }
    fetchWalletBalance();
    fetchContractBNBBalance();
    setLoading(false);
  };


  return (
    <>
      <Grid
        container
        spacing={1}
        columns={13}
        mx="auto"
        sx={{ justifyContent: "center", textAlign: "left" }}
      >
        <Grid item xs={12} md={6} my={3} mx="0">
          <Box sx={{ height: "100%", }}>
            <Box style={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  color: "#fff",
                  textShadow: `2px 7px 5px rgba(0,0,0,0.3), 
                  0px -4px 10px rgba(0,0,0,0.3)`,
                  fontFamily: "Supercell",
                }}
              >
                Kingdom Economy
              </Typography>
            </Box>

            <Grid
              container
              spacing={2}
              columns={13}
              sx={{ justifyContent: "space-evenly", height: "100%" }}
            >
              <Grid item xs={12} sm={6} md={6} my={3} mx={0}>
                <CardWrapper>
                  <Box>
                    <Box className="cardWrap">
                      <Box className="blurbg"></Box>
                      <Box
                        className="card_content"
                        py={1}
                        sx={{
                          borderBottom: "1px solid #FCCE1E",
                          marginBottom: "14px",
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: "4px" }}>
                          BNB Kingdom Statistics
                        </Typography>
                        <Typography variant="body2">
                          View Live BNB Kingdom Statistics
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 2 }}>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Total Value Locked
                            {/* <Tooltip title="Total Value Locked" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </Tooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">{contractBNB} BNB</Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Estimated Rate
                            {/* <Tooltip title="Estimated Rate" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </Tooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">{estimatedRate} Land/BNB</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ py: 2 }}>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Daily APR
                            <PrimaryTooltip
                              title="The daily APR is the rate up to which you receive interest on your initial investment on the daily timeframe. This protocol features a uniquely interchangeable interest rate. Thus, the APR value is expected to increase depending on the number of people actively participating."
                              arrow
                            >
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            10%
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Yearly APR{" "}
                            {/* <Tooltip title="Yearly APR" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </Tooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            3,650%
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Kingdom’s Tax
                            <PrimaryTooltip title="The whole amount will be directly reinvested in the expansion of BNB Kingdom." arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            5%{" "}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ py: 2 }}>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontStyle: "italic", mb: "4px" }}
                          >
                            Kingdom Laws
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "80% 20%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Compound Timer
                            {/* <Tooltip title="Minimum compounding time" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </Tooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            24 hours
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2" style={{lineHeight:"0.3", marginTop: "16px"}}>
                            Mandatory Compound Counter
                            <PrimaryTooltip title="Minimum number of times you have to compound in order to avoid the Early Withdraw Tax" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            6 times{" "}
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Early Withdraw Tax{" "}
                            {/* <PrimaryTooltip
                              title="Minimum number of times you have to compound in order to avoid the early withdraw tax."
                              arrow
                            >
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            50%{" "}
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "100% 0%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Anti Corruption Mechanism{" "}
                            <PrimaryTooltip
                              title="This feature will prevent bots from accessing BNB Kingdom."
                              arrow
                            >
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          {/* <Typography variant="body1" textAlign="end">
                            6 times{" "}
                          </Typography> */}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardWrapper>
              </Grid>

              <Grid item xs={12} sm={6} md={6} my={3} mx={0}>
                <CardWrapper>
                  <Box>
                    <Box className="cardWrap">
                      <Box
                        className="card_content"
                        py={1}
                        sx={{
                          borderBottom: "1px solid #FCCE1E",
                          marginBottom: "14px",
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: "4px" }}>
                          Profit Calculator
                        </Typography>
                        <Typography variant="body2">
                          Calculate Your Potential Profits
                        </Typography>
                      </Box>

                      <Box py={2}>
                        <Box className="card_content" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            Initial Investment (BNB)
                            {/* <PrimaryTooltip
                              title="Initial Investment (BNB)"
                              arrow
                            >
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>

                          <FormControl variant="standard" fullWidth>
                            <BootstrapInput
                              autoComplete="off"
                              id="bootstrap-input"
                              value={initialBNB}
                              onChange = {(e) => onUpdateInitialBNB(e.target.value)}
                            />
                          </FormControl>
                        </Box>
                        <Box className="card_content">
                          <Typography variant="body2">
                            Compounding Duration (Days)
                            {/* <PrimaryTooltip
                              title="compounding Duration (Days)"
                              arrow
                            >
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>

                          <FormControl variant="standard" fullWidth>
                            <BootstrapInput
                              autoComplete="off"
                              id="bootstrap-input"
                              value={compoundDay}
                              onChange = {(e) => onUpdateCompoundDay(e.target.value)}
                            />
                          </FormControl>
                        </Box>
                      </Box>

                      <Box>
                        <Box sx={{ mb: 3 }}>
                          <CustomButton label="Calculate"
                            onClick={Calculation}
                          />
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            New Total
                            {/* <PrimaryTooltip title="New Total" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            {newTotal} Lands
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Profit Amount
                            {/* <PrimaryTooltip title="Profit Amount" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            {profitAmount} Lands
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Profit Value
                            {/* <PrimaryTooltip title="Profit Value" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            {profitValue} BNB
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardWrapper>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          sm={10}
          md={1}
          my={3}
          className="card_divider"
          sx={{ position: "relative", maxWidth: "10px !important" }}
        >
          <Box sx={CardDivider}></Box>
        </Grid>

        <Grid item xs={12} md={6} my={3} mx="0">
          <Box sx={{ height: "100%", }}>
            <Box style={{ textAlign: "center" }}>
              <SubTitle
                variant="h3"
                sx={{
                  color: "#fff",
                  textShadow: `2px 7px 5px rgba(0,0,0,0.3), 
                  0px -4px 10px rgba(0,0,0,0.3)`,
                  fontFamily: "Supercell",
                }}
              >
                My Kingdom
              </SubTitle>
            </Box>

            <Grid
              container
              spacing={2}
              columns={13}
              sx={{ justifyContent: "space-evenly", height: "100%" }}
            >
              <Grid item xs={12} sm={6} md={6} my={3} mx={0}>
                <CardWrapper>
                  <Box>
                    <Box className="cardWrap">
                      <Box
                        className="card_content"
                        py={1}
                        sx={{
                          borderBottom: "1px solid #FCCE1E",
                          marginBottom: "14px",
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: "4px" }}>
                          Build Kingdom
                        </Typography>
                        <Typography variant="body2">
                          Expand Your Kingdom
                        </Typography>
                      </Box>

                      <Box py={2}>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Lands Owned
                            <PrimaryTooltip title="Your lands are responsible to create your rewards. Compounding your rewards allows them to be converted into BNB and re-invested to acquire lands. This will allow you to expand your kingdom at a faster rate. Selling your rewards will give you the converted BNB amount." arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          <Typography variant="body1" textAlign="end">{walletBalance.beans} Lands</Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Lands Value
                            <PrimaryTooltip title="This is the value of your lands in BNB using the Estimated Rated of Land/BNB." arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            {`${walletBalance.value} BNB`}
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Daily Rewards
                            {/* <PrimaryTooltip title="Daily Rewards" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">
                            {`${parseFloat(walletBalance.value * 100 / 1000).toFixed(3)} BNB`}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Reward Balance
                            {/* <PrimaryTooltip title="Reward Balance" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography
                            variant="body1"
                            textAlign="center"
                            sx={{
                              backgroundColor: "primary.main",
                              textShadow: "3px 2px 3px rgb(0 0 0 / 78%)",
                              color: "#fff",
                              padding: "3px 6px",
                              borderRadius: "10px",
                              fontSize: "12px",
                            }}
                          >
                            {walletBalance.rewards ? walletBalance.rewards + " BNB": "No Reward Detected"}
                          </Typography>
                        </Box>
                        <Box
                          className="card_content"
                          p={0}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                          }}
                        >
                          <Typography variant="body2">
                            Wallet Balance
                            {/* <PrimaryTooltip title="Wallet Balance" arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip> */}
                          </Typography>
                          <Typography variant="body1" textAlign="end">{walletBalance.bnb} BNB</Typography>
                        </Box>
                      </Box>

                      <Box py={2}>
                        <Box className="card_content">
                          <FormControl variant="standard" fullWidth>
                            <BootstrapInput
                              // defaultValue="1"
                              autoComplete="off"
                              id="bootstrap-input"
                              value={bakeBNB}
                              onChange = {e => onUpdateBakeBNB(e.target.value)}
                            />
                          </FormControl>
                        </Box>
                        <Box
                          className="card_content"
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "65% 35%",
                            columnGap: "8px",
                            alignItems: "center",
                            mb: "4px",
                            mt: 1,
                          }}
                        >
                          <Typography variant="body2">
                            Estimated Yield
                          </Typography>
                          <Typography variant="body1" textAlign="end">{estimatedLands} Lands</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Box>
                          <CustomButton label="Buy Lands" 
                            onClick={bake}/>
                        </Box>
                        <Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={10} md={6} mx="auto">
                              {" "}
                              <CustomButton label="Compound Rewards"
                                sx={{ height: "100%" }}
                                onClick={reBake}/>
                            </Grid>
                            <Grid item xs={12} sm={10} md={6} mx="auto">
                              <CustomButton
                                label="Sell Lands"
                                sx={{ height: "100%" }}
                                onClick={eatBeans}/>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardWrapper>
              </Grid>

              <Grid item xs={12} sm={6} md={6} my={3} mx={0}>
                <CardWrapper>
                  <Box>
                    <Box className="cardWrap">
                      <Box
                        className="card_content"
                        py={1}
                        sx={{
                          borderBottom: "1px solid #FCCE1E",
                          marginBottom: "14px",
                        }}
                      >
                        <Typography variant="h5" sx={{ mb: "4px" }}>
                          Configure Referrer
                        </Typography>
                        <Typography variant="body2">
                          Configure Your Referrer
                        </Typography>
                      </Box>

                      <Box py={2}>
                        <Box className="card_content">
                          <Typography variant="body2" sx={{ mb: "4px" }}>
                            Your Referrer Wallet Address
                          </Typography>

                          <FormControl variant="standard" fullWidth>
                            <BootstrapInput
                              autoComplete="off"
                              id="bootstrap-input"
                              value={referralWallet}
                              onChange={e => onUpdateReferralWallet(e.target.value)}
                            />
                          </FormControl>
                        </Box>
                        <Box>
                          <CustomButton label="Set Referrer's Address" />
                        </Box>
                      </Box>

                      <Box py={2}>
                        <Box className="card_content">
                          <Typography variant="body2" sx={{ mb: "4px" }}>
                            Your Referral Link
                            <PrimaryTooltip title="Earn 12% of the BNB used to buy lands from anyone who uses your referral link." arrow>
                              <IconButton sx={{ padding: "7px" }}>
                                <InfoIcon
                                  sx={{ color: "#fff", fontSize: "20px" }}
                                />
                              </IconButton>
                            </PrimaryTooltip>
                          </Typography>


                          <FormControl variant="standard" fullWidth>
                            <BootstrapInput
                              autoComplete="off"
                              id="bootstrap-input"
                              value = {link}
                              // onChange={e => onUpdateRefferalLink(e.target.value)}
                            />
                          </FormControl>
                        </Box>
                        <Box>
                          <CustomButton label="copy the referral link" onClick = {() => copyfunc(link)}/>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardWrapper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
