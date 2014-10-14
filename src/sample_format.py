#!/usr/bin/env python
# -*- coding: utf-8 -*-


import sys
import os
import re
import argparse
import shutil
import json


sys.path.append('/srv/software/MITIE/mitielib')

from mitie import *

def inc(n):
    return n+1

def counter(start=0):
    n = start
    while True:
        yield n
        n = inc(n)

ids = counter()

def createTraining(text, _id = None):
    _id = _id if _id else str(ids.next())
    tokens = tokenize_with_offsets(text)
    return { 'id': _id, 'text': text, 'tokens' : tokens, 'tags': [] }


def slurp(filePath):
    with open(filePath) as x: data = x.read()
    return data

# same as slurp but return Array of lines instead of string
def slurpA(filePath):
    with open(filePath) as x: data = x.read().splitlines()
    return data

def spit(filePath, data, overwrite=False):
    mode= 'w' if overwrite else 'a'
    with open(filePath, mode) as x: x.write(data)


if __name__ == "__main__":
    desc = ""
    parser = argparse.ArgumentParser(
        description="Ingester", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("infile", nargs='?', type=argparse.FileType('r'), default=sys.stdin, help="Input File")

    args = parser.parse_args()
    results = []
    for line in args.infile:
        parts= line.split('\t')

        _id = parts[0]
        body = parts[1]
        body = re.sub(r'[^\x00-\x7F]',' ', body)
        body = body.replace('[:newline:]',' ').strip()
        body = body.encode("ascii")

        sample = createTraining(body, _id)

        results.append(sample)

    print json.dumps(results)
