# Copyright (c) University of Utah

from traitlets import Bool, Dict, HasTraits, Instance, Int, List, Tuple, Unicode, observe, Set
from ipywidgets import register, widget_serialization

from regulus.topo import AttrRange
from .base import RegulusDOMWidget
from .tree import HasTree, TreeWidget


def from_json(array, manager):
    # print('from json:', array)
    return array


@register
class BaseTreeView(HasTree, RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    changed = Int(0)
    title = Unicode('').tag(sync=True)
    field = Unicode('').tag(sync=True)
    attrs = Dict({}).tag(sync=True)
    attr = Unicode('').tag(sync=True)
    show = Set(None, allow_none=True).tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    selected = List().tag(sync=True, from_json=from_json)
    details = List([]).tag(sync=True)
    range = Tuple((0,1)).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)

    def __init__(self, tree=None, attr='span', **kwargs):
        if tree is not None and not isinstance(tree, HasTree):
            tree = TreeWidget(tree)
        super().__init__(tree, **kwargs)
        self.attr = attr

    @observe('attr')
    def _attr(self, change):
        attr = change['new']
        if self.tree is not None and attr in self.tree:
            self.ensure(attr)
            range = self.tree.attr[attr].properties['range']
            self.range = range.value
            self.field = attr

    def set_show(self, node_ids):
        self.show = node_ids

    def ensure(self, name, force=False):
        if self.tree is None:
            return
        if name not in self.attrs or force:
            if name in self.tree:
                self._owner.ensure(name)

    def update(self, tree):
        if tree is not None:
            if isinstance(tree, HasTree):
                if tree == self._owner:
                    super().update(tree)
                    return
            else:
                print('BaseTreeView: create BaseTreeView')
                tree = TreeWidget(tree=tree)
                tree.ensure(self.attr)
        with self.hold_sync():
            self.attrs = dict()
            self.show = None
            self.tree_model = tree
        super().update(tree)
        self.changed += 1
