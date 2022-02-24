import React, { useState, useEffect } from "react";
import './App.css';

const Price = () => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [price, setPrice] = useState({});


  useEffect(() => {
    const apiCall = fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd")
      .then(res => res.json())
      .then(
        (result) => {
          setPrice(result);
          setIsLoaded(true);
          console.log('wmatic set')
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
      
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");

   const interval = setInterval(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
  }, 5000);

  }, ["https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"]);

  if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Price is Loading...</div>;
  } else {
    return (
      <button className="button"><a href="https://www.coingecko.com/en/coins/solana" target="_blank" title="Coingecko has the most current price, it's their API after all :)"style={{textDecoration:"none", color:"white"}}>Exact Solana Price: ${(Math.round(price.solana.usd * 100) / 100).toFixed(2)}</a></button>
      );
  }
}

export default Price;

