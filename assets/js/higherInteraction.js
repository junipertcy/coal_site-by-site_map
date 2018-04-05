


async function downloadSources(activeLayers) {
    if (state._pollutant === "") {
        return;
    }
    // console.log('=== in downloadSources; activeLayers are ==', activeLayers);
    for (const layer of activeLayers) {
        if (!state.availableSources[state._pollutant].has(layer)) {
            await downloadSource(layer, state._pollutant);
        }
    }
    // console.log('should print later');
}

function showActiveLayers(activeLayers) {
    state.existingLayers.forEach(function (o) {
        map.removeLayer(o);
    });
    state.existingLayers = new Set();
    let max_concentration = 0;
    let maxValueHashKey = state._pollutant + objectHash.sha1(activeLayers);

    for (let layer of Array.from(activeLayers)) {
        map.addLayer({
            'id': state._pollutant + "_" + layer + "_layer",
            'type': 'fill',
            "interactive": true,
            'source': state._pollutant + "_" + layer,
            'paint': {
                'fill-color': {"type": "identity", "property": "color"},
                'fill-opacity': 0.5,
                'fill-outline-color': "white"
            }
        });
        state.existingLayers.add(state._pollutant + "_" + layer + "_layer");
        filterBy(0, state._pollutant + "_" + layer + "_layer");  // January  // TODO: change the month sign;

        if (state.maxConcentrationDict[state._pollutant + "_" + layer] > max_concentration) {
            max_concentration = state.maxConcentrationDict[state._pollutant + "_" + layer];
        }
    }

    if (typeof state.maxValue[maxValueHashKey] === "undefined") {
        state.maxValue[maxValueHashKey] = max_concentration;
    } else {
        max_concentration = state.maxValue[maxValueHashKey];
    }
    drawLegend(max_concentration);
}

//defining a 'watcher' for an attribute
watch(state, ["_pollutant"], function () {

    console.log("[Watch::_pollutant] _pollutant changed: ", state._pollutant);
    // console.log('state.existingLayers', state.existingLayers);
    // console.log('state.activeClusterIds', state.activeClusterIds);
    // console.log('state.activeClusterIds.size', state.activeClusterIds.size);
    if (state.activeClusterIds.size > 0) {
        let activeLayers = state.activeClusterIds;
        // console.log('activeLayers', activeLayers);
        d3.select('body').style('cursor', 'progress');
        downloadSources(activeLayers).then(function(){
            showActiveLayers(activeLayers);
            $('#_play_button').removeClass('loading');
            d3.select('body').style('cursor', 'default');
            d3.select('.mapboxgl-canvas').style('cursor', '');
            // d3.select('#select_all_plants').style('display', 'block');
        });
    } else {
        showActiveLayers([]);
        // d3.select("#picker").style("display", "none");
        d3.selectAll('svg').remove();
    }
});

// When state.activeClusterIds changed
// One should change the color of the icons, respectively
watch(state, ["sizeActiveClusterIds"], function () {
    // console.log('sizeActiveClusterIds changed', state.sizeActiveClusterIds);
    // console.log("activeClusterIds changed to: ", state.activeClusterIds);
    // console.log(Array.from(state.activeNames));
    let filterArray = ["in", "name"];
    Array.from(state.activeNames).forEach(function(name){
        if (typeof(name) !== 'undefined') {
            filterArray.push(name);
        }
    });
    map.setFilter("points-dblclick", filterArray);
});
