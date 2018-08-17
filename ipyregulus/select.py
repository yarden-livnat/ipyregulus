
from ipywidgets import interact, interactive, FloatSlider

def noop(x):
    return x


class Select(object):
    def __init__(self, view, attr, func, **kwargs):
        self.view = view
        self.func = noop
        self.slider = FloatSlider(description=attr, *kwargs)

        self.slider.observe(self.update, names='value')

    def update(self, value):
        print('value', value)
