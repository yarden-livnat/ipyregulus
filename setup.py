#!/usr/bin/env python
# coding: utf-8
from __future__ import print_function
import sys
import os
from distutils.core import setup
from distutils.command.build_py import build_py
from distutils.command.sdist import sdist
from os.path import join as pjoin
v = sys.version_info

name = 'ipyregulus'

LONG_DESCRIPTION = """
Regulus widgets for Jupyter Lab.
"""


if v[0] < 3 or (v[0] == 3 and v[:2] < (3, 7)):
    error = "ERROR: %s requires Python version 3.7 or above." % name
    print(error, file=sys.stderr)
    sys.exit(1)


here = os.path.abspath(os.path.dirname(__file__))

packages = []
for d, _, _ in os.walk(pjoin(here, name)):
    if os.path.exists(pjoin(d, '__init__.py')):
        packages.append(d[len(here)+1:].replace(os.path.sep, '.'))

version_ns = {}
with open(pjoin(here, name, '_version.py')) as f:
    exec(f.read(), {}, version_ns)

setup_args = dict(
    name=name,
    version=version_ns['__version__'],
    scripts=[],
    packages=packages,
    description="Regulus extension for Jupyter",
    long_description=LONG_DESCRIPTION,
    author='Yarden Livnat',
    author_email='yarden@sci.utah.edu',
    url='https://github.com/yarden-livnat/ipyregulus',
    license='BSD',
    platforms="Linux, Mac OS X, Windows",
    keywords=['Interactive', 'JupyterLab'],
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python :: 3.7',
        'Framework :: Jupyter'
    ]
)

if 'develop' in sys.argv or any(a.startswith('bdist') for a in sys.argv):
    import setuptools

setuptools_args = {}
install_requires = setuptools_args['install_requires'] = [
    'ipywidgets>=7.5.0',
    'ipydatawidgets',
    'traitlets>4.3.0',
    'traittypes',
    'pandas',
    'regulus>=0.8.1'
]

extras_require = setuptools_args['extras_require'] = {
}

if 'setuptools' in sys.modules:
    setup_args.update(setuptools_args)

if __name__ == '__main__':
    setup(**setup_args)
