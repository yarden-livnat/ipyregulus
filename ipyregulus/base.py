"""
Common base widgets for ipyregulus widgets.
"""

from ipywidgets import Widget, DOMWidget
from traitlets import Unicode
from ._version import EXTENSION_SPEC_VERSION

MODULE_NAME = '@regulus/ipyregulus'


class RegulusWidget(Widget):
    """An abstract widget class representing regulus data widgets"""
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)


class RegulusDOMWidget(DOMWidget, RegulusWidget):
    """An abstract widget class representing regulus view widgets"""
    def __init__(self, *args, **kwargs):
        super().__init__(**kwargs)
