import datetime as dt

PRIORITIES = {
    "low": 0,
    "medium": 1,
    "high": 2
}

class Task:
    def __init__(self, id, desc, priority, duration):
        self.id = id
        self.desc = desc
        self.priority = priority
        self.duration = duration
        self.start_time = None
        self.end_time = None

    def __lt__(self, other):
        if SHORTEST_FIRST and self.priority == other.priority:
            return self.duration > other.duration
        else:
            return PRIORITIES[self.priority] < PRIORITIES[other.priority]


class TaskList:
    def __init__(self, tasks, *args):
        if isinstance(tasks, list):
            self.tasks = tasks
        else:
            self.tasks = [tasks] + list(args)
    
# Error Messages
ERR_DAY_TIME_EXCEED = "The length of all the tasks exceeds the time for the day (9-17)."

# Consts
# TODO: set these as user parameters, customizable
DAY_START_TIME = dt.time(hour=9)
DAY_END_TIME = dt.time(hour=17)
BUFFER_TIME = dt.timedelta(minutes=30)
SHORTEST_FIRST = True

def get_datetime(time):
    return dt.datetime.combine(dt.date.today(), time)

def mantime(task_list):
    task_list.sort(reverse=True) # High first

    start_time = DAY_START_TIME
    for t in task_list:
        t.start_time = start_time
        start_datetime = get_datetime(start_time)
        end_datetime = start_datetime + dt.timedelta(minutes=t.duration)
        t.end_time = end_datetime.time()
        if end_datetime.time() > DAY_END_TIME:
            raise RuntimeError(ERR_DAY_TIME_EXCEED)
        start_time = (end_datetime + BUFFER_TIME).time()

    return task_list