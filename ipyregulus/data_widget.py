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

    # pts = Instance(NDArrayWidget(np.zeros(0))).tag(sync=True, **array_serialization)
    pts = DataUnion(np.zeros(0)).tag(sync=True)
    pts_idx = List().tag(sync=True)
    # values = NDArray(np.zeros(0)).tag(sync=True,  **array_serialization)
    values = DataUnion(np.zeros(0)).tag(sync=True)
    values_idx = List().tag(sync=True)
    partitions = Dict().tag(sync=True)

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
            pts = regulus.pts
            self.pts = pts.x.values
            self.pts_idx = list(pts.x.columns)
            self.values = pts.values.values
            self.values_idx = list(pts.values.columns)
            self.partitions = {
                p.id: {
                    'id': p.id,
                    'persistence': p.persistence,
                    'pts_span': p.pts_span,
                    'minmax_idx': p.minmax_idx,
                    'max_merge': p.max_merge,
                    'x': None,
                    'y': None
                }
                for p in regulus.partitions()
            }
        else:
            self.pts = []
            self.values = []
            self.partitions = []
