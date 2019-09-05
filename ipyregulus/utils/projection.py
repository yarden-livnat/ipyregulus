import pandas as pd
from ipyregulus.core.axis import Axis


def create_axes(pts, cols=None):
    axes = []
    if cols is None:
        cols = range(len(list(pts)))
    elif isinstance(cols, int):
        cols = [cols]
    if isinstance(pts, pd.DataFrame):
        axes = [Axis(label=l, col=c, max=m) for l, c, m in zip(list(pts), cols, pts.abs().max())]
    elif isinstance(pts, pd.Series):
        axes = [Axis(label=pts.name, col=cols[0], max=max(abs(pts)))]
    else:
        raise ValueError('pts must be Pandas DataFrame or Series')
    return axes


def get_pts(partition):
    pts = partition.x.copy()
    pts[partition.y.name] = partition.y
    return [list(v) for v in pts.values]