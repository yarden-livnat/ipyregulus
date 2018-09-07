
from .filters import Filter

class Monitor(Filter):
    def __init__(self, monitor=None, **kwargs):
        super().__init__(**kwargs)
        self._monitored = []
        self.monitor = monitor

    def __call__(self, *args):
        return self._disabled or self._func(self._monitored[0], *args)

    def _exec(self, change):
        print('exec', change)
        self()

    @property
    def monitor(self):
        return self._monitored

    @monitor.setter
    def monitor(self, obj):
        for m in self._monitored:
            # m.unregister(self._exec)
            m.unobserve(self._exec, names='changed')
        self._monitored = [obj] if not isinstance(obj, list) else obj
        for m in self._monitored:
            # m.register(self._exec)
            m.observe(self._exec, names='changed')
