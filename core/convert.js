module.exports.lngLat2Tile = function(lng, lat, z){
    let tileX = Math.floor( (lng+180) / 360 * Math.pow(2, z) );
    let tileY = Math.floor( ( 1/2 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) ) * Math.pow(2, z) );
    return {
        tileX : tileX,
        tileY : tileY
    }
};

module.exports.lngLat2Pixel = function(lng, lat, z){
    let pixelX = Math.floor( ( (lng + 180) / 360 * Math.pow(2, z) * 256 ) % 256 );
    let pixelY = Math.floor( ( ( 1 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) )  * Math.pow(2, z) * 256 ) % 256 );
    return {
        pixelX : pixelX,
        pixelY : pixelY
    }
};