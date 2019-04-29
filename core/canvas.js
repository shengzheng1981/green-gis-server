const path = require('path');
const convert = require('../core/convert');
const {createCanvas, loadImage} = require('canvas');

module.exports.draw = async function(meta, x, y, z, features){
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    //default
    ctx.strokeStyle = 'rgba(255,0,0,1)';
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.lineWidth = 2;

    if (meta.symbol){
        if (meta.symbol.type === 10){   //
            ctx.fillStyle = meta.symbol.style.fill || 'rgba(255,0,0,0.5)';
            meta.symbol.style.radius = meta.symbol.style.radius || 6;
        } else if (meta.symbol.type === 20){   //
            ctx.strokeStyle = meta.symbol.style.stroke || 'rgba(255,0,0,1)';
            ctx.lineWidth = meta.symbol.style.line ? (meta.symbol.style.line.width || 2) : 2;
        } else if (meta.symbol.type === 30){   //
            ctx.strokeStyle = meta.symbol.style.stroke || 'rgba(255,0,0,1)';
            ctx.fillStyle = meta.symbol.style.fill || 'rgba(255,0,0,0.5)';
        } else if (meta.symbol.type === 11){   //
            meta.symbol.style.image = await loadImage(path.join(path.join(path.join(path.dirname(__dirname), 'public'),'images'), meta.symbol.style.marker || 'marker.png'));
            meta.symbol.style.width =  meta.symbol.style.width || 16;
            meta.symbol.style.height =  meta.symbol.style.height || 16;
        }
    }

    features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
            let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
            let tileXY = convert.lngLat2Tile(lng, lat, z);
            let pixelXY = convert.lngLat2Pixel(lng, lat, z);
            let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
            let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
            ctx.beginPath(); //Start path

            if (meta.symbol && meta.symbol.type === 11) {
                ctx.drawImage(meta.symbol.style.image, pixelX, pixelY, meta.symbol.style.width, meta.symbol.style.height);
            } else if (meta.symbol && meta.symbol.type === 10) {
                ctx.fillStyle = meta.symbol.style.fill || 'rgba(255,0,0,0.5)';
                meta.symbol.style.radius = meta.symbol.style.radius || 6;
                ctx.arc(pixelX, pixelY, meta.symbol.style.radius, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                ctx.fill();
            } else {
                ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                ctx.fill();
            }

            /*if (feature.properties.name && tileXY.tileX == x && tileXY.tileY == y) {
                ctx.font = 'bold 12px serif';
                ctx.fillStyle = 'rgba(255,0,0,1)';
                const textY = (pixelY + 16 < 256 ) ? pixelY + 16 : pixelY - 16;
                const measure =  ctx.measureText(feature.properties.name).width;
                const textX = (pixelX + measure < 256) ? pixelX : 256 - measure;
                ctx.fillText(feature.properties.name, textX, textY);
            }*/

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