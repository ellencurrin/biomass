function loadLayers (data) { 
    $.ajax({
            type:"GET",
            url: data,
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
var image
var counter = 0
var table
var newRow



$( document ).ready(function() {
    loadLayers('biomass_data/majorCitiesSE.geojson');
    buildMap();
    /*table = $('#datatable').DataTable({
                //"processing": true,
                responsive: true,
                "scrollY": "300px",
                "scrollCollapse": true,
                "paging": false,
                //"ajax": "biomass_data/facilities_pellet_all.geojson",
            });*/
    //loadLayers('biomass_data/majorCitiesSE.geojson');   
}); 




//****** BUILDING MAP 
function buildMap() {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A';    
    map = L.mapbox.map('map', {
            minZoom: 6,
            zoomControl: false,
        })
        .setView([33.6190, -84.7266], 6);
        
        // Disable drag and zoom handlers.
        //map.dragging.disable();
        map.touchZoom.disable();
        //map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();

    
    //// ADDING SOUTHEASTERN STATES
    states = omnivore.geojson('biomass_data/SE_states.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                            color: '#EAE9E3',
                            opacity: 1,
                            weight: 1, 
                            fillColor: '#C3C3BE',
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
                                    color: '#EAE9E3', 
                                    opacity: 1,
                                    weight: 2, 
                                    fillColor: '#EAE9E3',  
                                    fillOpacity: 1 
                        }); 
                }) 
        })
        .addTo(map);
    
    //// ADDING COUNTIES 
    counties = omnivore.geojson('biomass_data/countiesSE.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#EAE9E3', 
                                    opacity: .5,
                                    weight: .5, 
                                    fillColor: '#FFF',  
                                    fillOpacity: 0 
                        }); 
                }) 
        })
        .addTo(map);
        
    //// ADDING HYDRO
    hydro = omnivore.geojson('biomass_data/hydroLinesUS.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#A3B1E1', 
                                    opacity: 1,
                                    weight: 1, 
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
        //buildToggle(ports, 'Ports of Export')
    
    
    ////ADDING CITIES
    cities = omnivore.geojson('biomass_data/majorCitiesSE.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    var className
                    if (marker.feature.properties.capital =='Y') {className= 'cityLabel-lg'}
                        else {className= 'cityLabel-sm'}
                    marker.setIcon(L.divIcon({
                        className: className,
                        html: '<b style="font-size:13px";>&#8226</b> '+marker.feature.properties.name,
                        iconAnchor: [2,2],
                        iconSize: [150, 40]
                    })).addTo(map)
                }); 
        })
        
    //// SATELITE LAYER
    image = L.mapbox.tileLayer('elcurr.l4gdgnij')
    
    ///// ADDING FACILITIES
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_operating.geojson'), 'Operating');
    addLayer(omnivore.geojson('biomass_data/facilities_pellet_proposed.geojson'), 'Proposed');
     
     
    map.on('zoomend', function(){
            if (map.getZoom()>9) {
                map.removeLayer(states);
                map.removeLayer(base_USA);
                map.removeLayer(cities);
                map.removeLayer(hydro);
                image.addTo(map);
            } else if (map.getZoom()<=9){
                map.removeLayer(counties)
                map.removeLayer(image);
                states.addTo(map);
                base_USA.addTo(map);
                counties.addTo(map);
                hydro.addTo(map);
                cities.addTo(map)
            }
        })   
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
                //buildDropdown(marker, content)

                //// SETTING MARKER STYLES FOR OPERATING/PROPOSED
                markerStyles(marker)
                
                /// BUILDING HTML TABLE
                buildTable(marker, content);
            })
        })
        .addTo(map);

    //// CREATING LAYER TOGGLE
    //buildToggle(layer, name)
    
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
        color= '#5D943F'//'#8E2800'
        marker.setIcon(L.mapbox.marker.icon({
            'marker-color': color,
            'marker-size': 'small',
            'marker-border': 1,
        }));
    } else {
        color= '#E3D648' //'#B64926';
        marker.setIcon(L.mapbox.marker.icon({
            'marker-color': color,
            'marker-size': 'small'
        }));
    }
}

function zoomInfo (marker, content) {                         
        marker.bindPopup(content);
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();
        //document.getElementById("resetBt").style.display = 'block';

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
    newRow.onmouseover= function(){
        console.log("hover");
        if (map.getZoom()<=9){
            marker.openPopup()
        }
    };
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
                initComplete: function () {
                    var api = this.api();
         
                    api.columns().indexes().flatten().each( function ( i ) {
                        var column = api.column( i );
                        var select = $('<select class="sizeFilter"><option value="">filter</option></select>')
                            .appendTo( $(column.header()) )
                            .on( 'change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );
         
                                column
                                    .search( val ? '^'+val+'$' : '', true, false )
                                    .draw();
                            } );
         
                        column.data().unique().sort().each( function ( d, j ) {
                            select.append( '<option value="'+d+'">'+d+'</option>' )
                        } );
                    } );
                }
        });
    }
}

function resetExtent(){
    map.setView([33.6190, -84.7266], 6)
}





    
