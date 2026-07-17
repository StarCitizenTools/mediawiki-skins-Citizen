<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

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
	 * @covers ::getSectionHeadingLevel
	 * @covers ::getTemplateData
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
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2><p>Bar</p></section>' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Baz</h2><p>Quux</p></section>' .
			'</div>'
		];

		yield 'Content before first heading' => [
			'Content before first heading',
			'<div class="mw-parser-output"><p>Lead content.</p><h2>Foo</h2><p>Bar</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><p>Lead content.</p></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2><p>Bar</p></section>' .
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
			'<section id="citizen-section-1" class="citizen-section">' .
			'<div class="mw-heading citizen-section-heading"><h2>Foo</h2></div><p>Bar</p></section>' .
			'</div>'
		];

		yield 'Ignores TOC title headings' => [
			'Ignores TOC title headings',
			'<div class="mw-parser-output">' .
			'<div class="toctitle"><h2>Contents</h2></div>' .
			'<h2>Real Heading</h2><p>Content</p>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section">' .
			'<div class="toctitle"><h2>Contents</h2></div></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Real Heading</h2><p>Content</p></section>' .
			'</div>'
		];

		yield 'Subsections nest like Parsoid' => [
			'An h3 inside an h2 section nests; the next h2 pops back to the top level',
			'<div class="mw-parser-output"><h2>Foo</h2><h3>Sub</h3><p>Bar</p><h2>Baz</h2></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h3 class="citizen-section-heading">Sub</h3><p>Bar</p></section>' .
			'</section>' .
			'<section id="citizen-section-3" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Baz</h2></section>' .
			'</div>'
		];

		yield 'Rank increases after a lower heading' => [
			'An h2 after an h3 becomes a sibling, not a child',
			'<div class="mw-parser-output"><h3>Deep first</h3><p>A</p><h2>Top</h2><p>B</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h3 class="citizen-section-heading">Deep first</h3><p>A</p></section>' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Top</h2><p>B</p></section>' .
			'</div>'
		];

		yield 'Empty HTML' => [
			'Empty HTML',
			'',
			''
		];

		yield 'Escaped Parsoid markup in code samples does not disable sectioning' => [
			'Documentation showing Parsoid markup as escaped text is still legacy content',
			'<div class="mw-parser-output">' .
			'<pre>&lt;section data-mw-section-id="1"&gt;</pre>' .
			'<h2>Foo</h2><p>Bar</p>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section">' .
			// The serializer normalizes &gt; to a bare > in text content
			'<pre>&lt;section data-mw-section-id="1"></pre></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2><p>Bar</p></section>' .
			'</div>'
		];

		yield 'Parsoid content is left untouched' => [
			'Parsoid wraps sections natively; the transform must not run',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="0" id="mwAQ"><p>Lead</p></section>' .
			'<section data-mw-section-id="1" id="mwAg">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div><p>Bar</p>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="0" id="mwAQ"><p>Lead</p></section>' .
			'<section data-mw-section-id="1" id="mwAg">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div><p>Bar</p>' .
			'</section>' .
			'</div>'
		];
	}
}
