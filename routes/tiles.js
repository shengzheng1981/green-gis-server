const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const schema = require('../core/schema');
const canvas = require('../core/canvas');
const Layer = require("../models/layer");

//矢量切片：前端渲染
router.get('/vector/:name/:x/:y/:z', async (req, res, next) => {
    try {
        const model = schema.model(req.params.name);
        const x = parseInt(req.params.x), y = parseInt(req.params.y), z = parseInt(req.params.z);
        const query =  {};
        query['zooms.' + z + '.tileMin.tileX'] = {'$lte': x };
        query['zooms.' + z + '.tileMin.tileY'] = {'$lte': y };
        query['zooms.' + z + '.tileMax.tileX'] = {'$gte': x };
        query['zooms.' + z + '.tileMax.tileY'] = {'$gte': y };
        const features = await model.find(query).select('-zooms').lean();
        res.status(200);
        res.json(features);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//栅格切片：后端渲染
router.get('/image/:id/:x/:y/:z', async (req, res, next) => {
    try {
        const x = parseInt(req.params.x), y = parseInt(req.params.y), z = parseInt(req.params.z);
        let layer;
        if (schema.exist(req.params.id)) {
            //id == class name
            layer = {
                class: schema.class(req.params.id)
            };
        } else {
            //id == layer id
            layer = await Layer.findOne({_id: req.params.id}).lean().populate([{path: 'class', model: 'FeatureClass'}, {"path": "renderer.simple.symbol"}, {"path": "renderer.category.categories.symbol"}, {"path": "renderer.class.breaks.symbol"}]);
        }
        res.setHeader('Content-Type', 'image/png');
        const ctx = await canvas.draw(layer, x, y, z);
        ctx.createPNGStream().pipe(res);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//静态切片
router.get('/static/:name/:x/:y/:z',  (req, res, next) => {
    const file_path = path.join(path.dirname(__dirname) , "/public/tiles/" + req.params.name + "/" + req.params.z + "/" + req.params.x +  "/" + req.params.y + ".png");
    if ( fs.existsSync(file_path) ){
        res.sendFile(file_path);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;