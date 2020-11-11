const config = require('../config');
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
//schema (key,value); key: feature class name; value: mongoose schema model
const models = {}; 
//class (key,value);  key: feature class name; value: feature class      
const classes = {};
const FeatureClass = require('../models/feature-class');

/* init schema. */
module.exports.init = function(){
    mongoose.connection.db.listCollections().toArray( (err, names) => {
        mongoose.modelNames().forEach( name => {
            if (name !== 'Meta'&& name !== 'FeatureClass' && name !== 'Layer' && name !== 'Symbol' && name !== 'Label' && name !== 'Map'){
                mongoose.deleteModel(name);
            }
        });
        names.forEach( item => {
            if (item.name !== 'metas' && item.name !== 'featureClasses' && item.name !== 'layers' && item.name !== 'symbols' && item.name !== 'labels' && item.name !== 'maps'){
                const schema = new Schema({
                    geometry: {},
                    properties:{},
                    zooms : []
                },{ collection: item.name });
                models[item.name] = mongoose.model(item.name, schema);
            }
        });
        FeatureClass.find()
            .lean().exec( (err, docs) => {
            docs.forEach( item => {
                classes[item.name] = item;
            })
        });
    });
};

/* add schema. */
module.exports.add = function(cls){
    if (!(cls.name in models)) {
        const schema = new Schema({
            geometry: {},
            properties:{},
            zooms : []
        },{ collection: cls.name });
        const { minZoom = 0, maxZoom = 20 } = config.tile || {};
        // add index, very important!!!
        for (z = minZoom; z <= maxZoom; z++){
            const index = {};
            index['zooms.' + z + '.tileMin.tileX'] = 1;
            index['zooms.' + z + '.tileMin.tileY'] = 1;
            index['zooms.' + z + '.tileMax.tileX'] = -1;
            index['zooms.' + z + '.tileMax.tileY'] = -1;
            schema.index(index, { name: 'zoom_index_' + z });
        }
        models[cls.name] = mongoose.model(cls.name, schema);
        classes[cls.name] = cls;
    }
};

/* get model. */
module.exports.model = function(name){
    if (!models[name]) {
        throw new Error("model not found!");
    }
    return models[name];
};

/* get feature class. */
module.exports.class = function(name){
    if (!classes[name]) {
        throw new Error("class not found!");
    }
    return classes[name];
};

/* remove schema. */
module.exports.remove = function(name){
    delete models[name];
    delete classes[name];
    mongoose.deleteModel(name);
};

/* update feature class, call by class updated. */
module.exports.update = function(name, cls){
    classes[name] = cls;
};


