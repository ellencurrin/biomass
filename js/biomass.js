// ****DEFINE VARIABLES
var map = "";
var data = ["biomass_data/facilities_pellet_all.geojson", "biomass_data/ports_of_export.geojson", "biomass_data/buffer_mask_se.geojson"]
var facilities = [];
var ports = [];
var plantList = document.getElementById('plant-list');
var facilitiesLayer = 'biomass_data/facilities_pellet_all.geojson'


$( document ).ready(function() {
    //loadLayers()
    buildMap();
}); 


/*function loadLayers () { 
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
}*/

//****** BUILDING MAP 
function buildMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';  
    
    map = L.mapbox.map('map', 'elcurr.l23a6ne8')
        .setView([33.6190, -84.7266], 6)
        
    
    var layers = document.getElementById('layerList');
    var color = '#fff'
    
    ///// ADDING FACILITIES
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_operating.geojson'), 'Operating', 2);
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_proposed.geojson'), 'Proposed', 1);
    
    function addLayer(layer, name, zIndex) {
        layer
            .setZIndex(zIndex)
            .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    
                    //// SETTING TOOLTIP & LABEL CONTENTS
                    var content = '<h2>'+marker.feature.properties.plant_name+'<\/h2>'
                        + '<p>Status: ' + marker.feature.properties.status + '</br>'
                        +'Nearest City: ' + marker.feature.properties.city_near + '</p>'
                        + '<p>Notes: ' + marker.feature.properties.notes + '</br>'
                        + 'Website: <a href = " '+ marker.feature.properties.website + ' " target="_blank">' + marker.feature.properties.website + '</a></p>' ;
                    
                    marker.bindPopup(marker.feature.properties.map_label, {closeButton: false});
                                        
                    marker.on('mouseover', function() {
                        marker.openPopup();
                    });

                    
                    //// ADDING PLANT NAMES TO DROPDOWN LIST
                    
                    plantList = document.getElementById('plant-list').appendChild(document.createElement('li'));
                    plantList.className = 'droplist';
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
                        color= '#911815'
                        marker.setIcon(L.mapbox.marker.icon({
                            'marker-color': color,
                            'marker-size': 'small'
                        }));
                    } else {
                        color= '#E85118';
                        marker.setIcon(L.mapbox.marker.icon({
                            'marker-color': color,
                            'marker-size': 'small'
                        }));
                    }
                })
            })
            .addTo(map);
    
        // Create a simple layer switcher that
        // toggles layers on and off.        
        var checkbox = document.createElement('input');
            checkbox.type = 'checkbox'
            //checkbox.className = 'active';
            checkbox.innerHTML = name;
            checkbox.checked = 'True';
        var label = document.createElement('label');
        var description = document.createTextNode(name);
        
        label.appendChild(checkbox);
        label.appendChild(description);
        layers.appendChild(label);
            
        checkbox.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
                $(checkbox).prop('checked', false);
            } else {
                map.addLayer(layer);
                $(checkbox).prop('checked', true);
            }
        };
        
    }
        
        
    //// ADDING PORTS
    ports = omnivore.geojson('biomass_data/ports_of_export.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    var content = '<p>Port</p>';
                    marker.bindPopup(content, {closeButton: false});                     
                    marker.setIcon(L.mapbox.marker.icon({
                            'marker-color': '#052945',
                            'marker-size': 'small',
                            'marker-symbol': 'ferry'
                        }));
                })
        })
        .addTo(map);
        
        var label = document.createElement('label');
        var description = document.createTextNode('Ports of Export');
        var checkbox = document.createElement('input');
            checkbox.type = 'checkbox'
            checkbox.className = 'active';
            checkbox.innerHTML = '<i class="fa fa-square" style= "color:'+color+'></i> Ports of Export';
            checkbox.checked = 'True'
    
        checkbox.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
    
            if (map.hasLayer(ports)) {
                map.removeLayer(ports);
                this.className = '';
            } else {
                map.addLayer(ports);
                this.className = 'active';
            }
        };
    
        label.appendChild(checkbox);
        label.appendChild(description);
        layers.appendChild(label);
}
    





    
