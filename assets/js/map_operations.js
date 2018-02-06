function flyToStore(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 10
    });
}

function createPopUp(currentFeature) {
    var popUps = document.getElementsByClassName('mapboxgl-popup');
    // Check if there is already a popup on the map and if so, remove it
    if (popUps[0]) popUps[0].remove();

    var popup = new mapboxgl.Popup({closeOnClick: true, closeButton: true})
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(
            '<h3>' + currentFeature.properties.name + '</h3>' +
            '<h4>' + currentFeature.properties.status + '</h4>'
        )
        .addTo(map);

    var close_button = document.getElementsByClassName('mapboxgl-popup-close-button');
    close_button[0].style["display"] = "block";
    close_button[0].style["margin-top"] = "-10px";
    close_button[0].style["color"] = "white";

    popup.on('close', function (e) {
        var activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
        }
        map.on('mouseenter', 'points', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'points', function () {
            map.getCanvas().style.cursor = '';
        });

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
    if (kml_str[0] === "-") {
        kml_str = kml_str.substr(1)
    }
    // var alpha = parseInt(kml_str.slice(0, 2), 16);
    // var blue = parseInt(kml_str.slice(2, 4).toUpperCase(), 16);
    // var green = parseInt(kml_str.slice(4, 6).toUpperCase(), 16);
    // var red = parseInt(kml_str.slice(6, 8).toUpperCase(), 16);
    // return [red, green, blue, alpha];
    rgba = converter.kmlToRgba(kml_str);
    return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.a + ")";
}

function getColor(level) {
    var color;
    if (level === "0.05 - 0.1") {
        color = "#5990e2"
    } else if (level === "0.1 - 0.2") {
        color = "#FCA107"
    } else if (level === "0.2 - 0.3") {
        color = "#7f3121"
    }
    return color;
}