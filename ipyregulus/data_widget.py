"""
    Regulus Data widget
"""

from traitlets import Dict, Instance, List, Unicode, Undefined, validate
from ipywidgets import register, widget_serialization
from ipydatawidgets import DataUnion, NDArray, array_serialization,  data_union_serialization

import numpy as np

from regulus.data import Data
from regulus.topo import Regulus

from .base import RegulusWidget


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
    # scaler = Dict().tag(sync=True)

    _data = None

    def __init__(self, data=None):
        super().__init__()
        if data is not None:
            self.data = data

    @property
    def data(self):
        return self._data

    @data.setter
    def data(self, regulus):
        self._data = regulus
        if regulus is not None:
            self.measure = regulus.measure
            self.pts_loc = regulus.pts_loc
            pts = regulus.pts
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
                    'x': None,
                    'y': None
                }
                for p in regulus.partitions()
            ]
            # self.scaler = {
            #     "scale": regulus.scaler.scale_.tolist(),
            #     "mean": regulus.scaler.mean_.tolist(),
            #     "var": regulus.scaler.var_.tolist(),
            #     "n": regulus.scaler.n_samples_seen_
            # }
        else:
            self.measure = ''
            self.pts = []
            self.attrs = []
            self.partitions = []
