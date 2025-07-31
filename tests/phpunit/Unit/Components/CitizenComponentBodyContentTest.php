<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\phpunit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent;
use MediaWikiIntegrationTestCase;

/**
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent
 * @group Citizen
 */
class CitizenComponentBodyContentTest extends MediaWikiIntegrationTestCase {

	/**
	 * @covers ::getTemplateData
	 */
	public function testSectioningDisabled() {
		$html = '<h2>Foo</h2><p>Bar</p>';

		$component = new CitizenComponentBodyContent( $html, false );
		$data = $component->getTemplateData();

		$this->assertEquals( $html, $data['html-body-content'] );
	}

	/**
	 * @dataProvider provideSectioningCases
	 * @covers ::createSectionBodyElement
	 * @covers ::getHeadingName
	 * @covers ::getTemplateData
	 * @covers ::isSectionBreak
	 * @covers ::isValidSectionHeading
	 * @covers ::makeSections
	 * @covers ::prepareHeading
	 */
	public function testSectioning( string $message, string $inputHtml, string $expectedHtml ): void {
		$component = new CitizenComponentBodyContent( $inputHtml, true );

		$data = $component->getTemplateData();

		$this->assertEquals( $expectedHtml, $data['html-body-content'], $message );
	}

	public function provideSectioningCases(): iterable {
		yield 'Simple sectioning' => [
			'Simple sectioning',
			'<div class="mw-parser-output"><h2>Foo</h2><p>Bar</p><h2>Baz</h2><p>Quux</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Foo</h2>' .
			'<section id="citizen-section-1" class="citizen-section"><p>Bar</p></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Baz</h2>' .
			'<section id="citizen-section-2" class="citizen-section"><p>Quux</p></section>' .
			'</div>'
		];

		yield 'Content before first heading' => [
			'Content before first heading',
			'<div class="mw-parser-output"><p>Lead content.</p><h2>Foo</h2><p>Bar</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><p>Lead content.</p></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Foo</h2>' .
			'<section id="citizen-section-1" class="citizen-section"><p>Bar</p></section>' .
			'</div>'
		];

		yield 'No headings' => [
			'No headings',
			'<div class="mw-parser-output"><p>Just a paragraph.</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><p>Just a paragraph.</p></section>' .
			'</div>'
		];

		yield 'mw-heading wrapper' => [
			'mw-heading wrapper',
			'<div class="mw-parser-output"><div class="mw-heading"><h2>Foo</h2></div><p>Bar</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<div class="mw-heading citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span><h2>Foo</h2></div>' .
			'<section id="citizen-section-1" class="citizen-section"><p>Bar</p></section>' .
			'</div>'
		];

		yield 'Ignores TOC title headings' => [
			'Ignores TOC title headings',
			'<div class="mw-parser-output">' .
			'<div class="toctitle"><h2>Contents</h2></div>' .
			'<h2>Real Heading</h2><p>Content</p>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><div class="toctitle"><h2>Contents</h2></div></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Real Heading</h2>' .
			'<section id="citizen-section-1" class="citizen-section"><p>Content</p></section>' .
			'</div>'
		];

		yield 'Uses highest ranking headings' => [
			'Uses highest ranking headings',
			'<div class="mw-parser-output"><h2>Foo</h2><h3>Should be ignored</h3><p>Bar</p><h2>Baz</h2></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Foo</h2>' .
			'<section id="citizen-section-1" class="citizen-section"><h3>Should be ignored</h3><p>Bar</p></section>' .
			'<h2 class="citizen-section-heading"><span class="citizen-section-indicator citizen-ui-icon mw-ui-icon-wikimedia-collapse"></span>Baz</h2>' .
			'<section id="citizen-section-2" class="citizen-section"></section>' .
			'</div>'
		];

		yield 'Empty HTML' => [
			'Empty HTML',
			'',
			''
		];
	}
}
