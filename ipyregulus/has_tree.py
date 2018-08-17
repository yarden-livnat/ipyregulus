from traitlets import Bool, HasTraits, Instance, Set, This
from ipywidgets import Label, HBox, FloatSlider

from regulus.topo import RegulusTree
from regulus.tree.alg import filter as filter_tree

class HasTree(HasTraits):
    _tree = Instance(klass=RegulusTree, allow_none=True)
    _ref = Instance(klass=RegulusTree, allow_none=True)
    _owner = This(allow_none=True)

    def __init__(self, tree=None):
        super().__init__()
        self.tree = tree

    @property
    def tree(self):
        return self._tree

    @tree.setter
    def tree(self, tree):
        if isinstance(tree, RegulusTree):
            self._ref = tree
            self._owner = None
        elif isinstance(tree, HasTree):
            self._owner = tree
            self._ref = self._owner.tree
            self._owner.observe(self.tree_changed, values='tree')
        self.tree_changed(None)

    def tree_changed(self, change):
        if change is not None:
            print(**change)
            self._ref = change['new']
        self._tree = self._ref

class ReferencedTree(HasTree):
    def ref_changed(self, change):
        print('ref tree', change)
        self._ref = change['new']

class TreeControler(ReferencedTree):
    def __init__(self, tree, attr, func, widget=None):
        super().__init__(self, tree)
        self._attr = None
        self.monitored = None
        self.func = func
        self.widget = widget if widget is not None else FloatSlider(min=0, max=1, step=0.01)
        self.value = self.widget.value
        self.label = Label()

        self.widget.observe(self.update, names='value')
        self.update()

    @property
    def attr(self):
        return self._attr

    @attr.setter
    def attr(self, name):
        if self._attr == name:
            return
        self._attr = name
        self.label.value = name
        if tree is not None:
            self._monitored = tree.attr[name]

    def ref_changed(self, change):
        super().input_changed(change)
        if self.ref is not None:
            self.monitored = self.ref.attr[self._attr]
        else:
            self.monitored = None

    def update(change):
        if change is not None:
            self.value = change['new']

    def _ipython_display_(self, **kwargs):
        display(HBox([self.label, self.widget]))

class TreeFilter(TreeControler):
    visible = Set(None, allow_none=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tree = self.ref

    def input_changed(change):
        super().input_changed(change)
        self.tree = self.ref
        self.update(None)

    def apply(self, node):
        return self.func(node, self.value)

    def update(change):
        super().update(change)
        if self.ref is not None and self.monitored is not None:
            self.visible = filter_tree(self.ref, self.apply)
