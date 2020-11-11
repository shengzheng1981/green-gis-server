/**
 * map
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const MapSchema = new Schema({
    //display name
    name: String,
    layers: [{
        //display order
        order: Number,
        layer: {
            type: ObjectId,
            ref: 'Layer'
        }
    }]
},{ collection: 'maps' });
const Map = mongoose.model('Map', MapSchema);

module.exports = Map;