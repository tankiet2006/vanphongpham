const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const TaiKhoan = require("../models/taikhoan");

// GET: Danh sách tài khoản
router.get("/", async (req, res) => {
	const tk = await TaiKhoan.find();
	res.render("taikhoan", {
		title: "Danh sách tài khoản",
		taikhoan: tk,
		pageType: 'taikhoan'
	});
});

// GET: Thêm tài khoản
router.get("/them", async (req, res) => {
    const success = req.session.success || null;
    req.session.success = null;

    res.render("taikhoan_them", {
        title: "Thêm tài khoản",
        pageType: 'taikhoan_them',
    });
});

// POST: Thêm tài khoản
router.post("/them", async (req, res) => {
    try {
        const { HoVaTen, Email, SoDienThoai, TenDangNhap, MatKhau, QuyenHan } = req.body;
        const errors = {};

        if (!HoVaTen || HoVaTen.trim() === '') {
            errors.HoVaTen = 'Vui lòng nhập họ và tên';
        }

        if (!Email || !Email.includes('@')) {
            errors.Email = 'Email không hợp lệ';
        }

		if (!SoDienThoai || !/^\d{10}$/.test(SoDienThoai)) {
            errors.SoDienThoai = 'Số điện thoại phải gồm 10 chữ số';
        }

        const tonTai = await TaiKhoan.findOne({
            $or: [
                { TenDangNhap: TenDangNhap },
                { Email: Email }
            ]
        });

        if (tonTai) {
            req.session.error = "Tên đăng nhập hoặc email đã tồn tại.";
			return res.redirect("/error");
        }

        // Lưu dữ liệu
        const salt = bcrypt.genSaltSync(10);
        const data = {
            HoVaTen,
            Email,
			SoDienThoai,
            TenDangNhap,
            MatKhau: bcrypt.hashSync(MatKhau, salt),
            QuyenHan: QuyenHan || "Khách hàng"
        };

        await TaiKhoan.create(data);

        req.session.success = "Đã thêm tài khoản thành công.";
        res.redirect("/taikhoan");
    } catch (err) {
        console.error('Lỗi thêm tài khoản:', err);
        req.session.error = 'Đã xảy ra lỗi server khi thêm tài khoản: ' + err.message;
        res.redirect('/error');
    }
});

// GET: Tài khoản của tôi
router.get("/cuatoi/:id", async (req, res) => {
	const id = req.params.id.trim();
	const tk = await TaiKhoan.findById(id);
	res.render("taikhoan_cuatoi", {
		title: "Hồ sơ cá nhân",
		taikhoan: tk,
		pageType: 'taikhoan_cuatoi'
	});
});

// GET: Sửa tài khoản
router.get("/sua/:id", async (req, res) => {
	const id = req.params.id;
	const tk = await TaiKhoan.findById(id);
	res.render("taikhoan_sua", {
		title: "Sửa tài khoản",
		taikhoan: tk,
		pageType: 'taikhoan_sua'
	});
});

// POST: Sửa tài khoản
router.post("/sua/:id", async (req, res) => {
	const id = req.params.id;
	const salt = bcrypt.genSaltSync(10);

	const data = {
		HoVaTen: req.body.HoVaTen,
		Email: req.body.Email,
		SoDienThoai: req.body.SoDienThoai
	};

	if (req.body.MatKhau) {
		data["MatKhau"] = bcrypt.hashSync(req.body.MatKhau, salt);
	}

	if (req.session && req.session.QuyenHan === "Admin") {
		data["TenDangNhap"] = req.body.TenDangNhap;
		data["QuyenHan"] = req.body.QuyenHan;
		data["KichHoat"] = req.body.KichHoat;
	}

	await TaiKhoan.findByIdAndUpdate(id, data);

	if (req.session && req.session.MaNguoiDung === id) {
		req.session.destroy((err) => {
			res.redirect("/dangnhap");
		});
	} else {
		res.redirect("/taikhoan");
	}
});

// GET: Xóa tài khoản
router.get("/xoa/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const tk = await TaiKhoan.findById(id);
		if (!tk) {
			req.session.error = "Không tìm thấy tài khoản.";
			return res.redirect("/error");
		}

		// Chặn xóa admin
		if (tk.QuyenHan === "Admin") {
			req.session.error = "Không thể xóa tài khoản Admin.";
			return res.redirect("/error");
		}

		await TaiKhoan.findByIdAndDelete(id);
		res.redirect("/taikhoan");
	} catch (err) {
		console.error("Lỗi khi xóa tài khoản:", err);
		req.session.error = "Lỗi khi xóa tài khoản: " + err.message;
		res.redirect("/error");
	}
});

module.exports = router;