# Copyright (c) University of Utah
from IPython.display import display
from traitlets import Bool, Dict, HasTraits, Instance, Int, List, Tuple, Unicode, observe, Set
from ipywidgets import HBox, VBox, IntRangeSlider, FloatRangeSlider
import ipywidgets as widgets

from . import BaseTreeView
from .filters import AttrFilter, Trigger, GroupUIFilter


class TreeView(BaseTreeView):

    options = List(Unicode(), ['span',
                                 'fitness', 'parent_fitness', 'child_fitness',
                                 'quad_fitness',
                                 'dim_parent_score', 'dim_child_score',
                                 'dim_min_fitness',  'dim_max_fitness',
                                 'min', 'max', 'unique_max', 'unique_min'
                                 ])
    # attr = Unicode('fitness')
    # x = Tuple((0, 100))
    # y = Tuple((0, 1))

    def __init__(self, tree=None, auto=True, x=None, y=None, **kwargs):
        super().__init__(**kwargs)
        self._filters = {}
        self.box = VBox()
        self._links = []
        self._group_filter = GroupUIFilter()
        self._trigger = Trigger(self._group_filter, func=self._apply_filter)
        self._filters = {}
        self._auto = auto
        self._auto_filter = None

        # setup controls
        self._ctrls = HBox()
        self._menu = widgets.Dropdown(
            options=self.options,
            description='Attribute:',
            value=self.attr,
            disabled=False,
        )
        self.x_slider = IntRangeSlider(min=0, max=1, value=(0, 1), description='Points:')
        self.y_slider = FloatRangeSlider(min=0, max=1, value=(0,1), description='Persistence:', step=0.001)
        self._ctrls = HBox([self._menu, self.y_slider, self.x_slider])

        self._auto_filter = AttrFilter(attr=self._menu.value)
        if self._auto:
            self._group_filter.add(self._auto_filter, name='auto')
        widgets.link((self, 'attr'), (self._menu, 'value'))
        self.observe(self._auto_update, names=['attr'])

        # setup view
        self._links = [
            widgets.link((self, 'x'), (self.x_slider, 'value')),
            widgets.link((self, 'y'), (self.y_slider, 'value')),
        ]
        self._update_children()

        if tree is not None:
            self.tree = tree
        if x is not None:
            self.x = x
        if y is not None:
            self.y = y

    def _apply_filter(self):
        if self.tree is not None:
            self.show = self.tree.filter(self._group_filter)

    def _auto_update(self, change):
        self._auto_filter.attr = self.attr
        self._auto_filter.update_range(self.tree)
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

    # @property
    # def view(self):
    #     return self._treeview
    #
    # @property
    # def tree(self):
    #     return self.view.owner
    #
    # @tree.setter
    # def tree(self, tree):
    #
    #     self.view.tree = tree
    #     reset = self.x_slider.value[1] == self.x_slider.max
    #     self.x_slider.max = self.view.tree.regulus.pts.size()
    #     if reset:
    #         self.x_slider.value = self.x_slider.value[0], self.x_slider.max

    @observe('tree')
    def tree_view_tree_changed(self, change):
        if self.tree is None:
            self.x_slider.value = (self.x_slider.min, self.x_slider.max)
        else:
            reset = self.x_slider.value[1] == self.x_slider.max
            self.x_slider.max = self.tree.regulus.pts.size()
            if reset:
                self.x_slider.value = self.x_slider.value[0], self.x_slider.max

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
    def opts(self):
        return self._menu.options

    @opts.setter
    def opts(self, opts):
        self._menu.options = opts

    def add_option(self, attr):
        if attr not in self.options:
            self.options = list(self.options) + [attr]
            # self.attr = attr

    def remove_attr(self, attr):
        if attr in self.options:
            opts = list(self.options)
            del opts[attr]
            self.options = options
            if self.attr == attr:
                self.attr = opts[0] if len(opts) > 0 else None

    def _update_children(self):
        children = [self._ctrls, self, self._group_filter]

        # if self.view is not None:
        #     children.insert(1, self._treeview)
        self.box.children = children

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

    def _ipython_display_(self, **kwargs):
        display(self.box)