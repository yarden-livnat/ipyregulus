from traitlets import observe, validate
from ipywidgets import VBox, FloatSlider, link, dlink

from .core.axis import AxisTraitType
from .core.trait_types import TypedTuple


# def update_max(slider):
#     def update(change):
#         v = change['new']
#         if v > slider.max:
#             slider.max = v
#         slider.value = v
#     return update


class UnboundedFloatSlider(FloatSlider):
    @validate('value')
    def _validate_value(self, proposal):
        value = proposal['value']
        if value > self.max:
            self.max = value
        return value


class AxesCtrl(VBox):
    axes = TypedTuple(trait=AxisTraitType())

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.current = {}

    @observe('axes')
    def _axes(self, change):
        new = change['new']
        children = []
        sliders = {}
        for axis in new:
            name = axis.label
            if name in self.current:
                rec = self.current[name]
                slider = rec['slider']
                sliders[name] = rec
                del self.current[name]
            else:
                slider = UnboundedFloatSlider(value=axis.len, min=0, max=200)
                l1 = link((slider, 'value'), (axis, 'len'))
                l2 = link((axis, 'label'), (slider, 'description'))
                # axis.observe(self.update, names=['len'])
                sliders[name] = dict(slider=slider, links=[l1,l2], axis=axis)
            children.append(slider)
        # disconnect
        for rec in self.current.values():
            print('rec=', rec)
            # rec['axis'].unobserve(self.update, names=['len'])
            for l in rec.links:
                l.unlink()
        # set new values
        self.current = sliders
        self.children = children

    def update(self, change):
        value = change['new']
        owner = change['owner']
        slider = self.sliders[owner.label]['slider']
        if value > slider.max:
            slider.max = value
        slider.value = value

