from ipywidgets import register
from traitlets import Bool, Float, Instance, Int, Unicode

from .base import RegulusWidget


@register
class Axis(RegulusWidget):
    _model_name = Unicode('AxisModel').tag(sync=True)

    label = Unicode('').tag(sync=True)
    col = Int(-1).tag(sync=True)
    theta = Float(0).tag(sync=True)
    len = Float(200).tag(sync=True)
    disabled = Bool(False).tag(sync=True)


class AxisTraitType(Instance):
    klass = Axis

    def validate(self, obj, value):
        if isinstance(value, dict):
            return super().validate(obj, self.klass(**value))
        else:
            return super().validate(obj, value)
