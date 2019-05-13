const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const gdal = require("gdal");
const Meta = require('../models/meta');
const schema = require('../core/schema');
const tile = require('../core/tile');
const cache = require('../core/cache');
const canvas = require('../core/canvas');

router.get('/all', function(req, res, next) {
    Meta.find()
        .populate([{"path": "renderer.simple.symbol"}, {"path": "renderer.category.categories.symbol"}, {"path": "renderer.class.breaks.symbol"}])
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
                    properties: [],
                    renderer: {
                        type: 0,
                        simple: {}
                    }
                };
                layer.fields.forEach( item => {
                    meta.properties.push({
                        name: item.name,
                        type: item.type
                    })
                });
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
                                    result: true,
                                    doc : doc
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

router.get('/generate/:name', (req, res, next) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.find().lean().exec( async (err, docs) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else{
                //create dir
                if (docs.length == 0) {
                    res.status(200);
                    res.json({
                        result: true
                    });
                } else {
                    const tile_path = path.join(path.join(path.dirname(__dirname), 'public'),'statictiles');
                    if (!fs.existsSync(tile_path))  fs.mkdirSync(tile_path);
                    const model_path = path.join(tile_path, req.params.name);
                    if (!fs.existsSync(model_path))  fs.mkdirSync(model_path);
                    const stats = await model.aggregate([
                        { $unwind: { path: "$zooms", includeArrayIndex: "arrayIndex" } },
                        { $group: { _id: "$arrayIndex", minx: { $min: "$zooms.tileMin.tileX" }, miny: { $min: "$zooms.tileMin.tileY" }, maxx: { $max: "$zooms.tileMax.tileX" }, maxy: { $max: "$zooms.tileMax.tileY" }}},
                        { $project: { _id: 1, minx: 1, miny: 1, maxx: 1, maxy: 1  }}
                    ]);
                    for (let z = 0; z <= 18; z++) {
                        const stat = stats.find( item => item._id == z );
                        if (!stat) continue;
                        let minx = stat.minx, miny = stat.miny, maxx = stat.maxx, maxy = stat.maxy;
                        /*let sort =  {};
                        sort['zooms.' + z + '.tileMin.tileX'] = 1;
                        const minxs = await model.find().sort(sort).limit(1).lean().exec();
                        let minx = minxs[0].zooms[z].tileMin.tileX - 1;

                        sort =  {};
                        sort['zooms.' + z + '.tileMin.tileY'] = 1;
                        const minys = await model.find().sort(sort).limit(1).lean().exec();
                        let miny = minxs[0].zooms[z].tileMin.tileY - 1;

                        sort =  {};
                        sort['zooms.' + z + '.tileMax.tileX'] = -1;
                        const maxxs = await model.find().sort(sort).limit(1).lean().exec();
                        let maxx = maxxs[0].zooms[z].tileMax.tileX + 1;

                        sort =  {};
                        sort['zooms.' + z + '.tileMax.tileY'] = -1;
                        const maxys = await model.find().sort(sort).limit(1).lean().exec();
                        let maxy = maxys[0].zooms[z].tileMax.tileY + 1;*/

                        for (let x = minx; x <= maxx; x++) {
                            for (let y = miny; y <= maxy; y++) {
                                const z_path = path.join(model_path, z.toString());
                                if (!fs.existsSync(z_path))  fs.mkdirSync(z_path);
                                const x_path = path.join(z_path, x.toString());
                                if (!fs.existsSync(x_path))  fs.mkdirSync(x_path);
                                const out = fs.createWriteStream(x_path + '/' + y + '.png');
                                const features = docs.filter( item => item.zooms[z].tileMin.tileX <= x && item.zooms[z].tileMax.tileX >= x && item.zooms[z].tileMin.tileY <= y && item.zooms[z].tileMax.tileY >= y );
                                const ctx = await canvas.draw(meta, x, y, z, features);
                                ctx.createPNGStream().pipe(out);
                            }
                        }
                        //res.write(req.params.name + " level " + z + " is completed!");
                        meta.image = true;
                        Meta.findOneAndUpdate({_id: meta._id}, { image : true }).exec();
                        console.log(req.params.name + " level " + z + " is completed!");
                    }
                    res.status(200);
                    res.json({
                        result: true
                    });
                }
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

router.get('/category/:name/:field',  (req, res) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.find().distinct('properties.'+ req.params.field, (err, array) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json({
                    result:true,
                    array: array
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

router.get('/class/:name/:field',  (req, res) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.aggregate([
            { $group: { _id: null, min: { $min: "$properties." + req.params.field }, max: { $max: "$properties." + req.params.field }}},
            { $project: { _id: 0, min: 1, max: 1  }}
        ], (err, stat) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json({
                    result: true,
                    stat: stat
                });
            }
        })
    }else {
        res.status(404);
        res.json({
            result: false,
            message: "model not found"
        });
    }
});

router.post('/:name/property/count',  (req, res) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.count(req.body.condition).exec( (err, count) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json({
                    result: true,
                    count: count
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

router.post('/:name/property/search',  (req, res) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.find(req.body.condition).lean().exec( (err, docs) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json({
                    result: true,
                    features: docs
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

router.post('/:name/property/update',  (req, res) => {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    if (model && meta) {
        model.findOneAndUpdate({_id: req.body.feature._id}, req.body.feature, {new: true}, (err, doc) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json({
                    result: true,
                    doc: doc
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
                    schema.remove(req.params.name);
                    res.status(200);
                    res.json({result:true});
                }
            });
        }
    });
});

router.post('/:name/update',  (req, res) => {
    Meta.findOneAndUpdate({name: req.params.name}, req.body.feature, {new: true}, (err, doc) => {
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

module.exports = router;