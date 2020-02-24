"""
    Regulus Tree widget
"""

from ipywidgets import register
from traitlets import Dict, Instance, Unicode, Undefined, validate

from regulus import HasTree, RegulusTree
from regulus.tree import Node

from ipyregulus.core.base import RegulusWidget


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
    "A widget representing a tree"

    _model_name = Unicode('TreeModel').tag(sync=True)

    root = Instance(klass=Node, allow_none=True).tag(sync=True, to_json=_tree_to_json)
    attrs = Dict(allow_null=True).tag(sync=True)

    def __init__(self, tree=None, select=lambda x: {}, **kwargs):
        self.user_select = select
        super().__init__(tree)

    def update(self, src):
        if self._tree is not None:
            self._tree.unobserve(self._attrs_changed, names=['state'])

        tree = src if src is None or isinstance(src, RegulusTree) else src.tree
        with self.hold_sync():
            if tree is None:
                self.root = None
                self.attrs = dict()
            else:
                self.root = tree.root
                attrs = list(self.attrs.keys())
                self.attrs = dict()
                for attr in attrs:
                    self.attrs[attr] = tree.retrieve(attr)
                tree.observe(self._attrs_changed, names=['state'])
        super().update(src)

    def ensure(self, attr):
        if attr not in self.attrs:
            if attr in self.tree:
                self.attrs[attr] = self.tree.retrieve(attr)
                self._notify_trait('attrs', self.attrs, self.attrs)
                return True
        return False

    def _attrs_changed(self, change):
        # TODO: why is this being called with 'attrs' at all and in paricular not with a dict?
        # (due to self._notify_trait('attrs', self.attrs, self.attrs in line 76
        if not isinstance(change, dict):
            return

        op, attr = change['new']
        if attr in self.attrs:
            if op == 'change':
                self.attrs[attr] = self.tree.retrieve(attr)
                self._notify_trait('attrs', self.attrs, self.attrs)

    @validate('model')
    def _validate_tree(self, proposal):
        """validate the tree"""
        value = proposal['value']
        # TODO: validate
        return value

    def _default_select(self, node):
        return {
            'id': node.id,
            'lvl': node.data.persistence,
            'size': node.data.size(),
            'internal_size': node.data.internal_size(),
            'offset': node.offset,
            'base': node.data.base
            }

    def _select(self, node):
        d = self._default_select(node)
        if node.data is not None:
            d.update(self.user_select(node))
        return d

    def touch(self):
        """inform the widget the tree was mutated"""
        self._notify_trait('root', self.root, self.root)
