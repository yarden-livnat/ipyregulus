# Copyright (c) University of Utah

from traitlets import Dict, Unicode, observe
from ipywidgets import register, widget_serialization
from .base import RegulusDOMWidget
from .treetrait import TreeTrait

@register
class TreeView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('').tag(sync=True)
    tree = TreeTrait(allow_none=True).tag(sync=True, **widget_serialization)
    attrs = Dict({}).tag(sync=True)

    @property
    def measure(self):
        return self.field

    @measure.setter
    def measure(self, name):
        print('measure = ', name)
        self.ensure(name)
        self.field = name

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.measure = kwargs.get('measure', 'start')

    def ensure(self, name, force=False):
        if name not in self.attrs or force:
            if name in self.tree.model:
                self.attrs[name] = self.tree.model.retrieve(name)
                self._notify_trait('attrs', self.attrs, self.attrs)

    @observe('tree')
    def tree_changed(self, change):
        # print('tree changed', change)
        if change['old'] is not None:
            change['old'].unobserve(self.tree_modified, names='model')
        if change['new'] is not None:
            change['new'].observe(self.tree_modified, names='model')
        self.tree_modified(None)

    def tree_modified(self, change):
        self.attrs = dict()
        self.ensure(self.measure, force=True)
