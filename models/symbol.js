/**
 * symbol
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SymbolSchema = new Schema({
    name : String,
    type: Number,          //type: 10: Circle, 11: Marker, 20: Simple Line, 30 Simple Polygon(Fill)
    style : {
        radius: Number,
        width: Number,
        height: Number,
        anchorX: Number,
        anchorY: Number,
        marker: String,
        stroke: Boolean,
        fill: Boolean,
        fillColor: String,
        fillOpacity: Number,
        color: String,
        opacity: Number,
        weight: Number,
        lineCap: String,
        lineJoin: String
    }              //size,marker,stroke,fill
});
const Symbol = mongoose.model('Symbol', SymbolSchema);

module.exports = Symbol;