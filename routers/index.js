const express = require('express');
const router = express.Router();
const SanPham = require('../models/sanpham');

// Trang chủ - hiển thị 6 sản phẩm mới nhất
router.get('/', async (req, res) => {
    try {
        const sanpham = await SanPham.find()
            .populate('HangSanXuat')
            .populate('PhanLoai')
            .sort({ _id: -1 })
            .limit(6);
            
        res.render('index', {
            title: 'Trang chủ',
            activePage: "trangchu",
            pageType: 'trangchu',
            sanpham,
            session: req.session
        });
    } catch (err) {
        res.status(500).render('error', {
            message: 'Lỗi khi tải sản phẩm.',
            error: err
        });
    }
});

module.exports = router;