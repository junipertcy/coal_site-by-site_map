let isSlideOut = false;
let state = {
    is_play: false,
    isPollutantSelected: false,
    month: 0,
    _layerName: '',
    _id: '',
    _pollutant: '',
    availableSources: {
        "no2": new Set(),
        "pm25": new Set(),
        "so2": new Set()
    },
    existingLayers: new Set(),
    activeClusterIds: new Set(),
    activePlantIds: new Set(),
    activeNames: [],
    sizeActiveClusterIds: 0,  // ac-hoc usage for the watch function
    max_concentration: 0,
    activeListings: []
};

async function downloadSources(activeLayers) {
    // console.log('=== in downloadSources; activeLayers are ==', activeLayers);
    for (const layer of activeLayers) {
        if (!state.availableSources[state._pollutant].has(layer)) {
            await downloadSource(layer, state._pollutant);
        }
    }
    console.log('should print later');
}

function showActiveLayers(activeLayers) {
    console.log('max_concentration = ', state.max_concentration);
    state.existingLayers.forEach(function (o) {
        map.removeLayer(o);
    });
    state.existingLayers = new Set();
    console.log('===== In showActiveLayers =====');
    console.log('state._pollutant', state._pollutant);
    console.log('activeLayers', activeLayers);

    for (let layer of Array.from(activeLayers)) {
        // layer = layer.values().next().value;
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
        filterBy(0, state._pollutant + "_" + layer + "_layer");  // January
        document.getElementById('slider').addEventListener('input', function (e) {
            let month = parseInt(e.target.value);
            filterBy(month, state._pollutant + "_" + layer + "_layer");
        });
    }
    drawLegend(state.max_concentration);
}

//defining a 'watcher' for an attribute
watch(state, ["_pollutant"], function () {
    console.log("_pollutant changed: ", state._pollutant);
    state.max_concentration = 0;
    console.log('state.existingLayers', state.existingLayers);
    console.log('state.activeClusterIds', state.activeClusterIds);
    console.log('state.activeClusterIds.size', state.activeClusterIds.size);
    if (state.activeClusterIds.size > 0) {
        let activeLayers = state.activeClusterIds;
        console.log('activeLayers', activeLayers);
        $('body').css('cursor', 'progress');
        downloadSources(activeLayers).then(function(){
            showActiveLayers(activeLayers);
            $('body').css('cursor', 'default');
            d3.select('.cartodb-timeslider').style('display', 'block');
            d3.select('.mapboxgl-canvas').style('cursor', '');
        });
    } else {
        showActiveLayers([]);
        $(".cartodb-timeslider").hide();
        d3.selectAll('svg').remove();
    }
});

// When state.activeClusterIds changed
// One should change the color of the icons, respectively
watch(state, ["sizeActiveClusterIds"], function () {
    console.log('sizeActiveClusterIds changed', state.sizeActiveClusterIds);
    console.log("activeClusterIds changed to: ", state.activeClusterIds);
    console.log(Array.from(state.activeNames));
    let filterArray = ["in", "name"];
    Array.from(state.activeNames).forEach(function(name){
        if (typeof(name) !== 'undefined') {
            filterArray.push(name);
        }
    });
    map.setFilter("points-dblclick", filterArray);
});
