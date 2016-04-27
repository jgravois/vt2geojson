'use strict';

var test = require('tap').test;
var nock = require('nock');
var fs = require('fs');
var vt2geojson = require('./');

var tile = nock('http://api.mapbox.com')
    .get('/9/150/194.pbf')
    .reply(200, fs.readFileSync('fixtures/9-150-194.pbf'));

test('url', function (t) {
    vt2geojson({
        uri: 'http://api.mapbox.com/9/150/194.pbf',
        layer: 'state_label'
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.150275473401365]
        });
        t.end();
    });
});

test('local file', function (t) {
    vt2geojson({
        uri: './fixtures/9-150-194.pbf',
        layer: 'state_label',
        x: 150,
        y: 194,
        z: 9
    }, function (err, result) {
        t.ifError(err);
        t.deepEqual(result.type, 'FeatureCollection');
        t.deepEqual(result.features[0].properties.name, 'New Jersey');
        t.deepEqual(result.features[0].geometry, {
            type: 'Point',
            coordinates: [-74.38928604125977, 40.150275473401365]
        });
        t.end();
    });
});