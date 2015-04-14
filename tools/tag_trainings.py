#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json
import argparse
import functools

from config import Config
cfg = Config(file('conf/app.cfg'))

sys.path.append('{}/mitielib'.format(cfg.MITIE_PATH))

from mitie import *

def tag(ner, training):
    tokens = [token[0] for token in training['tokens']]
    entities = ner.extract_entities(tokens)
    training['tags'] = [{ 'start' : list(e[0])[0], 
                          'end' : list(e[0])[-1]+1, 
                          'tag' : e[1].lower(),
                          'score' : e[2]}
                        for e in entities]
    return training
    

if __name__ == "__main__":
    desc = "Given a training file run MITIE to tag the data"
    parser = argparse.ArgumentParser(
        description="training tagger", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("mitie_model", help="path to mitie model to use")
    parser.add_argument("infile", nargs='?', type=argparse.FileType('r'), default=sys.stdin, help="Input File")

    args = parser.parse_args()
    _json = json.load(args.infile)

    ner = named_entity_extractor(args.mitie_model)
    trainings = map(functools.partial(tag, ner), _json['trainings'])
    print json.dumps({ 'trainings' : trainings })
