
module.exports.isLoggedIn = async (req, res, next) => {
    const user =  req.session.currentUser;
    if (!user) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'ログインしてください');
        return res.redirect('/login');
    }
    next();
}