from django.test import TestCase
from .mantime import *

import datetime as dt

# Create your tests here.
class mantimeTests(TestCase):

    def test_2_tasks(self):
        t1 = Task(1, "T1", "low", 90, False)
        t2 = Task(2, "T2", "high", 15, False)

        mantime = Mantime(t1, t2)

        mantime.schedule()

        # Check order of the 5 tasks
        self.assertEqual(mantime.tasks[0].id, 2)
        self.assertEqual(mantime.tasks[1].id, 1)

        # Check first task
        time_t1 = dt.time(hour=9, minute=15)
        self.assertEqual(mantime.tasks[0].start_time, DAY_START_TIME)
        self.assertEqual(mantime.tasks[0].end_time, time_t1)

        # Check second task
        time_t2_start = dt.time(hour=9, minute=45)
        time_t2_end = dt.time(hour=11, minute=15)
        self.assertEqual(mantime.tasks[1].start_time, time_t2_start)
        self.assertEqual(mantime.tasks[1].end_time, time_t2_end)


    def test_exceed_time(self):
        t1 = Task(1, "T1", "medium", (17-9)*60 + 1) # 9 to 17 + 1 min to exceed day time

        mantime = Mantime(t1)
        self.assertRaises(RuntimeError, mantime.schedule)

    def test_5_tasks(self):
        t1 = Task(1, "T1", "low", 90, False)
        t2 = Task(2, "T2", "low", 15, False)
        t3 = Task(3, "T3", "high", 10, False)
        t4 = Task(4, "T4", "medium", 60, False)
        t5 = Task(5, "T5", "high", 30, False)

        mantime = Mantime(t1, t2, t3, t4, t5)

        mantime.schedule()

        if SHORTEST_FIRST:
            order = [3, 5, 4, 2, 1]
            start_times = [
                DAY_START_TIME,
                dt.time(hour=9, minute=40),
                dt.time(hour=10, minute=40),
                dt.time(hour=12, minute=10),
                dt.time(hour=12, minute=55)
            ]
            end_times = [
                dt.time(hour=9, minute=10),
                dt.time(hour=10, minute=10),
                dt.time(hour=11, minute=40),
                dt.time(hour=12, minute=25),
                dt.time(hour=14, minute=25)
            ]
        else:
            order = [3, 5, 4, 1, 2]
            start_times = [
                DAY_START_TIME,
                dt.time(hour=9, minute=40),
                dt.time(hour=10, minute=40),
                dt.time(hour=12, minute=10),
                dt.time(hour=14, minute=10)
            ]
            end_times = [
                dt.time(hour=9, minute=10),
                dt.time(hour=10, minute=10),
                dt.time(hour=11, minute=40),
                dt.time(hour=13, minute=40),
                dt.time(hour=14, minute=25)
            ]

        for i in range(len(mantime.tasks)):
            self.assertEqual(mantime.tasks[i].id, order[i])
            self.assertEqual(mantime.tasks[i].start_time, start_times[i])
            self.assertEqual(mantime.tasks[i].end_time, end_times[i])
