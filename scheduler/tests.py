from django.test import TestCase
from .mantime import *

import datetime as dt

# Create your tests here.
class mantimeTests(TestCase):

    def test_2_tasks(self):
        t1 = Task(1, "T1", "low", 90)
        t2 = Task(2, "T2", "high", 15)

        task_list = [t1, t2]
        ord_tl = mantime(task_list)

        # Check order of the 5 tasks
        self.assertEqual(ord_tl[0].id, 2)
        self.assertEqual(ord_tl[1].id, 1)

        # Check first task
        time_t1 = dt.time(hour=9, minute=15)
        self.assertEqual(ord_tl[0].start_time, DAY_START_TIME)
        self.assertEqual(ord_tl[0].end_time, time_t1)

        # Check second task
        time_t2_start = dt.time(hour=9, minute=45)
        time_t2_end = dt.time(hour=11, minute=15)
        self.assertEqual(ord_tl[1].start_time, time_t2_start)
        self.assertEqual(ord_tl[1].end_time, time_t2_end)


    def test_exceed_time(self):
        t1 = Task(1, "T1", "medium", (17-9)*60 + 1) # 9 to 17 + 1 min to exceed day time

        task_list = [t1]
        self.assertRaises(RuntimeError, mantime, task_list)

    def test_5_tasks(self):
        t1 = Task(1, "T1", "low", 90)
        t2 = Task(2, "T2", "low", 15)
        t3 = Task(3, "T3", "high", 10)
        t4 = Task(4, "T4", "medium", 60)
        t5 = Task(5, "T5", "high", 30)

        task_list = [t1, t2, t3, t4, t5]
        ord_tl = mantime(task_list)

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

        for i in range(len(task_list)):
            self.assertEqual(ord_tl[i].id, order[i])
            self.assertEqual(ord_tl[i].start_time, start_times[i])
            self.assertEqual(ord_tl[i].end_time, end_times[i])
