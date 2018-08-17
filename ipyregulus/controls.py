from regulus.tree.alg import filter as filter_tree
from ipywidgets import Label, HBox, FloatSlider

class TreeAttrFilter(object):
    def __init__(self, view, attr, filter, value=None):
        self._attr = None
        self._tree_attr = None
        self.view = view
        self.view.tree.observe(self.tree_changed, names='model')
        self.filter = filter
        self.control = value if value is not None else FloatSlider(min=0, max=1, step=0.01)
        self.control.observe(self.update, names='value')
        self.value = self.control.value
        self.label = Label()
        self.attr = attr
        self.update(None)

    @property
    def attr(self):
        return self._attr

    @attr.setter
    def attr(self, name):
        self._attr = name
        self._tree_attr = self.view.tree.model.attr[name]
        self.label.value = name

    def tree_changed(self, change):
        self._tree_attr = self.view.tree.model.attr[self._attr]
        self.update(None)

    def update(self, change):
        if change is not None:
            self.value = change['new']
        self.view.show = filter_tree(self.view.tree.model, lambda n: self.filter(self._tree_attr[n], self.value))

    def _ipython_display_(self, **kwargs):
        display(HBox([self.label, self.control]))


from regulus.tree.alg import reduce as reduce_tree
class TreeAttrReduce(object):
    def __init__(self, tw, tree, attr, filter, value=None):
        self._attr = None
        self._tree_attr = None
        self.tw = tw
        self.tree = tree
        self.filter = filter
        self.control = value if value is not None else FloatSlider(min=0, max=1, step=0.01)
        self.control.observe(self.update, names='value')
        self.label = Label()
        self.attr = attr

    @property
    def attr(self):
        return self._attr

    @attr.setter
    def attr(self, name):
        self._attr = name
        self._tree_attr = self.tree.attr[name]
        self.label.value = name

    def update(self, change):
        self.tw.model = reduce_tree(self.tree, lambda n: self.filter(self._tree_attr[n], change['new']))

    def _ipython_display_(self, **kwargs):
        display(HBox([self.label, self.control]))
