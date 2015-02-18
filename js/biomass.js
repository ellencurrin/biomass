function loadLayers () { 
    $.ajax({
            type:"GET",
            url: data[0],
            dataType:"text",
            success: parseData
    });   
}
function parseData(data){
        facilities = $.parseJSON(data);
        console.log(facilities);
}


// ****DEFINE VARIABLES
var map = "";
var data = ["biomass_data/facilities_pellet_all.geojson", "biomass_data/ports_of_export.geojson", "biomass_data/buffer_mask_se.geojson"]
var facilities = [];
var ports = [];
var plantList = document.getElementById('plant-list');
var facilitiesLayer = 'biomass_data/facilities_pellet_all.geojson'
var color = '#fff'
var states =[]
var counter = 0
var table
var newRow



$( document ).ready(function() {
    buildMap();
    /*table = $('#datatable').DataTable({
                //"processing": true,
                responsive: true,
                "scrollY": "300px",
                "scrollCollapse": true,
                "paging": false,
                //"ajax": "biomass_data/facilities_pellet_all.geojson",
            });*/
    //loadLayers();   
}); 




//****** BUILDING MAP 
function buildMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';    
    map = L.mapbox.map('map', 'elcurr.l7pk47jo', {
            minZoom: 6,
            zoomControl: false,
        })
        .setView([33.6190, -84.7266], 6);
        
        // Disable drag and zoom handlers.
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
    
    //// ADDING SOUTHEASTERN STATES
    states = omnivore.geojson('biomass_data/SE_states.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                            color: '#FFF0A5',
                            opacity: 1,
                            weight: 1, 
                            fillColor: '#FFBC62',
                            fillOpacity: 1 
                            // for more options--> 'leaflet.js path options'
                    });
                })
        })
    .addTo(map);
    
    //// ADDING USA 
    base_USA = omnivore.geojson('biomass_data/other_states.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#FFF0A5', 
                                    opacity: 1,
                                    weight: 2, 
                                    fillColor: '#FFF0A5',  
                                    fillOpacity: 1 
                        }); 
                }) 
        })
        .addTo(map);

    //// ADDING PORTS
    ports = omnivore.geojson('biomass_data/ports_of_export.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    marker.bindPopup(marker.feature.properties.port, {closeButton: false});
                    marker.on('mouseover', function() {
                        marker.openPopup();
                    });
                    marker.on('mouseout', function() {
                        marker.closePopup();
                    });
                    //marker.bindLabel(marker.feature.properties.port)
                    marker.setIcon(L.mapbox.marker.icon({
                            'marker-color': '#052945',
                            'marker-size': 'small',
                            'marker-symbol': 'ferry'
                        }));
                })
        })
        .addTo(map);
        buildToggle(ports, 'Ports of Export')
        
    ///// ADDING FACILITIES
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_operating.geojson'), 'Operating');
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_proposed.geojson'), 'Proposed');
        
} 
   
    
function addLayer(layer, name) {
    layer
        //.setZIndex(zIndex)
        .on('ready', function(go) {
            this.eachLayer(function(marker) {
                
                //// SETTING TOOLTIP & LABEL CONTENTS
                var label = '<b>'+ marker.feature.properties.map_label+'</b>'
                marker.bindPopup(label, {closeButton: false});                   
                marker.on('mouseover', function() {
                    marker.openPopup();
                });
                
                var content = '<h2>'+marker.feature.properties.plant_name+'<\/h2>'
                        + '<p>Status: ' + marker.feature.properties.status + '</br>'
                        +'Nearest City: ' + marker.feature.properties.city_near + '</p>'
                        + '<p>Notes: ' + marker.feature.properties.notes + '</br>'
                        + 'Website: <a href = " '+ marker.feature.properties.website + ' " target="_blank">' + marker.feature.properties.website + '</a></p>' ;
                    
                marker.on('click', function() {
                    zoomInfo(marker, content);
                });

                //// ADDING PLANT NAMES TO DROPDOWN LIST
                buildDropdown(marker, content)

                //// SETTING MARKER STYLES FOR OPERATING/PROPOSED
                markerStyles(marker)
                
                /// BUILDING HTML TABLE
                buildTable(marker, content);
            })
        })
        .addTo(map);

    //// CREATING LAYER TOGGLE
    buildToggle(layer, name)
    
}
       


