var lgc, lgc2;
jQuery(document).ready(function () {
    // create the 2 calendar objects/views 
    lgc1 = new kpiCalendar('#kpic1');
    lgc2 = new kpiCalendar('#kpic2');
    lgc1.setMonthDisplay('.toolbar .current-month', 'long', function (d) {
        jQuery('#testDateInput').val(d.toISOString().slice(0, 10));
    });

    var now = new Date()
    var y = now.getFullYear();
    var m = (now.getMonth() + 1).toString().padStart(2,0);

    /* testing code */
    var someColor = '#EA6A47';
    var someLabel = "A Custom Label"
    lgc2.addItem(`${y}-${m}-15`, 'Danger', 'kpic-danger', '', '3.5');
    lgc2.addItem(`${y}-${m}-17`, 'Success', 'kpic-success', '', '9.2');
    lgc2.addItem(`${y}-${m}-19`, 'Warning', 'kpic-warning', '', '6.0');
    lgc2.addItem(`2022-07-20`, 'Success', 'kpic-success', '', '8.0');

    lgc1.addItem(`${y}-${m}-15`, someLabel, '', 'This is a default kpi item, you will see this text when you hover over.','', someColor, );
    lgc1.addItem(`${y}-${m}-17`, 'Success', 'kpic-success');
    lgc1.addItem(`${y}-${m}-19`, 'Warning', 'kpic-warning');
    lgc1.addItem(`2022-07-20`, 'Success', 'kpic-success');


    lgc1.addItem(`${y}-${m}-15`, 'Danger', 'kpic-danger'); 

    for (var x = 0; x < 10; x++) {
        //ref: addItem(key,label,css,title,text,color,uid)
        var newItem = {
                key: `${y}-${m}-20`,
                label: someLabel,
                cssClass: '',
                color: someColor
            }
        lgc1.addItem(newItem);
        newItem.key = `2022-07-20`
        lgc1.addItem(newItem);
    }


    jQuery('#testDateInput').on("change", (e) => {
        var d = e.target.value;
        var dt = new Date(d + " 12:00:00");
        lgc1.setMonth(dt.getMonth(), dt.getFullYear());
        lgc2.setMonth(dt.getMonth(), dt.getFullYear());
        var cssName = jQuery('#cssName :selected').val();
        var label = jQuery('#cssName :selected').text();
        
        if (label.startsWith('Color')) {
            console.log('add color ' + cssName)
            lgc1.addItem(d, label, '','','',cssName);
        } else {
        // mimic a missing time KPI based on cssName 
            lgc1.addItem(d, label, cssName);
            switch (cssName) {
                case 'kpic-danger':
                    lgc2.addItem(d, label, cssName, '', '3.2');
                    break;
                case 'kpic-warning':
                    lgc2.addItem(d, label, cssName, '', '6.2');
                    break;
                default:
                    lgc2.addItem(d, label, cssName, '', '8.2');
            }
        }
    });
});

function toggleLegends(elem) {
    if (elem.checked) {
        lgc1.setLegendSelector('#lgc1-legend');
        lgc2.setLegendSelector('#lgc2-legend'); 
    } else {
        lgc1.setLegendSelector();
        lgc2.setLegendSelector(); 
    }
}

function addMonth(v) {
    lgc1.addMonth(v);
    lgc2.addMonth(v);
    var dateStr = lgc1.activeDate.toISOString().split('T')[0]
    jQuery('#testDateInput').val(dateStr);
}