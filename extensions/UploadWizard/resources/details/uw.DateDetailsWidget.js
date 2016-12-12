( function ( mw, uw, $, OO ) {

	/**
	 * A date field in UploadWizard's "Details" step form.
	 *
	 * @extends uw.DetailsWidget
	 */
	uw.DateDetailsWidget = function UWDateDetailsWidget() {
		uw.DateDetailsWidget.parent.call( this );

		this.dateInputWidgetMode = null; // or: 'calendar', 'arbitrary'
		this.dateInputWidgetToggler = new OO.ui.ButtonSelectWidget( {
			classes: [ 'mwe-upwiz-dateDetailsWidget-toggler' ],
			items: [
				new OO.ui.ButtonOptionWidget( {
					data: 'calendar',
					icon: 'calendar',
					title: mw.msg( 'mwe-upwiz-calendar-date' )
				} ),
				new OO.ui.ButtonOptionWidget( {
					data: 'arbitrary',
					icon: 'edit',
					title: mw.msg( 'mwe-upwiz-custom-date' )
				} )
			]
		} )
			.selectItemByData( 'calendar' )
			.on( 'choose', function ( selectedItem ) {
				this.setupDateInput( selectedItem.getData() );
				this.dateInputWidget.focus();
			}.bind( this ) );

		this.$element.addClass( 'mwe-upwiz-dateDetailsWidget' );
		this.$element.append(
			this.dateInputWidgetToggler.$element
			// this.dateInputWidget.$element goes here after setupDateInput() runs
		);
		this.setupDateInput();
	};
	OO.inheritClass( uw.DateDetailsWidget, uw.DetailsWidget );

	/**
	 * Set up the date input field, or switch between 'calendar' and 'arbitrary' mode.
	 *
	 * @param {string} [mode] Mode to switch to, 'calendar' or 'arbitrary'
	 * @private
	 */
	uw.DateDetailsWidget.prototype.setupDateInput = function ( mode ) {
		var
			oldDateInputWidget = this.dateInputWidget;

		if ( mode === undefined ) {
			mode = this.dateInputWidgetMode === 'calendar' ? 'arbitrary' : 'calendar';
		}
		this.dateInputWidgetMode = mode;
		this.dateInputWidgetToggler.selectItemByData( mode );

		if ( mode === 'arbitrary' ) {
			this.dateInputWidget = new OO.ui.TextInputWidget( {
				classes: [ 'mwe-date', 'mwe-upwiz-dateDetailsWidget-date' ],
				placeholder: mw.msg( 'mwe-upwiz-select-date' )
			} );
		} else {
			this.dateInputWidget = new mw.widgets.DateInputWidget( {
				classes: [ 'mwe-date', 'mwe-upwiz-dateDetailsWidget-date' ],
				placeholderLabel: mw.msg( 'mwe-upwiz-select-date' )
			} );
			// If the user types '{{', assume that they are trying to input template wikitext and switch
			// to 'arbitrary' mode. This might help confused power-users (T110026#1567714).
			this.dateInputWidget.textInput.on( 'change', function ( value ) {
				if ( value === '{{' ) {
					this.setupDateInput( 'arbitrary' );
					this.dateInputWidget.setValue( '{{' );
					this.dateInputWidget.moveCursorToEnd();
				}
			}.bind( this ) );
		}

		if ( oldDateInputWidget ) {
			this.dateInputWidget.setValue( oldDateInputWidget.getValue() );
			oldDateInputWidget.$element.replaceWith( this.dateInputWidget.$element );
		} else {
			this.dateInputWidgetToggler.$element.after( this.dateInputWidget.$element );
		}

		// Aggregate 'change' event
		this.dateInputWidget.connect( this, { change: [ 'emit', 'change' ] } );

		// Also emit if the value was changed to fit the new widget
		if ( oldDateInputWidget && oldDateInputWidget.getValue() !== this.dateInputWidget.getValue() ) {
			this.emit( 'change' );
		}
	};

	/**
	 * @inheritdoc
	 */
	uw.DateDetailsWidget.prototype.getWarnings = function () {
		var warnings = [],
			dateVal = Date.parse( this.dateInputWidget.getValue().trim() );
		if ( this.dateInputWidgetMode === 'calendar' &&
			dateVal > ( new Date() ).getTime() ) {
			warnings.push( mw.message( 'mwe-upwiz-warning-postdate' ) );
		}
		return $.Deferred().resolve( warnings ).promise();
	};

	/**
	 * @inheritdoc
	 */
	uw.DateDetailsWidget.prototype.getErrors = function () {
#		var errors = [];
#		if ( this.dateInputWidget.getValue().trim() === '' ) {
#			errors.push( mw.message( 'mwe-upwiz-error-blank' ) );
#		}
		return $.Deferred().resolve( errors ).promise();
	};

	/**
	 * @inheritdoc
	 */
	uw.DateDetailsWidget.prototype.getWikiText = function () {
		return this.dateInputWidget.getValue().trim();
	};

	/**
	 * @inheritdoc
	 * @return {Object} See #setSerialized
	 */
	uw.DateDetailsWidget.prototype.getSerialized = function () {
		return {
			mode: this.dateInputWidgetMode,
			value: this.dateInputWidget.getValue()
		};
	};

	/**
	 * @inheritdoc
	 * @param {Object} serialized
	 * @param {string} serialized.mode Date input mode ('calendar' or 'arbitrary')
	 * @param {string} serialized.value Date value for given mode
	 */
	uw.DateDetailsWidget.prototype.setSerialized = function ( serialized ) {
		this.setupDateInput( serialized.mode );
		this.dateInputWidget.setValue( serialized.value );
	};

} )( mediaWiki, mediaWiki.uploadWizard, jQuery, OO );
