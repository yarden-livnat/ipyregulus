from traitlets import Instance, Int, List, Unicode
from ipywidgets import register, widget_serialization


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
    measure = Unicode(None, allow_none=True).tag(sync=True)
    tree_model = Instance(klass=TreeWidget, allow_none=True).tag(sync=True, **widget_serialization)
    show = List().tag(sync=True)
    highlight = Int(-2).tag(sync=True)

    def __init__(self, **kwargs):
        if 'data' in kwargs:
            data = kwargs['data']
            if not isinstance(data, DataWidget):
                data = DataWidget(data=data)
                kwargs['data'] = data
            if 'measure' not in kwargs:
                kwargs['measure'] = data.data.measure
        super().__init__(**kwargs)
