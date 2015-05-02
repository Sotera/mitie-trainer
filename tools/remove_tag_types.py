#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json
import argparse
import functools
import os

def slurp(filePath):
    with open(filePath) as x: data = x.read()
    return data

def filterTag(types, j):
    tags = filter(lambda x: x['tag'] not in types, j['tags'])
    j['tags'] = tags
    return j

if __name__ == "__main__":
    desc = "Given a training file remove matching types"
    parser = argparse.ArgumentParser(
        description="remove tags", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)

    parser.add_argument("file_name", help="file to remove tags")
    parser.add_argument("tag_types", nargs='*', help="tag types to remove")

    args = parser.parse_args()
    filename, ext = os.path.splitext(os.path.basename(args.file_name))
    _json = json.loads(slurp(args.file_name))
    tags = [tag.lower() for tag in args.tag_types]

    f = functools.partial(filterTag, tags)
    trainings = [f(training) for training in _json['trainings']]
    print json.dumps({ 'filename': "{}_filtered.json".format(filename), 'trainings' : trainings })