function buildToggle(layer, name) {
    var layers = document.getElementById('layerList');
    var checkbox = document.createElement('input');
        checkbox.type = 'checkbox'
        checkbox.checked = 'True';
    var label = document.createElement('label');
    var description = document.createTextNode(name);
    
    label.appendChild(checkbox);
    label.appendChild(description);
    layers.appendChild(label);
        
    checkbox.onclick = function(e) {
        //e.preventDefault();
        e.stopPropagation();
        
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            $(checkbox).prop('checked', false)
        } else {
            //addLayer(layer, name)
            map.addLayer(layer);
            $(checkbox).prop('checked', true)
            
            ///********THIS DOES NOT WORK
            /*document.getElementById('plant-list').innerHTML('<p></p>')
            layer.on('ready', function(go) {
                this.eachLayer(function(marker) {
                buildDropdown(layer, 'test')
                })
            })*/
            
        }
    };
}

function markerStyles(marker) {
    if (marker.feature.properties.status === 'Operating') {
        color= '#911815'//'#8E2800'
        marker.setIcon(L.mapbox.marker.icon({
            'marker-color': color,
            'marker-size': 'small',
            'marker-border': 1,
        }));
    } else {
        color= '#E85118' //'#B64926';
        marker.setIcon(L.mapbox.marker.icon({
            'marker-color': color,
            'marker-size': 'small'
        }));
    }
}

function zoomInfo (marker, content) {                         
        marker.bindPopup(content);
        map.removeLayer(states);
        map.removeLayer(base_USA);
        L.mapbox.tileLayer('elcurr.l4gdgnij').addTo(map);
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();

}

function buildDropdown(marker, content) {
    //document.getElementById('plant-list').innerHTML = ""
    plantList = document.getElementById('plant-list').appendChild(document.createElement('li'));
    plantList.className = 'droplist';
    plantList.innerHTML = marker.feature.properties.plant_name;                
    plantList.onclick = function() {zoomInfo(marker, content)};
    
}


function buildTable(marker, content) {
    console.log("making new table row")
    newRow = document.getElementById('tableBody').appendChild(document.createElement('tr'))
    newRow.class = 'dataTable'
    newRow.innerHTML += '<td>' + marker.feature.properties.plant_name + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.status + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.company__s + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.output + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.gty + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.city__near + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.port + '</td>'
    newRow.onmouseover= function() {console.log("hover"); marker.openPopup()};
    newRow.onclick = function() {console.log("clicked"); zoomInfo(marker, content)}; 
    counter ++
    //console.log(counter)
    if (counter == 53) {
        $('#datatable').DataTable({
                //"processing": true,
                responsive: true,
                "scrollY": "300px",
                "scrollCollapse": true,
                "paging": false,
                //"ajax": "biomass_data/facilities_pellet_all.geojson",
            });
    }
    
    
    /// ADDING A ROW
    /*table.row.add([
            marker.feature.properties.plant_name,
            marker.feature.properties.status,
            marker.feature.properties.company__s,
            marker.feature.properties.output,
            marker.feature.properties.gty,
            marker.feature.properties.city__near,
            marker.feature.properties.port,
        ])
    .draw()
    .on('click', function() {console.log("clicked"); zoomInfo(marker, content)});*/
    //table.row.onhover = function() {console.log(marker.feature.properties.plant_name);}
    //table.row.on('mouseover', function() {console.log(marker.feature.properties.plant_name);})               
    //table.row.on('click', function() {zoomInfo(marker, content), console.log("table was clicked")})

}
    





    
