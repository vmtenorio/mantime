MANUAL_TASK_URL = 'manualTask';

var calendarEl = document.getElementById('calendar');

var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',//'dayGridMonth'
    selectable: true,
    unselectAuto: false,
    selectMirror: false,
    select: manualTask
});

calendar.render();

function manualTask (eventInfo) {

    var duration = eventInfo.end - eventInfo.start;
    var durationMins = duration / (1000*60);
    app.$refs.tasklist.manualTask(durationMins);

    var id = app.$refs.tasklist.maxId;

    // Send to the API to store in database
    axios.post(MANUAL_TASK_URL, {
        id: id,
        start_time: eventInfo.startStr,
        end_time: eventInfo.endStr,
        duration: durationMins,
        desc: '', // Default values
        focus: false,
        priority: 2
    });

    // Create calendar event
    var event = {
        id: id,
        start: eventInfo.startStr,
        end: eventInfo.endStr
    }
    calendar.addEvent(event);

}