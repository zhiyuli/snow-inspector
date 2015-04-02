import time
import os
import sys
print os.path.dirname(os.path.realpath(sys.argv[0]))
for i in range(1,10):
    time.sleep(10)
    print "step: %d" % i