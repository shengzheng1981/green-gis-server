/**
 * meta table
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const FeatureClassSchema = new Schema({
    //feature class name
    name: String,
    //别名
    alias: String,
    //gdal geometry type: 1: Point, 2: Polyline, 3: Polygon
    geotype: Number,
    //true: tile is ok (calculate and generate)
    tile: Boolean,
    //static image
    image: Boolean,
    //fields list
    fields:[]
},{ collection: 'featureClasses' });
const FeatureClass = mongoose.model('FeatureClass', FeatureClassSchema);

module.exports = FeatureClass;