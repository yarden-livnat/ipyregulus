
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


class And(object):
    def __init__(self, *args):
        self.filters = []
        self.add(*args)

    def add(self, *args):
        self.filters.extend(map(functor, args))

    def remove(self, *args):
        for f in args:
            self.filters.remove(f)

    def __call__(self, item):
        for f in self.filters:
            if not f(item):
                return False
        return True


class Or(object):
    def __init__(self, *args):
        self.filters = []
        self.add(*args)

    def add(self, *args):
        self.filters.extend(map(functor, args))

    def remove(self, *args):
        for f in args:
            self.filters.remove(f)

    def __call__(self, item):
        for f in self.filters:
            if f(item):
                return True
        return False
