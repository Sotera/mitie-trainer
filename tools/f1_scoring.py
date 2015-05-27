#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import argparse
import itertools
import json
import numpy as np
from itertools import chain, imap

def flatmap(f, items):
    return chain.from_iterable(imap(f, items))
    
def slurp(filePath):
    with open(filePath) as x: data = x.read()
    return data

def addFileTag(o, tag):
    o['input_file'] = tag
    return o


def diffs(items,all_tags):
    a=items[0]
    try:
        b=items[1]
    except:
        b=items[0]
    _id = a['id']
    keyfn=lambda o: '{}_{}'.format(o['start'], o['end'])
    
    tags = sorted(map(lambda o: addFileTag(o, 'A'), a['tags'])
                  +map(lambda o: addFileTag(o, 'B'), b['tags']), key=keyfn)
    
    grouped_tags = itertools.groupby(tags, key=keyfn)
    all_tags2=list(set(list(set(map(lambda x:x['tag'],a['tags'])))+list(set(map(lambda x:x['tag'],b['tags'])))))
    
    results = []
    score = dict.fromkeys(all_tags2)
    for tag in all_tags2:
        score[str(tag)]={}
        score[str(tag)]['fp']=0
        score[str(tag)]['tp']=0
        score[str(tag)]['fn']=0
        score[str(tag)]['tn']=0
        fp=0
        tp=0
        fn=0
        tn=0
    
    for tag in all_tags2:   
        grouped_tags = itertools.groupby(tags, key=keyfn)
        for k, g in grouped_tags:
            items= list(g)
            if len(items) == 1:
                if items[0]['input_file']=='A' and items[0]['tag']==tag:
                    score[str(tag)]['fn']+=1
                    #print tag,'False Negative', items
                elif items[0]['input_file']=='B' and items[0]['tag']==tag:
                    score[str(tag)]['fp']+=1
                    fp+=1
                    #print tag,'False Positive',items
                results.append((_id, '-' if items[0]['input_file'] == 'A' else '+', json.dumps(items[0])))
            else:
                if items[0]['tag'] != items[1]['tag'] and items[0]['tag']==tag:
                    score[str(tag)]['fn']+=1
                    #print tag,'False Negative',items
                    fp+=1
                if items[0]['tag'] == items[1]['tag'] and items[0]['tag']==tag:
                    score[str(tag)]['tp']+=1
                    tp+=1
                    #print tag,'True Postive', items

    try: 
        precision=float(tp/(tp+fp))
    except ZeroDivisionError:
        precision=0
    try:
        recall=float(tp/(tp+fn))
    except ZeroDivisionError:
        recall=0
        
    def scoring(x,tag):
        try:
           precision=float(x['tp'])/(x['fp']+x['tp'])

        except ZeroDivisionError:
            precision=0
        try:
            recall=float(x['tp'])/(x['tp']+x['fn'])
        except ZeroDivisionError:
            recall=0
        
        return (precision,recall)
    
    return  {k:scoring(v,k) for k, v in score.items()}    
    


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


    filtered_pairs = filter(lambda x : x[0]['tags']!=[] and x[0]['input_file']=='A' , pairs)

    all_tagsA=list(set([tag['tag'] for t in fileA['trainings'] for tag in t['tags']]))
    all_tagsB=list(set([tag['tag'] for t in fileB['trainings'] for tag in t['tags']]))
    all_tags=list(set(all_tagsA+all_tagsB))
    r=map(lambda p: diffs(p,all_tags), filtered_pairs)



    table=[]
    for tag in all_tags:
          rnew=filter(lambda x: tag in x.keys(),r)
          mean_precision=np.mean([i for i,j in  map(lambda x: x[tag],rnew)])
          mean_recall=np.mean([j for i,j in  map(lambda x: x[tag],rnew)])
          f = 2.0* (mean_precision*mean_recall)/(mean_precision+mean_recall)
          if np.isnan(f):
            f=0
          table.append([tag, "%.3f"%f, "%.3f"%mean_precision, "%.3f"%mean_recall])

    mean_precision=np.mean([i for i,j in flatmap(lambda x: list(x.values()),r)])
    mean_recall=np.mean([j for i,j in  flatmap(lambda x: list(x.values()),r)])
    f = 2.0* (mean_precision*mean_recall)/(mean_precision+mean_recall)
    table.append(['total',"%.3f"%f, "%.3f"%mean_precision, "%.3f"%mean_recall])

    #print table
    header=['tag','f1','precision','recall']
    print("{0:<10} {1:<10} {2:<10} {3:<10}".format(*header))
    print("---------------------------------------")
    for row in table:
        print("{0:<10} {1:<10} {2:<10} {3:<10}".format(row[0], row[1], row[2],row[3]))
