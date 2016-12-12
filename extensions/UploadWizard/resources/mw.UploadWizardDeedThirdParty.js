( function ( mw, uw, $ ) {

	// Runs through the third-party license groups and finds the
	// relevant ID for that license. Probably really hacky.
	// TODO do this properly once we build the license links properly
	function findLicenseRecursively( config, license ) {
		var val,
			count = 0;

		$.each( config.licensing.thirdParty.licenseGroups, function ( i, licenseGroup ) {
			$.each( licenseGroup.licenses, function ( j, licenseCandidate ) {
				if ( licenseCandidate === license ) {
					val = '2_' + count;
					return false;
				}

				count++;
			} );

			if ( val !== undefined ) {
				return false;
			}
		} );

		return val;
	}

	/**
	 * Set up the form and deed object for the deed option that says these uploads are the work of a third party.
	 *
	 * @param {number} uploadCount Integer count of uploads that this deed refers to (useful for message pluralization)
	 * @param {mw.Api} api API object - useful for doing previews
	 * @param {Object} config The UW config
	 */
	mw.UploadWizardDeedThirdParty = function ( uploadCount, api, config ) {
		var
			deed = new mw.UploadWizardDeed();

		deed.uploadCount = uploadCount ? uploadCount : 1;

		deed.sourceInput = new OO.ui.TextInputWidget( {
			multiline: true,
			autosize: true,
			classes: [ 'mwe-source' ],
			name: 'source'
		} );
		deed.sourceInput.$input.attr( 'id', 'mwe-source-' + deed.getInstanceCount() );
		// See uw.DetailsWidget
		deed.sourceInput.getErrors = function () {
			var
				errors = [],
				minLength = config.minSourceLength,
				maxLength = config.maxSourceLength,
				text = this.getValue().trim(),
				template = new RegExp("{{.*}}"),
				re_weburl = new RegExp("^" + "^http(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$");

			if ( text === '' ) {
				errors.push( mw.message( 'mwe-upwiz-error-blank' ) );
			} else if ( text.length < minLength ) {
				errors.push( mw.message( 'mwe-upwiz-error-too-short', minLength ) );
			} else if ( text.length > maxLength ) {
				errors.push( mw.message( 'mwe-upwiz-error-too-long', maxLength ) );
			} else if (re_weburl.test(text) == false && template.test(text) == false) {
				errors.push( mw.message( 'mwe-upwiz-error-not-url-or-template' ) );
			}

			return $.Deferred().resolve( errors ).promise();
		};
		// See uw.DetailsWidget
		deed.sourceInput.getWarnings = function () {
			return $.Deferred().resolve( [] ).promise();
		};
		deed.sourceInputField = new uw.FieldLayout( deed.sourceInput, {
			label: mw.message( 'mwe-upwiz-source' ).text(),
			help: mw.message( 'mwe-upwiz-tooltip-source' ).text(),
			required: true
		} );

		deed.authorInput = new OO.ui.TextInputWidget( {
			multiline: true,
			autosize: true,
			classes: [ 'mwe-author' ],
			name: 'author'
		} );
		deed.authorInput.$input.attr( 'id', 'mwe-author-' + deed.getInstanceCount() );
		// See uw.DetailsWidget
		deed.authorInput.getErrors = function () {
			var
				errors = [],
				minLength = config.minAuthorLength,
				maxLength = config.maxAuthorLength,
				text = this.getValue().trim();

			if ( text === '' ) {
				errors.push( mw.message( 'mwe-upwiz-error-blank' ) );
			} else if ( text.length < minLength ) {
				errors.push( mw.message( 'mwe-upwiz-error-too-short', minLength ) );
			} else if ( text.length > maxLength ) {
				errors.push( mw.message( 'mwe-upwiz-error-too-long', maxLength ) );
			}

			return $.Deferred().resolve( errors ).promise();
		};
		// See uw.DetailsWidget
		deed.authorInput.getWarnings = function () {
			return $.Deferred().resolve( [] ).promise();
		};
		deed.authorInputField = new uw.FieldLayout( deed.authorInput, {
			label: mw.message( 'mwe-upwiz-author' ).text(),
			help: mw.message( 'mwe-upwiz-tooltip-author' ).text(),
			required: true
		} );

		deed.licenseInput = new mw.UploadWizardLicenseInput(
			undefined,
			config.licensing.thirdParty,
			deed.uploadCount,
			api
		);
		deed.licenseInput.$element.addClass( 'mwe-upwiz-deed-license-groups' );
		deed.licenseInput.setDefaultValues();
		deed.licenseInputField = new uw.FieldLayout( deed.licenseInput, {
			label: mw.message( 'mwe-upwiz-source-thirdparty-cases', deed.uploadCount ).text()
		} );

		return $.extend( deed, mw.UploadWizardDeed.prototype, {
			name: 'thirdparty',

			setFormFields: function ( $selector ) {
				var $defaultLicense, defaultLicense, defaultLicenseNum, defaultType, collapsible,
					$formFields = $( '<div class="mwe-upwiz-deed-form-internal" />' );

				this.$form = $( '<form>' );

				defaultType = config.licensing.defaultType;

				if ( this.uploadCount > 1 ) {
					$formFields.append( $( '<div>' ).msg( 'mwe-upwiz-source-thirdparty-custom-multiple-intro' ) );
				}

				$formFields.append(
					$( '<div class="mwe-upwiz-source-thirdparty-custom-multiple-intro" />' ),
					$( '<div class="mwe-upwiz-thirdparty-fields" />' )
						.append( this.sourceInputField.$element ),
					$( '<div class="mwe-upwiz-thirdparty-fields" />' )
						.append( this.authorInputField.$element ),
					$( '<div class="mwe-upwiz-thirdparty-license" />' )
						.append( this.licenseInputField.$element )
				);

				this.$form.append( $formFields );

				$selector.append( this.$form );

				if ( defaultType === 'thirdparty' ) {
					defaultLicense = config.licensing.thirdParty.defaults;

					defaultLicenseNum = findLicenseRecursively( config, defaultLicense );

					if ( defaultLicenseNum ) {
						$defaultLicense = $( '#license' + defaultLicenseNum );
						collapsible = $defaultLicense
							.closest( '.mwe-upwiz-deed-license-group' )
							.data( 'mw-collapsible' );
						if ( collapsible ) {
							collapsible.expand();
						}
						$defaultLicense.prop( 'checked', true );
					}
				}
			},

			/**
			 * @return {uw.FieldLayout[]} Fields that need validation
			 */
			getFields: function () {
				return [ this.authorInputField, this.sourceInputField, this.licenseInputField ];
			}
		} );
	};

} )( mediaWiki, mediaWiki.uploadWizard, jQuery );
