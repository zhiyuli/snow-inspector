from django.http import JsonResponse
import json
import math
import datetime
import png
import urllib2


"""
Convert (lat, lon) to the proper tile number
Taken from http://wiki.openstreetmap.org/wiki/Tilenames#Lon..2Flat._to_tile_numbers_2
"""
def deg2num(lat_deg, lon_deg, zoom):
    tileSize = 256;
    lat_rad = math.radians(float(lat_deg))
    n = 2.0 ** zoom
    xtilef = (float(lon_deg) + 180.0) / 360.0 * n
    xtile = int(xtilef)
    xpixel = int((xtilef - float(xtile)) * tileSize)
    ytilef = (1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n
    ytile = int(ytilef)
    ypixel = int((ytilef -float(ytile)) * tileSize)
    return (xtile, ytile, xpixel, ypixel)
    

def getTileURL(xtile, ytile, zoom, date):
    baseURL = 'http://map1.vis.earthdata.nasa.gov/wmts-webmerc/' + \
    '{0}/default/{1}/{2}/{3}/{4}/{5}.png'
    layer = 'MODIS_Terra_Snow_Cover'
    tileMatrix = 'GoogleMapsCompatible_Level8'
    time = date.strftime("%Y-%m-%d")
    zoom = 8
    return baseURL.format(layer, time, tileMatrix, zoom, ytile, xtile)
    
        

    
def getTimeSeries(lat, lon, beginDate, endDate):
    nDays = (endDate - beginDate).days
    datelist = [beginDate + datetime.timedelta(days=x) for x in range(0,nDays)]
    zoom = 8
    xtile, ytile, xpixel, ypixel = deg2num(lat, lon, zoom)
    ts = []
    for d in datelist:        
        url = getTileURL(xtile, ytile, zoom, d)
        print url
        snow_val = getImage(url, ypixel, xpixel)
        if snow_val > 100:
            snow_val = None
        ts.append(snow_val)
    return ts
    
    
def getImage(url, rowpixel, colpixel):
    r = png.Reader(file=urllib2.urlopen(url))
    w, h, pixels, metadata = r.read()
    pxlist = list(pixels)
    return pxlist[rowpixel][colpixel]


def get_data_json(request):
    """
    Controller that will show the snow data in Json format
    """
    #default value for lat, lon
    lat = '50'
    lon = '15'
    start = datetime.datetime.today().strftime("%Y-%m-%d")
    end = (datetime.datetime.today() - datetime.timedelta(days=365)).strftime("%Y-%m-%d")

    if request.GET:
        lat = request.GET["lat"]
        lon = request.GET["lon"]
        start = request.GET["start"]
        end = request.GET["end"]

        if request.GET["start"]:
            startdate = datetime.datetime.strptime(start, "%Y-%m-%d")
        if request.GET["end"]:
            enddate = datetime.datetime.strptime(end, "%Y-%m-%d")
    
    context = {'lat':lat, 'lon':lon, 'startdate':start, 'enddate':end}

    v = getTimeSeries(lat, lon, startdate, enddate)

    return JsonResponse({"query":context, "data":v})
