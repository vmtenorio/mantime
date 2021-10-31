from django.shortcuts import render
from django.http import HttpResponse
from django.template.loader import get_template
from django.views.decorators.csrf import csrf_exempt
from scheduler.models import Task

from datetime import datetime, timedelta

import json
import logging

from .mantime import Mantime

# Get an instance of a logger
logger = logging.getLogger(__name__)

# Create your views here.
def index(request):

    template = get_template("index.html")

    return HttpResponse(template.render())

def index_js(request):
    template_js = get_template("index.js")

    tasks_in_db = Task.objects.filter(start_time__date=datetime.today().date())
    for t in Task.objects.all():
        logger.info(t.start_time)
    task_ids = Task.objects.values_list('id', flat=True)
    logger.info(task_ids)
    if len(task_ids) > 0:
        maxId = max(task_ids)
    else:
        maxId = 0
    return HttpResponse(template_js.render({'tasks': tasks_in_db, 'maxId': maxId}), content_type='text/javascript')

@csrf_exempt
def tasks(request):
    if request.method != "POST":
        return HttpResponse("Wrong Method", status=405)

    task_list = json.loads(request.body.decode('utf8'))
    
    mantime = Mantime()
    mantime.load(task_list)

    mantime.schedule()

    tasks = mantime.to_dict()
    for task in map(adapt_task, tasks):
        task_obj = Task(**task)
        task_obj.save()

    response = json.dumps(tasks)
    # logger.info(response)
    return HttpResponse(response)

@csrf_exempt
def manual_task(request):
    if request.method != "POST":
        return HttpResponse("Wrong Method", status=405)

    task = json.loads(request.body.decode('utf8'))
    # logger.info(task)
    task_obj = Task(**adapt_task(task))
    task_obj.save()

    return HttpResponse("A test")


def adapt_task(task):
    return {
        'id': task['id'],
        'desc': task["desc"],
        'priority': int(task["priority"]),
        'duration': timedelta(minutes=task["duration"]),
        'focus': task["focus"],
        'start_time': task['start_time'],
        'end_time': task['end_time'],
    }
