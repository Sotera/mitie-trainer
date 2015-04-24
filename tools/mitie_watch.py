#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json
import argparse
import functools
import itertools
import datetime
import signal
import time

def fmtNowISO():
    return datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S')

def spit(filePath, data, overwrite=False):
    # write all contents to a file
    mode= 'w' if overwrite else 'a'
    with open(filePath, mode) as x: x.write(data)


def slurp(filePath):
    # read contents of file to string
    with open(filePath) as x: data = x.read()
    return data



class Interuptable(object):
    def __init__(self, sig=signal.SIGINT):
        self.sig = sig

    def __enter__(self):
        self.interrupted = False
        self.released = False
        self.original_handler = signal.getsignal(self.sig)

        def handler(signum, frame):
            self.release()
            self.interrupted = True

        signal.signal(self.sig, handler)
        return self

    def __exit__(self, type, value, tb):
        self.release()

    def release(self):
        if self.released:
            return False

        signal.signal(self.sig, self.original_handler)
        self.released = True

        return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="")
    parser.add_argument("filename", help="file name to watch")
    parser.add_argument("-t", "--timeout", type=int, default=60, help="timeout in seconds")
    args = parser.parse_args()
    last = slurp(args.filename)
    with Interuptable() as handler:
        while(True):
            curr = slurp(args.filename)            
            if len(curr) > len(last):
                spit('mitie_watch.log', "{}\n{}\n----\n".format(fmtNowISO(), curr[len(last):]))
            last = curr
            time.sleep(args.timeout)
            if handler.interrupted:
                break;
    
    print "done"
