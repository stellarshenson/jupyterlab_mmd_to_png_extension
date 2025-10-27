import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado


class HealthCheckHandler(APIHandler):
    """
    Simple health check endpoint for the extension.
    Note: Mermaid diagram rendering is now handled entirely client-side.
    """

    @tornado.web.authenticated
    def get(self):
        self.finish(
            json.dumps(
                {
                    'status': 'ok',
                    'message': 'jupyterlab_mmd_to_png_extension is active',
                    'rendering': 'client-side'
                }
            )
        )


def setup_handlers(web_app):
    host_pattern = '.*$'

    base_url = web_app.settings['base_url']

    # Health check endpoint
    health_pattern = url_path_join(
        base_url, 'jupyterlab-mmd-to-png-extension', 'health'
    )

    handlers = [(health_pattern, HealthCheckHandler)]
    web_app.add_handlers(host_pattern, handlers)
