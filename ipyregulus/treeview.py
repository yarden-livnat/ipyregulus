# Copyright (c) University of Utah

from traitlets import Dict, Instance, Unicode, observe, Set
from ipywidgets import register, widget_serialization
from .base import RegulusDOMWidget
from ipyregulus import TreeWidget,  HasTree
from traitlets import HasTraits


@register
class TreeView(HasTree, RegulusDOMWidget):
    """"""
    _model_name = Unicode('TreeViewModel').tag(sync=True)
    _view_name = Unicode('TreeView').tag(sync=True)

    title = Unicode('title').tag(sync=True)
    field = Unicode('').tag(sync=True)
    attrs = Dict({}).tag(sync=True)
    show = Set(None, allow_none=True).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)

    @property
    def measure(self):
        return self.field

    @measure.setter
    def measure(self, name):
        self.ensure(name)
        self.field = name

    def __init__(self, *args, **kwargs):
        self.measure = kwargs.pop('measure', 'start')
        super().__init__(*args, **kwargs)


    def ensure(self, name, force=False):
        if self.tree is None:
            return
        if name not in self.attrs or force:
            if name in self.tree:
                self._owner.ensure(name)
                # self.attrs[name] = self.tree.retrieve(name)
                # self._notify_trait('attrs', self.attrs, self.attrs)

    def update(self, change):
        super().update(change)
        with self.hold_sync():
            self.attrs = dict()
            self.show = None
            if self.tree is not None:
                if self._owner is not None:
                    self.tree_model = self._owner
                    self.ensure(self.measure, force=True)
                else:
                    self.ref = TreeWidget(self.tree)

    # @observe('tree')
    # def tree_changed(self, change):
    #     if change['old'] is not None:
    #         change['old'].unobserve(self.tree_modified, names='model')
    #     if change['new'] is not None:
    #         change['new'].observe(self.tree_modified, names='model')
    #     self.tree_modified(None)
    #
    # def tree_modified(self, change):
    #     self.attrs = dict()
    #     self.show = None
    #     self.ensure(self.measure, force=True)
