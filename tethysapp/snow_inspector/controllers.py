from django.shortcuts import render
from django.http import JsonResponse
from django.core.urlresolvers import reverse

from .model import SessionMaker, SnowSite
import json
import datetime


def home(request):
    """
    Controller for the app home page.
    """
    context = {}

    return render(request, 'snow_inspector/home.html', context)

def map(request):
    """
    Controller for map page.
    """

    # If we received the input from the graph page:
    if request.GET:
        print 'request.GET!'
        lat = request.GET['lat']
        lon = request.GET['lon']
        numdays = int(request.GET['days'])
        endDate = request.GET['end']
        today = endDate.strptime('%Y-%m-%d')
        print 'days: ' + str(numdays)
    else:
        # Create a session
        session = SessionMaker()
    
        #Query DB for gage object
        id = 1
        site = session.query(SnowSite).filter(SnowSite.id==id).one()
        lat = site.latitude
        lon = site.longitude
        today = datetime.date.today()
        numdays = 100
    
    #Transform into GeoJSON format
    geometries = []
    
    site_geometry = dict(type="Point",
        coordinates=[lat, lon],
                        properties={"value":site.value})
    geometries.append(site_geometry)

    geojson_sites = {"type": "GeometryCollection",
                     "geometries": geometries}

    #configure the map
    map_options = {'height': '500px',
                   'width': '100%',
                   'input_overlays': geojson_sites}

    #configure the date picker
    
    date_picker = {'display_text': 'Date',
        'name': 'endDate',
        'autoclose': True,
        'format': 'MM d, yyyy',
        'start_date': '1/1/2013',
        'today_button': True,
        'initial': today.strftime('%m/%d/%Y')
    }

    days_picker = {'display_text': 'Number of days:',
        'name': 'inputDays',
        'placeholder': numdays
    }

    # Pre-populate lat-picker and lon_picker from model
    lat_picker = {'display_text': 'Latitude:',
              'name': 'inputLat',
              'placeholder': lat}

    lon_picker = {'display_text': 'Longitude:',
              'name': 'inputLon',
              'placeholder': lon}

    
    # Pass variables to the template via the context dictionary
    context = {'map_options': map_options, 
               'date_picker':date_picker,
               'days_picker':days_picker,
               'lon_picker':lon_picker,
               'lat_picker':lat_picker}
    
    return render(request, 'snow_inspector/map.html', context)


def snow_graph(request):
    """
    Controller that will show the snow graph for user-defined lat / lon.
    """
    #default value for lat, lon
    lat = '50'
    lon = '15'

    #Check form data
    #if request.POST and 'geometry' in request.POST:
    #    geom = request.POST['geometry']
    #    data = json.loads(geom)
    #    coords = data['geometries'][0]['coordinates']
    #    lat = coords[0]
    #    lon = coords[1]

    if request.GET:
        lat = request.GET['inputLat']
        lon = request.GET['inputLon']
        numdays = int(request.GET['inputDays'])
        endDate = request.GET['endDate']
        endDate2 = datetime.datetime.strptime(endDate, '%Y-%m-%d')
        startDate2 = (endDate2 - datetime.timedelta(days=numdays)).strftime("%Y-%m-%d")

        # Saving the last-selected site to the DB
        session = SessionMaker()
    
        #Query DB for gage object
        id = 1
        site = session.query(SnowSite).filter(SnowSite.id==id).one()
        site.latitude = lat
        site.longitude = lon
        session.commit()

        #Make the waterml url query string
        waterml_url = '?start=%s&end=%s&lat=%s&lon=%s' % (startDate2, endDate, lat, lon)

        #Make the map url query string
        map_url = '?days=%s&end=%s&lat=%s&lon=%s' % (numdays, endDate, lat, lon)

    
    #Create template context dictionary
    context = {'lat':lat, 'lon':lon, 'startDate':startDate2, 'endDate': endDate, 'waterml_url': waterml_url, 'map_url': map_url}

    return render(request, 'snow_inspector/snow_graph.html', context)

    
