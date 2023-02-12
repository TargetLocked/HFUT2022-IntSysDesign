import io
import urllib.request
from PIL import Image, ImageFilter
from model.siamese import Siamese

_model = None


def init_model():
    global _model
    _model = Siamese()


def _get_img(img_path):
    img = Image.open(img_path)
    img = img.filter(ImageFilter.MedianFilter(3))
    img = img.filter(ImageFilter.SMOOTH)
    img = img.filter(ImageFilter.ModeFilter)
    return img


def predict(img, url):
    global _model
    probability = _model.detect_image(img, url_to_img(url)).item()
    return round(probability, 3)


def _url_to_io(url):
    buf = urllib.request.urlopen(url).read()
    return io.BytesIO(buf)


def url_to_img(url):
    return _get_img(_url_to_io(url))