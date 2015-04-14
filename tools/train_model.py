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

def trainingSamples(training):
    tokens = [token[0] for token in training['tokens']]
    sample = ner_training_instance(tokens)
    for tag in training['tags']:
        sample.add_entity(xrange(int(tag['start']), 
                                 int(tag['end'])), 
                          tag['tag'])
    return sample

if __name__ == "__main__":
    desc = "Given a training file run MITIE to tag the data"
    parser = argparse.ArgumentParser(
        description="training tagger", 
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=desc)
    parser.add_argument("feature_extractor", help="path to feature extractor file")
    parser.add_argument("output_file", help="output path for model file")    
    parser.add_argument("-t", "--threads", type=int, default=4, help="Number of threads for training")
    parser.add_argument("infile", nargs='?', type=argparse.FileType('r'), default=sys.stdin, help="Input File of trainings")

    args = parser.parse_args()
    _json = json.load(args.infile)
    trainer = ner_trainer(args.feature_extractor)
    trainer.num_threads = args.threads
    trainings = filter(lambda o : len(o['tags']) > 0, _json['trainings'])
    samples = map(trainingSamples, trainings)
    for sample in samples:
        trainer.add(sample)
    ner = trainer.train()
    ner.save_to_disk(args.output_file)

    print "complete - file saved: {} ".format(args.output_file)
