"""
    Regulus Data widget
"""

from traitlets import Dict, Instance, Unicode, Undefined, validate
from ipywidgets import register, widget_serialization
from ipydatawidgets import DataUnion

import numpy as np

from regulus.data import Data
from regulus.topo import Regulus

from .base import RegulusWidget

@register
class DataWidget(RegulusWidget):
    _model_name = Unicode('RegulusData').tag(sync=True)

    pts = DataUnion(np.zeros(0)).tag(sync=True)
    values = DataUnion(np.zeros(0)).tag(sync=True)
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
        if regulus is not None:
            self.pts = regulus.pts.x
            self.values = regulus.pts.values
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
