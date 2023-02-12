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


def predict(url1, url2):
    global _model
    img1 = _get_img(_url_to_io(url1))
    img2 = _get_img(_url_to_io(url2))

    probability = _model.detect_image(img1, img2).item()
    return round(probability, 3)


def _url_to_io(url):
    buf = urllib.request.urlopen(url).read()
    return io.BytesIO(buf)
