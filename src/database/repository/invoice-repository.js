const { InvoiceModel } = require('../models');
const {APIError, STATUS_CODES} = require("../../utils/app-errors");

class InvoiceRepository {

//    Create invoice
    async createInvoice (invoice) {
        try {
            const newInvoice = InvoiceModel.create(invoice);
            return newInvoice;
        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Invoice')
        }
    }

//    fetch all invoice
    async getInvoice (query) {
        console.log(query)
        try {
            const invoices = await InvoiceModel.find(query);
            return invoices;
        } catch (e) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No invoice find')
        }
    }

    async getOneInvoice (query = {}) {
        try {
            const invoice = InvoiceModel.findOne(query);
            return invoice;
        } catch (e) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'No invoice find')
        }
    }

//    get invoice by Id
    async getInvoiceById (id) {
        try {
            const invoice = InvoiceModel.findById(id);
            return invoice;
        } catch (e) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Invoice not find')
        }
    }
//    update Invoice
    async updateInvoice (id, update) {
        try {
            const invoice = InvoiceModel.findByIdAndUpdate(id, update);
            return invoice;
        } catch (e) {
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Invoice update fail')
        }
    }

    async countInvoice () {
        try {
            return await InvoiceModel.count();
        } catch (e) {
            console.log(e)
        }
    }

}

module.exports = InvoiceRepository