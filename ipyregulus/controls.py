from ipywidgets import Label, HBox, FloatSlider
from traitlets import Set
from IPython.display import display

# from regulus.tree.alg import filter as filter_tree, reduce as reduce_tree
from .tree import HasTree


class TreeControler(HasTree):
    def __init__(self, ref, attr, func, widget=None):
        self._attr = None
        self.monitored = None
        self.func = func
        self.widget = widget if widget is not None else FloatSlider(min=0, max=1, step=0.01)
        self.value = self.widget.value
        self.label = Label()
        super().__init__(ref)
        self.attr = attr
        self.widget.observe(self.update, names='value')
        self.update(None)

    @property
    def attr(self):
        return self._attr

    @attr.setter
    def attr(self, name):
        if self._attr == name:
            return
        self._attr = name
        self.label.value = name
        if self.ref is not None:
            self.monitored = self.ref.attr[name]
        self.update(None)

    def ref_changed(self, change):
        super().ref_tree_changed(change)
        if self.ref is not None and self._attr is not None:
            self.monitored = self.ref.attr[self._attr]
        else:
            self.monitored = None
        self.update(None)

    def apply(self, node):
        return self.func(self.monitored[node], self.value)

    def update(self, change):
        if change is not None:
            self.value = change['new']

    def _ipython_display_(self, **kwargs):
        display(HBox([self.label, self.widget]))


class TreeFilter(TreeControler):
    visible = Set(allow_none=True)

    def __init__(self, ref, attr, func, **kwargs):
        self._cbs = []
        super().__init__(ref, attr, func, **kwargs)
        self.tree = self.ref

    def ref_changed(self, change):
        super().ref_changed(change)
        self.tree = self.ref
        self.update(None)

    def update(self, change):
        super().update(change)
        if self.ref is not None and self.monitored is not None:
            self.visible = self.ref.reduce(self.apply)
        else:
            self.visible = None
        for func in self._cbs:
            func(self.visible)

    def on(self, func):
        self._cbs.append(func)

    def off(self, func):
        if func is None:
            self._cbs = []
        else:
            self._cbs.remove(func)


class TreeReducer(TreeControler):
    def update(self, change):
        super().update(change)
        if self.ref is not None and self.monitored is not None:
            self.tree = self.ref.prune(self.apply)
        else:
            self.tree = self.ref
