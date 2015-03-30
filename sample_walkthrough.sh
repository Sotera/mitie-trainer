#!/usr/bin/env bash


cat sample.tsv | ./tools/create_trainings.py > tmp/sample.json`

#
# import tmp/sample.json in to tagger 
#

#
# export tagged file for training
#

cat training_export_*.json | ./tools/train_model.py /srv/software/MITIE/MITIE-models/english/total_word_feature_extractor.dat new_ner_model.dat


#
# 
# Run tagging over data 
#
# This will tag based on the model and remove any tags in the data
#
cat training_export_*.json | ./tools/tag_trainings.py new_ner_model.dat > tmp/tagged_sample.json

#
# import tmp/tagged_sample.json back in to the tagger
#
# modify tags and export again 
#
#

## get a summary of diffs between trainings 

./tools/diff_trainings.py training_export_*.json tmp/tagged_sample.json
