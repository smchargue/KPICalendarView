/* 
    Legend calendar builds a simple css grid based month view suitable for adding color coded accents to show 
    items that belong to a specific date 
*/

class kpiCalendar {

    constructor(selector, month, year) {

        // activeDate is the first day of the month of the current calendar view.
        this.activeDate = new Date(this.#validYear(year), this.#validMonth(month), 1);
        this.elem = jQuery(selector || '.kpic-calendar, .kpic-calendar-sm').first();
        
        // if true then do not display week 7 if not in current month, false (default) show only last week of view 
        this.truncateView = typeof this.elem.data("truncateview") === 'undefined' ? 1 : this.elem.data("truncateview");
        if (this.elem.data('monthdisplay')) {
            var fmt = this.elem.data('monthformat') || 'long'; 
            this.setMonthDisplay(this.elem.data('monthdisplay'),fmt);
        }

        this.legendItems = [];
        this.#buildCalendarElement();
        
    }

    // Public Methods 
    setMonthDisplay(selector, format, callback) {
        this.monthDisplay = {
            elem : jQuery(selector),
            format : format || 'long',
            callback : callback || null
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

    addMonth(v,callback) {
        if (!parseInt(v)) {
            return;
        }
        var nd = new Date(this.activeDate);
        nd = new Date(nd.setMonth(nd.getMonth() + v));
        this.setMonth(nd.getMonth(), nd.getFullYear(), callback);
    }

    addItem(key, cssClass, title, text, color, uid) {
        // add a legend item, 
        var legendItem = {
            key: key,
            cssClass: cssClass || 'kpic-data-item-default',
            title: title || '',
            text : text || '',
            color: color || '',
            uid : uid || this.#uuid()
        }
        this.legendItems.push(legendItem);
        this.#addKpiDomItem(legendItem);
    }

    resetItems() {
        this.legendItems = [];
        this.elem.find('.kpic-data-item').remove();
    }

    getISODate() {
        return this.activeDate.toISOString().slice(0,10);
    }

    // Private Methods 
    #updateMonthName() {
        if (this.monthDisplay) {
            const date = new Date(this.activeDate);
            const month = date.toLocaleString('default', { month: this.monthDisplay.format });
            this.monthDisplay.elem.text(month);
        }
        if (typeof this.monthDisplay?.callback === "function") {
            this.monthDisplay.callback(this.activeDate);
        }
    }
    #validMonth (month) {
        var d = new Date();
        if (typeof month === 'undefined' || parseInt(month) < 0 || parseInt(month) > 11) {
            return d.getMonth();
        }
        return month
    }
    #validYear (year) {
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
            cssStyle = `background-color:${item.color};border-color:${item.color};`
        }
        var selector = `.kpic-box[data-date="${item.key}"]`;
        var itemSelector = `.kpic-data-item[data-uid="${item.uid}"]`;
        var $box = this.elem.find(selector);
        if ($box.length > 0 && jQuery(itemSelector).length === 0) {
            var e = 
            `<div data-uid="${item.uid}" class="${cssClass}" title="${item.title}" style="${cssStyle}">
                <div class="kpic-data-item-inner">${item.text}</div>
            </div>`;
            this.elem.find(selector).addClass('kpic-has-items').find('.kpic-data-items').append(e);

            // calculate whether there are kpi items that are below the bottom (hidden) of the date box.             
            var boxBottom =  $box.offset().top + $box.innerHeight();
            var lastItem = $box.find('.kpic-data-item:last-child') ;
            if (lastItem.offset().top > boxBottom) {
                var count = parseInt($box.find('.kpic-data-items-count').text()) || 0;
                $box.find('.kpic-data-items-count').show().text(`+${count + 1}`);
            }
        }        
        
    }

    #buildCalendarElement() {

        var today = new Date();
        var thisMonth = this.activeDate.getMonth();

        // build legend calendar header row 
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

            // break on the 6th week if that sunday is not in the current month. 
            if (this.truncateView && i == 34 && currentDate.getMonth() !== thisMonth) {
                break;
            }
        }

        // if there are elements in the legend, re-add them to the new calendar 
        // lovely use of arrow function here, since it doesn't jerk around with 'this'        
        this.legendItems.forEach( item => {
            this.#addKpiDomItem(item);
        });

        this.#updateMonthName();
    }

    #uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}