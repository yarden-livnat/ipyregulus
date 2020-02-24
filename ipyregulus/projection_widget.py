# Copyright (c) University of Utah

import pandas as pd
from traitlets import Any, List, Unicode, validate, TraitError
from ipywidgets import register, widget_serialization

from .core.axis import Axis, AxisTraitType
from .core.traittypes import InstanceDict, TypedTuple
from ipyregulus.core.base import RegulusDOMWidget


@register
class ProjectionWidget(RegulusDOMWidget):
    _model_name = Unicode('ProjectionModel').tag(sync=True)
    _view_name = Unicode('ProjectionView').tag(sync=True)

    pts = List([]).tag(sync=True)
    axes = TypedTuple(trait=AxisTraitType()).tag(sync=True, **widget_serialization)
    colors = Any([]).tag(sync=True)

    @validate('colors')
    def _validate_colors(self, proposal):
        v = proposal['value']
        if isinstance(v, list):
            return v
        if isinstance(v, pd.Series):
            v = list(v)
            return v
        raise TraitError(f'value must be a list or pandas series [{type(v)}]')

