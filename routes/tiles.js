const express = require('express');
const router = express.Router();
const schema = require('../core/schema');
const convert = require('../core/convert');
const cache = require('../core/cache');
const canvas = require('../core/canvas');

router.get('/vector/:name/:x/:y/:z', function(req, res, next) {
    const model = schema.model(req.params.name);
    const collection = cache.collection(req.params.name); // in memory or on the fly
    if (!collection && !model) {
        res.status(404);
        res.json({
            result: false,
            message: "model not found"
        });
        return;
    }
    const x = parseInt(req.params.x), y = parseInt(req.params.y), z = parseInt(req.params.z);
    if (collection) {
        const features = collection.filter( feature => {
            if (feature.zooms && feature.zooms[z]) {
                let tileMin = feature.zooms[z].tileMin, tileMax = feature.zooms[z].tileMax;
                if ( x >= tileMin.tileX && y >= tileMin.tileY && x <= tileMax.tileX &&  y <= tileMax.tileY ) {
                    return true;
                }
            }
            return false;
        });
        res.status(200);
        res.json(features);
    } else {
        const query =  {};
        query['zooms.' + z + '.tileMin.tileX'] = {'$lte': x };
        query['zooms.' + z + '.tileMin.tileY'] = {'$lte': y };
        query['zooms.' + z + '.tileMax.tileX'] = {'$gte': x };
        query['zooms.' + z + '.tileMax.tileY'] = {'$gte': y };
        model.find(query).lean().exec( (err, features) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.status(200);
                res.json(features);
            }
        });
    }
});

router.get('/image/:name/:x/:y/:z', async function(req, res, next) {
    const model = schema.model(req.params.name);
    const meta = schema.meta(req.params.name);
    const collection = cache.collection(req.params.name); // in memory or on the fly
    if (!model || !meta) {
        res.status(404);
        res.json({
            result: false,
            message: "model not found"
        });
        return;
    }
    const x = parseInt(req.params.x), y = parseInt(req.params.y), z = parseInt(req.params.z);
    if (collection) {
        const features = collection.filter( feature => {
            if (feature.zooms && feature.zooms[z]) {
                let tileMin = feature.zooms[z].tileMin, tileMax = feature.zooms[z].tileMax;
                if ( x >= tileMin.tileX && y >= tileMin.tileY && x <= tileMax.tileX &&  y <= tileMax.tileY ) {
                    return true;
                }
            }
            return false;
        });
        res.setHeader('Content-Type', 'image/png');
        const ctx = await canvas.draw(meta, x, y, z, features);
        ctx.createPNGStream().pipe(res);
    } else {
        const query =  {};
        query['zooms.' + z + '.tileMin.tileX'] = {'$lte': x };
        query['zooms.' + z + '.tileMin.tileY'] = {'$lte': y };
        query['zooms.' + z + '.tileMax.tileX'] = {'$gte': x };
        query['zooms.' + z + '.tileMax.tileY'] = {'$gte': y };
        model.find(query).lean().exec( async (err, features) => {
            if (err) {
                res.status(500);
                res.json(err);
            } else {
                res.setHeader('Content-Type', 'image/png');
                const ctx = await canvas.draw(meta, x, y, z, features);
                ctx.createPNGStream().pipe(res);
            }
        });
    }
});


module.exports = router;