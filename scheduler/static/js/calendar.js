MANUAL_TASK_URL = 'manualTask';

var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',//'dayGridMonth'
    selectable: true,
    selectMirror: true,
    select: manualTask
});

calendar.render();

function manualTask (eventInfo) {
    axios.post(MANUAL_TASK_URL, {
        start_time: eventInfo.startStr,
        end_time: eventInfo.endStr
    }).then(function (response) {
        var duration = eventInfo.end - eventInfo.start;
        var durationMins = duration / (1000*60);
        app.$children[0].manualTask(durationMins);


        //app.$children[0].tasks.push({ // The first children is the task-list component
            //id: app.$children[0].tasks.length++,
            //desc: "",
            //priority: "Medium",
            //duration: durationMins,
            //focus: false
        //});
    });


}