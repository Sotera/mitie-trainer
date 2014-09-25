#!/usr/bin/env python

import sys, os

sys.path.append('/srv/software/MITIE/mitielib')

from mitie import *


sample = ner_training_instance(["My", "name", "is", "Davis", "King", "and", "I", "work", "for", "MIT", "."])

sample.add_entity(xrange(3,5), "person")
sample.add_entity(xrange(9,10), "org")

sample2 = ner_training_instance(["The", "other", "day", "at", "work", "I", "saw", "Brian", "Smith", "from", "CMU", "."])
sample2.add_entity(xrange(7,9), "person")
sample2.add_entity(xrange(10,11), "org")

trainer = ner_trainer('/srv/software/MITIE/MITIE-models/english/total_word_feature_extractor.dat')


trainer.add(sample)
trainer.add(sample2)

trainer.num_threads = 4

ner = trainer.train()

ner.save_to_disk("new_ner_model.dat")


print "tags:", ner.get_possible_ner_tags()


tokens = ["I", "met", "with", "John", "Becker", "at", "HBU", "."]
entities = ner.extract_entities(tokens)

print "\nEntities found:", entities
print "\nNumber of entities detected:", len(entities)
for e in entities:
    range = e[0]
    tag = e[1]
    entity_text = " ".join(tokens[i] for i in range)
    print "    " + tag + ": " + entity_text


