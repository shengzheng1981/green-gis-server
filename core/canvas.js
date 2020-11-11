const path = require('path');
const convert = require('../core/convert');
const schema = require('../core/schema');
const {createCanvas, loadImage} = require('canvas');

/*
* 绘制切片
* 默认大小(256*256)
*/
module.exports.draw = async function(layer, x, y, z){
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    //default
    ctx.strokeStyle = 'rgba(255,0,0,1)';
    ctx.fillStyle = 'rgba(255,0,0,1)';
    ctx.lineWidth = 2;

    //no renderer
    if(!layer.renderer || !layer.class) return canvas;
    //统一颜色格式为rgb或rgba
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
    //默认符号
    const getDefaultSymbol = () => {
        switch (layer.class.geotype) {
            case 1: 
                return {
                    type : 10,
                    style : {
                        radius: 6,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        strokeColor: '#ff0000',
                        strokeOpacity: 1,
                        lineWidth: 2
                    }
                }
            case 2: 
                return {
                    type : 20,
                    style : {
                        strokeColor: '#ff0000',
                        strokeOpacity: 1,
                        lineWidth: 2
                    }
                }
            case 3:
                return {
                    type : 30,
                    style : {
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        strokeColor: '#ff0000',
                        strokeOpacity: 1,
                        lineWidth: 2
                    }
                }
            case 4:
                return {
                    type : 10,
                    style : {
                        radius: 6,
                        fillColor: '#ff0000',
                        fillOpacity: 1,
                        strokeColor: '#ff0000',
                        strokeOpacity: 1,
                        lineWidth: 2
                    }
                }
        }
    };
    //根据渲染方式获得符号
    const getSymbol = (feature) => {
        const defaultSymbol = getDefaultSymbol();
        switch (layer.renderer.method) {
            case 0: 
                return layer.renderer.simple ? layer.renderer.simple.symbol : defaultSymbol;
            case 1:
                if (layer.renderer.category && layer.renderer.category.field && Array.isArray(layer.renderer.category.categories)) {
                    const item = layer.renderer.category.categories.find( item => feature.properties && item.value == feature.properties[layer.renderer.category.field.name]);
                    return item ? item.symbol : defaultSymbol;
                } else {
                    return defaultSymbol;
                }
            case 2:
                if (layer.renderer.class && layer.renderer.class.field && Array.isArray(layer.renderer.class.breaks)) {
                    const item = layer.renderer.class.breaks.find( item => feature.properties && item.min <= feature.properties[layer.renderer.class.field.name] && item.max >= feature.properties[layer.renderer.class.field.name]);
                    return item ? item.symbol : defaultSymbol;
                } else {
                    return defaultSymbol;
                }
        }
    };

    //query features
    const query =  {};
    query['zooms.' + z + '.tileMin.tileX'] = {'$lte': x };
    query['zooms.' + z + '.tileMin.tileY'] = {'$lte': y };
    query['zooms.' + z + '.tileMax.tileX'] = {'$gte': x };
    query['zooms.' + z + '.tileMax.tileY'] = {'$gte': y };
    const model = schema.model(layer.class.name);
    const features = await model.find(query).lean();

    //TODO await loadImage & cache image
    for(let feature of features){
        const symbol = getSymbol(feature);
        switch (feature.geometry.type) {
            case 'Point':
                let lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1];
                //此处计算经纬度的切片坐标及像素坐标，虽然在调用该函数前，已获取当前切片的所有要素，但要素的坐标数组难免会落到别的切片中，因此仍有计算切片坐标之必要。
                //如可通过turf.js等类库对要素进行裁剪，此处可被优化。
                let tileXY = convert.lngLat2Tile(lng, lat, z);
                let pixelXY = convert.lngLat2Pixel(lng, lat, z);
                let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
    
                if (symbol.type === 11) {
                    symbol.style.image = symbol.style.image || await loadImage(path.join(path.join(path.join(path.dirname(__dirname), 'public'),'images'), symbol.style.icon || 'marker.png'));
                    symbol.style.width =  symbol.style.width || 16;
                    symbol.style.height =  symbol.style.height || 16;
                    symbol.style.offsetX =  symbol.style.offsetX || -8;
                    symbol.style.offsetY =  symbol.style.offsetY || -8;
                    ctx.drawImage(symbol.style.image, pixelX + symbol.style.offsetX, pixelY + symbol.style.offsetY, symbol.style.width, symbol.style.height);
                } else  {
                    ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
                    ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                    ctx.beginPath(); //Start path
                    ctx.arc(pixelX, pixelY, symbol.style.radius, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                    ctx.fill();
                    ctx.stroke();
                }
                //label
                /*if (feature.properties.name && tileXY.tileX == x && tileXY.tileY == y) {
                    ctx.font = 'bold 12px serif';
                    ctx.fillStyle = 'rgba(255,0,0,1)';
                    const textY = (pixelY + 16 < 256 ) ? pixelY + 16 : pixelY - 16;
                    const measure =  ctx.measureText(feature.properties.name).width;
                    const textX = (pixelX + measure < 256) ? pixelX : 256 - measure;
                    ctx.fillText(feature.properties.name, textX, textY);
                }*/
                break;
            case 'MultiPoint': 
                feature.geometry.coordinates.forEach( async (point,index) => {
                    let lng = point[0], lat = point[1];
                    let tileXY = convert.lngLat2Tile(lng, lat, z);
                    let pixelXY = convert.lngLat2Pixel(lng, lat, z);
                    let pixelX = pixelXY.pixelX + (tileXY.tileX - x) * 256;
                    let pixelY = pixelXY.pixelY + (tileXY.tileY - y) * 256;
                    if (symbol.type === 11) {
                        symbol.style.image = symbol.style.image || await loadImage(path.join(path.join(path.join(path.dirname(__dirname), 'public'),'images'), symbol.style.icon || 'marker.png'));
                        symbol.style.width =  symbol.style.width || 16;
                        symbol.style.height =  symbol.style.height || 16;
                        symbol.style.offsetX =  symbol.style.offsetX || -8;
                        symbol.style.offsetY =  symbol.style.offsetY || -8;
                        ctx.drawImage(symbol.style.image, pixelX, pixelY, symbol.style.width, symbol.style.height);
                    } else  {
                        ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
                        ctx.fillStyle = getRGBA(symbol.style.fillColor, symbol.style.fillOpacity);
                        ctx.beginPath(); //Start path
                        ctx.arc(pixelX, pixelY, symbol.style.radius, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
                        ctx.fill();
                        ctx.stroke();
                    }
                });
                break;
            case 'LineString':
                ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
                ctx.lineWidth = symbol.style.lineWidth ? (symbol.style.lineWidth || 2) : 2;
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
                break;
            case 'MultiLineString':
                ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
                ctx.lineWidth = symbol.style.lineWidth ? (symbol.style.lineWidth || 2) : 2;
                ctx.beginPath();
                feature.geometry.coordinates.forEach( line => {
                    line.forEach( (point,index) => {
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
                });
                break;
            case 'Polygon':
                ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
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
                break;
            case 'MultiPolygon':
                ctx.strokeStyle = getRGBA(symbol.style.strokeColor, symbol.style.strokeOpacity);
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
                break;
        }
    }
    return canvas;
};