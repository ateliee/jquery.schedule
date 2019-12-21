(function ($) {
    'use strict';

    $.fn.timeSchedule = function (options) {
        var defaults = {
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
            // event
            init_data: null,
            change: null,
            click: null,
            append: null,
            time_click: null,
            debug: '' // debug selecter
        };
        var setting = $.extend(defaults, options);
        this.setting = setting;
        var scheduleData = new Array();
        var timelineData = new Array();
        var $element = $(this);
        var element = (this);
        var currentNode = null;
        var tableStartTime = 0;
        var tableEndTime = 0;

        /**
         *
         * @param {string} string
         * @returns {number}
         */
        this.calcStringTime = function (string) {
            var slice = string.split(':');
            var h = Number(slice[0]) * 60 * 60;
            var i = Number(slice[1]) * 60;
            var min = h + i;
            return min;
        };
        /**
         *
         * @param {number} min
         * @returns {string}
         */
        this.formatTime = function (min) {
            var h = '' + (min / 36000 | 0) + (min / 3600 % 10 | 0);
            var i = '' + (min % 3600 / 600 | 0) + (min % 3600 / 60 % 10 | 0);
            var string = h + ':' + i;
            return string;
        };

        /**
         *
         * @returns {any[]}
         */
        this.getScheduleData = function () {
            return scheduleData;
        };
        /**
         *
         * @returns {any[]}
         */
        this.getTimelineData = function () {
            return timelineData;
        };
        /**
         * 現在のタイムライン番号を取得
         *
         * @param top
         * @returns {number}
         */
        this.getTimeLineNumber = function (top) {
            var num = 0;
            var n = 0;
            var tn = Math.ceil(top / (setting.timeLineY + setting.timeLinePaddingTop + setting.timeLinePaddingBottom));
            for (var i in setting.rows) {
                var r = setting.rows[i];
                var tr = 0;
                if (typeof r.schedule === Object) {
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
        };
        /**
         * 背景データ追加
         *
         * @param data
         */
        this.addScheduleBgData = function (data) {
            var st = Math.ceil((data.start - tableStartTime) / setting.widthTime);
            var et = Math.floor((data.end - tableStartTime) / setting.widthTime);
            var $bar = jQuery('<div class="sc_bgBar"><span class="text"></span></div>');
            var stext = element.formatTime(data.start);
            var etext = element.formatTime(data.end);
            var snum = element.getScheduleCount(data.timeline);
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
        };
        /**
         * スケジュール追加
         *
         * @param data
         * @returns {number}
         */
        this.addScheduleData = function (data) {
            var st = Math.ceil((data.start - tableStartTime) / setting.widthTime);
            var et = Math.floor((data.end - tableStartTime) / setting.widthTime);
            var $bar = jQuery('<div class="sc_bar"><span class="head"><span class="time"></span></span><span class="text"></span></div>');
            var stext = element.formatTime(data.start);
            var etext = element.formatTime(data.end);
            var snum = element.getScheduleCount(data.timeline);
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
            $element.find('.sc_main .timeline').eq(data.timeline).append($bar);
            // データの追加
            scheduleData.push(data);
            // key
            var key = scheduleData.length - 1;
            $bar.data('sc_key', key);

            $bar.bind('mouseup', function () {
                // コールバックがセットされていたら呼出
                if (setting.click) {
                    if (jQuery(this).data('dragCheck') !== true && jQuery(this).data('resizeCheck') !== true) {
                        var node = jQuery(this);
                        var sc_key = node.data('sc_key');
                        setting.click(node, scheduleData[sc_key]);
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
                    node.timeline = element.getTimeLineNumber(ui.position.top);
                    node.nowTimeline = node.timeline;
                    currentNode = node;
                },
                drag: function (event, ui) {
                    jQuery(this).data('dragCheck', true);
                    if (!currentNode) {
                        return false;
                    }
                    var $moveNode = jQuery(this);
                    var sc_key = $moveNode.data('sc_key');
                    var originalTop = ui.originalPosition.top;
                    var originalLeft = ui.originalPosition.left;
                    var positionTop = ui.position.top;
                    var positionLeft = ui.position.left;
                    var timelineNum = element.getTimeLineNumber(ui.position.top);
                    // 位置の修正
                    // ui.position.top = Math.floor(ui.position.top / setting.timeLineY) * setting.timeLineY;
                    // ui.position.top = element.getScheduleCount(timelineNum) * setting.timeLineY;
                    ui.position.left = Math.floor(ui.position.left / setting.widthTimeX) * setting.widthTimeX;


                    // $moveNode.find(".text").text(timelineNum+" "+(element.getScheduleCount(timelineNum) + 1));
                    if (currentNode.nowTimeline !== timelineNum) {
                        // 高さの調節
                        // element.resizeRow(currentNode["nowTimeline"],element.getScheduleCount(currentNode["nowTimeline"]));
                        // element.resizeRow(timelineNum,element.getScheduleCount(timelineNum) + 1);
                        // 現在のタイムライン
                        currentNode.nowTimeline = timelineNum;
                    } else {
                        // ui.position.top = currentNode["currentTop"];
                    }
                    currentNode.currentTop = ui.position.top;
                    currentNode.currentLeft = ui.position.left;
                    // テキスト変更
                    element.rewriteBarText($moveNode, scheduleData[sc_key]);
                    return true;
                },
                // 要素の移動が終った後の処理
                stop: function (event, ui) {
                    jQuery(this).data('dragCheck', false);
                    currentNode = null;

                    var node = jQuery(this);
                    var sc_key = node.data('sc_key');
                    var x = node.position().left;
                    var w = node.width();
                    var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                    // var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                    var end = start + ((scheduleData[sc_key].end - scheduleData[sc_key].start));

                    scheduleData[sc_key].start = start;
                    scheduleData[sc_key].end = end;
                    // コールバックがセットされていたら呼出
                    if (setting.change) {
                        setting.change(node, scheduleData[sc_key]);
                    }
                }
            });
            $node.resizable({
                handles: 'e',
                grid: [setting.widthTimeX, setting.timeLineY],
                minWidth: setting.widthTimeX,
                start: function (event, ui) {
                    var node = jQuery(this);
                    node.data('resizeCheck', true);
                },
                // 要素の移動が終った後の処理
                stop: function (event, ui) {
                    var node = jQuery(this);
                    var sc_key = node.data('sc_key');
                    var x = node.position().left;
                    var w = node.width();
                    var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
                    var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
                    var timelineNum = scheduleData[sc_key].timeline;

                    scheduleData[sc_key].start = start;
                    scheduleData[sc_key].end = end;

                    // 高さ調整
                    element.resetBarPosition(timelineNum);
                    // テキスト変更
                    element.rewriteBarText(node, scheduleData[sc_key]);

                    node.data('resizeCheck', false);
                    // コールバックがセットされていたら呼出
                    if (setting.change) {
                        setting.change(node, scheduleData[sc_key]);
                    }
                }
            });
            return key;
        };
        /**
         * スケジュール数の取得
         *
         * @param {number} n row number
         * @returns {number}
         */
        this.getScheduleCount = function (n) {
            var num = 0;
            for (var i in scheduleData) {
                if (scheduleData[i].timeline === n) {
                    num ++;
                }
            }
            return num;
        };
        /**
         * add rows
         *
         * @param timeline
         * @param row
         */
        this.addRow = function (timeline, row) {
            var title = row.title;
            var id = $element.find('.sc_main .timeline').length;

            var html;

            html = '';
            html += '<div class="timeline"><span>' + title + '</span></div>';
            var $data = jQuery(html);
            // event call
            if (setting.init_data) {
                setting.init_data($data, row);
            }
            $element.find('.sc_data_scroll').append($data);

            html = '';
            html += '<div class="timeline"></div>';
            var $timeline = jQuery(html);
            for (var t = tableStartTime; t < tableEndTime; t += setting.widthTime) {
                var $tl = jQuery('<div class="tl"></div>');
                $tl.width(setting.widthTimeX - setting.timeBorder);

                $tl.data('time', element.formatTime(t));
                $tl.data('timeline', timeline);
                $timeline.append($tl);
            }
            // クリックイベント
            // left click
            $timeline.find('.tl').click(function () {
                element.moveSchedules(jQuery(this).data('timeline'), jQuery(this), setting.bundleMoveWidth);
                if (setting.time_click) {
                    setting.time_click(this, jQuery(this).data('time'), jQuery(this).data('timeline'), timelineData[jQuery(this).data('timeline')]);
                }
            });
            // right click
            $timeline.find('.tl').on('contextmenu', function (e) {
                element.moveSchedules(jQuery(this).data('timeline'), jQuery(this), -1 * setting.bundleMoveWidth);
                if (setting.time_click) {
                    setting.time_click(this, jQuery(this).data('time'), jQuery(this).data('timeline'), timelineData[jQuery(this).data('timeline')]);
                }
                return false;
            });

            $element.find('.sc_main').append($timeline);

            timelineData[timeline] = row;

            if (row.class && (row.class != '')) {
                $element.find('.sc_data .timeline').eq(id).addClass(row.class);
                $element.find('.sc_main .timeline').eq(id).addClass(row.class);
            }
            // スケジュールタイムライン
            if (row.schedule) {
                for (var i in row.schedule) {
                    var bdata = row.schedule[i];
                    var s = element.calcStringTime(bdata.start);
                    var e = element.calcStringTime(bdata.end);

                    var data = {};
                    data.timeline = id;
                    data.start = s;
                    data.end = e;
                    if (bdata.text) {
                        data.text = bdata.text;
                    }
                    data.data = {};
                    if (bdata.data) {
                        data.data = bdata.data;
                    }
                    element.addScheduleData(data);
                }
            }
            // 高さの調整
            element.resetBarPosition(id);
            $element.find('.sc_main .timeline').eq(id).droppable({
                accept: '.sc_bar',
                drop: function (ev, ui) {
                    var node = ui.draggable;
                    var sc_key = node.data('sc_key');
                    var nowTimelineNum = scheduleData[sc_key].timeline;
                    var timelineNum = $element.find('.sc_main .timeline').index(this);
                    // タイムラインの変更
                    scheduleData[sc_key].timeline = timelineNum;
                    node.appendTo(this);
                    // 高さ調整
                    element.resetBarPosition(nowTimelineNum);
                    element.resetBarPosition(timelineNum);
                }
            });
            // コールバックがセットされていたら呼出
            if (setting.append) {
                $element.find('.sc_main .timeline').eq(id).find('.sc_bar').each(function () {
                    var node = jQuery(this);
                    var sc_key = node.data('sc_key');
                    setting.append(node, scheduleData[sc_key]);
                });
            }
        };
        /**
         *
         * @returns {any[]}
         */
        this.getScheduleData = function () {
            var data = new Array();

            for (var i in timelineData) {
                if (typeof timelineData[i] === 'undefined') continue;
                var timeline = jQuery.extend(true, {}, timelineData[i]);
                timeline.schedule = new Array();
                data.push(timeline);
            }

            for (var i in scheduleData) {
                if (typeof scheduleData[i] === 'undefined') continue;
                var schedule = jQuery.extend(true, {}, scheduleData[i]);
                schedule.start = this.formatTime(schedule.start);
                schedule.end = this.formatTime(schedule.end);
                var timelineIndex = schedule.timeline;
                delete schedule.timeline;
                data[timelineIndex].schedule.push(schedule);
            }

            return data;
        };
        /**
         * テキストの変更
         *
         * @param node
         * @param data
         */
        this.rewriteBarText = function (node, data) {
            var x = node.position().left;
            var w = node.width();
            var start = tableStartTime + (Math.floor(x / setting.widthTimeX) * setting.widthTime);
            // var end = tableStartTime + (Math.floor((x + w) / setting.widthTimeX) * setting.widthTime);
            var end = start + (data.end - data.start);
            var html = element.formatTime(start) + '-' + element.formatTime(end);
            jQuery(node).find('.time').html(html);
        };
        /**
         *
         * @param n
         */
        this.resetBarPosition = function (n) {
            // 要素の並び替え
            var $bar_list = $element.find('.sc_main .timeline').eq(n).find('.sc_bar');
            var codes = [];
            for (var i = 0; i < $bar_list.length; i++) {
                codes[i] = { code: i, x: jQuery($bar_list[i]).position().left };
            }
            // ソート
            codes.sort(function (a, b) {
                if (a.x < b.x) {
                    return -1;
                } if (a.x > b.x) {
                    return 1;
                }
                return 0;
            });
            var check = [];
            var h = 0;
            var $e1; var $e2;
            var c1; var c2;
            var s1; var e1; var s2; var e2;
            for (var i = 0; i < codes.length; i++) {
                c1 = codes[i].code;
                $e1 = jQuery($bar_list[c1]);
                for (h = 0; h < check.length; h++) {
                    var next = false;
                    for (var j = 0; j < check[h].length; j++) {
                        c2 = check[h][j];
                        $e2 = jQuery($bar_list[c2]);

                        s1 = $e1.position().left;
                        e1 = $e1.position().left + $e1.width();
                        s2 = $e2.position().left;
                        e2 = $e2.position().left + $e2.width();
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
                $e1.css({ top: ((h * setting.timeLineY) + setting.timeLinePaddingTop) });
                check[h][check[h].length] = c1;
            }
            // 高さの調整
            this.resizeRow(n, check.length);
        };
        /**
         *
         * @param n
         * @param height
         */
        this.resizeRow = function (n, height) {
            // var h = Math.max(element.getScheduleCount(n),1);
            var h = Math.max(height, 1);
            $element.find('.sc_data .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);
            $element.find('.sc_main .timeline').eq(n).height((h * setting.timeLineY) - setting.timeLineBorder + setting.timeLinePaddingTop + setting.timeLinePaddingBottom);

            $element.find('.sc_main .timeline').eq(n).find('.sc_bgBar').each(function () {
                jQuery(this).height(jQuery(this).closest('.timeline').height());
            });

            $element.find('.sc_data').height($element.find('.sc_main_box').height());
        };
        /**
         * resizeWindow
         */
        this.resizeWindow = function () {
            var sc_width = $element.width();
            var sc_main_width = sc_width - setting.dataWidth - (setting.verticalScrollbar);
            var cell_num = Math.floor((tableEndTime - tableStartTime) / setting.widthTime);
            $element.find('.sc_header_cell').width(setting.dataWidth);
            $element.find('.sc_data,.sc_data_scroll').width(setting.dataWidth);
            $element.find('.sc_header').width(sc_main_width);
            $element.find('.sc_main_box').width(sc_main_width);
            $element.find('.sc_header_scroll').width(setting.widthTimeX * cell_num);
            $element.find('.sc_main_scroll').width(setting.widthTimeX * cell_num);
        };
        /**
         * move all cells of the right of the specified time line cell
         *
         * @param timeline
         * @param baseTimeLineCell
         * @param moveWidth
         */
        this.moveSchedules = function (timeline, baseTimeLineCell, moveWidth) {
            var $bar_list = $element.find('.sc_main .timeline').eq(timeline).find('.sc_bar');
            for (var i = 0; i < $bar_list.length; i++) {
                var $bar = jQuery($bar_list[i]);
                if (baseTimeLineCell.position().left <= $bar.position().left) {
                    $bar.css({ left: Math.max(0, Math.min($bar.position().left + setting.widthTimeX * moveWidth, Math.floor((tableEndTime - tableStartTime) / setting.widthTime) * setting.widthTimeX - $bar.width())) });

                    var sc_key = $bar.data('sc_key');
                    var start = tableStartTime + (Math.floor($bar.position().left / setting.widthTimeX) * setting.widthTime);
                    var end = start + ((scheduleData[sc_key].end - scheduleData[sc_key].start));
                    scheduleData[sc_key].start = start;
                    scheduleData[sc_key].end = end;
                    element.rewriteBarText($bar, scheduleData[sc_key]);

                    // if setting
                    if (setting.change) {
                        setting.change($bar, scheduleData[sc_key]);
                    }
                }
            }
            element.resetBarPosition(timeline);
        };
        /**
         * initialize
         */
        this.init = function () {
            tableStartTime = element.calcStringTime(setting.startTime);
            tableEndTime = element.calcStringTime(setting.endTime);
            tableStartTime -= (tableStartTime % setting.widthTime);
            tableEndTime -= (tableEndTime % setting.widthTime);

            var html = '';
            html += '<div class="sc_menu">' + '\n';
            html += '<div class="sc_header_cell"><span>&nbsp;</span></div>' + '\n';
            html += '<div class="sc_header">' + '\n';
            html += '<div class="sc_header_scroll">' + '\n';
            html += '</div>' + '\n';
            html += '</div>' + '\n';
            html += '<br class="clear" />' + '\n';
            html += '</div>' + '\n';
            html += '<div class="sc_wrapper">' + '\n';
            html += '<div class="sc_data">' + '\n';
            html += '<div class="sc_data_scroll">' + '\n';
            html += '</div>' + '\n';
            html += '</div>' + '\n';
            html += '<div class="sc_main_box">' + '\n';
            html += '<div class="sc_main_scroll">' + '\n';
            html += '<div class="sc_main">' + '\n';
            html += '</div>' + '\n';
            html += '</div>' + '\n';
            html += '</div>' + '\n';
            html += '<br class="clear" />' + '\n';
            html += '</div>' + '\n';

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
                    var html = '';
                    html += '<div class="sc_time">' + element.formatTime(t) + '</div>';
                    var $time = jQuery(html);
                    var cellNum = Math.floor(Number(Math.min((Math.ceil((t + setting.widthTime) / 3600) * 3600), tableEndTime) - t) / setting.widthTime);
                    $time.width((cellNum * setting.widthTimeX) - setting.headTimeBorder);
                    $element.find('.sc_header_scroll').append($time);

                    beforeTime = t;
                }
            }

            jQuery(window).resize(function () {
                element.resizeWindow();
            }).trigger('resize');

            // addrow
            for (var i in setting.rows) {
                this.addRow(i, setting.rows[i]);
            }
        };
        // 初期化
        this.init();

        this.debug = function () {
            var html = '';
            for (var i in scheduleData) {
                html += '<div>';

                html += i + ' : ';
                var d = scheduleData[i];
                for (var n in d) {
                    var dd = d[n];
                    html += n + ' ' + dd;
                }

                html += '</div>';
            }
            jQuery(setting.debug).html(html);
        };
        if (setting.debug && setting.debug !== '') {
            setInterval(function () {
                element.debug();
            }, 10);
        }
        return this;
    };
}(jQuery));
