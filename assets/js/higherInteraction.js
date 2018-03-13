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
    max_concentration: 0,
    activeListings: []
};

async function downloadSources(activeLayers) {
    for (let layer of activeLayers) {
        layer = layer.values().next().value;
        if (!state.availableSources[state._pollutant].has(layer)) {
            await downloadSource(layer, state._pollutant, function () {
            });
        }
    }
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

    for (let layer of activeLayers) {
        layer = layer.values().next().value;
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
    console.log('state.activeClusterIds.length', state.activeClusterIds.length);
    if (state.activeClusterIds.size > 0) {
        let activeLayers = Array(state.activeClusterIds);
        console.log('activeLayers', activeLayers);
        downloadSources(activeLayers);
        console.log('should be downloaded');
        $('body').css('cursor', 'progress');
        setTimeout(function () {
            showActiveLayers(activeLayers);
            $('body').css('cursor', 'default');
            $(".cartodb-timeslider").show();
        }, 4000);
    } else {
        showActiveLayers([]);
        $(".cartodb-timeslider").hide();
        d3.selectAll('svg').remove();
    }
});