const TASK_API_URL = 'tasks';

var taskTemplate = `
    <div class="list-group-item m-0">
        <div class="row">
            <div class="col-md-auto">
                <input
                    type="text"
                    placeholder="Insert your task"
                    @input="$emit('update:desc', $event.target.value)"
                    class="form-control"
                />
            </div>
            <div class="col-md-auto justify-content-center">
                <p>Need focus?
                <input
                    type="checkbox"
                    @change="$emit('change:focus', $event.target.checked)"
                    class="form-check-input mx-auto"
                /></p>
            </div>
            <div class="col-md-auto mt-1">
                <select class="form-select" aria-label="Priority Selection" @change="$emit('change:priority', $event.target.value)">
                    <option disabled selected hidden>Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="col-md-auto">
                <p>Estimated duration:
                    <div class="task-duration" @click="$emit('set-duration')" @input="$emit('set-duration')"></div>
                </p>
            </div>
        </div>
    </div>
`;

Vue.component("task-item", {
    delimiters: ["[[", "]]"], // Need to define them as the templating system interferes with Django's
    props: {
        id: Number,
        desc: String,
        priority: String,
        duration: Number, // Duration in minutes
        focus: Boolean
    },
    template: taskTemplate
});


var listTemplate = `
    <div id="task-list" class="list-group w-100 mt-3 m-auto">
        <task-item
            v-for="t in tasks"
            :key="t.id"
            @update:desc="t.desc = $event; if (t.inCalendar) {calendar.getEventById(t.id).setProp('title', $event);}"
            @change:focus="t.focus = $event"
            @change:priority="t.priority = $event"
            @set-duration="setDuration(t.id)"
        ></task-item>
        <div id="add-more">
          <button @click="newTask" type="button" class="text-center list-group-item list-group-item-action">Add a new task</button>
        </div>
        <div id="submit-button" class="my-3 w-25 mx-auto">
            <button type="button" class="btn btn-primary" @click="sendData">Submit</button>
      </div>
    </div>
`;

Vue.component("task-list", {
    data () {
        return {
            tasks: [
                { id: 1, desc: "", priority: "Priority", duration: 0, focus: false, inCalendar: false },
                { id: 2, desc: "", priority: "Priority", duration: 0, focus: false, inCalendar: false },
            ]
        }
    },
    methods: {
        newTask() {
            this.tasks.push({ id: this.tasks.length + 1, desc: "", priority: "Priority", duration: 0, focus: false, inCalendar: false })
            this.$nextTick(function() {
                $(".task-duration").timesetter();
            });
        },
        manualTask(duration) {
            var id = this.tasks.length + 1;
            this.tasks.push({ id: id, desc: "", priority: "Priority", duration: duration, focus: false, inCalendar: true })

            this.$nextTick(function() {
                var newTimesetter = $(".task-duration").last()
                newTimesetter.timesetter();
                newTimesetter.setValuesByTotalMinutes(duration);
            });
        },
        setDuration (id) {
            var container = $(".task-duration").eq(id-1);
            this.tasks[id-1].duration = container.getTotalMinutes();
        },
        sendData () {
            axios.post(TASK_API_URL, this.tasks)
                .then(function (response) {

                    response.data.forEach(createCalendarEvent);
                });
        }
    },
    template: listTemplate
});

Vue.config.devtools=true;

var app = new Vue({
    el: "#task-list"
});

function createCalendarEvent (task) {

    var hour_start = parseInt(task.start_time.split(':')[0])
    var min_start = parseInt(task.start_time.split(':')[1])
    var hour_end = parseInt(task.end_time.split(':')[0])
    var min_end = parseInt(task.end_time.split(':')[1])

    var start_time = new Date();
    start_time.setHours(hour_start);
    start_time.setMinutes(min_start);
    start_time.setSeconds(0);

    var end_time = new Date();
    end_time.setHours(hour_end);
    end_time.setMinutes(min_end);
    end_time.setSeconds(0);

    var bgColor;
    if (task.priority === "low") {
        bgColor = 'green';
    } else if (task.priority === "high") {
        bgColor = 'red'
    } else { // medium or default
        bgColor =  'blue';//'#3788d8';
    }

    var task_obj = {
        id: task.id,
        title: task.desc,
        start: start_time.toISOString(),
        end: end_time.toISOString(),
        backgroundColor: bgColor,
        borderColor: bgColor,
    }
    $("#calendar").addEvent(task_obj);
}