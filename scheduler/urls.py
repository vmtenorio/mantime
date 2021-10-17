from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('tasks', views.tasks, name='tasks'),
    path('manualTask', views.manual_task, name='manual_task'),
]
