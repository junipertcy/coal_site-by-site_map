let timer;

function _blink() {
    d3.select("#month").transition()
    .duration(500)
    .style("color", "rgb(255,255,255)")
    .transition()
    .duration(500)
    .style("color", "rgba(0,0,0,.6)")
    .on("end");
}

function play(layerNames) {
    if (state._pollutant === "") {
        _blink();
        return;
    }

    if (!state.is_play) {
        $('#play_button').removeClass('play icon').addClass('pause icon');
        timer = setInterval(function () {
            d3.select("#month").text((state.month % 12).toString());
            layerNames.forEach(function (o) {
                filterBy(state.month % 12, o);
            });
            state.month += 1;
        }, 500);
    } else {
        $('#play_button').removeClass('pause icon').addClass('play icon');
        clearInterval(timer);
    }
    state.is_play = !state.is_play;
}

function playOnMouseover() {
    if (state._pollutant === "") {
        d3.select('#_play_button').style('cursor', 'not-allowed');
    } else {
        d3.select('#_play_button').style('cursor', 'pointer');
    }
}


function redo() {
    state.is_play = false;
    state.isPollutantSelected = false;  // TODO: maybe not useful at all (maybe others too)
    state.month = 0;
    state._layerName = '';
    state._id = '';

    state.activeClusterIds.clear();
    state.activePlantIds.clear();
    state.activeNames = [];
    state.max_concentration = 0;
    state.activeListings = [];

    if (state.sizeActiveClusterIds !== 0) {
        console.log('1');
        state.sizeActiveClusterIds = 0;
        state._pollutant = '';  // induce the watch function
        d3.select('#picker').style('display', 'none');
    } else {
        let filterArray = ["in", "name"];
        Array.from(state.activeNames).forEach(function(name){
            if (typeof(name) !== 'undefined') {
                filterArray.push(name);
            }
        });
        map.setFilter("points-dblclick", filterArray);

    }



}
