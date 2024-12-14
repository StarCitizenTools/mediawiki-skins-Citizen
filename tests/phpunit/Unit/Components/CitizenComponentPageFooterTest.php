<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter;
use MediaWikiUnitTestCase;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter
 */
class CitizenComponentPageFooterTest extends MediaWikiUnitTestCase {

    public function testGetTemplateData(): void {
        $footerData = [
            'array-items' => [
                ['name' => 'item1'],
                ['name' => 'item2']
            ]
        ];

        $localizer = $this->createMock(MessageLocalizer::class);
        $localizer->expects($this->exactly(2))
            ->method('msg')
            ->withConsecutive(
                ['citizen-page-info-item1'],
                ['citizen-page-info-item2']
            )
            ->willReturnOnConsecutiveCalls(
                $this->returnValue('Label 1'),
                $this->returnValue('Label 2')
            );

        $component = new CitizenComponentPageFooter($localizer, $footerData);
        $templateData = $component->getTemplateData();

        // Assert the structure and data of the returned template data
        $this->assertCount(2, $templateData['array-items']);
        $this->assertSame('Label 1', $templateData['array-items'][0]['label']);
        $this->assertSame('Label 2', $templateData['array-items'][1]['label']);
    }
}
