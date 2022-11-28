const { createLogger, transports } = require('winston');
const { AppError } = require('./app-errors');

const LogErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({filename: 'app-error-log'})
    ]
});

const BlockErrors = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({filename: 'block-error-log'})
    ]
});

class ErrorLogger {
    constructor() {}
    async logError(err) {
        console.log('==================== Start Error Logger ===============');
        LogErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()}-${(err)}`
        })
        console.log('==================== End Error Logger ===============');

        return false;
    }

    async logBlockError(err) {
        console.log('==================== Start Error Logger ===============');
        BlockErrors.log({
            private: true,
            level: 'error',
            message: `${new Date()}-${(err)}`
        })
        console.log('==================== End Error Logger ===============');

        return false;
    }

    isTrustError(error) {
        if (error instanceof AppError) {
            return error.isOperational;
        }else {
            return false
        }
    }
}

const ErrorHandler = async (err, req, res, next, blockError = false) => {
    const errorLogger = new ErrorLogger()

    // console.log("===================================  \n", err, "\n ========================================")
    // process.on("uncaughtException", (reason) => {
    //     console.log(reason, 'UNHANDLED');
    //     throw reason;
    // })

    process.on("uncaughtException", (error) => {
        errorLogger.logError(error);
        if(errorLogger.isTrustError(error)){}
    })

    if(err) {
        if(blockError) {
            await errorLogger.logBlockError();
            return false;
        }

        await errorLogger.logError(err);

        console.log(errorLogger.isTrustError(err))
        if(errorLogger.isTrustError(err)) {
            if(err.errorStack) {
                const errorDescription = err.errorStack;
                return res.status(err.statusCode).json({'message': errorDescription})
            }
            return res.status(err.statusCode).json({'message': err.message});
        }else {
            //process exit // terriablly wrong with flow need restart
            const status = err.statusCode ? err?.statusCode : 500;
            return res.status(status).json({'message': err.message})
        }
        const status = err.statusCode ? err?.statusCode : 500;
        return res?.status(status).json({'message': err.message})
    }
    next()
}

module.exports = ErrorHandler
