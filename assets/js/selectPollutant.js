function selectPollutant(pollutant) {
    // state.existingLayers.forEach(function (o) {
    //     map.removeLayer(o);
    // });
    // state.availableSources.no2.clear();
    // state.availableSources.so2.clear();
    // state.availableSources.pm25.clear();


    state._pollutant = pollutant;
    $('#' + pollutant + '_button').addClass('active').siblings().removeClass('active');

    // d3.select('#picker').style('display', 'none');
    // d3.select('#mapControls').style('cursor', 'pointer');
    d3.select('.mapboxgl-canvas').style('cursor', 'progress');

}