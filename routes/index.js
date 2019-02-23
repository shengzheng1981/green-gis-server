const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const config = require('../config');
const multer  = require('multer');
const upload_path = path.join(path.join(path.dirname(__dirname), 'public'),'shapes');
if (!fs.existsSync(upload_path)){
    fs.mkdirSync(upload_path);
}
const upload = multer({ dest: upload_path });
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Green GIS Server', port: config.port || '4000' });
});

router.post('/upload', upload.array('file'), function(req, res) {
    // move the file from the temporary location to the intended location
    req.files.forEach( file => {
        const origin_path = file.path;
        const target_path = path.join(upload_path, file.originalname);
        fs.renameSync(origin_path, target_path);
    });
    res.status(200);
    res.json({
        result: true
    });
});

module.exports = router;
