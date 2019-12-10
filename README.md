jq.Schedule
===============

![](https://raw.githubusercontent.com/ateliee/jquery.schedule/master/demo/images.png)

jquery and html schedule calendar

javascript base time schedule plugin.

## install

### npm
```
npm install ateliee/jquery.schedule
```

## Demo

[Try Demo](https://ateliee.github.io/jquery.schedule/demo/)

## How to use

append head css
```
<link rel="stylesheet" type="text/css" href="./jquery.schedule/css/style.css" />
```

insert body
```
<div id="schedule"></div>
<script type="text/javascript" src="./jquery.schedule/js/jq.schedule.js"></script>
<script type="text/javascript">
    $(function(){
        var $sc = jQuery("#schedule").timeSchedule({
            startTime: "07:00", // schedule start time(HH:ii)
            endTime: "21:00",   // schedule end time(HH:ii)
            widthTime:60 * 10,  // cell timestamp example 10 minutes
            timeLineY:60,       // height(px)
            verticalScrollbar:20,   // scrollbar (px)
            timeLineBorder:2,   // border(top and bottom)
            bundleMoveWidth:6,  // width to move all schedules to the right of the clicked time line cell
            debug:"#debug",     // debug string output elements
            rows : {
                '0' : {
                    title : 'Title Area',
                    schedule:[
                        {
                            start:'09:00',
                            end:'12:00',
                            text:'Text Area',
                            data:{
                            }
                        },
                        {
                            start:'11:00',
                            end:'14:00',
                            text:'Text Area',
                            data:{
                            }
                        }
                    ]
                },
                '1' : {
                    title : 'Title Area',
                    schedule:[
                        {
                            start:'16:00',
                            end:'17:00',
                            text:'Text Area',
                            data:{
                            }
                        }
                    ]
                }
            },
            change: function(node,data){
                $("#logs").append($("<div>").text("change event:" + JSON.stringify(data)));
            },
            init_data: function(node,data){
                $("#logs").append($("<div>").text("init event:" + JSON.stringify(data)));
            },
            click: function(node,data){
                $("#logs").append($("<div>").text("click event:" + JSON.stringify(data)));
            },
            append: function(node,data){
                $("#logs").append($("<div>").text("append event:" + JSON.stringify(data)));
            },
            time_click: function(time,data){
                $("#logs").append($("<div>").text("time click event:" + JSON.stringify(data)));
            },
        });
    });
</script>
```

## Options

### Paramaters

|Key|Value|Description|
|---|------|----------|
|startTime|07:00|schedule start time(HH:ii)|
|endTime|21:00|schedule end time(HH:ii)|
|widthTime|600|cell timestamp example 10 minutes|
|timeLineY|60|height(px)|
|verticalScrollbar|20|scrollbar (px)|
|timeLineBorder|2|border(top and bottom)|
|bundleMoveWidth|6|width to move all schedules to the right of the clicked time line cell|
|debug|#debug|debug string output elements|
|rows|{object}|schedule data|

### Schedule Data

|Key|Type|Description|
|---|----|-----|
|title|string|Schedule Row Title|
|schedule|object[]|schedule row of array|

|Key|Type|Description|
|---|----|-----|
|start|string|HH:ii|
|end|string|HH:ii|
|text|string|Bar Title|
|data|object|bind data|

### Methods

#### change(node: Element, data: Object)
on change schedule bar callback

#### init_data(node: Element, data: Object)
initialize data

#### click(node: Element, data: Object)
on click bar callback

#### append(node: Element, data: Object)
on add schedule bar callback

#### time_click(node: Element, data: Object)
on click schedule row callback
