#!/usr/bin/python3
# Usage python3 check_license.py
import re
import os

os.system('touch tmp_lic && license-checker >> tmp_lic')
file = open('tmp_lic', 'r')
lines =''
for line in file:
	lines += line
  
os.system('rm tmp_lic')

regex = r'licenses: (.*)'
matches = re.findall(regex, lines)

licenses = {}

for key in matches:
	if key not in licenses:
		licenses[key] = 0
	
	licenses[key] += 1

print(licenses)
