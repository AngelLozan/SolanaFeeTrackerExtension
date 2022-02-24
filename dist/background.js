// let onceFlag = true

// if (onceFlag == true) {
//   onceFlag = false
//   getPrice()
//   //gas();
// } 



chrome.alarms.create('get_price', { periodInMinutes: 0.25 })

chrome.alarms.onAlarm.addListener(() => {
  console.log('badge refresh is functional! Service worker is active');
  getPrice();
  //gas();
});

async function getPrice() {
  let response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
  let json = await response.json()
  //{"solana":{"usd":94.74}}
  let price = (json['solana']['usd']).toFixed()
  chrome.action.setBadgeText({ text: '$' + String(price) });
};