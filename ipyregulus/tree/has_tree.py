from traitlets import Bool, HasTraits, Instance, Set, This
from regulus.topo import RegulusTree

class HasTreeBase(HasTraits):
    tree = Instance(klass=RegulusTree, allow_none=True)



class HasTree(HasTreeBase):
    # _ref = Instance(klass=RegulusTree, allow_none=True)
    _owner = This(allow_none=True)

    def __init__(self, tree=None):
        super().__init__()
        # self.ref = tree

    @property
    def tree(self):
        return super().tree

    @tree.setter
    def tree(self, tree):
        if self._owner is not None:
            self._owner.unobserve(self.tree_changed, names='tree')
        if isinstance(tree, RegulusTree):
            self._owner = None
            self.update(tree)
        elif isinstance(tree, HasTree):
            self._owner = tree
            self.update(tree.tree)
            self._owner.observe(self.owner_tree_updated, names='tree')

    def owner_tree_updated(self, change):
        self.update(self._owner.tree)

    def update(self, tree):
        super().tree = tree
