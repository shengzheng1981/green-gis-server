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
        marker: String,
        stroke : String,
        fill: String,
        line: {
            cap: String,
            dash: Number,
            join: String,
            width: Number
        }
    }              //size,marker,stroke,fill
});
const Symbol = mongoose.model('Symbol', SymbolSchema);

module.exports = Symbol;