import logging

from time import time

import pandas as pd
from traitlets import Bool, Dict, Int, List, Unicode, observe
from ipywidgets import register, widget_serialization

from regulus import HasTree

from .core.axis import  AxisTraitType
from .core.trait_types import TypedTuple
from .core.base import RegulusDOMWidget
import ipyregulus.utils as utils

logger = logging.getLogger(__name__)


def convert(data, cy, scaler):
    def values(i):
        v = [0] * cy
        for c in range(cols):
            v[c] = data[c]['x'][i]
        if scaler is not None:
            v = list(scaler.transform([v])[0])
        v.append(data[0]['y'][i])
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
    selected = List((Int())).tag(sync=True)
    show_inverse = Bool(True).tag(sync=True)
    _add_inverse = Dict(allow_none=True).tag(sync=True)

    def __init__(self, tree=None, **kwargs):
        super().__init__(**kwargs)
        self._dataset = None
        self._tree = None
        self.tree = tree
        self._cache = set()
        self._msg = None
        self._show_inverse = True

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
            # nx = len(list(dataset.x))
            # cy = list(dataset.pts.values).index(dataset.measure)
            # self.axes = utils.create_axes(dataset.x, cols=range(nx)) + utils.create_axes(dataset.y, cols=[nx+cy])
            self.axes = utils.create_axes(dataset.y, cols=[0]) + \
                        utils.create_axes(dataset.x, cols=range(1,1+dataset.x.shape[1]))
            pts = pd.merge(left=dataset.y,
                           right=dataset.pts.original_x,
                           left_index=True,
                           right_index=True)
            pts = [dict(id=i, values=list(v)) for i, v in zip(pts.index, pts.values)]
            self.reset_inverse()
        else:
            pts = self.graph.get('pts', None)
        partitions = self._get_partitions()
        self.graph = dict(pts=pts, partitions=partitions)

    def reset_inverse(self):
        self._cache.clear()
        self._add_inverse = dict(topic='reset')
        self._show({'new': self.show})

    def _get_partitions(self):
        partitions = []
        if self._tree is not None:
            for node in self.tree:
                p = node.data
                min_idx, max_idx = p.minmax_idx
                base_born = self._dataset.partition(p.base).persistence
                is_selected = p.id in self.selected
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
                    base=p.base,
                    selected=is_selected
                ))
        return partitions

    @observe('show')
    def _show(self, change):
        show = change['new']
        logger.info('show')
        if self._tree is not None:
            if not self._tree.regulus.attr.has('inverse_regression'):
                return
            t_start = time()
            data = {}
            pids = filter(lambda pid: pid not in self._cache, show)
            t0 = time()
            for node in self._dataset.find_nodes(pids):
                curve, std = self._tree.attr['inverse_regression'][node]
                data[node.id] = curve.reset_index().values.tolist()

                self._cache.add(node.id)
                if time() - t0 > 0.5:
                    logger.debug(f'{time() - t0}')
                    # send partial data by assigning value and then set to None
                    self._add_inverse = dict(topic='add', data=data)
                    self._add_inverse = None
                    data = {}
                    t0 = time()
            if len(data) > 0:
                logger.debug(f'{time() - t0}')
                # send partial data by assigning value and then set to None
                self._add_inverse = dict(topic='add', data=data)
                self._add_inverse = None
            logger.debug(f'   total={time() - t_start}')

