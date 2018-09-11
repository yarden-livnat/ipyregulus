from traitlets import Bool, HasTraits, Instance, Set, This
from regulus.topo import RegulusTree


class HasTree(HasTraits):
    tree = Instance(klass=RegulusTree, allow_none=True)
    _owner = This(allow_none=True)

    def __init__(self, tree=None):
        super().__init__()
        self.ref = tree

    @property
    def ref(self):
        return self.tree

    @ref.setter
    def ref(self, tree):
        if self._owner is not None:
            self._owner.unobserve(self.ref_tree_changed, names='tree')
        self.update(tree)


    def ref_tree_changed(self, change):
        self.update(self._owner)


    def update(self, tree):
        if isinstance(tree, RegulusTree):
            self._owner = None
            self.tree = tree
        elif isinstance(tree, HasTree):
            self._owner = tree
            self.tree = tree.tree
            self._owner.observe(self.ref_tree_changed, names='tree')
