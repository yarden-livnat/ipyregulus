from ipywidgets import link, dlink


class HasLinks(object):
    def __init__(self):
        self._rlinks = []

    def find_links(self, trait, target, dest):
        return filter(lambda l: trait in [None, l[1]] and
                                target in [None, l[2]] and
                                dest in [None, l[3]],
                      self._rlinks)

    def link(self, trait, target, dest=None):
        self.unlink(trait, target, dest)
        if dest is None:
            dest = trait
        self._rlinks.append([link((self, trait), (target, dest)), trait, target, dest])

    def dlink(self, trait, target, dest=None):
        self.unlink(trait, target, dest)
        if dest is None:
            dest = trait
        self._rlinks.append([dlink((self, trait), (target, dest)), trait, target, dest])

    def unlink(self, trait, target, dest=None):
        for l in self.find_links(trait, target, dest):
            l[0].unlink()
            self._rlinks.remove(l)

