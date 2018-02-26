function flyToStore(currentFeature) {
    map.flyTo({
        // center: currentFeature.geometry.coordinates,
        // zoom: 8
    });
}

function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var popup = new mapboxgl.Popup({closeOnClick: true, closeButton: true})
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

    var close_button = document.getElementsByClassName('mapboxgl-popup-close-button');
    // close_button[0].className = "className"
    close_button[0].style['display'] = 'block';
    close_button[0].style['margin-top'] = '0px';
    close_button[0].style['color'] = 'black';

    close_button[0].style['background-image'] = "url(data:image/svg+xml;base64,PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgdmVyc2lvbj0iMS4xIiBoZWlnaHQ9IjIwIiB3aWR0aD0iMjAiPg0KICA8cGF0aCBkPSJtNSA1IDAgMS41IDMuNSAzLjUtMy41IDMuNSAwIDEuNSAxLjUgMCAzLjUtMy41IDMuNSAzLjUgMS41IDAgMC0xLjUtMy41LTMuNSAzLjUtMy41IDAtMS41LTEuNSAwLTMuNSAzLjUtMy41LTMuNS0xLjUgMHoiIGZpbGw9IiMwMDAiLz4NCjwvc3ZnPg==)";

    popup.on('close', function (e) {
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
            map.flyTo({
                // center: [142.61871875040669, 38.13053360748921],
                // zoom: 5
            })
        }

    });
}

function buildLocationList(data) {
    // Iterate through the list of stores
    for (i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        // Shorten data.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        var prop = currentFeature.properties;
        // Select the listing container in the HTML and append a div
        // with the class 'item' for each store
        var listings = document.getElementById('listings');
        var listing = listings.appendChild(document.createElement('div'));
        listing.className = 'item';
        listing.id = 'listing-' + i;

        // Create a new link with the class 'title' for each store
        // and fill it with the store address
        var link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;
        link.innerHTML = prop.name;

        // Create a new div with the class 'details' for each store
        // and fill it with the city and phone number
        var details = listing.appendChild(document.createElement('div'));
        details.innerHTML = prop.capacity;
        if (prop.status) {
            details.innerHTML += ' &middot; ' + prop.status;
        }
        // Add an event listener for the links in the sidebar listing
        link.addEventListener('click', function (e) {
            // Update the currentFeature to the store associated with the clicked link
            var clickedListing = data.features[this.dataPosition];
            // 1. Fly to the point associated with the clicked link
            flyToStore(clickedListing);
            // 2. Close all other popups and display popup for clicked store
            createPopUp(clickedListing);
            // 3. Highlight listing in sidebar (and remove highlight for all other listings)
            var activeItem = document.getElementsByClassName('active');
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
    // var alpha = parseInt(kml_str.slice(0, 2), 16);
    // var blue = parseInt(kml_str.slice(2, 4).toUpperCase(), 16);
    // var green = parseInt(kml_str.slice(4, 6).toUpperCase(), 16);
    // var red = parseInt(kml_str.slice(6, 8).toUpperCase(), 16);
    // return [red, green, blue, alpha];
    // rgba = converter.kmlToRgba(kml_str);
    // return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')';
    return;  // TODO or DELETE
}

function getColor(level) {
    var color;
    if (level === '0.05 - 0.1') {
        color = '#5990e2'
    } else if (level === '0.1 - 0.2') {
        color = '#FCA107'
    } else if (level === '0.2 - 0.3') {
        color = '#7f3121'
    }
    return color;
}