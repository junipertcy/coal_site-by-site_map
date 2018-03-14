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
                    if (parseFloat(d.properties.name.split(" - ")) > state.max_concentration) {
                        state.max_concentration = parseFloat(d.properties.name.split(" - "));
                    }
                } catch (e) {
                    console.log(d);
                }
                return d;
            });

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
    console.log('should print first');
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
            '<div style="text-align: center;">' +
            // '<div style="text-align: center; color: #444"><h2>' + currentFeature.properties.name + '</h2></div>' +
            // '<i class="fa fa-child fa-lg" style="text-align: left;">  影響を受ける学校: 130</i>' +
            '<table id="table_1">' +
            '<tbody>' +
            '    <tr>' +
            '      <td><i class="fa fa-users"></i></td>' +
            '      <td>  3000 人</td>' +
            '      <td>' + 'SOx: 1000ppm' + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td><i class="fa fa-graduation-cap"></i></td>' +
            '      <td>  13 校</td>' +
            '      <td>' + 'NOx: 1000ppm' + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td><i class="fa fa-hospital"></i></td>' +
            '      <td>30 院</td>' +
            '      <td>' + 'PM2.5: 1000ppm' + '</td>' +
            '    </tr>' +
            '</tbody>'+
            '</table>' +
            '<hr style="border-width: 1px;">' +
            '<table id="table_2">' +
            '  <tbody>' +
            '    <tr>' +
            '      <td>状況</td>' +
            '      <td>' + currentFeature.properties.status + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td>最大発電能力</td>' +
            '      <td>' + currentFeature.properties.capacity + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td>企業名／運営会社</td>' +
            '      <td>' + currentFeature.properties.operator + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td>親会社／出資者等</td>' +
            '      <td>' + currentFeature.properties.investors + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td>燃料</td>' +
            '      <td>' + currentFeature.properties.fuels_used + '</td>' +
            '    </tr>' +
            '  </tbody>' +
            '</table>' +
            '</div>'
        )
        .addTo(map);
    // if (isSlideOut) {
    //     d3.select('.mapboxgl-popup-content').style('left', '310px');
    // } else {
    //     d3.select('.mapboxgl-popup-content').style('left', '10px');
    // }

    let close_button = document.getElementsByClassName('mapboxgl-popup-close-button');
    // close_button[0].className = "className"
    close_button[0].style['display'] = 'block';
    close_button[0].style['margin-top'] = '0px';
    close_button[0].style['color'] = 'black';
    close_button[0].style['font-weight'] = 'bold';
    close_button[0].style['font-size'] = '18px';

    popup.on('close', function (e) {
        let activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
            map.flyTo({
                // center: currentFeature.geometry.coordinates,
                // zoom: 5
            })
        }

    });
}

function buildLocationList(data) {
    // Iterate through the list of stores
    for (let i = 0; i < data.features.length; i++) {
        let currentFeature = data.features[i];
        // Shorten data.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        let prop = currentFeature.properties;
        // console.log(prop);
        // Select the listing container in the HTML and append a div
        // with the class 'item' for each store
        let listings = document.getElementById('listings');
        let listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = 'listing-' + prop.id.slice(2);
        // console.log(listing.id);
        // if (prop.id.slice(2) === "42") {
        //     console.log(prop);
        // }

        // Create a new link with the class 'title' for each store
        // and fill it with the store address
        let link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.name;

        // Create a new div with the class 'details' for each store
        // and fill it with the city and phone number
        let details = listing.appendChild(document.createElement('div'));

        let checkbox = details.appendChild(document.createElement('div'));
        checkbox.className = 'ui checkbox';
        let input = checkbox.appendChild(document.createElement('input'));
        input.type = 'checkbox';
        input.name = prop.cluster;
        let label = checkbox.appendChild(document.createElement('label'));
        label.innerHTML = prop.capacity;
        if (prop.status) {
            label.innerHTML += ' &middot; ' + prop.status;
        }

        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function (e) {
            console.log("You clicked the list!");
            let clickedListing = data.features[this.dataPosition];
            flyToStore(clickedListing);
            createPopUp(clickedListing);
            let activeItem = document.getElementsByClassName('active');

            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
        });
    }
}


function getColor(level) {
    let color;
    if (level === '0.05 - 0.1') {
        color = '#5990e2'
    } else if (level === '0.1 - 0.2') {
        color = '#FCA107'
    } else if (level === '0.2 - 0.3') {
        color = '#7f3121'
    }
    return color;
}