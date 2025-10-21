var mongoose = require("mongoose");

var GioHangSchema = new mongoose.Schema({
    taiKhoanID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaiKhoan",
        required: true,
    },
    sanpham: [
        {
            sanphamId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SanPham",
            },
            soLuong: {
                type: Number,
                default: 1,
            },
        },
    ],
});

var GioHang = mongoose.model("GioHang", GioHangSchema);
module.exports = GioHang;