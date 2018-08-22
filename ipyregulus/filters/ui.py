from ipywidgets import ValueWidget, Widget
from ipywidgets import CallbackDispatcher
from ipywidgets import FloatSlider

class Filter(object):
    def __init__(self, func=None, disabled=False):
        self._disabled = disabled
        self._func = func
        self._dispatcher = CallbackDispatcher()

    def __call__(self, *args, **kwargs):
        return self._disabled or self._func(*args, **kwargs)

    def _notify(self):
        self._dispatcher()

    @property
    def func(self):
        return self._func

    @func.setter
    def func(self, f):
        if f != self._func:
            self._func = f
            self._notify()

    @property
    def disabled(self):
        return self._disabled

    @disabled.setter
    def disabled(self, value):
        if value != self._disabled:
            self._disabled = value;
            self._notify()

    def register(self, cb):
        self._dispatcher.register_callback(cb)

    def unregister(self, cb):
        self._dispatcher.register_callback(cb, remove=True)


class UIFilter(Filter):
    def __init__(self, ui=None, **kwargs):
        super().__init__(**kwargs)
        self._ui = None
        if ui is None:
            ui = FloatSlider(min=0, max=1, step=0.01, value=0.5)
        self.ui = ui


    def __call__(self, *args, **kwargs):
        return self._disabled or self._func(self.value, *args, **kwargs)

    @property
    def ui(self):
        return self._ui

    @ui.setter
    def ui(self, widget):
        prev = self._ui
        if widget is None:
            self._ui = None
            self._disabled = True
        elif isinstance(widget, Widget):
            widget.observe(self._value_changed, names='value')
            self._ui = widget
            self._disabled = False
        else:
            raise(Exception('UI must be an ipywidget or None:', type(widget)))

        if prev is not None:
            prev.unobserve(self.update)
        self._notify()

    @property
    def value(self):
        return self._ui.value

    @value.setter
    def value(self, value):
        self._ui.value = value

    def _value_changed(self, change):
        # self.value = change['new']
        self._notify()

    def _ipython_display_(self, **kwargs):
        display(self._ui)
        # display(HBox([self.label, self.widget]))
