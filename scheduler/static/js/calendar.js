var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',//'dayGridMonth'
    selectable: true,
    selectMirror: true,
});
calendar.render();