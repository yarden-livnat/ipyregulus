"""
    Regulus Tree widget
"""

from ipywidgets import register, widget_serialization
from traitlets import Dict, Instance, Unicode, Undefined, validate
from regulus.topo import RegulusTree
from regulus.tree import Node
from .base import RegulusWidget

def _tree_to_json(value, widget):
    def marshal(node, l):
        l.append(widget._select(node))
        for child in node.children:
            marshal(child, l)
        l.append(None)
        return l

    if value is None:
        return None
    if value is Undefined:
        return None

    return marshal(value, [])



@register
class TreeWidget(RegulusWidget):
    "A widget represeting a tree"

    _model_name = Unicode('TreeModel').tag(sync=True)

    model = Instance(klass=RegulusTree, allow_none=True).tag(sync=False)
    root = Instance(klass=Node, allow_none=True).tag(sync=True, to_json=_tree_to_json)
    attrs = Dict(allow_null=True).tag(sync=True)

    def __init__(self, select=lambda x:{}, **kwargs):
        if 'model' in kwargs:
            kwargs['root'] = kwargs['model'].root
            # kwargs['attrs'] = kwargs['model'].attrs
        self.user_select = select
        super().__init__(**kwargs)
        self.observe(self.model_changed, names=['model'])


    def model_changed(self, change):
        model = change['new']
        self.root = model.root
        # self.attrs = model.attrs

    @validate('model')
    def _validate_tree(self, proposal):
        """validate the tree"""
        value = proposal['value']
        # validate
        return value

    def _default_select(self, node):
        return {
            'id': node.ref,
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
