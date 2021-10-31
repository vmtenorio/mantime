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
                    :value="desc"
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
                    <option value="1" disabled selected hidden>Priority</option>
                    <option value="2">High</option>
                    <option value="1">Medium</option>
                    <option value="0">Low</option>
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

// TODO: tasks enlarge in calendar when duration increases
var listTemplate = `
    <div id="task-list" class="list-group w-100 mt-3 m-auto">
        <task-item
            v-for="t in tasks"
            :key="t.id"
            :desc="t.desc"
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
        var taskList = [
            {% for t in tasks %}
                {
                    id: {{ t.id }},
                    desc: "{{ t.desc }}",
                    priority: {{ t.priority }},
                    duration: {% widthratio t.duration.total_seconds 60 1 %}, // "Widthratio A B C" computes C*A/B
                    focus: {{ t.focus|yesno:"true,false" }}, // Need to be lowercase
                    start_time: "{{ t.start_time.isoformat }}",
                    end_time: "{{ t.end_time.isoformat }}",
                    inCalendar: true
                },
            {% endfor %}
            ];
        return {
            tasks: taskList,
            maxId: {{ maxId }}
        }
    },
    mounted () {
        this.$nextTick(function() {
            for (var i = 0; i < this.tasks.length; i++){
                // Create calendar events for already loaded tasks
                createCalendarEvent(this.tasks[i])

                // Set durations in the timesetter
                var timesetterContainer = $(".task-duration").eq(i);
                timesetterContainer.timesetter();
                timesetterContainer.setValuesByTotalMinutes(this.tasks[i].duration);
            }
        });
    },
    methods: {
        newTask() {
            this.maxId++;
            this.tasks.push({ id: this.maxId, desc: "", priority: 2, duration: 0, focus: false, start_time: null, end_time: null, inCalendar: false })
            this.$nextTick(function() {
                $(".task-duration").last().timesetter();
            });
        },
        manualTask(duration) {
            this.maxId++;
            this.tasks.push({ id: this.maxId, desc: "", priority: 2, duration: duration, focus: false, start_time: null, end_time: null, inCalendar: true })

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
            
            for (var i = 0; i < this.tasks.length; i++) {
                this.tasks[i].inCalendar = true;
            }
        }
    },
    template: listTemplate
});

Vue.config.devtools=true;

var app = new Vue({
    el: "#task-list"
});

function createCalendarEvent (task) {

    /*
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
    */

    var bgColor;
    if (task.priority === "low") {
        bgColor = 'green';
    } else if (task.priority === "high") {
        bgColor = 'red'
    } else { // medium or default
        bgColor =  '#3788d8';//'blue';
    }

    var task_obj = {
        id: task.id,
        title: task.desc,
        start: task.start_time,//start_time.toISOString(),
        end: task.end_time, //end_time.toISOString(),
        backgroundColor: bgColor,
        borderColor: bgColor,
    }
    calendar.addEvent(task_obj);
    // $("#calendar").addEvent(task_obj);
}