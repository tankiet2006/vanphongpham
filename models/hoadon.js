var mongoose = require("mongoose");

var HoaDonSchema = new mongoose.Schema({
    taiKhoanID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaiKhoan",
        required: true,
    },
    HoVaTen: {
        type: String,
        required: true,
    },
    SoDienThoai: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    DiaChi: {
        type: String,
        required: true,
    },
    GhiChu: {
        type: String,
    },
    danhSachSanPham: [
        {
            sanphamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SanPham",
                required: true,
            },
            soLuong: {
                type: Number,
                required: true,
            },
            giaBan: {
                type: Number,
                required: true,
            },
        },
    ],
    tongTien: {
        type: Number,
        required: true,
    },
    ngayTao: {
        type: Date,
        default: Date.now,
    },
    trangThai: {
        type: String,
        enum: ["Chờ xử lý", "Đã giao hàng", "Đã hủy"],
        default: "Chờ xử lý",
    },
});

module.exports = mongoose.model("HoaDon", HoaDonSchema);