"""
    Regulus Data widget
"""

from traitlets import Instance, Int, List, Unicode, observe
from regulus import Regulus
from ipywidgets import register
from ipydatawidgets import DataUnion

import numpy as np

from ipyregulus.core.base import RegulusWidget


@register
class DataWidget(RegulusWidget):
    _model_name = Unicode('RegulusData').tag(sync=True)

    pts_loc = List().tag(sync=True)
    pts = DataUnion(np.zeros(0)).tag(sync=True)
    pts_idx = List().tag(sync=True)
    pts_extent = List().tag(sync=True)
    attrs = DataUnion(np.zeros(0)).tag(sync=True)
    attrs_idx = List().tag(sync=True)
    attrs_extent = List().tag(sync=True)
    partitions = List().tag(sync=True)
    measure = Unicode().tag(sync=True)
    version = Int(0).tag(sync=True)

    data = Instance(klass=Regulus, allow_none=True)

    def __init__(self, data=None, **kwargs):
        super().__init__(**kwargs)
        if data is not None:
            self.data = data

    @observe('data')
    def data_changed(self, change):
        data = self.data
        if data is not None:
            self.measure = data.measure
            self.pts_loc = data.pts_loc
            pts = data.pts
            original_x = pts.original_x
            self.pts = original_x
            self.pts_idx = list(pts.x.columns)
            self.pts_extent = list(zip(original_x.min(), original_x.max()))

            self.attrs = pts.values.values
            self.attrs_idx = list(pts.values.columns)
            self.attrs_extent = list(zip(pts.values.min(), pts.values.max()))

            self.partitions = [
                {
                    'id': p.id,
                    'persistence': p.persistence,
                    'pts_span': p.pts_span,
                    'minmax_idx': p.minmax_idx,
                    'max_merge': p.max_merge,
                    'extrema': p.extrema,
                    'x': None,
                    'y': None
                }
                for p in data.partitions()
            ]
        else:
            self.measure = ''
            self.pts = []
            self.attrs = []
            self.partitions = []
        self.version += 1
