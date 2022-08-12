const TABS = document.querySelectorAll("[data-tab-target]")
const TAB_CONTENTS = document.querySelectorAll("[data-tab-content]")
const MILISECONDS_TO_HOURS = 3.6e6
const HOURS_TO_MINUTES = 60
const CURRENT_DATE = new Date()
const CURRENT_TIME = new Date().getTime() / MILISECONDS_TO_HOURS
const _name = new WeakMap()
const _deadline = new WeakMap()
const _priority = new WeakMap()
const _taskStatus = new WeakMap()

class Task {
    constructor(name, deadline, easiness, importance, duration) {
        const IMPORTANCE_LEVELS = [0.01, 0.2, 0.9]
        const URGENCY_LEVELS = [0.25, 0.25, 0.5]
        const TASK_DURATION = duration * HOURS_TO_MINUTES
        const TASK_DEADLINE_MINUTES = new Date(deadline).getTime() / MILISECONDS_TO_HOURS
        const TASK_TIME_LEFT = TASK_DEADLINE_MINUTES - CURRENT_TIME
        const URGENCY = Math.round(TASK_DURATION / TASK_TIME_LEFT)
        const PRIORITY = easiness * importance * URGENCY

        let measureTaskStatus = function () {
            const important = (TASK_IMPORTANCE === "Really Important" || TASK_IMPORTANCE === "Medium Important")
            const urgent = (TASK_URGENCY === "Urgent" || TASK_URGENCY === "Slightly Urgent")

            if (important && urgent) return 1
            else if (important && !urgent) return 2
            else if (!important && urgent) return 3
            else return 4
        }

        let measureTaskProperty = function (taskProperty, taskLevels, ...levelValues) {
            const [levelOne, levelTwo, levelThree] = taskLevels
            const [valueOne, valueTwo, valueThree] = levelValues

            if (taskProperty <= levelOne)
                return valueOne
            else if (taskProperty > levelTwo && taskProperty <= levelThree)
                return valueTwo
            else if (taskProperty > levelThree)
                return valueThree
        }

        const TASK_IMPORTANCE = measureTaskProperty(importance, IMPORTANCE_LEVELS, "Not Important", "Medium Important", "Really Important")
        const TASK_URGENCY = measureTaskProperty(URGENCY, URGENCY_LEVELS, "Not Urgent", "Slightly Urgent", "Urgent")
        _name.set(this, name)
        _deadline.set(this, deadline)
        _priority.set(this, PRIORITY)
        _taskStatus.set(this, measureTaskStatus())
    }

    get deadline() {
        return new Date(_deadline.get(this))
    }

    get priority() {
        return _priority.get(this)
    }

    postToTable() {
        const TASK_STATUSES = ["Urgent And Important", "Not Urgent, But Important",
            "Not Important, But Urgent", "Not Urgent And Not Important"]
        const TABLE_BODY = document.querySelector("[data-tasks-projects]")
        const TABLE_ROW = document.createElement("tr")
        const numbers = ["one", "two", "three", "four"]
        const name = _name.get(this)
        const deadline = _deadline.get(this)
        const taskStatus = _taskStatus.get(this)
        const htmlElement = `
            <tr>
                <td>${name}</td>
                <td>${deadline}</td>
                <td>
                    <p class="table__status table__status--${numbers[taskStatus - 1]}">${TASK_STATUSES[taskStatus - 1]}</p>
                </td>
            </tr>
        `
        TABLE_ROW.innerHTML = htmlElement
        TABLE_BODY.appendChild(TABLE_ROW)
    }

    postToMatrix() {
        const MATRIX_STATUSES = document.querySelectorAll("[data-status-tasks]")
        const LIST_ELEMENT = document.createElement("li")
        const name = _name.get(this)
        const taskStatus = _taskStatus.get(this)
        const htmlElement = `
            <li class="block--matrix__list-item">${name}</li>
        `
        LIST_ELEMENT.innerHTML = htmlElement
        MATRIX_STATUSES[taskStatus - 1].appendChild(LIST_ELEMENT)
    }
}

