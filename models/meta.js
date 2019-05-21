/**
 * meta table
 */
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const MetaSchema = new Schema({
    name: String,           //feature class name
    geomType: Number,      //geometry type: 1: Point, 2: Polyline, 3: Polygon
    tile: Boolean,         //true: tile is ok (calculate and generate)
    cache: Boolean,        //cache in memory
    image: Boolean,        //static image
    label: {
        field: {},
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
    },
    renderer: {
        renderType: Number,       //0 Simple 1 Category 2 Class
        simple: {
            symbol : {
                type : ObjectId,
                ref  : 'Symbol'
            }
        },
        category: {
            field: {},
            categories: [
                {
                    auto: Boolean,      // auto true: use type & style, false: use symbol reference
                    symbol : {
                        type : ObjectId,
                        ref  : 'Symbol'
                    },
                    value: String,
                    label: String,
                    style : {
                        radius: Number,
                        fillColor: String,
                        fillOpacity: Number,
                        color: String,
                        opacity: Number,
                        weight: Number
                    }
                }
            ]
        },
        class: {
            field: {},
            breaks: [
                {
                    auto: Boolean,      // auto true: use type & style, false: use symbol reference
                    symbol : {
                        type : ObjectId,
                        ref  : 'Symbol'
                    },
                    min: Number,
                    max: Number,
                    label: String,
                    style : {
                        radius: Number,
                        fillColor: String,
                        fillOpacity: Number,
                        color: String,
                        opacity: Number,
                        weight: Number
                    }
                }
            ]
        }
    },
    properties:[]          //fields list
});
const Meta = mongoose.model('Meta', MetaSchema);

module.exports = Meta;