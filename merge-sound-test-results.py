from os import listdir
from os.path import isfile, join
import pathlib
path = pathlib.Path(__file__).parent.resolve()
all_files = [f for f in listdir(path) if isfile(join(path, f))]

result_files = []
for file_name in all_files:
    if 'result' in file_name and '.csv' in file_name and 'merged' not in file_name:
        result_files.append(file_name)

with open('result-merged.csv', 'w') as fd:
    fd.write('Mode, Type, Answer, Control Group, Answer Time, Press Time, First 30\n')
    for file_name in result_files:
        with open(file_name, 'r') as fd2:
            fd2.readline()
            fd.write(f'{fd2.read().rstrip()}\n')
