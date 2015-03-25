from trainer.utils.functions import nth, rest, head

import sys, os
import datetime
import tangelo
import cherrypy
import json

WEB_ROOT = cherrypy.config.get("webroot")
trained_dir = "{}/data/trained".format(WEB_ROOT)

from config import Config

cfg = Config(file("{}/../conf/app.cfg".format(WEB_ROOT)))

sys.path.append('{}/mitielib'.format(cfg.MITIE_PATH))

from mitie import *

trainer = None
ner = None

def fmtNow():
    return datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')

def new(*args):
    global trainer 
    trainer = ner_trainer('{}/MITIE-models/english/total_word_feature_extractor.dat'.format(WEB_ROOT))


## tags array triples [ (start, end, tag) ]
def addTraining(tokens, tags):
    global trainer

    sample = ner_training_instance(tokens)
    for tag in tags:
        sample.add_entity(xrange(tag[0],tag[1]), tag[2])
    trainer.add(sample)


#POST { 'trainings': 
#        [{ 'text': "sample", 'tokens': [["", 0]],
#           'tags': [{ 'start': 0, 'end' : 1, 'tag': 'person' }] }
def train(*args, **kwargs):
    global trainer 
    global ner
    new()
    samples = kwargs.get("trainings")

    for sample in samples:
        addTraining([token[0] for token in sample.get("tokens")], 
                    [(tag.get("start"), tag.get("end"), tag.get("tag")) 
                     for tag in sample.get("tags")])

    trainer.num_threads = 4
    ner = trainer.train()
    tangelo.content_type("application/json")
    return { 'result' : 'SUCCESS' }

def save(*args):
    global ner
    name = "{}_{}".format(fmtNow(), "ner_model.dat")    
    ner.save_to_disk("{}/{}".format(trained_dir, name))
    tangelo.content_type("application/json")
    return { 'model': "{}/{}".format("data/trained", name)}

#POST { "sample": "text..."}
def test(*args, **kwargs):
    global ner
    sz = kwargs.get("sample")
    tokens = tokenize_with_offsets(sz)
    entities = ner.extract_entities(tokens)
    entity_results = [
        {'tag': e[1], 'indices': [i for i in e[0]], 'text': " ".join([tokens[i][0] for i in e[0]])}
         for e in entities]

    # for e in entities:
    #     range = e[0]
    #     tag = e[1]
    #     entity_text = entity_text + " ".join(tokens[i][0] for i in range)
    tangelo.content_type("application/json")
    return { 'tokens': tokens, 'results': entity_results }

 
#GET /train/sample
def sample(*args):
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

    tokens = ["I", "met", "with", "John", "Becker", "at", "HBU", "."]
    entities = ner.extract_entities(tokens)


    entity_text = ""
    for e in entities:
        range = e[0]
        tag = e[1]
        entity_text = entity_text + " ".join(tokens[i] for i in range)

    return entity_text


#POST train/tokens { text: "" } 
def getTokens(*args, **kwargs):
    cherrypy.log("test")
    sz = kwargs.get("text")
    tangelo.content_type("application/json")
    return { 'tokens':  tokenize_with_offsets(sz) }

post_actions = {
    "train" : train,
    "test" : test,
    "tokens": getTokens
}

get_actions = {
    "save" : save
}

@tangelo.restful
def get(action, *args, **kwargs):

    def unknown(*args):
        return tangelo.HTTPStatusCode(400, "invalid service call")

    return get_actions.get(action, unknown)(*args)

@tangelo.restful
def post(*args, **kwargs):

    def unknown(*args, **kwargs):
        return tangelo.HTTPStatusCode(400, "invalid service call")

    action = '.'.join(args)
    post_data = cherrypy.request.body.read()
    cherrypy.log(action)
    
    if post_data:
        #if ajax body post
        return post_actions.get(action, unknown)(*args, **json.loads(post_data))
    #else form data post
    return post_actions.get(action, unknown)(*args, **kwargs)
