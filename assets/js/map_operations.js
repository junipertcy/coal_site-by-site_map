function showInfoWindow(feature) {
    // Rule 1: At any time, there is one and only one activeListings.
    if (state.activeListings.length === 1) {

    } else if (state.activeListings.length === 0) {
        console.log("No state.activeListings; return");
        return;
    } else {
        console.log("[ERROR] this should not happen!");
        return;
    }

    flyToStore(feature);
    createPopUp(feature);
    setTimeout(function () {
        d3.select('#heyThisShouldBeActive').attr('class', 'item active')
    }, 0.001);

    if (state.activeListings.length === 0) {
        map.setFilter("points-hover", ["==", "name", ""]);
    } else {
        map.setFilter("points-hover", ["==", "name", feature.properties.name]);
    }
}

function flyToStore(currentFeature) {
    map.flyTo({
        // center: currentFeature.geometry.coordinates,
        // zoom: 8
    });
}

function getKmlAndReturnPromise(id, pollutant) {
    return new Promise(resolve =>
        omnivore.kml('dataset/japan' + id + '_' + pollutant + '_concentration_monthly.kml').on('ready', function (d) {
            let sourceName = pollutant + '_' + id;
            let layerName = sourceName + "_layer";
            ls = d.target.getLayers();

            state._id = id;
            state._layerName = layerName;

            for (let i = 0; i < ls.length; ++i) {
                try {
                    let dd = ls[i].feature;
                    let c_ = [];
                    dd.geometry.coordinates[0].forEach(function (o) {
                        let dropped = _.dropRight(o, 1);
                        c_.push(dropped);
                    });
                    ls[i].feature.geometry.coordinates[0] = c_;
                } catch (e) {
                    if (ls[i].feature.geometry.type === "Point") {
                        ls[i].feature.geometry.coordinates = ls[i].feature.geometry.coordinates.slice(0, 2);
                    }
                }
            }
            let pre_data = _.map(ls, 'feature');
            maxConcentration = 0;
            pre_data.map(function (d) {
                try {
                    d.properties.month = new Date(d.properties.timespan.end).getMonth();
                    if (d.properties.month === 0) {
                        d.properties.month = 11;
                    } else {
                        d.properties.month -= 1;
                    }
                } catch (e) {
                    d.properties.month = 12;  // always present
                }
                try {
                    let color = d3.interpolateLab("#ec7014", "#662506");
                    // console.log('d.properties.name =', d.properties.name);
                    d.properties.color = color(parseFloat(d.properties.name.split(" - ")[0]));
                    if (parseFloat(d.properties.name.split(" - ")) > maxConcentration) {
                        maxConcentration = parseFloat(d.properties.name.split(" - "));
                    }
                } catch (e) {
                    console.log(d);
                }
                return d;
            });
            state.maxConcentrationDict[sourceName] = maxConcentration;

            console.log("[INFO] sourceName = ", sourceName, " Downloaded!");
            map.addSource(sourceName, {
                'type': 'geojson',
                'data': {
                    "type": "FeatureCollection",
                    "features": _.map(ls, 'feature')
                }
            });
            state.availableSources[pollutant].add(id);
            resolve();
        })
    );
}

async function downloadSource(id, pollutant) {
    await getKmlAndReturnPromise(id, pollutant);
}

