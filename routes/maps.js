const express = require('express');
const router = express.Router();
const Map = require("../models/map");

router.get('/',  (req, res, next) => {
    Map.find().lean()
        .populate([{path: 'layers.layer', model: 'Layer', populate: [{path: 'class', model: 'FeatureClass'}, {"path": "renderer.simple.symbol"}, {"path": "renderer.category.categories.symbol"}, {"path": "renderer.class.breaks.symbol"}] }])
        .sort({zindex : -1})
        .exec( (err,docs) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json(docs);
            }
        });
});

router.get('/detail/:id', (req, res, next) => {
    Map.findOne({_id: req.params.id}).lean()
        .populate([{path: 'layers.layer', model: 'Layer', populate: [{path: 'class', model: 'FeatureClass'}, {"path": "renderer.simple.symbol"}, {"path": "renderer.category.categories.symbol"}, {"path": "renderer.class.breaks.symbol"}] }])
        .exec( (err,doc) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json(doc);
            }
        });
});

router.post('/create',  (req, res, next) => {
    Map.create(req.body.group, (err, doc) => {
        if (err) {
            res.status(500);
            res.json(err);
        }
        else{
            res.status(200);
            res.json({
                result : true,
                doc : doc
            });
        }
    });
});

router.post('/:id/remove', (req, res, next) => {
    Map.findOneAndRemove({_id: req.params.id},  (err, result) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            res.status(200);
            res.json({
                result:true
            });
        }
    });
});

router.post('/:id/update', (req, res, next) => {
    Map.findOneAndUpdate({_id: req.params.id}, req.body.group, {new: true},   (err, doc) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            res.status(200);
            res.json({
                result:true
            });
        }
    });
});

module.exports = router;