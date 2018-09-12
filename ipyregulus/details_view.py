from traitlets import Instance, Int, List, Unicode
from ipydatawidgets import DataUnion
from ipywidgets import register, widget_serialization

import numpy as np

from .base import RegulusDOMWidget
from .data_widget import DataWidget
from .tree import HasTree, TreeWidget

@register
class DetailsView(RegulusDOMWidget):
    """"""
    _model_name = Unicode('DetailsModel').tag(sync=True)
    _view_name = Unicode('DetailsView').tag(sync=True)

    title = Unicode('title').tag(sync=True)

    data = Instance(klass=DataWidget).tag(sync=True, **widget_serialization)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    measure = Unicode('').tag(sync=True)
    show = List().tag(sync=True)
    highlight = Int(-2).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if 'data' in kwargs:
            self.measure = kwargs['data'].data.measure
