import datetime as dt

PRIORITIES = {
    "low": 0,
    "medium": 1,
    "high": 2,
    "Priority": 1 # The default is equal to medium priority
}

class Task:
    def __init__(self, id, desc, priority, duration, focus, start_time=None, end_time=None):
        self.id = id
        self.desc = desc
        self.priority = priority
        self.duration = duration
        self.focus = focus
        self.start_time = start_time
        self.end_time = end_time

    def __lt__(self, other):
        if SHORTEST_FIRST and self.priority == other.priority:
            return self.duration > other.duration
        else:
            return self.priority < other.priority


class Mantime:
    def __init__(self, *args):
        self.tasks = list(args)

    def load(self, data):
        for t in data:
            self.tasks.append(Task(
                t["id"],
                t["desc"],
                int(t["priority"]),
                t["duration"],
                t["focus"]
            ))
    
    def to_dict(self):
        result = []
        for t in self.tasks:
            result.append({
                "id": t.id,
                "desc": t.desc,
                "priority": t.priority,
                "duration": t.duration,
                "focus": t.focus,
                "start_time": t.start_time.isoformat(),
                "end_time": t.end_time.isoformat(),
            })
        return result

    def schedule(self):
        self.tasks.sort(reverse=True) # High first

        start_time = get_datetime(DAY_START_TIME)
        day_end_datetime = get_datetime(DAY_END_TIME)
        for t in self.tasks:
            t.start_time = start_time
            end_datetime = start_time + dt.timedelta(minutes=t.duration)
            t.end_time = end_datetime
            if end_datetime > day_end_datetime:
                raise RuntimeError(ERR_DAY_TIME_EXCEED)
            start_time = (end_datetime + BUFFER_TIME)


    
# Error Messages
ERR_DAY_TIME_EXCEED = "The length of all the tasks exceeds the time for the day (9-17)."

# Consts
# TODO: set these as user parameters, customizable
DAY_START_TIME = dt.time(hour=9)
DAY_END_TIME = dt.time(hour=17)
BUFFER_TIME = dt.timedelta(minutes=15)
SHORTEST_FIRST = True

def get_datetime(time):
    return dt.datetime.combine(dt.date.today(), time)
