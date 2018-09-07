from ipywidgets import FloatSlider, Widget
from traitlets import Bool, HasTraits, Instance, Int, TraitType, Unicode

class Function(TraitType):
    default_value = lambda x: x


class Filter(HasTraits):
    changed = Int(0)
    disabled = Bool(False)
    func = Function()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.observe(self._on_changed, names=['disabled', 'func'])

    def _on_changed(self, change=None):
        self.changed += 1

    def __call__(self, *args, **kwargs):
        return self.disabled or self.func(*args, **kwargs)


class BaseUIFilter(Filter):
    ui = Instance(klass=Widget)

    @property
    def value(self):
        return self.ui.value

    @value.setter
    def value(self, value):
        self.ui.value = value

    def _ipython_display_(self, **kwargs):
        display(self.ui)

class UIFilter(BaseUIFilter):
    def __init__(self, **kwargs):
        if 'ui' not in kwargs:
            kwargs['ui'] = FloatSlider(min=0, max=1, step=0.01, value=0.5)
        super().__init__(**kwargs)
        self.observe(self._on_ui, names='ui')

    def _on_ui(self, change):
        if change['new'] is not None:
            self.ui.observe(self._on_changed, names='value')
        if change['prev'] is not None:
            change['prev'].unobserve(self._on_changed)

    def __call__(self, *args, **kwargs):
        return self.disabled or self.func(self.value, *args, **kwargs)



class AttrFilter(UIFilter):
    attr = Unicode()

    def __call__(self, tree, node, *args, **kwargs):
        nv = tree.attr[self.attr][node]
        return self.disabled or self.func(nv, self.value, *args, **kwargs)
