/* 
    Legend calendar builds a simple css grid based month view suitable for adding color coded accents to show 
    items that belong to a specific date 
*/

class kpiCalendar {

    constructor(selector, month, year) {

        // activeDate is the first day of the month of the current calendar view.
        this.activeDate = new Date(this.#validYear(year), this.#validMonth(month), 1);
        // set these values in buildCalendarElement method.
        this.calendarDateFirst = null;
        this.calendareDateLast = null;

        this.elem = jQuery(selector || '.kpic-calendar, .kpic-calendar-fill').first();

        // standard has a bar for as many types of events can fit in the box;
        // fill will set the color of the entire box to the color of the last event type
        this.type = (this.elem.hasClass('kpic-calendar')) ? 'standard' : 'fill';        
        // subtle is a type of fill, but includes a simple clickable container that give the number of events for that day
        this.fillType = (this.elem.hasClass('kpic-calendar-subtle')) ? 'subtle' : '';

        // if true then do not display week 7 if not in current month, false (default) show only last week of view 
        //this.truncateView = typeof this.elem.data("truncateview") === 'undefined' ? 1 : this.elem.data("truncateview");
        this.truncateView = typeof this.elem.data("truncateview") === 'undefined' ? true : this.elem.data("truncateview") == "1";
        if (this.elem.data('monthdisplay')) {
            var fmt = this.elem.data('monthformat') || 'long';
            this.setMonthDisplay(this.elem.data('monthdisplay'), fmt);
        }

        this.legendSelector = this.elem.data('legend');

        this.kpiItems = [];
        this.#buildCalendarElement();

    }

    // Public Methods 
    setLegendSelector(s) {
        s = s || '';
        if (s === '' && this.legendSelector) {
            // if s is blank, and there was a previous legendSelector, hide it. 
            jQuery(this.legendSelector).hide();
        } else {
            this.#buildLegend();
        }
    }
    setMonthDisplay(selector, format, callback) {
        this.monthDisplay = {
            elem: jQuery(selector),
            format: format || 'long',
            callback: callback || null
        }
        this.#updateMonthName();
    }

    setMonth(month, year, callback) {
        var newDate = new Date(this.#validYear(year), this.#validMonth(month), 1);
        if (newDate.toDateString() !== this.activeDate.toDateString()) {
            this.activeDate = new Date(newDate);
            this.#buildCalendarElement();
        }
        if (typeof callback === "function") {
            callback(this.activeDate)
        };
    }

    addMonth(v, callback) {
        if (!parseInt(v)) {
            return;
        }
        var nd = new Date(this.activeDate);
        nd = new Date(nd.setMonth(nd.getMonth() + v));
        this.setMonth(nd.getMonth(), nd.getFullYear(), callback);
    }

    addItem(key, label, cssClass, title, text, color, opacity, uid ) {

        if (typeof key === 'object') {
            var kpiItem = {
                key: key.key,
                label: key.label || '',
                cssClass: key.cssClass || 'kpic-data-item-default',
                title: key.title || '',
                text: key.text || '',
                color: key.color || '',
                opacity : key.opacity || '1',
                uid: key.uid || this.#uuid()
            }
        } else {
            var kpiItem = {
                key: key,
                label: label || '',
                cssClass: cssClass || 'kpic-data-item-default',
                title: title || '',
                text: text || '',
                color: color || '',
                opacity : opacity || '1',
                uid: uid || this.#uuid()
            }
        }
        this.kpiItems.push(kpiItem);
        this.#addKpiDomItem(kpiItem);

    }

    resetItems() {
        this.kpiItems = [];
        this.elem.find('.kpic-data-items').empty();
        this.elem.find('.kpic-data-items-count').text('');
    }

    getISODate() {
        return this.activeDate.toISOString().slice(0, 10);
    }

    getItemCountByKey(key) {
        return (this.kpiItems.filter(item => item.key==key)).length;
    }

    #buildLegend(selector) {
        function getLegend(item) {
            //if (jQuery(`.kpic-data-item[data-uid="${item.uid}"]`).length > 0) {
            return { label: item.label, color: item.color, cssClass: item.cssClass, uid: item.uid }

        }
        selector = selector || this.legendSelector;
        if (selector && jQuery(selector).length > 0) {
            let legendArray = this.kpiItems.map(getLegend);
            let answer = [];
            // get only unique data elements for elements on the page 

            legendArray.forEach(item => {
                if (jQuery(`.kpic-data-item[data-uid="${item.uid}"]`).length > 0) {
                    if (!answer.some(y => y.label === item.label)) {
                        answer.push({
                            label: item.label,
                            color: item.color,
                            cssClass: item.cssClass
                        })
                    }
                }
            })
            jQuery(selector).addClass('kpic-legend').show().empty().append('<div class="kpic-legend-items"></div>');
            answer.forEach(item => {
                var style = (item.color) ? `style="color:${item.color};"` : ""
                var elem = `<div class="kpic-legend-item">
                <span ${style} class="k-icon k-i-circle ${item.cssClass}"></span>
                ${item.label}
            </div>`;
                jQuery(selector).find('.kpic-legend-items').append(elem);
            });
        }
    }

    hexToHSL(hex, avalue) {

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(result[1], 16);
        var g = parseInt(result[2], 16);
        var b = parseInt(result[3], 16);
        var cssString = '';
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);

        cssString = h + ',' + s + '%,' + l + '%,' + avalue ;
        cssString = 'hsl(' + cssString + ')';

        return cssString;
    }

