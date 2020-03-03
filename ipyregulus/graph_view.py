import logging

from time import time

import pandas as pd
from traitlets import Bool, Dict, Int, List, Unicode, observe
from ipywidgets import register, widget_serialization

from regulus import HasTree

from .core.axis import  AxisTraitType
from .core.traittypes import TypedTuple
from .core.base import RegulusDOMWidget

logger = logging.getLogger(__name__)


@register
class GraphView(RegulusDOMWidget, HasTree):
    _model_name = Unicode('GraphModel').tag(sync=True)
    _view_name = Unicode('GraphView').tag(sync=True)

    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode().tag(sync=True)
    graph = Dict().tag(sync=True)
    show = List(Int()).tag(sync=True)
    highlight = Int(-1).tag(sync=True)
    selected = List((Int())).tag(sync=True)
    show_inverse = Bool(False).tag(sync=True)
    _add_inverse = Dict(allow_none=True).tag(sync=True)

    def __init__(self, src=None, **kwargs):
        super(HasTree, self).__init__(**kwargs)
        super(RegulusDOMWidget, self).__init__()
        self._dataset = None
        self._cache = set()
        if src is not None:
            self.src = src

    @observe('tree')
    def update(self, change):
        tree = change['new']
        if tree is None:
            self.axes = []
            self.graph = dict(pts=[], partitions=[])
            self._dataset = None
            self._cache = set()
            return

        if tree != self._dataset:
            dataset = self._dataset = tree.regulus
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
        if self.tree is not None:
            for node in self.tree:
                p = node.data
                if p.id < 0:
                    continue
                min_idx, max_idx = p.minmax_idx
                base_born = 0
                if p.base is not None:
                    base = self._dataset.partition(p.base)
                    if base is not None:
                        base_born = base.persistence

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
        if self.tree is not None:
            scaler = self.tree.regulus.scaler
            if not self.tree.regulus.attr.has('inverse_regression'):
                return
            t_start = time()
            data = {}
            pids = filter(lambda pid: pid not in self._cache, show)
            t0 = time()
            for node in self._dataset.find_nodes(pids):
                curve, std = self.tree.attr['inverse_regression'][node]
                line =  pd.DataFrame(scaler.transform(curve, copy=True), index=curve.index, columns=curve.columns)
                data[node.id] = line.reset_index().values.tolist()

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

