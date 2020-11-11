/**
 * label
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const LabelSchema = new Schema({
    text: String,
    position: {
        lat: Number,
        lng: Number
    },
    offset: {
        x : Number,
        y : Number
    },
    placement: String,
    font: {
        family: String,
        size: Number,
        color: String,
        bold: String
    },
    background: {
        visible: Boolean,
        padding: Number,
        color: String
    },
    border: {
        visible: Boolean,
        width: Number,
        color: String
    },
    zoom: {
        min: Number,
        max: Number
    },
    map: {
        type: ObjectId,
        ref: 'Map'
    }
});
const Label = mongoose.model('Label', LabelSchema);

module.exports = Label;