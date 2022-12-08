const ecc = require("tiny-secp256k1");
const { BIP32Factory } = require('bip32');
const bjs = require("bitcoinjs-lib");
const bip32 = BIP32Factory(ecc);


const { getC2cPrice, getBTCPrice, initiateError, FormatData} = require("../utils")
const { InvoiceRepository } = require('../database');
const { BadRequestError, STATUS_CODES} = require('../utils/app-errors');
const TESTNET = bjs.networks.testnet;
class InvoiceService {

    constructor() {
        this.repository = new InvoiceRepository();
    }

    async createInvoice (userInput, user) {
        const {amount, phone, address, prevInvoiceId = ''} = userInput || {};


        try {
            /***************************************
             * Generating Wallet address
             * ************************************/

            const invoiceCount = await this.repository.countInvoice();
            const xpub = process.env.X_PUB;
            const { address } =  bjs.payments.p2wpkh({
                pubkey: bip32.fromBase58(xpub).derive(0).derive(invoiceCount).publicKey,
                network: TESTNET
            })

            console.log("here is the function")

            console.log(address)

            /*******************************************
             * Amount in satosh
             * ************************************/
            const c2cPrice = await getC2cPrice();
            let BTCPrice = await getBTCPrice();

            BTCPrice = 99.5 / 100 * BTCPrice
            // c2cPrice = Math.floor(c2cPrice.reduce((a, b) => a + b)/c2cPrice.length) - 1;

            // console.log(c2cPrice, BTCPrice)

            const amountInSatoshi = amount * 1 / ((c2cPrice - 1) * BTCPrice)

            const invoice = await this.repository.createInvoice({
                amount: amount,
                walletAddresses: address,
                amountInSatoshi: amountInSatoshi,
                phone: phone,
                status: "pending",
                prevInvoiceId: prevInvoiceId,
                user: user._id
            })

            if (!invoice) initiateError(STATUS_CODES.BAD_REQUEST, 'Unable to create invoice')
            return FormatData(invoice)
        } catch (e) {
            throw new BadRequestError(e.message, e)
        }
    }

    async getInvoice (query) {
        console.log(query)
        try {
            const invoices = await this.repository.getInvoice(query);
            return FormatData(invoices);

        } catch (e) {
            throw new BadRequestError(e.message, e)
        }
    }

    async getUserInvoice (userId) {
       try {
           const invoices = this.repository.getInvoice({user: userId});
           return FormatData(invoices);
       } catch (e) {
           throw new BadRequestError(e.message, e)
       }
    }

    async getInvoiceById (id) {
        try {
            const invoice = await this.repository.getInvoiceById(id);
            return FormatData(invoice);
        }catch (e) {
            throw new BadRequestError(e.message, e)
        }
    }

    async updateInvoice (walletAddresses, paymentAmount)  {

        try {

            const invoice = await this.repository.getOneInvoice({ walletAddresses: walletAddresses, status: 'pending' });
            if (!invoice) console.log(walletAddresses)
            else {
                const { status, amount } = invoice || {};

                // if (status.toLowerCase() == "completed") bre;
                console.log(amount, paymentAmount, walletAddresses)
                if (amount <= paymentAmount ) { invoice.status = "completed"; }
                else { invoice.status = "partial_payment"; }

                const inv = await this.repository.updateInvoice(invoice._id, invoice)
                // const inv = await invoice.save()
                console.log(inv)
            }

        } catch (e) { throw e}
    }


    async invoiceTopUp (id, userInput, user) {
        const { data: { phone, address, amount } } = this.getInvoiceById(id);

        const newAmount = 0;

        userInput = {
            amount: newAmount,
            phone: phone,
            address: address,
            prevInvoiceId: id
        }

        const res = await this.createInvoice(userInput, user);
    }
}

module.exports = InvoiceService;


