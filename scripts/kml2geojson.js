var kml = require('gtran-kml');
 
// Specify promise library if necessary
// kml.setPromiseLib(require('bluebird'));

kml.toGeoJson('../dataset/demo/japan30_no2_concentration_monthly.kml').then(function(object) {
    var geojson = object;
    console.log(geojson);
});


