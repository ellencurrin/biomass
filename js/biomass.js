function loadLayers (data) { 
    $.ajax({
            type:"GET",
            url: data,
            dataType:"text",
            success: parseData
    });   
}
function parseData(data){
        dataObj = $.parseJSON(data);
        console.log(dataObj);
}


// ****DEFINE VARIABLES
var map = "";
var facilities = [];
var ports = [];
var cities = [];
var color = '#fff'
var states =[]
var image
var counter = 0
var table
var newRow



$( document ).ready(function() {
    console.log("document ready")
    loadLayers('biomass_data/counties-se.geojson');
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

/*$(window).load(function(){
    console.log("window loaded")
    $('#cover').fadeOut(1);
})*/




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

    
    //// ADDING USA 
    base_USA = omnivore.geojson('biomass_data/other_states.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#C3C3BE', 
                                    opacity: 1,
                                    weight: 2, 
                                    fillColor: '#D9D8D2',  
                                    fillOpacity: 1 
                        }); 
                }) 
        })
        .setZIndex(1)
        .addTo(map);
        
        
    //// ADDING SOUTHEASTERN STATES
    states = omnivore.geojson('biomass_data/SE_states.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                            color: '#C3C3BE',
                            opacity: 1,
                            weight: 1, 
                            fillColor: '#EAE9E3',
                            fillOpacity: 1 
                            // for more options--> 'leaflet.js path options'
                    });
                })
        })
    .setZIndex(0)
    .addTo(map);
    
    
    //// ADDING COUNTIES 
    counties = omnivore.geojson('biomass_data/counties-se.geojson')
        .on('ready', function(go) {
                console.log('loading counties')
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#C3C3BE', 
                                    opacity: .5,
                                    weight: .5, 
                                    fillColor: '#FFF',  
                                    fillOpacity: 0 
                        }); 
                })
            $('#cover').fadeOut(1);
        })
        .setZIndex(10)
        .addTo(map);
        
    //// ADDING HYDRO
    hydro = omnivore.geojson('biomass_data/hydroLinesUS.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                                    color: '#A2A9C2', 
                                    opacity: 1,
                                    weight: 1, 
                        }); 
                }) 
        })
        .setZIndex(6)
        .addTo(map);
    
    ////ADDING CITIES
    cities = omnivore.geojson('biomass_data/cities_select.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    var className
                    if (marker.feature.properties.capital =='Y') {className= 'cityLabel-lg'}
                        else {className= 'cityLabel-sm'}
                    marker.setIcon(L.divIcon({
                        className: className,
                        html: marker.feature.properties.name,
                        iconAnchor: [2,2],
                        iconSize: [150, 40]
                    }))
                }); 
        })
        .setZIndex(7)
        .addTo(map)
        
    buildToggle(cities, '  City Labels', 'cityLabel-sm fa fa-font fa-lg')
        
    //// ADDING PORTS
    ports = omnivore.geojson('biomass_data/ports_of_export.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    /*marker.bindPopup(marker.feature.properties.port, {closeButton: false});
                    marker.on('mouseover', function() {
                        marker.openPopup();
                    });
                    marker.on('mouseout', function() {
                        marker.closePopup();
                    });*/
                    marker.bindLabel(marker.feature.properties.port, {offset: [25,-15]})
                    
                    /*marker.setIcon(L.mapbox.marker.icon({
                            'marker-color': '#052945',
                            'marker-size': 'small',
                            'marker-symbol': 'ferry'
                    }));*/
                    marker.setIcon(L.divIcon({
                            className: 'port',
                            html: '<i class="port fa fa-ship fa-lg"></i>',
                            iconAnchor: [0,0],
                            labelAnchor: [0,0],
                            iconSize: [150, 40]
                        }))
                })
        })
        .setZIndex(8)
        .addTo(map);
        
        buildToggle(ports, '  Ports of Export', 'port fa fa-ship')
    
        
    //// SATELITE LAYER
    image = L.mapbox.tileLayer('elcurr.l4gdgnij')
     
     
    operating = omnivore.geojson('biomass_data/facilities_operating.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    marker.bindLabel(marker.feature.properties.map_label)
                    
                    var content = '<h2>'+marker.feature.properties.plant_name+'<\/h2>'
                            + '<p>Status: ' + marker.feature.properties.status + '</br>'
                            +'Nearest City: ' + marker.feature.properties.city_near + '</p>'
                            + '<p>Notes: ' + marker.feature.properties.notes + '</br>'
                            + 'Website: <a href = " '+ marker.feature.properties.website + ' " target="_blank">' + marker.feature.properties.website + '</a></p>' ;
                        
                    marker.on('click', function() {
                        zoomInfo(marker, content);
                    });
    
                    marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#5D943F',
                        'marker-size': 'small',
                        'marker-border': 1,
                    }));
                    
                    /// BUILDING HTML TABLE
                    buildTable(marker, content, 0);
                })
            })
        
            .setZIndex(11)
            .addTo(map);
    
        //// CREATING LAYER TOGGLE
        buildToggle(operating, '  Operating Plants', 'fa fa-circle operating')
    
    
    proposed = omnivore.geojson('biomass_data/facilities_proposed.geojson')
        .on('ready', function(go) {
                this.eachLayer(function(marker) {
                    marker.bindLabel(marker.feature.properties.map_label)
                    
                    var content = '<h2>'+marker.feature.properties.plant_name+'<\/h2>'
                            + '<p>Status: ' + marker.feature.properties.status + '</br>'
                            +'Nearest City: ' + marker.feature.properties.city_near + '</p>'
                            + '<p>Notes: ' + marker.feature.properties.notes + '</br>'
                            + 'Website: <a href = " '+ marker.feature.properties.website + ' " target="_blank">' + marker.feature.properties.website + '</a></p>' ;
                        
                    marker.on('click', function() {
                        zoomInfo(marker, content);
                    });
    
                    marker.setIcon(L.mapbox.marker.icon({
                        'marker-color': '#E3D648',
                        'marker-size': 'small',
                        'marker-border': 1,
                    }));
                    
                    
                    /// BUILDING HTML TABLE
                    buildTable(marker, content, 1);
                })
            })
            .setZIndex(11)
            .addTo(map);
        
        //// CREATING LAYER TOGGLE
        buildToggle(proposed, '  Proposed Plants', 'fa fa-circle proposed')

     
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
            } else if (map.getZoom()<=5) {
                map.removeLayer(cities)
            }
        })   
} 
   

