const axios = require('axios');

const  OrderService  = require('../services/order-service');
const InvoiceService = require('../services/invoice-service')
const { BlockHashRepository } = require('../database')
const Exchange = require('./Exchange')
const {APIError, STATUS_CODES} = require("./app-errors");

const exchange = new Exchange();

class BlockProcess {
    #tempOrderBook = {}
    #newAddressBook = []

    constructor() {
        this.orderService = new OrderService()
        this.repository = new BlockHashRepository()
        this.invoiceService = new InvoiceService()

        this.getBlockHash = this.getBlockHash.bind(this)
        this.getCurrentTransactions = this.getCurrentTransactions.bind(this)
        this.blockWorker = this.blockWorker.bind(this)
        this.checkBlock = this.checkBlock.bind(this)
    }
// { wallet_address: [{}] }
    #addValue (key, value)  {
        if (this.#tempOrderBook.hasOwnProperty(key)) {
            this.#tempOrderBook[key].push(value)
        } else {
            this.#tempOrderBook[key] = []
            this.#tempOrderBook[key].push(value)
        }
    }

    #sep (txs, blockHash) {
        // console.log(txs)
        let tx;
        for (tx of txs) {
            const { txid, hash, vout } = tx
            let item;
            for (item of vout) {
                const { value, n, scriptPubKey: { address } } = item;
                const orderBook = { address, txid, value, n, blockHash }
                if (value > 0) {
                    this.#addValue(address, orderBook)
                    if (this.#newAddressBook.includes(address)) continue;
                    else this.#newAddressBook.push(address)
                }
            }
        }
    }

    async #addTransaction (transactions, blockHash) {
        try {
            if (transactions.length == 0) return;
            let txn;
            const block = await this.repository.getOneBlock({ blockHash: blockHash });
            for (txn of transactions) {
                if ( block.transactions.includes(txn._id)) continue;
                block.transactions.push(txn._id)
            }
            this.repository.updateBlock(block._id, block)
        }catch (e) {
            throw new APIError("ADD_TRANSACTION_BLOCK_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }

    async getBlockHash ()  {
        try{
            // const { data: { result } } = await axios.post("https://btc.getblock.io/mainnet/",
            const { data: { result } } = await axios.post("https://btc.getblock.io/testnet/",
                {
                    "jsonrpc": "2.0",
                    "method": "getbestblockhash",
                    "params": [],
                    "id": "getblock.io"
                }, {
                    headers: {
                        // "x-api-key": "867910e6-3f67-4b9f-829d-3363971a55eb",
                        "x-api-key": "b2bc4c21-7ca1-4082-81c3-5ac848ad1c20",
                        "Content-Type": "application/json"
                    }
                })
            console.log(result);
            return result;
            // return "000000000007fa622409661c13994d42e85461e81930bbe4defdf7c5c29c9174";
        }
        catch (e) {
            throw new APIError("GET-BLOCK_BLOCK_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }

    }

    async getCurrentTransactions  (blockHash) {
        this.#tempOrderBook = {}
        this.#newAddressBook = []
        try {
            // const { data } = await axios.post("https://btc.getblock.io/mainnet/",
            const { data } = await axios.post("https://btc.getblock.io/testnet/",
                {
                    "jsonrpc": "2.0",
                    "method": "getblock",
                    "params": [
                        blockHash, 2
                    ],
                    "id": "getblock.io"
                }, {
                    headers: {
                        // "x-api-key": "867910e6-3f67-4b9f-829d-3363971a55eb",
                        "x-api-key": "b2bc4c21-7ca1-4082-81c3-5ac848ad1c20",
                        "Content-Type": "application/json"
                    }
                })

            const txs = data["result"]["tx"];
            this.#sep(txs, blockHash)
            const resp = { tempOrderBook: this.#tempOrderBook, newAddressBook: this.#newAddressBook };
            return resp
        }
        catch (e) {
            throw new APIError("GET-CURRENT-TRANSACTION_BLOCK_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }

    async checkBlock(blockHash) {
        try {
            const { tempOrderBook, newAddressBook }  = await this.getCurrentTransactions(blockHash) || {};
            if (tempOrderBook == undefined || newAddressBook == undefined) await this.checkBlock(blockHash)
            else  {
                const { data } = await this.invoiceService.getInvoice({})     ////"{ createdAt: { $gt:  } }"
                const a = new Set(data)
                const b = new Set(newAddressBook)
                const intersect = new Set(data.filter(item => b.has(item.walletAddresses)));

                if ([...intersect].length === 0) return;
                console.log("Interseption", [...intersect]);
                await this.#addTransaction([...intersect], blockHash) //save transaction to database

                for (const item of [...intersect]) {
                    const tempBook = tempOrderBook[item.walletAddresses]
                    console.log("from Looping", tempBook)
                    await this.orderService.createOrder(tempBook)  //Order.create(tempBook)
                }
                console.log("parser", await exchange.getAmount())
                console.log("**************************************", "\n", "about to sell", "\n",  "***********************************")
                await exchange.sell(await exchange.getAmount(), blockHash)
            }
        }catch (e) {
            throw new APIError("CHECK-BLOCK_BLOCK_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }

    async blockWorker () {
        try {
            const blockHash = await this.getBlockHash();
            if (!blockHash) return;

            /*************************************************************
             * compairing blockhash
             *************************************************************/
            const block = await  this.repository.getOneBlock({ blockHash: blockHash})
            //    same blockhash function return with no action
            if (block) return;
            else {
                const lastSaveHash = await this.repository.getOneBlock();
                if (lastSaveHash && lastSaveHash.transactions.length == 0) lastSaveHash.remove()
                await  this.repository.createBlock({blockHash: blockHash})
                //      different block hash
                await this.checkBlock(blockHash);
                console.log("+++++++++++++++++++++++Finish++++++++++++++++++++++++++++++++++")
            }
        }
        catch(e) {
            throw new APIError("CHECK-BLOCK_BLOCK_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }

}

module.exports = BlockProcess;