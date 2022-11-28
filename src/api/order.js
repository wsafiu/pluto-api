const express = require('express');


/* GET users listing. */
const orderRouter = () => {

    const router = express.Router();

    router.get('/', function(req, res, next) {
        res.json('respond with a resource');
    });

    return router;
}


module.exports = orderRouter;
