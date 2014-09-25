

import sys, os
import tangelo
import cherrypy
import json


## load data



#GET /data/all
def all(*args):
    return { 'data': [] }

actions = {
    "all":  all
}

def unknown(*args):
    return tangelo.HTTPStatusCode(400, "invalid service call")

@tangelo.restful
def get(action, *args, **kwargs):
    return actions.get(action, unknown)(*args)
