module('Time Picker', {
    setup: function(){},
    teardown: function(){
        $('#qunit-fixture *').each(function(){
            var t = $(this);
            if ('datepicker' in t.data())
                t.data('datepicker').picker.remove();
        });
    }
});

test('Time 12:00 AM', function(){
    var input = $('<input data-format="hh:mm tt" />')
				.val('12:00 AM')
                .appendTo('#qunit-fixture')
                .datepicker({
					pickDate:false,
					pick12HourFormat:false,
					pickSeconds:false
                }),
        dp = input.data('datepicker'),
        picker = dp.picker,
        target;

    input.focus();
	ok(input.val() == '12:00 AM');
	$(document).trigger('mousedown');
	ok(input.val() == '12:00 AM');
});

test('Time 12:00 PM', function(){
    var input = $('<input data-format="hh:mm tt" />')
				.val('12:00 PM')
                .appendTo('#qunit-fixture')
                .datepicker({
					pickDate:false,
					pick12HourFormat:false,
					pickSeconds:false
                }),
        dp = input.data('datepicker'),
        picker = dp.picker,
        target;

    input.focus();
	ok(input.val() == '12:00 PM');
	$(document).trigger('mousedown');
	ok(input.val() == '12:00 PM');
});

test('Show time picker icon when only time picker is enabled', function(){
    var input = $('<div><input data-format="hh:mm tt" type="text" value="12:00 PM"></input><span class="add-on"><i data-time-icon="icon-time" data-date-icon="icon-calendar"></i></span></div>')
				.val('12:00 AM')
                .appendTo('#qunit-fixture')
                .datepicker({
					pickDate:false,
					pick12HourFormat:false,
					pickSeconds:false
                }),
        dp = input.data('datepicker'),
        picker = dp.picker,
        target;

    ok(dp.component.find('i').is('.icon-time'));
});
