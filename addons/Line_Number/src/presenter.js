function AddonLine_Number_create() {
    function log(s) {
        console.log(s);
    }

    var presenter = function () {};

    presenter.configuration = {};

    presenter.errorCodes = {
        'MIN01' : 'Min value cannot be empty.',
        'MIN02' : 'Min value must be a number.',
        'MAX01' : 'Max value cannot be empty.',
        'MAX02' : 'Max value must be a number',
        'MIN/MAX01' : 'Min value cannot be lower than Max value.',
        'RAN01' : 'One or more ranges are invalid.',
        'STEP01' : 'The value in Step property is invalid.',
        'VAL01' : 'One or more X axis values are invalid.'
    };

    presenter.CLICKED_POSITION = {
        START: 1,
        MIDDLE: 2,
        END: 3,
        NONE: 4
    };

    presenter.DIRECTION = {
        LEFT: 1,
        RIGHT: 2
    };

    presenter.run = function(view, model) {
        presenter.$view = $(view);
        presenter.$view.disableSelection();

        presenter.configuration = presenter.readConfiguration(model);

        if (presenter.configuration.isError) {
            return DOMOperationsUtils.showErrorMessage(presenter.$view, presenter.errorCodes, presenter.configuration.errorCode)
        }

        presenter.createSteps();
        drawRanges(presenter.configuration.shouldDrawRanges);
    };

    function calculateStepWidth(xAxisValues) {
        var xAxisWidth = presenter.$view.find('#x-axis').width() - 1;

        return xAxisWidth / (xAxisValues.length - 1);
    }

    function getXAxisValues() {
        var configuration = presenter.configuration;
        var xAxisValues = [];

        for (var i = configuration.min; i <= configuration.max; i += configuration.step) {
            xAxisValues.push(i);
        }
        return xAxisValues;
    }

    function setClickedRanges(e) {
        var ranges = presenter.configuration.drawnRangesData.ranges;
        var value = $(e.target).attr('value');

        presenter.configuration.mouseData.clickedRanges = [];

        $.each(ranges, function() {
            if ( $.inArray(value, this.values) >= 0  ) {
                presenter.configuration.mouseData.clickedRanges.push(this);
            }
        });
    }

    function getRangesThatMouseIsAbove(e) {
        var drawnRanges = presenter.configuration.drawnRangesData.ranges;
        var ranges = [];
        var value = $(e.target).attr('value');
        var rangesThatMouseWasAbove = presenter.configuration.mouseData.rangesThatMouseWasAbove;

        $.each(drawnRanges, function() {
            if ( $.inArray(value, this.values) >= 0   ) {
                ranges.push(this);
            }
        });

        return ranges;
    }

    function setDirection(e) {
        var value = parseInt( $(e.target).attr('value'), 10);

        if ( value < presenter.configuration.mouseData.lastElementValue ) {
            presenter.configuration.mouseData.direction = presenter.DIRECTION.LEFT;
        } else if ( value > presenter.configuration.mouseData.lastElementValue ) {
            presenter.configuration.mouseData.direction = presenter.DIRECTION.RIGHT;
        }

        presenter.configuration.mouseData.lastElementValue = value;
    }

    function setRangesToRemove(e) {
        var value = $(e.target).attr('value');
        var rangesThatMouseWasAbove = presenter.configuration.mouseData.rangesThatMouseWasAbove;
        var lastIndex = rangesThatMouseWasAbove.length - 1;

        if ( presenter.configuration.mouseData.direction == presenter.DIRECTION.LEFT ) {

            if ( rangesThatMouseWasAbove.length > 0 && value < rangesThatMouseWasAbove[0].start.value ) {
                presenter.configuration.mouseData.rangesToRemove.push(rangesThatMouseWasAbove[0]);
                presenter.configuration.mouseData.rangesThatMouseWasAbove.splice(0, 1);
            }
            else if ( rangesThatMouseWasAbove.length > 0 && value > rangesThatMouseWasAbove[0].end.value ) {
                presenter.configuration.mouseData.rangesThatMouseWasAbove.splice(0, 1);
                presenter.configuration.mouseData.rangesToRemove.splice(0, 1);
            }

        } else if ( presenter.configuration.mouseData.direction == presenter.DIRECTION.RIGHT ) {

            if ( rangesThatMouseWasAbove.length > 0 && value > rangesThatMouseWasAbove[lastIndex].end.value ) {
                presenter.configuration.mouseData.rangesToRemove.push(rangesThatMouseWasAbove[lastIndex]);
                presenter.configuration.mouseData.rangesThatMouseWasAbove.pop();
            }
            else if ( rangesThatMouseWasAbove.length > 0 && value < rangesThatMouseWasAbove[lastIndex].start.value ) {
                presenter.configuration.mouseData.rangesThatMouseWasAbove.pop();
                presenter.configuration.mouseData.rangesToRemove.pop();
            }

        }
    }

    function setWhichPartOfRangeWasClicked(e) {
        var range = presenter.configuration.mouseData.clickedRanges[0];
        presenter.configuration.mouseData.clickedPosition = null;

        if (range.start.element[0] == $(e.target).parent()[0]) {
            presenter.configuration.mouseData.clickedPosition = presenter.CLICKED_POSITION.START;
        }

        else if (range.end.element[0] == $(e.target).parent()[0]) {
            presenter.configuration.mouseData.clickedPosition = presenter.CLICKED_POSITION.END;
        }

        else {
            presenter.configuration.mouseData.clickedPosition = presenter.CLICKED_POSITION.MIDDLE;
        }
    }

    function setMouseDown() {
        presenter.configuration.mouseData.isMouseDown = true;
    }

    function isIncludeImageClicked(e) {
        return $(e.target).parent().find('.rangeImage').length > 0;
    }

    function removeRange(range, removeIncludeImages) {
        var stepLine = range.start.element;
        $(stepLine).find('.selectedRange').remove();
        if (!range.values) { range.values = [] }

        var index = presenter.configuration.drawnRangesData.ranges.indexOf(range);
        if (index >= 0) {
            var removed = presenter.configuration.drawnRangesData.ranges.splice(index, 1);

            if (removeIncludeImages && removed.length > 0) {
                var start = removed[0].start.element;
                var end = removed[0].end.element;

                $(start).find('.rangeImage').remove();
                $(end).find('.rangeImage').remove();
                $(start).find('.selectedRange').remove();
            }
        }

        var removedValues = [];
        $.each(range.values, function() {
            var value = parseInt(this, 10);
            var index = presenter.configuration.drawnRangesData.values.indexOf(value);
            removedValues.concat(presenter.configuration.drawnRangesData.values.splice(index, 1));
        });

    }

    function splitRange(range, e) {
        removeRange(range, false);
        var clickedArea = $(e.target);

        var firstRange = {
            'start' : range.start,
            'end' : {
                'element' : clickedArea.parent(),
                'value' : clickedArea.attr('value'),
                'include' : false
            }
        };

        var secondRange = {
            'start' : firstRange.end,
            'end' : range.end
        };

        drawRanges([firstRange, secondRange]);
    }

    function joinRanges(ranges) {
        var firstRange, secondRange;
        var min = 1000, max = -1000;

        $.each(ranges, function() {
            if (this.end.value > max) {
                max = this.end.value;
                secondRange = this;
            }

            if (this.start.value < min) {
                min = this.start.value;
                firstRange = this;
            }
        });

        $.each(ranges, function() {
            removeRange(this, true);
        });

        var joinedRange = {
            'start' : firstRange.start,
            'end' : secondRange.end
        };

        drawRanges([joinedRange]);
    }

    function setWhichElementWasClicked(e) {
        presenter.configuration.mouseData.clickedElement = $(e.target);
        presenter.configuration.mouseData.clickedPosition = presenter.CLICKED_POSITION.NONE;
    }

    function addRangeFromElement(element) {

        var start = createRangeElement($(element).parent(), $(element).attr('value'), true);
        var end = start;
        var values = [start.value];
        var range = {
            start: start,
            end: end,
            values: values
        };

        presenter.configuration.drawnRangesData.ranges.push( range );

        var value = parseInt( $(element).attr('value'), 10 );
        if ( presenter.configuration.drawnRangesData.values.indexOf( value ) == -1 ) {
            presenter.configuration.drawnRangesData.values.push( value );
        }
    }

    function isStartSameAsEnd(range) {
        return range.values.length == 1;
    }

    function lengthenRange(e) {

        var clickedRange = presenter.configuration.mouseData.clickedRanges[0];
        var rangeToDraw = null;
        var value = $(e.target).attr('value');
        var shouldJoin = isValueInDrawnRanges(value);

        if( presenter.configuration.mouseData.direction == presenter.DIRECTION.RIGHT
            && presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.END ) {

            rangeToDraw = {
                start: clickedRange.start,
                end: createRangeElement( $(e.target).parent(), value, $(clickedRange.end.element).find('.rangeImage').hasClass('include') )
            };

            $(clickedRange.end.element).find('.rangeImage').remove();

        } else if ( presenter.configuration.mouseData.direction == presenter.DIRECTION.LEFT
            && presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.START ) {

            rangeToDraw = {
                start: createRangeElement( $(e.target).parent(), value, $(clickedRange.start.element).find('.rangeImage').hasClass('include') ),
                end: clickedRange.end
            };

            $(clickedRange.start.element).find('.rangeImage').remove();

        }

        removeRange(clickedRange);

        if ( shouldJoin ) {
            var ranges = getRangesThatMouseIsAbove(e);
            ranges.push(rangeToDraw);
            joinRanges(ranges);
        } else {
            drawRanges([rangeToDraw]);
        }

    }

    function shortenRange(e) {

        var clickedRange = presenter.configuration.mouseData.clickedRanges[0];
        var rangeToDraw = null;
        var value = $(e.target).attr('value');
        var shouldDraw = true;

        if( presenter.configuration.mouseData.direction == presenter.DIRECTION.LEFT
            && presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.END ) {

            if ( value == clickedRange.start.value ) {
                shouldDraw = false;
            }

            rangeToDraw = {
                start: clickedRange.start,
                end: createRangeElement( $(e.target).parent(), value, $(clickedRange.end.element).find('.rangeImage').hasClass('include') )
            };

            $(clickedRange.end.element).find('.rangeImage').remove();

        } else if ( presenter.configuration.mouseData.direction == presenter.DIRECTION.RIGHT
            && presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.START ) {

            if ( value == clickedRange.end.value ) {
                shouldDraw = false;
            }

            rangeToDraw = {
                start: createRangeElement( $(e.target).parent(), value, $(clickedRange.start.element).find('.rangeImage').hasClass('include') ),
                end: clickedRange.end
            };

            $(clickedRange.start.element).find('.rangeImage').remove();

        }

        removeRange(clickedRange);

        if ( shouldDraw ) {
            drawRanges([rangeToDraw]);
        } else {
            var rangeImage = $(e.target).parent().find('.rangeImage');

            if ( rangeImage.hasClass('exclude') ) {

                if ( !isValueInDrawnRanges(value) ) {
                    rangeImage.remove();
                }

            } else {

                setDrawnRangeValues(rangeToDraw);
                presenter.configuration.drawnRangesData.ranges.push(rangeToDraw);
                presenter.configuration.mouseData.clickedRanges = [];

            }

        }

    }

    function isValueInDrawnRanges(value) {
        return $.inArray(value, presenter.configuration.drawnRangesData.values) >= 0;
    }


    function createClickArea(element, value) {
        var clickArea = $('<div></div>');
        var selectedRange = $('<div></div>');

        selectedRange.addClass('selectedRange');
        clickArea.addClass('clickArea');

        $(element).append(clickArea);
        clickArea.attr('value', value);

        clickArea.on('contextmenu', function (e) {
            e.preventDefault();
        });

        clickArea.on('mousedown', function (e){
            setMouseDown();
            setClickedRanges(e);

            if ( presenter.isMouseAboveExistingRange(e) ) {
                setWhichPartOfRangeWasClicked(e);

            } else {
                setWhichElementWasClicked(e);
            }

            presenter.configuration.mouseData.lastElementValue = $(e.target).attr('value');
        });

        clickArea.on('mouseup', function (e){

            if ( presenter.configuration.mouseData.isMouseMoved ) {

                $.each( presenter.configuration.mouseData.rangesToRemove, function() {
                    removeRange(this, true);
                });

                if ( presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.NONE ) {

                    if ( presenter.configuration.mouseData.rangesThatMouseWasAbove.length == 0 ) {
                        drawRanges( [presenter.configuration.rangeToDraw] );
                    } else {
                        var ranges = [];
                        ranges = ranges.concat( presenter.configuration.mouseData.rangesThatMouseWasAbove );
                        ranges.push( presenter.configuration.rangeToDraw );
                        setDrawnRangeValues( presenter.configuration.rangeToDraw );
                        joinRanges( ranges );
                    }

                } else {

                    if ( presenter.configuration.mouseData.clickedRanges.length == 1 ) {

                        var value = $(e.target).attr('value');
                        if ( presenter.isValueInRange(value, presenter.configuration.mouseData.clickedRanges[0], false) ) {

                            shortenRange(e);

                        } else {

                            lengthenRange(e);

                        }

                    }

                }

                presenter.configuration.mouseData.rangesThatMouseWasAbove = [];
                presenter.configuration.mouseData.rangesToRemove = [];
                presenter.configuration.rangeToDraw = null;

            } else {
                var range = presenter.configuration.mouseData.clickedRanges[0];

                if ( presenter.isMouseAboveExistingRange(e) ) {

                    if ( isIncludeImageClicked(e) ) {

                        if ( isStartSameAsEnd(range) ) {
                            removeRange(range, true);
                        }

                        else if ( presenter.configuration.mouseData.clickedRanges.length == 2 ) {
                            joinRanges( presenter.configuration.mouseData.clickedRanges );
                        }

                        else {
                            var shouldInclude = true;
                            var imageWrapper = null;

                            if ( presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.START) {
                                shouldInclude = !range.start.include;
                                imageWrapper = range.start.element.find('.rangeImage');
                                presenter.configuration.mouseData.clickedRanges[0].start.include = shouldInclude;
                            } else {
                                shouldInclude = !range.end.include;
                                imageWrapper = range.end.element.find('.rangeImage');
                                presenter.configuration.mouseData.clickedRanges[0].end.include = shouldInclude;
                            }

                            toggleIncludeImage(imageWrapper, shouldInclude);
                        }

                    } else {
                        splitRange(range, e);
                    }

                } else {
                    addEndRangeImage( $(e.target).parent(), true );
                    addRangeFromElement( presenter.configuration.mouseData.clickedElement );
                }

            }

            presenter.configuration.mouseData.isMouseDown = false;
            presenter.configuration.mouseData.isMouseMoved = false;
        });

        clickArea.on('mouseenter', function(e) {
            if (presenter.configuration.mouseData.isMouseDown) {

                presenter.configuration.mouseData.isMouseMoved = true;
                setDirection(e);

                if ( presenter.configuration.mouseData.clickedPosition == presenter.CLICKED_POSITION.NONE ) {

                    var start, end;

                    if (presenter.configuration.mouseData.direction == presenter.DIRECTION.LEFT) {
                        end = createRangeElement($(presenter.configuration.mouseData.clickedElement).parent(), presenter.configuration.mouseData.clickedElement.attr('value'), true );
                        start = createRangeElement( $(e.target).parent(), $(e.target).attr('value'), true );
                    } else {
                        start = createRangeElement($(presenter.configuration.mouseData.clickedElement).parent(), presenter.configuration.mouseData.clickedElement.attr('value'), true );
                        end = createRangeElement( $(e.target).parent(), $(e.target).attr('value'), true );
                    }

                    var range = {
                        start: start,
                        end: end
                    };

                    presenter.configuration.rangeToDraw = range;
                    var ranges = getRangesThatMouseIsAbove(e);
                    presenter.configuration.mouseData.rangesThatMouseWasAbove = presenter.configuration.mouseData.rangesThatMouseWasAbove.concat( ranges );

                    setRangesToRemove(e);

                } else {

                    var ranges = getRangesThatMouseIsAbove(e);
                    presenter.configuration.mouseData.rangesThatMouseWasAbove = presenter.configuration.mouseData.rangesThatMouseWasAbove.concat( ranges );

                    setRangesToRemove(e);

                }
            }
        });

        presenter.$view.on('mouseup', function (e){
            presenter.$view.find('.current').removeClass('current');
            presenter.configuration.mouseData.isMouseDown = false;
        });

        clickArea.css({
            'width' : presenter.configuration.stepWidth,
            'left' : - (presenter.configuration.stepWidth / 2) + 'px'
        });

        moveYAxisClickArea();
    }

    function createRangeElement(element, value, include) {
        return {
            element: element,
            value: value,
            include: include
        }
    }

    presenter.isMouseAboveExistingRange = function( e ) {
        var value = $(e.target).attr('value');

        return $.inArray( parseInt(value, 10), presenter.configuration.drawnRangesData.values ) >= 0;
    };

    presenter.isValueInRange = function( value, range, takeExcludeIntoConsideration ) {

        var start, end;
        if (takeExcludeIntoConsideration) {
            start = range.start.include ? range.start.value : range.start.value + 1;
            end = range.end.include ? range.end.value + 1 : range.end.value;
        } else {
            start = range.start.value;
            end = range.end.value + 1;
        }

        for( var i = start; i < end; i++ ) {
            if ( i == value ) {
                return true;
            }
        }
        return false;
    };

    function toggleIncludeImage(imageWrapper, shouldInclude) {
        if (shouldInclude) {
            imageWrapper.addClass('include');
            imageWrapper.removeClass('exclude');
        } else {
            imageWrapper.addClass('exclude');
            imageWrapper.removeClass('include');
        }
    }

    function drawRanges(ranges) {
        $.each(ranges, function(i) {
            var startValue = Math.min(this.start.value, this.end.value);
            var endValue = Math.max(this.start.value, this.end.value);
            var startElement = presenter.$view.find('.clickArea[value=' + startValue + ']').parent();
            var endElement = presenter.$view.find('.clickArea[value=' + endValue + ']').parent();

            if (!this.start.element || !this.end.element) {
                presenter.configuration.shouldDrawRanges[i].start.element = startElement;
                presenter.configuration.shouldDrawRanges[i].end.element = endElement;
            }

            var start = parseFloat($(startElement).css('left'));
            var end = parseFloat(endElement.css('left'));
            var difference = Math.abs(start - end);
            var range = $('<div></div>');
            range.addClass('selectedRange');
            range.css('width', difference + 2 + 'px');
            startElement.append(range);

            if (start > end) {
                range.css('left', - (difference) + 'px');
            }

            presenter.configuration.drawnRangesData.ranges.push(this);

            setDrawnRangeValues(this);
            addEndRangeImages(startElement, endElement, this.start.include, this.end.include);
        });
    }

    function setDrawnRangeValues(range) {
        range.values = [];
        var startValue = Math.min(range.start.value, range.end.value);
        var endValue = Math.max(range.start.value, range.end.value);

        for ( var i = startValue; i <= endValue; i++ ) {
//            if (presenter.configuration.drawnRangesData.values.indexOf(i) == -1) {
                presenter.configuration.drawnRangesData.values.push(i);
//            }
            range.values.push(i);
        }
    }

    function addEndRangeImages(startElement, endElement, includeStart, includeEnd) {
        addEndRangeImage(endElement, includeEnd);

        if (startElement[0] != endElement[0]) {
            addEndRangeImage(startElement, includeStart);
        }
    }

    function addEndRangeImage(element, include) {
        element.find('.rangeImage').remove();
        var imageContainer = $('<div></div>');
        imageContainer.addClass('rangeImage');
        imageContainer.addClass(include ? 'include' : 'exclude');
        element.append(imageContainer);

    }

    presenter.createSteps = function () {
        var xAxisValues = getXAxisValues();
        presenter.configuration.stepWidth = calculateStepWidth(xAxisValues);
        var isDrawOnlyChosen = presenter.configuration.axisXValues.length > 0;

        for (var i = 0; i < xAxisValues.length; i++) {
            var stepLine = $('<div></div>');
            stepLine.addClass('stepLine');

            if (xAxisValues[i] == 0) {
                var innerHeight = presenter.$view.find('#inner').height();
                var yAxis = presenter.$view.find('#y-axis');
                var xAxis = presenter.$view.find('#x-axis');

                yAxis.height(innerHeight);
                yAxis.css({
                    'top' : - (innerHeight / 2),
                    'left' : presenter.configuration.stepWidth * i
                });
                xAxis.append(yAxis);
            } else {
                var text = $('<div></div>');
                text.addClass('stepText');
                text.html(xAxisValues[i]);
                text.css('left', - new String(xAxisValues[i]).length * (4) + 'px');


                if (isDrawOnlyChosen && presenter.configuration.showAxisXValues) {
                    if ($.inArray(xAxisValues[i], presenter.configuration.axisXValues) !== -1) {
                        stepLine.append(text);
                    }
                } else if (presenter.configuration.showAxisXValues) {
                    stepLine.append(text);
                }

            }

            stepLine.css('left', presenter.configuration.stepWidth * i);
            createClickArea(stepLine, xAxisValues[i]);
            presenter.$view.find('#x-axis').append(stepLine);
        }
    };

    function moveYAxisClickArea() {
        var yAxisClickArea = $('#y-axis .clickArea');
        yAxisClickArea.css('top', ($('#y-axis').height() / 2) - 50 + 'px');
    }

    function checkIsMinLowerThanMax(min, max) {
        var parsedMin = parseInt(min, 10);
        var parsedMax = parseInt(max, 10);
        return parsedMin < parsedMax;
    }

    presenter.readConfiguration = function(model) {
        var isMinEmpty = ModelValidationUtils.isStringEmpty(model['Min']);

        if(isMinEmpty) {
            return {
                'isError' : true,
                'errorCode' : 'MIN01'
            }
        }

        var isMaxEmpty = ModelValidationUtils.isStringEmpty(model['Max']);

        if(isMaxEmpty) {
            return {
                'isError' : true,
                'errorCode' : 'MAX01'
            }
        }

        var isMinLowerThanMax = checkIsMinLowerThanMax(model['Min'], model['Max']);

        if(!isMinLowerThanMax) {
            return {
                'isError' : true,
                'errorCode' : 'MIN/MAX01'
            }
        }

        var validatedMin = ModelValidationUtils.validateInteger(model['Min']);
        var validatedMax = ModelValidationUtils.validateInteger(model['Max']);
        var min, max;

        if(validatedMin.isValid) {
            min = validatedMin.value;
        } else {
            return {
                'isError' : true,
                'errorCode' : 'MIN02'
            }
        }

        if(validatedMax.isValid) {
            max = validatedMax.value;
        } else {
            return {
                'isError' : true,
                'errorCode' : 'MAX02'
            }
        }

        var rangesList = Helpers.splitLines(model['Ranges']);
        var rangesPattern = /(\(|<){1}[(?P \d)-]+,[(?P \d)-]+(\)|>){1},[ ]*(0|1){1}/i; // matches i.e. (1, 0), 0 or <2, 15), 1
        var validatedShouldDrawRanges = [];
        var validatedOtherRanges = [];

        $.each(rangesList, function(i) {
            var rangeString = this.toString();

            if( !rangesPattern.test(rangeString) ) {
                return {
                    'isError' : true,
                    'errorCode' : 'RAN01'
                }
            }

            var regexResult = rangesPattern.exec(rangeString)[0];
            var brackets = regexResult.match(/[\(\)<>]+/g);
            var onlyNumbersAndCommas = regexResult.replace(/[ \(\)<>]*/g, '');
            var onlyNumbers = onlyNumbersAndCommas.split(',');
            var min = onlyNumbers[0];
            var max = onlyNumbers[1];
            var minInclude = brackets[0] == '<';
            var maxInclude = brackets[1] == '>';
            var shouldDrawRange = onlyNumbers[2] == '1';

            if(!checkIsMinLowerThanMax(min, max)) {
                return {
                    'isError' : true,
                    'errorCode' : 'MIN/MAX01'
                }
            }

            var validatedRange = {
                start: { value : parseInt(min, 10), include: minInclude, element: null },
                end: { value: parseInt(max, 10), include: maxInclude, element: null }
            };

            if (shouldDrawRange) {
                validatedShouldDrawRanges.push(validatedRange);
            } else {
                validatedOtherRanges.push(validatedRange);
            }

        });

        var validatedIsActivity = ModelValidationUtils.validateBoolean(model['Is Activity']);
        var validatedStep = { value : 1 };

        if ( model['Step'] ) {
            validatedStep = ModelValidationUtils.validateIntegerInRange(model['Step'], 50, 1);

            if (!validatedStep.isValid) {
                return {
                    'isError' : true,
                    'errorCode' : 'STEP01'
                }
            }
        }

        var validatedAxisXValues = [];

        if (model['Axis X Values'] !== '') {
            var splittedValues = model['Axis X Values'].split(',');
            for (var i = 0; i < splittedValues.length; i++) {
                var value = splittedValues[i].replace(' ', '');
                var validatedValue = ModelValidationUtils.validateIntegerInRange(value, max, min);

                if (!validatedValue.isValid) {
                    return {
                        'isError' : true,
                        'errorCode' : 'VAL01'
                    }
                }

                validatedAxisXValues.push(validatedValue.value);
            }
        }

        var validatedShowAxisXValues = ModelValidationUtils.validateBoolean(model['Show Axis X Values']);

        return {
            'isError' : false,
            'min' : min,
            'max' : max,
            'shouldDrawRanges' : validatedShouldDrawRanges,
            'otherRanges' : validatedOtherRanges,
            'isActivity' : validatedIsActivity,
            'step' : validatedStep.value,
            'showAxisXValues' : validatedShowAxisXValues,
            'axisXValues' : validatedAxisXValues,
            'mouseData' : {
                'isMouseDown' : false,
                'isMouseMoved' : false,
                'isInRange' : false,
                'clickedRanges' : [],
                'rangesThatMouseWasAbove': [],
                'rangesToRemove' : [],
                'lastElementValue' : null,
                'direction' : null
            },
            'drawnRangesData' : {
                'isDrawn' : false,
                'ranges' : [],
                'values' : []
            }

        }
    };

    return presenter;
}       