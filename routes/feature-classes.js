const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const gdal = require("gdal");
const FeatureClass = require('../models/feature-class');
const schema = require('../core/schema');
const tile = require('../core/tile');

//文件上传
const multer  = require('multer');
//设置矢量路径
const shape_path = path.join(path.join(path.dirname(__dirname), 'public'),'shapes');
if (!fs.existsSync(shape_path))  fs.mkdirSync(shape_path);
const shape_upload = multer({ dest: shape_path });

/* 获取所有class. */
router.get('/all', (req, res, next) => {
    FeatureClass.find().lean()
        .exec( (err, docs) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            res.status(200);
            res.json(docs);
        }
    })
});

/* 发布shapefile. */
router.post('/publish/shapefile/:name', extendTimeout, shape_upload.array('file'),  async (req, res, next) => {
    // 上传shapefile
    try {
        let shapefilename = "";
        req.files.forEach( file => {
            const origin_path = file.path;
            const target_path = path.join(shape_path, file.originalname);
            // move the file from the temporary location to the intended location
            fs.renameSync(origin_path, target_path);
            const array = file.originalname.split('.');
            const file_ext = array[array.length - 1];
            if (file_ext.toLowerCase() === "shp") shapefilename = file.originalname;
        });
        // 上传文件无shp后缀
        if (!shapefilename) {
            throw new Error("shapefile not found!");
        }
        // 创建feature class
        let cls = await FeatureClass.findOne({name: req.params.name});
        if (cls) {
            throw new Error("class name exists!");
        } else {
            // 打开shapefile
            const shapefile = path.join(path.join(path.join(path.dirname(__dirname), 'public'),'shapes'), shapefilename);
            const ds = gdal.open(shapefile);
            const layer = ds.layers.get(0);
            cls = {
                name: req.params.name,
                geotype: layer.geomType,
                tile: true,
                fields: []
            };
            layer.fields.forEach( item => {
                cls.fields.push({
                    name: item.name,
                    type: item.type
                })
            });
            const doc = await FeatureClass.create(cls);
            // 添加 schema
            schema.add(doc.toObject());
            const features = [];
            const model = schema.model(req.params.name);
            const srs = gdal.SpatialReference.fromEPSG(4326);
            layer.features.forEach( item => {
                try{
                    const geometry = item.getGeometry();
                    // 转换坐标
                    geometry.transformTo(srs);
                    // 计算空间索引
                    const feature = tile.calc({
                        geometry: JSON.parse(geometry.toJSON()),
                        properties: JSON.parse(item.fields.toJSON())
                    });
                    features.push(model(feature));
                } catch (e) {
                    console.log(e);
                }
            });
            ds.close();
            // 批量插入矢量要素
            await model.insertMany(features);
            console.log( req.params.name + ' ' + features.length +' published!');
            res.status(200);
            res.json({
                result: true,
                doc : doc
            });
        }
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

/* 根据名称删除class. */
router.post('/:name/remove',  (req, res) => {
    FeatureClass.findOneAndRemove({name: req.params.name},  (err, result) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            mongoose.connection.db.dropCollection(req.params.name,  (err, result) => {
                if (err) {
                    res.status(500);
                    res.json(err);
                } else {
                    schema.remove(req.params.name);
                    res.status(200);
                    res.json({
                        result:true
                    });
                }
            });
        }
    });
});

/* 根据名称更新class. */
router.post('/:name/update',  (req, res) => {
    FeatureClass.findOneAndUpdate({name: req.params.name}, req.body.class, {new: true}, (err, doc) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            schema.update(req.params.name, doc);
            res.status(200);
            res.json({
                result:true,
                doc : doc
            });
        }
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