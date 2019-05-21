const express = require('express');
const moment = require('moment');
const router = express.Router();
const Map = require("../models/map");

router.get('/',  (req, res, next) => {
    Map.find()
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
    Map.findOne({_id: req.params.id})
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
    req.body.map.name = "MAP" + moment().format('YYMMDDHHmmss');
    Map.create(req.body.map, (err, doc) => {
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
    Map.findOneAndRemove({_id: req.params.id},  (err, result) => {
        if (err) {
            res.status(500);
            res.json({
                result: false
            });
        } else {
            res.status(200);
            res.json({
                result:true
            });
        }
    });
});


router.post('/:id/update', (req, res, next) => {
    Map.findOne({
        $and:[
            { _id: {$ne: req.params.id} },
            { name: req.body.map.name }
        ]
    }).exec( (err, doc) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            if (doc){
                res.status(200);
                res.json({result:false});
            } else {
                Map.findOneAndUpdate({_id: req.params.id}, req.body.map, {new: true},   (err, doc) => {
                    if (err) {
                        res.status(500);
                        res.json(err);
                    } else {
                        res.status(200);
                        res.json({result:true});
                    }
                });
            }
        }
    });
});



module.exports = router;