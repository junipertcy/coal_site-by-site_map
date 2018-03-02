function flyToStore(currentFeature) {
    map.flyTo({
        // center: currentFeature.geometry.coordinates,
        // zoom: 8
    });
}

function createPopUp(currentFeature) {
    let id = currentFeature.properties.id.slice(2);
    console.log("hey ID = ", id);
    console.log("selected = ", selected_pollutant);

    omnivore.kml('dataset/japan' + id + '_' + selected_pollutant + '_concentration_monthly.kml').on('ready', function (d) {
        let sourceName = selected_pollutant + '_' + id;
        let layerName = sourceName + "_layer";
        _layerName = layerName;
        _id = id;
        _pollutant = selected_pollutant;
        ls = d.target.getLayers();

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
                d.properties.color = getColor(d.properties.name);
            } catch (e) {
                console.log(d);
            }

            return d;
        });
        console.log('pre_data = ', pre_data);

        map.addSource(sourceName, {
            'type': 'geojson',
            'data': {
                "type": "FeatureCollection",
                "features": _.map(ls, 'feature')
            }
        });
        map.addLayer({
            'id': layerName,
            'type': 'fill',
            "interactive": true,
            'source': sourceName,
            'paint': {
                'fill-color': {"type": "identity", "property": "color"},
                'fill-opacity': 0.5,
                'fill-outline-color': "white"

            }
        });

        filterBy(0, layerName);  // January

        document.getElementById('slider').addEventListener('input', function (e) {
            let month = parseInt(e.target.value);
            filterBy(month, layerName);
        });

        let colors = [];
        for (let i = 0; i < pre_data.length; i++) {
            let layer = pre_data[i].properties.name;
            let color;

            let item = document.createElement('div');
            let key = document.createElement('div');
            let value = document.createElement('span');

            if (colors.length === 3) {
                continue;
            }
            if (layer === "0.05 - 0.1") {
                if (_.indexOf(colors, "#5990e2") === -1) {
                    color = "#5990e2";
                    value.style.bottom = '35px';
                } else {
                    continue;
                }
            } else if (layer === "0.1 - 0.2") {
                if (_.indexOf(colors, "#FCA107") === -1) {
                    color = "#FCA107";
                    value.style.bottom = '20px';
                } else {
                    continue;
                }
            } else if (layer === "0.2 - 0.3") {
                if (_.indexOf(colors, "#7f3121") === -1) {
                    color = "#7f3121";
                    value.style.bottom = '5px';
                } else {
                    continue;
                }
            }

            key.className = 'bar';
            key.style.background = color;

            value.style.position = "absolute";
            value.style.marginLeft = "10px";
            value.style.color = 'white';

            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
            colors.push(color);
        }

    });

    let popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    let popup = new mapboxgl.Popup({closeOnClick: true, closeButton: true})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
            // '<h4>' + currentFeature.properties.name + '</h4>' +
            // '<div>' +
            //     '状況: ' + currentFeature.properties.status + '<br>' +
            //     '設備容量（最大発電能力）: ' + currentFeature.properties.capacity + '<br>' +
            //     '企業名／運営会社: ' + currentFeature.properties.operator + '<br>' +
            //     '親会社／出資者等: ' + currentFeature.properties.investors + '<br>' +
            //     '燃料: ' + currentFeature.properties.fuels_used + '<br>' +
            // '</div>'

            '<table>' +
            '  <thead>' +
            '    <tr>' +
            '      <th colspan="2">' + currentFeature.properties.name + '</th>' +
            '    </tr>' +
            '  </thead>' +
            '  <tbody>' +
            '    <tr>' +
            '      <td>状況</td>' +
            '      <td>' + currentFeature.properties.status + '</td>' +
            '    </tr>' +
            '    <tr>' +
            '      <td>設備容量（最大発電能力）</td>' +
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
            '</table>'
        )
        .addTo(map);

    let close_button = document.getElementsByClassName('mapboxgl-popup-close-button');
    // close_button[0].className = "className"
    close_button[0].style['display'] = 'block';
    close_button[0].style['margin-top'] = '0px';
    close_button[0].style['color'] = 'black';

    close_button[0].style['background-image'] = "url(data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjIwIiB3aWR0aD0iMjAiPg0KICA8cGF0aCBkPSJtNSA1IDAgMS41IDMuNSAzLjUtMy41IDMuNSAwIDEuNSAxLjUgMCAzLjUtMy41IDMuNSAzLjUgMS41IDAgMC0xLjUtMy41LTMuNSAzLjUtMy41IDAtMS41LTEuNSAwLTMuNSAzLjUtMy41LTMuNS0xLjUgMHoiIGZpbGw9IiMwMDAiLz4NCjwvc3ZnPg==)";

    popup.on('close', function (e) {
        // let activeItem = document.getElementsByClassName('active');
        // if (activeItem[0]) {
        //     activeItem[0].classList.remove('active');
        //     map.flyTo({
        //         // center: [142.61871875040669, 38.13053360748921],
        //         // zoom: 5
        //     })
        // }

    });
}

function buildLocationList(data) {
    // Iterate through the list of stores
    for (let i = 0; i < data.features.length; i++) {
        let currentFeature = data.features[i];
        // Shorten data.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        let prop = currentFeature.properties;
        console.log(prop);
        // Select the listing container in the HTML and append a div
        // with the class 'item' for each store
        let listings = document.getElementById('listings');
        let listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = 'listing-' + prop.id.slice(2);

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
        details.innerHTML = prop.capacity;
        if (prop.status) {
            details.innerHTML += ' &middot; ' + prop.status;
        }
        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function (e) {
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


function kml2hex(kml_str) {
    if (kml_str[0] === '-') {
        kml_str = kml_str.substr(1)
    }
    // let alpha = parseInt(kml_str.slice(0, 2), 16);
    // let blue = parseInt(kml_str.slice(2, 4).toUpperCase(), 16);
    // let green = parseInt(kml_str.slice(4, 6).toUpperCase(), 16);
    // let red = parseInt(kml_str.slice(6, 8).toUpperCase(), 16);
    // return [red, green, blue, alpha];
    // rgba = converter.kmlToRgba(kml_str);
    // return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')';
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