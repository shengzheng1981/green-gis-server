# Green GIS Server [![Build Status](https://travis-ci.org/shengzheng1981/green-gis-server.svg?branch=master)](https://travis-ci.org/shengzheng1981/green-gis-server)
Green GIS Server is a light server for publishing shapefile. Using node-gdal to convert to JSON, it stores feature collection in mongodb. And also, it handles requests for geojson data\image tile data\vector tile data.

# Features
1. publishing shapefile (just support shapefile now)
2. return all or part of feature collection by geojson format
3. backend render, using node-canvas to generate dynamic image tile
4. frontend render, return feature collection according to tile's x/y/z

# Dependencies
1. mongodb + mongoose
2. node-gdal
3. node-canvas

# Step to Start Server
1. npm install
2. download and install mongo
3. config.json to config mongo connection
4. start

# Sample application
Green GIS Manager is a sample application and a manager to manage all published feature collection, you can test geojson\backend\frontend menu for all of the features.

# License
Just for personal study and research.

