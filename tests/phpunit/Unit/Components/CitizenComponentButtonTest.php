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
		string $action,
		string $size,
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
			$action,
			$size,
			$iconOnly,
			$href
		);

		// Acquire the generated template data from the component.
		$templateData = $button->getTemplateData();

		// Assert each aspect of the template data matches expectations.
		$this->assertSame( $label, $templateData['label'] );
		$this->assertSame( 'icon-sample', $templateData['icon'] );
		$this->assertSame( 'btn-id', $templateData['id'] );
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
		$this->assertSame( $href, $templateData['href'] );
		// Verifies custom attributes are included appropriately.
		$this->assertContains( [ 'key' => 'data-test', 'value' => 'true' ], $templateData['array-attributes'] );
	}

	/**
	 * Provides various configurations of CitizenComponentButton to test different scenarios.
	 * Each case includes different combinations of the button's properties.
	 */
	public static function provideButtonData(): iterable {
		yield 'Basic Button' => [
			'label' => 'Click Me',
			'expectedClasses' => 'cdx-button cdx-button--weight-normal cdx-button--action-default cdx-button--size-medium',
			'weight' => 'normal',
			'action' => 'default',
			'size' => 'medium',
			'iconOnly' => false,
			'href' => null,
		];
		yield 'Primary progressive large button' => [
			'label' => 'Submit',
			'expectedClasses' => 'cdx-button cdx-button--weight-primary cdx-button--action-progressive cdx-button--size-large',
			'weight' => 'primary',
			'action' => 'progressive',
			'size' => 'large',
			'iconOnly' => false,
			'href' => null,
		];
		yield 'Quiet destructive button with link' => [
			'label' => 'Delete',
			'expectedClasses' => 'cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet cdx-button--action-destructive cdx-button--size-medium',
			'weight' => 'quiet',
			'action' => 'destructive',
			'size' => 'medium',
			'iconOnly' => false,
			'href' => '/delete',
		];
		yield 'Icon only button' => [
			'label' => '',
			'expectedClasses' => 'cdx-button cdx-button--icon-only cdx-button--weight-normal cdx-button--action-default cdx-button--size-medium',
			'weight' => 'normal',
			'action' => 'default',
			'size' => 'medium',
			'iconOnly' => true,
			'href' => null,
		];
	}
}
