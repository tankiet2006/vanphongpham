const express = require("express");
const router = express.Router();
const PhanLoai = require("../models/phanloai");

// GET: Danh sách phân loại
router.get("/", async (req, res) => {
	const pl = await PhanLoai.find();
	res.render("phanloai", {
		title: "Danh sách phân loại",
		phanloai: pl,
		pageType: 'phanloai',
		activePage: 'phanloai',
		activeSubPage: 'phanloai'
	});
});

// GET: Thêm phân loại
router.get("/them", (req, res) => {
	res.render("phanloai_them", {
		title: "Thêm phân loại",
		pageType: 'phanloai_them',
		activePage: 'phanloai',
		activeSubPage: 'phanloai'
	});
});

// POST: Thêm phân loại
router.post("/them", async (req, res) => {
	try {
		const tonTai = await PhanLoai.findOne({
			TenPhanLoai: req.body.TenPhanLoai
		});
		if (tonTai) {
			req.session.error = "Phân loại đã tồn tại.";
			return res.redirect("/phanloai");
		}
		await PhanLoai.create({ TenPhanLoai: req.body.TenPhanLoai });
		res.redirect("/phanloai");
	} catch (err) {
		console.error("Lỗi khi thêm phân loại:", err);
		req.session.error = "Lỗi khi thêm phân loại: " + err.message;
		res.redirect("/phanloai");
	}
});

// GET: Sửa phân loại
router.get("/sua/:id", async (req, res) => {
	const id = req.params.id;
	const edit_data = await PhanLoai.findById(id);
	const pl = await PhanLoai.find();

	res.render("phanloai", {
		title: "Sửa phân loại",
		phanloai: pl,
		edit_data,
		pageType: 'phanloai',
		activePage: 'phanloai',
		activeSubPage: 'phanloai'
	});
});

// POST: Sửa phân loại
router.post("/sua/:id", async (req, res) => {
	await PhanLoai.findByIdAndUpdate(req.params.id, {
		TenPhanLoai: req.body.TenPhanLoai
	});
	res.redirect("/phanloai");
});

// POST: Xóa phân loại
router.post("/xoa/:id", async (req, res) => {
	try {
		await PhanLoai.findByIdAndDelete(req.params.id);
		res.redirect("/phanloai");
	} catch (err) {
		console.error("Lỗi khi xóa phân loại:", err);
		req.session.error = "Lỗi khi xóa phân loại: " + err.message;
		res.redirect("/error");
	}
});

module.exports = router;