function createPopUp(currentFeature) {
    let id = currentFeature.properties.id.slice(2);
    let popUps = document.getElementsByClassName('mapboxgl-popup');

    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) {
        popUps[0].remove();
    }

    let popup = new mapboxgl.Popup({closeOnClick: true, closeButton: true})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
            '<div class="ui grid">' +
            '<div class="sixteen wide column" style="text-align: left; left: 14px;">' +
            currentFeature.properties.name +
            '</div>' +
            '</div>' +
            '<hr style="border-width: 2px;">' +
            '<div class="ui grid">' +
            '<div class="six wide column" style="text-align: center; left: 12px;">' +
            '<div class="row">' +
            "静岡県" +
            '</div>' +
            '<div class="row">' +
            '<div class="ui mini horizontal divided list" style="font-size: 13px;">' +
              '<div class="item">'+
                '<i class="fa fa-graduation-cap"><span style="color:transparent;">_</span>13 校</i>' +
              '</div>' +
              '<div class="item">' +
                '<i class="fa fa-hospital"><span style="color:transparent;">–</span>30 院</i>' +
              '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="ten wide stretched column">' +
            '<div class="ui mini three statistics" style="font-size: 12px">' +

            '<div class="olive statistic">' +
            '<div class="value">' +
                30.4 +
            '</div>' +
            '<div class="label">' +
                'NO<sub>2</sub><small> (ppm)</small>' +
            '</div>' +
            '</div>' +
            '<div class="yellow statistic">' +
            '<div class="value">' +
                38.2 +  // TODO!
            '</div>' +
            '<div class="label">' +
                'SO<sub>2</sub><small> (ppm)</small>' +
            '</div>' +
            '</div>' +
            '<div class="brown statistic">' +
            '<div class="value">' +
                89.3 +  // TODO!
            '</div>' +
            '<div class="label">' +
                'PM<sub>2.5</sub><small> (ppm)</small>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<hr style="border-width: 1px;">' +
            '<div class="ui grid">' +
            '<div class="six wide column">' +
            '<div class="ui secondary vertical pointing menu mini" style="font-size: 12px;">' +
            '<a class="item active" id="heyThisShouldBeActive">' +
            '状況 (最大発電能力)' +
            '</a>' +
            '<a class="item">' +
            '企業名／運営会社' +
            '</a>' +
            '<a class="item">' +
            '親会社／出資者等' +
            '</a>' +
            '<a class="item">' +
            '燃料' +
            '</a>' +
            '</div>' +
            '</div>' +
            '<div class="ten wide stretched column">' +
            '<div class="ui attached stacked left aligned green segment" id="segment" style="font-size: 12px;">' +
            '<p>' + currentFeature.properties.status + ' (' + currentFeature.properties.capacity + ')' + '</p>' +
            '</div>' +
            '</div>' +
            '</div>'
        )
        .addTo(map);

    let close_button = document.getElementsByClassName('mapboxgl-popup-close-button');
    // close_button[0].className = "className"
    close_button[0].style['display'] = 'block';
    close_button[0].style['margin-top'] = '0px';
    close_button[0].style['color'] = 'black';
    close_button[0].style['font-weight'] = 'bold';
    close_button[0].style['font-size'] = '18px';
    close_button[0].style['z-index'] = 100000;

    popup.on('close', function (e) {
        map.setFilter("points-hover", ["==", "name", ""]);
        // Similar function to watch(state, ["sizeActiveClusterIds"], function () {});
        let filterArray = ["in", "name"];
        Array.from(state.activeNames).forEach(function(name){
            if (typeof(name) !== 'undefined') {
                filterArray.push(name);
            }
        });
        map.setFilter("points-dblclick", filterArray);
    });

    $('.ui .item').on('click', function () {
        let expr = this.text;
        if (expr === '状況 (最大発電能力)') {
            d3.select('#segment').text(currentFeature.properties.status + ' (' + currentFeature.properties.capacity + ')');
        } else if (expr === '親会社／出資者等') {
            d3.select('#segment').text(currentFeature.properties.investors);
        } else if (expr === '企業名／運営会社') {
            d3.select('#segment').text(currentFeature.properties.operator);
        } else if (expr === '燃料') {
            d3.select('#segment').text(currentFeature.properties.fuels_used);
        } else {
            return;
        }
        $('.ui .item').removeClass('active');
        $(this).addClass('active');
    });
    d3.selectAll('.ui .item').style('padding', '8px');

}