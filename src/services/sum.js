const {BIP32Factory} = require("bip32");
const ecc = require("tiny-secp256k1");
const bjs = require("bitcoinjs-lib");
const {getC2cPrice, getBTCPrice} = require("../utils");
(async function(){
     const ecc = require("tiny-secp256k1");
     const { BIP32Factory } = require('bip32');
     const bjs = require("bitcoinjs-lib");
     const bip32 = BIP32Factory(ecc);

     const MAINNET = bjs.networks.bitcoin;
//const NETWORK = regtestUtils.network;

     xpub = "xpub68ZejqmVU58kR2SGhf6UDbVxKMtF4dm76noJScjKwKtpYr4JZk4P91dvx2yCBgsW93JCUczELgiEfDhDpRd1m4JMJLkquUW4tCh9m4wg4Ap"

     const { address } = bjs.payments.p2wpkh({
          pubkey: bip32.fromBase58(xpub).derive(0).derive(0).publicKey,
          network: MAINNET })

     console.log(address)

     const { getC2cPrice, getBTCPrice, initiateError, FormatData} = require("../utils")
     const c2cPrice = await getC2cPrice();
     let BTCPrice = await getBTCPrice();

     console.log(c2cPrice)
     console.log(BTCPrice)

})()