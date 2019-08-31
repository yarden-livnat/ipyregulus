# Copyright (c) University of Utah

from traitlets import Dict, Instance, List, Unicode
from ipywidgets import register, widget_serialization

from .core.axis import Axis, AxisTraitType
from .core.trait_types import InstanceDict, TypedTuple
from ipyregulus.core.base import RegulusDOMWidget


@register
class ProjView(RegulusDOMWidget):
    _model_name = Unicode('ProjModel').tag(sync=True)
    _view_name = Unicode('ProjView').tag(sync=True)

    pts = List([]).tag(sync=True)
    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    colors = List([]).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
