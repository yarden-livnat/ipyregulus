import pandas as pd
from traitlets import Dict, Int, List, Unicode, observe, validate, TraitError
from ipywidgets import register, widget_serialization

from regulus import HasTree
from .core.axis import  AxisTraitType
from .core.trait_types import TypedTuple
from .core.base import RegulusDOMWidget
import ipyregulus.utils as utils


@register
class GraphView(HasTree, RegulusDOMWidget):
    _model_name = Unicode('GraphModel').tag(sync=True)
    _view_name = Unicode('GraphView').tag(sync=True)

    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode().tag(sync=True)
    graph = Dict().tag(sync=True)
    show = List(Int()).tag(sync=True)

    def __init__(self, tree=None, **kwargs):
        super().__init__(**kwargs)
        self._dataset = None
        self._tree = None
        self.tree = tree

    # @HasTree.tree.getter
    # def tree(self):
    #     return self._tree
    #
    # @tree.setter
    # def tree(self, tree):
    #     if tree is None:
    #         self.axes = []
    #         self.graph = dict(pts=[], partitions=[])
    #         self._data = None
    #     elif isinstance(tree, HasTree):

    def update(self, tree):
        super().update(tree)
        if tree is None:
            self.axes = []
            self.graph = dict(pts=[], partitions=[])
            self._dataset = None
            return
        elif self._tree.regulus != self._dataset:
            dataset = self._dataset = self._tree.regulus
            nx = len(list(dataset.x))
            cy = list(dataset.pts.values).index(dataset.measure)
            self.axes = utils.create_axes(dataset.x, cols=range(nx)) + utils.create_axes(dataset.y, cols=[nx+cy])
            pts = dataset.pts_with_values
            pts = [dict(id=i, values=list(v)) for i, v in zip(pts.index, pts.values)]
        else:
            pts = self.graph.get('pts', None)
        partitions = self._get_partitions()
        self.graph = dict(pts=pts, partitions=partitions)

    def _get_partitions(self):
        partitions = []
        if self._tree is not None:
            for node in self.tree:
                p = node.data
                min_idx, max_idx = p.minmax_idx
                partitions.append(dict(
                    pid=p.id,
                    born=p.persistence,
                    die=node.parent.data.persistence,
                    size=p.size(),
                    min_idx=min_idx,
                    max_idx=max_idx,
                    index=p.idx,
                    base=p.base
                ))
        return partitions
