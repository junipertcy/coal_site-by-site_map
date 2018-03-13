let timer;

function play(layerNames) {
    // $('#listing' + '-' + state._id).addClass('active');
    if (!state.is_play) {
        $('#play_button').removeClass('fa fa-play fa-lg').addClass('fa fa-pause fa-lg');
        timer = setInterval(function () {
            $("input[type='range']")[0].value = (state.month % 12).toString();
            layerNames.forEach(function (o) {
                filterBy(state.month % 12, o);
            });
            state.month += 1;
        }, 500);
    } else {
        $('#play_button').removeClass('fa fa-pause fa-lg').addClass('fa fa-play fa-lg');
        clearInterval(timer);
    }
    state.is_play = !state.is_play;
}

function sync() {
    let isLayerChecked = $('div').find('input');
    let checkedLayer;
    state.max_concentration = 0;

    if (isLayerChecked.is(':checked')) {
        checkedLayer = _.filter(isLayerChecked, function (o) {
            return o.checked;
        });

        let activeLayers = _.map(checkedLayer, 'name');
        console.log(activeLayers);
        if (state._pollutant !== "") {
            $('body').css('cursor', 'progress');
            downloadSources(activeLayers).then(function () {
                showActiveLayers(activeLayers);
                $('body').css('cursor', 'default');
                d3.select('.cartodb-timeslider').style('display', 'block');
                d3.select('.mapboxgl-canvas').style('cursor', '');
            });
        }
    } else {
        showActiveLayers([]);
        $(".cartodb-timeslider").hide();
        d3.selectAll('svg').remove();
    }
}
