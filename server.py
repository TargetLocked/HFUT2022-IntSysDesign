from aiohttp import web
import os
import aiohttp_jinja2
import jinja2

routes = web.RouteTableDef()
resdir = os.path.join(os.path.dirname(__file__), 'app')
app = web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(resdir))


@routes.get('/')
@aiohttp_jinja2.template('static/main.html')
async def get(request):
    return {}


routes.static('/static', os.path.join(resdir, 'static'))


def main():
    app.add_routes(routes)
    web.run_app(app)


if __name__ == '__main__':
    main()