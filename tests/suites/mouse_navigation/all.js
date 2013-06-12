module('Mouse Navigation (All)', {
    setup: function(){
        this.input = $('<input type="text">')
                        .appendTo('#qunit-fixture')
                        .datepicker({format: "dd-MM-yyyy"})
                        .focus(); // Activate for visibility checks
        this.dp = this.input.data('datepicker')
        this.picker = this.dp.picker;
    },
    teardown: function(){
        this.picker.remove();
    }
});

test('Clicking datepicker should not hide datepicker', function(){
    ok(this.picker.is(':visible'), 'Widget is visible');
    this.picker.trigger('mousedown');
    ok(this.picker.is(':visible'), 'Widget is still visible');
});

test('Clicking outside datepicker should hide datepicker', function(){
    var $otherelement = $('<div />');
    $('body').append($otherelement);

    ok(this.picker.is(':visible'), 'Widget is visible');
    this.input.trigger('click');
    ok(this.picker.is(':visible'), 'Widget is still visible');

    $otherelement.trigger('mousedown');
    ok(this.picker.is(':not(:visible)'), 'Widget is hidden');

    $otherelement.remove();
});
