import pandas as pd
from traitlets import Dict, Int, List, Unicode, observe, validate, TraitError
from ipywidgets import register, widget_serialization

from .core.axis import  AxisTraitType
from .core.trait_types import TypedTuple
from .core.base import RegulusDOMWidget
import ipyregulus.utils as utils


@register
class GraphView(RegulusDOMWidget):
    _model_name = Unicode('GraphModel').tag(sync=True)
    _view_name = Unicode('GraphView').tag(sync=True)

    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode().tag(sync=True)
    graph = Dict().tag(sync=True)

    show = List(Int())

    def __init__(self, tree=None, **kwargs):
        super().__init__(**kwargs)
        self._tree = None
        self.tree = tree

    @property
    def tree(self):
        return self._tree

    @tree.setter
    def tree(self, tree):
        self._tree = tree
        if tree is not None:
            regulus = tree.regulus
            nx = len(list(regulus.pts.x))
            cy = list(regulus.pts.values).index(regulus.measure)
            self.axes = utils.create_axes(regulus.pts.x, cols=range(nx)) + utils.create_axes(regulus.y, cols=[nx+cy])
        else:
            self.axes = []

    @observe('show')
    def _show(self, change):
        items = change['new']
        if self.tree is not None and len(items) > 0:
            data = self.tree.regulus
            partitions = []
            pts_idx = set()
            for node in self.tree:
                if node.data.id in items:
                    p = node.data
                    min_idx, max_idx = p.minmax_idx
                    partitions.append(dict(
                        pid=p.id,
                        born=p.persistence,
                        die=node.parent.data.persistence,
                        size=p.size(),
                        min_idx=min_idx,
                        max_idx=max_idx
                    ))
                    pts_idx.add(min_idx)
                    pts_idx.add(max_idx)

            pts = pd.merge(left=data.pts.x.loc[pts_idx],
                           right=data.pts.values.loc[pts_idx],
                           left_index=True,
                           right_index=True)
            pts = [dict(id=i, values=list(v)) for i, v in zip(pts.index, pts.values)]
        else:
            pts = []
            partitions = []
        self.graph = dict(pts=pts, partitions=partitions)





