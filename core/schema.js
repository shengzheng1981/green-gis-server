const config = require('../config');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const models = {};             //schema (key,value); key: feature class name; value: mongoose schema model
const metas = {};
const Meta = require('../models/meta');
const Symbol = require('../models/symbol');

module.exports.init = function(){
    mongoose.connection.db.listCollections().toArray( (err, names) => {
        names.forEach( item => {
            if (item.name !== 'metas' && item.name !== 'symbols'){
                const schema = new Schema({
                    geometry: {},
                    properties:{},
                    zooms : []
                },{ collection: item.name });
                models[item.name] = mongoose.model(item.name, schema);
            }
        });
        Meta.find().populate([{"path": "symbol"}]).lean().exec( (err, docs) => {
            docs.forEach( item => {
                metas[item.name] = item;
            })
        });
    });
};

module.exports.add = function(meta){
    if (!(meta.name in models)) {
        const schema = new Schema({
            geometry: {},
            properties:{},
            zooms : []
        },{ collection: meta.name });
        const { minZoom = 0, maxZoom = 20 } = config.tile || {};
        for (z = minZoom; z <= maxZoom; z++){
            const index = {};
            index['zooms.' + z + '.tileMin.tileX'] = 1;
            index['zooms.' + z + '.tileMin.tileY'] = 1;
            index['zooms.' + z + '.tileMax.tileX'] = -1;
            index['zooms.' + z + '.tileMax.tileY'] = -1;
            schema.index(index);
        }
        models[meta.name] = mongoose.model(meta.name, schema);
        metas[meta.name] = meta;
    }
};

module.exports.model = function(name){
    return models[name];
};

module.exports.meta = function(name){
    return metas[name];
};


