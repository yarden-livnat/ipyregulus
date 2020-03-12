from math import pi
import pandas as pd
from traitlets import  Instance, observe, validate
from ipywidgets import Checkbox, GridBox, FloatSlider,link, dlink, Layout
from .core.haslinks import HasLinks

from .core.axis import Axis, AxisTraitType
from .core.traittypes import TypedTuple
from .data_widget import DataWidget


class UnboundedFloatSlider(FloatSlider):
    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        if value > self.max:
            self.max = value
        return value


def invert(s, axis):
    def f(change):
        disabled = not change['new']
        s.disabled = disabled
        axis.disabled = disabled
    return f


class AxesCtrl(GridBox, HasLinks):
    axes = TypedTuple(trait=AxisTraitType())
    data = Instance(klass=DataWidget, default_value=None, allow_none=True)

    def __init__(self, data=data, **kwargs):
        super().__init__(**kwargs)
        self.layout = Layout(grid_template_columns='100px auto', grid_gap='5px')
        self.current = {}
        if data is not None:
            self.data = data

    @observe('axes')
    def _axes(self, change):
        axes = change['new']
        children = []
        sliders = {}
        for axis in axes:
            name = axis.label
            check = Checkbox(value=True, indent=False)
            check.style.width = '100%'
            cl = link((axis, 'label'), (check, 'description'))

            slider = UnboundedFloatSlider(value=axis.len, min=0, max=200)
            sl = link((slider, 'value'), (axis, 'len'))

            check.observe(invert(slider, axis), names='value')
            children.append(check)
            children.append(slider)

        self.children = children

    @observe('data')
    def data_changed(self, change):
        old = change['old']
        if old is not None:
            old.unobserve(self.update_axes, names='data')

        new = change['new']
        if new is not None:
            new.observe(self.update_axes, names='data')

        self.update_axes()

    def update_axes(self, change=None):
        if self.data is not None and self.data.data is not None:
            dataset = self.data.data
            axes = self.create_axes(dataset.y, cols=[0]) + \
                   self.create_axes(dataset.pts.original_x, cols=range(1, 1 + dataset.x.shape[1]))
            n = len(axes)
            for i in range(n):
                axes[i].theta = -pi / 2 + 2 * pi * i / n
            self.axes = axes

    def create_axes(self, pts, cols=None):
        axes = []
        if cols is None:
            cols = list(range(len(list(pts))))
        elif isinstance(cols, int):
            cols = [cols]

        if isinstance(pts, pd.DataFrame):
            axes = [Axis(label=l, col=c) for l, c in zip(list(pts), cols)]
        elif isinstance(pts, pd.Series):
            axes = [Axis(label=pts.name, col=0)]
        else:
            raise ValueError('pts must be Pandas DataFrame or Series')
        return axes


