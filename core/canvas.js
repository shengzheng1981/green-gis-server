const path = require('path');
const convert = require('../core/convert');
const Meta = require("../models/meta");
const Symbol = require("../models/symbol");
const {createCanvas, loadImage} = require('canvas');

module.exports.draw = async function(meta, x, y, z, features){
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    const getRGBA = ( color, opacity ) => {
        color = color || '#ff0000';
        opacity = opacity != undefined ? opacity : 1.0;
        //十六进制颜色值的正则表达式
        const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        // 如果是16进制颜色
        if (color && reg.test(color)) {
            if (color.length === 4) {
                let sColorNew = "#";
                for (let i=1; i<4; i+=1) {
                    sColorNew += color.slice(i, i+1).concat(color.slice(i, i+1));
                }
                color = sColorNew;
            }
            //处理六位的颜色值
            const sColorChange = [];
            for (let i=1; i<7; i+=2) {
                sColorChange.push(parseInt("0x"+color.slice(i, i+2)));
            }
            return "rgba(" + sColorChange.join(",") + "," + opacity + ")";
        }
        return color;
    };

    const getDefaultSymbol = () => {
        if (meta.geomType === 0){
            return {
                type : 10,
                style : {
                    radius: 6,
                    fillColor: '#ff0000',
                    fillOpacity: 1,
                    color: '#ff0000',
                    opacity: 1,
                    weight: 2
                }
            }
        } else if (meta.geomType === 1){
            return {
                type : 10,
                style : {
                    color: '#ff0000',
                    opacity: 1,
                    weight: 2
                }
            }
        } else if (meta.geomType === 2){
            return {
                type : 10,
                style : {
                    fillColor: '#ff0000',
                    fillOpacity: 1,
                    color: '#ff0000',
                    opacity: 1,
                    weight: 2
                }
            }
        }
    };

    const getSymbol = (feature) => {
        const defaultSymbol = getDefaultSymbol();
        if (meta.renderer.renderType === 0) {
            return meta.renderer.simple ? meta.renderer.simple.symbol : defaultSymbol;
        } else if (meta.renderer.renderType === 1) {
            if (meta.renderer.category && meta.renderer.category.field && Array.isArray(meta.renderer.category.categories)) {
                const category = meta.renderer.category.categories.find( item => item.value == feature.properties[meta.renderer.category.field]);
                return category ? category.symbol : defaultSymbol;
            } else {
                return defaultSymbol;
            }
        } else if (meta.renderer.renderType === 2) {
            if (meta.renderer.class && meta.renderer.class.field && Array.isArray(meta.renderer.class.breaks)) {
                const category = meta.renderer.class.breaks.find( item => item.min <= feature.properties[meta.renderer.class.field] && item.max >= feature.properties[meta.renderer.class.field]);
                return category ? category.symbol : defaultSymbol;
            } else {
                return defaultSymbol;
            }
        } else  {
            return defaultSymbol;
        }
    };

    //no renderer
    if(!meta.renderer) return canvas;
    meta = await Meta.populate(meta, ([{"path": "renderer.simple.symbol"}, {"path": "renderer.category.categories.symbol"}, {"path": "renderer.class.breaks.symbol"}]));
    //default
    ctx.strokeStyle = 'rgba(255,0,0,1)';
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.lineWidth = 2;

    //TODO await loadImage & cache image
    /*if (meta.symbol){
        if (meta.symbol.type === 10){
            ctx.fillStyle = getRGBA(meta.symbol.style.fillColor, meta.symbol.style.fillOpacity);
            meta.symbol.style.radius = meta.symbol.style.radius || 6;
        } else if (meta.symbol.type === 20){
            ctx.strokeStyle = getRGBA(meta.symbol.style.color, meta.symbol.style.opacity);
            ctx.lineWidth = meta.symbol.style.weight ? (meta.symbol.style.weight || 2) : 2;
        } else if (meta.symbol.type === 30){
            ctx.strokeStyle = getRGBA(meta.symbol.style.color, meta.symbol.style.opacity);
            ctx.fillStyle = getRGBA(meta.symbol.style.fillColor, meta.symbol.style.fillOpacity);
        } else if (meta.symbol.type === 11){
            meta.symbol.style.image = await loadImage(path.join(path.join(path.join(path.dirname(__dirname), 'public'),'images'), meta.symbol.style.marker || 'marker.png'));
            meta.symbol.style.width =  meta.symbol.style.width || 16;
            meta.symbol.style.height =  meta.symbol.style.height || 16;
        }
    }*/

    features.forEach( async (feature) => {
        const symbol = getSymbol(feature);

        if (feature.geometry.type === 'Point') {
            let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
            let tileXY = convert.lngLat2Tile(lng, lat, z);
            let pixelXY = convert.lngLat2Pixel(lng, lat, z);
            let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
            let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;

            if (symbol.type === 11) {
                symbol.style.image = symbol.style.image || await loadImage(path.join(path.join(path.join(path.dirname(__dirname), 'public'),'images'), symbol.style.marker || 'marker.png'));
                symbol.style.width =  symbol.style.width || 16;
                symbol.style.height =  symbol.style.height || 16;
                ctx.drawImage(symbol.style.image, pixelX, pixelY, symbol.style.width, symbol.style.height);
            } else  {
                ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
                ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                ctx.beginPath(); //Start path
                ctx.arc(pixelX, pixelY, symbol.style.radius, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                ctx.fill();
                ctx.stroke();
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
            ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
            ctx.lineWidth = symbol.style.weight ? (symbol.style.weight || 2) : 2;
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
            ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
            ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
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
            ctx.strokeStyle = getRGBA(symbol.style.color, symbol.style.opacity);
            ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
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