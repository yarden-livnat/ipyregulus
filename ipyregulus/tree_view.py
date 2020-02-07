# Copyright (c) University of Utah

from traitlets import Bool, Dict, HasTraits, Instance, Int, List, Tuple, Unicode, observe, Set
from ipywidgets import HBox, VBox, IntRangeSlider, FloatRangeSlider
import ipywidgets as widgets

from . import BaseTreeView
from .filters import AttrFilter, Trigger, GroupUIFilter


class TreeView(VBox):

    attr_opts = List(Unicode(), ['span', 'fitness', 'parent_fitness', 'child_fitness', 'min', 'max'])
    attr = Unicode('fitness')
    x = Tuple((0, 100))
    y = Tuple((0, 1))

    def __init__(self, tree=None, auto=True, x=None, y=None, **kwargs):
        super().__init__(**kwargs)
        self._filters = {}
        self._treeview = None
        self._links = []
        self._group_filter = GroupUIFilter()
        self._trigger = Trigger(self._group_filter, func=self._apply_filter)
        self._filters = {}
        self._auto = auto
        self._auto_filter = None

        # setup controls
        self._ctrls = HBox()
        self._menu = widgets.Dropdown(
            options=self.attr_opts,
            description='Attribute:',
            value=self.attr,
            disabled=False,
        )
        self._x = IntRangeSlider(min=0, max = 100, value = (0, 100), description='Points:')
        self._y = FloatRangeSlider(min=0, max=1, value=(0,1), description='Persistence:', step=0.001)
        self._ctrls = HBox([self._menu, self._y, self._x])

        self._auto_filter = AttrFilter(attr=self._menu.value)
        if self._auto:
            self._group_filter.add(self._auto_filter, name='auto')
        widgets.link((self._menu, 'value'), (self, 'attr'))
        self.observe(self._auto_update, names=['attr'])

        # setup view
        self._treeview = BaseTreeView(None, attr=self.attr)
        self._treeview.show_attr = False
        self._links = [
            widgets.link((self, 'attr'), (self._treeview, 'attr')),
            widgets.link((self, 'x'), (self._x, 'value')),
            widgets.link((self, 'x'), (self._treeview, 'x')),
            widgets.link((self, 'y'), (self._y, 'value')),
            widgets.link((self, 'y'), (self._treeview, 'y'))
        ]
        self._update_children()

        if tree is not None:
            self.tree = tree
        if x is not None:
            self.x = x
        if y is not None:
            self.y = y


    def _apply_filter(self):
        if self.view is not None:
            self.view.set_show(self.view.tree.filter(self._group_filter))

    def _auto_update(self, change):
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
    def view(self):
        return self._treeview

    @property
    def tree(self):
        return self.view.owner

    @tree.setter
    def tree(self, tree):

        self.view.tree = tree
        reset = self._x.value[1] == self._x.max
        self._x.max = self.view.tree.regulus.pts.size()
        if reset:
            self._x.value = self._x.value[0], self._x.max

    @property
    def filters(self):
        return self._group_filter

    @filters.setter
    def filters(self, f):
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
        children = [self._ctrls, self._group_filter]

        if self.view is not None:
            children.insert(1, self._treeview)
        self.children = children

    def find_filter(self, name):
        return self._group_filter.find(name)

    def add_filter(self, *args, **kwargs):
        f = self._group_filter.add(*args, **kwargs)
        if self.tree and hasattr(f, 'update_range'):
            f.update_range(self.tree.tree)
        return f

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