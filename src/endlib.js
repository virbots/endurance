window.$ = require('jquery');
import {EnduranceEntry} from "./endurance";
window.EnduranceEntry = EnduranceEntry;

import {TimeStandard} from "./endurance";
window.TimeStandard = TimeStandard;;

import {Swimmer} from "./endurance";
window.Swimmer = Swimmer;

// There's an npm for this. But that version requires a paid license for commercial usage. This version does not:
import Handsontable from "./handsontable.full.min.js";
window.Handsontable = Handsontable;
import "./handsontable.full.min.css";

window.triageRenderer = function(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.color = 'blue';
  td.style['text-align'] = 'right';
  td.innerHTML = parseFloat(td.innerHTML).toFixed(0);
}

window.getLevelRenderer = function(level) {
  return function(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style.color = value > level ? 'red' : 'green';
      td.style['text-align'] = 'right';
      td.innerHTML = parseFloat(td.innerHTML).toFixed(0);
  }
}

window.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

window.getClassRenderer = function(classs) {
  return function(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      $(td).addClass(classs);
  }
}

window.getDateRenderer = function() {
  return function(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style['text-align'] = 'right';
      td.innerHTML = new Date(value).toDateString();
  }
}

window.getMinSecRenderer = function() {
  return function(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.innerHtml = toMinSec(value);
      td.style['text-align'] = 'right';
  }
}



window.getRoundRenderer = function(decimalPlaces) {
  return function(instance, td, row, col, prop, value, cellProperties) {
      Handsontable.renderers.TextRenderer.apply(this, arguments);
      td.style['text-align'] = 'right';
      td.innerHTML = parseFloat(td.innerHTML).toFixed(decimalPlaces);
  }
}
window.addButton = function(selector, txt, callback) {
    $(selector).html('<button>' + txt + '</button>');
    $(selector).find('button').click(callback);
}

window.isClumped = function(vals, possibleVals) {
    var clumps = {};
    for (var i = 0; i < possibleVals.length; i++) {
        clumps[possibleVals[i].toString()] = 0;
    }
    for (var i = 0; i < vals.length; i++) {
        clumps[vals[i].toString()] ++;
    }
    var clumpArr = [];
    for (var key in clumps) {
        clumpArr.push(clumps[key]);
    }

    var mn = Math.min(...clumpArr);
    var mx = Math.max(...clumpArr);
    mn = Math.max(mn, 1);
    if (mx > 4 * mn) {
        return true;
    }
    return false; 
}


window.toUnix = function(dateStr) {
    return new Date(dateStr).getTime(); 
}

window.toMinSec = function(value) {
    var sec = pad(value % 60, 2);
    var min = Math.floor(value / 60);
    return `${min}:${sec}`;
}

window.fromMinSec = function(minSecStr) {
    minSecStr = minSecStr.replace(/AM|PM/, '').trim();
    let tokens = minSecStr.split(':');
    if (tokens.length == 1) {
        tokens.splice(0, 0, '0');
    }
    if (tokens.length != 2) {
        throw Exception();
    }
    return parseInt(tokens[0]) * 60 + parseInt(tokens[1]);
}

window.all_entries = [];

window.oneCurveData = function(swimmer, stroke) {
   if (swimmer == 'All') {
        console.error('Call with specific swimmer');
        return [];
   }
   if (stroke == 'All') {
        console.error('Call with specific stroke');
        return [];
   }
   let data2 = [];
   let data3 = {};
   for(let i = 0; i < window.all_entries.length; i++) {
       let end = window.all_entries[i];
       if (end.name === swimmer && end.stroke === stroke) {
           data2.push([fromMinSec(end.pace), fromMinSec(end.time)]);
           if (!data3.hasOwnProperty(end.pace)) {
               data3[end.pace] = 0;
           }
           if (fromMinSec(end.time) > data3[end.pace]) {
               data3[end.pace] = fromMinSec(end.time);
           }
       }
   }
   let paces = Object.keys(data3);
   paces.sort();
   for (var i = 1; i < paces.length; i++) {
        if (data3[paces[i]] < data3[paces[i-1]]) {
            data3[paces[i]] = data3[paces[i-1]]; 
        }
   }
   data2 = [];
   for (var i = 0; i < paces.length; i++) {
       data2.push({point: [fromMinSec(paces[i]), data3[paces[i]]]});
   }
   for (var i = paces.length - 1; i > 0; i--) {
       if (data2[i].point[1] == data2[i-1].point[1]) {
           data2.pop(); // remove trailing points if same as previous.
       } else {
           break; // then break as soon as not true.
       }
   }
   return data2;
}

