from .filters import Filter


class Trigger(Filter):
    def __init__(self, monitor=None, **kwargs):
        super().__init__(**kwargs)
        self._monitored = []
        self.monitor = monitor

    def __call__(self):
        return self.disabled or self.func()

    def _exec(self, change):
        self()

    @property
    def monitor(self):
        return self._monitored

    @monitor.setter
    def monitor(self, obj):
        for m in self._monitored:
            m.unobserve(self._exec, names='changed')
        self._monitored = [obj] if not isinstance(obj, list) else obj
        for m in self._monitored:
            m.observe(self._exec, names='changed')

    def add(self, item):
        if item not in self._monitored:
            self._monitored.append(item)
            item.observe(self._exec, names='changed')

    def remove(self, item):
        if item in self._monitored:
            self._monitored.remove(item)
            item.unobserve(self._exec, names='changed')

    def clear(self):
        for item in self._monitored:
            item.unobserve(self._exec, names='changed')
        self._monitored = []