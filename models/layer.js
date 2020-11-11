/**
 * map
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const LayerSchema = new Schema({
    //display name
    name: String,
    //zoom-min
    min: Number,
    //zoom-max
    max: Number,
    //mode: "geojson", "frontend", "backend", "static", "stream"
    mode: String,
    //feature class
    class: {
        type: ObjectId,
        ref: 'FeatureClass'
    },
    label: {
        field: String,
        offset: {
            x: Number,
            y: Number
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
    },
    renderer: {
        //0 Simple 1 Category 2 Class
        method: Number,
        simple: {
            symbol: {
                type: ObjectId,
                ref: 'Symbol'
            }
        },
        category: {
            field: String,
            categories: [
                {
                    symbol: {
                        type: ObjectId,
                        ref: 'Symbol'
                    },
                    value: String,
                    label: String
                }
            ]
        },
        class: {
            field: String,
            breaks: [
                {
                    symbol: {
                        type: ObjectId,
                        ref: 'Symbol'
                    },
                    min: Number,
                    max: Number,
                    label: String
                }
            ]
        }
    }
},{ collection: 'layers' });
const Layer = mongoose.model('Layer', LayerSchema);

module.exports = Layer;