window.reference = function(pace) {
    let data2 = [];
    data2.push([fromMinSec('1:05'), fromMinSec('1:05') * pace]);
    data2.push([fromMinSec('3:40'), fromMinSec('3:40') * pace]);
    return data2;
}

function expand(data_list, data_series, label) {
   if (data_series.length == 0) {
       return; // don't show when there's no data. Hopefully keep legend to what it needs to be
   }
   var singlePoint = data_series.length == 1;
   var series1 = {label: singlePoint ? '': label, data: $.map(data_series, function(i){return [i.point];}),
               points: {show: false},
               lines: {show: true},
            };

   var series2 = {label: singlePoint ? label: '', data: $.map(data_series, function(i){return [i.point];}),
               points: {show: true, radius: 4},
               lines: {show: false},
                };
   if (!singlePoint) {
      series2.color = 'rgb(0, 0, 0)';
   }
   data_list.push(series1, series2);
}

function labelFormatter(label, series) {
    if (label === '') {
        return null;
    }
    // series is the series object for the label
    return '<a href="#' + label + '">' + label + '</a>';
}

// https://stackoverflow.com/questions/26156292/trim-specific-character-from-a-string
window.trimChar = function(string, charToRemove) {
    while(string.charAt(0)==charToRemove) {
        string = string.substring(1);
    }

    while(string.charAt(string.length-1)==charToRemove) {
        string = string.substring(0,string.length-1);
    }

    return string;
}

window.getSwimmersAndStrokes = function(swimmer, stroke) {
   var temp_strokes = [];

   if (stroke === 'All') {
       for (var i = 0; i < window.strokes.length; i++) {
            var st = window.strokes[i];
            temp_strokes.push(st);
       }
   } else {
       temp_strokes.push(stroke);
   }

   var temp_swimmers = [];
   if (swimmer === 'All') {
       for (var i = 0; i < window.swimmers.length; i++) {
            var sw = window.swimmers[i];
            temp_swimmers.push(sw);
       }
   } else {
       temp_swimmers.push(swimmer);
   }
   return [temp_swimmers, temp_strokes];
}

function updatePlot(swimmer, stroke) {
   var master_data = [];
   master_data.push({label: '100y', data: reference(1.0)});
   master_data.push({label: '50y', data: reference(0.5)});
   master_data.push({label: '25y', data: reference(0.25)});
   var answer = getSwimmersAndStrokes(swimmer, stroke);
   var temp_swimmers = answer[0];
   var temp_strokes = answer[1];

   for (var i = 0; i < temp_strokes.length; i++) {
       var st = temp_strokes[i];
       var label_prefix = st;
       for (var j = 0; j < temp_swimmers.length; j++) {
            var sw = temp_swimmers[j]; 
            var label_suffix = sw;
            var label = `${label_prefix}-${label_suffix}`;
            label = trimChar(label, '-');
            expand(master_data, oneCurveData(sw, st), label);
       }
   }
   let x_ticks = [];
   let y_ticks = [];
   for (var p = 0; p <= 225; p += 10) {
       x_ticks.push([p, window.toMinSec(p)]);
   }
   for (var p = 0; p <= 330; p += 10) {
       y_ticks.push([p, window.toMinSec(p)]);
   }
    var legendContainer = document.getElementById("legendContainer");
    var legendSettings = {
        position: "ne",
        labelFormatter: labelFormatter,
        show: true,
        noColumns: 2,
        container: legendContainer
    };

   var enduranceProfile = $.plot($("#placeholder"), master_data, { 
      legend: legendSettings,
      points: { show: true, radius: 10, lineWidth: 4, fill: false },
      lines: { show: false },
      yaxis: {
        ticks: y_ticks
      },
      xaxis: {
        ticks: x_ticks
      }
   });
   var d = enduranceProfile.getData();
   for (var i = 0; i < 3; i++) {
       d[i].lines.lineWidth = 1;
   }
   for (var i = 3; i < d.length; i++) {
       d[i].lines.lineWidth = 5;
   }

   // loop through each data series in the flot chart
   $.each(enduranceProfile.getData(), function(i, item, array) {
       if (i < 3) {
           // it's just a reference line
           return;
       }
   
       // get the last data point in the series data, e.g. [0, 5]
       let alreadyAnnotated = new Set();
       for(var j = 0; j < item.data.length; j++) {
           let datapoint = item.data[j]; 
           // get the position of the datapoint
           var position = enduranceProfile.pointOffset({
             x: datapoint[0],
             y: datapoint[1],
           });
           let pace = window.toMinSec(datapoint[1]);
           if (alreadyAnnotated.has(pace)) {
               continue;
           }
           alreadyAnnotated.add(pace);
           $('<div />', {
               text: pace,
           }).css({
               position: 'absolute',
               left: position.left - 10,
               top: position.top - 20,
           }).appendTo('#placeholder');
        }
   });
       

   enduranceProfile.draw();
}

