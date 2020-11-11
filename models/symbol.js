/**
 * symbol
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const SymbolSchema = new Schema({
    name: String,
    //type: 10: Circle, 11: Marker, 20: Simple Line, 30 Simple Polygon(Fill)
    type: Number,
    //size,marker,stroke,fill
    style: {
        //Circle
        radius: Number,
        //Marker
        width: Number,
        height: Number,
        offsetX: Number,
        offsetY: Number,
        icon: String,
        //Stroke
        stroke: Boolean,
        strokeColor: String,
        strokeOpacity: Number,
        //Fill
        fill: Boolean,
        fillColor: String,
        fillOpacity: Number,
        //Line
        lineWidth: Number,
        lineCap: String,
        lineJoin: String
    }              
});
const Symbol = mongoose.model('Symbol', SymbolSchema);

module.exports = Symbol;