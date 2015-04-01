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
	var beginDate = myChart.series[0].data[n - 1].x + 86400000;
	for (var i = 0; i < response_data.data.length; i++){
		if (response_data.data[i] !== null) {		
			var newPoint = [beginDate + (86400000 * i), response_data.data[i]];
			myChart.series[0].addPoint(newPoint);
		}
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

   	//adds initial data to the chart
    function ajax1() {
		console.log("ajax1! " + urls[0]);
		$.ajax({
			url: urls[0], 
			type: "GET",
			dataType: "json",
			success: function(response_data){
				//add first data to 
				add_data_to_chart(beginDate, response_data, chart);
				iRequest++;
				
				ajax2();
			}
		});
	}

	//adds data to chart with existing data
	function ajax2() {
		console.log("ajax2! " + urls[iRequest]);
		$.ajax({
			url: urls[iRequest], 
			type: "GET",
			dataType: "json",
			success: function(response_data){
				add_data_to_chart2(response_data, chart);
				iRequest++;
				if (iRequest < urls.length) {
					ajax2();
				}	
			}
		});
	}




    ajax1();


   //chart.showLoading('Loading Snow Data...');
/*
   $.getJSON(series_url, function(data) {
        
        var timeSeries = [];
	for (var i = 0; i < data.data.length; i++){
		if (data.data[i] !== null) {
			timeSeries.push([beginDate + (86400000 * i), data.data[i]]);
		}
    }  
	chart.series[0].setData(timeSeries);
	chart.setTitle({text: ''});
        chart.hideLoading();
		
   });
*/
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
