
from types import FunctionType, LambdaType

def noop():
    return lambda item: True


def Const(value):
    return lambda item: item == value


def functor(obj):
    return obj if callable(obj) else Const(obj)


def Not(f):
    f = functor(f)
    return lambda item: not f(item)


class GroupFilter(object):
    def __init__(self, name='Always', *args):
        self.__name__= name
        self.filters = []
        self.add(*args)

    def add(self, *args):
        self.filters.extend(map(functor, args))

    def remove(self, *args):
        for f in args:
            self.filters.remove(f)

    def reset(self):
        self.filters = []

    def __call__(self, *args, **kwargs):
        return True


class And(GroupFilter):
    def __init__(self, *args):
        super().__init__(name="All of", *args)

    def __call__(self, *args, **kwargs):
        for f in self.filters:
            if not f(*args, **kwargs):
                return False
        return True


class Or(GroupFilter):
    def __init__(self, *args):
        super().__init__(name="Any of", *args)

    def __call__(self, *args, **kwargs):
        for f in self.filters:
            if f(*args, **kwargs):
                return True
        return False
