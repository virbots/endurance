import Chart from 'chart.js/auto'
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

import "./endlib.js";

Chart.register(zoomPlugin);
Chart.register(annotationPlugin);


$(function() {


const zoomOptions = {
  limits: {
    x: {min: 0, max: 300, minRange: 10},
    y: {min: 0, max: 600, minRange: 10}
  },
  pan: {
    enabled: true,
    mode: 'y', // was xy
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true
    },
    mode: 'y', // was xy
    onZoomComplete({chart}) {
      // This update is needed to display up to date zoom level in the title.
      // Without this, previous zoom level is displayed.
      // The reason is: title uses the same beforeUpdate hook, and is evaluated before zoom.
      console.log('zoom');

//      chart.update('none');
      window.chart.options.plugins.annotation.annotations = [];
      updateChart(true);
    }
  }
};

window.chart = null;

var colors = ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow'];
    
function refLines(yd, slope) {
    var data = reference(slope);
    data = data.map(p => ({x: p[0], y: p[1]}));
    const dsColor = colors[window.chart.data.datasets.length % colors.length];
    var newDataset = {
        label: yd,
        backgroundColor: dsColor,
        borderColor: dsColor,
        data: data,
        showLine: true,
        pointRadius: 0,
        borderWidth: 0.5,
    };
    window.chart.data.datasets.push(newDataset);
}


function updateChart(annotationsOnly) {
    var swimmer = $('select[name="swimmer"]').val();
    if (window.swimmerMap.hasOwnProperty(swimmer)) {
        var swObj = window.swimmerMap[swimmer];
        $('.gender').html(swObj.gender());
        $('.age').html(swObj.ageBracket());
    }
    
    var stroke = $('select[name="stroke"]').val();
    var answer = getSwimmersAndStrokes(swimmer, stroke);
    var temp_swimmers = answer[0];
    var temp_strokes = answer[1];

    var yScale = window.chart.config.options.scales.y;
    var yRange = yScale.max - yScale.min;
    var yOffset = yRange / 30.0; // So it's 20 if 600
    var xLastOffset = yOffset / 4.0;

    for (var i = 0; i < temp_strokes.length; i++) {
       var st = temp_strokes[i];
       var label_prefix = st;
       for (var j = 0; j < temp_swimmers.length; j++) {
            var sw = temp_swimmers[j]; 
            var label_suffix = sw;
            var label = `${label_prefix}-${label_suffix}`;
            label = trimChar(label, '-');
            const dsColor = colors[window.chart.data.datasets.length % colors.length];
            var data = oneCurveData(sw, st);
            for (var k = 0; k < data.length; k++) {
                var p = data[k];
                let annotation = {
                    type: 'label',
                    xValue: k < data.length - 1 ? p.point[0] : p.point[0] + xLastOffset,
                    yValue: k < data.length -1 ? p.point[1] + yOffset: p.point[1],
                    content: [window.toMinSec(p.point[1])],
                    backgroundColor: 'rgba(255,255,255,0)',
                    font: {
                        size: 12,           
                    }
                };
                window.chart.options.plugins.annotation.annotations.push(annotation);
            }
            data = data.map(p => ({x: p.point[0], y: p.point[1]}));

            if (!data.length) {
                continue;
            }
            if (annotationsOnly) {
                continue;
            }
            var newDataset = {
                label: `${sw}-${st}`,
                backgroundColor: dsColor,
                borderColor: dsColor,
                data: data,
                showLine: true,
            };
            window.chart.data.datasets.push(newDataset);
       }
    }

    if (!annotationsOnly) {
        refLines('100y', 1.0);
        refLines('50y', 0.5);
        refLines('25y', 0.25);
    }
    
    window.chart.update();
}

function removeAllData() {
    window.chart.options.plugins.annotation.annotations = [];
    while (window.chart.data.labels.length) {
        window.chart.data.labels.pop();
    }
    while (window.chart.data.datasets.length) {
        window.chart.data.datasets.pop();
    }
}

function commonReadCallback() {
    readStandards();
    processSwimmers();
    updateChart(false);
}

(async function() {

  const data = [
  ];

  window.chart = new Chart(document.getElementById('acquisitions'),
    {
      type: 'scatter',
      data: {
        labels: [],
        datasets: [] // empty at first
      },


      options: {
        scales: {
            x: {
                ticks: {
                    callback: function(value, index, values) {
                        if (Math.floor(value) === value) {
                            return window.toMinSec(value);
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Pace (MM:SS)'
                }
            },
            y: {
                ticks: {
                    callback: function(value, index, values) {
                        if (Math.floor(value) === value) {
                            return window.toMinSec(value);
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Time (MM:SS)'
                },
                min: 0,
                max: 600
            }
        }, // options
        plugins: {
            zoom: zoomOptions,
            title: {
                display: true,
                position: 'bottom',
                text: (ctx) => 'Endurance Profile',
            }, // title
            tooltip: {
                callbacks: {
                    label: function(context) {
                        var label = context.dataset.label;
                        var value = context.parsed;
                        return `${label}: ${window.toMinSec(value.x)} : ${window.toMinSec(value.y)}`;
                    }
                }
             },
            annotation: {
                annotations: [],
            }
        }, // plugins
        onClick(e) {
            console.log(e.type);
        }, // onClick
    } // options

    } // 2nd param of Chart constructor
  ); // close Chart constructor
  $('select[name="swimmer"], select[name="stroke"]').change(function() {
      $('table#standards').html('');
      removeAllData();
      window.chart.resetZoom();
      updateChart(false);
  });

  function get_standards(swimmer, stroke, cat) {
     var stands = window.standards[cat];
     stands = stands.filter(s => s.stroke == stroke);
     if (stands.length == 0) {
        alert(`No standards yet for: ${cat}, ${stroke}`);
        return;
     }
     let standsRows = stands.map(s => s.toRow());
     let pacesSec = stands.map(s => window.fromMinSec(s.time) * 100 / s.distance)
     var i = 0;
     let newRows = [];
     let newStandsRows = [];
     let distanceNotMet = new Set();
     let distToRows = {}
     stands.forEach(function(sr) {
         let dist = sr.distance;
         if (!distToRows.hasOwnProperty(dist)) {
            distToRows[dist] = [];
         }
         distToRows[dist].push(sr);
     });
     
     stands.forEach(function(sr) {
         // reset
         sr.shown = false; 
         sr.status = -1;
         sr.paceRequiredSec = pacesSec[i];

         let dist = stands[i].distance;
         let paceRequired = window.toMinSec(sr.paceRequiredSec);
         let entries = window.all_entries.filter(e => e.name == swimmer && e.stroke == stroke);
         let thatOrFaster = entries.filter(e => window.fromMinSec(e.pace) <= sr.paceRequiredSec);
         sr.status = '';
         if (thatOrFaster.length == 0) {
            sr.status = 0.0; 
            distanceNotMet.add(dist);
         } else {
             let maxTime = Math.max(...thatOrFaster.map(e => window.fromMinSec(e.time))); // fastest time at good paces
             if (maxTime >= window.fromMinSec(sr.time)) {
                sr.status = 100.0; // checkmark -> '&#x2705;'
                distanceNotMet.delete(dist); // we don't care about previous standards that didn't meet because we met the time!
             } else {
                sr.status = 100.0 *  maxTime / window.fromMinSec(sr.time);
                distanceNotMet.add(dist);
             }
         }
         i++;
     });
     var newStands = [];
     for (const dist in distToRows) {
         var srs = distToRows[dist];
         let i = srs.length - 1;
         for (; i >= 0; i--) {
            let sr = srs[i];
            if (sr.status == 100.0) {
                sr.shown = true;
                newStands.push(sr);
                break;
            }
         }
         // i will either be 0 (if nothing earned, or the highest standard which swimmer has earned)
         let j = i + 1;
         if (j < srs.length) {
            let sr = srs[j];
            sr.shown = true
            newStands.push(sr);
         }
     }
     newRows = [];
     for (var i = 0; i < newStands.length; i++) {
        let sr = newStands[i];
        let srow = sr.toRow();
        newRows.push( $(srow).append(`<td>${window.toMinSec(sr.paceRequiredSec)}</td>`).append(`<td>${sr.toNiceStatus()}</td>`) );
     }
     $('table#standards').append(newRows);
  }

  $('#get-standards').click(function() {
     var swimmer = $('select[name="swimmer"]').val();
     var ageGroup = $('.age').text();
     var gender = $('.gender').html();
     var gen = gender == 'F' ? 'Girls' : 'Boys';
     var stroke = $('select[name="stroke"]').val();

     var cat = `${ageGroup} ${gen}`;
     if (!window.standards.hasOwnProperty(cat) || window.standards[cat].length == 0) {
        alert(`No standards yet for: ${cat}`);
        return;
     } 

     let mainStrokes = ['Free', 'Breast', 'Fly', 'Back'];
     if (mainStrokes.indexOf(stroke) > -1) {
        $('table#standards').html('<tr><th>Event</th><th>Standard</th><th>Time</th><th>Required Pace</th><th>Progress</th></tr>');
        get_standards(swimmer, stroke, cat);
     } else if (stroke == 'All') {
        $('table#standards').html('<tr><th>Event</th><th>Standard</th><th>Time</th><th>Required Pace</th><th>Progress</th></tr>');
        for (var i = 0; i < mainStrokes.length; i++) {
            get_standards(swimmer, mainStrokes[i], cat);
        }
     }
     
//     if (stroke == 'All') {
//        alert('Pick one of the 4 specific strokes');
//        return;
//     }
  });

  readEnduranceEntries(function() {
    commonReadCallback();
  });
  readSwimmers(function() {
    commonReadCallback();
  });
})(); // async
}); // $(function)
