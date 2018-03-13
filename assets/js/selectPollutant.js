function selectPollutant(pollutant) {
    state._pollutant = pollutant;
    $('#' + pollutant + '_button').parent().addClass('active').siblings().removeClass('active');
    d3.select('#picker').style('display', 'none');
    d3.select('.cartodb-timeslider').style('display', 'block');
}