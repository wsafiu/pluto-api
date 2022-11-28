exports.currentUser = (req, res, next) => {
    if (!req.session?.token) {
        return next()
    }

    console.log("session is ",  req.session.token)
    req.headers.authorization = `bearer ${req.session.token}`
    next()
}