var mongoose = require('mongoose');

var PhanLoaiSchema = new mongoose.Schema({
    TenPhanLoai: String,
});

var PhanLoai = mongoose.model('PhanLoai', PhanLoaiSchema);
module.exports = PhanLoai;