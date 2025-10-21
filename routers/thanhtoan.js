const express = require("express");
const router = express.Router();
const GioHang = require("../models/giohang");
const SanPham = require("../models/sanpham");
const HoaDon = require("../models/hoadon");
const { ensureLogin } = require("../middleware/auth");

// POST: Trang xác nhận thanh toán
router.post("/", ensureLogin, async (req, res) => {
    const ids = req.body.ids?.split(",") || [];
    const userId = req.session.MaNguoiDung;

    try {
        const giohang = await GioHang.findOne({ taiKhoanID: userId }).populate("sanpham.sanphamId");

        if (!giohang || !giohang.sanpham || giohang.sanpham.length === 0) {
            return res.status(400).send("Không tìm thấy sản phẩm nào trong giỏ hàng.");
        }

        const danhSach = giohang.sanpham.filter(sp => {
            return sp.sanphamId && ids.includes(sp.sanphamId._id.toString());
        });

        const total = danhSach.reduce((sum, item) => {
            return sum + item.sanphamId.Gia * item.soLuong;
        }, 0);

        res.render("thanhtoan", {
            danhSachSanPham: danhSach,
            ids: ids.join(","),
            user: req.session.user,
            total
        });
    } catch (err) {
        console.error("Lỗi trang thanh toán:", err);
        res.status(500).send("Lỗi khi tải trang thanh toán.");
    }
});

module.exports = router;