from traitlets import Instance, List, Unicode, observe
from ipywidgets import register, widget_serialization

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
        self.tree = tree

    @observe('show')
    def _show(self, change):
        value = change['new']
        if self.tree is not None and len(value) > 0:
            regulus = self.tree.regulus
            loc = regulus.pts_loc
            index = set()
            for partition in regulus.get_partitions(value):
                index.update(partition.idx)
            self._index = index
            pts = self._pts.loc[index]
            self.pts = [list(v) for v in pts.values]

        else:
            self.pts = []

    @property
    def tree(self):
        return self._tree

    @tree.setter
    def tree(self, tree):
        self._tree = tree
        if tree is not None:
            regulus = tree.regulus
            self._pts = regulus.pts.x.merge(right=regulus.pts.values, how='left',
                                            left_index=True, right_index=True)
            self.axes = create_axes(regulus.pts.x) + create_axes(regulus.y, [len(regulus.pts.x)])
            if self._color != '':
                self.color = self._color
        else:
            self.axes = []
            self._pts = None
            self.pts = []

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, name):
        # self.colors = self._pts[value].iloc[list(self._index)]
        self._color = name
        cols = list(self._pts)
        if name in cols:
            self.colors = [v[cols.index(name)] for v in self.pts]
        else:
            self.colors = []