function buildToggle(layer, name, icon) {
    var layers = document.getElementById('layerList');
    var checkbox = document.createElement('input');
        checkbox.type = 'checkbox'
        checkbox.checked = 'True';
    var label = document.createElement('label');
    var legend = document.createElement('i');
    legend.setAttribute('class', icon);
    var description = document.createTextNode(name);
    description.className = "cityLabel-sm"
    //document.getElementById("LblTxt").innerHTML = name;
    
    label.appendChild(checkbox);
    label.appendChild(legend);
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
            
        }
    };
}

function zoomInfo (marker, content) {                         
        marker.bindPopup(content);
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();
        //document.getElementById("resetBt").style.display = 'block';

}


function buildTable(marker, content, num) {
    console.log("making new table row")
    newRow = document.getElementById('tableBody').appendChild(document.createElement('tr'))
    newRow.class = 'dataTable'
    newRow.innerHTML += '<td style="max-width: 200px">' + marker.feature.properties.plant_name + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.status + '</td>'
    newRow.innerHTML += '<td style="max-width: 250px">' + marker.feature.properties.company_subsidiary_affliate_of + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.output + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.gty + '</td>'
    newRow.innerHTML += '<td>' + marker.feature.properties.city_nearest + '</td>'
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
    if (counter >= 52) {
        $('#datatable').DataTable({
                //"processing": true,
                responsive: true,
                "scrollY": "75vh",
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

function resize1() {
    //document.getElementById('map').style.height= '40vh',
    //document.getElementById('datatable_wrapper').style.top='45vh',
    document.getElementById('resize').innerHTML= '<a href="#map"><button onclick=resize2()>View the Map</br><i class="fa fa-chevron-up fa-lg"></button></a>'
    //document.getElementById('resize').style.top='40vh',
    //map.removeLayer(cities),
    //map.setView([33.6190, -84.7266], 5)
}

function resize2() {
    document.getElementById('resize').innerHTML= '<a href="#table"><button onclick=resize1()>View the Table</br><i class="fa fa-chevron-down fa-lg"></i></button></a>'
}





    
