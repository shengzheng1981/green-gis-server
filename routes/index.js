const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');
const multer  = require('multer');
const shape_path = path.join(path.join(path.dirname(__dirname), 'public'),'shapes');
const image_path = path.join(path.join(path.dirname(__dirname), 'public'),'images');
if (!fs.existsSync(shape_path))  fs.mkdirSync(shape_path);
if (!fs.existsSync(image_path))  fs.mkdirSync(image_path);
const shape_upload = multer({ dest: shape_path });
const image_upload = multer({ dest: image_path });
/* GET home page. */
router.get('/',  (req, res, next) => {
    res.render('index', { title: 'Green GIS Server', port: config.port || '4000' });
});

router.post('/upload/shape', shape_upload.array('file'),  (req, res) => {
    // move the file from the temporary location to the intended location
    req.files.forEach( file => {
        const origin_path = file.path;
        const target_path = path.join(shape_path, file.originalname);
        fs.renameSync(origin_path, target_path);
    });
    res.status(200);
    res.json({
        result: true
    });
});

router.post('/upload/image', image_upload.array('file'),  (req, res) => {
    // move the file from the temporary location to the intended location
    req.files.forEach( file => {
        const origin_path = file.path;
        const target_path = path.join(image_path, file.originalname);
        fs.renameSync(origin_path, target_path);
    });
    res.status(200);
    res.json({
        result: true
    });
});

module.exports = router;
