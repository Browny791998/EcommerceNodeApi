const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/images"));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");

    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(
            {
                message: "Unsupported file format"
            },
            false
        )
    }
}



const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fieldSize: 2000000 }
})

const productImgResize = async (req, res, next) => {
    if (!req.files) return next();
    const dir = path.join(__dirname, '../public/images/products');
    fs.mkdirSync(dir, { recursive: true });
    await Promise.all(
        req.files.map(async (file) => {
            const dest = path.join(dir, file.filename);
            await sharp(file.path).resize(300, 300).toFormat('jpeg').jpeg({ quality: 90 }).toFile(dest);
            fs.unlinkSync(file.path);
            file.path = dest;
        })
    );
    next();
}

const blogImgResize = async (req, res, next) => {
    if (!req.files) return next();
    const dir = path.join(__dirname, '../public/images/blogs');
    fs.mkdirSync(dir, { recursive: true });
    await Promise.all(
        req.files.map(async (file) => {
            const dest = path.join(dir, file.filename);
            await sharp(file.path).resize(300, 300).toFormat('jpeg').jpeg({ quality: 90 }).toFile(dest);
            fs.unlinkSync(file.path);
            file.path = dest;
        })
    );
    next();
}

module.exports = { uploadPhoto,productImgResize,blogImgResize }