const auth = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    }
    return res.redirect('/user/login')
}

module.exports = auth;