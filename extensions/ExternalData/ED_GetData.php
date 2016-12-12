<?php
/**
 * A special page for retrieving selected rows of any wiki page that contains
 * data in CSV format
 */

class EDGetData extends SpecialPage {

	/**
	 * Constructor
	 */
	function __construct() {
		parent::__construct( 'GetData' );
	}

	function execute( $query ) {
		global $wgRequest, $wgOut;

		$wgOut->disable();
		$this->setHeaders();
		$page_name = $query;
		$title = Title::newFromText( $page_name );
		if ( is_null( $title ) ) {
			return;
		}
		if ( ! $title->userCan( 'read' ) ) {
			return;
		}
		$article = new Article( $title );
		$page_text = $article->fetchContent();
		// Remove <noinclude> sections and <includeonly> tags from text
		$page_text = StringUtils::delimiterReplace( '<noinclude>', '</noinclude>', '', $page_text );
		$page_text = strtr( $page_text, array( '<includeonly>' => '', '</includeonly>' => '' ) );
		$orig_lines = explode( "\n", $page_text );
		// ignore lines that are either blank or start with a semicolon
		$page_lines = array();
		foreach ( $orig_lines as $i => $line ) {
			if ( $line != '' && $line[0] != ';' ) {
				$page_lines[] = $line;
			}
		}
		$headers = EDUtils::getValuesFromCSVLine( $page_lines[0] );
		$queried_headers = array();
		foreach ( $wgRequest->getValues() as $key => $value ) {
			foreach ( $headers as $header_index => $header_value ) {
				$header_value = str_replace( ' ', '_', $header_value );
				if ( $key == $header_value ) {
					$queried_headers[$header_index] = $value;
				}
			}
		}
		// include header in output
		$text = $page_lines[0];
		foreach ( $page_lines as $i => $line ) {
			if ( $i == 0 ) continue;
			$row_values = EDUtils::getValuesFromCSVLine( $line );
			$found_match = true;
			foreach ( $queried_headers as $i => $query_value ) {
				$single_value = str_replace( ' ', '_', $row_values[$i] );
				if ( $single_value != $query_value ) {
					$found_match = false;
				}
			}
			if ( $found_match ) {
				if ( $text != '' ) $text .= "\n";
				$text .= $line;
			}
		}
		print $text;
	}

	protected function getGroupName() {
		return 'pagetools';
	}
}
