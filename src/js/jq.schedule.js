(function ($) {
    'use strict';

    const PLUGIN_NAME = 'jqSchedule';

    var methods = {
        /**
         *
         * @param {string} str
         * @returns {number}
         */
        calcStringTime: function (str) {
            let slice = str.split(':');
            let h = Number(slice[0]) * 60 * 60;
            let i = Number(slice[1]) * 60;
            return h + i;
        },
        /**
         *
         * @param {number} val
         * @returns {string}
         */
        formatTime: function (val) {
            let i1 = (val % 3600);
            let h = '' + Math.floor(val / 36000) + Math.floor((val / 3600) % 10);
            let i = '' + Math.floor(i1 / 600) + Math.floor((i1 / 60) % 10);
            return h + ':' + i;
        },

        /**
         * 設定データの保存
         *
         * @param {Options} data
         * @returns {*}
         */
        _saveSettingData: function (data) {
            return this.data(PLUGIN_NAME + 'Setting', data);
        },

        /**
         * 設定データの取得
         *
         * @returns Options
         */
        _loadSettingData: function () {
            return this.data(PLUGIN_NAME + 'Setting');
        },

        /**
         * 保存データの保存
         *
         * @param {SaveData} data
         * @returns {*}
         */
        _saveData: function (data) {
            let d = $.extend({
                tableStartTime: 0,
                tableEndTime: 0,
                schedule: [],
                timeline: []
            }, data);
            return this.data(PLUGIN_NAME, d);
        },

        /**
         * 保存データの取得
         *
         * @returns SaveData
         */
        _loadData: function () {
            return this.data(PLUGIN_NAME);
        },

        /**
         * スケジュールの取得
         *
         * @returns ScheduleData[]
         */
        scheduleData: function () {
            let $this = $(this);
            let saveData = methods._loadData.apply($this);
            if (saveData) {
                return saveData.schedule;
            }
            return [];
        },
        /**
         * get timelineData
         * @returns {any[]}
         */
        timelineData: function () {
            let $this = $(this);
            let saveData = methods._loadData.apply($this);
            let data = [];
            let i;
            for (i in saveData.timeline) {
                data[i] = saveData.timeline[i];
                data[i].schedule = [];
            }
            for (i in saveData.schedule) {
                var d = saveData.schedule[i];
                if (typeof d.timeline === 'undefined') {
                    continue;
                }
                if (typeof data[d.timeline] === 'undefined') {
                    continue;
                }
                data[d.timeline].schedule.push(d);
            }
            return data;
        },
        /**
         * reset data
         */
        resetData: function () {
            return this.each(function () {
                let $this = $(this);
                let saveData = methods._loadData.apply($this);
                saveData.schedule = [];
                methods._saveData.apply($this, [saveData]);

                $this.find('.sc_bar').remove();
                for (var i in saveData.timeline) {
                    saveData.timeline[i].schedule = [];
                    methods._resizeRow.apply($this, [i, 0]);
                }
                methods._saveData.apply($this, [saveData]);
            });
        },
        /**
         * add schedule data
         *
         * @param {number} timeline
         * @param {object} data
         * @returns {methods}
         */
        addSchedule: function (timeline, data) {
            return this.each(function () {
                let $this = $(this);
                let d = {
                    start: data.start,
                    end: data.end,
                    startTime: methods.calcStringTime(data.start),
                    endTime: methods.calcStringTime(data.end),
                    text: data.text,
                    timeline: timeline
                };
                if (data.data) {
                    d.data = data.data;
                }
                methods._addScheduleData.apply($this, [timeline, d]);
                methods._resetBarPosition.apply($this, [timeline]);
            });
        },
        /**
         * add schedule data
         *
         * @param {number} timeline
         * @param {object} data
         * @returns {methods}
         */
        addRow: function (timeline, data) {
            return this.each(function () {
                let $this = $(this);
                methods._addRow.apply($this, [timeline, data]);
            });
        },
        /**
         * clear row
         *
         * @returns {methods}
         */
        resetRowData: function () {
            return this.each(function () {
                let $this = $(this);
                let data = methods._loadData.apply($this);
                data.schedule = [];
                data.timeline = [];
                methods._saveData.apply($this, [data]);
                $this.find('.sc_bar').remove();
                $this.find('.timeline').remove();
                $this.find('.sc_data').height(0);
            });
        },
        /**
         * clear row
         *
         * @param {object} data
         * @returns {methods}
         */
        setRows: function (data) {
            return this.each(function () {
                let $this = $(this);
                methods.resetRowData.apply($this, []);
                for (var timeline in data) {
                    methods.addRow.apply($this, [timeline, data[timeline]]);
                }
            });
        },
        /**
         * switch draggable
         * @param {boolean} enable
         */
        setDraggable: function (enable) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                if (enable !== setting.draggable) {
                    setting.draggable = enable;
                    methods._saveSettingData.apply($this, setting);
                    if (enable) {
                        $this.find('.sc_bar').draggable('enable');
                    } else {
                        $this.find('.sc_bar').draggable('disable');
                    }
                }
            });
        },
        /**
         * switch resizable
         * @param {boolean} enable
         */
        setResizable: function (enable) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                if (enable !== setting.resizable) {
                    setting.resizable = enable;
                    methods._saveSettingData.apply($this, setting);
                    if (enable) {
                        $this.find('.sc_bar').resizable('enable');
                    } else {
                        $this.find('.sc_bar').resizable('disable');
                    }
                }
            });
        },
        /**
         * 現在のタイムライン番号を取得
         *
         * @param node
         * @param top
         * @returns {number}
         */
        _getTimeLineNumber: function (node, top) {
            let $this = $(this);
            let setting = methods._loadSettingData.apply($this);
            let num = 0;
            let n = 0;
            let tn = Math.ceil(top / (setting.timeLineY + setting.timeLinePaddingTop + setting.timeLinePaddingBottom));
            for (var i in setting.rows) {
                let r = setting.rows[i];
                let tr = 0;
                if (typeof r.schedule === 'object') {
                    tr = r.schedule.length;
                }
                if (node && node.timeline) {
                    tr++;
                }
                n += Math.max(tr, 1);
                if (n >= tn) {
                    break;
                }
                num++;
            }
            return num;
        },
        /**
         * 背景データ追加
         *
         * @param {ScheduleData} data
         */
        _addScheduleBgData: function (data) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);
                let st = Math.ceil((data.startTime - saveData.tableStartTime) / setting.widthTime);
                let et = Math.floor((data.endTime - saveData.tableStartTime) / setting.widthTime);
                let $bar = $('<div class="sc_bgBar"><span class="text"></span></div>');
                $bar.css({
                    left: (st * setting.widthTimeX),
                    top: 0,
                    width: ((et - st) * setting.widthTimeX),
                    height: $this.find('.sc_main .timeline').eq(data.timeline).height()
                });
                if (data.text) {
                    $bar.find('.text').text(data.text);
                }
                if (data.class) {
                    $bar.addClass(data.class);
                }
                // $element.find('.sc_main').append($bar);
                $this.find('.sc_main .timeline').eq(data.timeline).append($bar);
            });
        },
        /**
         * スケジュール追加
         *
         * @param timeline
         * @param {ScheduleData} d
         * @returns {number}
         */
        _addScheduleData: function (timeline, d) {
            let data = d;
            data.startTime = data.startTime ? data.startTime : methods.calcStringTime(data.start);
            data.endTime = data.endTime ? data.endTime : methods.calcStringTime(data.end);

            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);

                let st = Math.ceil((data.startTime - saveData.tableStartTime) / setting.widthTime);
                let et = Math.floor((data.endTime - saveData.tableStartTime) / setting.widthTime);
                let $bar = $('<div class="sc_bar"><span class="head"><span class="time"></span></span><span class="text"></span></div>');
                let stext = methods.formatTime(data.startTime);
                let etext = methods.formatTime(data.endTime);
                let snum = methods._getScheduleCount.apply($this, [data.timeline]);
                $bar.css({
                    left: (st * setting.widthTimeX),
                    top: ((snum * setting.timeLineY) + setting.timeLinePaddingTop),
                    width: ((et - st) * setting.widthTimeX),
                    height: (setting.timeLineY)
                });
                $bar.find('.time').text(stext + '-' + etext);
                if (data.text) {
                    $bar.find('.text').text(data.text);
                }
                if (data.class) {
                    $bar.addClass(data.class);
                }
                // $this.find('.sc_main').append($bar);
                var $row = $this.find('.sc_main .timeline').eq(timeline);
                $row.append($bar);
                // データの追加
                saveData.schedule.push(data);
                methods._saveData.apply($this, [saveData]);
                // コールバックがセットされていたら呼出
                if (setting.onAppendSchedule) {
                    setting.onAppendSchedule.apply($this, [
                        $bar,
                        data
                    ]);
                }
                // key
                var key = saveData.schedule.length - 1;
                $bar.data('sc_key', key);

                $bar.on('mouseup', function () {
                    // コールバックがセットされていたら呼出
                    if (setting.onClick) {
                        if ($(this).data('dragCheck') !== true && $(this).data('resizeCheck') !== true) {
                            let $n = $(this);
                            let scKey = $n.data('sc_key');
                            setting.onClick.apply($this, [
                                $n,
                                saveData.schedule[scKey]
                            ]);
                        }
                    }
                });

                var $node = $this.find('.sc_bar');
                let currentNode = null;
                // move node.
                $node.draggable({
                    grid: [setting.widthTimeX, 1],
                    containment: $this.find('.sc_main'),
                    helper: 'original',
                    start: function (event, ui) {
                        let node = {};
                        node.node = this;
                        node.offsetTop = ui.position.top;
                        node.offsetLeft = ui.position.left;
                        node.currentTop = ui.position.top;
                        node.currentLeft = ui.position.left;
                        node.timeline = methods._getTimeLineNumber.apply($this, [currentNode, ui.position.top]);
                        node.nowTimeline = node.timeline;
                        currentNode = node;
                    },
                    /**
                     *
                     * @param {Event} event
                     * @param {function} ui
                     * @returns {boolean}
                     */
                    drag: function (event, ui) {
                        $(this).data('dragCheck', true);
                        if (!currentNode) {
                            return false;
                        }
                        let $moveNode = $(this);
                        let scKey = $moveNode.data('sc_key');
                        let timelineNum = methods._getTimeLineNumber.apply($this, [currentNode, ui.position.top]);
                        // eslint-disable-next-line no-param-reassign
                        ui.position.left = Math.floor(ui.position.left / setting.widthTimeX) * setting.widthTimeX;

                        if (currentNode.nowTimeline !== timelineNum) {
                            // 現在のタイムライン
                            currentNode.nowTimeline = timelineNum;
                        }
                        currentNode.currentTop = ui.position.top;
                        currentNode.currentLeft = ui.position.left;
                        // テキスト変更
                        methods._rewriteBarText.apply($this, [$moveNode, saveData.schedule[scKey]]);
                        return true;
                    },
                    // 要素の移動が終った後の処理
                    stop: function () {
                        $(this).data('dragCheck', false);
                        currentNode = null;

                        let $n = $(this);
                        let scKey = $n.data('sc_key');
                        let x = $n.position().left;
                        // var w = $n.width();
                        let start = saveData.tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                        // var end = saveData.tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                        let end = start + ((saveData.schedule[scKey].endTime - saveData.schedule[scKey].startTime));

                        saveData.schedule[scKey].start = methods.formatTime(start);
                        saveData.schedule[scKey].end = methods.formatTime(end);
                        saveData.schedule[scKey].startTime = start;
                        saveData.schedule[scKey].endTime = end;
                        // コールバックがセットされていたら呼出
                        if (setting.onChange) {
                            setting.onChange.apply($this, [
                                $n,
                                saveData.schedule[scKey]
                            ]);
                        }
                    }
                });
                let resizableHandles = ['e'];
                if (setting.resizableLeft) {
                    resizableHandles.push('w');
                }
                $node.resizable({
                    handles: resizableHandles.join(','),
                    grid: [setting.widthTimeX, setting.timeLineY - setting.timeBorder],
                    minWidth: setting.widthTimeX,
                    containment: $this.find('.sc_main_scroll'),
                    start: function () {
                        let $n = $(this);
                        $n.data('resizeCheck', true);
                    },
                    resize: function (ev, ui) {
                        // box-sizing: border-box; に対応
                        ui.element.height(ui.size.height);
                        ui.element.width(ui.size.width);
                    },
                    // 要素の移動が終った後の処理
                    stop: function () {
                        let $n = $(this);
                        let scKey = $n.data('sc_key');
                        let x = $n.position().left;
                        let w = $n.outerWidth();
                        let start = saveData.tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                        let end = saveData.tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                        let timelineNum = saveData.schedule[scKey].timeline;

                        saveData.schedule[scKey].start = methods.formatTime(start);
                        saveData.schedule[scKey].end = methods.formatTime(end);
                        saveData.schedule[scKey].startTime = start;
                        saveData.schedule[scKey].endTime = end;

                        // 高さ調整
                        methods._resetBarPosition.apply($this, [timelineNum]);
                        // テキスト変更
                        methods._rewriteBarText.apply($this, [$n, saveData.schedule[scKey]]);

                        $n.data('resizeCheck', false);
                        // コールバックがセットされていたら呼出
                        if (setting.onChange) {
                            setting.onChange.apply($this, [
                                $n,
                                saveData.schedule[scKey]
                            ]);
                        }
                    }
                });
                if (setting.draggable === false) {
                    $node.draggable('disable');
                }
                if (setting.resizable === false) {
                    $node.resizable('disable');
                }
                return key;
            });
        },
        /**
         * スケジュール数の取得
         *
         * @param {number} n row number
         * @returns {number}
         */
        _getScheduleCount: function (n) {
            let $this = $(this);
            let saveData = methods._loadData.apply($this);
            let num = 0;
            for (let i in saveData.schedule) {
                if (saveData.schedule[i].timeline === n) {
                    num++;
                }
            }
            return num;
        },
        /**
         * add rows
         *
         * @param timeline
         * @param row
         */
        _addRow: function (timeline, row) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);
                let id = $this.find('.sc_main .timeline').length;

                let html;

                html = '';
                html += '<div class="timeline"></div>';
                let $data = $(html);
                if (row.title) {
                    $data.append('<span class="timeline-title">' + row.title + '</span>');
                }
                if (row.subtitle) {
                    $data.append('<span class="timeline-subtitle">' + row.subtitle + '</span>');
                }
                // event call
                if (setting.onInitRow) {
                    setting.onInitRow.apply($this, [
                        $data,
                        row
                    ]);
                }
                $this.find('.sc_data_scroll').append($data);

                html = '';
                html += '<div class="timeline"></div>';
                let $timeline = $(html);
                for (var t = saveData.tableStartTime; t < saveData.tableEndTime; t += setting.widthTime) {
                    var $tl = $('<div class="tl"></div>');
                    $tl.outerWidth(setting.widthTimeX);

                    $tl.data('time', methods.formatTime(t));
                    $tl.data('timeline', timeline);
                    $timeline.append($tl);
                }
                // クリックイベント
                // left click
                $timeline.find('.tl').on('click', function () {
                    if (setting.onScheduleClick) {
                        setting.onScheduleClick.apply($this, [
                            this,
                            $(this).data('time'),
                            $(this).data('timeline'),
                            saveData.timeline[$(this).data('timeline')]
                        ]);
                    }
                });
                // right click
                $timeline.find('.tl').on('contextmenu', function () {
                    if (setting.onScheduleClick) {
                        setting.onScheduleClick.apply($this, [
                            this,
                            $(this).data('time'),
                            $(this).data('timeline'),
                            saveData.timeline[$(this).data('timeline')]
                        ]);
                    }
                    return false;
                });

                $this.find('.sc_main').append($timeline);

                saveData.timeline[timeline] = row;
                methods._saveData.apply($this, [saveData]);

                if (row.class && (row.class !== '')) {
                    $this.find('.sc_data .timeline').eq(id).addClass(row.class);
                    $this.find('.sc_main .timeline').eq(id).addClass(row.class);
                }
                // スケジュールタイムライン
                if (row.schedule) {
                    for (var i in row.schedule) {
                        var bdata = row.schedule[i];
                        var s = bdata.start ? bdata.start : methods.calcStringTime(bdata.startTime);
                        var e = bdata.end ? bdata.end : methods.calcStringTime(bdata.endTime);

                        var data = {};
                        data.start = s;
                        data.end = e;
                        if (bdata.text) {
                            data.text = bdata.text;
                        }
                        data.timeline = timeline;
                        data.data = {};
                        if (bdata.data) {
                            data.data = bdata.data;
                        }
                        methods._addScheduleData.apply($this, [id, data]);
                    }
                }
                // 高さの調整
                methods._resetBarPosition.apply($this, [id]);
                $this.find('.sc_main .timeline').eq(id).droppable({
                    accept: '.sc_bar',
                    drop: function (ev, ui) {
                        let node = ui.draggable;
                        let scKey = node.data('sc_key');
                        let nowTimelineNum = saveData.schedule[scKey].timeline;
                        let timelineNum = $this.find('.sc_main .timeline').index(this);
                        // タイムラインの変更
                        saveData.schedule[scKey].timeline = timelineNum;
                        node.appendTo(this);
                        // 高さ調整
                        methods._resetBarPosition.apply($this, [nowTimelineNum]);
                        methods._resetBarPosition.apply($this, [timelineNum]);
                    }
                });
                // コールバックがセットされていたら呼出
                if (setting.onAppendRow) {
                    $this.find('.sc_main .timeline').eq(id).find('.sc_bar').each(function () {
                        let $n = $(this);
                        let scKey = $n.data('sc_key');
                        setting.onAppendRow.apply($this, [
                            $n,
                            saveData.schedule[scKey]
                        ]);
                    });
                }
            });
        },
        /**
         * テキストの変更
         *
         * @param {jQuery} node
         * @param {Object} data
         */
        _rewriteBarText: function (node, data) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);
                let x = node.position().left;
                // var w = node.width();
                let start = saveData.tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                // var end = saveData.tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                let end = start + (data.endTime - data.startTime);
                let html = methods.formatTime(start) + '-' + methods.formatTime(end);
                $(node).find('.time').html(html);
            });
        },
        /**
         *
         * @param {Number} n
         */
        _resetBarPosition: function (n) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                // 要素の並び替え
                let $barList = $this.find('.sc_main .timeline').eq(n).find('.sc_bar');
                let codes = [], check = [];
                let h = 0;
                let $e1, $e2;
                let c1, c2, s1, s2, e1, e2;
                let i;
                for (i = 0; i < $barList.length; i++) {
                    codes[i] = {
                        code: i,
                        x: $($barList[i]).position().left
                    };
                }
                // ソート
                codes.sort(function (a, b) {
                    if (a.x < b.x) {
                        return -1;
                    }
                    if (a.x > b.x) {
                        return 1;
                    }
                    return 0;
                });
                for (i = 0; i < codes.length; i++) {
                    c1 = codes[i].code;
                    $e1 = $($barList[c1]);
                    for (h = 0; h < check.length; h++) {
                        let next = false;
                        for (var j = 0; j < check[h].length; j++) {
                            c2 = check[h][j];
                            $e2 = $($barList[c2]);

                            s1 = $e1.position().left;
                            e1 = $e1.position().left + $e1.outerWidth();
                            s2 = $e2.position().left;
                            e2 = $e2.position().left + $e2.outerWidth();
                            if (s1 < e2 && e1 > s2) {
                                next = true;
                                continue;
                            }
                        }
                        if (!next) {
                            break;
                        }
                    }
                    if (!check[h]) {
                        check[h] = [];
                    }
                    $e1.css({
                        top: (h * setting.timeLineY) + setting.timeLinePaddingTop
                    });
                    check[h][check[h].length] = c1;
                }
                // 高さの調整
                methods._resizeRow.apply($this, [n, check.length]);
            });
        },
        /**
         *
         * @param n
         * @param height
         */
        _resizeRow: function (n, height) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let h = Math.max(height, 1);
                $this.find('.sc_data .timeline').eq(n).outerHeight((h * setting.timeLineY) + setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);
                $this.find('.sc_main .timeline').eq(n).outerHeight((h * setting.timeLineY) + setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);

                $this.find('.sc_main .timeline').eq(n).find('.sc_bgBar').each(function () {
                    $(this).outerHeight($(this).closest('.timeline').outerHeight());
                });

                $this.find('.sc_data').outerHeight($this.find('.sc_main_box').outerHeight());
            });
        },
        /**
         * resizeWindow
         */
        _resizeWindow: function () {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);
                let scWidth = $this.width();
                let scMainWidth = scWidth - setting.dataWidth - (setting.verticalScrollbar);
                let cellNum = Math.floor((saveData.tableEndTime - saveData.tableStartTime) / setting.widthTime);
                $this.find('.sc_header_cell').width(setting.dataWidth);
                $this.find('.sc_data,.sc_data_scroll').width(setting.dataWidth);
                $this.find('.sc_header').width(scMainWidth);
                $this.find('.sc_main_box').width(scMainWidth);
                $this.find('.sc_header_scroll').width(setting.widthTimeX * cellNum);
                $this.find('.sc_main_scroll').width(setting.widthTimeX * cellNum);
            });
        },
        /**
         * move all cells of the right of the specified time line cell
         *
         * @param timeline
         * @param baseTimeLineCell
         * @param moveWidth
         */
        _moveSchedules: function (timeline, baseTimeLineCell, moveWidth) {
            return this.each(function () {
                let $this = $(this);
                let setting = methods._loadSettingData.apply($this);
                let saveData = methods._loadData.apply($this);
                let $barList = $this.find('.sc_main .timeline').eq(timeline).find('.sc_bar');
                for (let i = 0; i < $barList.length; i++) {
                    let $bar = $($barList[i]);
                    if (baseTimeLineCell.position().left <= $bar.position().left) {
                        let v1 = $bar.position().left + setting.widthTimeX * moveWidth;
                        let v2 = Math.floor((saveData.tableEndTime - saveData.tableStartTime) / setting.widthTime) * setting.widthTimeX - $bar.outerWidth();
                        $bar.css({
                            left: Math.max(0, Math.min(v1, v2))
                        });

                        let scKey = $bar.data('sc_key');
                        let start = saveData.tableStartTime + (Math.floor($bar.position().left / setting.widthTimeX) * setting.widthTime);
                        let end = start + ((saveData.schedule[scKey].end - saveData.schedule[scKey].start));
                        saveData.schedule[scKey].start = methods.formatTime(start);
                        saveData.schedule[scKey].end = methods.formatTime(end);
                        saveData.schedule[scKey].startTime = start;
                        saveData.schedule[scKey].endTime = end;
                        methods._rewriteBarText.apply($this, [$bar, saveData.schedule[scKey]]);

                        // if setting
                        if (setting.onChange) {
                            setting.onChange.apply($this, [
                                $bar,
                                saveData.schedule[scKey]
                            ]);
                        }
                    }
                }
                methods._resetBarPosition.apply($this, [timeline]);
            });
        },
        /**
         * initialize
         */
        init: function (options) {
            return this.each(function () {
                let $this = $(this);
                let config = $.extend({
                    className: 'jq-schedule',
                    rows: {},
                    startTime: '07:00',
                    endTime: '19:30',
                    widthTimeX: 25, // 1cell辺りの幅(px)
                    widthTime: 600, // 区切り時間(秒)
                    timeLineY: 50, // timeline height(px)
                    timeLineBorder: 1, // timeline height border
                    timeBorder: 1, // border width
                    timeLinePaddingTop: 0,
                    timeLinePaddingBottom: 0,
                    headTimeBorder: 1, // time border width
                    dataWidth: 160, // data width
                    verticalScrollbar: 0, // vertical scrollbar width
                    bundleMoveWidth: 1, // width to move all schedules to the right of the clicked time cell
                    draggable: true,
                    resizable: true,
                    resizableLeft: false,
                    // event
                    onInitRow: null,
                    onChange: null,
                    onClick: null,
                    onAppendRow: null,
                    onAppendSchedule: null,
                    onScheduleClick: null
                }, options);
                methods._saveSettingData.apply($this, [config]);

                let tableStartTime = methods.calcStringTime(config.startTime);
                let tableEndTime = methods.calcStringTime(config.endTime);
                tableStartTime -= (tableStartTime % config.widthTime);
                tableEndTime -= (tableEndTime % config.widthTime);
                methods._saveData.apply($this, [{
                    tableStartTime: tableStartTime,
                    tableEndTime: tableEndTime
                }]);

                let html = '' +
                    '<div class="sc_menu">' + '\n' +
                    '<div class="sc_header_cell"><span>&nbsp;</span></div>' + '\n' +
                    '<div class="sc_header">' + '\n' +
                    '<div class="sc_header_scroll"></div>' + '\n' +
                    '</div>' + '\n' +
                    '</div>' + '\n' +
                    '<div class="sc_wrapper">' + '\n' +
                    '<div class="sc_data">' + '\n' +
                    '<div class="sc_data_scroll"></div>' + '\n' +
                    '</div>' + '\n' +
                    '<div class="sc_main_box">' + '\n' +
                    '<div class="sc_main_scroll">' + '\n' +
                    '<div class="sc_main"></div>' + '\n' +
                    '</div>' + '\n' +
                    '</div>' + '\n' +
                    '</div>';

                $this.append(html);
                $this.addClass(config.className);

                $this.find('.sc_main_box').on('scroll', function () {
                    $this.find('.sc_data_scroll').css('top', $(this).scrollTop() * -1);
                    $this.find('.sc_header_scroll').css('left', $(this).scrollLeft() * -1);
                });
                // add time cell
                // var cellNum = Math.floor((tableEndTime - tableStartTime) / config.widthTime);
                let beforeTime = -1;
                for (let t = tableStartTime; t < tableEndTime; t += config.widthTime) {
                    if (
                        (beforeTime < 0)
                        || (Math.floor(beforeTime / 3600) !== Math.floor(t / 3600))) {
                        html = '';
                        html += '<div class="sc_time">' + methods.formatTime(t) + '</div>';
                        let $time = $(html);
                        let cn = Number(
                            Math.min((Math.ceil((t + config.widthTime) / 3600) * 3600), tableEndTime) -
                            t
                        );
                        let cellNum = Math.floor(cn / config.widthTime);
                        $time.width((cellNum * config.widthTimeX));
                        $this.find('.sc_header_scroll').append($time);

                        beforeTime = t;
                    }
                }

                $(window).on('resize', function () {
                    methods._resizeWindow.apply($this);
                }).trigger('resize');

                // addrow
                for (let i in config.rows) {
                    methods._addRow.apply($this, [i, config.rows[i]]);
                }
            });
        }
    };
    /**
     *
     * @param {Object|string} method
     * @returns {jQuery|methods|*}
     */
    // eslint-disable-next-line no-param-reassign
    $.fn.timeSchedule = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            // eslint-disable-next-line no-else-return
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        $.error('Method ' + method + ' does not exist on jQuery.timeSchedule');
        return this;
    };
}(jQuery));
