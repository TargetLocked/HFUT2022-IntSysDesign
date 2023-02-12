from PIL import Image
import io
import urllib.request


def url_to_image(url):
    buf = urllib.request.urlopen(url).read()
    return Image.open(io.BytesIO(buf))
