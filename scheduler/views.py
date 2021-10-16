from django.shortcuts import render
from django.http import HttpResponse
from django.template.loader import get_template
from django.views.decorators.csrf import csrf_exempt

import json
import logging

from .mantime import Mantime

# Get an instance of a logger
logger = logging.getLogger(__name__)

# Create your views here.
def index(request):

    template = get_template("index.html")

    return HttpResponse(template.render())

@csrf_exempt
def tasks(request):
    task_list = json.loads(request.body.decode('utf8'))

    mantime = Mantime()
    mantime.load(task_list)

    mantime.schedule()

    response = json.dumps(mantime.to_dict())
    logger.info(response)
    return HttpResponse(response)



    logger.info(task_list)
    return HttpResponse(task_list[0]['id'])
    return HttpResponse(json.loads(request.body.decode('utf8'))[0])#.replace("'", '"')))
    if request.method != "POST":
        return HttpResponse("Not Found", status=405)
    
    
    return HttpResponse(dir(request))