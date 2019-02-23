const config = require('../config');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const models = {};             //schema (key,value); key: feature class name; value: mongoose schema model

module.exports.init = function(){
    mongoose.connection.db.listCollections().toArray( (err, names) => {
        names.forEach( item => {
            if (item.name !== 'metas'){
                module.exports.add(item.name);
            }
        })
    });
};

module.exports.add = function(name){
    if (!(name in models)) {
        const schema = new Schema({
            geometry: {},
            properties:{},
            zooms : []
        },{ collection: name });
        const { minZoom = 0, maxZoom = 20 } = config.tile || {};
        for (z = minZoom; z <= maxZoom; z++){
            const index = {};
            index['zooms.' + z + '.tileMin.tileX'] = 1;
            index['zooms.' + z + '.tileMin.tileY'] = 1;
            index['zooms.' + z + '.tileMax.tileX'] = -1;
            index['zooms.' + z + '.tileMax.tileY'] = -1;
            schema.index(index);
        }
        models[name] = mongoose.model(name, schema);
    }
};

module.exports.model = function(name){
    return models[name];
};


