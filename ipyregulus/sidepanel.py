from ipywidgets import Output, register
from traitlets import Unicode
from ._version import EXTENSION_SPEC_VERSION

MODULE_NAME = "@regulus/ipyregulus"


@register
class SidePanel(Output):
    _model_name = Unicode('SidePanelModel').tag(sync=True)
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_name = Unicode('SidePanel').tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    title = Unicode('SidePanel').tag(sync=True)
    side = Unicode('split-right').tag(sync=True)
