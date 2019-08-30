"""
    Regulus Tree widget
"""

from ipywidgets import register, widget_serialization
from traitlets import Dict, Instance, Unicode, Undefined, validate

from regulus.core import HasTree
from regulus.topo import RegulusTree
from regulus.tree import Node

from ..base import RegulusWidget


def _tree_to_json(value, widget):
    def marshal(node, l):
        l.append(widget._select(node))
        for child in node.children:
            marshal(child, l)
        l.append(None)
        return l

    if value is None or value is Undefined:
        return None
    return marshal(value, [])


@register
class TreeWidget(HasTree, RegulusWidget):
    "A widget represeting a tree"

    _model_name = Unicode('TreeModel').tag(sync=True)

    root = Instance(klass=Node, allow_none=True).tag(sync=True, to_json=_tree_to_json)
    attrs = Dict(allow_null=True).tag(sync=True)

    def __init__(self, tree=None, select=lambda x: {}, **kwargs):
        self.user_select = select
        super().__init__(tree)

    def update(self, src):
        tree = src if isinstance(src, RegulusTree) else src.tree
        with self.hold_sync():
            self.root = tree.root if tree is not None else None
            attrs = list(self.attrs.keys())
            self.attrs = dict()
            for attr in attrs:
                self.attrs[attr] = tree.retrieve(attr)
        super().update(src)

    def ensure(self, attr):
        if attr not in self.attrs:
            if attr in self.tree:
                self.attrs[attr] = self.tree.retrieve(attr)
                self._notify_trait('attrs', self.attrs, self.attrs)
                return True
        return False

    @validate('model')
    def _validate_tree(self, proposal):
        """validate the tree"""
        value = proposal['value']
        # TODO: validate
        return value

    def _default_select(self, node):
        return {
            'id': node.id,
            'lvl': node.data.persistence if len(node.children) > 0 else 0,
            'size': node.data.size(),
            'offset': node.offset
            }

    def _select(self, node):
        d = self._default_select(node)
        if node.data is not None:
            d.update(self.user_select(node))
        return d

    def touch(self):
        """inform the widget the tree was mutated"""
        self._notify_trait('root', self.root, self.root)
