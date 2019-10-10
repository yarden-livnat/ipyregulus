from time import time
from traitlets import Instance, Int, List, Dict, Unicode, observe
from ipywidgets import register, widget_serialization


from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import TreeWidget

import numpy as np

# def convert(v):
#     if isinstance(v, dict):
#         return {k: convert(v) for k, v in v.items()}
#     if isinstance(v, (list, tuple)):
#         return [convert(v) for v in v]
#     if isinstance(v, np.ndarray):
#         if v.ndim == 1:
#             return {'buffer': memoryview(v),
#                     'dtype': str(v.dtype),
#                     'shape': v.shape}
#         else:
#             return v.tolist()
#     return v


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

    title = Unicode('title').tag(sync=True)

    data = Instance(klass=DataWidget).tag(sync=True, **widget_serialization)
    measure = Unicode(None, allow_none=True).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    show = List().tag(sync=True)
    highlight = Int(-2).tag(sync=True)
    inverse = Dict(allow_none=True).tag(sync=True)

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
        show = change['new']
        r = self.data.data
        if self.data is not None:
            pids = filter(lambda pid: pid not in self._inverse_cache, show)
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
