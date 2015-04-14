#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import itertools
import json


def slurp(filePath):
    with open(filePath) as x: data = x.read()
    return data

def addFileTag(o, tag):
    o['input_file'] = tag
    return o

def diffs(a,b):
    _id = a['id']
    keyfn=lambda o: '{}_{}'.format(o['start'], o['end'])
    tags = sorted(map(lambda o: addFileTag(o, 'A'), a['tags'])
                  +map(lambda o: addFileTag(o, 'B'), b['tags']), key=keyfn)
    grouped_tags = itertools.groupby(tags, key=keyfn)

    results = []
    for k, g in grouped_tags:
        items= list(g)
        if len(items) == 1:
            results.append((_id, '-' if items[0]['input_file'] == 'A' else '+', json.dumps(items[0])))
        else:
            if items[0]['tag'] != items[1]['tag']:
                if items[0]['input_file'] == 'A':
                    results.append((_id, 'M', "{} | {}".format(json.dumps(items[0]), json.dumps(items[1]))))
                else:
                    results.append((_id, 'M', "{} | {}".format(json.dumps(items[1]), json.dumps(items[0]))))
    
    return results

def analyze(modifications):
    grouped_trainings = itertools.groupby(modifications, key= lambda o: o[0])
    num_of_train_edits = len(list(grouped_trainings))
    grouped_edit_type = dict((k, len(list(g))) for k, g in itertools.groupby(
        sorted(modifications, key=lambda o: o[1]), key= lambda o: o[1]))
    
    total_mod_counts = (grouped_edit_type.get('M', 0), 
                  grouped_edit_type.get('+', 0),                   
                  grouped_edit_type.get('-', 0))

    def extractMitieType(mod):
        if mod[1] == 'M':
            left, right = mod[2].split('|')
            return [(json.loads(left)['tag'], mod[1]), (json.loads(right)['tag'], mod[1])]
        return [(json.loads(mod[2])['tag'], mod[1])]

    def groupTypeEdits(l):
        d=dict((k, len(list(g))) for k, g in itertools.groupby(sorted(l, key= lambda o: o[1]), key= lambda o: o[1]))
        return (d.get('M', 0), 
                d.get('+', 0),                   
                d.get('-', 0))


    grouped_mitie_type = dict((k, groupTypeEdits(list(g))) for k, g in itertools.groupby(
        sorted([o
                for m in modifications
                for o in extractMitieType(m)], key=lambda o: o[0]), 
        key=lambda o: o[0]))


    return (num_of_train_edits, total_mod_counts, grouped_mitie_type.items())

if __name__ == "__main__":

    desc='Diff trainings between 2 files A B '

    parser = argparse.ArgumentParser(
        description="MITIE diff trainings", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("input_A", help="input training file A")
    parser.add_argument("input_B", help="input training file B")

    args= parser.parse_args()
    
    fileA = json.loads(slurp(args.input_A))
    fileB = json.loads(slurp(args.input_B))

    trainings = sorted(
        map(lambda o : addFileTag(o, 'A'), fileA['trainings'])
        +map(lambda o : addFileTag(o, 'B'), fileB['trainings']), key= lambda o : o['id'])

    pairs= [list(g) for k, g in itertools.groupby(trainings, key=lambda o: o['id'])]
    filtered_pairs = filter(lambda x : len(x) == 2, pairs)
    r = filter(lambda x : x, map(lambda p: diffs(p[0], p[1]),  filtered_pairs))

    edits =  [ item for l in r for item in l ]
    analysis = analyze(edits)
    print "--- Summary ---"
    print "trainings in common {}".format(len(filtered_pairs))
    print "trainings modified {}".format(analysis[0])
    print "total modifications {}".format(len(edits))
    print "total modified {}, added {}, removed {}".format(*analysis[1])
    print "--- modifications by type ---"
    for t in analysis[2]:
        print "{} modified {}, added {}, removed {}".format(t[0].upper(), *t[1])

    print "--- modifications ---"
    for edit in edits:
        print "{}\t{}\t{}".format(edit[0], edit[1], edit[2])

    
    
