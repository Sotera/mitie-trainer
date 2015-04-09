#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import itertools
import json
import numpy as np


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
    fp=0
    tp=0
    fn=0
    tn=0
    for k, g in grouped_tags:
        items= list(g)
        if len(items) == 1:
            if items[0]['input_file']=='A':
                fn+=1
            else:
                tn+=1
            results.append((_id, '-' if items[0]['input_file'] == 'A' else '+', json.dumps(items[0])))
        else:
            if items[0]['tag'] != items[1]['tag']:
                if items[0]['input_file'] == 'A':
                    fp+=1
                    results.append((_id, 'M', "{} | {}".format(json.dumps(items[0]), json.dumps(items[1]))))
                else:
                    results.append((_id, 'M', "{} | {}".format(json.dumps(items[1]), json.dumps(items[0]))))
            if items[0]['tag'] == items[1]['tag']:
                tp+=1
    #print fp,tp,fn,tn
    precision=float(tp/(tp+fp))
    recall=float(tp/(tp+fn))
    #print precision, recall
    return precision,recall

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
    train=pairs[0][0]['tags']
    model=pairs[0][1]['tags']


    filtered_pairs = filter(lambda x : len(x[0]['tags']) >0 and len(x[1]['tags']), pairs)
    r = filter(lambda x : x, map(lambda p: diffs(p[0], p[1]),  filtered_pairs))
    mean_precision = np.mean(map(lambda x: x[0],r))
    mean_recall = np.mean(map(lambda x:x[1],r))
    f = 2.0* (mean_precision*mean_recall)/(mean_precision+mean_recall)
    print "----Summary----"
    print "f1 score: " + str(f)
