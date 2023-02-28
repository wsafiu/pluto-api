const {  SaleModel, OrderModel} = require('../models');
const {APIError, STATUS_CODES} = require("../../utils/app-errors");

class SaleRepository {
    async createSale (sale) {
        try {
            const newSale = await SaleModel.create(sale);
            return newSale;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Sale creation failed')
        }

    }

    async getSale (query = {}) {
        try {
            const sales = SaleModel.find(query);
            return sales;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No sale find')
        }
    }

    async getSaleById (id) {
        try {
            const sale = SaleModel.findById(id);
            return sale;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Sale not find')
        }
    }

    async updateSale (id, update) {
        try {
            const sale = SaleModel.findByIdAndUpdate(id, update);
            return sale;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Sale update fail')
        }
    }

    async getSaleByBlockHash(blockHash) {
        try {
            const sales = await SaleModel.find({ blockHash: blockHash })
            return sales;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Sale not found!!!!')
        }
    }

    async getTotalSale () {
        try {
            const sales = await SaleModel.aggregate([{$group: { _id: null, amount: { $sum: "$amount" } }}]);
            if (sales.length == 0 ) return 0
            return  sales[0]['amount'];
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order update fail')
        }
    };
}

module.exports = SaleRepository