const express = require('express');
const router = express.Router();
const Layer = require("../models/layer");

router.get('/',  (req, res, next) => {
    Layer.find().lean()
        .populate([{path: 'class', model: 'FeatureClass'}])
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
    Layer.findOne({_id: req.params.id}).lean()
        .populate([{path: 'class', model: 'FeatureClass'}])
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
    Layer.create(req.body.layer, (err, doc) => {
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
    Layer.findOneAndRemove({_id: req.params.id},  (err, result) => {
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
    Layer.findOneAndUpdate({_id: req.params.id}, req.body.layer, {new: true},   (err, doc) => {
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