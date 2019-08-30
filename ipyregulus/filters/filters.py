from ipywidgets import FloatSlider, GridBox, HBox, Label, VBox, Widget
from traitlets import Bool, HasTraits, Instance, Int, List, TraitType, Unicode, Undefined
from traitlets import observe

from regulus.core import AttrRange

from .basic_filters import *


def minmax(obj):
    items = iter(obj)
    min = max = next(items)
    for item in items:
        if item < min:
            min = item
        elif item > max:
            max = item
    return min, max


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
        self.invalidate()

    def invalidate(self):
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

    # def _ipython_display_(self, **kwargs):
    #     display(self.ui)


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


class AttrFilter(UIFilter, HBox):
    attr = Unicode()
    # range = Instance(AttrRange, allow_none=True)

    def __init__(self, attr, *args, **kwargs):
        self.label = Label()
        if 'func' not in kwargs:
            kwargs['func'] = lambda x,v: v < x
        super().__init__(attr=attr, *args, **kwargs)
        self.__name__ = attr
        # self.label = Label(value=self.attr)
        # self.box = HBox([self.label, self.ui])
        self.children = [self.label, self.ui]

    @observe('attr')
    def _observe_attr(self, change):
        self.label.value = change['new']

    def __call__(self, tree, node, *args, **kwargs):
        nv = tree.attr[self.attr][node]
        return self.disabled or self.func(nv, self.value, *args, **kwargs)

    def update_range(self, tree):
        a = tree.attr[self.attr]
        if 'range' in a.properties:
            r = a.properties['range']
        else:
            r = AttrRange(type='auto')
        self.range = r.update(tree, self.attr)


class GroupUIFilter(Filter, VBox):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._op = None
        self._names = {}
        self._filters = VBox()
        self._header = Label(value='')
        self.children = [self._filters]
        self.op = And()


    @property
    def filters(self):
        return list(self._filters.children)

    @filters.setter
    def filters(self, filters):
        header_visible = len(self._filters.children) > 1
        self._filters.children = filters
        show_header = len(self._filters.children) > 1
        if header_visible != show_header:
            if show_header:
                self.children = [self._header, self._filters]
            else:
                self.children = [self._filters]

    def find(self, name):
        return self._names[name]

    def add(self, f, name=None):
        return self.insert(len(self._names), f, name)

    def insert(self, idx, f, name=None):
        if isinstance(f, str):
            if name is None:
                name = f
            f = AttrFilter(attr=f)
        if isinstance(f, Filter):
            pass
        elif callable(f):
            f = Filter(func=f)
        if name is None:
            name = f.__name__
        if name is None or name == '<lambda>':
            raise ValueError('name must be provided becuase f does not have intrinsic name')

        self._names[name] = f
        self._op.add(f)
        filters = self.filters
        filters.insert(idx, f)
        self.filters = filters
        f.observe(self._on_changed, names=['changed'])
        self.invalidate()
        return f

    def remove(self, item):
        if type(item) == str:
            item = self._names[item]
        elif isinstance(item, int):
            item = self._names[item]
        self._op.remove(item)
        filters = self.filters
        filters.remove(item)
        self.filters = filters
        self.invalidate()
        return item

    def update_range(self, tree):
        valid = True
        for f in self.op.filters:
            if hasattr(f, 'update_range'):
                f.update_range(tree)
                valid = False
        if not valid:
            self.invalidate()

    @property
    def op(self):
        return self._op

    @op.setter
    def op(self, v):
        if self._op:
            v.add(*self._op.filters)
            self._op.reset()
        self._op = v
        self._header.value = self._op.__name__
        self.invalidate()

    def __call__(self, tree, node, *args, **kwargs):
        return self.disabled or self._op( tree, node, *args, **kwargs)