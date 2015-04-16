#!/usr/bin/env python
# -*- coding: utf-8 -*-

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


def getTrainings(filePath):
    j = json.loads(slurp(filePath))
    return j['trainings']

if __name__ == "__main__":
    desc = "Given a training file run MITIE to tag the data"
    parser = argparse.ArgumentParser(
        description="cat trainings", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("file_name", help="file name to write concatenated trainings too")
    parser.add_argument("files", nargs='*', help="Input Files")

    args = parser.parse_args()
    training_data = itertools.chain(*[getTrainings(f) for f in args.files])
    spit(args.file_name, json.dumps({ 'filename': args.file_name, 'trainings' : [t for t in training_data] }))
