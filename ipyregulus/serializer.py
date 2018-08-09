from traitlets import Undefined, TraitError

from regulus.tree import Node


def _tree_to_json(value, widget):
    def marshal(node, l):
        l.append(node.data)
        for child in node.children:
            marshal(child, l)
        l.append(None)
        return l

    if value is None:
        return None
    if value is Undefined:
        raise TraitError('Cannot serialize undefined tree')
    return marshal(value, [])


def _tree_from_json(value, widget):
    def unmarshal(item, li):
        node = Node(data=item)
        for item in li:
            if item is None:
                break
            node.children.append(unmarshal(item, li))
        return node

    if value is None:
        return None
    l = iter(value)
    return unmarshal(next(l), l)


tree_serialization = {
    'from_json': _tree_from_json,
    'to_json': _tree_to_json
}