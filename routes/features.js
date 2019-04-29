const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const gdal = require("gdal");
const Meta = require('../models/meta');
const schema = require('../core/schema');
const tile = require('../core/tile');
const cache = require('../core/cache');

router.get('/all', function(req, res, next) {
    Meta.find().populate([{"path": "symbol"}]).exec( (err, docs) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            res.status(200);
            res.json(docs);
        }
    })
});

router.post('/publish/shapefile', function(req, res, next) {
    const name = req.body.name;
    const shapefile = path.join(path.join(path.join(path.dirname(__dirname), 'public'),'shapes'), name + '.shp');
    const ds = gdal.open(shapefile);
    const layer = ds.layers.get(0);

    Meta.findOne({
        name: name
    }).exec(function(err, meta) {
        if (err) {
            res.status(500);
            res.json(err);
        } else{
            if (meta) {
                res.status(200);
                res.json({
                    result: false,
                    message: "name exists"
                });
            }else{
                meta = {
                    name: name,
                    geomType: layer.geomType,
                    tile: true,
                    properties: layer.fields.getNames(),
                };
                Meta.create(meta, (err, doc) => {
                    if (err) {
                        res.status(500);
                        res.json(err);
                    }
                    else{
                        schema.add(doc.toObject());
                        /*let geomType = "Point";
                        switch (layer.geomType) {
                            case gdal.wkbPoint:
                                geomType = "Point";
                            case gdal.wkbLineString:
                                geomType = "LineString";
                            case gdal.wkbPolygon:
                                geomType = "Polygon";
                        }*/
                        const features = [];
                        const model = schema.model(name);
                        const srs = gdal.SpatialReference.fromEPSG(4326);
                        layer.features.forEach( item => {
                            try{
                                const geometry = item.getGeometry();
                                geometry.transformTo(srs);
                                const feature = tile.calc({
                                    geometry: JSON.parse(geometry.toJSON()),
                                    properties: JSON.parse(item.fields.toJSON())
                                });
                                features.push(model(feature));
                            } catch (e) {
                                console.log(e);
                            }
                        });
                        model.insertMany(features, (err, docs)=>{
                            if (err) {
                                res.status(500);
                                res.json(err);
                            } else {
                                cache.add(name);
                                console.log( name + ' published!');
                                res.status(200);
                                res.json({
                                    result: true
                                });
                            }
                        });

                    }
                });
            }
        }
    });
});

router.get('/geojson/:name', function(req, res, next) {
    const model = schema.model(req.params.name);
    if (model) {
        model.find().lean().exec( (err, docs) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else{
                const features = docs.map( feature => {
                    return {
                        ...feature,
                        type: "Feature"
                    }
                });
                res.status(200);
                res.json({
                    type:"FeatureCollection",
                    totalFeatures: features.length,
                    features: features
                });
            }
        });
    }else {
        res.status(404);
        res.json({
            result: false,
            message: "model not found"
        });
    }
});

router.get('/:name/remove',  (req, res) => {
    Meta.findOneAndRemove({name: req.params.name},  (err, result) => {
        if (err) {
            res.status(500);
            res.json(err);
        } else {
            mongoose.connection.db.dropCollection(req.params.name,  (err, result) => {
                if (err) {
                    res.status(500);
                    res.json(err);
                } else {
                    res.status(200);
                    res.json({result:true});
                }
            });
        }
    });
});

module.exports = router;