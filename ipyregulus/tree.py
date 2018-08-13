"""
    Regulus Tree widget
"""

from ipywidgets import register, widget_serialization
from traitlets import Instance, Unicode, Undefined, validate
from regulus.tree import Tree
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

    root = Instance(klass=Tree, allow_none=True).tag(sync=True, to_json=_tree_to_json)

    def __init__(self, select=lambda x:{}, **kwargs):
        self.user_select = select
        super().__init__(**kwargs)

    @validate('root')
    def _validate_tree(self, proposal):
        """validate the tree"""
        value = proposal['value']
        # validate
        return value

    def _default_select(self, node):
        return {
            'id': node.data.id,
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
