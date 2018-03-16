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
    if (state.is_play) {
        $('#_play_button').click();
        state.month = 0;
    }
    state.is_play = false;
    state.isPollutantSelected = false;  // TODO: maybe not useful at all (maybe others too)
    state.month = 0;
    state._layerName = '';
    state._id = '';

    state.activeClusterIds.clear();
    state.activePlantIds.clear();
    state.activeNames = [];
    state.activeListings = [];
    console.log('[redo] state.sizeActiveClusterIds', state.sizeActiveClusterIds);
    if (state.sizeActiveClusterIds !== 0) {
        // console.log('1');
        state.sizeActiveClusterIds = 0;
        $('#' + state._pollutant + "_button").removeClass('active');
        state._pollutant = '';  // induce the watch function

        // d3.select('#picker').style('display', 'none');
    } else {
        let filterArray = ["in", "name"];
        Array.from(state.activeNames).forEach(function (name) {
            if (typeof(name) !== 'undefined') {
                filterArray.push(name);
            }
        });
        map.setFilter("points-dblclick", filterArray);
    }

    d3.select("#month").text('石炭火力発電所をえらぶ');


}


function dblClickAll() {
    redo();
    plants.features.forEach(function (f) {
        if (state.activeListings.indexOf(f.properties.name) === -1) {
            if (state.activePlantIds.has(f.properties.id2)) {
                state.activeClusterIds.delete(f.properties.cluster);
                state.activePlantIds.delete(f.properties.id2);
                let index = 0;
                state.activeNames.forEach(function (name) {
                    if (name === f.properties.name) {
                        delete state.activeNames[index];
                    }
                    // state.activeNames.shift();
                    state.activeNames = Array.from(new Set(state.activeNames));
                    index += 1;
                });
            } else {
                state.activeClusterIds.add(f.properties.cluster);
                state.activePlantIds.add(f.properties.id2);
                state.activeNames.push(f.properties.name);
            }
        }

    });
    state.sizeActiveClusterIds = state.activeClusterIds.size;
    d3.select("#month").text('汚染物質を選択');

}