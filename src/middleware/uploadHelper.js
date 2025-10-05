const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadImage = (destinationFolder) => {
    if (!destinationFolder) {
        throw new Error("O nome da pasta de destino é obrigatório.");
    }
    const fullPath = path.join(process.cwd(), 'public', destinationFolder);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = file.mimetype.split('/')[1];
            cb(null, `${uniqueSuffix}.${extension}`);
        }
    });
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
            cb(null, true);
        } else {
            cb(new Error('Formato de imagem não suportado! Use JPEG, JPG, PNG ou GIF.'), false);
        }
    };
    return multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB
        },
        fileFilter: fileFilter
    });
}

module.exports = uploadImage;