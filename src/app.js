const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const cookieSession = require('cookie-session')
const cors = require('cors')



const { userRouter, orderRouter, invoiceRouter } = require('./api');
const ErrorHandler = require('./utils/error-handler');
const BlockProcess = require('./utils/Block');



module.exports = async (app) => {

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieSession({
        name: 'pluto-session',
        keys: ['eyrfgv456789087fugiui'],
    }))
    app.use(passport.initialize());
    app.use(cors())

/***************************************************************
 ******************* APIs *************************************
 * **************************************************************/

    app.use('/api/users', userRouter());
    app.use('/api/invoice', invoiceRouter());

/**************************** End ***************************/

/***************************************************************
 ******************* Start Block Process ********************
 * **********************************************************/
    const blockProcess = new BlockProcess()
    const blockProcessInitiator = async () => {
        try {
            // setInterva(blockProcess.blockWorker, 1 * 60000)
            await blockProcess.blockWorker()
        }catch (e) {
            e.statusCode = 500;
            await ErrorHandler(e, null, null, null, true)
            console.log("app", e)
        }
    }


    blockProcessInitiator()
    setInterval(() => {
        blockProcessInitiator()
    }, 3 * 60000)

/****************************** End ***************************/


/***************************************************************
 ******************* Error Handler ********************
 * **********************************************************/
    app.use(ErrorHandler)

/****************************** End ***************************/
}


