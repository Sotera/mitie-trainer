#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
import argparse
import functools
import itertools

def spit(filePath, data, overwrite=False):
    # write all contents to a file
    mode= 'w' if overwrite else 'a'
    with open(filePath, mode) as x: x.write(data)


def slurp(filePath):
    # read contents of file to string
    with open(filePath) as x: data = x.read()
    return data

def partition(l, n):
    """ 
    Yield successive n-sized partitions from l.
    >>> partition(range(1,10),2)
    [[1, 2], [3, 4], [5, 6], [7, 8], [9]]
    """
    def _part():
        for i in xrange(0, len(l), n):
            yield l[i:i+n]
    #I prefer it to be a list instead of generator
    return [i for i in _part()]

if __name__ == "__main__":
    desc = "Given a training file chunk the file in to parts of N trainings per file"
    parser = argparse.ArgumentParser(
        description="chunk trainings", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("N", type=int, help="trainings per file")
    parser.add_argument("infile", help="input training file")
    args = parser.parse_args()
    j = json.loads(slurp(args.infile))
    filename, ext = os.path.splitext(j.get('filename', 'output.json'))
    trainings = partition(j.get('trainings', []), args.N)

    for i, t in enumerate(trainings):
        fn = "{}_{}.json".format(filename, i)
        spit(fn, json.dumps({ 'filename' : fn, 'trainings' : t}))

