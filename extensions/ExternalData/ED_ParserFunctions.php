<?php
/**
 * Class for handling the parser functions for External Data
 */
 
class EDParserFunctions {
 
	/**
	 * A helper function, called by doGetWebData().
	 */
	static public function setGlobalValuesArray( $external_values, $filters, $mappings ) {
		global $edgValues;

		foreach ( $filters as $filter_var => $filter_value ) {
			// Find the entry of $external_values that matches
			// the filter variable; if none exists, just ignore
			// the filter.
			if ( array_key_exists( $filter_var, $external_values ) ) {
				if ( is_array( $external_values[$filter_var] ) ) {
					$column_values = $external_values[$filter_var];
					foreach ( $column_values as $i => $single_value ) {
						// if a value doesn't match
						// the filter value, remove
						// the value from this row for
						// all columns
						if ( trim( $single_value ) != trim( $filter_value ) ) {
							foreach ( $external_values as $external_var => $external_value ) {
								unset( $external_values[$external_var][$i] );
							}
						}
					}
				} else {
					// if we have only one row of values,
					// and the filter doesn't match, just
					// keep the results array blank and
					// return
					if ( $external_values[$filter_var] != $filter_value ) {
						return;
					}
				}
			}
		}
		// for each external variable name specified in the function
		// call, get its value or values (if any exist), and attach it
		// or them to the local variable name
		foreach ( $mappings as $local_var => $external_var ) {
			if ( array_key_exists( $external_var, $external_values ) ) {
				if ( is_array( $external_values[$external_var] ) ) {
					// array_values() restores regular
					// 1, 2, 3 indexes to array, after unset()
					// in filtering may have removed some
					$edgValues[$local_var] = array_values( $external_values[$external_var] );
				} else {
					$edgValues[$local_var][] = $external_values[$external_var];
				}
			}
		}
	}

	/**
	 * Render the #get_web_data parser function.
	 */
	static function doGetWebData( &$parser ) {
		global $edgCurPageName, $edgValues, $edgCacheExpireTime;

		// If we're handling multiple pages, reset $edgValues
		// when we move from one page to another.
		$cur_page_name = $parser->getTitle()->getText();
		if ( ! isset( $edgCurPageName ) || $edgCurPageName != $cur_page_name ) {
			$edgValues = array();
			$edgCurPageName = $cur_page_name;
		}

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs
		if ( array_key_exists( 'url', $args ) ) {
			$url = $args['url'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'url')->parse() );
		}
		$url = str_replace( ' ', '%20', $url ); // do some minor URL-encoding
		// if the URL isn't allowed (based on a whitelist), exit
		if ( ! EDUtils::isURLAllowed( $url ) ) {
			return EDUtils::formatErrorMessage( "URL is not allowed" );
		}

		if ( array_key_exists( 'format', $args ) ) {
			$format = strtolower( $args['format'] );
		} else {
			$format = '';
		}
		if ( $format == 'xml' ) {
			if ( array_key_exists( 'use xpath', $args ) ) {
				// Somewhat of a hack - store the fact that
				// we're using XPath within the format, even
				// though the format is still XML.
				$format = 'xml with xpath';
			}
		} elseif ( $format == 'csv' || $format == 'csv with header' ) {
			if ( array_key_exists( 'delimiter', $args ) ) {
				$delimiter = $args['delimiter'];
				// Hopefully this solution isn't "too clever".
				$format = array( $format, $args['delimiter'] );
			}
		}

