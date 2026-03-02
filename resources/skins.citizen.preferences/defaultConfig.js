const { PreferencesConfig } = require( './types.js' );

/**
 * Built-in default preferences configuration.
 * Uses the same schema as admin overrides from MediaWiki:Citizen-preferences.json.
 *
 * @return {PreferencesConfig} Default config with sections and preferences
 */
function getDefaultConfig() {
	return {
		sections: {
			appearance: { labelMsg: 'citizen-preferences-section-appearance' },
			behavior: { labelMsg: 'citizen-preferences-section-behavior' }
		},
		preferences: {
			'skin-theme': {
				section: 'appearance',
				options: [
					{ value: 'os', labelMsg: 'citizen-theme-os-label' },
					{ value: 'day', labelMsg: 'citizen-theme-day-label' },
					{ value: 'night', labelMsg: 'citizen-theme-night-label' }
				],
				type: 'radio',
				columns: 3,
				labelMsg: 'citizen-theme-name',
				descriptionMsg: 'citizen-theme-description',
				visibilityCondition: 'always'
			},
			'citizen-feature-custom-font-size': {
				section: 'appearance',
				options: [
					{ value: 'small', labelMsg: 'citizen-feature-custom-font-size-small-label' },
					{ value: 'standard', labelMsg: 'citizen-feature-custom-font-size-standard-label' },
					{ value: 'large', labelMsg: 'citizen-feature-custom-font-size-large-label' },
					{ value: 'xlarge', labelMsg: 'citizen-feature-custom-font-size-xlarge-label' }
				],
				type: 'select',
				labelMsg: 'citizen-feature-custom-font-size-name',
				descriptionMsg: 'citizen-feature-custom-font-size-description',
				visibilityCondition: 'always'
			},
			'citizen-feature-custom-width': {
				section: 'appearance',
				options: [
					{ value: 'standard', labelMsg: 'citizen-feature-custom-width-standard-label' },
					{ value: 'wide', labelMsg: 'citizen-feature-custom-width-wide-label' },
					{ value: 'full', labelMsg: 'citizen-feature-custom-width-full-label' }
				],
				type: 'select',
				labelMsg: 'citizen-feature-custom-width-name',
				descriptionMsg: 'citizen-feature-custom-width-description',
				visibilityCondition: 'always'
			},
			// Switch preferences use short-form options (strings).
			// normalizeConfig() converts these to { value: '0' } / { value: '1' }.
			'citizen-feature-pure-black': {
				section: 'appearance',
				options: [ '0', '1' ],
				type: 'switch',
				labelMsg: 'citizen-feature-pure-black-name',
				descriptionMsg: 'citizen-feature-pure-black-description',
				visibilityCondition: 'dark-theme'
			},
			'citizen-feature-autohide-navigation': {
				section: 'behavior',
				options: [ '0', '1' ],
				type: 'switch',
				labelMsg: 'citizen-feature-autohide-navigation-name',
				descriptionMsg: 'citizen-feature-autohide-navigation-description',
				visibilityCondition: 'tablet-viewport'
			},
			'citizen-feature-performance-mode': {
				section: 'behavior',
				options: [ '0', '1' ],
				type: 'switch',
				labelMsg: 'citizen-feature-performance-mode-name',
				descriptionMsg: 'citizen-feature-performance-mode-description',
				visibilityCondition: 'always'
			}
		}
	};
}

module.exports = getDefaultConfig;
