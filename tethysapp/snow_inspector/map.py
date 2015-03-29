from django.shortcuts import render
from django.http import JsonResponse

from .model import SessionMaker, SnowSite
import json
import datetime

def map(request):
    """
    Controller for map page.
    """
    # Create a session
    session = SessionMaker()
    
    #Query DB for gage object
    id = 1
    site = session.query(SnowSite).filter(SnowSite.id==id).one()
    
    #Transform into GeoJSON format
    geometries = []
    
    site_geometry = dict(type="Point",
        coordinates=[site.latitude, site.longitude],
                        properties={"value":site.value})
    geometries.append(site_geometry)

    geojson_sites = {"type": "GeometryCollection",
                     "geometries": geometries}

    #configure the map
    google_map_options = {
        'height': '500px',
        'width': '100%',
        'input_overlays': geojson_sites
    }
    openlayers_map_options = {
        'height': '500px',
        'width': '100%',
        'view': {
            'projection': 'EPSG:4326',
            'center': [-100, 40], 
            'zoom': 4,
            'maxZoom': 18, 
            'minZoom': 3,
            },
       'base_map': 'MapQuest',
    }
    

    #configure the date picker
    today = datetime.date.today()
    date_picker = {'display_text': 'Date',
        'name': 'endDate',
        'autoclose': True,
        'format': 'yyyy-mm-dd',
        'start_date': '2013-01-01',
        'today_button': True,
        'initial': datetime.datetime.today().strftime("%Y-%m-%d")
    }

    days_picker = {'display_text': 'Number of days:',
              'name': 'inputDays',
              'placeholder': '100'}

    # Pre-populate lat-picker and lon_picker from model
    lat_picker = {'display_text': 'Latitude:',
              'name': 'inputLat',
              'placeholder': site.latitude}

    lon_picker = {'display_text': 'Longitude:',
              'name': 'inputLon',
              'placeholder': site.longitude}

    
    # Pass variables to the template via the context dictionary
    context = {'map_options': openlayers_map_options, 
               'date_picker':date_picker,
               'days_picker':days_picker,
               'lon_picker':lon_picker,
               'lat_picker':lat_picker}
    
    return render(request, 'snow_inspector/openlayers_map.html', context)


