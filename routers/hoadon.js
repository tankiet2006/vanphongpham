const express = require("express");
const router = express.Router();
const HoaDon = require("../models/hoadon");
const GioHang = require("../models/giohang");
const { ensureLogin } = require("../middleware/auth");

// GET: Danh sách hóa đơn
router.get("/", ensureLogin, async (req, res) => {
    const hoaDon = await HoaDon.find().populate("taiKhoanID");
    res.render("hoadon", { 
        hoaDon: hoaDon, 
        title: "Danh sách hóa đơn", 
        pageType: "hoadon" 
    });
});

// POST: Tạo hóa đơn mới
router.post("/create", ensureLogin, async (req, res) => {
    try {
        const taiKhoanID = req.session.MaNguoiDung;
        const { HoVaTen, SoDienThoai, Email, DiaChi, GhiChu, ids } = req.body;

        const idList = ids?.split(",") || [];
        const gioHang = await GioHang.findOne({ taiKhoanID }).populate("sanpham.sanphamId");

        if (!gioHang || gioHang.sanpham.length === 0) {
            return res.status(400).send("Giỏ hàng trống.");
        }

        // Chỉ lấy sản phẩm được chọn
        const danhSachSanPham = gioHang.sanpham
            .filter(item => idList.includes(item.sanphamId._id.toString()))
            .map(item => ({
                sanphamId: item.sanphamId._id,
                soLuong: item.soLuong,
                giaBan: item.sanphamId.Gia
            }));

        if (danhSachSanPham.length === 0) {
            return res.status(400).send("Không có sản phẩm nào được chọn.");
        }

        const tongTien = danhSachSanPham.reduce((total, item) => total + item.giaBan * item.soLuong, 0);

        const hoaDon = new HoaDon({
            taiKhoanID,
            HoVaTen,
            SoDienThoai,
            Email,
            DiaChi,
            GhiChu,
            danhSachSanPham,
            tongTien,
            ngayDat: new Date(),
        });

        await hoaDon.save();

        // Cập nhật giỏ hàng: loại bỏ sản phẩm đã mua
        gioHang.sanpham = gioHang.sanpham.filter(item => !idList.includes(item.sanphamId._id.toString()));
        await gioHang.save();

        // Lấy lại hóa đơn đã populate để hiển thị ra view
        const fullHoaDon = await HoaDon.findById(hoaDon._id).populate("danhSachSanPham.sanphamId");

        // ✅ render view cảm ơn và truyền dữ liệu
        res.render("camon", { hoaDon: fullHoaDon });

    } catch (err) {
        console.error("Lỗi tạo hóa đơn:", err);
        res.status(500).send("Lỗi khi tạo hóa đơn.");
    }
});

// GET: Chi tiết hóa đơn
router.get("/chitiet/:id", ensureLogin, async (req, res) => {
    const { id } = req.params;
    try {
        const hoaDon = await HoaDon.findById(id).populate("danhSachSanPham.sanphamId");
        if (!hoaDon) {
            return res.status(404).send("Hóa đơn không tồn tại.");
        }
        res.render("hoadon_chitiet", {
            hoaDon: hoaDon,
            title: "Chi tiết hóa đơn",
            pageType: "hoadon"
        });
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
        res.status(500).send("Lỗi khi lấy chi tiết hóa đơn.");
    }
});

// GET: Hóa đơn của tôi
router.get("/cuatoi/:id", ensureLogin, async (req, res) => {
    const { id } = req.params;
    const hoaDon = await HoaDon.find({ taiKhoanID: id }).populate("danhSachSanPham.sanphamId");
    res.render("hoadon_cuatoi", {
        hoaDon: hoaDon,
        title: "Hóa đơn của tôi",
        pageType: "hoadon"
    });
});

module.exports = router;