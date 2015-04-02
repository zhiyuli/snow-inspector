import os
import sys
import subprocess

def getScriptPath():
	return os.path.dirname(os.path.realpath(sys.argv[0]))


mypath = getScriptPath()
command = "python" + " " + os.path.join(mypath, "job.py")
print command
pid = subprocess.Popen([command]).pid
print pid