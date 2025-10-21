const express = require("express");
const router = express.Router();
const HoaDon = require("../models/hoadon");
const SanPham = require("../models/sanpham");
const { ensureLogin } = require("../middleware/auth");

function getStartOf(timeUnit) {
    const now = new Date();
    if (timeUnit === 'week') {
        const day = now.getDay(); // 0 (CN) - 6 (T7)
        now.setDate(now.getDate() - day);
    } else if (timeUnit === 'month') {
        now.setDate(1);
    } else if (timeUnit === 'quarter') {
        const currentMonth = now.getMonth();
        const startMonth = currentMonth - (currentMonth % 3);
        now.setMonth(startMonth, 1);
    } else if (timeUnit === 'year') {
        now.setMonth(0, 1);
    }
    now.setHours(0, 0, 0, 0);
    return now;
}

// GET: /thongke
router.get("/", ensureLogin, async (req, res) => {
    const now = new Date();

    const doanhThu = {
        tuan: await tinhDoanhThu(getStartOf('week'), now),
        thang: await tinhDoanhThu(getStartOf('month'), now),
        quy: await tinhDoanhThu(getStartOf('quarter'), now),
        nam: await tinhDoanhThu(getStartOf('year'), now),
    };

    // Sản phẩm bán chạy nhất
    const hoaDon = await HoaDon.find().populate("danhSachSanPham.sanphamId");
    const thongKe = {};

    hoaDon.forEach(hd => {
        hd.danhSachSanPham.forEach(item => {
            const id = item.sanphamId?._id;
            if (!id) return;
            thongKe[id] = (thongKe[id] || 0) + item.soLuong;
        });
    });

    let topSanPham = null;
    if (Object.keys(thongKe).length > 0) {
        const maxId = Object.keys(thongKe).reduce((a, b) => thongKe[a] > thongKe[b] ? a : b);
        const sanPham = await SanPham.findById(maxId);
        topSanPham = {
            TenSanPham: sanPham.TenSanPham,
            soLuong: thongKe[maxId]
        };
    }

    res.render("thongke", {
        doanhThu,
        topSanPham,
        title: "Thống kê",
        pageType: "thongke"
    });
});

// Tính doanh thu trong khoảng thời gian
async function tinhDoanhThu(tuNgay, denNgay) {
    const hoaDons = await HoaDon.find({
        ngayDat: { $gte: tuNgay, $lte: denNgay }
    });

    return hoaDons.reduce((total, hd) => total + (hd.tongTien || 0), 0);
}

module.exports = router;