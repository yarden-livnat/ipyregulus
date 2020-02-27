from traitlets import Instance, Int, List, Unicode, observe, validate
from ipywidgets import register, widget_serialization

from regulus import Mutable
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
    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    color = Unicode(None, allow_none=True).tag(sync=True)
    color_info = List((None, 0,1)).tag(sync=True)
    # colors = Any([]).tag(sync=True)

    def __init__(self, data=None, **kwargs):
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
