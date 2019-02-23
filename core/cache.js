const schema = require('./schema');
const mongoose = require('mongoose');
const collections = {};          //cache (key,value); key: feature class name; value: feature collection with zooms

module.exports.init = function(){
    mongoose.connection.db.listCollections().toArray( (err, names) => {
        names.forEach( item => {
            if (item.name !== 'metas' && item.cache){
                module.exports.add(item.name);
            }
        })
    });
};

module.exports.add = function(name) {
    const model = schema.model(name);
    if (model) {
        console.time(name);
        model.find().select("geometry zooms").lean().exec( (err, docs) => {
            if (!err){
                collections[name] = docs;
                console.timeEnd(name);
                console.log(name + " count: " + docs.length)
            }
        });
    }
};

module.exports.collection = function(name){
    return collections[name];
};