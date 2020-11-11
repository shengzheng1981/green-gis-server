const express = require('express');
const router = express.Router();
const Symbol = require("../models/symbol");

router.get('/',  (req, res, next) => {
    Symbol.find().lean()
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

router.get('/type/:type', (req, res, next) => {
    Symbol.find({ type: req.params.type}).lean()
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
    Symbol.findOne({_id: req.params.id}).lean()
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
    Symbol.create(req.body.symbol, (err, doc) => {
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
    Symbol.findOneAndRemove({_id: req.params.id},  (err, result) => {
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
    Symbol.findOneAndUpdate({_id: req.params.id}, req.body.symbol, {new: true},   (err, doc) => {
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