

$(document).ready(function () {

	var modis = new ol.source.XYZ({
        url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-webmerc/" +
            "MODIS_Terra_Snow_Cover/default/2015-01-01/" +
            "GoogleMapsCompatible_Level8/{z}/{y}/{x}.png"
    });
    var modislayer = new ol.layer.Tile({source: modis});

	$("#btnShowModis").click(function(){
		if (modislayer.getVisible()) {
			modislayer.setVisible(false);
		} else {
			modislayer.setVisible(true);
		}
	})

	$("#btnShowPixels").click(function(){
		//add geojson layer with tile outlines
		var center = map.getView().getCenter()
		var lonlat = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
		var styleCache = {};

		var pixelBoundaries = new ol.layer.Vector({
			source : new ol.source.GeoJSON({
				projection : 'EPSG:3857',
				url : 'http://localhost:8000/apps/snow-inspector/pixel-borders/?lon=' + lonlat[0] + '&lat=' + lonlat[1]
			}),
			style : function(feature, resolution) {
		var text = feature.get('val');
		if (!styleCache[text]) {
			styleCache[text] = [new ol.style.Style({
				fill : new ol.style.Fill({
					color : 'rgba(255, 255, 255, 0.1)'
				}),
				stroke : new ol.style.Stroke({
					color : '#319FD3',
					width : 1
				}),
				text : new ol.style.Text({
					font : '12px Calibri,sans-serif',
					text : text,
					fill : new ol.style.Fill({
						color : '#000'
					}),
					stroke : new ol.style.Stroke({
						color : '#fff',
						width : 3
					})
				}),
				zIndex : 999
			})];
		}
		return styleCache[text];
	}
		});
		map.addLayer(pixelBoundaries);
		console.log(center)
	});


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

map = new ol.Map({
	layers: [esri],
	controls: ol.control.defaults(),
	target: 'map_view',
	view: new ol.View({
		center: [0, 0],
		zoom: 2
	})
});


    map.addLayer(modislayer);

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



var lat = 40.2380;
var lon = -111.5500;
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
	$("#inputLon").val(lonlat[0].toFixed(6));
	$("#inputLat").val(lonlat[1].toFixed(6));
	if (lonlat[0] < -180) {
		$("#inputLon").val((360 + lonlat[0]).toFixed(6));
	}
})

});
