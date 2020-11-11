const express = require('express');
const router = express.Router();
const schema = require('../core/schema');

//以geojson格式导出FeatureClass
router.get('/geojson/:name',  async (req, res, next) => {
    try {
        const model = schema.model(req.params.name);
        const features = await model.find().select('-zooms').lean();
        res.status(200);
        res.json({
            type:"FeatureCollection",
            totalFeatures: features.length,
            features: features.map( feature => {
                return {
                    ...feature,
                    type: "Feature"
                }
            })
        });
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//要素查询
router.post('/query/:name',  async (req, res, next) => {
    try {
        const model = schema.model(req.params.name);
        req.body.condition = req.body.condition || {};
        req.body.fields = req.body.fields || [];
        let select = 'geometry';
        if (req.body.fields == '*') {
            select += ' properties';
        } else {
            req.body.fields.forEach( field => {
                select += ' ' + 'properties.' + field;
            });
        }
        const features = await model.find(req.body.condition).select(select).lean();
        res.status(200);
        res.json(features);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//要素计数
router.post('/count/:name', async (req, res, next) => {
    try {
        const model = schema.model(req.params.name);
        req.body.condition = req.body.condition || {};
        const count = await model.countDocuments(req.body.condition).lean();
        res.status(200);
        res.json(count);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//要素字段分类
router.post('/category/:name/:field', async (req, res) => {
    try {
        const model = schema.model(req.params.name);
        const array = await model.find().distinct('properties.'+ req.params.field);
        res.status(200);
        res.json(array);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

//要素字段统计
router.post('/statistic/:name/:field', async (req, res) => {
    try {
        const model = schema.model(req.params.name);
        const result = await model.aggregate([
            { $group: { _id: null, min: { $min: "$properties." + req.params.field }, max: { $max: "$properties." + req.params.field }}},
            { $project: { _id: 0, min: 1, max: 1  }}
        ]);
        res.status(200);
        res.json(result);
    } catch (err) {
        res.status(500);
        res.json(err.message);
    }
});

module.exports = router;