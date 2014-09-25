# -*- coding: utf-8 -*-
import os
import shutil

def slurp(filePath):
    with open(filePath) as x: data = x.read()
    return data

# same as slurp but return Array of lines instead of string
def slurpA(filePath):
    with open(filePath) as x: data = x.read().splitlines()
    return data

def spit(filePath, data, overwrite=False):
    mode= 'w' if overwrite else 'a'
    with open(filePath, mode) as x: x.write(data)

def touch(filePath, times=None):
    with open(filePath, 'a'):
        os.utime(filePath, times)

def rm(filePath):
    if os.path.isfile(filePath):
        os.remove(filePath)

def cp(src, dest):
    shutil.copyfile(src,dest)

def mv(src, dest):
    shutil.move(src,dest)

def mkdir(path):
    os.makedirs(path)
