# Copyright (c) University of Utah

from traitlets import Bool, Dict, HasTraits, Instance, Int, List, Tuple, Unicode, observe, Set
from ipywidgets import HBox, VBox
import ipywidgets as widgets

from regulus import Regulus, RegulusTree
from .tree import HasTree
from . import TreeView
from .filters import AttrFilter, Trigger, Filter


class AdvTreeView(VBox):

    attr_opts = List(['span', 'fitness', 'parent_fitness', 'child_fitness', 'min', 'max'])
    show_attr = Unicode('fitness')

    def __init__(self, tree=None, show='fitness'):
        super().__init__()
        self._filters = {}
        self._treeview = None
        self._attr_link = None
        self._filters = {}
        self._filter_box = VBox()
        self._auto = None

        self._menu = widgets.Dropdown(
            options=self.attr_opts,
            description='Attribute:',
            disabled=False,
        )

        if tree is not None:
            self.tree = tree

        f = AttrFilter(attr='')
        # self._auto = f
        self.add_filter('current', f=f)

        widgets.link((self._menu, 'value'), (self, 'show_attr'))
        widgets.link((self, 'show_attr'), (f, 'attr'))
        # self.observe(self._show_attr_changed, names=['show_attr'])

    def _show_attr_changed(self, change):
        print('show attr changed', change)
        if isinstance(change, str):
            return

        if self.show_attr in self._filters:
            children = list(self._filter_box.children)
            children[0] = self._filters[self.show_attr]
            self._filter_box.children = children
            # self._auto.disabled = True
        else:
            children = list(self._filter_box.children)
            children[0] = self._auto
            self._filter_box.children = children
            self._auto.disabled = False

    @property
    def treeview(self):
        return self._treeview

    @treeview.setter
    def treeview(self, tv):
        if self._attr_link is not None:
            self._attr_link.unlink()

        self._treeview = tv
        self._attr_link = widgets.link((self._treeview, 'attr'), (self, 'show_attr'))
        self._update_children()

    @property
    def tree(self):
        if self.treeview is not None:
            return self.treeview.owner
        return None

    @tree.setter
    def tree(self, tree):
        if not isinstance(tree, TreeView):
            if isinstance(tree, Regulus):
                tree = tree.tree

        self.treeview = TreeView(tree, attr=self.show_attr)

    def _update_children(self):
        children = [self._menu, self._filter_box]
        if self.treeview is not None:
            children.insert(1, self._treeview)
        self.children = children

    def add_filter(self, name, attr=None, f=lambda x,v: v < x):
        self.insert_filter(len(self._filters), name, attr, f)

    def insert_filter(self, idx, name, attr=None, f=lambda x,v: v < x):
        if attr is None:
            attr = name
        if name in self._filters:
            raise ValueError('filter already exist')

        if not isinstance(f, AttrFilter):
            if callable(f):
                f = AttrFilter(attr=attr, func=f)
            else:
                raise ValueError('f must be a function or an AttrFilter')
        triggers = [f]
        trigger = Trigger(triggers, func=lambda: self.treeview.set_show(self.treeview.tree.filter(f)))

        self._filters[name] = {'f': f, 'trigger': trigger}
        children = list(self._filter_box.children)
        children.insert(idx, f)
        self._filter_box.children = children

    def remove_filter(self, name):
        if name not in self._filters:
            raise(ValueError('unknown filter'))
        f, trigger = self._filters[name]
        del self._filters[name]
        trigger.clear()
        children = list(self._filter_box.children)
        children.remove(f)
        self._filter_box.children = children

