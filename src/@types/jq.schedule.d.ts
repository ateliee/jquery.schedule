
interface ScheduleData {
    start: string
    end: string
    text: string
    timeline?: number
    data: {[s: string]: any}
}
interface Data {
    title: string
    schedule: ScheduleData[]
}
interface Options {
    className?: string
    rows: {[s: string]: Data}
    startTime?: string
    endTime?: string
    widthTimeX?: number
    widthTime?: number
    timeLineY?: number
    timeLineBorder?: number
    timeBorder?: number
    timeLinePaddingTop?: number
    timeLinePaddingBotto?: number
    headTimeBorder?: number
    dataWidth?: number
    verticalScrollbar?: number
    bundleMoveWidth?: number
    draggable?: boolean
    resizable?: boolean
    onInitRow?(node: jQuery, data: Data): void
    onChange?(timeline: number, data: ScheduleData): void
    onClick?(node: jQuery, data: ScheduleData): void
    onAppendRow?(node: jQuery, data: ScheduleData): void
    onAppendSchedule?(node: jQuery, data: ScheduleData): void
    onScheduleClick?(node: jQuery, time: string, data: ScheduleData): void
}
interface jQuery {
    timeSchedule(options: Options): jQuery;
    timeSchedule(method: "timelineData"): Data[];
    timeSchedule(method: "scheduleData"): Data[];
    timeSchedule(method: "resetData"): jQuery;
    timeSchedule(method: "resetRowData"): jQuery;
    timeSchedule(method: "setDraggable" | "setResizable", enable: boolean): jQuery;
    timeSchedule(method: "setRows", data: Data): Data;
    timeSchedule(method: "addSchedule", timeline: number, data: ScheduleData): jQuery;
    timeSchedule(method: "addRow", timeline: number, data: Data): jQuery;
    timeSchedule(method: "formatTime", val: number): string;
    timeSchedule(method: "calcStringTime", str: string): number;
}