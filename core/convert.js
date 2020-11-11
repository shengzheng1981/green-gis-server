/**
 * 经纬度坐标转切片坐标
 * @param lng
 * @param lat
 */
module.exports.lngLat2Tile = function(lng, lat, z){
    let tileX = Math.floor( (lng + 180) / 360 * Math.pow(2, z) );
    let tileY = Math.floor( ( 1/2 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) ) * Math.pow(2, z) );
    return {
        tileX : tileX,
        tileY : tileY
    }
};

/**
 * 经纬度坐标转切片内像素坐标
 * @param lng
 * @param lat
 */
module.exports.lngLat2Pixel = function(lng, lat, z){
    let pixelX = Math.floor( ( (lng + 180) / 360 * Math.pow(2, z) * 256 ) % 256 );
    let pixelY = Math.floor( ( ( 1 - ( Math.log(Math.tan(lat * Math.PI/180) + 1 / Math.cos(lat * Math.PI/180)) ) / (2 * Math.PI) )  * Math.pow(2, z) * 256 ) % 256 );
    return {
        pixelX : pixelX,
        pixelY : pixelY
    }
};

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
module.exports.wgs84togcj02 = function (lng, lat) {
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    lat = +lat;
    lng = +lng;
    const transformlat = (lng, lat) => {
        var lat = +lat;
        var lng = +lng;
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    };
    const transformlng = (lng, lat) => {
        var lat = +lat;
        var lng = +lng;
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
        return ret;
    };
    let dlat = transformlat(lng - 105.0, lat - 35.0);
    let dlng = transformlng(lng - 105.0, lat - 35.0);
    let radlat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);
    const mglat = lat + dlat;
    const mglng = lng + dlng;
    return [mglng, mglat];
};
