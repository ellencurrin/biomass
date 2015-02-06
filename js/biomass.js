// ****DEFINE VARIABLES
var map = "";
var data = ["biomass_data/facilities_pellet_all.geojson", "biomass_data/ports_of_export.geojson", "biomass_data/buffer_mask_se.geojson"]
var facilities = [];
var ports = [];
var plantList = document.getElementById('plant-list');

$( document ).ready(function() {
    loadLayers()
    buildMap();
}); 


function loadLayers () { 
    $.ajax({
            type:"GET",
            url: 'biomass_data/facilities_pellet_all.geojson',
            dataType:"text",
            success: parseData
    });   

}
function parseData(data){
        var dataObj = $.parseJSON(data);
        console.log(dataObj);
}

//****** BUILDING MAP 
function buildMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';  
    
    map = L.mapbox.map('map', 'elcurr.l23a6ne8')
        .setView([33.6190, -84.7266], 6)
        
    //// ADDING PORTS
    ports = omnivore.geojson('biomass_data/ports_of_export.geojson')
    .on('ready', function(go) {
            this.eachLayer(function(marker) {
                var content = '<h2>Port<\/h2>';
                marker.bindPopup(content);
                marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#2A45FF',
                        'marker-size': 'small',
                        'marker-symbol': 'ferry'
                    }));
            })
    })
    .addTo(map);
    
    //// ADDING WOOD PELLET FACILITIES
    facilities = omnivore.geojson('biomass_data/facilities_pellet_all.geojson')
        .on('ready', function(go) {
            this.eachLayer(function(marker) {
                
                //// SETTING TOOLTIP & LABEL CONTENTS
                var content = '<h2>'+marker.feature.properties.plant_name+'<\/h2>'
                    + '<p>Status: ' + marker.feature.properties.status + '<br \/>'
                    +'Nearest City: ' + marker.feature.properties.city_near + '<\/p>'
                    + 'Notes: ' + marker.feature.properties.notes + '</br>'
                    + 'Website: <a href = \' '+ marker.feature.properties.website + ' \'>' + marker.feature.properties.website + '</a>' ;
                var label = '<h2>'+marker.feature.properties.map_label+'<\/h2>';
                marker.bindPopup(label);
                
                marker.on('mouseover', function() {
                    marker.openPopup(marker.feature.properties.map_label);
                });
                
                //// ADDING PLANT NAMES TO DROPDOWN LIST
                
                plantList = document.getElementById('plant-list').appendChild(document.createElement('li'));
                plantList.innerHTML = marker.feature.properties.plant_name;                
                plantList.onclick = function() {
                    marker.bindPopup(content);
                    L.mapbox.tileLayer('elcurr.l4gdgnij').addTo(map);
                    map.setView(marker.getLatLng(), 16);
                    marker.openPopup();
                };
                
                //// MARKER CLICK EVENT
                marker.on('click', function(){
                    marker.bindPopup(content);
                    L.mapbox.tileLayer('elcurr.l4gdgnij').addTo(map);
                    map.setView(marker.getLatLng(), 16);
                    marker.openPopup();
                    } );
                
                //// SETTING MARKER STYLES FOR OPERATING/PROPOSED
                if (marker.feature.properties.status === 'Operating') {
                    // The argument to L.mapbox.marker.icon is based on the
                    // simplestyle-spec: see that specification for a full
                    // description of options.
                    marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#54CC14',
                        'marker-size': 'small'
                    }));
                } else {
                    marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#FFE137',
                        'marker-size': 'small'
                    }));
                }
            })
        })
        
        ////DRAWING FEATURES TO MAP
        .addTo(map);
    
    
    facilities.eachLayer(function(layer) {
        var content = '<h2>'+layer.feature.properties.plant_name+'<\/h2>' +
            '<p>Status: ' + layer.feature.properties.status + '<br \/>' +
            'Nearest City: ' + layer.feature.properties.city_near + '<\/p>';
        layer.bindPopup(content);
        });
    

}

    
