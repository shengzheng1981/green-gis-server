const express = require('express');
const router = express.Router();
const Label = require("../models/label");

router.get('/',  (req, res, next) => {
    Label.find()
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

router.get('/map/:map', (req, res, next) => {
    Label.find({ map: req.params.map})
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
    Label.findOne({_id: req.params.id})
        .populate([{'path': 'map'}])
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
    Label.create(req.body.label, (err, doc) => {
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


router.get('/:id/remove', (req, res, next) => {
    Label.findOneAndRemove({_id: req.params.id},  (err, result) => {
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
    Label.findOneAndUpdate({_id: req.params.id}, req.body.label, {new: true},   (err, doc) => {
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