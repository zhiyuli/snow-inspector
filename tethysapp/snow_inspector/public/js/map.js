

$(document).ready(function () {


var source = new ol.source.Vector();

var esri = new ol.layer.Tile({
	source: new ol.source.XYZ({
		attribution: [new ol.Attribution({
			html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
			'rest/services/World_Topo_Map/MapServer>ArcGIS</a>'
		})],
		url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
		'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
	})
});

var map = new ol.Map({
	layers: [esri],
	controls: ol.control.defaults(),
	target: 'map_view',
	view: new ol.View({
		center: [0, 0],
		zoom: 2
	})
});

var vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

map.addLayer(vector);

var lat = 40.238;
var lon = -111.55;
var dbPoint = {
	"type": "Point",
	"coordinates": [lon, lat]
}

function addPoint(coordinates){	
	var geometry = new ol.geom.Point(coordinates);
	var feature = new ol.Feature({
		geometry: geometry,
		attr: 'Some Property'
	});
	vector.getSource().clear();
	vector.getSource().addFeature(feature);
	$("#")
}

function refreshDate(){
	var endDate = $("#endDate").data('datepicker').getFormattedDate('yyyy-mm-dd');
	console.log(endDate);
	$("#end").val(endDate);
}


var coords = ol.proj.transform(dbPoint.coordinates, 'EPSG:4326','EPSG:3857');
addPoint(coords);
map.getView().setCenter(coords);

$("#inputDays").val($("#inputDays").attr("placeholder"));
$("#inputLon").val(lon);
$("#inputLat").val(lat);

map.on('click', function(evt) {
	var coordinate = evt.coordinate;
	addPoint(coordinate);
	//now update lat and long in textbox

	var lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
	$("#inputLon").val(lonlat[0]);
	$("#inputLat").val(lonlat[1]);
})

});
