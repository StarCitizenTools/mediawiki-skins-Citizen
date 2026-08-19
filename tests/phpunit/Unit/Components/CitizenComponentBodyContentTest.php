<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 */
class CitizenComponentBodyContentTest extends MediaWikiIntegrationTestCase {

	/**
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::getTemplateData
	 */
	public function testSectioningDisabled() {
		$html = '<h2>Foo</h2><p>Bar</p>';

		$component = new CitizenComponentBodyContent( $html, false );
		$data = $component->getTemplateData();

		$this->assertEquals( $html, $data['html-body-content'] );
	}

	/**
	 * @dataProvider provideSectioningCases
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::createSection
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::createSectionBody
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::getFirstElementChild
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::getSectionHeadingLevel
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::isSectionHeading
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::getTemplateData
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::makeSections
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::prepareHeading
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent::wrapSectionBodies
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
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<div class="citizen-section-body"><p>Bar</p></div></section>' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Baz</h2>' .
			'<div class="citizen-section-body"><p>Quux</p></div></section>' .
			'</div>'
		];

		yield 'Content before first heading' => [
			'Nothing can collapse the lead section, so its content stays unwrapped',
			'<div class="mw-parser-output"><p>Lead content.</p><h2>Foo</h2><p>Bar</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><p>Lead content.</p></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<div class="citizen-section-body"><p>Bar</p></div></section>' .
			'</div>'
		];

		yield 'No headings' => [
			'No headings',
			'<div class="mw-parser-output"><p>Just a paragraph.</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"><p>Just a paragraph.</p></section>' .
			'</div>'
		];

		yield 'Section with no content still gets a body' => [
			'A body with nothing in it keeps the shape uniform for the frontend',
			'<div class="mw-parser-output"><h2>Foo</h2></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<div class="citizen-section-body"></div></section>' .
			'</div>'
		];

		yield 'mw-heading wrapper' => [
			'mw-heading wrapper',
			'<div class="mw-parser-output"><div class="mw-heading"><h2>Foo</h2></div><p>Bar</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<div class="mw-heading citizen-section-heading"><h2>Foo</h2></div>' .
			'<div class="citizen-section-body"><p>Bar</p></div></section>' .
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
			'<h2 class="citizen-section-heading">Real Heading</h2>' .
			'<div class="citizen-section-body"><p>Content</p></div></section>' .
			'</div>'
		];

		yield 'Subsections nest like Parsoid' => [
			'A subsection is content of its parent, so it sits inside the parent body',
			'<div class="mw-parser-output"><h2>Foo</h2><h3>Sub</h3><p>Bar</p><h2>Baz</h2></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<div class="citizen-section-body">' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h3 class="citizen-section-heading">Sub</h3>' .
			'<div class="citizen-section-body"><p>Bar</p></div></section>' .
			'</div></section>' .
			'<section id="citizen-section-3" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Baz</h2>' .
			'<div class="citizen-section-body"></div></section>' .
			'</div>'
		];

		yield 'Rank increases after a lower heading' => [
			'An h2 after an h3 becomes a sibling, not a child',
			'<div class="mw-parser-output"><h3>Deep first</h3><p>A</p><h2>Top</h2><p>B</p></div>',
			'<div class="mw-parser-output">' .
			'<section id="citizen-section-0" class="citizen-section"></section>' .
			'<section id="citizen-section-1" class="citizen-section">' .
			'<h3 class="citizen-section-heading">Deep first</h3>' .
			'<div class="citizen-section-body"><p>A</p></div></section>' .
			'<section id="citizen-section-2" class="citizen-section">' .
			'<h2 class="citizen-section-heading">Top</h2>' .
			'<div class="citizen-section-body"><p>B</p></div></section>' .
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
			'<h2 class="citizen-section-heading">Foo</h2>' .
			'<div class="citizen-section-body"><p>Bar</p></div></section>' .
			'</div>'
		];

		yield 'Parsoid sections gain a body' => [
			'Parsoid ships the section wrappers, so only the bodies are added',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="0" id="mwAQ"><p>Lead</p></section>' .
			'<section data-mw-section-id="1" id="mwAg">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div><p>Bar</p>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="0" id="mwAQ"><p>Lead</p></section>' .
			'<section data-mw-section-id="1" id="mwAg">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="citizen-section-body"><p>Bar</p></div>' .
			'</section>' .
			'</div>'
		];

		yield 'A heading the frontend cannot collapse gets no body' => [
			'Core leaves HTML-syntax headings unwrapped, so the section stays as it is',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<h2 id="Foo" class="mw-html-heading">Foo</h2><p>Bar</p>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<h2 id="Foo" class="mw-html-heading">Foo</h2><p>Bar</p>' .
			'</section>' .
			'</div>'
		];

		yield 'Parsoid subsections nest inside the parent body' => [
			'A nested section moves into its parent body along with the rest of the content',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div><p>Bar</p>' .
			'<section data-mw-section-id="2">' .
			'<div class="mw-heading mw-heading3"><h3 id="Sub">Sub</h3></div><p>Baz</p>' .
			'</section>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="citizen-section-body"><p>Bar</p>' .
			'<section data-mw-section-id="2">' .
			'<div class="mw-heading mw-heading3"><h3 id="Sub">Sub</h3></div>' .
			'<div class="citizen-section-body"><p>Baz</p></div>' .
			'</section>' .
			'</div>' .
			'</section>' .
			'</div>'
		];

		yield "A foreign wrapper is wrapped in turn, not adopted" => [
			'Adopting it would put the collapse attribute on a box the skin does not own',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="mw-collapsible-content"><p>Bar</p></div>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="citizen-section-body">' .
			'<div class="mw-collapsible-content"><p>Bar</p></div></div>' .
			'</section>' .
			'</div>'
		];

		yield 'Wrapping is idempotent' => [
			'A section that already has its body is left alone',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="citizen-section-body"><p>Bar</p></div>' .
			'</section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1">' .
			'<div class="mw-heading mw-heading2"><h2 id="Foo">Foo</h2></div>' .
			'<div class="citizen-section-body"><p>Bar</p></div>' .
			'</section>' .
			'</div>'
		];

		yield 'A Parsoid section without a heading is left alone' => [
			'Core leaves HTML-syntax headings unwrapped, and those sections cannot collapse',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1"><p>No heading here</p></section>' .
			'</div>',
			'<div class="mw-parser-output">' .
			'<section data-mw-section-id="1"><p>No heading here</p></section>' .
			'</div>'
		];
	}
}
