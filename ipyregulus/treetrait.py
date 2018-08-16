from traitlets import TraitType
from regulus.topo import RegulusTree
from .tree import TreeWidget

class TreeTrait(TraitType):
    """A trait for a Regulus TreeWidget or a RegulusTree"""

    default_value = None
    info_text = 'a TreeWidgetor a RegulusTree'

    def validate(self, obj, value):
        if value is None:
            return None
        if isinstance(value, TreeWidget):
            return value
        if isinstance(value, RegulusTree):
            return TreeWidget(model=value)
        self.error(obj, value)
