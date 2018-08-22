from .base import RegulusDOMWidget
from .tree import HasTree, TreeWidget

@register
class DetailsView(HasTree, RegulusDOMWidget):
    """"""
    _model_name = Unicode('DetailsViewModel').tag(sync=True)
    _view_name = Unicode('DetailsView').tag(sync=True)

    title = Unicode('title').tag(sync=True)

    selected = Set()
    
