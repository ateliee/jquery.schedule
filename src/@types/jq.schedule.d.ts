
interface ScheduleData {
    start: string
    end: string
    startTime: number
    endTime: number
    text: string
    timeline?: number
    data: {[s: string]: any}
}
interface RowData {
    title: string
    schedule: ScheduleData[]
}

/**
 * オプション設定
 */
interface Options {
    className?: string
    rows: {[s: string]: RowData}
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
    resizableLeft?: boolean
    onInitRow?(node: jQuery, data: RowData): void
    onChange?(timeline: number, data: ScheduleData): void
    onClick?(node: jQuery, data: ScheduleData): void
    onAppendRow?(node: jQuery, data: ScheduleData): void
    onAppendSchedule?(node: jQuery, data: ScheduleData): void
    onScheduleClick?(node: jQuery, time: string, data: ScheduleData): void
}
interface SaveData {
    tableStartTime: number
    tableEndTime: number
    schedule: ScheduleData[]
    timeline: Object[]
}
interface jQuery {
    timeSchedule(options: Options): jQuery;
    timeSchedule(method: "timelineData"): RowData[];
    timeSchedule(method: "scheduleData"): RowData[];
    timeSchedule(method: "resetData"): jQuery;
    timeSchedule(method: "resetRowData"): jQuery;
    timeSchedule(method: "setDraggable" | "setResizable", enable: boolean): jQuery;
    timeSchedule(method: "setRows", data: RowData): RowData;
    timeSchedule(method: "addSchedule", timeline: number, data: ScheduleData): jQuery;
    timeSchedule(method: "addRow", timeline: number, data: RowData): jQuery;
    timeSchedule(method: "formatTime", val: number): string;
    timeSchedule(method: "calcStringTime", str: string): number;
}