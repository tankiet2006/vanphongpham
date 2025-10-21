const express = require("express");
const router = express.Router();
const GioHang = require("../models/giohang");
const SanPham = require("../models/sanpham");
const { ensureLogin } = require("../middleware/auth");

// GET: Xem giỏ hàng
router.get("/", ensureLogin, async (req, res) => {
    const userId = req.session.MaNguoiDung;

    try {
        const giohang = await GioHang.findOne({ taiKhoanID: userId })
            .populate("sanpham.sanphamId");

        const giohangHienThi = giohang
            ? giohang.sanpham.map((item) => ({
                  sanpham: item.sanphamId,
                  soLuong: item.soLuong,
              }))
            : [];

        res.render("giohang", {
            title: "Giỏ hàng của bạn",
            giohang: giohangHienThi,
            pageType: "giohang",
        });
    } catch (err) {
        console.error("Lỗi khi tải giỏ hàng:", err);
        res.status(500).send("Lỗi server");
    }
});

// POST: Thêm vào giỏ hàng
router.post("/them/:id", ensureLogin, async (req, res) => {
    const userId = req.session.MaNguoiDung;
    const productId = req.params.id;
    const soLuong = parseInt(req.body.soLuongMua) || 1;

    try {
        let giohang = await GioHang.findOne({ taiKhoanID: userId });

        if (!giohang) {
            giohang = new GioHang({
                taiKhoanID: userId,
                sanpham: [{ sanphamId: productId, soLuong }],
            });
        } else {
            const index = giohang.sanpham.findIndex(
                (item) => item.sanphamId.toString() === productId
            );

            if (index !== -1) {
                giohang.sanpham[index].soLuong += soLuong;
            } else {
                giohang.sanpham.push({ sanphamId: productId, soLuong });
            }
        }

        await giohang.save();
        res.json({ success: true, message: "Thêm sản phẩm vào giỏ hàng thành công!" });
    } catch (err) {
        console.error("Lỗi thêm vào giỏ hàng:", err);
        res.json({ success: false, message: "Lỗi khi thêm vào giỏ hàng." });
    }
});

// POST: Xóa sản phẩm khỏi giỏ hàng
router.post("/xoa/:id", ensureLogin, async (req, res) => {
    const userId = req.session.MaNguoiDung;
    const productId = req.params.id;

    try {
        await GioHang.updateOne(
            { taiKhoanID: userId },
            { $pull: { sanpham: { sanphamId: productId } } }
        );
        res.redirect("/giohang");
    } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err);
        res.status(500).send("Lỗi server");
    }
});

// POST: Cập nhật số lượng
router.post("/capnhat/:id", ensureLogin, async (req, res) => {
    const userId = req.session.user._id;
    const productId = req.params.id;
    const soLuongMoi = parseInt(req.body.soLuongMoi);

    if (soLuongMoi <= 0) return res.redirect("/giohang");

    try {
        const giohang = await GioHang.findOne({ taiKhoanID: userId });

        if (giohang) {
            const index = giohang.sanpham.findIndex(
                (item) => item.sanphamId.toString() === productId
            );

            if (index !== -1) {
                giohang.sanpham[index].soLuong = soLuongMoi;
                await giohang.save();
            }
        }

        res.redirect("/giohang");
    } catch (err) {
        console.error("Lỗi cập nhật số lượng:", err);
        res.status(500).send("Lỗi server");
    }
});

module.exports = router;