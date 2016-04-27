'use strict';

var vt = require('vector-tile');
var request = require('request');
var Protobuf = require('pbf');
var format = require('util').format;
var fs = require('fs');

module.exports = function(args, callback) {

    try {
        var file = fs.lstatSync(args.uri);
        if (file.isFile()) {
            fs.readFile(args.uri, function(err, data) {
                if (err) throw err;
                readTile(data);
            });
        }
    } catch(err) {
        request.get({
            url: args.uri,
            gzip: true,
            encoding: null
        }, function (err, response, body) {
            if (err) throw err;
            readTile(body);
        });
    }

    function readTile(buffer) {
        var zxy = args.uri.match(/\/(\d+)\/(\d+)\/(\d+)/);
        args.x = args.x === undefined ? zxy[2] : args.x;
        args.y = args.y === undefined ? zxy[3] : args.y;
        args.z = args.z === undefined ? zxy[1] : args.z;

        if (args.x === undefined || args.y === undefined || args.z === undefined) {
            return callback(new Error(format("Could not determine tile z, x, and y from %s; specify manually with -z <z> -x <x> -y <y>", JSON.stringify(args.uri))));
        }

        var tile = new vt.VectorTile(new Protobuf(buffer));
        var layers = args.layer || Object.keys(tile.layers);

        if (!Array.isArray(layers))
            layers = [layers]

        layers.forEach(function (layerID) {
            var layer = tile.layers[layerID];
            var collection = {type: "FeatureCollection", features: []};

            for (var i = 0; i < layer.length; i++) {
                var feature = layer.feature(i).toGeoJSON(args.x, args.y, args.z);
                feature.coordinates = layer.feature(i).loadGeometry();
                collection.features.push(feature);
            }

            callback(null, collection);
        });
    }
};