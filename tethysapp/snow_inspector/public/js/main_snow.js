console.log("Snow inspector! main_snow.js");

var chart;


function get_date_for_chart(date) {
    var year = date.substring(0,4);
	var mon = parseInt(date.substring(5,7));
	var day = date.substring(8,10);
	return Date.UTC(year, mon-1, day);
}

var sequential_update = function(url){
	return function() {
		console.log('starting ' + url);
		//todo put ajax here
		$.getJSON(url).done(function () {
			console.log('received!');
		})
	}
}

function add_data_to_chart(beginDate, response_data, myChart) {
	var timeSeries = [];
	for (var i = 0; i < response_data.data.length; i++){
		if (response_data.data[i] !== null) {
			timeSeries.push([beginDate + (86400000 * i), response_data.data[i]]);
		}
	}  
	myChart.series[0].setData(timeSeries);
}

function add_data_to_chart2(response_data, myChart) {
	var n = myChart.series[0].data.length;
	var beginDate = Date.parse(response_data.query.startdate);
	for (var i = 0; i < response_data.data.length; i++){
		if (response_data.data[i] !== null) {		
			var newPoint = [beginDate + (86400000 * i), response_data.data[i]];
			myChart.series[0].addPoint(newPoint);
		}
	}  
}

function set_chart_tooltip(myChart, tile_url) {
	myChart.tooltip.options.formatter = function() {
		x_date = (new Date(this.x)).toISOString().substring(0, 10);
		var url = tile_url.replace("DATE_PLACEHOLDER", x_date);
		var html = '<p>original data: ' + x_date + ' snow: ' + this.y + '%</p><img width="256px" height="256px" src="' + url + '" />';	
		return html;	
	}
}



function add_days(time_ms, days) {
	return (new Date(time_ms + 86400000 * days)).toISOString().substring(0, 10);
}

//gets the proper URL requests for the AJAX function call
function get_ajax_urls(lat, lon, begin_ms, end_ms, step) {
	var base_url = "/apps/snow-inspector/snow_data/?lat=" + lat + "&lon=" + lon;
	var urls = [];
	var nSteps = ((end_ms - begin_ms) / 86400000) / step;
	var begin_ms1 = begin_ms - 86400000;
	for (i=0; i < nSteps; i++) {
		var iBegin = add_days(begin_ms1, i*step + 1);
		var iEnd = add_days(begin_ms, i*step + step);
		var iUrl = base_url + "&start=" + iBegin + "&end=" + iEnd;
		urls.push(iUrl);
	}
	var iBeginLast = begin_ms + (nSteps * step * 86400000);
	if (iBeginLast < end_ms) {
		urls.push(base_url + "&start=" + iBeginLast + "&end=" + iEnd);
	}
	return(urls);
}


function update_chart(lat, lon, begin, end) { 
   //var hydro_year = get_hydrologic_year(date);
   //var beginDate = Date.UTC((hydro_year - 1), 9, 1);
   //var series_url = get_chart_url(station_id, hydro_year);
   var beginDate = Date.parse(begin);
   var endDate = Date.parse(end);
   console.log(beginDate);

   var urls = get_ajax_urls(lat, lon, beginDate, endDate, 15);
   for (var u=0; u< urls.length; u++) {
   	console.log(urls[u]);
   }

   //the number of the request currently executed
   var iRequest = 0;

	//adds data to chart with existing data
	function ajax2() {
		console.log("ajax2! " + urls[iRequest]);
		$.ajax({
			url: urls[iRequest], 
			type: "GET",
			dataType: "json",
			success: function(response_data){

				if (iRequest === 0) {
					set_chart_tooltip(chart, response_data.tile)
				}

				add_data_to_chart2(response_data, chart);
				
				iRequest++;
				if (iRequest < urls.length) {
					ajax2();
				}	
			},
			error: function() {
				//try to repeat data retrieval..
				console.log("error for URL: " + urls[iRequest]);
				ajax2();
			}
		});
	}

    ajax2();


   //chart.showLoading('Loading Snow Data...');
   //chart.hideLoading();
}


$(document).ready(function () {

	if (!($("#snow-chart").length)) {
        	console.log("no snow-chart element found!");
                return;
        } else {
		var lat = $("#lat").text();
		var lon = $("#lon").text();
		var begin_date = $("#startDate").text();
		var end_date = $("#endDate").text();
		var begin_ms = Date.parse(begin_date);
		var end_ms = Date.parse(end_date);
		console.log("lat: " + lat + " lon: " + lon + " begin_date: " + begin_date + " end_date: " + end_date);
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
	tooltip: {
		useHTML: true,
		formatter: function() {
			return '<p>The value of <b>' + this.x + '</b> is <b>' + this.y + '</b></p><img width=256px height=256px src="http://localhost:8000/static/snow_inspector/images/icon.gif">';
		}
	},
	xAxis: {
		type: 'datetime',
		//minRange: 14 * 24 * 3600000
		min: begin_ms,
		max: end_ms
	},
	yAxis: {
		title: {
			text: 'Snow Coverage(%)'
		},
		min: 0.0,
		max: 100.0
	},
	legend: {
		enabled: false
	},
	plotOptions: {
		line: {
			color: Highcharts.getOptions().colors[0],
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

chart_options.series[0].type = 'line';
chart_options.series[0].name = 'Snow Coverage';
chart = new Highcharts.Chart(chart_options);

update_chart(lat, lon, begin_date, end_date);

});
