"""
Common base widgets for ipyregulus widgets.
"""

from IPython.display import clear_output
from ipywidgets import Widget, DOMWidget, Output
from traitlets import Unicode
from ipyregulus._version import EXTENSION_SPEC_VERSION

MODULE_NAME = '@regulus/ipyregulus'


class RegulusWidget(Widget):
    """An abstract widget class representing regulus data widgets"""
    _model_module = Unicode(MODULE_NAME).tag(sync=True)
    _model_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_module = Unicode(MODULE_NAME).tag(sync=True)
    _view_module_version = Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.dispatch = dict()

    def on(self, attr, f, out=None):
        """Execute a function when this widget's attr changed

        To stop watching the attr use f=None
        The 'attr' parameter can include a point in which case the string before the point is the actual
        attribute name (e.g. 'show.foo' means to watch attribute 'show'). The full 'attr' is used as a key for the
        purpose of disconnecting the function. Only one function can be associated with a key. To associate multiple
        observers with the same attr provide unique key to each one. For example 'w.on('selected.foo', foo)'.
        """
        name, sep, rest = attr.partition('.')
        link = self.dispatch.pop(attr, None)
        if link is not None:
            self.unobserve(link, names=[name])
        if f is None:
            return

        if out is None:
            out = Output()

        def observer(change):
            if out:
                with out:
                    clear_output(wait=True)
                    f(change['new'])
            else:
                f(change['new'])
        self.observe(observer, names=[name])
        self.dispatch[attr] = observer
        return out


class RegulusDOMWidget(DOMWidget, RegulusWidget):
    """An abstract widget class representing regulus view widgets"""
    def __init__(self, *args, **kwargs):
        super().__init__(**kwargs)