		if ( array_key_exists( 'data', $args ) ) {
			// parse the 'data' arg into mappings
			if ( $format == 'xml with xpath' ) {
				$mappings = EDUtils::paramToArray( $args['data'], false, false );
			} else {
				$mappings = EDUtils::paramToArray( $args['data'], false, true );
			}
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'data')->parse() );
		}

		if ( array_key_exists( 'cache seconds', $args) ) {
			// set cache expire time
			$cacheExpireTime = $args['cache seconds'];
		} else {
			$cacheExpireTime = $edgCacheExpireTime;
		}

		$postData = array_key_exists( 'post data', $args ) ? $args['post data'] : '';
		$external_values = EDUtils::getDataFromURL( $url, $format, $mappings, $postData, $cacheExpireTime );
		if ( is_string( $external_values ) ) {
			// It's an error message - display it on the screen.
			return EDUtils::formatErrorMessage( $external_values );
		}
		if ( count( $external_values ) == 0 ) {
			return;
		}

		if ( array_key_exists( 'filters', $args ) ) {
			// parse the 'filters' arg
			$filters = EDUtils::paramToArray( $args['filters'], true, false );
		} else {
			$filters = array();
		}

		self::setGlobalValuesArray( $external_values, $filters, $mappings );
	}

	/**
	 * Render the #get_file_data parser function.
	 */
	static function doGetFileData( &$parser ) {
		global $edgCurPageName, $edgValues, $edgCacheExpireTime;

		// If we're handling multiple pages, reset $edgValues
		// when we move from one page to another.
		$cur_page_name = $parser->getTitle()->getText();
		if ( ! isset( $edgCurPageName ) || $edgCurPageName != $cur_page_name ) {
			$edgValues = array();
			$edgCurPageName = $cur_page_name;
		}

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs
		if ( array_key_exists( 'file', $args ) ) {
			$file = $args['file'];
		} elseif ( array_key_exists( 'directory', $args ) ) {
			$directory = $args['directory'];
			if ( array_key_exists( 'file name', $args ) ) {
				$fileName = $args['file name'];
			} else {
				return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'file name')->parse() );
			}
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'file|directory')->parse() );
		}

		if ( array_key_exists( 'format', $args ) ) {
			$format = strtolower( $args['format'] );
		} else {
			$format = '';
		}
		if ( $format == 'xml' ) {
			if ( array_key_exists( 'use xpath', $args ) ) {
				// Somewhat of a hack - store the fact that
				// we're using XPath within the format, even
				// though the format is still XML.
				$format = 'xml with xpath';
			}
		} elseif ( $format == 'csv' || $format == 'csv with header' ) {
			if ( array_key_exists( 'delimiter', $args ) ) {
				$delimiter = $args['delimiter'];
				// Hopefully this solution isn't "too clever".
				$format = array( $format, $args['delimiter'] );
			}
		}

		if ( array_key_exists( 'data', $args ) ) {
			// parse the 'data' arg into mappings
			if ( $format == 'xml with xpath' ) {
				$mappings = EDUtils::paramToArray( $args['data'], false, false );
			} else {
				$mappings = EDUtils::paramToArray( $args['data'], false, true );
			}
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'data')->parse() );
		}

		if ( array_key_exists( 'cache seconds', $args) ) {
			// set cache expire time
			$cacheExpireTime = $args['cache seconds'];
		} else {
			$cacheExpireTime = $edgCacheExpireTime;
		}

		if ( isset( $file ) ) {
			$external_values = EDUtils::getDataFromFile( $file, $format, $mappings );
		} else {
			$external_values = EDUtils::getDataFromDirectory( $directory, $fileName, $format, $mappings );
		}

		if ( is_string( $external_values ) ) {
			// It's an error message - display it on the screen.
			return EDUtils::formatErrorMessage( $external_values );
		}
		if ( count( $external_values ) == 0 ) {
			return;
		}

		if ( array_key_exists( 'filters', $args ) ) {
			// parse the 'filters' arg
			$filters = EDUtils::paramToArray( $args['filters'], true, false );
		} else {
			$filters = array();
		}

		self::setGlobalValuesArray( $external_values, $filters, $mappings );
	}
	/**
	 * Render the #get_soap_data parser function.
	 */
	static function doGetSOAPData( &$parser ) {
		global $edgCurPageName, $edgValues, $edgCacheExpireTime;

		// If we're handling multiple pages, reset $edgValues
		// when we move from one page to another.
		$cur_page_name = $parser->getTitle()->getText();
		if ( ! isset( $edgCurPageName ) || $edgCurPageName != $cur_page_name ) {
			$edgValues = array();
			$edgCurPageName = $cur_page_name;
		}

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs
		if ( array_key_exists( 'url', $args ) ) {
			$url = $args['url'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'url')->parse() );
		}
		$url = str_replace( ' ', '%20', $url ); // do some minor URL-encoding
		// if the URL isn't allowed (based on a whitelist), exit
		if ( ! EDUtils::isURLAllowed( $url ) ) {
			return EDUtils::formatErrorMessage( "URL is not allowed" );
		}

		if ( array_key_exists( 'request', $args ) ) {
			$requestName = $args['request'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'request')->parse() );
		}

		if ( array_key_exists( 'requestData', $args ) ) {
			$requestData = EDUtils::paramToArray( $args['requestData'] ); 
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'requestData')->parse() );
		}

		if ( array_key_exists( 'response', $args ) ) {
			$responseName = $args['response'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'response')->parse() );
		}

		if ( array_key_exists( 'data', $args ) ) {
			$mappings = EDUtils::paramToArray( $args['data'] ); // parse the data arg into mappings
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'data')->parse() );
		}

		$external_values = EDUtils::getSOAPData( $url, $requestName, $requestData, $responseName, $mappings);
		if ( is_string( $external_values ) ) {
			// It's an error message - display it on the screen.
			return EDUtils::formatErrorMessage( $external_values );
		}

		self::setGlobalValuesArray( $external_values, array(), $mappings );
	}

	/**
	 * Render the #get_ldap_data parser function
	 */
	static function doGetLDAPData( &$parser ) {
		global $edgCurPageName, $edgValues;

		// if we're handling multiple pages, reset $edgValues
		// when we move from one page to another
		$cur_page_name = $parser->getTitle()->getText();
		if ( ! isset( $edgCurPageName ) || $edgCurPageName != $cur_page_name ) {
			$edgValues = array();
			$edgCurPageName = $cur_page_name;
		}

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs
		if ( array_key_exists( 'data', $args ) ) {
			$mappings = EDUtils::paramToArray( $args['data'] ); // parse the data arg into mappings
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'data')->parse() );
		}

		if ( !array_key_exists( 'filter', $args ) ) {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'filter')->parse() );
		} elseif ( !array_key_exists( 'domain', $args ) ) {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'domain')->parse() );
		} else {
			$external_values = EDUtils::getLDAPData( $args['filter'], $args['domain'], array_values( $mappings ) );
		}

		// Build $edgValues
		foreach ( $external_values as $i => $row ) {
			if ( !is_array( $row ) ) {
				continue;
			}
			foreach ( $mappings as $local_var => $external_var ) {
				if ( array_key_exists( $external_var, $row ) ) {
					$edgValues[$local_var][] = $row[$external_var][0];
				} else {
					$edgValues[$local_var][] = '';
				}
			}
		}
		return;
	}

	/**
	 * Render the #get_db_data parser function
	 */
	static function doGetDBData( &$parser ) {
		global $edgCurPageName, $edgValues;

		// if we're handling multiple pages, reset $edgValues
		// when we move from one page to another
		$cur_page_name = $parser->getTitle()->getText();
		if ( ! isset( $edgCurPageName ) || $edgCurPageName != $cur_page_name ) {
			$edgValues = array();
			$edgCurPageName = $cur_page_name;
		}

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs
		$data = ( array_key_exists( 'data', $args ) ) ? $args['data'] : null;
		if ( array_key_exists( 'db', $args ) ) {
			$dbID = $args['db'];
		} elseif ( array_key_exists( 'server', $args ) ) {
			// For backwards-compatibility - 'db' parameter was
			// added in External Data version 1.3.
			$dbID = $args['server'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'db')->parse() );
		}
		if ( array_key_exists( 'from', $args ) ) {
			$table = $args['from'];
		} else {
			return EDUtils::formatErrorMessage( wfMessage( 'externaldata-no-param-specified', 'from')->parse() );
		}
		$conds = ( array_key_exists( 'where', $args ) ) ? $args['where'] : null;
		$limit = ( array_key_exists( 'limit', $args ) ) ? $args['limit'] : null;
		$orderBy = ( array_key_exists( 'order by', $args ) ) ? $args['order by'] : null;
		$groupBy = ( array_key_exists( 'group by', $args ) ) ? $args['group by'] : null;
		$sqlOptions = array( 'LIMIT' => $limit, 'ORDER BY' => $orderBy, 'GROUP BY' => $groupBy );
		$otherParams = array();
		if ( array_key_exists('aggregate', $args ) ) {
			$otherParams['aggregate'] = $args['aggregate'];
		} elseif ( array_key_exists( 'find query', $args ) ) {
			$otherParams['find query'] = $args['find query'];
		}
		$mappings = EDUtils::paramToArray( $data ); // parse the data arg into mappings

		$external_values = EDUtils::getDBData( $dbID, $table, array_values( $mappings ), $conds, $sqlOptions, $otherParams );

		// Handle error cases.
		if ( !is_array( $external_values ) ) {
			return EDUtils::formatErrorMessage( $external_values );
		}

		// Build $edgValues
		foreach ( $mappings as $local_var => $external_var ) {
			if ( array_key_exists( $external_var, $external_values ) ) {
				foreach ( $external_values[$external_var] as $value ) {
					$edgValues[$local_var][] = $value;
				}
			}
		}
		return;
	}

	/**
	 * Get the specified index of the array for the specified local
	 * variable retrieved by one of the #get... parser functions.
	 */
	static function getIndexedValue( $var, $i ) {
		global $edgValues;
		if ( array_key_exists( $var, $edgValues ) && array_key_exists( $i, $edgValues[$var] ) ) {
			return $edgValues[$var][$i];
		} else {
			return '';
		}
	}
 
	/**
	 * Render the #external_value parser function
	 */
	static function doExternalValue( &$parser, $local_var = '' ) {
		global $edgValues, $edgExternalValueVerbose;
		if ( ! array_key_exists( $local_var, $edgValues ) ) {
			return $edgExternalValueVerbose ? EDUtils::formatErrorMessage( "Error: no local variable \"$local_var\" was set." ) : '';
		} elseif ( is_array( $edgValues[$local_var] ) ) {
			return $edgValues[$local_var][0];
		} else {
			return $edgValues[$local_var];
		}
	}
 
	/**
	 * Render the #for_external_table parser function
	 */
	static function doForExternalTable( &$parser, $expression = '' ) {
		global $edgValues;

		// Get the variables used in this expression, get the number
		// of values for each, and loop through.
		$matches = array();
		preg_match_all( '/{{{([^}]*)}}}/', $expression, $matches );
		$variables = $matches[1];
		$num_loops = 0;

		$commands = array( "urlencode", "htmlencode" );
		// Used for a regexp check.
		$commandsStr = implode( '|', $commands );

		foreach ( $variables as $variable ) {
			// If it ends with one of the pre-defined "commands",
			// ignore the command to get the actual variable name.
			foreach ( $commands as $command ) {
				$variable = str_replace( $command, '', $variable );
			}
			$variable = str_replace( '.urlencode', '', $variable );
			if ( array_key_exists( $variable, $edgValues ) ) {
				$num_loops = max( $num_loops, count( $edgValues[$variable] ) );
			}
		}

		$text = "";
		for ( $i = 0; $i < $num_loops; $i++ ) {
			$cur_expression = $expression;
			foreach ( $variables as $variable ) {
				// If it ends with one of the pre-defined "commands",
				// ignore the command to get the actual variable name.
				$matches = array();
				preg_match( "/([^.]*)\.?($commandsStr)?$/", $variable, $matches );

				$real_var = $matches[1];
				if ( count( $matches ) == 3 ) {
					$command = $matches[2];
				} else {
					$command = null;
				}

				switch( $command ) {
					case "htmlencode":
						$value = htmlentities( self::getIndexedValue( $real_var, $i ), ENT_COMPAT | ENT_HTML401| ENT_SUBSTITUTE, null, false );
						break;
					case "urlencode":
						$value = urlencode( self::getIndexedValue( $real_var, $i ) );	
						break;
					default:
						$value = self::getIndexedValue( $real_var, $i );
 				}
				
 				$cur_expression = str_replace( '{{{' . $variable . '}}}', $value, $cur_expression );
			}
			$text .= $cur_expression;
		}
		return $text;
	}

	/**
	 * Render the #display_external_table parser function
	 *
	 * @author Dan Bolser
	 */
	static function doDisplayExternalTable( &$parser ) {
		global $edgValues;

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser ...
		$args = EDUtils::parseParams( $params ); // parse params into name-value pairs

		if ( array_key_exists( 'template', $args ) ) {
			$template = $args['template'];
		} else {
			return EDUtils::formatErrorMessage( "No template specified" );
		}

		if ( array_key_exists( 'data', $args ) ) {
			// parse the 'data' arg into mappings
			$mappings = EDUtils::paramToArray( $args['data'], false, false );
		} else {
			// or just use keys from edgValues
			foreach ( $edgValues as $local_variable => $values ) {
				$mappings[$local_variable] = $local_variable;
			}
		}

		// The string placed in the wikitext between template calls -
		// default is a newline.
		if ( array_key_exists( 'delimiter', $args ) ) {
			$delimiter = str_replace( '\n', "\n", $args['delimiter'] );
		} else {
			$delimiter = "\n";
		}

		$num_loops = 0; // May differ when multiple '#get_'s are used in one page
		foreach ( $mappings as $template_param => $local_variable ) {
			$num_loops = max( $num_loops, count( $edgValues[$local_variable] ) );
		}

		$text = "";
		for ( $i = 0; $i < $num_loops; $i++ ) {
			if ( $i > 0 ) {
				$text .= $delimiter;
			}
			$text .= '{{' . $template;
			foreach ( $mappings as $template_param => $local_variable ) {
				$value = self::getIndexedValue( $local_variable, $i );
				$text .= "|$template_param=$value";
			}
			$text .= "}}";
		}

		// This actually 'calls' the template that we built above
		return array( $text, 'noparse' => false );
	}

	/**
	 * Based on Semantic Internal Objects'
	 * SIOSubobjectHandler::doSetInternal().
	 */
	public static function callSubobject( $parser, $params ) {
		// This is a hack, since SMW's SMWSubobject::render() call is
		// not meant to be called outside of SMW. However, this seemed
		// like the better solution than copying over all of that
		// method's code. Ideally, a true public function can be
		// added to SMW, that handles a subobject creation, that this
		// code can then call.

		$subobjectArgs = array( &$parser );
		// Blank first argument, so that subobject ID will be
		// an automatically-generated random number.
		$subobjectArgs[1] = '';
		// "main" property, pointing back to the page.
		$mainPageName = $parser->getTitle()->getText();
		$mainPageNamespace = $parser->getTitle()->getNsText();
		if ( $mainPageNamespace != '' ) {
			$mainPageName = $mainPageNamespace . ':' . $mainPageName;
		}
		$subobjectArgs[2] = $params[0] . '=' . $mainPageName;

		foreach ( $params as $i => $value ) {
			if ( $i == 0 ) continue;
			$subobjectArgs[] = $value;
		}
		if ( class_exists( 'SMW\SubobjectParserFunction' ) ) {
			// SMW 1.9+
			$instance = \SMW\ParserFunctionFactory::newFromParser( $parser )->getSubobjectParser();
			return $instance->parse( new SMW\ParserParameterFormatter( $subobjectArgs ) );
		} elseif ( class_exists( 'SMW\SubobjectHandler' ) ) {
			// Old version of SMW 1.9 - can be removed at some point
			call_user_func_array( array( 'SMW\SubobjectHandler', 'render' ), $subobjectArgs );
		} elseif ( class_exists( 'SMW\SubobjectParser' ) ) {
			// Old version of SMW 1.9 - can be removed at some point
			call_user_func_array( array( 'SMW\SubobjectParser', 'render' ), $subobjectArgs );
		} elseif ( class_exists( 'SMW\Subobject' ) ) {
			// Old version of SMW 1.9 - can be removed at some point
			call_user_func_array( array( 'SMW\Subobject', 'render' ), $subobjectArgs );
		} else {
			// SMW 1.8
			call_user_func_array( array( 'SMWSubobject', 'render' ), $subobjectArgs );
		}
		return;
	}

	/**
	 * Render the #store_external_table parser function
	 */
	static function doStoreExternalTable( &$parser ) {
		global $smwgDefaultStore;

		if ( $smwgDefaultStore != 'SMWSQLStore3' && ! class_exists( 'SIOHandler' ) ) {
			// If SQLStore3 is not installed, we need SIO.
			return EDUtils::formatErrorMessage( 'Semantic Internal Objects is not installed' );
		}
		global $edgValues;

		$params = func_get_args();
		array_shift( $params ); // we already know the $parser...

		// Get the variables used in this expression, get the number
		// of values for each, and loop through.
		$expression = implode( '|', $params );
		$matches = array();
		preg_match_all( '/{{{([^}]*)}}}/', $expression, $matches );
		$variables = $matches[1];
		$num_loops = 0;
		foreach ( $variables as $variable ) {
			// ignore the presence of '.urlencode' - it's a command,
			// not part of the actual variable name
			$variable = str_replace( '.urlencode', '', $variable );
			if ( array_key_exists( $variable, $edgValues ) ) {
				$num_loops = max( $num_loops, count( $edgValues[$variable] ) );
			}
		}
		$text = "";
		for ( $i = 0; $i < $num_loops; $i++ ) {
			// re-get $params
			$params = func_get_args();
			array_shift( $params );
			foreach ( $params as $j => $param ) {
				foreach ( $variables as $variable ) {
					// If variable name ends with a ".urlencode",
					// that's a command - URL-encode the value of
					// the actual variable.
					if ( strrpos( $variable, '.urlencode' ) === strlen( $variable ) - strlen( '.urlencode' ) ) {
						$real_var = str_replace( '.urlencode', '', $variable );
						$value = urlencode( self::getIndexedValue( $real_var , $i ) );
					} else {
						$value = self::getIndexedValue( $variable , $i );
					}
					$params[$j] = str_replace( '{{{' . $variable . '}}}', $value, $params[$j] );
				}
			}

			// If SQLStore3 is being used, we can call #subobject -
			// that's what #set_internal would call anyway, so
			// we're cutting out the middleman.
			if ( $smwgDefaultStore == 'SMWSQLStore3' ) {
				self::callSubobject( $parser, $params );
				continue;
			}

			// Add $parser to the beginning of the $params array,
			// and pass the whole thing in as arguments to
			// doSetInternal, to mimic a call to #set_internal.
			array_unshift( $params, $parser );
			// As of PHP 5.3.1, call_user_func_array() requires that
			// the function params be references. Workaround via
			// http://stackoverflow.com/questions/2045875/pass-by-reference-problem-with-php-5-3-1
			$refParams = array();
			foreach ( $params as $key => $value ) {
				$refParams[$key] = &$params[$key];
			}
			call_user_func_array( array( 'SIOHandler', 'doSetInternal' ), $refParams );
		}
		return null;
	}

	/**
	 * Render the #clear_external_data parser function
	 */
	static function doClearExternalData( &$parser ) {
		global $edgValues;
		$edgValues = array();
	}
}
