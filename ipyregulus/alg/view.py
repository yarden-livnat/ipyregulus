from ipyregulus.tree import HasTree, TreeWidget
from ipyregulus.filters.filters import AttrFilter
from ipyregulus.filters.monitor import Monitor
from ipyregulus import TreeView
from sidepanel import SidePanel


class View(object):
    def __init__(self, view, monitor, filter, panel):
        self.view = view
        self.monitor = monitor
        self._filter = filter
        self.panel = panel

    @property
    def filter(self):
        return self._filter

    @filter.setter
    def filter(self, f):
        self.monitor.remove(self.filter)
        self.monitor.add(f)
        self._filter = f
        view = self.view
        self.monitor.func = lambda: view.set_show(view.tree.filter(f))

def reduce_tree(src, f, dest=None):
    monitored = [f]
    if dest is None:
        dest = TreeWidget(src)
    if isinstance(src, HasTree):
        monitored.append(src)
        src = src.tree
    m = Monitor(monitored, func=lambda: dest.set(src.reduce(f)))
    return m, dest


def show_reduce(src, f=None, func=lambda x, v: v <= x, dest=None, view=None, attr='span', panel=False):
    show_f = f is None
    if f is None:
        f = AttrFilter(attr=attr, func=func)
    m, dest = reduce_tree(src, f, dest)
    if view is None:
        view = TreeView(dest, attr=attr)
    monitored = [f, src] if isinstance(src, HasTree) else [f]
    m = Monitor(monitored, func=lambda: view.set_show(view.tree, f))
    show = view if not show_f else [view, f]
    panel = show_panel(show, panel)
    return View(view, m, f, panel)


def show_tree(src, f=None, func=lambda x, v: v <= x, view=None, attr='span', panel=False):
    show_f = f is None
    if f is None:
        f = AttrFilter(attr=attr, func=func)
    if view is None:
        view = TreeView(src, attr=attr)
    monitored = [f, src] if isinstance(src, HasTree) else [f]
    m = Monitor(monitored, func=lambda: view.set_show(view.tree.filter(f)))
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
            panel = SidePanel(title=panel)
            with panel:
                display(*views)
        elif isinstance(panel, SidePanel):
            with panel:
                display(*views)
        else:
            print('unknow panel type', panel)
    return panel
