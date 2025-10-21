var mongoose = require('mongoose');

var HangSanXuatSchema = new mongoose.Schema({
    TenHangSanXuat: String,
    QuocGia: String
});

var HangSanXuat = mongoose.model('HangSanXuat', HangSanXuatSchema);
module.exports = HangSanXuat;