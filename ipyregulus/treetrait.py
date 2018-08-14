from traitlets import TraitType
from regulus.tree import Tree
from .tree import TreeWidget

class TreeTrait(TraitType):
    """A trait for a Regulus TreeWidget or a Tree"""

    default_value = TreeWidget()
    info_text = 'a Tree or a TreeWidget'

    def validate(self, obj, value):
        if value is None:
            return TreeWidget()
        if isinstance(value, TreeWidget):
            return value
        if isinstance(value, Tree):
            return TreeWidget(root=value)
        self.error(obj, value)
