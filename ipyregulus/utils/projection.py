import pandas as pd
from ipyregulus.core.axis import Axis


def create_axes(pts):
    axes = []
    if isinstance(pts, pd.DataFrame):
        axes = [Axis(label=l, max=m) for l, m in zip(list(pts), pts.abs().max())]
    elif isinstance(pts, pd.Series):
        axes = [Axis(label=pts.name, max=max(abs(pts)))]
    else:
        raise ValueError('pts must be Pandas DataFrame or Series')
    return axes


def get_pts(partition):
    pts = partition.x.copy()
    pts[partition.y.name] = partition.y
    return [list(v) for v in pts.values]