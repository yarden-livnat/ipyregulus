# Copyright (c) University of Utah

from traitlets import Bool, Dict, Instance, Int, List, Tuple, Unicode, Set, validate, observe, HasTraits
from ipywidgets import register, widget_serialization

from regulus import HasTree, Tree
from ipyregulus.core.base import RegulusDOMWidget
from .tree import TreeWidget


def from_json(array, manager):
    return array


@register
class BaseTreeView(HasTree, RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    changed = Int(0)
    title = Unicode('').tag(sync=True)
    show_measure = Bool(True).tag(sync=True)
    attrs = Dict(default_value={}).tag(sync=True)
    attr = Unicode('').tag(sync=True)
    # show_attr = Bool(True).tag(sync=True)
    show = Set(Int(), None, allow_none=True).tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    selected = List().tag(sync=True, from_json=from_json)
    details = List(Int(), []).tag(sync=True)
    range = Tuple((0, 1)).tag(sync=True)
    x = Tuple((0, 1)).tag(sync=True)
    y = Tuple((0, 1)).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)

    @validate('src')
    def validate_src(self, proposal):
        src = proposal['value']
        if isinstance(src, TreeWidget):
            self.tree_model = src
            # value = value.tree
        elif isinstance(src, HasTraits) and src.has_trait('tree'):
            self.tree_model = TreeWidget(src)
            # value = value.tree
        elif isinstance(src, Tree):
            self.tree_model = TreeWidget(src)
        elif src is None:
            self.tree_model = None
        return super().validate_src(proposal)

    def __init__(self, src=None, attr='fitness', children=None, **kwargs):
        super().__init__(None, **kwargs)
        self.src = src
        self.attr = attr

    @observe('tree')
    def _tree_changed(self, change):
        self.attrs = dict()
        self.show = None
        if self.attr is not None and self.attr != '':
            self.attr = self.attr

    @validate('attr')
    def _validate_attr(self, proposal):
        attr = proposal['value']
        if self.tree is None:
            return attr
        self.ensure(attr)
        self.range = self.tree.attr[attr].properties['range'].value
        return attr

    def set_show(self, node_ids):
        self.show = node_ids

    def ensure(self, name, force=False):
        if self.tree_model is None:
            return
        if name not in self.attrs or force:
            self.tree_model.ensure(name)


