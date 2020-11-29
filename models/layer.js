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
    //feature class
    class: {
        type: ObjectId,
        ref: 'FeatureClass'
    },
    label: {
        field: {
            name: String,
            type: {type: String}
        },
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
                type:  {type: Number},
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
            }
        },
        category: {
            field: {
                name: String,
                type: {type: String}
            },
            categories: [
                {
                    symbol: {
                        type:  {type: Number},
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
                    },
                    value: String,
                    label: String
                }
            ]
        },
        class: {
            field: {
                name: String,
                type: {type: String}
            },
            breaks: [
                {
                    symbol: {
                        type:  {type: Number},
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