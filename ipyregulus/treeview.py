# Copyright (c) University of Utah

from traitlets import Bool, Dict, HasTraits, Instance, Int, List, Tuple, Unicode, observe, Set
from ipywidgets import HBox, VBox
import ipywidgets as widgets

from regulus import Regulus
from . import BaseTreeView
from .filters import AttrFilter, Trigger, GroupFilter


class TreeView(VBox):

    attr_opts = List(['span', 'fitness', 'parent_fitness', 'child_fitness', 'min', 'max'])
    attr = Unicode('fitness')

    def __init__(self, tree=None, auto=True, **kwargs):
        super().__init__()
        self._filters = {}
        self._treeview = None
        self._attr_link = None
        self._group_filter = GroupFilter()
        self._trigger = Trigger(self._group_filter, func=self._apply_filter)
        self._filters = {}
        self._auto = auto
        self._auto_filter = None

        self._menu = widgets.Dropdown(
            options=self.attr_opts,
            description='Attribute:',
            value=self.attr,
            disabled=False,
        )

        self._auto_filter = AttrFilter(attr=self._menu.value)
        if self._auto:
            self._group_filter.add(self._auto_filter, name='auto')

        widgets.link((self._menu, 'value'), (self, 'attr'))
        self.observe(self._attr_changed, names=['attr'])
        if tree is not None:
            self.tree = tree

    def _apply_filter(self):
        if self.treeview is not None:
            self.treeview.set_show(self.treeview.tree.filter(self._group_filter))

    def _attr_changed(self, change):
        self._auto_filter.attr = self.attr
        if self.tree is not None:
            self._auto_filter.update_range(self.tree.tree)
        # if self.attr in self._filters:
        #     children = list(self._filter_box.children)
        #     children[0] = self._filters[self.attr]
        #     self._filter_box.children = children
        #     # self._auto.disabled = True
        # else:
        #     children = list(self._filter_box.children)
        #     children[0] = self._auto
        #     self._filter_box.children = children
        #     self._auto.disabled = False

    @property
    def treeview(self):
        return self._treeview

    @treeview.setter
    def treeview(self, tv):
        if self._attr_link is not None:
            self._attr_link.unlink()

        self._treeview = tv
        self._attr_link = widgets.link((self, 'attr'), (self._treeview, 'attr'))
        self._update_children()

    @property
    def tree(self):
        if self.treeview is not None:
            return self.treeview.owner
        return None

    @tree.setter
    def tree(self, tree):
        if not isinstance(tree, BaseTreeView):
            if isinstance(tree, Regulus):
                tree = tree.tree

        self.treeview = BaseTreeView(tree, attr=self.attr)

    @property
    def filter(self):
        return self._group_filter

    @filter.setter
    def filter(self, f):
        if f == self._group_filter:
            return

        self._trigger.remove(self._group_filter)
        self._group_filter = f
        if self._auto:
            self._group_filter.insert(0, self._auto_filter, name='auto')
        self._trigger.add(self._group_filter)

        self._update_children()

    @property
    def attrs(self):
        return self._menu.options

    @attrs.setter
    def attrs(self, attrs):
        self._menu.options = attrs

    def add_attr(self, attr):
        if attr not in self.attrs:
            self.attrs = list(self.attrs) + [attr]
            self.attr = attr

    def remove_attr(self, attr):
        if attr in self.attrs:
            attrs = list(self.attrs)
            del attrs[attr]
            self.attrs = attrs
            if self.attr == attr:
                self.attr = attrs[0] if len(attr) > 0 else None

    def _update_children(self):
        children = [self._menu, self._group_filter]

        if self.treeview is not None:
            children.insert(1, self._treeview)
        self.children = children

    def add_filter(self, *args, **kwargs):
        f = self._group_filter.add(*args, **kwargs)
        if self.tree and hasattr(f, 'update_range'):
            f.update_range(self.tree.tree)

    def insert_filter(self, idx, *args, **kwargs):
        f = self._group_filter.insert(idx, *args, **kwargs)
        if self.tree and hasattr(f, 'update_range'):
            f.update_range(self.tree.tree)

    def remove_filter(self, item):
        self._group_filter.remove(item)

    @property
    def auto(self):
        return self._auto

    @auto.setter
    def auto(self, value):
        if value != self._auto:
            self._auto = value
            if self._auto:
                self._group_filter.insert(0, self._auto_filter)
            else:
                self._group_filter.remove(self._auto_filter)