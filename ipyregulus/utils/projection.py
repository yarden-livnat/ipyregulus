import pandas as pd
from ipyregulus.core.axis import Axis





def get_pts(partition):
    pts = partition.x.copy()
    pts[partition.y.name] = partition.y
    return [list(v) for v in pts.values]