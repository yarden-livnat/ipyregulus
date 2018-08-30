from traitlets import Bool, HasTraits, Instance, Set, This
from regulus.topo import RegulusTree

class HasTree(HasTraits):
    tree = Instance(klass=RegulusTree, allow_none=True)
    _ref = Instance(klass=RegulusTree, allow_none=True)
    _owner = This(allow_none=True)

    def __init__(self, tree=None):
        super().__init__()
        self.ref = tree

    @property
    def ref(self):
        return self._ref

    @ref.setter
    def ref(self, tree):
        if self._owner is not None:
            self._owner.unobserve(self.tree_changed, names='tree')
        if isinstance(tree, RegulusTree):
            self._ref = tree
            self._owner = None
        elif isinstance(tree, HasTree):
            self._owner = tree
            self._ref = self._owner.tree
            self._owner.observe(self.tree_changed, names='tree')
        self.ref_changed(None)

    def ref_changed(self, change):
        if change is not None:
            self._ref = change['new']
        self.update(None)

    def tree_changed(self, change):
        pass

    def update(self, change):
        self.tree = self._ref
