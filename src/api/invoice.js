const express = require('express');
const { body, validationResult } = require('express-validator');

const { verifyUser } = require('./middleware/auth');
const InvoiceService  = require('../services/invoice-service')
const { initiateError } = require("../utils");
const { STATUS_CODES, BadRequestError} = require("../utils/app-errors");
const {colors} = require("debug");
const {currentUser} = require("./middleware/current-user");
const {BadRequest} = require("ccxt");


/* GET users listing. */
const invoiceRouter = () => {

    const router = express.Router();
    const service = new InvoiceService();

    router.route("/")
        .get(verifyUser, async (req, res, next) => { //should always be for admin to get all post
            const { query } = req
            try {
                let invoices = [];
                if (query.hasOwnProperty("address")) {
                    console.log("query parameter found", query)
                    const { data } = await service.getInvoice({ walletAddresses: query.address})
                    invoices = data;
                }

                else if (query.hasOwnProperty("invoiceId")) {
                    console.log("query parameter found", query);
                    const { data } = await service.getInvoiceById(query.invoiceId);
                    invoices = data;
                }
                else {
                    console.log(query)
                    const admin = false
                    if (req.user._id != req.query.user && !admin)
                        throw new BadRequestError("Unauthorized request", )
                    const { data } = await service.getInvoice(query);
                    invoices = data;
                    console.log(invoices)
                }
                res.status(200).json(invoices);
            } catch (e) { next(e) }
        })
        .post(
            // currentUser,
            verifyUser,
            body("phone").trim().isMobilePhone().withMessage("Enter a valid Phone number"),
            body("amount").trim().toInt().custom((value, {req}) => {
                if(value <= 0) throw new Error("Enter a valid amount")
                return true
            }),

            async (req, res, next) => {
                try {

                    const err = validationResult(req);
                    if(!err.isEmpty()) initiateError(STATUS_CODES.BAD_REQUEST, err.array().map(item => item.param))

                    const { body, user } = req;
                    console.log(body)
                    const { data } = await service.createInvoice(body, user);
                    res.status(200).json(data)
                } catch (e) { next(e) }
            }
        )
        // .all(forbidden)

    router.route("/:invoiceId")
        .get(async (req, res, next) => {
            try {
                const { data } = await service.getInvoiceById(req.params.invoiceId);
                res.status(200).json(data);
            } catch (e) { next(e) }
        })

    return router;
}


module.exports = invoiceRouter;
