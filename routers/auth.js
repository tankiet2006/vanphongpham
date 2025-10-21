var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var TaiKhoan = require('../models/taikhoan');

// GET: Đăng ký
router.get('/dangky', (req, res) => {
    res.render('dangky', {
        title: 'Đăng ký tài khoản',
        pageType: 'dangky',
    });
});

// POST: Đăng ký
router.post('/dangky', async (req, res) => {
    try {
        const { HoVaTen, Email, SoDienThoai, TenDangNhap, MatKhau } = req.body;
        const errors = {};

        if (!HoVaTen || HoVaTen.trim() === '')
            errors.HoVaTen = 'Vui lòng nhập họ tên';

        if (!Email || !Email.includes('@'))
            errors.Email = 'Email không hợp lệ';

        if (!SoDienThoai || !/^\d{10}$/.test(SoDienThoai))
            errors.SoDienThoai = 'Số điện thoại không hợp lệ';

        const tonTai = await TaiKhoan.findOne({
            $or: [
                { TenDangNhap },
                { Email }
            ]
        });

        if (tonTai) {
            req.session.error = "Tên đăng nhập hoặc email đã tồn tại.";
			return res.redirect("/error");
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(MatKhau, salt);
        const newUser = {
            HoVaTen,
            Email,
            SoDienThoai,
            TenDangNhap,
            MatKhau: hashedPassword,
        };

        await TaiKhoan.create(newUser);

        req.session.success = 'Đăng ký thành công!';
        res.redirect('/dangnhap');
    } catch (err) {
       console.error('Lỗi thêm tài khoản:', err);
        req.session.error = 'Đã xảy ra lỗi server khi thêm tài khoản: ' + err.message;
        res.redirect('/error');
    }
});

// GET: Đăng nhập
router.get('/dangnhap', (req, res) => {
    res.render('dangnhap', {
        title: 'Đăng nhập',
        pageType: 'dangnhap',
        errors: {},
        TenDangNhap: ''
    });
});

// POST: Đăng nhập
router.post('/dangnhap', async (req, res) => {
    const { TenDangNhap, MatKhau } = req.body;
    const errors = {};

    if (!TenDangNhap || !MatKhau) {
        if (!TenDangNhap) errors.TenDangNhap = 'Vui lòng nhập tên đăng nhập.';
        if (!MatKhau) errors.MatKhau = 'Vui lòng nhập mật khẩu.';
        return res.render('dangnhap', {
            title: 'Đăng nhập',
            pageType: 'dangnhap',
            errors,
            TenDangNhap
        });
    }

    const taikhoan = await TaiKhoan.findOne({ TenDangNhap }).exec();
    if (!taikhoan) {
        errors.TenDangNhap = 'Tên đăng nhập không tồn tại.';
        return res.render('dangnhap', {
            title: 'Đăng nhập',
            pageType: 'dangnhap',
            errors,
            TenDangNhap
        });
    }

    if (!bcrypt.compareSync(MatKhau, taikhoan.MatKhau)) {
        errors.MatKhau = 'Mật khẩu không đúng.';
        return res.render('dangnhap', {
            title: 'Đăng nhập',
            pageType: 'dangnhap',
            errors,
            TenDangNhap
        });
    }

    if (taikhoan.KichHoat == 0) {
        errors.TenDangNhap = 'Tài khoản đã bị khóa.';
        return res.render('dangnhap', {
            title: 'Đăng nhập',
            pageType: 'dangnhap',
            errors,
            TenDangNhap
        });
    }

    // Đăng nhập thành công
    req.session.MaNguoiDung = taikhoan._id;
    req.session.HoVaTen = taikhoan.HoVaTen;
    req.session.QuyenHan = taikhoan.QuyenHan;
    req.session.user = taikhoan;
    res.redirect('/');
});

// GET: Đăng xuất
router.get('/dangxuat', async (req, res) => {
    if (req.session.MaNguoiDung) {
        // Xóa session
        delete req.session.MaNguoiDung;
        delete req.session.HoVaTen;
        delete req.session.QuyenHan;

        res.redirect('/');
    } else {
        req.session.error = 'Người dùng chưa đăng nhập.';
        res.redirect('/dangnhap');
    }
});

router.get('/error', (req, res) => {
    const error = req.session.error || 'Đã xảy ra lỗi.';
    req.session.error = null;
    res.render('error', { error });
});

module.exports = router;