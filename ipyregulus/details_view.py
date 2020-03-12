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
    show_model = Bool(True).tag(sync=True)
    show_inverse = Bool(True).tag(sync=True)
    inverse = Dict(allow_none=True).tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    cmap = Unicode('RdYlBu').tag(sync=True)
    color = Unicode('').tag(sync=True)
    show_info = Dict().tag(sync=True)
    local_norm = Bool(False).tag(sync=True)

    def __init__(self, data=None, **kwargs):
        self._inverse_cache = set()
        super().__init__(**kwargs)
        if data is not None:
            self.data = data

    def reset_inverse(self):
        self._inverse_cache.clear()
        self._show({'new': self.show})

    def _send_msg(self, pid, data):
        self.inverse = {pid: data}
        self.inverse = None

    def update_model(self):
        info = dict()
        if self.data is not None and self.data.data is not None:
            data = self.data.data
            nodes = data.find_nodes(self.show)
            for node in nodes:
                attr = data.attr['model'][node]
                info[node.id] = dict(intercept=attr.intercept_, coef=attr.coef_.tolist())
        self.show_info = info

    @observe('show')
    def _show(self, change):
        self.update_model()
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
        # if self.data is not None:
        #     self.data.unobserve(self._data_changed, names=['data'])

        data = proposal['value']
        if data is not None and not isinstance(data, DataWidget):
            data = DataWidget(data=data)

        # if data is not None:
        #     data.observe(self._data_changed, names=['data'])
        return data

    @observe('data')
    def _widget_changed(self, change):
        old = change['old']
        old_data = None
        if old is not None:
            old.unobserve(self._data_changed, names=['data'])
            old_data = old.data

        new_data = None
        if self.data:
            self.data.observe(self._data_changed, names=['data'])
            new_data = self.data.data

    def _data_changed(self, change):
        if not isinstance(change, dict):
            # print('bug? change object is a string')
            return

        old = change['old']
        if old is not None:
            old.unobserve(self._model_changed, names='state')

        new = change['new']
        if new is not None:
            self.color = new.measure
            new.observe(self._model_changed, names='state')
        self.reset_inverse()

    def _model_changed(self, change):
        op, name = change['new']
        if op == 'change' and name == 'model':
            self.update_model()

