from django.shortcuts import render
from django.http import JsonResponse

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
    map_options = {'height': '500px',
                   'width': '100%',
                   'input_overlays': geojson_sites}
    
    # Pass variables to the template via the context dictionary
    context = {'map_options': map_options}
    
    return render(request, 'snow_inspector/map.html', context)


def snow_graph(request):
    """
    Controller that will show the snow graph for user-defined lat / lon.
    """
    #default value for lat, lon
    lat = '50'
    lon = '15'

    #Check form data
    if request.POST and 'geometry' in request.POST:
        geom = request.POST['geometry']
        data = json.loads(geom)
        coords = data['geometries'][0]['coordinates']
        lat = coords[0]
        lon = coords[1]

    
    #Create template context dictionary
    context = {'selected_geometry': geom, 'lat':lat, 'lon':lon}

    return render(request, 'snow_inspector/snow_graph.html', context)

    
