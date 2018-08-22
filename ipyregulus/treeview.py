# Copyright (c) University of Utah

from traitlets import Dict, HasTraits, Instance, Unicode, observe, Set
from ipywidgets import register, widget_serialization

from .base import RegulusDOMWidget
from .tree import HasTree, TreeWidget


@register
class TreeView(HasTree, RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('').tag(sync=True)
    attrs = Dict({}).tag(sync=True)
    show = Set(None, allow_none=True).tag(sync=True)
    selected = Set(set()).tag(sync=True)
    details = Set(set()).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)

    @property
    def attr(self):
        return self.field

    @attr.setter
    def attr(self, name):
        self.ensure(name)
        self.field = name

    def __init__(self, *args, **kwargs):
        self.attr = kwargs.pop('attr', 'start')
        super().__init__(*args, **kwargs)


    def ensure(self, name, force=False):
        if self.tree is None:
            return
        if name not in self.attrs or force:
            if name in self.tree:
                self._owner.ensure(name)
                

    def update(self, change):
        super().update(change)
        with self.hold_sync():
            self.attrs = dict()
            self.show = None
            if self.tree is not None:
                if self._owner is not None:
                    self.tree_model = self._owner
                    self.ensure(self.attr, force=True)
                else:
                    self.ref = TreeWidget(self.tree)
