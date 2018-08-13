# Copyright (c) University of Utah

from traitlets import (
    Unicode, Instance, List, Dict, Enum, Float, Int, Undefined, TraitError, default,
    validate
)
from ipywidgets import register, widget_serialization
from .base import RegulusDOMWidget
from .tree import TreeWidget
from regulus.tree import Node
from .treetrait import TreeTrait

@register
class TreeView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('field').tag(sync=True)
    tree = TreeTrait(allow_none=True).tag(sync=True, **widget_serialization)
    attrs = Dict({}).tag(sync=True)


    # @validate('tree')
    # def _valid_tree(self, proposal):
    #     value = proposal['value']
    #     if isinstance(value, TreeWidget):
    #         return value
    #     if isinstance(value, Node):
    #         return TreeWidget(root=value)
    #     raise TraitError('tree must be a Node or a TreeWidget')
