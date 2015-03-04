console.log("Snow inspector!");

var chart;


function get_date_for_chart(date) {
    var year = date.substring(0,4);
	var mon = parseInt(date.substring(5,7));
	var day = date.substring(8,10);
	return Date.UTC(year, mon-1, day);
}

function get_chart_url(st_id, year) {
	return "http://api.snow.hydrodata.org/values/" + st_id + "/" + year;
}

function get_hydrologic_year(date) {
   var year = parseInt(date.substring(0,4));
   var mon = parseInt(date.substring(5,7));
   if (mon > 10){
     year = year + 1;
   }
   return year;
}

function update_chart(lat, lon) { 
   //var hydro_year = get_hydrologic_year(date);
   //var beginDate = Date.UTC((hydro_year - 1), 9, 1);
   //var series_url = get_chart_url(station_id, hydro_year);
   var beginDate = Date.UTC(2014, 11, 1);

   var series_url = "/apps/snow-inspector/snow_data/?lat=" + lat + "&lon=" + lon +"&start=2014-12-01&end=2015-03-03";

   console.log('update_chart: load data from ' + series_url);
   chart.showLoading('Loading Snow Data...');

   $.getJSON(series_url, function(data) {
        
        var timeSeries = [];
	for (var i = 0; i < data.data.length; i++){
		timeSeries.push([beginDate + (86400000 * i), data.data[i]]);
        }  
	chart.series[0].setData(timeSeries);
	chart.setTitle({text: ''});
        chart.hideLoading();
		
   });
}


$(document).ready(function () {

	if (!($("#snow-chart").length)) {
        	console.log("no snow-chart element found!");
                return;
        } else {
		var lat = $("#lat").text();
		var lon = $("#lon").text();
		console.log("lat: " + lat + "lon: " + lon);
	}

var chart_options = {
	chart: {
		renderTo: 'snow-chart',
		zoomType: 'x',
	},
        loading: {
            labelStyle: {
                top: '45%',
		left: '50%',
                backgroundImage: 'url("/static/snow_inspector/images/ajax-loader.gif")',
                display: 'block',
                width: '134px',
                height: '100px',
                backgroundColor: '#000'
            }
        },
	title: {
		text: 'Snow Coverage at: ' + lat + 'N ' + lon + 'E'
	},
	xAxis: {
		type: 'datetime',
		minRange: 14 * 24 * 3600000
	},
	yAxis: {
		title: {
			text: 'Snow Coverage(%)'
		},
		min: 0.0
	},
	legend: {
		enabled: false
	},
	plotOptions: {
		area: {
			fillColor: Highcharts.getOptions().colors[0],
			marker: {
				radius: 2
			},
			lineWidth: 1,
			states: {
				hover: {
					lineWidth: 1
				}
			},
			threshold: null
		}
	},
	series: [{}]
};

chart_options.series[0].type = 'area';
chart_options.series[0].name = 'Snow Depth';
chart = new Highcharts.Chart(chart_options);

update_chart(lat, lon);

});
