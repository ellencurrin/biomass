// ****DEFINE VARIABLES
var map = "";
var data = ["biomass_data/facilities_pellet_all.geojson", "biomass_data/ports_of_export.geojson", "biomass_data/buffer_mask_se.geojson"]
var facilities = [];
var ports = [];
var sebuffer = [];
var facilityStyle = {
    "marker-color": "#ffff",
    "color": "#fff",
    "weight": 5
}

$( document ).ready(function() {
    buildMap();
}); 

/*AJAX CALL

function loadLayers () { 
    $.ajax({
            type:"GET",
            url: 'biomass_data/facilities_pellet_all.geojson',
            dataType:"text",
            success: parseData
    });   

}

function parseData(data){
        console.log("success")
        //create an object from the JSON file
        facilities = $.parseJSON(data);
        console.log(facilities);
        buildMap();
}*/

//****** BUILDING MAP 
function buildMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';  
    
    map = L.mapbox.map('map', 'elcurr.l23a6ne8')
        .setView([30.6190, -84.7266], 5)
        
    ports = omnivore.geojson('biomass_data/ports_of_export.geojson').addTo(map);
    
    facilities = omnivore.geojson('biomass_data/facilities_pellet_all.geojson')
    .on('ready', function(go) {
        this.eachLayer(function(marker) {
            if (marker.toGeoJSON().properties.status === 'proposed') {
                // The argument to L.mapbox.marker.icon is based on the
                // simplestyle-spec: see that specification for a full
                // description of options.
                marker.setIcon(L.mapbox.marker.icon({
                    'marker-color': '#ff8888',
                    'marker-size': 'large'
                }));
            } else {
                marker.setIcon(L.mapbox.marker.icon({}));
            }
        this.eachLayer(function(layer) {
        var content = '<h2>'+layer.feature.properties.plant_name+'<\/h2>' +
            '<p>Status: ' + layer.feature.properties.status + '<br \/>' +
            'Nearest City: ' + layer.feature.properties.city_near + '<\/p>';
        layer.bindPopup(content);
        });
        })
    .addTo(map);
    })
    
    sebuffer = omnivore.geojson('biomass_data/buffer_mask_se.geojson').addTo(map);    




}
    
