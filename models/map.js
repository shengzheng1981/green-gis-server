/**
 * map
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const MapSchema = new Schema({
    name: String,
    title: String,
    layers: [{
        name: String,
        order: Number,           //z-index
        min: Number,             //zoom-min
        max: Number              //zoom-max
    }]
});
const Map = mongoose.model('Map', MapSchema);

module.exports = Map;