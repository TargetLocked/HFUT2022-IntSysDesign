from aiohttp import web
import os
import aiohttp_jinja2
import jinja2
import json
import api

routes = web.RouteTableDef()
resdir = os.path.join(os.path.dirname(__file__), 'app')
app = web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader(resdir))


@routes.get('/app')
@aiohttp_jinja2.template('static/main.html')
async def get(request):
    return {}


reserved = {}


@routes.post('/api')
async def post(request):
    global reserved
    try:
        content = json.loads(await request.content.read())
        headers = request.headers
    except json.JSONDecodeError:
        return web.Response(status=400, reason='Invalid JSON payload')
    if 'App-SessionID' not in headers:
        return web.Response(status=400, reason='Missing session ID')
    else:
        session = headers['App-SessionID']
    if 'reserve' not in content:
        return web.Response(status=400, reason='Missing field \'reserve\'')
    if 'photo' not in content:
        return web.Response(status=400, reason='Missing field \'photo\'')

    body = {}
    if content['reserve'] == True:
        reserved[session] = api.url_to_img(content['photo'])
    else:
        if session in reserved:
            body['result'] = api.predict(reserved[session], content['photo'])
    return web.Response(status=200, text=json.dumps(body))


routes.static('/static', os.path.join(resdir, 'static'))


def main():
    app.add_routes(routes)
    api.init_model()
    web.run_app(app)


if __name__ == '__main__':
    main()