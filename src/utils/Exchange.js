const cctx = require("ccxt");

const  OrderService = require('../services/order-service')
const  InvoiceService = require('../services/invoice-service')
const  SaleService = require('../services/sale-service')
const {APIError, STATUS_CODES} = require("./app-errors");



const exchnageId = 'binance'
const config = {
    'apiKey': 'b36786495c9ed0619488597f5b229e7401d9985acfdc313b955075d4bb480982',
    'secret': 'c08abba0bfce5657b3f6384cc0c0fd08693894db97473a5fce100e48f512e7c4',
    'options': {
        'defaultType': 'future',
    },
}
const CctxExchange = cctx.binance;
const exchnage = new CctxExchange(config)
exchnage.setSandboxMode(true)

class Exchange {

    constructor() {
        this.saleService = new SaleService();
        this.orderService = new OrderService();
        this.invoiceService = new InvoiceService();

        this.sell = this.sell.bind(this);
    }

    async getAmount ()  {
        try {
            let amount = 0
            const totalOrder = await this.orderService.getTotalOrder();
            const totalSale = await this.saleService.getTotalSale();

            console.log("comp", totalOrder, totalSale)

            amount = (totalOrder - totalSale).toString();
            const pointIndex = amount.indexOf('.');

            const amountApproximate = parseFloat(amount.slice(0, pointIndex + 4));
            console.log("amount is ", amountApproximate);

            return amountApproximate;
        } catch (e) {
            console.log(e)
            throw new APIError("GET-AMOUNT_EXCHANGE_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }

    async #orderCancelChecker (orderId, order) {
       try {
           let isCancel = false
           while (!isCancel) {
               const while_order = await exchnage.fetchOrder(orderId, "BTC/BUSD");
               const while_status = (while_order['info']['status']).toLowerCase();
               console.log("checking cancellation of orders", while_status)
               if (while_status == "canceled") {
                   isCancel = true;
                   return true;
               }
               else if (while_status == "filled") {
                   await this.#saveSale(order);
                   isCancel = true;
                   return false
               }
           }
       } catch (e) {
           throw new APIError("ORDER-CANCEL-CHECKER_EXCHANGE_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
       }
    }

    async #saveSale (order, blockHash) {
        const {  orderId, executedQty, avgPrice } = order.info;
        const sale = await this.saleService.createSale(orderId, executedQty, avgPrice, blockHash);

        if (!sale) return;
        console.log("about to call updateOrder", sale)
        //    get all latest and update them with the sell price
        await this.orderService.updateOrder(blockHash)

        const orders = await this.orderService.getOrderByBlockHash(blockHash);

        console.log(orders.length)
        for(const order of orders) {
            const { address,  paymentAmount } = order;
            await this.invoiceService.updateInvoice(address, paymentAmount)
        }
    }

    async sell(amount, blockHash) {
        try {
            const { bids } = await exchnage.fetchOrderBook("BTC/BUSD", 10)
            const { asks } = await exchnage.fetchOrderBook("BTC/BUSD", 10)
            const price = Math.ceil((bids[0][0] + asks[0][0])/2);

            const params = {'timeInForce': "GTX"};
            console.log("amount parse to Order", typeof amount, amount)
            const order = await exchnage.createOrder("BTC/BUSD", "limit", "sell", amount, price, params);
            const orderId = order["info"]["orderId"];

            setTimeout(async () => {
                try {
                    const order = await exchnage.fetchOrder(orderId, "BTC/BUSD");
                    const status = (order['info']['status']).toLowerCase();

                    if (status == "new") {
                        console.log(status)
                        await exchnage.cancelOrder(orderId, "BTC/BUSD", params)
                        // exchange.cancelOrder(orderId)
                        const isCancel = await this.#orderCancelChecker(orderId, order)
                        if (isCancel) await this.sell(amount, blockHash);
                    }
                    else if (status == "partially_filled") {
                        console.log(status)
                        const executeAmount = Number(order['info']["executedQty"]);
                        amount -= executeAmount;

                        // put order to saledb
                        this.#saveSale(order, blockHash)

                        await exchnage.cancelOrder(orderId, "BTC/BUSD", params)
                        const isCancel = await this.#orderCancelChecker(orderId, order)
                        if (isCancel) await this.sell(amount, blockHash);
                    }
                    else if (status == "filled") {
                        console.log(status)
                        console.log("It suppose pass");
                        console.log(order);
                       await this.#saveSale(order, blockHash)
                    }
                    else //(status == "expired" || status == "rejected")
                    {
                        console.log(status)
                        await this.sell(amount, blockHash)
                    }
                }catch (e) { console.log(e) }
            }, 10000)
        } catch (e) {
            throw new APIError("SELL_EXCHANGE_ERROR", STATUS_CODES.INTERNAL_ERROR, e, false);
        }
    }
}

module.exports = Exchange;

