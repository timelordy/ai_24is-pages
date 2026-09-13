# Исправьте только TODO. Объясните список, словарь, функцию и assert.
from tasks import load_tasks

def done_ids(rows):
    return []  # TODO: вернуть id задач со status == "done"

assert done_ids(load_tasks()) == [3]
print("Python diagnosis passed")
