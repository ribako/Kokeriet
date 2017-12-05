import re
import os

os.system('touch tmp_lic && license-checker >> tmp_lic')
file = open('tmp_lic', 'r')
lines = ''
for line in file:
    lines += line

regex = r'licenses: (.*)'
matches = re.findall(regex, lines)

os.system('rm tmp_lic')
licenses = {}

for key in matches:
    if key not in licenses:
        licenses[key] = 0
    licenses[key] += 1

for line in licenses:
    print(line)