function manageSchedule(scheduleTimes, scheduleData, teacherNames) {
    const IS_HOLIDAY = (CURRENT_DATE.getDay() === 0 || CURRENT_DATE.getDay() === 6)
    const TABLE = document.querySelector("[data-schedule-table]")
    const TABLE_HEADING = document.querySelector("[data-schedule-heading]")
    const TABLE_BODY = document.querySelector("[data-schedule-table-body]")
    const HOLIDAY_BLOCKS = document.querySelectorAll("[data-holiday]")
    const date = formatDate(CURRENT_DATE)
    const dayIndex = CURRENT_DATE.getDay() - 1
    const currentScheduleTime = scheduleTimes[dayIndex]
    const currentTeachers = teacherNames[dayIndex]

    if (IS_HOLIDAY) {
        TABLE.classList.add("table--holiday")
        for (const holidayBlock of HOLIDAY_BLOCKS)
            holidayBlock.classList.add("holiday-active")
        return
    }

    TABLE.classList.remove("table--holiday")
    for (const holidayBlock of HOLIDAY_BLOCKS)
        holidayBlock.classList.remove("holiday-active")

    TABLE_HEADING.textContent = date

    currentScheduleTime.forEach((time, index) => {
        const data = scheduleData[dayIndex][index]
        const teacherName = currentTeachers[index]

        if (data === undefined || time === undefined) return

        const tableRow = document.createElement("tr")
        const htmlElement = `
            <tr>
                <td>${time}</td>
                <td>${data}</td>
                <td>${teacherName}</td>
            </tr>
        `
        tableRow.innerHTML = htmlElement
        TABLE_BODY.appendChild(tableRow)
    })
}

function manageTasks(tasks) {
    const noTasksBlocks = document.querySelectorAll("[data-no-tasks]")
    const tableBlock = document.querySelector("[data-table-tasks-projects]")
    const matrixBlock = document.querySelector("[data-priority-matrix]")

    if (tasks.length === 0) {
        for (const noTasksBlock of noTasksBlocks)
            noTasksBlock.classList.add("no-tasks-active")
        tableBlock.classList.add("table--no-tasks")
        matrixBlock.classList.add("matrix--no-tasks")
        return
    }

    for (const noTasksBlock of noTasksBlocks)
        noTasksBlock.classList.remove("no-tasks-active")
    tableBlock.classList.remove("table--no-tasks")
    matrixBlock.classList.remove("matrix--no-tasks")

    for (const task of tasks) {
        task.postToTable("[data-tasks-projects]")
        task.postToMatrix("[data-status-tasks]")
    }
}

function formatTime(date) {
    const hour = date.getHours()
    const minute = date.getMinutes()

    if (hour === 0 && minute === 0) return "Belum Diketahui"
    if (minute < 10) return `${hour}:0${minute}`
    return `${hour}:${minute}`
}

function formatDate(date) {
    const MONTHS = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ]
    const DAYS = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
        "Saturday", "Sunday"
    ]
    const MONTH_INDEX = date.getMonth()
    const DAY_INDEX = date.getDay()
    const YEAR = date.getFullYear()
    const MONTH = MONTHS[MONTH_INDEX]
    const DATE = date.getDate()
    const DAY_NAME = DAYS[DAY_INDEX]

    return `${DAY_NAME}, ${DATE} ${MONTH} ${YEAR}`
}

TABS.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.tabTarget)
        TAB_CONTENTS.forEach(tabContent => {
            tabContent.classList.remove("tab-active")
            tabContent.classList.remove("tab-active-grid")
            tabContent.classList.remove("tab-active-flex")
        })
        if (target.classList.contains("block--matrix")) {
            target.classList.add("tab-active-grid")
            return
        }
        else if (target.classList.contains("block--contact")) {
            target.classList.add("tab-active-flex")
            return
        }
        target.classList.add("tab-active")
    })
})

