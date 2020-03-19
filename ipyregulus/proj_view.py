from time import time
import pandas as pd
from traitlets import Bool, Dict, Instance, Int, List, Unicode, observe, validate
from ipywidgets import register, widget_serialization

from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .core.axis import AxisTraitType
from .core.traittypes import  TypedTuple


@register
class ProjView(RegulusDOMWidget):
    _model_name = Unicode('ProjModel').tag(sync=True)
    _view_name = Unicode('ProjView').tag(sync=True)

    data = Instance(klass=DataWidget, allow_none=True).tag(sync=True, **widget_serialization)
    show = List(Int()).tag(sync=True)
    show_graph = Bool(True).tag(sync=True)
    show_pts = Bool(False).tag(sync=True)
    show_inverse = Bool(False).tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode(None, allow_none=True).tag(sync=True)
    color_info = List((None, 0,1)).tag(sync=True)
    # colors = Any([]).tag(sync=True)
    inverse = Dict(allow_none=True).tag(sync=True)

    def __init__(self, data=None, **kwargs):
        self._inverse_cache = set()
        super().__init__(**kwargs)
        if data is not None:
            self.data = data

    @validate('data')
    def _valid_value(self, proposal):
        data = proposal['value']
        if data is not None and not isinstance(data, DataWidget):
            data = DataWidget(data=data)
        return data

    @observe('color')
    def color_changed(self, _):
        if self.color is None or self.color is not '':
            self.color_info = (None, 0,1)
        if self.data is not None and self.data.data is not None:
            data = self.data.data
            if self.color in data.values:
                c = data.values[self.color]
                self.color_info = (list(data.values).index(self.color), c.min(), c.max())
            else:
                print('invalid color', self.color)

    def reset_inverse(self):
        self._inverse_cache.clear()
        self._show({'new': self.show})

    def _send_msg(self, pid, data):
        self.inverse = {pid: data}
        self.inverse = None

    @observe('show')
    def _show(self, change):
        self._update_inverse()

    @observe('show_inverse')
    def _show_inverse(self, change):
        self._update_inverse()

    def _update_inverse(self):
        r = self.data.data
        if self.show_inverse and self.data is not None:
            if not self.data.data.attr.has('inverse_regression'):
                return
            pids = filter(lambda pid: pid not in self._inverse_cache, self.show)
            msg = {}
            t0 = time()
            for node in r.find_nodes(pids):
                curve, std = r.attr['inverse_regression'][node]
                msg[node.id] = curve.reset_index().values.tolist()
                self._inverse_cache.add(node.id)
                if time() - t0 > 1:
                    self.inverse = msg
                    self.inverse = None
                    msg = {}
                    t0 = time()
            if len(msg) > 0:
                self.inverse = msg
                self.inverse = None

