/* 
    Legend calendar builds a simple css grid based month view suitable for adding color coded accents to show 
    items that belong to a specific date 
*/

class kpiCalendar {

    constructor(selector, month, year) {

        // activeDate is the first day of the month of the current calendar view.
        this.activeDate = new Date(this.#validYear(year), this.#validMonth(month), 1);
        this.elem = jQuery(selector || '.kpic-calendar').first();
        
        // if true then do not display week 7 if not in current month, false (default) show only last week of view 
        this.truncateView = typeof this.elem.data("truncateview") === 'undefined' ? 1 : this.elem.data("truncateview");

        this.legendItems = [];
        this.#buildCalendarElement();
    }

    // Public Methods 
    setMonthDisplay(selector, format) {
        this.monthDisplay = {
            elem : jQuery(selector),
            format : format || 'long'
        }
        this.#updateMonthName();
    }

    setMonth(month, year) {        
        var newDate = new Date(this.#validYear(year), this.#validMonth(month), 1);
        if (newDate.toDateString() !== this.activeDate.toDateString()) {
            this.activeDate = new Date(newDate);
            this.#buildCalendarElement();
        }
    }

    addMonth(v) {
        var nd = new Date(this.activeDate);
        this.activeDate = new Date(nd.setMonth(nd.getMonth() + v))
        this.#buildCalendarElement();
    }

    addLegendItem(key, cssClassName, title, text, uid) {
        // add a legend item, 
        var legendItem = {
            key: key,
            cssClassName: cssClassName || 'kpic-data-item-default',
            title: title || '',
            text : text || '',
            uid : uid || this.#uuid()
        }
        this.legendItems.push(legendItem);
        this.#addLegendDOMItem(legendItem);
    }

    resetLegendItems() {
        this.legendItems = [];
        this.elem.find('.kpic-data-item').remove();
    }

    // Private Methods 
    #updateMonthName() {
        if (this.monthDisplay) {
            const date = new Date(this.activeDate);
            const month = date.toLocaleString('default', { month: this.monthDisplay.format });
            this.monthDisplay.elem.text(month);
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

    #addLegendDOMItem(item) {
        var selector = `.kpic-box[data-date="${item.key}"]`;
        var itemSelector = `.kpic-data-item[data-uid="${item.uid}"]`;
        if (jQuery(itemSelector).length === 0) {
            var e = `<div data-uid="${item.uid}" class="kpic-data-item ${item.cssClassName}" title="${item.title}">
                <div class="kpic-data-item-inner">${item.text}</div>
            </div>`;
            this.elem.find(selector).addClass('kpic-has-items').find('.kpic-data-items').append(e);
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
                dateClass += " kpic-datecurrent";
            }

            var dateKey = currentDate.toISOString().slice(0, 10);
            var dateId = this.#uuid();

            var d = `<div class="${dateClass}" data-date="${dateKey}" data-uuid="[${dateId}">
                        <div class="kpic-date-text">${currentDate.getDate()}</div>
                        <div class="kpic-data-items"></div>
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
            this.#addLegendDOMItem(item);
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