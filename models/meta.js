/**
 * meta table
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const MetaSchema = new Schema({
    name: String,           //feature class name
    geomType: Number,      //geometry type: 0: Point, 1: Polyline, 2: Polygon
    tile: Boolean,         //true: tile is ok (calculate and generate)
    cache: Boolean,        //cache in memory
    symbol : {
        type : ObjectId,
        ref  : 'Symbol'
    },
    properties:[]          //fields list
});
const Meta = mongoose.model('Meta', MetaSchema);

module.exports = Meta;