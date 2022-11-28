const { BlockHashModel } = require('../models');
const {APIError, STATUS_CODES} = require("../../utils/app-errors");

class BlockhashRepository {

    async createBlock (blockHash) {
        try {
            const block = BlockHashModel.create(blockHash);
            return block;
        } catch (e) {
            console.log(e)
            // throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Block')
        }
    }

    async getBlock (query = {}) {
        try {
            const block = BlockHashModel.find(query);
            return block;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No block find')
        }
    }

    async getOneBlock (query = {}) {
        try {
            const block = BlockHashModel.findOne(query).sort({createdAt: -1});
            return block;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No block find')
        }
    }

    async updateBlock (id, update) {
        try {
            const order = BlockHashModel.findByIdAndUpdate(id, update, );
            return order;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Order update fail')
        }
    }
}

module.exports = BlockhashRepository;