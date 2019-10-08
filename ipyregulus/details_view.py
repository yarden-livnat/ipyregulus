from traitlets import Instance, Int, List, Dict, Unicode, observe
from ipywidgets import register, widget_serialization


from ipyregulus.core.base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import TreeWidget


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
        self._check = None
        if 'data' in kwargs:
            data = kwargs['data']
            if not isinstance(data, DataWidget):
                data = DataWidget(data=data)
                kwargs['data'] = data
            if 'measure' not in kwargs:
                kwargs['measure'] = data.data.measure
        super().__init__(**kwargs)

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
            for node in r.find_nodes(pids):
                line = r.attr['inverse_regression_scale'][node]
                msg[node.id] = [{
                    'x': [v for v in line['x'][i]],
                    'y': line['y'][i],
                    'std': [v for v in line['std'][i]]
                 } for i in range(len(line['x']))]
                self._inverse_cache.add(node.id)
            self.inverse = msg
            self.inverse = None
            self._check = msg
