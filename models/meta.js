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
    renderer: {
        renderType: Number,       //0 Simple 1 Category 2 Class
        simple: {
            symbol : {
                type : ObjectId,
                ref  : 'Symbol'
            }
        },
        category: {
            field: String,
            categories: [
                {
                    symbol : {
                        type : ObjectId,
                        ref  : 'Symbol'
                    },
                    value: String,
                    label: String,
                }
            ]
        },
        class: {
            field: String,
            breaks: [
                {
                    symbol : {
                        type : ObjectId,
                        ref  : 'Symbol'
                    },
                    min: Number,
                    max: Number,
                    label: String,
                }
            ]
        }
    },
    properties:[]          //fields list
});
const Meta = mongoose.model('Meta', MetaSchema);

module.exports = Meta;