const mongoose = require('mongoose');

const SanPhamSchema = new mongoose.Schema({
    TenSanPham: String,
    HangSanXuat: { type: mongoose.Schema.Types.ObjectId, ref: 'HangSanXuat' },
    PhanLoai: { type: mongoose.Schema.Types.ObjectId, ref: 'PhanLoai' },
    TyLe: String,
    ChatLieu: String,
    MauSac: String,
    Gia: Number,
    SoLuong: Number,
    HinhAnh: [String],
    MoTa: String,
});

module.exports = mongoose.model('SanPham', SanPhamSchema);