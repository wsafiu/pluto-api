const { OrderModel } = require('../models');
const {APIError, STATUS_CODES} = require("../../utils/app-errors");

class OrderRepository {

    async createOrder (order) {
        try {
            const newOrder = await OrderModel.create(order);
            return newOrder;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order creation failed', false)
        }
    }

    async getOrder (query = {}) {
        try {
            const orders = OrderModel.find(query);
            return orders;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No order find')
        }
    }

    async getOrderById (id) {
        try {
            const order = OrderModel.findById(id);
            return order;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order not find')
        }
    }

    async updateOrder (id, update) {
        try {
            const order = OrderModel.findByIdAndUpdate(id, update);
            return order;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order update fail')
        }
    }

    async getTotalOrder () {
        try {
            const orders = await OrderModel.aggregate([{$group: { _id: null, amount: { $sum: "$value" } }}]);
            if (orders.length == 0 ) return 0
            return  orders[0]['amount'];
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order update fail')
        }
    };

    async getOrderByBlockHash(blockHash) {
        try {
            const orders = await OrderModel.find({ blockHash: blockHash })
            return orders;
        }catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order update fail')
        }

    }
}

module.exports = OrderRepository;