    // Private Methods 
    #updateMonthName() {
        var month;
        if (this.monthDisplay) {
            const date = new Date(this.activeDate);
            if (this.monthDisplay.format === 'long' || this.monthDisplay.format === 'short') {
                month = date.toLocaleString('default', { month: this.monthDisplay.format });
            } else if (typeof kendo === 'object') {
                month = kendo.toString(date, this.monthDisplay.format);
            } else {
                month = date.toLocaleString('default', { month: 'long' });
            }
            this.monthDisplay.elem.text(month);
        }
        if (typeof this.monthDisplay?.callback === "function") {
            this.monthDisplay.callback(this.activeDate);
        }
    }
    #validMonth(month) {
        var d = new Date();
        if (typeof month === 'undefined' || parseInt(month) < 0 || parseInt(month) > 11) {
            return d.getMonth();
        }
        return month
    }
    #validYear(year) {
        var d = new Date();
        if (typeof year === 'undefined' || parseInt(year) < 2000) {
            return d.getFullYear();
        }
        return year
    }

    #addKpiDomItem(item) {
        var cssClass = "kpic-data-item";
        if (item.cssClass) {
            cssClass += ` ${item.cssClass}`;
        } else {
            cssClass += 'kpic-data-item-default';
        }
        var cssStyle = '';
        if (item.color) {
            // TODO : maybe support hsl supplied colors.
            if (item.color.length > 5) {
                var bg = this.hexToHSL(item.color, item.opacity || '.15');
                var bc = this.hexToHSL(item.color,'1');
            } else {
                var bg = item.color; var bc = item.color; 
            }
            cssStyle = `background-color:${bg};border-color:${bc};`
        }
        // get the day box
        var selector = `.kpic-box[data-date="${item.key}"]`;
        // check if this item (uid) exists in this box. 
        var itemSelector = `.kpic-box[data-date="${item.key}"] .kpic-data-item[data-uid="${item.uid}"]`;
        var $box = this.elem.find(selector);

        if ($box.length > 0 && jQuery(itemSelector).length === 0) {

            if (this.type === 'fill') {
                // add only the last data item for a calendar of type fill.
                $box.find('.kpic-data-items .kpic-data-item').remove();
                if (this.fillType === 'subtle') {
                    let itemCount = eventHub.getItemCountByKey(item.key);
                    item.text = (itemCount > 1) ? itemCount + " events" : "1 event"
                }
            }

            var e = `<div data-uid="${item.uid}" class="${cssClass}" title="${item.title}" style="${cssStyle}">
                        <div class="kpic-data-item-inner">${item.text}</div>
                    </div>`;
            $box.addClass('kpic-has-items').find('.kpic-data-items').append(e);

            // calculate whether there are kpi items that are below the bottom (hidden) of the date box.             
            var boxBottom = $box.offset().top + $box.innerHeight();
            var lastItem = $box.find('.kpic-data-item:last-child');
            var bottom = lastItem.offset().top + lastItem.innerHeight();
            if (bottom > boxBottom) {
                // store this in DOM, so that we no exactly how many are *not* shown, as opposed to how many there are. 
                var count = parseInt($box.find('.kpic-data-items-count').text()) || 0;
                $box.find('.kpic-data-items-count').show().text(`+${count + 1}`);
            }
            this.#buildLegend();
        }
    }

    #buildCalendarElement() {

        var today = new Date();
        var thisMonth = this.activeDate.getMonth();

        // build kpi calendar header row 
        var headerId = this.#uuid();
        this.elem.empty().append(`<div data-uuid="${headerId}" class="kpic-header-row"></div>`);
        var $lgcHeader = jQuery(`[data-uuid="${headerId}"]`);
        for (var i = 0; i < 7; i++) {
            var div = `<div class="kpic-box"><div class="kpic-dow-text">${"SMTWTFS"[i]}</div></div>`;
            $lgcHeader.append(div);
        }

        // month view starts from the first sunday on or before the active date 
        var startDate = new Date(this.activeDate);
        while (startDate.getDay() > 0) {
            startDate.setDate(startDate.getDate() - 1);
        }
        this.calendarDateFirst = new Date(startDate);        

        var currentDate = new Date(startDate);
        // build a grid for 5 or 6 weeks; no less or more 
        var gridId = this.#uuid();
        this.elem.append(`<div data-uuid="${gridId}" class="kpic-grid"></div>`);
        var $grid = jQuery(`[data-uuid="${gridId}"]`);

        for (var i = 0; i < 42; i++) {
            var dateClass = "kpic-box";

            if (currentDate.getMonth() !== thisMonth) {
                dateClass += " kpic-date-disabled";
            }
            if (currentDate.toDateString() === today.toDateString()) {
                dateClass += " kpic-date-current";
            }

            var dateKey = currentDate.toISOString().slice(0, 10);
            var dateId = this.#uuid();

            var d = `<div class="${dateClass}" data-date="${dateKey}" data-uuid="[${dateId}">
                        <div class="kpic-date-text">${currentDate.getDate()}</div>
                        <div class="kpic-data-items"></div>
                        <div class="kpic-data-items-count"></div>
                    </div>`;
            $grid.append(d);

            currentDate.setDate(currentDate.getDate() + 1);

            this.calendarDateLast = new Date(currentDate);

            // break on the 6th week if that sunday is not in the current month. 
            if (this.truncateView && i == 34 && currentDate.getMonth() !== thisMonth) {
                break;
            }
        }

        // if there are elements in the kpi, re-add them to the new calendar 
        // lovely use of arrow function here, since it doesn't jerk around with 'this'        
        this.kpiItems.forEach(item => {
            this.#addKpiDomItem(item);
        });

        this.#buildLegend();

        this.#updateMonthName();
    }

    #uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }   
}
