const { SaleRepository } = require('../database');

class SaleService {

    constructor() {
        this.repository = new SaleRepository();
    }

    async getTotalSale () {
        try {
           return  await this.repository.getTotalSale();
        } catch (e) {
            console.log(e)
        }
    }

    async createSale(id, amount, price, blockHash) {

        try {
            const sale = {
                orderId: id,
                amount: amount,
                sellPrice: price,
                time: Date.now(),
                blockHash: blockHash
            }
            return await this.repository.createSale(sale)
        } catch (e) {
            console.log(e)
        }
    }

    async getSaleByBlockHash(blockHash) {
        try {
            const sales = await this.repository.getSaleByBlockHash(blockHash);
            if(sales.length == 0) return;
            return sales;
        }catch (e) {
            console.log(e)
        }
    }


    async getWeightedSellPrice (blockHash) {
        try {
            const sales = await this.repository.getSaleByBlockHash(blockHash);
            if (sales.length == 0) return 0;
            const totalSalesAmount = sales.length == 1 ? sales[0].amount :
                sales.reduce((a, b) => a.amount + b.amount, 0);
            let weightedSellPrice = 0;
            for (const sale of sales) {
                weightedSellPrice += sale.amount/totalSalesAmount * sale.sellPrice;
            }

            return weightedSellPrice;
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = SaleService;