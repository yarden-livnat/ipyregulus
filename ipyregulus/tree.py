# Copyright (c) University of Utah

from traitlets import (
    Unicode, Instance, List, Dict, Enum, Float, Int, Undefined, TraitError, default,
    validate
)
from ipywidgets import DOMWidget, register, widget_serialization
from regulus.tree.tree import Node

# from .serializer import tree_serialization
from ._version import EXTENSION_SPEC_VERSION

MODULE_NAME = '@regulus/ipyregulus'

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
        raise TraitError('Cannot serialize undefined tree')
    return marshal(value, [])

@register
class TreeView(DOMWidget):
    """"""
    _model_name = Unicode('TreeModel').tag(sync=True)
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)

    _view_name = Unicode('Tree').tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('field').tag(sync=True)
    tree = Instance(klass=Node, allow_none=True).tag(sync=True, to_json=_tree_to_json)


    def __init__(self, select=lambda x:{}, **kwargs):
        self.user_select = select
        super().__init__(**kwargs)

    def _select(self, node):
        if node.data is not None:
            d = {
                'id': node.data.id,
                'lvl': node.data.persistence if len(node.children) > 0 else 0,
                'size': node.data.size(),
                'offset': node.offset,
                **self.user_select(node)
                }
        else:
            d = {'id': -1, 'lvl': 1, 'size': 0, 'offset': 0}
        return d
