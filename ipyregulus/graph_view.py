from time import time
import pandas as pd
from traitlets import Dict, Int, List, Unicode, observe, validate, TraitError
from ipywidgets import register, widget_serialization

from regulus import HasTree
from .core.axis import  AxisTraitType
from .core.trait_types import TypedTuple
from .core.base import RegulusDOMWidget
import ipyregulus.utils as utils


def convert(data, cy):
    def values(i):
        v = [0] * (cy+1)
        for c in range(cols):
            v[c] = data[c]['x'][i]
        v[cy] = data[0]['y'][i]
        return v

    cols = len(data)
    n = len(data[0]['x'])
    line = [dict(id=i, values=values(i)) for i in range(n)]
    return line


@register
class GraphView(HasTree, RegulusDOMWidget):
    _model_name = Unicode('GraphModel').tag(sync=True)
    _view_name = Unicode('GraphView').tag(sync=True)

    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode().tag(sync=True)
    graph = Dict().tag(sync=True)
    show = List(Int()).tag(sync=True)
    highlight = Int(-1).tag(sync=True)
    _add_inverse = Dict(allow_none=True).tag(sync=True)

    def __init__(self, tree=None, **kwargs):
        super().__init__(**kwargs)
        self._dataset = None
        self._tree = None
        self.tree = tree
        self._cache = set()
        self._msg = None

    def update(self, tree):
        super().update(tree)
        if tree is None:
            self.axes = []
            self.graph = dict(pts=[], partitions=[])
            self._dataset = None
            self._cache = set()
            return
        elif self._tree.regulus != self._dataset:
            dataset = self._dataset = self._tree.regulus
            nx = len(list(dataset.x))
            cy = list(dataset.pts.values).index(dataset.measure)
            self.axes = utils.create_axes(dataset.x, cols=range(nx)) + utils.create_axes(dataset.y, cols=[nx+cy])
            pts = pd.merge(left=dataset.pts.original_x,
                           right=dataset.pts.values,
                           left_index=True,
                           right_index=True)
            pts = [dict(id=i, values=list(v)) for i, v in zip(pts.index, pts.values)]
            self._cache = set()
            if len(self.show) > 0:
                self._show({'new': self.show})
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
                base_born = self._dataset.partition(p.base).persistence
                partitions.append(dict(
                    pid=p.id,
                    base_born=base_born,
                    born=p.persistence,
                    die=node.parent.data.persistence,
                    life=node.parent.data.persistence-base_born,
                    size=p.size(),
                    min_idx=min_idx,
                    max_idx=max_idx,
                    index=p.idx,
                    base=p.base
                ))
        return partitions

    @observe('show')
    def _show(self, change):
        show = change['new']
        if self._tree is not None:
            cy = len(list(self._dataset.x)) + list(self._dataset.values).index(self._dataset.measure)
            msg = {}
            pids = filter(lambda pid: pid not in self._cache, show)
            t0 = time()
            for node in self._dataset.find_nodes(pids):
                line = self._tree.attr['inverse_regression_scale'][node]
                msg[node.id] = convert(line, cy)
                self._cache.add(node.id)
                if time() - t0 > 0.5:
                    self._add_inverse = msg
                    self._add_inverse = None
                    msg = {}
                    t0 = time()
            if len(msg) > 0:
                self._add_inverse = msg
                self._add_inverse = None

