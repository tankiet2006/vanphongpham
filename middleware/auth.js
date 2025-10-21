function ensureLogin(req, res, next) {
    if (req.session && req.session.MaNguoiDung) {
        return next();
    }
    res.redirect("/dangnhap");
}

module.exports = { ensureLogin };