const express = require('express');
const router = express.Router();
const Symbol = require("../models/symbol");

router.get('/',  (req, res, next) => {
    Symbol.find()
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
    Symbol.find({ type: req.params.type})
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

router.get('/geomtype/:type', (req, res, next) => {
    let condition = {};
    if (req.params.type == 1) {
        condition = { $or: [{type: 10}, {type: 11}] };
    } else if (req.params.type == 2) {
        condition.type = 20;
    } else if (req.params.type == 3) {
        condition.type = 30;
    }
    Symbol.find(condition)
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
    Symbol.findOne({_id: req.params.id})
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
    Symbol.findOne({
        name: req.body.symbol.name
    }).exec( (err,g) => {
        if (err) {
            res.status(500);
            res.json(err);
            return;
        }
        if (g) {
            res.status(200);
            res.json({result:false});
            return;
        }
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
});


router.get('/:id/remove', (req, res, next) => {
    Symbol.findOneAndRemove({_id: req.params.id},  (err, result) => {
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
    Symbol.findOne({
        $and:[
            { _id: {$ne: req.params.id} },
            { name: req.body.symbol.name }
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
                Symbol.findOneAndUpdate({_id: req.params.id}, req.body.symbol, {new: true},   (err, doc) => {
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