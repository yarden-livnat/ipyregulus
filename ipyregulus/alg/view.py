from ipyregulus.tree import HasTree, TreeWidget
from ipyregulus.filters.filters import AttrFilter
from ipyregulus.filters.trigger import Trigger
from ipyregulus import TreeView
from sidepanel import sidepanel, SidePanel


class View(object):
    def __init__(self, view, monitor, filter, panel):
        self.view = view
        self.monitor = monitor
        self._filter = None
        self.panel = panel
        self.filter = filter
        self._auto = False

    @property
    def filter(self):
        return self._filter

    @filter.setter
    def filter(self, f):
        if self._filter is not None:
            self.monitor.remove(self.filter)
        self.monitor.add(f)
        self._filter = f
        view = self.view
        self.monitor.func = lambda: view.set_show(view.tree.filter(f))

    @property
    def attr(self):
        attrs = [self.view.attr, self.filter.attr]
        if attrs[0] == attrs[1]:
            return attrs[0]
        return attrs

    @attr.setter
    def attr(self, v):
        if isinstance(v, str):
            v = [v, v]
        self.view.attr = v[0]
        if self.filter.attr != v[1]:
            self.filter.attr = v[1]
            self.update_filter()

    @property
    def tree(self):
        return self.view.owner

    @property
    def auto(self):
        return self._auto

    @auto.setter
    def auto(self, value):
        if value != self._auto:
            self._auto = value
            if self._auto:
                self.update_filter()

    def update_filter(self):
        pass


def reduce_tree(src, f, dest=None):
    monitored = [f]
    if dest is None:
        dest = TreeWidget(src)
    if isinstance(src, HasTree):
        monitored.append(src)
        src = src.tree
    trigger = Trigger(monitored, func=lambda: dest.set(src.reduce(f)))
    return trigger, dest


def show_reduce(src, f=None, func=lambda x, v: v <= x, dest=None, view=None, attr='span', panel=False):
    show_f = f is None
    if f is None:
        f = AttrFilter(attr=attr, func=func)
    _, dest = reduce_tree(src, f, dest)
    if view is None:
        view = TreeView(dest, attr=attr)
    monitored = [f]
    if isinstance(src, HasTree):
        monitored.append(src)
    trigger = Trigger(monitored, func=lambda: view.set_show(view.tree))
    views = view if not show_f else [view, f]
    panel = show_panel(views, panel)
    return View(view, trigger, f, panel)


def show_tree(src, f=None, func=lambda x, v: v <= x, view=None, attr='span', panel=False, **kwargs):
    show_f = f is None
    if f is None:
        f = AttrFilter(attr=attr, func=func)
    if view is None:
        view = TreeView(src, attr=attr, **kwargs)
    monitored = [f, src] if isinstance(src, HasTree) else [f]
    m = Trigger(monitored, func=lambda: view.set_show(view.tree.filter(f)))
    views = view if not show_f else [view, f]
    panel = show_panel(views, panel)
    return View(view, m, f, panel)


def show_panel(views, panel):
    if panel is not None:
        if not isinstance(views, list):
            views = [views]
        if panel == False:
            display(*views)
        elif isinstance(panel, str):
            panel = sidepanel(panel)
            with panel:
                display(*views)
        elif isinstance(panel, SidePanel):
            with panel:
                display(*views)
        else:
            print('unknow panel type', panel)
    return panel
