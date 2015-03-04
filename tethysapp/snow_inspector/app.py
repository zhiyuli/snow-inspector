from tethys_apps.base import TethysAppBase, url_map_maker
from tethys_apps.base import PersistentStore


class SnowInspector(TethysAppBase):
    """
    Tethys app class for Snow Inspector.
    """

    name = 'Snow Inspector'
    index = 'snow_inspector:home'
    icon = 'snow_inspector/images/icon.gif'
    package = 'snow_inspector'
    root_url = 'snow-inspector'
    color = '#9b59b6'
        
    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (UrlMap(name='home',
                           url='snow-inspector',
                           controller='snow_inspector.controllers.home'),
                    UrlMap(name='map',
                           url='snow-inspector/map',
                           controller='snow_inspector.controllers.map'),
                    UrlMap(name='snow_graph',
                           url='snow-inspector/snow_graph',
                           controller='snow_inspector.controllers.snow_graph'),
                    UrlMap(name='snow_data',
                           url='snow-inspector/snow_data',
                           controller='snow_inspector.modis.get_data_json')
        )

        return url_maps


    def persistent_stores(self):
        """
        Add one or more persistent stores
        """
        stores = (PersistentStore(name='snow_inspector_db',
                                  initializer='init_stores:init_snow_inspector_db',
                                  spatial=True),
        )
        return stores
