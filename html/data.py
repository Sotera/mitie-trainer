

import sys, os
import tangelo
import cherrypy
import json

from trainer.utils.file import slurp

sys.path.append('/srv/software/MITIE/mitielib')

from mitie import *

WEB_ROOT = cherrypy.config.get("webroot")
sample_dir = "{}/data/trainings/sample".format(WEB_ROOT)

## load data
files = filter(lambda x: x.endswith(".txt"), os.listdir(sample_dir))
data = json.loads(slurp("{}/sample.json".format(sample_dir)))

#GET /data/all
def all(*args):
    global data
    tangelo.content_type("application/json")    
    return { 'data': data }

actions = {
    "all":  all
}

def unknown(*args):
    return tangelo.HTTPStatusCode(400, "invalid service call")

@tangelo.restful
def get(action, *args, **kwargs):
    return actions.get(action, unknown)(*args)
