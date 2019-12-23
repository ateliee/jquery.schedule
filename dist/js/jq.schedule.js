(function ($) {
    'use strict';

    var setting = null;
    var scheduleData = [];
    var timelineData = [];
    var $element, element;
    var currentNode = null;
    var tableStartTime = 0;
    var tableEndTime = 0;

    var methods = {
        /**
         *
         * @param {string} str
         * @returns {number}
         */
        calcStringTime: function (str) {
            var slice = str.split(':');
            var h = Number(slice[0]) * 60 * 60;
            var i = Number(slice[1]) * 60;
            return h + i;
        },
        /**
         *
         * @param {number} val
         * @returns {string}
         */
        formatTime: function (val) {
            var h = '' + (val / 36000 | 0) + (val / 3600 % 10 | 0);
            var i = '' + (val % 3600 / 600 | 0) + (val % 3600 / 60 % 10 | 0);
            return h + ':' + i;
        },

        /**
         * get scheduleData
         * @returns {any[]}
         */
        scheduleData: function () {
            return scheduleData;
        },
        /**
         * get timelineData
         * @returns {any[]}
         */
        timelineData: function () {
            var data = [];
            var i;
            for (i in timelineData) {
                data[i] = timelineData[i];
                data[i].schedule = [];
            }
            for (i in scheduleData) {
                var d = scheduleData[i];
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
            scheduleData = [];
            $element.find('.sc_bar').remove();
            for (var i in timelineData) {
                timelineData[i].schedule = [];
                methods._resizeRow.apply(this, [i, 0]);
            }
            return this;
        },
        /**
         * add schedule data
         *
         * @param {number} timeline
         * @param {object} data
         * @returns {methods}
         */
        addSchedule: function (timeline, data) {
            var d = {
                start: methods.calcStringTime(data.start),
                end: methods.calcStringTime(data.end),
                text: data.text,
                timeline: timeline
            };
            if (data.data) {
                d.data = data.data;
            }
            methods._addScheduleData.apply(this, [timeline, d]);
            methods._resetBarPosition.apply(this, [timeline]);
            return this;
        },
        /**
         * add schedule data
         *
         * @param {number} timeline
         * @param {object} data
         * @returns {methods}
         */
        addRow: function (timeline, data) {
            methods._addRow.apply(this, [timeline, data]);
            return this;
        },
        /**
         * clear row
         *
         * @returns {methods}
         */
        resetRowData: function () {
            scheduleData = [];
            timelineData = [];
            $element.find('.sc_bar').remove();
            $element.find('.timeline').remove();
            $element.find('.sc_data').height(0);
            return this;
        },
        /**
         * clear row
         *
         * @param {object} data
         * @returns {methods}
         */
        setRows: function (data) {
            methods.resetRowData.apply(this, []);
            for (var timeline in data) {
                methods.addRow.apply(this, [timeline, data[timeline]]);
            }
            return this;
        },
        /**
         * switch draggable
         * @param {boolean} enable
         */
        setDraggable: function (enable) {
            var e = enable ? true : false;
            if (e !== setting.draggable) {
                setting.draggable = e;
                if (e) {
                    $element.find('.sc_bar').draggable('enable');
                } else {
                    $element.find('.sc_bar').draggable('disable');
                }
            }
        },
        /**
         * switch resizable
         * @param {boolean} enable
         */
        setResizable: function (enable) {
            var e = enable ? true : false;
            if (e !== setting.resizable) {
                setting.resizable = e;
                if (e) {
                    $element.find('.sc_bar').resizable('enable');
                } else {
                    $element.find('.sc_bar').resizable('disable');
                }
            }
        },
        /**
         * 現在のタイムライン番号を取得
         *
         * @param top
         * @returns {number}
         */
        _getTimeLineNumber: function (top) {
            var num = 0;
            var n = 0;
            var tn = Math.ceil(top / (setting.timeLineY + setting.timeLinePaddingTop + setting.timeLinePaddingBottom));
            for (var i in setting.rows) {
                var r = setting.rows[i];
                var tr = 0;
                if (typeof r.schedule === 'object') {
                    tr = r.schedule.length;
                }
                if (currentNode && currentNode.timeline) {
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
         * @param data
         */
        _addScheduleBgData: function (data) {
            var st = Math.ceil((data.start - tableStartTime) / setting.widthTime);
            var et = Math.floor((data.end - tableStartTime) / setting.widthTime);
            var $bar = $('<div class="sc_bgBar"><span class="text"></span></div>');
            // var stext = element.formatTime(data.start);
            // var etext = element.formatTime(data.end);
            // var snum = element._getScheduleCount(data.timeline);
            $bar.css({
                left: (st * setting.widthTimeX),
                top: 0,
                width: ((et - st) * setting.widthTimeX),
                height: $element.find('.sc_main .timeline').eq(data.timeline).height()
            });
            if (data.text) {
                $bar.find('.text').text(data.text);
            }
            if (data.class) {
                $bar.addClass(data.class);
            }
            // $element.find('.sc_main').append($bar);
            $element.find('.sc_main .timeline').eq(data.timeline).append($bar);
        },
        /**
         * スケジュール追加
         *
         * @param timeline
         * @param data
         * @returns {number}
         */
        _addScheduleData: function (timeline, data) {
            var st = Math.ceil((data.start - tableStartTime) / setting.widthTime);
            var et = Math.floor((data.end - tableStartTime) / setting.widthTime);
            var $bar = $('<div class="sc_bar"><span class="head"><span class="time"></span></span><span class="text"></span></div>');
            var stext = methods.formatTime(data.start);
            var etext = methods.formatTime(data.end);
            var snum = methods._getScheduleCount.apply(element, [data.timeline]);
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
            // $element.find('.sc_main').append($bar);
            var $row = $element.find('.sc_main .timeline').eq(timeline);
            $row.append($bar);
            // データの追加
            scheduleData.push(data);
            // コールバックがセットされていたら呼出
            if (setting.onAppendSchedule) {
                setting.onAppendSchedule($bar, data);
            }
            // key
            var key = scheduleData.length - 1;
            $bar.data('sc_key', key);

            $bar.bind('mouseup', function () {
                // コールバックがセットされていたら呼出
                if (setting.onClick) {
                    if ($(this).data('dragCheck') !== true && $(this).data('resizeCheck') !== true) {
                        var node = $(this);
                        var scKey = node.data('sc_key');
                        setting.onClick(node, scheduleData[scKey]);
                    }
                }
            });

            var $node = $element.find('.sc_bar');
            // move node.
            $node.draggable({
                grid: [setting.widthTimeX, 1],
                containment: '.sc_main',
                helper: 'original',
                start: function (event, ui) {
                    var node = {};
                    node.node = this;
                    node.offsetTop = ui.position.top;
                    node.offsetLeft = ui.position.left;
                    node.currentTop = ui.position.top;
                    node.currentLeft = ui.position.left;
                    node.timeline = methods._getTimeLineNumber.apply(element, [ui.position.top]);
                    node.nowTimeline = node.timeline;
                    currentNode = node;
                },
                drag: function (event, ui) {
                    $(this).data('dragCheck', true);
                    if (!currentNode) {
                        return false;
                    }
                    var $moveNode = $(this);
                    var scKey = $moveNode.data('sc_key');
                    // var originalTop = ui.originalPosition.top;
                    // var originalLeft = ui.originalPosition.left;
                    // var positionTop = ui.position.top;
                    // var positionLeft = ui.position.left;
                    var timelineNum = methods._getTimeLineNumber.apply(element, [ui.position.top]);
                    // 位置の修正
                    // ui.position.top = Math.floor(ui.position.top / setting.timeLineY) * setting.timeLineY;
                    // ui.position.top = element._getScheduleCount(timelineNum) * setting.timeLineY;
                    ui.position.left = Math.floor(ui.position.left / setting.widthTimeX) * setting.widthTimeX;


                    // $moveNode.find(".text").text(timelineNum+" "+(element._getScheduleCount(timelineNum) + 1));
                    if (currentNode.nowTimeline !== timelineNum) {
                        // 高さの調節
                        // element._resizeRow(currentNode["nowTimeline"],element._getScheduleCount(currentNode["nowTimeline"]));
                        // element._resizeRow(timelineNum,element._getScheduleCount(timelineNum) + 1);
                        // 現在のタイムライン
                        currentNode.nowTimeline = timelineNum;
                        // } else {
                        // ui.position.top = currentNode["currentTop"];
                    }
                    currentNode.currentTop = ui.position.top;
                    currentNode.currentLeft = ui.position.left;
                    // テキスト変更
                    methods._rewriteBarText.apply(element, [$moveNode, scheduleData[scKey]]);
                    return true;
                },
                // 要素の移動が終った後の処理
                stop: function () {
                    $(this).data('dragCheck', false);
                    currentNode = null;

                    var node = $(this);
                    var scKey = node.data('sc_key');
                    var x = node.position().left;
                    // var w = node.width();
                    var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                    // var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                    var end = start + ((scheduleData[scKey].end - scheduleData[scKey].start));

                    scheduleData[scKey].start = start;
                    scheduleData[scKey].end = end;
                    // コールバックがセットされていたら呼出
                    if (setting.onChange) {
                        setting.onChange(node, scheduleData[scKey]);
                    }
                }
            });
            $node.resizable({
                handles: 'e',
                grid: [setting.widthTimeX, setting.timeLineY],
                minWidth: setting.widthTimeX,
                start: function () {
                    var node = $(this);
                    node.data('resizeCheck', true);
                },
                resize: function (ev, ui) {
                    // box-sizing: border-box; に対応
                    ui.element.height(ui.size.height);
                    ui.element.width(ui.size.width);
                },
                // 要素の移動が終った後の処理
                stop: function () {
                    var node = $(this);
                    var scKey = node.data('sc_key');
                    var x = node.position().left;
                    var w = node.outerWidth();
                    var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                    var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                    var timelineNum = scheduleData[scKey].timeline;

                    scheduleData[scKey].start = start;
                    scheduleData[scKey].end = end;

                    // 高さ調整
                    methods._resetBarPosition.apply(element, [timelineNum]);
                    // テキスト変更
                    methods._rewriteBarText.apply(element, [node, scheduleData[scKey]]);

                    node.data('resizeCheck', false);
                    // コールバックがセットされていたら呼出
                    if (setting.onChange) {
                        setting.onChange(node, scheduleData[scKey]);
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
        },
        /**
         * スケジュール数の取得
         *
         * @param {number} n row number
         * @returns {number}
         */
        _getScheduleCount: function (n) {
            var num = 0;
            for (var i in scheduleData) {
                if (scheduleData[i].timeline === n) {
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
            var title = row.title;
            var id = $element.find('.sc_main .timeline').length;

            var html;

            html = '';
            html += '<div class="timeline"><span>' + title + '</span></div>';
            var $data = $(html);
            // event call
            if (setting.onInitRow) {
                setting.onInitRow($data, row);
            }
            $element.find('.sc_data_scroll').append($data);

            html = '';
            html += '<div class="timeline"></div>';
            var $timeline = $(html);
            for (var t = tableStartTime; t < tableEndTime; t += setting.widthTime) {
                var $tl = $('<div class="tl"></div>');
                $tl.outerWidth(setting.widthTimeX);

                $tl.data('time', methods.formatTime(t));
                $tl.data('timeline', timeline);
                $timeline.append($tl);
            }
            // クリックイベント
            // left click
            $timeline.find('.tl').click(function () {
                // element._moveSchedules($(this).data('timeline'), $(this), setting.bundleMoveWidth);
                if (setting.onScheduleClick) {
                    setting.onScheduleClick(this, $(this).data('time'), $(this).data('timeline'), timelineData[$(this).data('timeline')]);
                }
            });
            // right click
            $timeline.find('.tl').on('contextmenu', function () {
                // element._moveSchedules($(this).data('timeline'), $(this), -1 * setting.bundleMoveWidth);
                if (setting.onScheduleClick) {
                    setting.onScheduleClick(this, $(this).data('time'), $(this).data('timeline'), timelineData[$(this).data('timeline')]);
                }
                return false;
            });

            $element.find('.sc_main').append($timeline);

            timelineData[timeline] = row;

            if (row.class && (row.class !== '')) {
                $element.find('.sc_data .timeline').eq(id).addClass(row.class);
                $element.find('.sc_main .timeline').eq(id).addClass(row.class);
            }
            // スケジュールタイムライン
            if (row.schedule) {
                for (var i in row.schedule) {
                    var bdata = row.schedule[i];
                    var s = methods.calcStringTime(bdata.start);
                    var e = methods.calcStringTime(bdata.end);

                    var data = {};
                    data.start = s;
                    data.end = e;
                    if (bdata.text) {
                        data.text = bdata.text;
                    }
                    data.timeline = i;
                    data.data = {};
                    if (bdata.data) {
                        data.data = bdata.data;
                    }
                    methods._addScheduleData.apply(element, [id, data]);
                }
            }
            // 高さの調整
            methods._resetBarPosition.apply(element, [id]);
            $element.find('.sc_main .timeline').eq(id).droppable({
                accept: '.sc_bar',
                drop: function (ev, ui) {
                    var node = ui.draggable;
                    var scKey = node.data('sc_key');
                    var nowTimelineNum = scheduleData[scKey].timeline;
                    var timelineNum = $element.find('.sc_main .timeline').index(this);
                    // タイムラインの変更
                    scheduleData[scKey].timeline = timelineNum;
                    node.appendTo(this);
                    // 高さ調整
                    methods._resetBarPosition.apply(element, [nowTimelineNum]);
                    methods._resetBarPosition.apply(element, [timelineNum]);
                }
            });
            // コールバックがセットされていたら呼出
            if (setting.onAppendRow) {
                $element.find('.sc_main .timeline').eq(id).find('.sc_bar').each(function () {
                    var node = $(this);
                    var scKey = node.data('sc_key');
                    setting.onAppendRow(node, scheduleData[scKey]);
                });
            }
        },
        /**
         * テキストの変更
         *
         * @param node
         * @param data
         */
        _rewriteBarText: function (node, data) {
            var x = node.position().left;
            // var w = node.width();
            var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
            // var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
            var end = start + (data.end - data.start);
            var html = methods.formatTime(start) + '-' + methods.formatTime(end);
            $(node).find('.time').html(html);
        },
        /**
         *
         * @param n
         */
        _resetBarPosition: function (n) {
            // 要素の並び替え
            var $barList = $element.find('.sc_main .timeline').eq(n).find('.sc_bar');
            var codes = [];
            var check = [];
            var h = 0;
            var $e1;
            var $e2;
            var c1;
            var c2;
            var s1;
            var s2;
            var e1;
            var e2;
            var i;
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
                    var next = false;
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
                    top: ((h * setting.timeLineY) + setting.timeLinePaddingTop)
                });
                check[h][check[h].length] = c1;
            }
            // 高さの調整
            methods._resizeRow.apply(this, [n, check.length]);
        },
        /**
         *
         * @param n
         * @param height
         */
        _resizeRow: function (n, height) {
            var h = Math.max(height, 1);
            $element.find('.sc_data .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);
            $element.find('.sc_main .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);

            $element.find('.sc_main .timeline').eq(n).find('.sc_bgBar').each(function () {
                $(this).height($(this).closest('.timeline').height());
            });

            $element.find('.sc_data').height($element.find('.sc_main_box').height());
        },
        /**
         * resizeWindow
         */
        _resizeWindow: function () {
            var scWidth = $element.width();
            var scMainWidth = scWidth - setting.dataWidth - (setting.verticalScrollbar);
            var cellNum = Math.floor((tableEndTime - tableStartTime) / setting.widthTime);
            $element.find('.sc_header_cell').width(setting.dataWidth);
            $element.find('.sc_data,.sc_data_scroll').width(setting.dataWidth);
            $element.find('.sc_header').width(scMainWidth);
            $element.find('.sc_main_box').width(scMainWidth);
            $element.find('.sc_header_scroll').width(setting.widthTimeX * cellNum);
            $element.find('.sc_main_scroll').width(setting.widthTimeX * cellNum);
        },
        /**
         * move all cells of the right of the specified time line cell
         *
         * @param timeline
         * @param baseTimeLineCell
         * @param moveWidth
         */
        _moveSchedules: function (timeline, baseTimeLineCell, moveWidth) {
            var $barList = $element.find('.sc_main .timeline').eq(timeline).find('.sc_bar');
            for (var i = 0; i < $barList.length; i++) {
                var $bar = $($barList[i]);
                if (baseTimeLineCell.position().left <= $bar.position().left) {
                    var v1 = $bar.position().left + setting.widthTimeX * moveWidth;
                    var v2 = Math.floor((tableEndTime - tableStartTime) / setting.widthTime) * setting.widthTimeX - $bar.outerWidth();
                    $bar.css({
                        left: Math.max(0, Math.min(v1, v2))
                    });

                    var scKey = $bar.data('sc_key');
                    var start = tableStartTime + (Math.floor($bar.position().left / setting.widthTimeX) * setting.widthTime);
                    var end = start + ((scheduleData[scKey].end - scheduleData[scKey].start));
                    scheduleData[scKey].start = start;
                    scheduleData[scKey].end = end;
                    methods._rewriteBarText.apply(element, [$bar, scheduleData[scKey]]);

                    // if setting
                    if (setting.onChange) {
                        setting.onChange($bar, scheduleData[scKey]);
                    }
                }
            }
            methods._resetBarPosition.apply(element, [timeline]);
        },
        /**
         * initialize
         */
        init: function (options) {
            $element = $(this);
            element = (this);
            setting = $.extend({
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
                // event
                onInitRow: null,
                onChange: null,
                onClick: null,
                onAppendRow: null,
                onAppendSchedule: null,
                onScheduleClick: null
            }, options);
            tableStartTime = methods.calcStringTime(setting.startTime);
            tableEndTime = methods.calcStringTime(setting.endTime);
            tableStartTime -= (tableStartTime % setting.widthTime);
            tableEndTime -= (tableEndTime % setting.widthTime);

            var html = '' +
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

            $element.append(html);
            $element.addClass(setting.className);

            $element.find('.sc_main_box').scroll(function () {
                $element.find('.sc_data_scroll').css('top', $(this).scrollTop() * -1);
                $element.find('.sc_header_scroll').css('left', $(this).scrollLeft() * -1);
            });
            // add time cell
            // var cellNum = Math.floor((tableEndTime - tableStartTime) / setting.widthTime);
            var beforeTime = -1;
            for (var t = tableStartTime; t < tableEndTime; t += setting.widthTime) {
                if (
                    (beforeTime < 0)
                    || (Math.floor(beforeTime / 3600) !== Math.floor(t / 3600))) {
                    html = '';
                    html += '<div class="sc_time">' + methods.formatTime(t) + '</div>';
                    var $time = $(html);
                    var cn = Number(
                        Math.min((Math.ceil((t + setting.widthTime) / 3600) * 3600), tableEndTime) -
                        t
                    );
                    var cellNum = Math.floor(cn / setting.widthTime);
                    $time.width((cellNum * setting.widthTimeX));
                    $element.find('.sc_header_scroll').append($time);

                    beforeTime = t;
                }
            }

            $(window).resize(function () {
                methods._resizeWindow.apply(element);
            }).trigger('resize');

            // addrow
            for (var i in setting.rows) {
                methods._addRow.apply(this, [i, setting.rows[i]]);
            }
            return this;
        }
    };
    $.fn.timeSchedule = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.timeSchedule');
        }
        return this;
    };
}(jQuery));
