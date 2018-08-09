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
        l.append(node.data)
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
    root = Instance(klass=Node).tag(sync=True, to_json=_tree_to_json)
    # root = Instance(klass=Node).tag(sync=True, **tree_serialization)

    # def __init__(self, **kwargs):
    #     super(TreeView, self).__init__(**kwargs)
    #     print('Tree')
    #     # print('\tto_json', tree_serialization['to_json'](self.value, self))
