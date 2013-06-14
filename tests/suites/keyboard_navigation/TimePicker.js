module('Keyboard Navigation (TimePicker)', {
    setup: function(){
        this.input = $('<input type="text">')
						.val('14:05:20')
                        .appendTo('#qunit-fixture')
                        .datepicker({format: "HH:mm:ss",pickDate:false})
                        .focus(); // Activate for visibility checks
        this.dp = this.input.data('datepicker')
        this.picker = this.dp.picker;
    },
    teardown: function(){
        this.picker.remove();
    }
});

test('Time is parsed and displayed properly', function(){
    var target;

	this.input.focus();
	
    ok(this.picker.is(':visible'), 'Picker is visible');

    this.input.trigger({
        type: 'keydown',
        keyCode: 9
    });

    ok(this.picker.is(':not(:visible)'), 'Picker is hidden');
	
	equal(this.input.val(),'14:05:20');
});

test('Keyboard navigation is active', function(){
    var target;

	this.input.focus();
	
    ok(this.picker.is(':visible'), 'Picker is visible');

	// Hours is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'14');
	
	// Up Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 38
    });
	equal(this.input.val(),'15:05:20');
	
	// Down Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 40
    });
	equal(this.input.val(),'14:05:20');
	
	// Right Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 39
    });
	// Minutes is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'05');
	
	// Up Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 38
    });
	equal(this.input.val(),'14:06:20');
	
	// Down Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 40
    });
	equal(this.input.val(),'14:05:20');
	
	// Right Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 39
    });
	// Seconds is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'20');
	
	// Up Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 38
    });
	equal(this.input.val(),'14:05:21');
	
	// Down Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 40
    });
	equal(this.input.val(),'14:05:20');
	
	// Right Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 39
    });
	// Hour is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'14');
	
	// Left Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 37
    });
	// Hour is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'20');
	
	// Left Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 37
    });
	// Hour is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'05');
	
	// Left Arrow
    this.input.trigger({
        type: 'keydown',
        keyCode: 37
    });
	// Hour is focused
	equal(this.picker.find('.timepicker-picker td .focused').text(),'14');
	
	// Escape
    this.input.trigger({
        type: 'keydown',
        keyCode: 9
    });

    ok(this.picker.is(':not(:visible)'), 'Picker is hidden');
	
	equal(this.input.val(),'14:05:20');
});
