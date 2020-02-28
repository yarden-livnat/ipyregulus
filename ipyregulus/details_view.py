from time import time
from traitlets import Bool, Instance, Int, List, Dict, Unicode, observe, validate
from ipywidgets import register, widget_serialization

from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import TreeWidget

import pandas as pd


@register
class DetailsView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('DetailsModel').tag(sync=True)
    _view_name = Unicode('DetailsView').tag(sync=True)

    title = Unicode('').tag(sync=True)

    data = Instance(klass=DataWidget, allow_none=True).tag(sync=True, **widget_serialization)
    measure = Unicode(None, allow_none=True).tag(sync=True)
    # tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    show = List().tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    show_inverse = Bool(True).tag(sync=True)
    inverse = Dict(allow_none=True).tag(sync=True)
    cmap = Unicode('RdYlBu').tag(sync=True)
    color = Unicode('').tag(sync=True)
    show_info = Dict().tag(sync=True)

    def __init__(self, data=None, **kwargs):
        self._inverse_cache = set()
        super().__init__(**kwargs)
        if data is not None:
            if not isinstance(data, DataWidget):
                data = DataWidget(data=data)
        self.data = data

    def reset_inverse(self):
        self._inverse_cache.clear()
        self._show({'new': self.show})

    def _send_msg(self, pid, data):
        self.inverse = {pid: data}
        self.inverse = None

    @observe('show')
    def _show(self, change):
        info = dict()
        if self.data is not None and self.data.data is not None:
            data = self.data.data
            nodes = data.find_nodes(self.show)
            max_coef = 0
            for node in nodes:
                info[node.id] = data.attr['linear'][node].coef_
                max_coef = max(max_coef, max(abs(info[node.id])))
            for id in info.keys():
                info[id] = (info[id]/max_coef).tolist()

        self.show_info = info
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
                msg[node.id] = [pd.DataFrame({col: curve[col], 'std': std[col]}).reset_index().values.tolist()
                                for col in curve.columns]
                self._inverse_cache.add(node.id)
                if time() - t0 > 1:
                    self.inverse = msg
                    self.inverse = None
                    msg = {}
                    t0 = time()
            if len(msg) > 0:
                self.inverse = msg
                self.inverse = None

    @validate('data')
    def _valid_value(self, proposal):
        if self.data is not None:
            self.data.unobserve(self._data_changed, names=['data'])

        data = proposal['value']
        if data is not None and not isinstance(data, DataWidget):
            data = DataWidget(data=data)

        if data is not None:
            data.observe(self._data_changed, names=['data'])
        return data

    @observe('data')
    def _datasrc_changed(self, change):
        old = change['old']
        if old is not None:
            old.unobserve(self._data_changed, names='data')

        if self.data:
            self.data.observe(self._data_changed, names='data')
            self._data_changed()

    def _data_changed(self, change=None):
        if self.data.data:
            self.color = self.data.data.measure
        self._inverse_cache.clear()

