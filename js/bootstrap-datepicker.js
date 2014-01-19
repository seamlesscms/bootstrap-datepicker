/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 * Improvements by Ramkumar Krishnamoorthy (Seamless CMS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function ($) {

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }
    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    function UTCNow() {
        var today = new Date();
        return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds());
    }

    // Picker object

    var Datepicker = function (element, options) {
        this.element = $(element);

        this._process_options(options);

		if(!this.o.pickDate && !this.o.pickTime) {
			return false;
		}
		
        this.picker = $(getTemplate(this.o.timeIcon, this.o.pickDate, this.o.pickTime, this.o.pick12HourFormat, this.o.pickSeconds, this.o.collapse, this.o.keyboardNavigation)).appendTo('body');
		if(this.o.pickTime && this.o.keyboardNavigation) {
			this.picker.find('.timepicker-picker [data-time-component]:eq(0)').addClass('focused');
		}
        this._buildEvents();
        this._attachEvents();

        this.viewMode = this.o.startView;

        if (this.o.calendarWeeks)
            this.picker.find('tfoot th.today, tfoot th.clear')
						.attr('colspan', function (i, val) {
						    return parseInt(val) + 1;
						});

        this._allow_update = false;

        this.setStartDate(this.o.startDate);
        this.setEndDate(this.o.endDate);
        this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

        this.fillDow();
        this.fillMonths();
        this.fillHours();
        this.fillMinutes();
        this.fillSeconds();

        this._allow_update = true;

        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        _process_options: function (opts) {
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.o = $.extend({}, this._o);

            this.isInline = false;
            this.isInput = this.element.is('input');
            this.component = false;
            if (this.element.find('.input-append') || this.element.find('.input-prepend'))
                this.component = this.element.find('.add-on');

            this.hasInput = this.component && this.element.find('input').length;

            if (!this.o.format) {
                if (this.isInput) this.o.format = this.element.data('format');
                else this.o.format = this.element.find('input').data('format');
                if (!this.o.format) this.o.format = 'MM/dd/yyyy';
            }

            this._compileFormat();

            if (this.component && this.component.length === 0)
                this.component = false;

            // Setup icon
            var icon;
            if (this.component) {
                icon = this.component.find('i');
            }
            if (this.o.pickTime) {
                if (icon && icon.length) this.o.timeIcon = icon.data('time-icon');
                if (!this.timeIcon) this.o.timeIcon = 'icon-time';
                if (icon) icon.addClass(this.o.timeIcon);
            }
            if (this.o.pickDate) {
                if (icon && icon.length) this.o.dateIcon = icon.data('date-icon');
                if (!this.dateIcon) this.o.dateIcon = 'icon-calendar';
                if (icon) icon.removeClass(this.o.timeIcon);
                if (icon) icon.addClass(this.o.dateIcon);
            }

            // Check if "de-DE" style date is available, if not language should
            // fallback to 2 letter code eg "de"
            var lang = o.language;
            if (!dates[lang]) {
                lang = lang.split('-')[0];
                if (!dates[lang])
                    lang = $.fn.datepicker.defaults.language;
            }
            o.language = lang;

            switch (o.startView) {
                case 2:
                case 'decade':
                    o.startView = 2;
                    break;
                case 1:
                case 'year':
                    o.startView = 1;
                    break;
                default:
                    o.startView = 0;
            }

            switch (o.minViewMode) {
                case 1:
                case 'months':
                    o.minViewMode = 1;
                    break;
                case 2:
                case 'years':
                    o.minViewMode = 2;
                    break;
                default:
                    o.minViewMode = 0;
            }

            o.startView = Math.max(o.startView, o.minViewMode);

            o.weekStart %= 7;
            o.weekEnd = ((o.weekStart + 6) % 7);

            if (o.startDate !== -Infinity) {
                o.startDate = this.parseDate(o.startDate);
            }
            if (o.endDate !== Infinity) {
                o.endDate = this.parseDate(o.endDate);
            }

            o.daysOfWeekDisabled = o.daysOfWeekDisabled || [];
            if (!$.isArray(o.daysOfWeekDisabled))
                o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
            o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
                return parseInt(d, 10);
            });
        },
        _events: [],
        _secondaryEvents: [],
        _applyEvents: function (evs) {
            for (var i = 0, el, ev; i < evs.length; i++) {
                el = evs[i][0];
                ev = evs[i][1];
                el.on(ev);
            }
        },
        _unapplyEvents: function (evs) {
            for (var i = 0, el, ev; i < evs.length; i++) {
                el = evs[i][0];
                ev = evs[i][1];
                el.off(ev);
            }
        },
        _buildEvents: function () {
            if (this.isInput) { // single input
                this._events = [
					[this.element, {
					    focus: $.proxy(function() {
							this.update();
							this.show();
						}, this),
					    keyup: $.proxy(this.update, this),
					    keydown: $.proxy(this.keydown, this)
					}]
				];
            }
            else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                // For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
					    focus: $.proxy(function() {
							this.update();
							this.show();
							this.element.toggleClass('active');
						}, this),
					    keyup: $.proxy(this.update, this),
					    keydown: $.proxy(this.keydown, this),
						blur: $.proxy(function() {
							this.element.toggleClass('active');
						},this)
					}],
					[this.component, {
					    click: $.proxy(this.show, this)
					}]
				];
            }
            else if (this.element.is('div')) {  // inline datepicker
                this.isInline = true;
            }
            else {
                this._events = [
					[this.element, {
					    click: $.proxy(this.show, this)
					}]
				];
            }

            this._secondaryEvents = [
				[this.picker, {
				    click: $.proxy(this.click, this)
				}],
				[$(window), {
				    resize: $.proxy(this.place, this)
				}],
				[$(document), {
				    mousedown: $.proxy(function (e) {
				        // Clicked outside the datepicker, hide it
				        if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).size() ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).size()
						)) {
				            this.hide();
				        }
				    }, this)
				}],
                [this.picker.find('.accordion-toggle'), {
                    'click.togglePicker': $.proxy(this.togglePicker, this)
                }],
                [this.picker.find('[data-action]'), {
                    'click': $.proxy(this.doAction, this)
                }]
			];
			
			// These are events which are attached only when the picker is hidden but not removed.
			this._passiveEvents = [
				[this.isInput ? this.element : this.element.find('input'), {
					blur:$.proxy(function() {
						if((this.isInput ? this.element : this.element.find('input')).val() !=='')
							this.setValue();
					}, this)
				}]
			];
        },
        togglePicker: function (e) {
            e.stopPropagation();
			if(this.o.collapse) {
				var expanded = this.picker.find('.collapse.in');
				var closed = this.picker.find('.collapse:not(.in)');

				if (expanded && expanded.length) {
					var collapseData = expanded.data('collapse');
					if (collapseData && collapseData.transitioning) return;
					expanded.collapse('hide');
					closed.collapse('show')
					this.element.find('> .add-on > i').toggleClass(this.o.timeIcon + ' ' + this.o.dateIcon);
				}
			}
			if(this.o.keyboardNavigation) {
				this.picker.find('> ul > li:not(.picker-switch)').toggleClass('active');
			}
        },
        _attachEvents: function () {
            this._detachEvents();
            this._applyEvents(this._events);
        },
        _detachEvents: function () {
            this._unapplyEvents(this._events);
        },
        _attachSecondaryEvents: function () {
            this._detachSecondaryEvents();
            this._applyEvents(this._secondaryEvents);
        },
        _detachSecondaryEvents: function () {
            this._unapplyEvents(this._secondaryEvents);
        },
        _attachPassiveEvents: function () {
            this._detachPassiveEvents();
            this._applyEvents(this._passiveEvents);
        },
        _detachPassiveEvents: function () {
            this._unapplyEvents(this._passiveEvents);
        },
        _trigger: function (event, altdate) {
            var date = altdate || this.date, local_date = new Date();

            if (date)
                local_date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));

            this.element.trigger({
                type: event,
                date: local_date,
                format: $.proxy(function (altformat) {
                    var format = altformat || this.o.format;
                    return this.formatDate(date, this.o.language, format);
                }, this)
            });
        },

        show: function (e) {
            if (!this.isInline)
                this.picker.appendTo('body');
			
			this.updateNavArrows();
            this.picker.show();
			
			if(this.o.pickTime)
				this.actions.showPicker.call(this);
			
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.place();
            this._attachSecondaryEvents();
            if (e) {
                e.preventDefault();
            }
            this._trigger('show');
        },

        hide: function (e) {
            if (this.isInline) return;
            if (!this.picker.is(':visible')) return;
            this.picker.hide().detach();
            this._detachSecondaryEvents();
			this._attachPassiveEvents();
            this.viewMode = this.o.startView;
            this.showMode();

            if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
                this.setValue();
            this._trigger('hide');
        },

        remove: function () {
            this.hide();
            this._detachEvents();
            this._detachSecondaryEvents();
			this._detachPassiveEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
            if (!this.isInput) {
                delete this.element.data().date;
            }
        },

        getDate: function () {
            var d = this.getUTCDate();
            return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
        },

        getUTCDate: function () {
            return this.date;
        },

        setDate: function (d) {
            this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
        },

        setUTCDate: function (d) {
            this.date = d;
            this.setValue();
        },

        setValue: function () {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted);
                }
            } else {
                this.element.val(formatted);
            }
        },

        getFormattedDate: function (format) {
            if (format === undefined)
                format = this.o.format;
            return this.formatDate(this.date, this.o.language, format);
        },

        setStartDate: function (startDate) {
            this._process_options({ startDate: startDate });
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function (endDate) {
            this._process_options({ endDate: endDate });
            this.update();
            this.updateNavArrows();
        },

        setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
            this._process_options({ daysOfWeekDisabled: daysOfWeekDisabled });
            this.update();
            this.updateNavArrows();
        },

        place: function () {
            if (this.isInline) return;
            var zIndex = parseInt(this.element.parents().filter(function () {
                return $(this).css('z-index') != 'auto';
            }).first().css('z-index')) + 10;
            var offset = this.component ? this.component.parent().offset() : this.element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(true);
            this.picker.css({
                top: offset.top + height,
                left: offset.left,
                zIndex: zIndex
            });
        },

        _allow_update: true,
        update: function () {
            if (!this._allow_update) return;

            var date, fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
                delete this.element.data().date;
            }

            this.date = this.parseDate(date) || this.date;
            if (!this.date) {
				this.date = UTCToday();
			}

            if (fromArgs) this.setValue();

            if (this.date < this.o.startDate) {
                this.viewDate = new Date(this.o.startDate);
				this.date = new Date(this.o.startDate);
            } else if (this.date > this.o.endDate) {
                this.viewDate = new Date(this.o.endDate);
				this.date = new Date(this.o.endDate);
            } else {
                this.viewDate = new Date(this.date);
            }
            this.fillDate();
            this.fillTime();
        },

        fillDow: function () {
            var dowCnt = this.o.weekStart,
			html = '<tr>';
            if (this.o.calendarWeeks) {
                var cell = '<th class="cw">&nbsp;</th>';
                html += cell;
                this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
            }
            while (dowCnt < this.o.weekStart + 7) {
                html += '<th class="dow">' + dates[this.o.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function () {
            var html = '',
			i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.o.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        setRange: function (range) {
            if (!range || !range.length)
                delete this.range;
            else
                this.range = $.map(range, function (d) { return d.valueOf(); });
            this.fillDate();
            this.fillTime();
        },

        getClassNames: function (date) {
            var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				currentDate = this.date,
				today = new Date();
            if (date.getUTCFullYear() < year || (date.getUTCFullYear() == year && date.getUTCMonth() < month)) {
                cls.push('old');
            } else if (date.getUTCFullYear() > year || (date.getUTCFullYear() == year && date.getUTCMonth() > month)) {
                cls.push('new');
            }
            // Compare internal UTC date with local today, not UTC today
            if (this.o.todayHighlight &&
				date.getUTCFullYear() == today.getFullYear() &&
				date.getUTCMonth() == today.getMonth() &&
				date.getUTCDate() == today.getDate()) {
                cls.push('today');
            }
            if (currentDate && 
				date.getUTCFullYear() == currentDate.getUTCFullYear() &&
				date.getUTCMonth() == currentDate.getUTCMonth() &&
				date.getUTCDate() == currentDate.getUTCDate()) {
                cls.push('active');
            }
            if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
                cls.push('disabled');
            }
            if (this.range) {
                if (date > this.range[0] && date < this.range[this.range.length - 1]) {
                    cls.push('range');
                }
                if ($.inArray(date.valueOf(), this.range) != -1) {
                    cls.push('selected');
                }
            }
            return cls;
        },

        fillDate: function () {

            var year = this.viewDate.getUTCFullYear();
            var month = this.viewDate.getUTCMonth();
            var tooltip;

            var startYear = typeof this.o.startDate === 'object' ? this.o.startDate.getUTCFullYear() : -Infinity;
            var startMonth = typeof this.o.startDate === 'object' ? this.o.startDate.getUTCMonth() : -1;
            var endYear = typeof this.o.endDate === 'object' ? this.o.endDate.getUTCFullYear() : Infinity;
            var endMonth = typeof this.o.endDate === 'object' ? this.o.endDate.getUTCMonth() : 12;

            this.picker.find('.datepicker-days').find('.disabled').removeClass('disabled');
            this.picker.find('.datepicker-months').find('.disabled').removeClass('disabled');
            this.picker.find('.datepicker-years').find('.disabled').removeClass('disabled');

            this.picker.find('.datepicker-days th.datepicker-switch').text(
                dates[this.o.language].months[month] + ' ' + year);
            this.picker.find('tfoot th.today')
						.text(dates[this.o.language].today)
						.toggle(this.o.todayBtn !== false);
            this.picker.find('tfoot th.clear')
						.text(dates[this.o.language].clear)
						.toggle(this.o.clearBtn !== false);

            var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0);
            var day = DPGlobal.getDaysInMonth(
                prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7) % 7);
            if ((year == startYear && month <= startMonth) || year < startYear) {
                this.picker.find('.datepicker-days th:eq(0)').addClass('disabled');
            }
            if ((year == endYear && month >= endMonth) || year > endYear) {
                this.picker.find('.datepicker-days th:eq(2)').addClass('disabled');
            }

            var nextMonth = new Date(prevMonth.valueOf());
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.o.weekStart) {
					html.push('<tr>');
					if(this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(+ws + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(+(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="cw">'+ calWeek +'</td>');
					}
                }
                clsName = this.getClassNames(prevMonth);// '';
				clsName.push('day');
				var before = this.o.beforeShowDay(prevMonth);
				if (before === undefined)
					before = {};
				else if (typeof(before) === 'boolean')
					before = {enabled: before};
				else if (typeof(before) === 'string')
					before = {classes: before};
				if (before.enabled === false)
					clsName.push('disabled');
				if (before.classes)
					clsName = clsName.concat(before.classes.split(/\s+/));
				if (before.tooltip)
					tooltip = before.tooltip;

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() == this.o.weekEnd) {
					html.push('</tr>');
				}

                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
            var currentYear = this.date.getUTCFullYear();

            var months = this.picker.find('.datepicker-months').find(
                'th:eq(1)').text(year).end().find('span').removeClass('active');
            if (currentYear === year) {
                months.eq(this.date.getUTCMonth()).addClass('active');
            }
            if (currentYear - 1 < startYear) {
                this.picker.find('.datepicker-months th:eq(0)').addClass('disabled');
            }
            if (currentYear + 1 > endYear) {
                this.picker.find('.datepicker-months th:eq(2)').addClass('disabled');
            }
            for (var i = 0; i < 12; i++) {
                if ((year == startYear && startMonth > i) || (year < startYear)) {
                    $(months[i]).addClass('disabled');
                } else if ((year == endYear && endMonth < i) || (year > endYear)) {
                    $(months[i]).addClass('disabled');
                }
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years').find(
                'th:eq(1)').text(year + '-' + (year + 9)).end().find('td');
            this.picker.find('.datepicker-years').find('th').removeClass('disabled');
            if (startYear > year) {
                this.picker.find('.datepicker-years').find('th:eq(0)').addClass('disabled');
            }
            if (endYear < year + 9) {
                this.picker.find('.datepicker-years').find('th:eq(2)').addClass('disabled');
            }
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + ((year < startYear || year > endYear) ? ' disabled' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        fillHours: function () {
            var table = this.picker.find(
                '.timepicker .timepicker-hours table');
            table.parent().hide();
            var html = '';
            if (this.o.pick12HourFormat) {
                var current = 1;
                for (var i = 0; i < 3; i += 1) {
                    html += '<tr>';
                    for (var j = 0; j < 4; j += 1) {
                        var c = current.toString();
                        html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
                        current++;
                    }
                    html += '</tr>'
                }
            } else {
                var current = 0;
                for (var i = 0; i < 6; i += 1) {
                    html += '<tr>';
                    for (var j = 0; j < 4; j += 1) {
                        var c = current.toString();
                        html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
                        current++;
                    }
                    html += '</tr>'
                }
            }
            table.html(html);
        },

        fillMinutes: function () {
            var table = this.picker.find(
                '.timepicker .timepicker-minutes table');
            table.parent().hide();
            var html = '';
            var current = 0;
            for (var i = 0; i < 3; i++) {
                html += '<tr>';
                for (var j = 0; j < 4; j += 1) {
                    var c = current.toString();
                    html += '<td class="minute">' + padLeft(c, 2, '0') + '</td>';
                    current += 5;
                }
                html += '</tr>';
            }
            table.html(html);
        },

        fillSeconds: function () {
            var table = this.picker.find(
                '.timepicker .timepicker-seconds table');
            table.parent().hide();
            var html = '';
            var current = 0;
            for (var i = 0; i < 3; i++) {
                html += '<tr>';
                for (var j = 0; j < 4; j += 1) {
                    var c = current.toString();
                    html += '<td class="second">' + padLeft(c, 2, '0') + '</td>';
                    current += 5;
                }
                html += '</tr>';
            }
            table.html(html);
        },

        fillTime: function () {
            if (!this.date)
                return;
            var timeComponents = this.picker.find('.timepicker span[data-time-component]');
            var is12HourFormat = this.o.pick12HourFormat;
            var hour = this.date.getUTCHours();
            var period = 'AM';
            if (is12HourFormat) {
                if (hour >= 12) period = 'PM';
                if (hour === 0) hour = 12;
                else if (hour != 12) hour = hour % 12;
                this.picker.find(
                  '.timepicker [data-action=togglePeriod]').text(period);
            }
            hour = padLeft(hour.toString(), 2, '0');
            var minute = padLeft(this.date.getUTCMinutes().toString(), 2, '0');
            var second = padLeft(this.date.getUTCSeconds().toString(), 2, '0');
            timeComponents.filter('[data-time-component=hours]').text(hour);
            timeComponents.filter('[data-time-component=minutes]').text(minute);
            timeComponents.filter('[data-time-component=seconds]').text(second);
			
            var $table = this.picker.find('.timepicker-picker > table');
			if($table.data('selectionIndex')==null) {
				$table.data('selectionIndex',0);
			}
            $table.data('keydown', function (e) {
				if (!this.o.keyboardNavigation) return;

                var dateChanged = false, dir, newDate, newViewDate;
                switch (e.keyCode) {
					case 13: // enter
						if(this.o.pickDate) {
							this.togglePicker(e);
						}
						else {
							this.hide();
						}
						e.preventDefault();
                        break;
                    case 27: // escape
					case 9:  // tab
                        this.hide();
                        if(e.keyCode != 9) e.preventDefault();
                        break;
                    case 37: // left
                    case 39: // right
                        dir = e.keyCode == 37 ? -1 : 1;
                        var selectionIndex = $table.data('selectionIndex');
                        selectionIndex = (selectionIndex + dir + timeComponents.length) % timeComponents.length;
                        timeComponents.removeClass('focused');
                        $(timeComponents[selectionIndex]).addClass('focused');
						$table.data('selectionIndex',selectionIndex);
                        e.preventDefault();
                        break;
                    case 38: // up
                    case 40: // down
                        dir = e.keyCode == 38 ? 1 : -1;
						switch($table.data('selectionIndex')) {
							case 0:
								newDate = this.moveHour(this.date, dir);
								newViewDate = this.moveHour(this.viewDate, dir);
								break;
							case 1:
								newDate = this.moveMinutes(this.date, dir);
								newViewDate = this.moveMinutes(this.viewDate, dir);
								break;
							case 2:
								newDate = this.moveSeconds(this.date, dir);
								newViewDate = this.moveSeconds(this.viewDate, dir);
								break;
						}
                        e.preventDefault();
                        break;
					case 77: //m
						newDate = this.switchMeridian(this.date);
						viewDate = this.switchMeridian(this.viewDate);
                        e.preventDefault();
						break;
                }
				
				if (this.dateWithinRange(newDate)){
					this.date = newDate;
					this.viewDate = newViewDate;
					this.setValue();
					this.update();
					e.preventDefault();
					dateChanged = true;
				}
				
				return dateChanged;
			});
        },

        updateNavArrows: function () {
            if (!this._allow_update) return;

            var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
            switch (this.viewMode) {
                case 0:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 1:
                case 2:
                    if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
            }
        },

        click: function (e) {
            e.preventDefault();
            var target = $(e.target).closest('span, td, th');
            if (target.length == 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'datepicker-switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        break;
                                    case 1:
                                    case 2:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        break;
                                }
                                this.fillDate();
                                this.fillTime();
								this.updateNavArrows();
                                break;
                            case 'today':
                                this.showMode(-2);
                                var which = this.o.todayBtn == 'linked' ? null : 'view';
                                this._setDate(UTCToday(), which);
                                break;
                            case 'clear':
                                if (this.isInput)
                                    this.element.val("");
                                else
                                    this.element.find('input').val("");
                                this.update();
                                if (this.o.autoclose)
                                    this.hide();
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            this.viewDate.setUTCDate(1);
                            if (target.is('.month')) {
                                var day = 1;
                                var month = target.parent().find('span').index(target);
                                var year = this.viewDate.getUTCFullYear();
                                this.viewDate.setUTCMonth(month);
                                this._trigger('changeMonth', this.viewDate);
                                if (this.o.minViewMode === 1) {
                                    this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
                                }
                            } else {
                                var year = parseInt(target.text(), 10) || 0;
                                var day = 1;
                                var month = 0;
                                this.viewDate.setUTCFullYear(year);
                                this._trigger('changeYear', this.viewDate);
                                if (this.o.minViewMode === 2) {
                                    this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
                                }
                            }
                            this.showMode(-1);
                            this.fillDate();
                            this.fillTime();
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month == 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
							if(!this.o.pickTime) {
								this.hide();
							}
                        }
                        break;
                }
            }
        },

        _setDate: function (date, which) {
            if (!which || which == 'date')
                this.date = new Date(date);
            if (!which || which == 'view')
                this.viewDate = new Date(date);
            this.fillDate();
            this.fillTime();
            this.setValue();
            this._trigger('changeDate');
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
                if (this.o.autoclose && (!which || which == 'date') && !this.o.pickTime) {
                    this.hide();
                }
            }
        },

		switchMeridian: function(date) {
			var newDate = new Date(date);
            newDate.setUTCHours((date.getUTCHours()+12)%24);
			return newDate;
		},
        moveHour: function (date, dir) {
            var newDate = new Date(date);
            newDate.setUTCHours((date.getUTCHours() + 48 + dir) % 24);
            return newDate;
        },

        moveMinutes: function (date, dir) {
            var newDate = new Date(date);
            newDate.setUTCMinutes((date.getUTCMinutes() + 120 + dir) % 60);
            return newDate;
        },

        moveSeconds: function (date, dir) {
            var newDate = new Date(date);
            newDate.setUTCSeconds((date.getUTCSeconds() + 120 + dir) % 60);
            return newDate;
        },

        moveMonth: function (date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag == 1) {
                test = dir == -1
                // If going back one month, make sure month is not current month
                // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function () { return new_date.getUTCMonth() == month; }
                // If going forward one month, make sure month is as expected
                // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function () { return new_date.getUTCMonth() != new_month; };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function () { return new_month != new_date.getUTCMonth(); };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function (date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        actions: {
            incrementHours: function (e) {
                this.date.setUTCHours(this.date.getUTCHours() + 1);
            },

            incrementMinutes: function (e) {
                this.date.setUTCMinutes(this.date.getUTCMinutes() + 1);
            },

            incrementSeconds: function (e) {
                this.date.setUTCSeconds(this.date.getUTCSeconds() + 1);
            },

            decrementHours: function (e) {
                this.date.setUTCHours(this.date.getUTCHours() - 1);
            },

            decrementMinutes: function (e) {
                this.date.setUTCMinutes(this.date.getUTCMinutes() - 1);
            },

            decrementSeconds: function (e) {
                this.date.setUTCSeconds(this.date.getUTCSeconds() - 1);
            },

            togglePeriod: function (e) {
                var hour = this.date.getUTCHours();
                if (hour >= 12) hour -= 12;
                else hour += 12;
                this.date.setUTCHours(hour);
            },

            showPicker: function () {
                this.picker.find('.timepicker > div:not(.timepicker-picker)').hide();
                this.picker.find('.timepicker .timepicker-picker').show();
            },

            showHours: function () {
                this.picker.find('.timepicker .timepicker-picker').hide();
                this.picker.find('.timepicker .timepicker-hours').show();
            },

            showMinutes: function () {
                this.picker.find('.timepicker .timepicker-picker').hide();
                this.picker.find('.timepicker .timepicker-minutes').show();
            },

            showSeconds: function () {
                this.picker.find('.timepicker .timepicker-picker').hide();
                this.picker.find('.timepicker .timepicker-seconds').show();
            },

            selectHour: function (e) {
                var tgt = $(e.target);
                var value = parseInt(tgt.text(), 10);
                if (this.o.pick12HourFormat) {
                    var current = this.date.getUTCHours();
                    if (current >= 12) {
                        if (value != 12) value = (value + 12) % 24;
                    } else {
                        if (value === 12) value = 0;
                        else value = value % 12;
                    }
                }
                this.date.setUTCHours(value);
                this.actions.showPicker.call(this);
            },

            selectMinute: function (e) {
                var tgt = $(e.target);
                var value = parseInt(tgt.text(), 10);
                this.date.setUTCMinutes(value);
                this.actions.showPicker.call(this);
            },

            selectSecond: function (e) {
                var tgt = $(e.target);
                var value = parseInt(tgt.text(), 10);
                this.date.setUTCSeconds(value);
                this.actions.showPicker.call(this);
            }
        },

        doAction: function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!this.date) this.date = UTCDate(1970, 0, 0, 0, 0, 0, 0);
            var action = $(e.currentTarget).data('action');
            var rv = this.actions[action].apply(this, arguments);
            this.setValue();
            this.fillTime();
            this._trigger('changeDate');
            return rv;
        },

        dateWithinRange: function (date) {
            return date >= this.o.startDate && date <= this.o.endDate;
        },

        keydown: function (e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode == 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }

            var dateChanged = false,
				dir, newDate, newViewDate;

            var keydownDelegate = this.picker.find('> ul > li.active div:visible > table, > div.active > div:visible > table').data('keydown');
            if (keydownDelegate) {
                dateChanged = keydownDelegate.call(this, e);
            }
            else {
                switch (e.keyCode) {
                    case 27: // escape
                        this.hide();
                        e.preventDefault();
                        break;
                    case 37: // left
                    case 39: // right
                        if (!this.o.keyboardNavigation) break;
                        dir = e.keyCode == 37 ? -1 : 1;
                        if (e.ctrlKey) {
                            newDate = this.moveYear(this.date, dir);
                            newViewDate = this.moveYear(this.viewDate, dir);
                        } else if (e.shiftKey) {
                            newDate = this.moveMonth(this.date, dir);
                            newViewDate = this.moveMonth(this.viewDate, dir);
                        } else {
                            newDate = new Date(this.date);
                            newDate.setUTCDate(this.date.getUTCDate() + dir);
                            newViewDate = new Date(this.viewDate);
                            newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
                        }
                        if (this.dateWithinRange(newDate)) {
                            this.date = newDate;
                            this.viewDate = newViewDate;
                            this.setValue();
                            this.update();
                            e.preventDefault();
                            dateChanged = true;
                        }
                        break;
                    case 38: // up
                    case 40: // down
                        if (!this.o.keyboardNavigation) break;
                        dir = e.keyCode == 38 ? -1 : 1;
                        if (e.ctrlKey) {
                            newDate = this.moveYear(this.date, dir);
                            newViewDate = this.moveYear(this.viewDate, dir);
                        } else if (e.shiftKey) {
                            newDate = this.moveMonth(this.date, dir);
                            newViewDate = this.moveMonth(this.viewDate, dir);
                        } else {
                            newDate = new Date(this.date);
                            newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
                            newViewDate = new Date(this.viewDate);
                            newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
                        }
                        if (this.dateWithinRange(newDate)) {
                            this.date = newDate;
                            this.viewDate = newViewDate;
                            this.setValue();
                            this.update();
                            e.preventDefault();
                            dateChanged = true;
                        }
                        break;
                    case 13: // enter
						if(this.o.pickTime) {
							this.togglePicker(e);
						}
						else {
							this.hide();
						}
						e.preventDefault();
                        break;
                    case 9: // tab
                        this.hide();
                        break;
                }
				this.updateNavArrows()
            }

            if (dateChanged) {
                this._trigger('changeDate');
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function (dir) {
            if (dir) {
                this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
            }
            /*
            vitalets: fixing bug of very special conditions:
            jquery 1.7.1 + webkit + show inline datepicker in bootstrap popover.
            Method show() does not set display css correctly and datepicker is not shown.
            Changed to .css('display', 'block') solve the problem.
            See https://github.com/vitalets/x-editable/issues/37

            In jquery 1.7.2+ everything works fine.
            */
            //this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
            this.picker.find('.datepicker > div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
            this.updateNavArrows();
        },

        formatDate: function (d,language) {
            return this.o.format.replace(formatReplacer, function (match) {
                var methodName, getValue, property, rv, len = match.length;
                if (match === 'ms')
                    len = 1;
                property = dateFormatComponents[match].property;
				getValue = dateFormatComponents[match].getValue;
				if (getValue != undefined) {
					return getValue(d,language);
				}
				methodName = 'get' + property;
				rv = d[methodName]();
                if (methodName === 'getUTCMonth') rv = rv + 1;
                return padLeft(rv.toString(), len, '0');
            });
        },

        parseDate: function (str) {
			if(str instanceof Date) return str;
			
            var match, i, property, value, parsed = {};
            if (!(match = this._formatPattern.exec(str))) {
				// if the format pattern does not match, check if its a difference string pattern
				if (/^[\-+]\d+[dmMhswy]([\s,]+[\-+]\d+[dmMhswy])*$/.test(str)) {
					var part_re = /([\-+]\d+)([dmMhswy])/,
						parts = str.match(/([\-+]\d+)([dmMhswy])/g),
						part, dir;
					var date = new Date();
					for (var i=0; i<parts.length; i++) {
						part = part_re.exec(parts[i]);
						dir = parseInt(part[1]);
						switch(part[2]){
							case 'd':
								date.setUTCDate(date.getUTCDate() + dir);
								break;
							case 'M':
								date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
								break;
							case 'w':
								date.setUTCDate(date.getUTCDate() + dir * 7);
								break;
							case 'y':
								date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
								break;
							case 'h':
								date = Datepicker.prototype.moveHour.call(Datepicker.prototype, date, dir);
								break;
							case 'm':
								date = Datepicker.prototype.moveMinutes.call(Datepicker.prototype, date, dir);
								break;
							case 's':
								date = Datepicker.prototype.moveSeconds.call(Datepicker.prototype, date, dir);
								break;
						}
					}
					
					if(this.o.pickTime)
						return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
					else
						return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
				}
				else {
					return null;
				}
			}
            for (i = 1; i < match.length; i++) {
                property = this._propertiesByIndex[i];
                if (!property)
                    continue;
                value = match[i];
                if(dateFormatComponents[property].parseValue) {
					value = dateFormatComponents[property].parseValue(value, this.o.language);
				}
				else if (/^\d+$/.test(value)) {
                    value = parseInt(value, 10);
				}
                parsed[dateFormatComponents[property].property] = value;
            }
            return this._finishParsingDate(parsed);
        },

        _finishParsingDate: function (parsed) {
            var year, month, date, hours, minutes, seconds, milliseconds;
            year = parsed.UTCFullYear;
            if (!year) year = 1970;
			month = parsed.UTCMonth || 0;
            date = parsed.UTCDate || 1;
            hours = parsed.UTCHours || 0;
			if(parsed.Period) {
				hours = hours%12;
				if(parsed.Period == 'PM')
					hours += 12;
			}
            minutes = parsed.UTCMinutes || 0;
            seconds = parsed.UTCSeconds || 0;
            milliseconds = parsed.UTCMilliseconds || 0;
            return UTCDate(year, month, date, hours, minutes, seconds, milliseconds);
        },

        _compileFormat: function () {
            var match, component, components = [], mask = [],
          str = this.o.format, propertiesByIndex = {}, i = 0, pos = 0;
            while (match = formatComponent.exec(str)) {
                component = match[0];
                if (component in dateFormatComponents) {
                    i++;
                    propertiesByIndex[i] = component;
                    components.push('\\s*' + dateFormatComponents[component].getPattern(
                this) + '\\s*');
                    mask.push({
                        pattern: new RegExp(dateFormatComponents[component].getPattern(
                  this)),
                        property: dateFormatComponents[component].property,
                        start: pos,
                        end: pos += component.length
                    });
                }
                else {
                    components.push(escapeRegExp(component));
                    mask.push({
                        pattern: new RegExp(escapeRegExp(component)),
                        character: component,
                        start: pos,
                        end: ++pos
                    });
                }
                str = str.slice(component.length);
            }
            this._mask = mask;
            this._maskPos = 0;
            this._formatPattern = new RegExp(
            '^\\s*' + components.join('') + '\\s*$');
            this._propertiesByIndex = propertiesByIndex;
        }
    };

    var DateRangePicker = function (element, options) {
        this.element = $(element);
        this.inputs = $.map(options.inputs, function (i) { return i.jquery ? i[0] : i; });
        delete options.inputs;

        $(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

        this.pickers = $.map(this.inputs, function (i) { return $(i).data('datepicker'); });
        this.updateDates();
    };
    DateRangePicker.prototype = {
        updateDates: function () {
            this.dates = $.map(this.pickers, function (i) { return i.date; });
            this.updateRanges();
        },
        updateRanges: function () {
            var range = $.map(this.dates, function (d) { return d.valueOf(); });
            $.each(this.pickers, function (i, p) {
                p.setRange(range);
            });
        },
        dateUpdated: function (e) {
            var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
            if (i == -1) return;

            if (new_date < this.dates[i]) {
                // Date being moved earlier/left
                while (i >= 0 && new_date < this.dates[i]) {
                    this.pickers[i--].setUTCDate(new_date);
                }
            }
            else if (new_date > this.dates[i]) {
                // Date being moved later/right
                while (i < l && new_date > this.dates[i]) {
                    this.pickers[i++].setUTCDate(new_date);
                }
            }
            this.updateDates();
        },
        remove: function () {
            $.map(this.pickers, function (p) { p.remove(); });
            delete this.element.data().datepicker;
        }
    };

    function opts_from_el(el, prefix) {
        // Derive options from element data-attrs
        var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])'),
			prefix = new RegExp('^' + prefix.toLowerCase());
        for (var key in data)
            if (prefix.test(key)) {
                inkey = key.replace(replace, function (_, a) { return a.toLowerCase(); });
                out[inkey] = data[key];
            }
        return out;
    }

    function opts_from_locale(lang) {
        // Derive options from locale plugins
        var out = {};
        // Check if "de-DE" style date is available, if not language should
        // fallback to 2 letter code eg "de"
        if (!dates[lang]) {
            lang = lang.split('-')[0]
            if (!dates[lang])
                return;
        }
        var d = dates[lang];
        $.each($.fn.datepicker.locale_opts, function (i, k) {
            if (k in d)
                out[k] = d[k];
        });
        return out;
    }

    var old = $.fn.datepicker;
    $.fn.datepicker = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function () {
            var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
            if (!data) {
                var elopts = opts_from_el(this, 'date'),
                // Preliminary otions
					xopts = $.extend({}, $.fn.datepicker.defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
                // Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, $.fn.datepicker.defaults, locopts, elopts, options);
                if ($this.is('.input-daterange') || opts.inputs) {
                    var ropts = {
                        inputs: opts.inputs || $this.find('input').toArray()
                    };
                    $this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
                }
                else {
                    $this.data('datepicker', (data = new Datepicker(this, opts)));
                }
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
                    return false;
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };

    $.fn.datepicker.defaults = {
        autoclose: false,
        beforeShowDay: $.noop,
        calendarWeeks: false,
        clearBtn: false,
        daysOfWeekDisabled: [],
        endDate: Infinity,
        forceParse: true,
        keyboardNavigation: true,
        language: 'en',
        minViewMode: 0,
        rtl: false,
        startDate: -Infinity,
        startView: 0,
        todayBtn: false,
        todayHighlight: false,
        weekStart: 0,
        collapse: true,
        pickDate: true,
        pickTime: true,
        pick12HourFormat: false,
        pickSeconds: true
    };
    $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
    $.fn.datepicker.Constructor = Datepicker;
    var dates = $.fn.datepicker.dates = {
        en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			meridian: ["AM", "PM"],
            today: "Today",
            clear: "Clear"
        }
    };

    var dateFormatComponents = {
        d: { property: 'UTCDate', getPattern: function () { return '([1-9]|[1-2][0-9]|3[0-1])\\b'; } },
        dd: { property: 'UTCDate', getPattern: function () { return '(0?[1-9]|[1-2][0-9]|3[0-1])\\b'; } },
		ddd: { property: 'UTCDayShort', 
			 getPattern: function (that) { 
				return '(' + dates[that.o.language].daysShort.join('|') + ')\\b'; 
			}, 
			 getValue: function(d,language) {
				return dates[language].daysShort[d.getUTCDay()];
			 },
			 parseValue: function(str, language) {
				return dates[language].daysShort.indexOf(str);
			 } 
		   },
		dddd: { property: 'UTCDayLong', 
			 getPattern: function (that) { 
				return '(' + dates[that.o.language].days.join('|') + ')\\b'; 
			}, 
			 getValue: function(d,language) {
				return dates[language].days[d.getUTCDay()];
			 },
			 parseValue: function(str, language) {
				return dates[language].days.indexOf(str);
			 } 
		   },
        yy: { 
				property: 'UTCFullYear', 
				getPattern: function () { return '(\\d{2})\\b' },
				getValue: function(d) { 
					return (d.getUTCFullYear()%100);	// return only the last 2 digits of the year
				},
				parseValue: function(val) {
					return 2000 + parseInt(val, 10);
				}
			},
        yyyy: { property: 'UTCFullYear', getPattern: function () { return '(\\d{4})\\b'; } },
        H:  { property: 'UTCHours', getPattern: function () { return '([0-9]|1[0-9]|2[0-3])\\b'; } },
        HH: { property: 'UTCHours', getPattern: function () { return '(0?[0-9]|1[0-9]|2[0-3])\\b'; } },
        h:  { 
				property: 'UTCHours', 
				getPattern: function () { return '([0-9]|1[0-2])\\b'; },
				getValue: function(d) { 
					var h = d.getUTCHours();
					if(h === 0 || h === 12) return 12;
					else return h%12;
				}
			},
        hh: { 
				property: 'UTCHours', 
				getPattern: function () { return '(0?[1-9]|1[0-2])\\b'; },
				getValue: function(d) { 
					var h = d.getUTCHours();
					if(h === 0 || h === 12) return '12';
					else return padLeft((h%12).toString(), 2, '0');
				}
			},
        m:  { property: 'UTCMinutes', getPattern: function () { return '([0-9]|[1-5][0-9])\\b'; } },
        mm: { property: 'UTCMinutes', getPattern: function () { return '(0?[0-9]|[1-5][0-9])\\b'; } },
        M:  { 
				property: 'UTCMonth', 
				getPattern: function () { return '([1-9]|1[0-2])\\b'; },
				parseValue: function(val) {
					return parseInt(val, 10)-1;
				}
			},
        MM: {   property: 'UTCMonth', 
				getPattern: function () { return '(0?[1-9]|1[0-2])\\b'; },
				parseValue: function(val) {
					return parseInt(val, 10)-1;
				}
			},
        MMM:  { property: 'UTCMonth', 
				getPattern: function (that) { 
					return '(' + dates[that.o.language].monthsShort.join('|') + ')\\b'; 
				},
				getValue: function(d,language) { 
					return dates[language].monthsShort[d.getUTCMonth()];
				},
				parseValue: function(str, language) {
					return dates[language].monthsShort.indexOf(str);
				}
			},
        MMMM: { property: 'UTCMonth', 
				getPattern: function (that) { 
					return '(' + dates[that.o.language].months.join('|') + ')\\b'; 
				},
				getValue: function(d,language) { 
					return dates[language].months[d.getUTCMonth()];
				},
				parseValue: function(str, language) {
					return dates[language].months.indexOf(str);
				}
			},
        ss: { property: 'UTCSeconds', getPattern: function () { return '(0?[0-9]|[1-5][0-9])\\b'; } },
        ms: { property: 'UTCMilliseconds', getPattern: function () { return '([0-9]{1,3})\\b'; } },
        t:  { 
				property: 'Period', 
				getPattern: function (that) { 
					var meridianLetters = [];
					for(i=0;i<dates[that.o.language].meridian.length;i++) {
						meridianLetters.push(dates[that.o.language].meridian[i].charAt(0));
					}
					return '('+meridianLetters.join('|')+')\\b';
				},
				getValue: function(d,language) {
					var h = d.getUTCHours();
					return dates[language].meridian[((h >= 12)?1:0)].charAt(0);
				}
			},
        tt: { 
				property: 'Period', 
				getPattern: function (that) { 
					return '('+dates[that.o.language].meridian.join('|')+')\\b';
				},
				getValue: function(d,language) {
					var h = d.getUTCHours();
					return dates[language].meridian[((h >= 12)?1:0)];
				}
			}
    };

    var keys = [];
    for (var k in dateFormatComponents) keys.push(k);
    keys[keys.length - 1] += '\\b';
    keys.push('.');

    var formatComponent = new RegExp(keys.join('\\b|'));
    keys.pop();
    var formatReplacer = new RegExp(keys.join('\\b|'), 'g');

    function escapeRegExp(str) {
        // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function padLeft(s, l, c) {
        if (l < s.length) return s;
        else return Array(l - s.length + 1).join(c || ' ') + s;
    }

    function getTemplate(timeIcon, pickDate, pickTime, is12Hours, showSeconds, collapse, keyboardNavigation) {
        if (pickDate && pickTime) {
            return (
        '<div class="bootstrap-datetimepicker-widget dropdown-menu">' +
          '<ul>' +
            '<li class="' + (collapse ? 'collapse in' : '') + (keyboardNavigation ? ' active' : '') + '">' +
              '<div class="datepicker">' +
                DPGlobal.template +
              '</div>' +
            '</li>' +
            '<li class="picker-switch accordion-toggle"><a><i class="' + timeIcon + '"></i></a></li>' +
            '<li' + (collapse ? ' class="collapse"' : '') + '>' +
              '<div class="timepicker">' +
                TPGlobal.getTemplate(is12Hours, showSeconds) +
              '</div>' +
            '</li>' +
          '</ul>' +
        '</div>'
      );
        } else if (pickTime) {
            return (
        '<div class="bootstrap-datetimepicker-widget dropdown-menu">' +
          '<div class="timepicker ' + (keyboardNavigation ? ' active' : '') + '">' +
            TPGlobal.getTemplate(is12Hours, showSeconds) +
          '</div>' +
        '</div>'
      );
        } else {
            return (
        '<div class="bootstrap-datetimepicker-widget dropdown-menu">' +
          '<div class="datepicker ' + (keyboardNavigation ? ' active' : '') + '">' +
            DPGlobal.template +
          '</div>' +
        '</div>'
      );
        }
    }

    var DPGlobal = {
        modes: [
			{
			    clsName: 'days',
			    navFnc: 'Month',
			    navStep: 1
			},
			{
			    clsName: 'months',
			    navFnc: 'FullYear',
			    navStep: 1
			},
			{
			    clsName: 'years',
			    navFnc: 'FullYear',
			    navStep: 10
			}],
        isLeapYear: function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function (year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function (format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return { separators: separators, parts: parts };
        },
        headTemplate: '<thead>' +
							'<tr>' +
								'<th class="prev"><i class="icon-arrow-left"/></th>' +
								'<th colspan="5" class="datepicker-switch"></th>' +
								'<th class="next"><i class="icon-arrow-right"/></th>' +
							'</tr>' +
						'</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr><tr><th colspan="7" class="clear"></th></tr></tfoot>'
    };
    DPGlobal.template = '<div class="datepicker-days">' +
							'<table class=" table-condensed">' +
								DPGlobal.headTemplate +
								'<tbody></tbody>' +
								DPGlobal.footTemplate +
							'</table>' +
						'</div>' +
						'<div class="datepicker-months">' +
							'<table class="table-condensed">' +
								DPGlobal.headTemplate +
								DPGlobal.contTemplate +
								DPGlobal.footTemplate +
							'</table>' +
						'</div>' +
						'<div class="datepicker-years">' +
							'<table class="table-condensed">' +
								DPGlobal.headTemplate +
								DPGlobal.contTemplate +
								DPGlobal.footTemplate +
							'</table>' +
						'</div>';

    var TPGlobal = {
        hourTemplate: '<span data-action="showHours" data-time-component="hours" class="timepicker-hour"></span>',
        minuteTemplate: '<span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>',
        secondTemplate: '<span data-action="showSeconds" data-time-component="seconds" class="timepicker-second"></span>'
    };
    TPGlobal.getTemplate = function (is12Hours, showSeconds) {
        return (
        '<div class="timepicker-picker">' +
          '<table class="table-condensed"' +
            (is12Hours ? ' data-hour-format="12"' : '') +
            '>' +
            '<tr>' +
              '<td><a href="#" class="btn" data-action="incrementHours"><i class="icon-chevron-up"></i></a></td>' +
              '<td class="separator"></td>' +
              '<td><a href="#" class="btn" data-action="incrementMinutes"><i class="icon-chevron-up"></i></a></td>' +
              (showSeconds ?
              '<td class="separator"></td>' +
              '<td><a href="#" class="btn" data-action="incrementSeconds"><i class="icon-chevron-up"></i></a></td>' : '') +
              (is12Hours ? '<td class="separator"></td>' : '') +
            '</tr>' +
            '<tr>' +
              '<td>' + TPGlobal.hourTemplate + '</td> ' +
              '<td class="separator">:</td>' +
              '<td>' + TPGlobal.minuteTemplate + '</td> ' +
              (showSeconds ?
              '<td class="separator">:</td>' +
              '<td>' + TPGlobal.secondTemplate + '</td>' : '') +
              (is12Hours ?
              '<td class="separator"></td>' +
              '<td>' +
              '<button type="button" class="btn btn-primary" data-action="togglePeriod"></button>' +
              '</td>' : '') +
            '</tr>' +
            '<tr>' +
              '<td><a href="#" class="btn" data-action="decrementHours"><i class="icon-chevron-down"></i></a></td>' +
              '<td class="separator"></td>' +
              '<td><a href="#" class="btn" data-action="decrementMinutes"><i class="icon-chevron-down"></i></a></td>' +
              (showSeconds ?
              '<td class="separator"></td>' +
              '<td><a href="#" class="btn" data-action="decrementSeconds"><i class="icon-chevron-down"></i></a></td>' : '') +
              (is12Hours ? '<td class="separator"></td>' : '') +
            '</tr>' +
          '</table>' +
        '</div>' +
        '<div class="timepicker-hours" data-action="selectHour">' +
          '<table class="table-condensed">' +
          '</table>' +
        '</div>' +
        '<div class="timepicker-minutes" data-action="selectMinute">' +
          '<table class="table-condensed">' +
          '</table>' +
        '</div>' +
        (showSeconds ?
        '<div class="timepicker-seconds" data-action="selectSecond">' +
          '<table class="table-condensed">' +
          '</table>' +
        '</div>' : '')
        );
    }

    $.fn.datepicker.DPGlobal = DPGlobal;
    $.fn.datepicker.TPGlobal = TPGlobal;

    /* DATEPICKER NO CONFLICT
    * =================== */

    $.fn.datepicker.noConflict = function () {
        $.fn.datepicker = old;
        return this;
    };


    /* DATEPICKER DATA-API
    * ================== */

    $(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function (e) {
		    var $this = $(this);
		    if ($this.data('datepicker')) return;
		    e.preventDefault();
		    // component click requires us to explicitly show it
		    $this.datepicker('show');
		}
	);
    $(function () {
        $('[data-provide="datepicker-inline"]').datepicker();
    });

} (window.jQuery);
