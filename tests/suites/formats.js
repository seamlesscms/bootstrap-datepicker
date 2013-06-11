module('Formats', {
    setup: function(){
        this.input = $('<input type="text">').appendTo('#qunit-fixture');
        this.date = UTCDate(2012, 2, 15, 0, 0, 0, 0); // March 15, 2012
    },
    teardown: function(){
        this.input.data('datepicker').picker.remove();
    }
});

test('d: Day of month, no leading zero.', function(){
    this.input
        .val('2012-03-5')
        .datepicker({format: 'yyyy-MM-d'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[2], '5');
});

test('dd: Day of month, leading zero.', function(){
    this.input
        .val('2012-03-05')
        .datepicker({format: 'yyyy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[2], '05');
});

test('ddd: Day of week, short.', function(){
    this.input
        .val('2012-03-05-Mon')
        .datepicker({format: 'yyyy-MM-dd-ddd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[3], 'Mon');
});

test('dddd: Day of week, long.', function(){
    this.input
        .val('2012-03-05-Monday')
        .datepicker({format: 'yyyy-MM-dd-dddd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[3], 'Monday');
});

test('M: Month, no leading zero.', function(){
    this.input
        .val('2012-3-05')
        .datepicker({format: 'yyyy-M-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[1], '3');
});

test('MM: Month, leading zero.', function(){
    this.input
        .val('2012-03-05')
        .datepicker({format: 'yyyy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[1], '03');
});

test('MMM: Month shortname.', function(){
    this.input
        .val('2012-Mar-05')
        .datepicker({format: 'yyyy-MMM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[1], 'Mar');
});

test('MMMM: Month full name.', function(){
    this.input
        .val('2012-March-5')
        .datepicker({format: 'yyyy-MMMM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[1], 'March');
});

test('yy: Year, two-digit.', function(){
    this.input
        .val('12-03-05')
        .datepicker({format: 'yy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[0], '12');
});

test('yyyy: Year, four-digit.', function(){
    this.input
        .val('2012-03-5')
        .datepicker({format: 'yyyy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val().split('-')[0], '2012');
});

test('dd-MM-yyyy: Regression: Prevent potential month overflow in small-to-large formats (Mar 31, 2012 -> Mar 01, 2012)', function(){
    this.input
        .val('31-03-2012')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '31-03-2012');
});

test('dd-MM-yyyy: Leap day', function(){
    this.input
        .val('29-02-2012')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '29-02-2012');
});

test('yyyy-MM-dd: Alternative format', function(){
    this.input
        .val('2012-02-12')
        .datepicker({format: 'yyyy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val(), '2012-02-12');
});

test('yyyy-MM-dd: Regression: Infinite loop when numbers used for month', function(){
    this.input
        .val('2012-02-12')
        .datepicker({format: 'yyyy-MM-dd'})
        .datepicker('setValue');
    equal(this.input.val(), '2012-02-12');
});

test('+1d: Tomorrow', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('+1d')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '16-03-2012');
}));

test('-1d: Yesterday', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('-1d')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '14-03-2012');
}));

test('+1w: Next week', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('+1w')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '22-03-2012');
}));

test('-1w: Last week', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('-1w')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '08-03-2012');
}));

test('+1M: Next month', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('+1M')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '15-04-2012');
}));

test('-1M: Last month', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('-1M')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '15-02-2012');
}));

test('+1y: Next year', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('+1y')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2013');
}));

test('-1y: Last year', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15);
    this.input
        .val('-1y')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2011');
}));

test('+1h: Next Hour', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('+1h')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 03:00:00');
}));

test('-1h: Last Hour', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('-1h')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 01:00:00');
}));

test('+1m: Next Minute', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('+1m')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 02:01:00');
}));

test('-1m: Last Minute', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('-1m')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 02:59:00');
}));

test('+1s: Next Second', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('+1s')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 02:00:01');
}));

test('-1s: Last Second', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 2, 0, 0);
    this.input
        .val('-1s')
        .datepicker({format: 'dd-MM-yyyy hh:mm:ss'})
        .datepicker('setValue');
    equal(this.input.val(), '15-03-2012 02:00:59');
}));

test('-1y +2M +3h: Multiformat', patch_date(function(Date){
    Date.now = UTCDate(2012, 2, 15, 3);
    this.input
        .val('-1y +2M +3h')
        .datepicker({format: 'dd-MM-yyyy h'})
        .datepicker('setValue');
    equal(this.input.val(), '15-05-2011 6');
}));

test('Regression: End-of-month bug', patch_date(function(Date){
    Date.now = UTCDate(2012, 4, 31);
    this.input
        .val('29-02-2012')
        .datepicker({format: 'dd-MM-yyyy'})
        .datepicker('setValue');
    equal(this.input.val(), '29-02-2012');
}));

test('Invalid formats are force-parsed into a valid date on tab', patch_date(function(Date){
    Date.now = UTCDate(2012, 4, 31);
    this.input
        .val('44-44-4444')
        .datepicker({format: 'yyyy-MMMM-dd'})
        .focus();

    this.input.trigger({
        type: 'keydown',
        keyCode: 9
    });

    equal(this.input.val(), '2012-May-31');
}));

test('Trailing separators', patch_date(function(Date){
    Date.now = UTCDate(2012, 4, 31);
    this.input
        .val('29.02.2012.')
        .datepicker({format: 'dd.mm.yyyy.'})
        .datepicker('setValue');
    equal(this.input.val(), '29.02.2012.');
}));
