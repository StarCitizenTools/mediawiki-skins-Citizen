<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentButton;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentButton
 */
class CitizenComponentButtonTest extends MediaWikiUnitTestCase {

	/**
	 * Provides various configurations of CitizenComponentButton to test different scenarios.
	 * Each case includes different combinations of the button's properties.
	 *
	 * @return array[] An array of test cases with parameters and expected values.
	 */
	public static function provideButtonData(): array {
		return [
			'Basic Button' => [
				// The visible text on the button.
				'label' => 'Click Me',
				// CSS classes expected without additional properties.
				'expectedClasses' => 'cdx-button',
				// Default button weight.
				'weight' => 'normal',
				// Indicates that the button is not icon-only.
				'iconOnly' => false,
				// No link for a basic button.
				'href' => null,
			],
			'Button With Primary Weight' => [
				// The visible text indicating a primary action.
				'label' => 'Primary Action',
				// Additional classes are expected due to the primary weight.
				'expectedClasses' =>
					'cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-primary',
				// Indicates primary visual importance.
				'weight' => 'primary',
				// Still not an icon-only button.
				'iconOnly' => false,
				// Providing an href activates additional styles.
				'href' => '/mock-link',
			],
			'Icon Only Button' => [
				// No visible text for an icon-only button.
				'label' => '',
				// CSS classes specifically for icon-only.
				'expectedClasses' => 'cdx-button cdx-button--icon-only',
				// Default weight even for icon-only buttons.
				'weight' => 'normal',
				// This button is icon-only.
				'iconOnly' => true,
				// No link for this icon-only button.
				'href' => null,
			],
		];
	}

	/**
	 * Tests CSS class generation logic within CitizenComponentButton.
	 * This method verifies that the class string is generated correctly based on the button's properties.
	 *
	 * @covers ::getClasses
	 */
	public function testGetClasses() {
		$basicButton = new CitizenComponentButton( 'Label' );
		$templateData = $basicButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button', $templateData['class'],
			'Basic button should have cdx-button class.' );

		$primaryButton = new CitizenComponentButton( 'Label', null, null, null, [], 'primary' );
		$templateData = $primaryButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--weight-primary', $templateData['class'],
			'Primary button should have primary weight class.' );

		$iconOnlyButton = new CitizenComponentButton(
			'Label', null, null, null, [], 'normal', 'default', 'medium', true );
		$templateData = $iconOnlyButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--icon-only', $templateData['class'],
			'Icon-only button should have icon-only class.' );

		$destructiveButton = new CitizenComponentButton( 'Label', null, null, null, [],
			'normal', 'destructive' );
		$templateData = $destructiveButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--action-destructive', $templateData['class'],
			'Destructive button should have destructive action class.' );

		$progressiveButton = new CitizenComponentButton( 'Label', null, null, null, [],
			'normal', 'progressive' );
		$templateData = $progressiveButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--action-progressive', $templateData['class'],
			'Progressive button should have progressive action class.' );

		$quietButton = new CitizenComponentButton( 'Label', null, null, null, [], 'quiet' );
		$templateData = $quietButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--weight-quiet', $templateData['class'],
			'Quiet button should have quiet weight class.' );

		$largeButton = new CitizenComponentButton( 'Label', null, null, null, [], 'normal', 'default', 'large' );
		$templateData = $largeButton->getTemplateData();
		$this->assertStringContainsString( 'cdx-button--size-large', $templateData['class'],
			'Large button should have large size class.' );
	}

	/**
	 * Tests the `getTemplateData` method of CitizenComponentButton component.
	 * Each data set provided by `provideButtonData` is passed here to verify the component's output.
	 *
	 * @covers ::__construct
	 * @dataProvider provideButtonData
	 */
	public function testGetTemplateData(
		string $label,
		string $expectedClasses,
		string $weight,
		bool $iconOnly,
		?string $href
	) {
		// Instantiate the component with the provided configuration.
		$button = new CitizenComponentButton(
			$label,
			'icon-sample',
			'btn-id',
			'additional-class',
			// Custom data attribute as an example.
			[ 'data-test' => 'true' ],
			$weight,
			// Default action type.
			'default',
			// Default button size.
			'medium',
			$iconOnly,
			$href
		);

		// Acquire the generated template data from the component.
		$templateData = $button->getTemplateData();

		// Assert each aspect of the template data matches expectations.
		$this->assertEquals( $label, $templateData['label'] );
		$this->assertEquals( 'icon-sample', $templateData['icon'] );
		$this->assertEquals( 'btn-id', $templateData['id'] );
		// Ensures the class string contains all expected CSS classes.
		$actualClasses = explode( ' ', $templateData['class'] );
		$expectedClassArray = explode( ' ', $expectedClasses );
		foreach ( $expectedClassArray as $expectedClass ) {
			$this->assertContains(
				$expectedClass,
				$actualClasses,
				"Expected class '$expectedClass' not found in button classes."
			);
		}
		$this->assertEquals( $href, $templateData['href'] );
		// Verifies custom attributes are included appropriately.
		$this->assertContains( [ 'key' => 'data-test', 'value' => 'true' ], $templateData['array-attributes'] );
	}
}