window.strokes = null;
window.swimmers = null;

function customSort(arr) {
  return arr.sort((a, b) => {
    const [aPrefix, aNumber] = a.match(/([A-Z]+)(\d+)/).slice(1);
    const [bPrefix, bNumber] = b.match(/([A-Z]+)(\d+)/).slice(1);

    if (aPrefix !== bPrefix) {
      return aPrefix.localeCompare(bPrefix);
    } else {
      return parseInt(aNumber, 10) - parseInt(bNumber, 10);
    }
  });
}

window.swimmerMap = {};

window.count = 0;

window.getApiUrl = function(tabName) {
    tabName = tabName.replace(/\//, '-');
    return `https://sheets.googleapis.com/v4/spreadsheets/1QIcvf5S0IrTJ2GD8DcTtIW-UxAGh5oF6Hm7Rvuq8Wms/values/${tabName}?key=AIzaSyD2GEqV6DLpVO-RyVufOloqfUWjzNMHSgA`;
}

// age group tab name to Standards arr
window.standards = {};

window.readSwimmers = function(callback) {
    $.get(window.getApiUrl('Swimmers'), function(data) {
       let lines = data.values;
       for (var i = 1; i < lines.length; i++) {
            var line = lines[i]; // .trim();
            let tokens = line;
            tokens = tokens.map(s => s.trim());
            var swimmer = new Swimmer(tokens[0], tokens[1], tokens[2]);
            var tabName = swimmer.ageGroup.getTabName();
            if (!window.standards.hasOwnProperty(tabName)) {
                window.standards[tabName] = [];
            }
            window.swimmerMap[swimmer.name] = swimmer;
       } 
       window.count++;
       if (window.count >= 2) {
            callback();
       }
    });
}


window.readEnduranceEntries = function(callback) {
    // Geoff's read-only to public spreadsheet, with anonymized names:
    $.get(window.getApiUrl('Endurance'), function(data) {
       let lines = data.values;
       let swimmerSet = new Set();
       window.strokes = new Set();
       for (var i = 1; i < lines.length; i++) {
            var line = lines[i]; // .trim();
            let tokens = line;
            tokens = tokens.map(s => s.trim());
            var entry = new EnduranceEntry(-1,tokens[0], tokens[1], tokens[2], tokens[3], tokens[4], tokens[5]);
            window.all_entries.push(entry);
            swimmerSet.add(entry.name);
            window.strokes.add(entry.stroke);
       } 
       window.swimmers = Array.from(swimmerSet);
       window.swimmers = customSort(window.swimmers);
       var swimmersWithAll = Array.from(window.swimmers).filter(s => s != '');;
       swimmersWithAll.push('All');
       var swimmer_options = swimmersWithAll.map(s => `<option value="${s}">${s}</option>`);
       $('select[name="swimmer"]').html(swimmer_options);

       window.strokes = Array.from(window.strokes).filter(s => s != '');
       window.strokes.sort();
       var strokesWithAll = [...window.strokes];
       strokesWithAll.unshift('All'); // Put all first so initial chart looks nicer
//       strokesWithAll.push('All');
       var stroke_options = strokesWithAll.map(s => `<option value="${s}">${s}</option>`);
       $('select[name="stroke"]').html(stroke_options);

       window.count++;
       if (window.count >= 2) {
            callback();
       }
        
//       window.all_entries = entries;
    });     
}

window.readStandardsOneAgeGroup = function(ageGroup) {
    $.get(window.getApiUrl(ageGroup), function(data) {
        let ag = ageGroup.split(' ');
        let ageBracket = ag[0].trim();
        let gender = ag[1].trim() == 'Girls' ? 'F' : 'M';
        let lines = data.values;
        let header = lines[0];
        header = header.map(s => s.trim());
        let speedToCol = {};
        let colToSpeed = {};
        for (var c = 1; c < header.length; c++) {
            if (header[c] == '') {
                continue;
            }
            speedToCol[header[c]] = c;
            colToSpeed[c] = header[c];
        } 
        let eventToRow = {}; 
        let rowToEvent = {}; 
        for (var r = 2; r < lines.length; r++) {
            lines[r] = lines[r].map(s => s.trim());
            eventToRow[lines[r][0]] = r;
            rowToEvent[r] = lines[r][0];
        } 

        for (var r = 2; r < lines.length; r++) { // skip row that says 'Top 55%'
            let event = rowToEvent[r];
            let toks = event.split('Y');
            let distance = parseInt(toks[0].trim());
            let stroke = toks[1].trim();
            for (var c = 1; c < lines[r].length; c++) {
                if (!colToSpeed.hasOwnProperty(c)) {
                    continue;
                }
                let standard = colToSpeed[c]
                if (standard == '') {
                    continue;
                }
                let time = lines[r][c];
                window.standards[ageGroup].push(new TimeStandard(gender, ageBracket, distance, stroke, standard, time));
            }
        }
    }).fail(function(){ 
        console.error(`Error getting tab for ${ageGroup}`);
    });
}

window.readStandards = function(callback) {
    for (var ageGroup in window.standards) {
        if (!window.standards.hasOwnProperty(ageGroup)) {
            continue;
        }
         
        window.readStandardsOneAgeGroup(ageGroup);
    }
}

window.processSwimmers = function() {
        var entries = window.all_entries;
        var TypeFactor = {
            CS: 1.5,
            EoU: 1.5,
            VQ: 1.00,
            Org: 1.25,
            Misc: 1.00,
        }

        var entryIdMap = {};
        for (var i = 0; i < entries.length; i++) {
            entryIdMap[entries[i].id] = entries[i];
        }

        // Initialize the grid
        const data = entries.map(t => t.blob()); 
        const container = document.getElementById('example');
        const hot = new Handsontable(container, {
          data: data,
          width: 1600,
          rowHeaders: true,
          colHeaders: ['Id', 'Name', 'Stroke', 'Date', 'Pace', 'Time', 'Note'],
          columns: [
                {
                    data: 'id',
                    renderer: getClassRenderer('entry-id'),
                    sortIndicator: true,
                    editor: false,
                    class: 'entry-id',
                },
                {
                    data: 'name',
                    renderer: 'html',
                    sortIndicator: true,
                    editor: 'text',
                },
                {
                    data:'stroke',
                    renderer: 'html',
                    sortIndicator: true,
                    editor: 'text',
                },
                {
                    data:'date',
                    type: 'date',
                    renderer: getDateRenderer(),
                    sortIndicator: true,
                    editor: 'date',
                },
                {
                    data: 'pace',
                    type: 'text',
                    sortIndicator: true,
                    editor: 'text',
                },
                {
                    data:'time',
                    editor: false,
                    sortIndicator: true,
                    type: 'text',
                },
                {
                    data:'note',
                    editor: false,
                    type: 'text',
                    sortIndicator: true,
                },
          ],
          columnSorting: true,
          licenseKey: 'non-commercial-and-evaluation',
        });
}
