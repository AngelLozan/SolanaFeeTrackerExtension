import logo from './logo.svg';
import twitter from './twitter.png';
import React, { useState, useEffect } from "react";
import './App.css';
import Price from './solPrice.js';
import { Bars } from  'react-loader-spinner';
import ReactTooltip from "react-tooltip";


 //Slot
 //Standard Lamports
 //Average Gas
 // To Do: Catch error "can't find account" 

const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
let connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');


function App() {
  const [slots, setSlots] = useState();
  const [lamports, setLamports] = useState();
  const [avg, setAvg] = useState();
  const [tokenCost, setTokenCost] = useState();
  const [nftCost, setNftCost] = useState();
  const [error, setError] = useState(null);

const getSlot = async () => {
  let slot = await connection.getSlot();
  setSlots(slot);
   let block = await connection.getBlock(slot);
   let fees = await connection.getFeeCalculatorForBlockhash(block.blockhash);
   let lamports = fees.value.lamportsPerSignature;
   let standardLamports = (lamports * 1e-9).toFixed(6);
  setLamports(standardLamports);
   let datas = eval(block.rewards);
   let transactionCount = Object.keys(block.transactions).length;
   //let res = datas.map(data => data.lamports).reduce((acc, data) => data + acc);
   let array = datas.map(data => data.lamports),
    positive = array.filter(function (a) { return a >= 0; }),
    negative = array.filter(function (z) {return z <= 0;}).length,
    sum = positive.reduce(function (a, b) { return a + b; });
   let totalSol = (sum * 1e-9).toFixed(4);
   let averageGas = (totalSol / (transactionCount-negative)).toFixed(6);
  setAvg(averageGas);
};

const minting = async () => {
  let connection2 = await new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
  var fromWallet = await web3.Keypair.generate();
  var fromAirdropSignature = await connection2.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  await connection2.confirmTransaction(fromAirdropSignature);
  const balance = await connection2.getBalance(fromWallet.publicKey);
  let mint = await splToken.Token.createMint(
    connection2,
    fromWallet, //mint_pubkey (destination)
    fromWallet.publicKey, //mint_authority_pubkey
    null, //freeze_authority_pubkey
    9, // decimals
    splToken.TOKEN_PROGRAM_ID, //token_program_id
  );
  let fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey,
  );
   var toWallet = web3.Keypair.generate();
  var toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey,
  );
  let mintTo = await mint.mintTo( 
    fromTokenAccount.address,
    fromWallet.publicKey, 
    [], 
    1, 
  );
  let mintAuthority = await mint.setAuthority(
    mint.publicKey,
    null,
    "MintTokens",
    fromWallet.publicKey,
    []
  );

  const endBalance = await connection2.getBalance(fromWallet.publicKey);
  const token = ((balance - endBalance)*1e-9).toFixed(6);
  setTokenCost(token);
  const nftWithMetaData = (((balance - endBalance + 5000)*2)*1e-9).toFixed(6); //Include transaction fee additionally for minting to wallet .000000005
  setNftCost(nftWithMetaData);
};

// TO DO

//Update price for transactions by dollar cost (maybe)


  useEffect(() => {

  minting()
  .then((result)=> {
    setTokenCost(result.token);
    setNftCost(result.nftWithMetaData);
  })
  .catch((error)=>{
    setError(error);
  });

  const interval = setInterval(() => {
    getSlot()
    .then((result) => {
      setSlots(result.slot);
      setLamports(result.standardLamports);
      setAvg(result.averageGas);
    })
    .catch((error)=> {
      setError(error);
    });
  }, 3000);

  const interval2 = setInterval (() => {
    minting();
  }, 30000) // Every 1/2 minute

  return () => clearInterval(interval) && clearInterval(interval2);

  }, []);

  return (
    <div className="App">
    <div className="App-header">
    <a data-tip data-for='info' style={{position: 'static', right: '2px', left: '2px'}}> How are fees calculated? </a>
    <ReactTooltip id='info' place='bottom' type='dark' effect='float'>
    <span style={{fontSize:'12px'}}>The fee displayed ("Average Fee") is calculated as an average of all transaction fees for the block displayed. Data is pulled every 3 seconds. The average reflects rent payments made by accounts to the program, which are often much smaller than the standard fee and depend on the amount of data stored. Standard fees don't change often, but they can to bring the hardware utilization back to SPS target (helps with congestion). The fee for token creation is based on a transaction created every 60 seconds and upon opening the fee tracker. The fees for minting an NFT based on the same transaction plus the cost for creating a metadata account and refreshed every 60 seconds. These fees are only determined by the network and don't account for fees assesed on popular platforms (usually ~3%). The NFT fees are based on one NFT with minimal data and may change based on the amount of data you are storing on the network. The exact Solana price is below and shown rounded up on the badge. The price information is from Coingecko. </span>
    </ReactTooltip>


      <h2>
      <a href="https://explorer.solana.com/" target="_blank" title="Take me to a Solana Explorer"><img style={{ width: "2em" , height:"2em" }}src={logo} /></a>
      <br />
      Solana Fee Tracker
      </h2>
      {!slots && <div> <p id="p" style={{ color: "white", padding: "10px", marginLeft: "5px", marginRight: "5px", textAlign: "center", borderRadius: "10px", fontSize: "15px", outline: "2px solid #161b19"}}>Connecting to the blockchain...</p>
      <div className="bars">
      <Bars 
        heigth="100" 
        width="100" 
        color="#14F195" 
        ariaLabel= "loading" 
        /> </div>
        </div>}
        {slots && !avg && <div> <p id="p" style={{ color: "white", padding: "10px", marginLeft: "5px", marginRight: "5px", textAlign: "center", borderRadius: "10px", fontSize: "15px", outline: "2px solid #161b19"}}>Interfacing with Solana...</p>
      <div className="bars">
      <Bars 
        heigth="100" 
        width="100" 
        color="#14F195" 
        ariaLabel= "loading" 
        /> </div>
        </div>}
        {avg && !nftCost && <div> <p id="p" style={{ color: "white", padding: "10px", marginLeft: "5px", marginRight: "5px", textAlign: "center", borderRadius: "10px", fontSize: "15px", outline: "2px solid #161b19"}}>Performing calulations, this could take a moment...</p>
      <div className="bars">
      <Bars 
        heigth="100" 
        width="100" 
        color="#14F195" 
        ariaLabel= "loading" 
        /> </div>
        </div>}
    {nftCost && lamports && avg && <div>
        <p style={{padding: "5px", textAlign: "center", textDecoration:"none", color:"white"}}><span>Slot #: {slots} </span></p>
        <p style={{padding: "5px", textAlign: "center", textDecoration:"none", color:"white"}}><span>Average Fee: {avg} SOL</span></p>
        <h5 id="parallelogramMid"><span id="icon"> Create token: {tokenCost} SOL</span> </h5>
        <h5 id="parallelogramTB"><span id="icon2">Standard Fee: {lamports} SOL </span> </h5>
        <h5 id="parallelogramMid"><span id="icon">Fee to Mint NFT: {nftCost} SOL</span> </h5>
      </div> }
      <Price />
      <p style={{padding: "5px", textAlign: "center", textDecoration:"none", color:"white"}}><a href="https://solana.com/" target="_blank" title="Takes you to Solana.com. A magical place ..."style={{textDecoration:"none", color:"white"}}>Learn more about Solana</a></p>
    </div>
    </div>
  );
}

export default App;