from django.db import models
from django.core.exceptions import ValidationError

LOW = 0
NORMAL = 1
HIGH = 2
PRIORITY_CHOICES = (
    (LOW, 'Low'),
    (NORMAL, 'Normal'),
    (HIGH, 'High'),
)

class Task(models.Model):

    desc = models.CharField(max_length=64)
    focus = models.BooleanField(default=False)
    priority = models.IntegerField(choices=PRIORITY_CHOICES)
    duration = models.DurationField()
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)

    def clean(self):
        if self.end_time != self.start_time + self.duration:
            raise ValidationError("End time or duration is")
