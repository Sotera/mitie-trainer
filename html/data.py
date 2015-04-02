import sys, os, glob
import tangelo
import cherrypy
import json
import datetime

from trainer.utils.file import slurp, spit

WEB_ROOT = cherrypy.config.get("webroot")
auto_save_dir = "{}/data/auto_saves".format(WEB_ROOT)
user_save_dir = "{}/data/user_saves".format(WEB_ROOT)
#GET /data/last_save
def last_save(*args):
    tangelo.content_type("application/json")    
    saves=list(glob.iglob('{}/*.json'.format(auto_save_dir)))
    if len(saves) > 0:
        f= max(saves, key=os.path.getctime)
        return slurp(f)
    return { 'trainings' : [] }

def rm(filePath):
    if os.path.isfile(filePath):
        os.remove(filePath)

def remove_old_files():
    saves=list(glob.iglob('{}/*.json'.format(auto_save_dir)))
    if len(saves) > 0:
        for f in sorted(saves, key=os.path.getctime)[:-100]:
            rm(f)

#POST /data/auto_save {  } 
def auto_save(*args, **kwargs):
    cherrypy.log("saved")
    f= "session_{}.json".format(datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
    spit("{}/{}".format(auto_save_dir, f), json.dumps(kwargs))
    remove_old_files()    
    tangelo.content_type("application/json")
    return { 'saved': f }

#POST /data/server_save { 'name' : '', 'data' : trainings  } 
def server_save(*args, **kwargs):
    f = kwargs.get('name')
    data = kwargs.get('data')
    spit("{}/{}".format(user_save_dir, f), json.dumps(data))
    tangelo.content_type("application/json")
    return { 'saved': f }


actions = {
    "last_save":  last_save
}

post_actions = {
    "auto_save" : auto_save,
    "server_save" : server_save
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
