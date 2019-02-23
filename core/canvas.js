const convert = require('../core/convert');
const {createCanvas} = require('canvas');

module.exports.draw = function(x, y, z, features){
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.lineWidth = 2;
    features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
            let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
            let tileXY = convert.lngLat2Tile(lng, lat, z);
            let pixelXY = convert.lngLat2Pixel(lng, lat, z);
            let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
            let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
            ctx.beginPath(); //Start path
            ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
            ctx.fill();
        } else if (feature.geometry.type === 'LineString') {
            ctx.beginPath();
            feature.geometry.coordinates.forEach( (point,index) => {
                let lng = point[0], lat = point[1];
                let tileXY = convert.lngLat2Tile(lng, lat, z);
                let pixelXY = convert.lngLat2Pixel(lng, lat, z);
                let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                if (index === 0){
                    ctx.moveTo(pixelX, pixelY);
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            });
            ctx.stroke();
        } else if (feature.geometry.type === 'Polygon') {
            ctx.beginPath();
            feature.geometry.coordinates.forEach( ring => {
                ring.forEach( (point, index) => {
                    let lng = point[0], lat = point[1];
                    let tileXY = convert.lngLat2Tile(lng, lat, z);
                    let pixelXY = convert.lngLat2Pixel(lng, lat, z);
                    let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                    let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                    if (index === 0){
                        ctx.moveTo(pixelX, pixelY);
                    } else {
                        ctx.lineTo(pixelX, pixelY);
                    }
                });
                ctx.closePath();
            });
            ctx.fill();
            ctx.stroke();
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach( polygon => {
                ctx.beginPath();
                polygon.forEach( ring => {
                    ring.forEach( (point, index) => {
                        let lng = point[0], lat = point[1];
                        let tileXY = convert.lngLat2Tile(lng, lat, z);
                        let pixelXY = convert.lngLat2Pixel(lng, lat, z);
                        let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                        let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                        if (index === 0){
                            ctx.moveTo(pixelX, pixelY);
                        } else {
                            ctx.lineTo(pixelX, pixelY);
                        }
                    });
                    ctx.closePath();
                });
                ctx.fill();
                ctx.stroke();
            });
        }
    });
    return canvas;
};