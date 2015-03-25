

import sys, os
import tangelo
import cherrypy
import json
import datetime

from trainer.utils.file import slurp, spit

sys.path.append('/srv/software/MITIE/mitielib')

from mitie import *

WEB_ROOT = cherrypy.config.get("webroot")
sample_dir = "{}/data/trainings/sample".format(WEB_ROOT)
auto_save_dir = "{}/data/auto_saves".format(WEB_ROOT)

## load data
files = filter(lambda x: x.endswith(".txt"), os.listdir(sample_dir))
data = json.loads(slurp("{}/sample.json".format(sample_dir)))

#GET /data/all
def all(*args):
    global data
    tangelo.content_type("application/json")    
    return { 'data': data }

#POST /data/auto_save {  } 
def auto_save(*args, **kwargs):
    cherrypy.log("saved")
    f= "session_{}.json".format(datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
    spit("{}/{}".format(auto_save_dir, f), json.dumps(kwargs))
    tangelo.content_type("application/json")
    return { 'saved': f }

actions = {
    "all":  all
}

post_actions = {
    "auto_save" : auto_save
}

def unknown(*args):
    return tangelo.HTTPStatusCode(400, "invalid service call")

@tangelo.restful
def get(action, *args, **kwargs):
    return actions.get(action, unknown)(*args)

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
