const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');
//文件上传
const multer  = require('multer');
//设置矢量和栅格文件路径
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
/* 上传shapefile. */
router.post('/upload/shape', extendTimeout, shape_upload.array('file'),  (req, res) => {
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
/* 上传图像文件. */
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

function extendTimeout (req, res, next) {
    req.setTimeout(600000,   () => {
        /* Handle timeout */
        console.log('timeout,check network and file size.');
        res.send(408);
    });
    next();
};


module.exports = router;
