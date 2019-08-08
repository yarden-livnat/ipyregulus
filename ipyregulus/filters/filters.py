from ipywidgets import FloatSlider, HBox, Label, Widget
from traitlets import Bool, HasTraits, Instance, Int, TraitType, Unicode, Undefined
from traitlets import observe

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
    ui = Instance(klass=Widget, allow_none=True)

    @property
    def value(self):
        return self.ui.value

    @value.setter
    def value(self, value):
        self.ui.value = value

    def _ipython_display_(self, **kwargs):
        display(self.ui)


class UIFilter(BaseUIFilter):

    def __init__(self, func=lambda x,v: v<=x, **kwargs):
        ui = kwargs.pop('ui', FloatSlider(min=0, max=1, step=0.01, value=0.0))
        super().__init__(func=func, **kwargs)
        self.observe(self._on_ui, names='ui')
        self.ui = ui

    @property
    def range(self):
        return [self.ui.min, self.ui.max, self.ui.step]

    @range.setter
    def range(self, v):
        r = self.range
        for i in range(min(len(v), 3)):
            if v[i] is not None:
                r[i] = v[i]
        self.ui.min = r[0]
        self.ui.max = r[1]
        self.ui.step = r[2]

    def _on_ui(self, change):
        if change['new'] is not None:
            self.ui.observe(self._on_changed, names='value')
        if change['old'] not in (None, Undefined):
            change['old'].unobserve(self._on_changed)

    def __call__(self, *args, **kwargs):
        return self.disabled or self.func(self.value, *args, **kwargs)


class AttrFilter(UIFilter):
    attr = Unicode()

    def __init__(self, *args, **kwargs):
        self.label = Label()
        super().__init__(*args, **kwargs)
        # self.label = Label(value=self.attr)
        self.box = HBox([self.label, self.ui])

    @observe('attr')
    def _observe_attr(self, change):
        self.label.value = change['new']

    def __call__(self, tree, node, *args, **kwargs):
        nv = tree.attr[self.attr][node]
        return self.disabled or self.func(nv, self.value, *args, **kwargs)

    def _ipython_display_(self, **kwargs):
        display(self.box)
