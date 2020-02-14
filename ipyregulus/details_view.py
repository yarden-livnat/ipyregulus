from time import time
from traitlets import Bool, Instance, Int, List, Dict, Unicode, observe
from ipywidgets import register, widget_serialization

from regulus import default_inverse_regression
from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import TreeWidget

import numpy as np

def convert(data):
    line = []
    for col in data:
        x = col['x']
        y = col['y']
        s = col['std']
        l = [[x[i], y[i], s[i]] for i in range(len(x))]
        line.append(l)
    return line


@register
class DetailsView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('DetailsModel').tag(sync=True)
    _view_name = Unicode('DetailsView').tag(sync=True)

    title = Unicode('').tag(sync=True)

    data = Instance(klass=DataWidget).tag(sync=True, **widget_serialization)
    measure = Unicode(None, allow_none=True).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    show = List().tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    show_inverse = Bool(True).tag(sync=True)
    inverse = Dict(allow_none=True).tag(sync=True)
    cmap = Unicode('RdYlBu').tag(sync=True)

    def __init__(self, **kwargs):
        self._inverse_cache = set()
        if 'data' in kwargs:
            data = kwargs['data']
            if not isinstance(data, DataWidget):
                data = DataWidget(data=data)
                kwargs['data'] = data
            if 'measure' not in kwargs:
                kwargs['measure'] = data.data.measure
        super().__init__(**kwargs)

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
                self.data.data.add_attr(default_inverse_regression, name='inverse_regression')
            pids = filter(lambda pid: pid not in self._inverse_cache, self.show)
            msg = {}
            t0 = time()
            for node in r.find_nodes(pids):
                line = r.attr['inverse_regression'][node]
                msg[node.id] = convert(line)
                self._inverse_cache.add(node.id)
                if time() - t0 > 1:
                    self.inverse = msg
                    self.inverse = None
                    msg = {}
                    t0 = time()
            if len(msg) > 0:
                self.inverse = msg
                self.inverse = None

    # @observe('data')
    # def _data_changed(self, change):
    #     if change['old'] is not None:
    #         if change['old'].data is not None:
    #