const SCHEDULE_TIMES = [
    ["07.00 - 07.15", "07.15 - 07.55", "07.55 - 08.35", "08.35 - 09.15",
        "09.15 - 09.55", "09.55 - 10.15", "10.15 - 10.55", "10.55 - 11.35",
        "11.35 - 12.15", "12.15 - 12.45", "12.45 - 13.25", "13.25 - 14.05", "14.05 - 14.45"],
    ["07.00 - 07.15", "07.15 - 07.55", "07.55 - 08.35", "08.35 - 09.15",
        "09.15 - 09.55", "09.55 - 10.15", "10.15 - 10.55", "10.55 - 11.35",
        "11.35 - 12.15", "12.15 - 12.45", "12.45 - 13.25", "13.25 - 14.05", "14.05 - 14.45"],
    ["07.00 - 07.15", "07.15 - 07.55", "07.55 - 08.35", "08.35 - 09.15",
        "09.15 - 09.55", "09.55 - 10.15", "10.15 - 10.55", "10.55 - 11.35",
        "11.35 - 12.15", "12.15 - 12.45", "12.45 - 13.25", "13.25 - 14.05", "14.05 - 14.45"],
    ["07.00 - 07.15", "07.15 - 07.55", "07.55 - 08.35", "08.35 - 09.15",
        "09.15 - 09.55", "09.55 - 10.15", "10.15 - 10.55", "10.55 - 11.35",
        "11.35 - 12.15", "12.15 - 12.45", "12.45 - 13.25", "13.25 - 14.05", "14.05 - 14.45"],
    ["07.00 - 07.15", "07.15 - 07.55", "07.55 - 08.35", "08.35 - 09.15",
        "09.15 - 09.55", "09.55 - 10.15", "10.15 - 10.55", "10.55 - 11.35",
        "11.35 - 12.15", "12.15 - 12.45", "12.45 - 13.25", "13.25 - 14.05", "14.05 - 14.45"]
]
const SCHEDULE_DATA = [ 
    ["Mat Peminatan", "Mat Peminatan", "Kimia", "Kimia", "Istirahat", "Sejarah Indo", 
    "Sejarah Indo", "Seni Rupa", "Istirahat", "Dharma Class", "KWH", "KWH"],
    ["Biologi", "Biologi", "Penjas", "Penjas", "Istirahat", "Mat. Umum", "Mat.Umum",
    "PPKN", "Istirahat", "PPKN", "Mandarin", "Mandarin"],
    ["B. Indo", "B. Indo", "HSK", "HSK", "Istirahat", "Kimia", "Kimia", "Fisika",
    "Istirahat", "Fisika", "Biologi", "Biologi"],
    ["Mat. Umum", "Mat. Umum", "English", "Seni Musik", "Istirahat", "TIK", "TIK",
    "Mandarin", "Istirahat", "Mandarin", "IELTS", "IELTS", "IELTS"],
    ["B. Indo", "B. Indo", "Fisika", "Fisika", "Istirahat", "English", "English",
    "Agama", "Istirahat", "Agama", "Mat. Peminatan", "Mat. Peminatan"]
]
const TEACHER_NAMES = [
    ["Pak Rocky", "Pak Rocky", "Pak Trisman", "Pak Trisman", "-", "Pak Gom", 
    "Pak Gom", "Pak Hanta", "-", "Pak Agung", "Pak If", "Pak If"],
    ["Bu Yo", "Bu Yo", "Pak Wagi", "Pak Wagi", "-", "Pak Rocky", "Pak Rocky",
    "Pak Pedro", "-", "Pak Pedro", "Chen Laoshi", "Chen Laoshi"],
    ["Bu Indah", "Bu Indah", "Laoshi Rosy", "Laoshi Rosy", "-", "Pak Trisman", "Pak Trisman", 
    "Pak Yuda", "-", "Pak Yuda", "Bu Yo", "Bu Yo"],
    ["Pak Rocky", "Pak Rocky", "Mr. Karel", "Pak Nana", "-", "Bu Karti", "Bu Karti",
    "Chen Laoshi", "-", "Chen Laoshi", "Mr. Day", "Mr. Day"],
    ["Bu Indah", "Bu Indah", "Pak Yuda", "Pak Yuda", "-", "Mr. Karel", "Mr. Karel",
    "Pak Agung", "-", "Pak Agung", "Pak Rocky", "Pak Rocky"]
]
const WEEK_DATES = [
    "8 August 2022", "9 August 2022", "10 August 2022", "11 August 2022", "12 August 2022",
    "13 August 2022", "14 August 2022"
]
const TASKS = [
    new Task("Project 3D Sel", "16 September 2022", 0.9, 0.9, 10),
    new Task("Project Presentasi IELTS", "15 September 2022", 0.9, 0.9, 6)
]
const FILTERED_TASKS = TASKS.filter((task) => task.deadline.getTime() - CURRENT_DATE.getTime() > 0)
    .sort((a, b) => b.priority - a.priority)


manageSchedule(SCHEDULE_TIMES, SCHEDULE_DATA, TEACHER_NAMES)
manageTasks(FILTERED_TASKS)



