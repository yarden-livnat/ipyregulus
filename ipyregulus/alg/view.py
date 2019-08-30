
from regulus.core import HasTree
from ipyregulus.tree import TreeWidget
from ipyregulus.filters.filters import AttrFilter
from ipyregulus.filters.trigger import Trigger
from ipyregulus import BaseTreeView


def reduced_tree(src, f, dest=None):
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
    _, dest = reduced_tree(src, f, dest)
    if view is None:
        view = BaseTreeView(dest, attr=attr)
    monitored = [f]
    if isinstance(src, HasTree):
        monitored.append(src)
    trigger = Trigger(monitored, func=lambda: view.set_show(view.tree))
    views = view if not show_f else [view, f]
    panel = show_panel(views, panel)
    return View(view, trigger, f, panel)
