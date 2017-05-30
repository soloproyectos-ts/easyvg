#!/usr/bin/env python

"""Creates or updates distribution files"""

import os
import subprocess

if ( not os.path.isdir('typings') ):
	print "Install type definition files..."
	subprocess.call(['bin/typings.py'])

print "Updates JavaScript and Type Definition files..."
subprocess.call(['rm', 'dist', '-rf'])
subprocess.call(['tsc', '--declaration'])
