/* Custom Code for Event Hub Skin */
var eventHub;

function onInitializeEventHub(options) {
    options.autoBind = false;
        
    // initialize the kpi calendar, set the dates and fire the refiner to populate the event list
    jQuery('.event-hub-calendar').data('truncateview',"0");
    eventHub = new kpiCalendar('.event-hub-calendar');
    // force then eventHub to type fill. 
    eventHub.type = 'fill';
    eventHub.setMonthDisplay('.event-hub-month-name', 'MMMM yyyy');
    
    // the list is initialized with the start/end date of the visible calendar
    // however that refiner element is not immediately available, so wait for 
    // the datepicker to be a valid object, then set and trigger
    var waitForDateRefiner = setInterval( function() {
        var r = _hsGetRefiner('event-hub-date-refiner');
        eventHub.startDateFilter = r.find('input.hs-daterefiner-start').data('kendoDatePicker');
        eventHub.endDateFilter = r.find('input.hs-daterefiner-end').data('kendoDatePicker');
        if (typeof eventHub.startDateFilter === 'object' && typeof eventHub.endDateFilter === 'object' ) {
            clearInterval(waitForDateRefiner);
            eventHub.listElement = jQuery('#event-hub-list');
            onMonthChange(0);
        } 
    },50)    

    // setup on click event for calendar view days
    jQuery(document).on('click', '.kpic-box.kpic-has-items', function(e) {
        var datebox = jQuery(e.target).closest('.kpic-box');
        var d = datebox.data('date');
        jQuery('.kpic-box.active-date').removeClass('active-date');
        datebox.addClass('active-date');
        if (d) {
            eventHubScrollToDate(d);
        }
    });
}

function onDataBoundEventHub(ds) {
    var data = ds.data();
    eventHub.resetItems();
    
    data.forEach( item => {
        if (item.isallday) {
            // why this code?  The HS Class uses a SQL Function  to return an "All Day Event" as midnight UTC 
            // the current timezone offset for the browser must be added to that to get the event to land on 
            // the proper date because midnight UTC is the previous day in the US. 
            dt = kendo.parseDate(item.datestart);
            dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
            item.datestart = dt;
        }
        var kpi = {
                key: kendo.toString(kendo.parseDate(item.datestart),"yyyy-MM-dd"),
                label: item.category,
                color: item.categorycolorhex,
                opacity: '.5',
                // so why item category here?  The specs call for one kpi bar 
                // per category per day, using the category name here instead 
                // of a uid (which is just a string anyway) takes care of that.
                // because the calendar control will not enter 2 elements with 
                // the same uuid string on the same day. 
                uid: item.category // item.uid //
        }
        eventHub.addItem(kpi);
    });    
    kendo.ui.progress(eventHub.listElement,false);  
    eventHubScrollToDate(); // scroll to today's date, if in current month and there is an event on that date. 
}

function onMonthChange(v) {
    if (v !== 0) {
        // change month if not zero, if zero we are just initializing the list view
        eventHub.addMonth(v);
        eventHub.listElement.find('.k-listview-content').empty();
    }

    kendo.ui.progress(eventHub.listElement,true);
    
    with (eventHub) {
        startDateFilter.value(eventHub.calendarDateFirst);
        endDateFilter.value(eventHub.calendarDateLast);
        startDateFilter.trigger('change');
    }
}

function eventHubScrollToDate(d) {    
    d = d || (new Date()).toISOString().split('T')[0];
    var elem = eventHub.listElement.find(`[data-datekey="${d}"]`);
    if (elem.length) {
        // chunky way = elem[0].scrollIntoView(scrollOptions);
        jQuery(eventHub.listElement).animate({
            scrollTop: elem[0].offsetTop
        },500)
    }
}
    
