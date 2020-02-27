import traitlets


class InstanceDict(traitlets.Instance):
    """An instance trait which coerces a dict to an instance.

    This lets the instance be specified as a dict, which is used
    to initialize the instance.

    Also, we default to a trivial instance, even if args and kwargs
    is not specified."""

    def validate(self, obj, value):
        if isinstance(value, dict):
            return super(InstanceDict, self).validate(obj, self.klass(**value))
        else:
            return super(InstanceDict, self).validate(obj, value)

    def make_dynamic_default(self):
        return self.klass(*(self.default_args or ()),
                          **(self.default_kwargs or {}))


class TypedTuple(traitlets.Container):
    """A trait for a tuple of any length with type-checked elements."""
    klass = tuple
    _cast_types = (list,)