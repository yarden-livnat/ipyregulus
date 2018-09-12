from ipywidgets import widgets, Layout
from bqplot import OrdinalScale, LinearScale, Bars, Axis, Figure
import numpy as np
from matplotlib import cm

from .treeview import TreeView


def fitness_view(tv: TreeView):
    box_layout = Layout(overflow_y='scroll', overflow='scroll')
    container = widgets.VBox([], Layout=box_layout)

    def on_selection_changed(change):
        children = []
        for node_id in sorted(change['new']):
            stepwise_fits, found = tv.tree.regulus.attr['stepwise_fitness'].get(node_id)
            if found:
                x_ord = OrdinalScale()
                y_sc = LinearScale(min=0, max=1)

                dims, fitnesses = zip(*stepwise_fits)
                x_labels = ['x{}'.format(x) for x in dims]
                colors = []
                for fitness in fitnesses:
                    colors.append(cm.RdYlGn(fitness))

                bar = Bars(x=x_labels,
                        y=fitnesses,
                        scales={'x': x_ord, 'y': y_sc},
                        type='stacked',
                        colors=colors)

                ax_x = Axis(scale=x_ord,
                            grid_lines='solid',
                            label='Dimension')
                ax_y = Axis(scale=y_sc,
                            orientation='vertical',
                            grid_lines='solid',
                            label='Linear Coefficient')

                fig = Figure(marks=[bar],
                            axes=[ax_x, ax_y],
                            title='Node {} Sensitivity'.format(node_id))

                fig.layout.max_width = '200px'
                fig.layout.max_height = '200px'
                children.append(fig)
        #         children.append(widgets.Text(str(intercept), disabled=True))
                children.append(widgets.HTML(value="<hr>"))
        container.children = tuple(children)

    tv.observe(on_selection_changed, names='details')

    # For debuggging, so we can see what errors occur in the selection
    # function, if any. When ready for production, remove this line
    on_selection_changed({'new': tv.details})

    return container
