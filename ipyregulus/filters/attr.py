from ipywidgets import FloatSlider, HBox, Label
from .ui import *

class AttrFilter(UIFilter):
    def __init__(self, attr, func, **kwargs):
        self._attr = attr
        self.f = func
        self.label = Label(value=attr)
        widget = kwargs.get('ui', None)
        if widget is None:
            widget = FloatSlider(min=0, max=1, step=0.01)
            kwargs['ui'] = widget
        self.box = HBox([self.label, widget])
        super().__init__(func=self.filter, **kwargs)

    def filter(self, v, tree, node):
        return self.f(tree.attr[self._attr][node], v)

    @property
    def attr(self):
        return self._attr

    @attr.setter
    def attr(self, name):
        if self._attr != name:
            self._attr = name
            self.label.value = name
            self._notify()

    @property
    def func(self):
        return super().func

    @func.setter
    def func(self, f):
        self.f = f
        self._notify()

    def _ipython_display_(self, **kwargs):
        display(self.box)
