var express = require('express');
var app = express();
var mongoose = require('mongoose');
var session = require('express-session');
const TaiKhoan = require('./models/taikhoan');
const bcrypt = require('bcryptjs');

var indexRouter = require('./routers/index');
var authRouter = require('./routers/auth');
var TaiKhoanRouter = require('./routers/taikhoan');
var PhanLoaiRouter = require('./routers/phanloai');
var HangSanXuatRouter = require('./routers/hangsanxuat');
var SanPhamRouter = require('./routers/sanpham');
var GioHangRouter = require('./routers/giohang');
var ThanhToanRouter = require('./routers/thanhtoan');
var HoaDonRouter = require('./routers/hoadon');

async function Default_Account() {
    const Exsited = await TaiKhoan.findOne({ TenDangNhap: 'admin' });
    if (Exsited) {
        console.log('Đã tồn tại tài khoản mặc định');
        return;
    }

    const matkhau = bcrypt.hashSync('admin123', 10);
    await TaiKhoan.create({
        MaNguoiDung: 'XXX000',
        HoVaTen: 'Admin',
        Email: 'admin@gmail.com',
        TenDangNhap: 'admin',
        MatKhau: matkhau,
        QuyenHan: 'Admin',
        KichHoat: 1
    });

    console.log('Tạo tài khoản mặc định: admin / admin123');
}

// Kết nối MongoDB và gọi tạo tài khoản
var uri = 'mongodb+srv://khoinguyen12a5:admin123@cluster0.tce2s.mongodb.net/mohinhxe?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Kết nối MongoDB thành công');
        Default_Account();
    }).catch(err => console.log('MongoDB lỗi:', err));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    name: 'SigmaMale', // Tên session (tự chọn)
    secret: 'tungtungtungsahur', // Khóa bảo vệ (tự chọn)
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // Hết hạn sau 30 ngày
    }
}));

app.use((req, res, next) => {
    // Chuyển biến session thành biến cục bộ
    res.locals.session = req.session;

    // Lấy thông báo (lỗi, thành công) của trang trước đó (nếu có)
    var err = req.session.error;
    var msg = req.session.success;

    // Xóa session sau khi đã truyền qua biến trung gian
    delete req.session.error;
    delete req.session.success;

    // Gán thông báo (lỗi, thành công) vào biến cục bộ
    res.locals.message = '';
    if (err) res.locals.message = '<span class="text-danger">' + err + '</span>';
    if (msg) res.locals.message = '<span class="text-success">' + msg + '</span>';

    next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/taikhoan', TaiKhoanRouter);
app.use('/phanloai', PhanLoaiRouter);
app.use('/hangsanxuat', HangSanXuatRouter);
app.use('/sanpham', SanPhamRouter);
app.use('/giohang', GioHangRouter);
app.use('/thanhtoan', ThanhToanRouter);
app.use('/hoadon', HoaDonRouter);
app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server is running at http://127.0.0.1:3000');
});
