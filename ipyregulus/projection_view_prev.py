# Copyright (c) University of Utah

from traitlets import Instance, List, Unicode
from ipywidgets import register, widget_serialization

from regulus.core import HasTree
from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import TreeWidget


@register
class Projection1View(HasTree, RegulusDOMWidget):
    _model_name = Unicode('ProjectionModel').tag(sync=True)
    _view_name = Unicode('ProjectionView').tag(sync=True)

    title = Unicode('').tag(sync=True)

    data = Instance(klass=DataWidget).tag(sync=True, **widget_serialization)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    measure = Unicode().tag(sync=True)
    show = List().tag(sync=True)
    color = Unicode('').tag(sync=True)

    def __init__(self, tree=None, **kwargs):
        if tree is not None and not isinstance(tree, HasTree):
            tree = TreeWidget(tree)
        data = kwargs.get('data', None)
        if data is None and tree is not None:
            data = tree.tree.regulus
        if data is not None and not isinstance(data, DataWidget):
            data = DataWidget(data=data)
        if data is not None:
            kwargs['data'] = data
            if 'measure' not in kwargs:
                kwargs['measure'] = data.data.measure
        super().__init__(tree, **kwargs)

    def update(self, tree):
        if tree is not None:
            if isinstance(tree, HasTree):
                if tree == self._owner:
                    super().update(tree)
                    return
            else:
                tree = TreeWidget(tree=tree)
                tree.ensure(self.attr)
        with self.hold_sync():
            # self.attrs = dict()
            self.show = []
            self.tree_model = tree
        super().update(tree)
        # self.changed += 1)

