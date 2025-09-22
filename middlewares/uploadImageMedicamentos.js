const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/upload/medicamentos");
  },
  filename: function (req, file, cb) {
    //let data = new Date().toISOString().replace(/:/g, '-') + '-';
    //let data = Date.now().toString();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    //indentificar extensao
    const ext =
      file.minetype == "image/jpeg"
        ? ".jpeg"
        : file.minetype.slice(file.minetype.length - 3);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    //cb(null, data + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.minetype === "image/jpg" ||
    file.minetype === "image/jpeg" ||
    file.minetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
