var express = require('express');
var router = express.Router();
var SanPham = require('../models/sanpham');
var HangSanXuat = require('../models/hangsanxuat');
var PhanLoai = require('../models/phanloai');
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

//GET: Tất cả sản phẩm
router.get('/', async (req, res) => {
    try {
        const sanpham = await SanPham.find()
            .populate('HangSanXuat')
            .populate('PhanLoai')
            .sort({ _id: -1 });

        res.render('sanpham', {
            title: 'Danh sách sản phẩm',
            sanpham,
            pageType: 'sanpham',
            session: req.session
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
        res.status(500).render('error', {
            message: 'Lỗi khi tải danh sách sản phẩm.',
            error: err
        });
    }
});

// GET: Danh sách sản phẩm
router.get('/danhsach', async (req, res) => {
    try {
        const sp = await SanPham.find()
            .populate('HangSanXuat')
            .populate('PhanLoai')
            .sort({ _id: -1 });
        console.log('Danh sách sản phẩm:', sp); // debug
        res.render('sanpham_danhsach', {
            title: 'Danh sách sản phẩm',
            sanpham: Array.isArray(sp) ? sp : [],
            pageType: 'sanpham_danhsach',
        });
    } catch (err) {
        console.error('Lỗi khi hiển thị danh sách sản phẩm:', err);
        res.status(500).render('error', {
            message: 'Lỗi khi hiển thị danh sách sản phẩm.',
            error: err
        });
    }
});

// GET: Thêm sản phẩm
router.get('/them', async (req, res) => {
    try {
        const hangsanxuat = await HangSanXuat.find();
        const phanloai = await PhanLoai.find();

        res.render('sanpham_them', {
            title: 'Thêm sản phẩm',
            hangsanxuat,
            phanloai,
            pageType: 'sanpham_them'
        });
    } catch (err) {
        console.error('❌ Lỗi thêm sản phẩm:', err);
        res.status(500).send(`
            <h1 style="color:red;">Lỗi khi thêm sản phẩm</h1>
            <pre>${err.stack}</pre>
            <a href="/sanpham/them">← Quay lại</a>
        `);
    }
});

// POST: Thêm sản phẩm
router.post('/them', upload.array('HinhAnh[]'), async (req, res) => {
    try {
        console.log('BODY:', req.body);
        console.log('FILE:', req.file);

        const hinhAnhPaths = req.files.map(file => '/uploads/' + file.filename);

        const data = {
            TenSanPham: req.body.TenSanPham,
            HangSanXuat: req.body.HangSanXuat,
            PhanLoai: req.body.PhanLoai,
            TyLe: req.body.TyLe,
            ChatLieu: req.body.ChatLieu,
            MauSac: req.body.MauSac,
            SoLuong: parseInt(req.body.SoLuong),
            MoTa: req.body.MoTa,
            Gia: parseFloat(req.body.Gia),
            HinhAnh: hinhAnhPaths
        };

        await SanPham.create(data);
        req.session.success = 'Đã thêm sản phẩm thành công.';
        res.redirect('/sanpham');
    } catch (err) {
        console.error('❌ Lỗi thêm sản phẩm:', err);
        res.status(500).send(`
            <h1 style="color:red;">Lỗi khi thêm sản phẩm</h1>
            <pre>${err.stack}</pre>
            <a href="/sanpham/them">← Quay lại</a>
        `);
    }
});

// GET: Sửa sản phẩm
router.get('/sua/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const sanpham = await SanPham.findById(id);
        const hangsanxuat = await HangSanXuat.find();
        const phanloai = await PhanLoai.find();

        res.render('sanpham_sua', {
            title: 'Sửa sản phẩm',
            sanpham,
            hangsanxuat,
            phanloai,
            pageType: 'sanpham_sua'
        });
    } catch (err) {
        console.error('❌ Lỗi GET sửa sản phẩm:', err);
        res.status(500).send('Không thể tải dữ liệu sản phẩm.');
    }
});

// POST: Sửa sản phẩm
router.post('/sua/:id', upload.array('HinhAnh[]'), async (req, res) => {
    try {
        const id = req.params.id;
        const sanPhamCu = await SanPham.findById(id);

        let hinhAnhPaths = sanPhamCu.HinhAnh || [];

        // Nếu có ảnh mới được upload
        if (req.files && req.files.length > 0) {
            // (Tùy chọn) Xóa ảnh cũ khỏi thư mục public
            if (Array.isArray(sanPhamCu.HinhAnh)) {
                sanPhamCu.HinhAnh.forEach(anh => {
                    const oldPath = path.join('public', anh);
                    fs.unlink(oldPath, err => {
                        if (err) console.error('❌ Không thể xóa ảnh cũ:', err);
                    });
                });
            }

            // Gán ảnh mới
            hinhAnhPaths = req.files.map(file => '/uploads/' + file.filename);
        }

        const data = {
            TenSanPham: req.body.TenSanPham,
            HangSanXuat: req.body.HangSanXuat,
            PhanLoai: req.body.PhanLoai,
            TyLe: req.body.TyLe,
            ChatLieu: req.body.ChatLieu,
            MauSac: req.body.MauSac,
            SoLuong: parseInt(req.body.SoLuong),
            MoTa: req.body.MoTa,
            Gia: parseFloat(req.body.Gia),
            HinhAnh: hinhAnhPaths
        };

        await SanPham.findByIdAndUpdate(id, data);
        req.session.success = 'Đã cập nhật sản phẩm thành công.';
        res.redirect('/sanpham/danhsach');
    } catch (err) {
        console.error('❌ Lỗi sửa sản phẩm:', err);
        res.status(500).send(`
            <h1 style="color:red;">Lỗi khi sửa sản phẩm</h1>
            <pre>${err.stack}</pre>
            <a href="/sanpham">← Quay lại</a>
        `);
    }
});

// POST: Xóa sản phẩm
router.post('/xoa/:id', async (req, res) => {
    try {
        const sp = await SanPham.findById(req.params.id);
        if (sp?.HinhAnh) {
            const fs = require('fs');
            const imgPath = 'public' + sp.HinhAnh;
            fs.unlink(imgPath, (err) => {
                if (err) console.error('Không thể xóa ảnh:', err);
            });
        }

        await SanPham.findByIdAndDelete(req.params.id);
        res.redirect(req.get('Referrer') || '/');
    } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        req.session.error = 'Lỗi khi xóa sản phẩm: ' + err.message;
        res.redirect('/error');
    }
});

// GET: Xem chi tiết sản phẩm
router.get('/chitiet/:id', async (req, res) => {
    var id = req.params.id;
    var sp = await SanPham.findById(id)
        .populate('HangSanXuat')
        .populate('PhanLoai');

    res.render('sanpham_chitiet', {
        title: 'Chi tiết sản phẩm',
        sanpham: sp,
        pageType: 'sanpham_chitiet',
        user: req.session.user
    });
});

module.exports = router;