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
                <p class="m-0">Need focus?</p>
                <input
                    type="checkbox"
                    @change="$emit('change:focus', $event.target.checked)"
                    class="form-check-input mx-auto"
                />
            </div>
            <div class="col-md-auto">
                <select class="form-select" aria-label="Priority Selection" @change="$emit('change:priority', $event.target.value)">
                    <option disabled selected hidden>Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
            <div class="col-md-auto">
                <p class="m-0">Estimated duration:</p>
                <div class="task-duration" @click="$emit('set-duration')" @input="$emit('set-duration')"></div>
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
    <div id="task-list" class="list-group w-75 mt-3 m-auto">
        <task-item
            v-for="t in tasks"
            :key="t.id"
            @update:desc="t.desc = $event"
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
                { id: 1, desc: "", priority: "Priority", duration: 0, focus: false },
                { id: 2, desc: "", priority: "Priority", duration: 0, focus: false },
            ]
        }
    },
    methods: {
        newTask() {
            this.tasks.push({ id: this.tasks.length + 1, desc: "", priority: "Priority", duration: 0, focus: false })
            this.$nextTick(function() {
                $(".task-duration").timesetter();
            });
        },
        setDuration (id) {

            var container = $(".divTimeSetterContainer")[id-1];
            var txtHour = $(container).find("#txtHours");
            var txtMinute = $(container).find("#txtMinutes");

            var hourValue = 0;
            var minuteValue = 0;

            if ($.isNumeric(txtHour.val()) && $.isNumeric(txtMinute.val()))
            {
                hourValue = parseInt(txtHour.val());
                minuteValue = parseInt(txtMinute.val());
            }
            this.tasks[id-1].duration = ((hourValue * 60) + minuteValue);
        },
        sendData () {
            axios.post(TASK_API_URL, this.tasks)
                .then(function (response) {
                    var hour_start, min_start, hour_end, min_end;
                    var start_time = new Date();
                    start_time.setSeconds(0);
                    var end_time = new Date();
                    end_time.setSeconds(0);

                    response.data.forEach(function (task) {
                        hour_start = parseInt(task.start_time.split(':')[0])
                        min_start = parseInt(task.start_time.split(':')[1])
                        hour_end = parseInt(task.end_time.split(':')[0])
                        min_end = parseInt(task.end_time.split(':')[1])

                        start_time.setHours(hour_start);
                        start_time.setMinutes(min_start);
                        end_time.setHours(hour_end);
                        end_time.setMinutes(min_end);

                        task_obj = {
                            id: task.id,
                            title: task.desc,
                            start: start_time.toISOString(),
                            end: end_time.toISOString()
                        }
                        calendar.addEvent(task_obj);

                    });
                });
        }
    },
    template: listTemplate
});

Vue.config.devtools=true;

var app = new Vue({
    el: "#task-list"
});