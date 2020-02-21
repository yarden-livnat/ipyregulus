from traitlets import observe, validate
from ipywidgets import Checkbox, GridBox, HBox,  VBox, FloatSlider, link, dlink, Layout

from .core.axis import AxisTraitType
from .core.trait_types import TypedTuple


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

class AxesCtrl(GridBox):
    axes = TypedTuple(trait=AxisTraitType())

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = Layout(grid_template_columns='50px auto', grid_gap='5px')
        self.current = {}

    @observe('axes')
    def _axes(self, change):
        axes = change['new']
        children = []
        sliders = {}
        for axis in axes:
            name = axis.label
            check = Checkbox(value=True, indent=False)
            cl = link((axis, 'label'), (check, 'description'))

            slider = UnboundedFloatSlider(value=axis.len, min=0, max=200)
            sl = link((slider, 'value'), (axis, 'len'))

            check.observe(invert(slider, axis), names='value')
            children.append(check)
            children.append(slider)

        self.children = children

    # @observe('axes')
    # def _axes(self, change):
    #     new = change['new']
    #     children = []
    #     sliders = {}
    #     for axis in new:
    #         name = axis.label
    #         if name in self.current:
    #             rec = self.current[name]
    #             slider = rec['slider']
    #             sliders[name] = rec
    #             del self.current[name]
    #         else:
    #             slider = UnboundedFloatSlider(value=axis.len, min=0, max=200)
    #             l1 = link((slider, 'value'), (axis, 'len'))
    #             l2 = link((axis, 'label'), (slider, 'description'))
    #             # axis.observe(self.update, names=['len'])
    #             check = Checkbox(value=False)
    #             l3 = link((check, 'value'), (slider, 'disabled'))
    #             box = HBox(children=[check, slider])
    #             sliders[name] = dict(slider=slider, links=[l1, l2, l3], axis=axis)
    #         children.append(box)
    #     # disconnect
    #     for rec in self.current.values():
    #         for l in rec.links:
    #             l.unlink()
    #     # set new values
    #     self.current = sliders
    #     self.children = children

    def update(self, change):
        value = change['new']
        owner = change['owner']
        slider = self.sliders[owner.label]['slider']
        if value > slider.max:
            slider.max = value
        slider.value = value

