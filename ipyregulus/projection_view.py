from traitlets import List, observe
from ipywidgets import register

from ipyregulus.utils import *
from .projection_widget import ProjectionWidget


@register
class ProjectionView(ProjectionWidget):
    show = List()

    def __init__(self, tree=None, **kwargs):
        super().__init__(**kwargs)
        self._tree = None
        self._color = ''
        self._index = []
        self._color_f = lambda w: []
        self.tree = tree

    @observe('show')
    def _show(self, change):
        value = change['new']
        if self.tree is not None and len(value) > 0:
            regulus = self.tree.regulus
            index = set()
            for partition in self.tree.find_partitions(value):
                index.update(partition.idx)
            self._index = index
            pts = self._pts.loc[index]
            self.pts = [list(v) for v in pts.values]
            self._computer_colors()
        else:
            self.pts = []

    @property
    def tree(self):
        return self._tree

    @tree.setter
    def tree(self, tree):
        self._tree = tree
        if tree is not None:
            data = tree.regulus
            self._pts = data.pts.x.merge(right=data.pts.values, how='left',
                                         left_index=True, right_index=True)
            y_col = len(list(data.pts.x)) + list(data.pts.values).index(data.measure)
            self.axes = create_axes(data.pts.x) + create_axes(data.y, [y_col])
            if self._color != '':
                self._computer_colors()

        else:
            self.axes = []
            self._pts = None
            self.pts = []

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, name):
        if isinstance(name, str):
            self._color = name
            self._color_f = self.color_by_name
        else:
            self._color_f = name
        self._computer_colors()

    def _computer_colors(self):
        self.colors = self._color_f(self)

    def color_by_name(self, w):
        cols = list(self._pts)
        col = cols.index(self._color)
        return [v[col] for v in self.pts]