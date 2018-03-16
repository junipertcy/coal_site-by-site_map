function selectPollutant(pollutant) {
    if (!state.activeClusterIds.size) {
        _blink();
        return;
    }


    if (pollutant !== state._pollutant) {
        state._pollutant = pollutant;
        $('#' + pollutant + '_button').addClass('active').siblings().removeClass('active');

        d3.select('.mapboxgl-canvas').style('cursor', 'progress');

        let playButton = $('#_play_button');
        if (state.is_play) {
            playButton.click();
            state.month = 0;
        }
        playButton.addClass('loading');
    }
}