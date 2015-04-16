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

def split_by(l, pred):
    a, b = [], []
    for item in l:
        (a if pred(item) else b).append(item)
    return a,b

if __name__ == "__main__":
    desc = "Given a training file split in to tagged vs untagged trainings"
    parser = argparse.ArgumentParser(
        description="split trainings", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("infile", help="input training file")
    args = parser.parse_args()
    j = json.loads(slurp(args.infile))
    filename, ext = os.path.splitext(j.get('filename', 'output.json'))
    trainings = j.get('trainings', [])
    tagged, untagged = split_by(trainings, lambda t: len(t['tags']) > 0)

    spit("{}_tagged.json".format(filename), json.dumps({ 'filename' : "{}_tagged.json".format(filename), 'trainings' : tagged}))
    spit("{}_untagged.json".format(filename), json.dumps({ 'filename' : "{}_untagged.json".format(filename), 'trainings' : untagged}))


