const convert = require('./convert');
const config = require('../config');

/* calculate tile extent min&max */
module.exports.calc = function(feature){
    const zooms = [];
    const { buffer = 16, minZoom = 0, maxZoom = 20 } = config.tile || {};
    for ( z = minZoom; z <= maxZoom; z++ ){
        if(feature.geometry.type === 'Point') {
            let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
            let tileXY = convert.lngLat2Tile(lng, lat, z);
            let pixelXY = convert.lngLat2Pixel(lng, lat, z);
            //TODO buffer > 256
            zooms[z] = {
                tileMin: {
                    tileX : (pixelXY.pixelX - buffer) >= 0 ? tileXY.tileX :  tileXY.tileX - 1,
                    tileY : (pixelXY.pixelY - buffer) >= 0 ? tileXY.tileY :  tileXY.tileY - 1
                },
                pixelMin: {
                    pixelX : (pixelXY.pixelX - buffer) >= 0 ? pixelXY.pixelX :  pixelXY.pixelX - buffer + 256,
                    pixelY : (pixelXY.pixelY - buffer) >= 0 ? pixelXY.pixelY :  pixelXY.pixelX - buffer + 256
                },
                tileMax: {
                    tileX : (pixelXY.pixelX + buffer) <= 256 ? tileXY.tileX :  tileXY.tileX + 1,
                    tileY : (pixelXY.pixelY + buffer) <= 256 ? tileXY.tileY :  tileXY.tileY + 1
                },
                pixelMax: {
                    pixelX : (pixelXY.pixelX + buffer) <= 256 ? pixelXY.pixelX :  pixelXY.pixelX + buffer - 256,
                    pixelY : (pixelXY.pixelY + buffer) <= 256 ? pixelXY.pixelY :  pixelXY.pixelX + buffer - 256
                }
            };
        } else if (feature.geometry.type === 'LineString'){
            let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;
            feature.geometry.coordinates.forEach( point => {
                if (point[0] > xmax) xmax = point[0];
                if (point[1] > ymax) ymax = point[1];
                if (point[0] < xmin) xmin = point[0];
                if (point[1] < ymin) ymin = point[1];
            });
            let tileMin = convert.lngLat2Tile(xmin, ymax, z);
            let pixelMin = convert.lngLat2Pixel(xmin, ymax, z);
            let tileMax = convert.lngLat2Tile(xmax, ymin, z);
            let pixelMax = convert.lngLat2Pixel(xmax, ymin, z);
            zooms[z] = {
                tileMin: tileMin,
                pixelMin: pixelMin,
                tileMax: tileMax,
                pixelMax: pixelMax
            };
        } else if (feature.geometry.type === 'Polygon'){
            let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;
            feature.geometry.coordinates.forEach( ring => {
                ring.forEach( point => {
                    if (point[0] > xmax) xmax = point[0];
                    if (point[1] > ymax) ymax = point[1];
                    if (point[0] < xmin) xmin = point[0];
                    if (point[1] < ymin) ymin = point[1];
                });
            });
            let tileMin = convert.lngLat2Tile(xmin, ymax, z);
            let pixelMin = convert.lngLat2Pixel(xmin, ymax, z);
            let tileMax = convert.lngLat2Tile(xmax, ymin, z);
            let pixelMax = convert.lngLat2Pixel(xmax, ymin, z);
            zooms[z] = {
                tileMin: tileMin,
                pixelMin: pixelMin,
                tileMax: tileMax,
                pixelMax: pixelMax
            };
        } else if (feature.geometry.type === 'MultiPoint'){
            let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;
            feature.geometry.coordinates.forEach( point => {
                if (point[0] > xmax) xmax = point[0];
                if (point[1] > ymax) ymax = point[1];
                if (point[0] < xmin) xmin = point[0];
                if (point[1] < ymin) ymin = point[1];
            });
            let tileMin = convert.lngLat2Tile(xmin, ymax, z);
            let pixelMin = convert.lngLat2Pixel(xmin, ymax, z);
            let tileMax = convert.lngLat2Tile(xmax, ymin, z);
            let pixelMax = convert.lngLat2Pixel(xmax, ymin, z);
            zooms[z] = {
                tileMin: tileMin,
                pixelMin: pixelMin,
                tileMax: tileMax,
                pixelMax: pixelMax
            };
        }  else if (feature.geometry.type === 'MultiLineString'){
            let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;
            feature.geometry.coordinates.forEach( line => {
                line.forEach( point => {
                    if (point[0] > xmax) xmax = point[0];
                    if (point[1] > ymax) ymax = point[1];
                    if (point[0] < xmin) xmin = point[0];
                    if (point[1] < ymin) ymin = point[1];
                });
            });
            let tileMin = convert.lngLat2Tile(xmin, ymax, z);
            let pixelMin = convert.lngLat2Pixel(xmin, ymax, z);
            let tileMax = convert.lngLat2Tile(xmax, ymin, z);
            let pixelMax = convert.lngLat2Pixel(xmax, ymin, z);
            zooms[z] = {
                tileMin: tileMin,
                pixelMin: pixelMin,
                tileMax: tileMax,
                pixelMax: pixelMax
            };
        } else if (feature.geometry.type === 'MultiPolygon'){
            let xmin = Number.MAX_VALUE, ymin = Number.MAX_VALUE, xmax = Number.MIN_VALUE, ymax = Number.MIN_VALUE;
            feature.geometry.coordinates.forEach( polygon => {
                polygon.forEach( ring => {
                    ring.forEach(point => {
                        if (point[0] > xmax) xmax = point[0];
                        if (point[1] > ymax) ymax = point[1];
                        if (point[0] < xmin) xmin = point[0];
                        if (point[1] < ymin) ymin = point[1];
                    });
                });
            });
            let tileMin = convert.lngLat2Tile(xmin, ymax, z);
            let pixelMin = convert.lngLat2Pixel(xmin, ymax, z);
            let tileMax = convert.lngLat2Tile(xmax, ymin, z);
            let pixelMax = convert.lngLat2Pixel(xmax, ymin, z);
            zooms[z] = {
                tileMin: tileMin,
                pixelMin: pixelMin,
                tileMax: tileMax,
                pixelMax: pixelMax
            };
        }
    }
    return {
        ...feature,
        zooms : zooms
    };
};




