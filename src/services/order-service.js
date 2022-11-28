const { OrderRepository } = require('../database');
const { getC2cPrice } = require("../utils");
const SaleService = require('./sale-service');


class OrderService {

    constructor() {
        this.repository = new OrderRepository();
        this.saleService = new SaleService()
    }

    async createOrder (tempOrderBook) {
        try {
            return await this.repository.createOrder(tempOrderBook)
        }catch (e) {
            throw e;
        }
    }

    async getTotalOrder () {
        try {
            return await this.repository.getTotalOrder()
        } catch (e) {
            throw e;
        }
    };

    async getAllOrder() {
        try {
            return await this.repository.getOrder({});
        }catch (e) {
            throw e;
        }
    }

    async updateOrder (blockHash) {
        console.log("bravo updateOrder called")
        try {
            //getting current blockHash from db and updating them
            const orders = await this.repository.getOrderByBlockHash(blockHash);
            if (orders.length === 0) return;

            const sellPrice = await this.saleService.getWeightedSellPrice(blockHash);
            const sellRate = await getC2cPrice(); //have -1 inside it already
            const buyRate = sellRate - 1;
            const buyPrice = (99.95 / 100) * sellPrice


            for (const order of orders) {
                const paymentAmount = order.value * buyPrice * buyRate;

                order.paymentAmount = paymentAmount;
                order.buyPrice = buyPrice;
                order.sellPrice = sellPrice;
                order.buyRate = buyRate;
                order.sellRate = sellRate;

                await this.repository.updateOrder(order._id, order)
            }
        } catch (e) {throw e;}
    }

    async getOrderByBlockHash(blockHash) {
        try {
            const orders = await this.repository.getOrderByBlockHash(blockHash)
            if(orders.length === 0) return;
            return orders;
        } catch (e) {
            throw e;
        }
    }
}

module.exports = OrderService