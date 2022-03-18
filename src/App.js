import {useEffect, useRef, useState} from "react";
import {ethers, utils} from "ethers";
import abi from "./contract/abi.json";
import {Button, CssBaseline, Paper, TextField, Typography} from "@mui/material";
import "./App.scss";

const contractAddress = "0xb23a7bd0397fa361b2a8649db9693e46c079b7c5";


export default () => {

    const provider = useRef(null);
    const contract = useRef(null);

    const [account, setAccount] = useState(null);
    const [hasWallet, setHasWallet] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [badNetwork, setBadNetwork] = useState(false);

    const [tokenOwner, setTokenOwner] = useState(null);
    const [tokenSupply, setTokenSupply] = useState(0);
    const [tokenSymbol, setTokenSymbol] = useState(null);
    const [tokenName, setTokenName] = useState(null);
    const [userBalance, setUserBalance] = useState(null);

    const [receiverSendToken, setReceiverSendToken] = useState(null);
    const [amountSendToken, setAmountSendToken] = useState(null);

    const [mintAmount, setMintAmount] = useState(null);

    const [burnAmount, setBurnAmount] = useState(null);

    const inputMintAmount = useRef();
    const inputBurnAmount = useRef();

    const inputReceiverAddress = useRef();
    const inputSendAmount = useRef()


    useEffect(() => {
        if (window.ethereum) {
            const _provider = new ethers.providers.Web3Provider(window.ethereum);
            const _signer = _provider.getSigner();
            const _contract = new ethers.Contract(contractAddress, abi, _signer);

            provider.current = _provider;
            contract.current = _contract;

            connectWallet();

            setHasWallet(true);

            window.ethereum.on("accountsChanged", accounts => {
                if (accounts.length === 0) {
                    setAccount(null);
                } else {
                    setAccount(accounts[0]);
                }
            });

            window.ethereum.on("chainChanged", chain => {
                if (parseInt(chain) === 4){
                    setBadNetwork(false);
                    connectWallet();
                }else{
                    setBadNetwork(true);
                }
            })

            return () => {
                _contract.removeAllListeners();
                _provider.removeAllListeners();
            }

        }
    }, [])

    useEffect(() => {
        if (account) {
            getTokenInfo();
        }
    }, [account])


    const connectWallet = async () => {
        let _network = await provider.current.getNetwork();

        if (_network.chainId === 4){

            const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            setAccount(accounts[0]);

            if (accounts.length > 0) {
                setAccount(accounts[0]);
            }
        }else{
            setBadNetwork(true);
        }

    }

    const getTokenInfo = async () => {

        console.log("trigger");
        try {
            console.log(contract.current)

            let _tokenName = await contract.current.name();
            let _tokenSymbol = await contract.current.symbol();
            let _tokenOwner = await contract.current.owner();
            let _tokenSupply = await contract.current.totalSupply();
            let _userBalance = await contract.current.balanceOf(account);
            _tokenSupply = utils.formatEther(_tokenSupply);
            console.log(_tokenName);


            setTokenName(_tokenName);
            setTokenSymbol(_tokenSymbol);
            setTokenOwner(_tokenOwner);
            setTokenSupply(_tokenSupply);
            setUserBalance(utils.formatEther(_userBalance));

            if (account.toLowerCase() === _tokenOwner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (e) {
            console.log(e)
        }

    }

    const handleSendToken = async () => {
        inputSendAmount.current.value = "";
        inputReceiverAddress.current.value = "";

        try {
            await contract.current.transfer(utils.getAddress(receiverSendToken),utils.parseEther(amountSendToken));
        }catch (e){
            console.log(e);
        }

    }

    const handleMintToken = async () => {
        inputMintAmount.current.value = "";

        try {
            await contract.current.mint(utils.getAddress(account), utils.parseEther(mintAmount));
        }catch (e){
            console.log(e);
        }
    }

    const handleBurnToken = async () => {
        inputBurnAmount.current.value = "";

        try {
            await contract.current.burn(utils.getAddress(account), utils.parseEther(burnAmount));
        }catch (e){
            console.log(e);
        }
    }


    return (
        <>
            <CssBaseline/>

            {account && hasWallet && tokenName && !badNetwork && (<Paper elevation={3} sx={{
                width: "60%",
                margin: "20px auto",
                bgcolor: "#2A2C3F",
                textAlign: "center",
                padding: "20px",
                color: "white"
            }}>
                <Typography variant="h3">MyMemeCoin</Typography>

                {/******************************************************/}
                {/******************************************************/}
                {/**************       INFORMATION    ******************/}
                {/******************************************************/}

                <Paper elevation={0} sx={{
                    bgcolor: "transparent",
                    marginTop: "20px",
                    color: "white",
                    display: "flex",
                    flexWrap: "wrap"
                }}>
                    <Typography textAlign={"left"} margin={"0 5px"} width={"100%"}>
                        <Typography component={"span"} fontWeight={"700"}>Token:</Typography>
                        {tokenName}
                    </Typography>
                    <Typography textAlign={"left"} margin={"0 5px"} width={"100%"}><Typography component={"span"}
                                                                                               fontWeight={"700"}>Symbol:</Typography> {tokenSymbol}
                    </Typography>
                    <Typography textAlign={"left"} margin={"0 5px"} width={"100%"}><Typography component={"span"}
                                                                                               fontWeight={"700"}>Total
                        supply:</Typography> {tokenSupply}</Typography>
                    <Typography textAlign={"left"} margin={"0 5px"} width={"100%"}><Typography component={"span"}
                                                                                               fontWeight={"700"}>Your
                        balance:</Typography> {userBalance}</Typography>
                </Paper>

                {/******************************************************/}
                {/******************************************************/}
                {/**************       SEND           ******************/}
                {/******************************************************/}

                <Paper elevation={1}
                       sx={{border: "1px solid #fff", bgcolor: "transparent", p: "15px", mt: "20px", color: "white"}}>
                    <Typography variant={"h5"}>Send token</Typography>
                    <div className={"sendToken"}>
                        <TextField ref={inputReceiverAddress} onChange={(text) => setReceiverSendToken(text.target.value)} placeholder={"0xEa89070926261e3fC95f07924658903C4E4665e2"}
                                   sx={{margin: "15px", width: "100%"}} label="Receiver address" color={"warning"}
                                   focused/>
                        <TextField ref={inputSendAmount} onChange={(text) => setAmountSendToken(text.target.value)} placeholder={"0.0255 MMC"} sx={{margin: "15px", width: "50%"}} label="Amount"
                                   color={"warning"} focused/>
                        <Button onClick={handleSendToken} variant={"outlined"}>SEND</Button>
                    </div>
                </Paper>

                {/******************************************************/}
                {/******************************************************/}
                {/**************       MINT           ******************/}
                {/******************************************************/}

                {isOwner && (<Paper elevation={1}
                       sx={{border: "1px solid #fff", bgcolor: "transparent", p: "15px", mt: "20px", color: "white"}}>
                    <Typography variant={"h5"}>Mint token</Typography>
                    <div className={"sendToken"}>
                        <TextField ref={inputMintAmount} onChange={(text) => setMintAmount(text.target.value)} placeholder={"0.0255 MMC"} sx={{margin: "15px", width: "50%"}} label="Amount"
                                   color={"warning"} focused/>
                        <Button onClick={handleMintToken} variant={"outlined"}>MINT</Button>
                    </div>
                </Paper>)}

                {/******************************************************/}
                {/******************************************************/}
                {/**************       BURN           ******************/}
                {/******************************************************/}

                {isOwner && (<Paper elevation={1}
                       sx={{border: "1px solid #fff", bgcolor: "transparent", p: "15px", mt: "20px", color: "white"}}>
                    <Typography variant={"h5"}>Burn token</Typography>
                    <div className={"sendToken"}>
                        <TextField ref={inputBurnAmount} onChange={(text) => setBurnAmount(text.target.value)} placeholder={"0.0255 MMC"} sx={{margin: "15px", width: "50%"}} label="Amount"
                                   color={"warning"} focused/>
                        <Button onClick={handleBurnToken} variant={"outlined"}>BURN</Button>
                    </div>
                </Paper>)}

                <Paper elevation={0} sx={{bgcolor: "transparent", marginTop: "20px", color: "white"}}>
                    <Typography textAlign={"left"}>Contract address: {contractAddress}</Typography>
                    <Typography textAlign={"left"}>Token owner address: {tokenOwner}</Typography>
                    <Typography textAlign={"left"}>Your wallet address: {account}</Typography>
                </Paper>

            </Paper>)}

            {!hasWallet && (
                <p>You must have Metamask wallet !</p>
            )}

            {!account && !badNetwork && (
                <Paper  elevation={0} sx={{bgcolor:"transparent", display:"flex", textAlign:"center", flexWrap:"wrap", justifyContent:"center"}}>
                    <p>You must be connected</p>
                    <Button sx={{color:"white", borderColor:"orange"}} variant={"outlined"} onClick={connectWallet}>Connect</Button>
                </Paper>
            )}

            {badNetwork && (
                <p>You must be on the Rinkeby network !</p>
            )}
        </>
    )
}
