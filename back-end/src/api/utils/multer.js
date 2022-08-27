import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../../../logger.js";
const maxSize = 1 * 1000 * 1000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve(__dirname, "../../../../assets/", file.fieldname));
  },
  filename(req, file, cb) {
    const bodyParsed = JSON.parse(req.body.json);
    let id = req.params.companyID || req.session.ID;
    const name = id + "_" + Date.now() + path.extname(file.originalname);
    bodyParsed[file.fieldname] = "/" + file.fieldname + "/" + name;
    req.body.json = JSON.stringify(bodyParsed);
    cb(null, name);
  },
});
const uploadLogo = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(
        new Error(
          "Nur dosieroj kun jenaj finaĵoj estas akceptataj: .jpg, .jpeg, .png, .gif"
        )
      );
    }
  },
}).single("logo");
const uploadResumeOrAvatar = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "avatar") {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif"
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Nur bildoj kun jenaj finaĵoj estas akceptataj: .jpg, .jpeg, .png, .gif"
          )
        );
      }
    } else {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error(
            "Nur vivresumoj kun jenaj finaĵoj estas akceptataj: .jpg, .jpeg, .png, .gif"
          )
        );
      }
    }
  },
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);
const middleware = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ content: "La dosiero estas tro granda." });
      } else {
        return res
          .status(400)
          .json({
            content:
              "Ni ne povis alŝuti la dosieron. La problemo povis okazi pro via retumilo.",
          });
      }
    } else if (err) {
      logger.error({ err, sessionID: req.session.ID });
      return res
        .status(500)
        .json({
          content:
            "Ni ial ne povis alŝuti la dosieron. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
        });
    }
    next();
  });
};

const profileUpload = middleware(uploadResumeOrAvatar);
const companyUpload = middleware(uploadLogo);

export { profileUpload, companyUpload };
