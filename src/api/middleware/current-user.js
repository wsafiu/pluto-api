exports.currentUser = (req, res, next) => {
    console.log("session is ",  req.headers.session)
    if (!req.session?.token) {
        return next()
    }

    console.log("session is ",  req.session)
    req.headers.authorization = `bearer ${req.session.token}`
    next()
}