const express = require("express");
const router = express.Router();
const HangSanXuat = require("../models/hangsanxuat");

// GET: Danh sách hãng sản xuất
router.get("/", async (req, res) => {
	const hsx = await HangSanXuat.find();
	res.render("hangsanxuat", {
		title: "Danh sách hãng sản xuất",
		hangsanxuat: hsx,
		pageType: 'hangsanxuat',
		activePage: 'hangsanxuat',
		activeSubPage: 'hangsanxuat'
	});
});

// GET: Thêm hãng sản xuất
router.get("/them", (req, res) => {
	res.render("hangsanxuat_them", {
		title: "Thêm hãng sản xuất",
		pageType: 'hangsanxuat_them',
		activePage: 'hangsanxuat',
		activeSubPage: 'hangsanxuat'
	});
});

// POST: Thêm hãng sản xuất
router.post("/them", async (req, res) => {
	try {
		const tonTai = await HangSanXuat.findOne({
			TenHangSanXuat: req.body.TenHangSanXuat,
			QuocGia: req.body.QuocGia
		});
		if (tonTai) {
			req.session.error = "Hãng sản xuất đã tồn tại.";
			return res.redirect("/error");
		}
		await HangSanXuat.create({
			TenHangSanXuat: req.body.TenHangSanXuat,
			QuocGia: req.body.QuocGia
		});
		res.redirect("/hangsanxuat");
	} catch (err) {
		console.error("Lỗi khi thêm hãng sản xuất:", err);
		req.session.error = "Lỗi khi thêm hãng sản xuất: " + err.message;
		res.redirect("/error");
	}
});


// GET: Sửa hãng sản xuất
router.get("/sua/:id", async (req, res) => {
	const id = req.params.id;
	const edit_data = await HangSanXuat.findById(id);
	const hsx = await HangSanXuat.find();

	res.render("hangsanxuat", {
		title: "Sửa hãng sản xuất",
		hangsanxuat: hsx,
		edit_data,
		pageType: 'hangsanxuat',
		activePage: 'hangsanxuat',
		activeSubPage: 'hangsanxuat'
	});
});

// POST: Sửa hãng sản xuất
router.post("/sua/:id", async (req, res) => {
	await HangSanXuat.findByIdAndUpdate(req.params.id, {
		TenHangSanXuat: req.body.TenHangSanXuat,
		QuocGia: req.body.QuocGia
	});
	res.redirect("/hangsanxuat");
});

// POST: Xóa hãng sản xuất
router.post("/xoa/:id", async (req, res) => {
	try {
		await HangSanXuat.findByIdAndDelete(req.params.id);
		res.redirect("/hangsanxuat");
	} catch (err) {
		console.error("Lỗi khi xóa hãng sản xuất:", err);
		req.session.error = "Lỗi khi xóa hãng sản xuất: " + err.message;
		res.redirect("/error");
	}
});

module.exports = router;