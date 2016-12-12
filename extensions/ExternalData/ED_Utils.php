<?php
/**
 * Utility functions for External Data
 */

class EDUtils {
	// how many times to try an HTTP request
	private static $http_number_of_tries = 3;

	private static $ampersandReplacement = "THIS IS A LONG STRING USED AS A REPLACEMENT FOR AMPERSANDS 55555555";

	/**
	 * Wraps error message in a span with the "error" class, for better
	 * display, and so that it can be handled correctly by #iferror and
	 * possibly others.
	 */
	static function formatErrorMessage( $msg ) {
		return '<span class="error">' . $msg . '</span>';
	}

	// XML-handling functions based on code found at
	// http://us.php.net/xml_set_element_handler
	static function startElement( $parser, $name, $attrs ) {
		global $edgCurrentXMLTag, $edgXMLValues;
		// set to all lowercase to avoid casing issues
		$edgCurrentXMLTag = strtolower( $name );
		foreach ( $attrs as $attr => $value ) {
			$attr = strtolower( $attr );
			$value = str_replace( self::$ampersandReplacement, '&amp;', $value );
			if ( array_key_exists( $attr, $edgXMLValues ) ) {
				$edgXMLValues[$attr][] = $value;
			} else {
				$edgXMLValues[$attr] = array( $value );
			}
		}
	}

	static function endElement( $parser, $name ) {
		global $edgCurrentXMLTag;
		$edgCurrentXMLTag = "";
	}

	static function getContent( $parser, $content ) {
		global $edgCurrentXMLTag, $edgXMLValues;

		// Replace ampersands, to avoid the XML getting split up
		// around them.
		// Note that this is *escaped* ampersands being replaced -
		// this is unrelated to the fact that bare ampersands aren't
		// allowed in XML.
		$content = str_replace( self::$ampersandReplacement, '&amp;', $content );
		if ( array_key_exists( $edgCurrentXMLTag, $edgXMLValues ) )
			$edgXMLValues[$edgCurrentXMLTag][] = $content;
		else
			$edgXMLValues[$edgCurrentXMLTag] = array( $content );
	}

	static function parseParams( $params ) {
		$args = array();
		foreach ( $params as $param ) {
			$param = preg_replace ( "/\s\s+/", ' ', $param ); // whitespace
			$param_parts = explode( "=", $param, 2 );
			if ( count( $param_parts ) < 2 ) {
				$args[$param_parts[0]] = null;
			} else {
				list( $name, $value ) = $param_parts;
				$args[$name] = $value;
			}
		}
		return $args;
	}

	/**
	 * Parses an argument of the form "a=b,c=d,..." into an array
	 */
	static function paramToArray( $arg, $lowercaseKeys = false, $lowercaseValues = false ) {
		$arg = preg_replace ( "/\s\s+/", ' ', $arg ); // whitespace

		// Split text on commas, except for commas found within quotes
		// and parentheses. Regular expression based on:
		// http://stackoverflow.com/questions/1373735/regexp-split-string-by-commas-and-spaces-but-ignore-the-inside-quotes-and-parent#1381895
		// ...with modifications by Nick Lindridge, ionCube Ltd.
		$pattern = <<<END
		/
	[,]
	(?=(?:(?:[^"]*"){2})*[^"]*$)
	(?=(?:(?:[^']*'){2})*[^']*$)
	(?=(?:[^()]*+\([^()]*+\))*+[^()]*+$)
	/x
END;
		// " - fix for color highlighting in vi :)
		$keyValuePairs = preg_split( $pattern, $arg );

		$returnArray = array();
		foreach ( $keyValuePairs as $keyValuePair ) {
			$keyAndValue = explode( '=', $keyValuePair, 2 );
			if ( count( $keyAndValue ) == 2 ) {
				$key = trim( $keyAndValue[0] );
				if ( $lowercaseKeys ) {
					$key = strtolower( $key );
				}
				$value = trim( $keyAndValue[1] );
				if ( $lowercaseValues ) {
					$value = strtolower( $value );
				}
				$returnArray[$key] = $value;
			}
		}
		return $returnArray;
	}

	static function getLDAPData( $filter, $domain, $params ) {
		global $edgLDAPServer;
		global $edgLDAPUser;
		global $edgLDAPPass;

		$ds = self::connectLDAP( $edgLDAPServer[$domain], $edgLDAPUser[$domain], $edgLDAPPass[$domain] );
		$results = self::searchLDAP( $ds, $domain, $filter, $params );

		return $results;
	}

	static function connectLDAP( $server, $username, $password ) {
		$ds = ldap_connect( $server );
		if ( $ds ) {
			// these options for Active Directory only?
			ldap_set_option( $ds, LDAP_OPT_PROTOCOL_VERSION, 3 );
			ldap_set_option( $ds, LDAP_OPT_REFERRALS, 0 );

			if ( $username ) {
				$r = ldap_bind( $ds, $username, $password );
			} else {
				# no username, so do anonymous bind
				$r = ldap_bind( $ds );
			}

			# should check the result of the bind here
			return $ds;
		} else {
			echo wfMessage( "externaldata-ldap-unable-to-connect", $server )->text();
		}
	}

	static function searchLDAP( $ds, $domain, $filter, $attributes ) {
		global $edgLDAPBaseDN;

		$sr = ldap_search( $ds, $edgLDAPBaseDN[$domain], $filter, $attributes );
		$results = ldap_get_entries( $ds, $sr );
		return $results;
	}

	static function getArrayValue( $arrayName, $key ) {
		if ( array_key_exists( $key, $arrayName ) ) {
			return $arrayName[$key];
		} else {
			return null;
		}
	}

	static function getDBData( $dbID, $from, $columns, $where, $sqlOptions, $otherParams ) {
		global $edgDBServerType;
		global $edgDBServer;
		global $edgDBDirectory;
		global $edgDBName;
		global $edgDBUser;
		global $edgDBPass;
		global $edgDBFlags;
		global $edgDBTablePrefix;

		// Get all possible parameters
		$db_type = self::getArrayValue( $edgDBServerType, $dbID );
		$db_server = self::getArrayValue( $edgDBServer, $dbID );
		$db_directory = self::getArrayValue( $edgDBDirectory, $dbID );
		$db_name = self::getArrayValue( $edgDBName, $dbID );
		$db_username = self::getArrayValue( $edgDBUser, $dbID );
		$db_password = self::getArrayValue( $edgDBPass, $dbID );
		$db_flags = self::getArrayValue( $edgDBFlags, $dbID );
		$db_tableprefix = self::getArrayValue( $edgDBTablePrefix, $dbID );

		// MongoDB has entirely different handling from the rest.
		if ( $db_type == 'mongodb' ) {
			if ( $db_name == '' ) {
				return wfMessage( "externaldata-db-incomplete-information" )->text();
			}
			return self::getMongoDBData( $db_server, $db_username, $db_password, $db_name, $from, $columns, $where, $sqlOptions, $otherParams );
		}

		// Validate parameters
		if ( $db_type == '' ) {
			return wfMessage( "externaldata-db-incomplete-information" )->text();
		} elseif ( $db_type == 'sqlite' ) {
			if ( $db_directory == '' || $db_name == '' ) {
				return wfMessage( "externaldata-db-incomplete-information" )->text();
			}
		} else {
			// We don't check the username or password because they
			// could legitimately be blank or null.
			if ( $db_server == '' || $db_name == '' ) {
				return wfMessage( "externaldata-db-incomplete-information" )->text();
			}
		}

		// Additional settings
		if ( $db_type == 'sqlite' ) {
			global $wgSQLiteDataDir;
			$oldDataDir = $wgSQLiteDataDir;
			$wgSQLiteDataDir = $db_directory;
		}
		if ( $db_flags == '' ) {
			$db_flags = DBO_DEFAULT;
		}

		// DatabaseBase::newFromType() was added in MW 1.17 - it was
		// then replaced by DatabaseBase::factory() in MW 1.18
		$factoryFunction = array( 'DatabaseBase', 'factory' );
		//$newFromTypeFunction = array( 'DatabaseBase', 'newFromType' );
		if ( is_callable( $factoryFunction ) ) {
			$db = DatabaseBase::factory( $db_type,
				array(
					'host' => $db_server,
					'user' => $db_username,
					'password' => $db_password,
					// Both 'dbname' and 'dbName' have been
					// used in different versions.
					'dbname' => $db_name,
					'dbName' => $db_name,
					'flags' => $db_flags,
					'tablePrefix' => $db_tableprefix,
				)
			);
		} else { //if ( is_callable( $newFromTypeFunction ) ) {
			$db = DatabaseBase::newFromType( $db_type,
				array(
					'host' => $db_server,
					'user' => $db_username,
					'password' => $db_password,
					'dbname' => $db_name,
					'flags' => $db_flags,
					'tableprefix' => $db_tableprefix,
				)
			);
		}

		if ( $db == null ) {
			return wfMessage( "externaldata-db-unknown-type" )->text();
		}

		if ( ! $db->isOpen() ) {
			return wfMessage( "externaldata-db-could-not-connect" )->text();
		}

		if ( count( $columns ) == 0 ) {
			return wfMessage( "externaldata-db-no-return-values" )->text();
		}

		$rows = self::searchDB( $db, $from, $columns, $where, $sqlOptions );
		$db->close();

		if ( !is_array( $rows ) ) {
			// It's an error message.
			return $rows;
		}

		if ( $db_type == 'sqlite' ) {
			// Reset global variable back to its original value.
			global $wgSQLiteDataDir;
			$wgSQLiteDataDir = $oldDataDir;
		}

		$values = array();
		foreach ( $rows as $row ) {
			foreach ( $columns as $column ) {
				$values[$column][] = $row[$column];
			}
		}

		return $values;
	}

	static function getValueFromJSONArray( array $origArray, $path, $default = null ) {
		$current = $origArray;
		$token = strtok( $path, '.' );

		while ( $token !== false ) {
			if ( !isset( $current[$token] ) ) {
				return $default;
			}
			$current = $current[$token];
			$token = strtok( '.' );
		}
		return $current;
	}

	/**
	 * Handles #get_db_data for the non-relational database system
	 * MongoDB.
	 */
	static function getMongoDBData( $db_server, $db_username, $db_password, $db_name, $from, $columns, $where, $sqlOptions, $otherParams ) {
		global $wgMainCacheType, $wgMemc, $edgMemCachedMongoDBSeconds;

		// Use MEMCACHED if configured to cache mongodb queries.
		if ($wgMainCacheType === CACHE_MEMCACHED && $edgMemCachedMongoDBSeconds > 0) {
			// Check if cache entry exists.
			$mckey = wfMemcKey( 'mongodb', $from, md5(json_encode($otherParams) . json_encode($columns) . $where . json_encode($sqlOptions) . $db_name . $db_server));
			$values = $wgMemc->get( $mckey );

			if ($values !== false) {
				return $values;
			}
		}

		// MongoDB login is done using a single string.
		// When specifying extra connect string options (e.g. replicasets,timeout, etc.),
		// use $db_server to pass these values
		// see http://docs.mongodb.org/manual/reference/connection-string
		$connect_string = "mongodb://";
		if ( $db_username != '' ) {
			$connect_string .= $db_username . ':' . $db_password . '@';
		}
		if ( $db_server != '') {
			$connect_string .= $db_server;
		} else {
			$connect_string .= 'localhost:27017';
		}

		// Use try/catch to suppress error messages, which would show
		// the MongoDB connect string, which may have sensitive
		// information.
		try {
			$m = new MongoClient( $connect_string );
		} catch ( Exception $e ) {
			return wfMessage( "externaldata-db-could-not-connect" )->text();
		}

		$db = $m->selectDB( $db_name );

		// Check if collection exists
		if ( $db->system->namespaces->findOne( array( 'name'=>$db_name . "." . $from ) ) === null ){
			return wfMessage( "externaldata-db-unknown-collection:")->text() . $db_name . "." . $from;
		}

		$collection = new MongoCollection( $db, $from );

		$findArray = array();
		$aggregateArray = array();
		// Was an aggregation pipeline command issued?
		if ( array_key_exists('aggregate', $otherParams ) ) {
			// The 'aggregate' parameter should be an array of
			// aggregation JSON pipeline commands.
			// Note to users: be sure to use spaces between curly
			// brackets in the 'aggregate' JSON so as not to trip up the
			// MW parser.
			$aggregateArray = json_decode ($otherParams['aggregate'], true);
		} elseif ( array_key_exists( 'find query', $otherParams ) ) {
			// Otherwise, was a direct MongoDB "find" query JSON string provided?
			// If so, use that. As with 'aggregate' JSON, use spaces
			// between curly brackets
			$findArray = json_decode ($otherParams['find query'], true);
		} elseif ( $where != '' ) {
			// If not, turn the SQL of the "where=" parameter into
			// a "find" array for MongoDB. Note that this approach
			// is only appropriate for simple find queries, that
			// use the operators OR, AND, >=, >, <=, < and LIKE
			// - and NO NUMERIC LITERALS.
			$where = str_ireplace( ' and ', ' AND ', $where );
			$where = str_ireplace( ' like ', ' LIKE ', $where );
			$whereElements = explode( ' AND ', $where );
			foreach ( $whereElements as $whereElement ) {
				if ( strpos( $whereElement, '>=' ) ) {
					list( $fieldName, $value ) = explode( '>=', $whereElement );
					$findArray[trim( $fieldName )] = array( '$gte' => trim( $value ) );
				} elseif ( strpos( $whereElement, '>' ) ) {
					list( $fieldName, $value ) = explode( '>', $whereElement );
					$findArray[trim( $fieldName )] = array( '$gt' => trim( $value ) );
				} elseif ( strpos( $whereElement, '<=' ) ) {
					list( $fieldName, $value ) = explode( '<=', $whereElement );
					$findArray[trim( $fieldName )] = array( '$lte' => trim( $value ) );
				} elseif ( strpos( $whereElement, '<' ) ) {
					list( $fieldName, $value ) = explode( '<', $whereElement );
					$findArray[trim( $fieldName )] = array( '$lt' => trim( $value ) );
				} elseif ( strpos( $whereElement, ' LIKE ' ) ) {
					list( $fieldName, $value ) = explode( ' LIKE ', $whereElement );
					$value = trim( $value );
					$regex = new MongoRegex( "/$value/i" );
					$findArray[trim( $fieldName )] = $regex;
				} else {
					list( $fieldName, $value ) = explode( '=', $whereElement );
					$findArray[trim( $fieldName )] = trim( $value );
				}
			}
		}

		// Do the same for the "order=" parameter as the "where=" parameter
		$sortArray = array();
		if ( $sqlOptions['ORDER BY'] != '' ) {
			$sortElements = explode( ',', $sqlOptions['ORDER BY'] );
			foreach ( $sortElements as $sortElement ) {
				$parts = explode( ' ', $sortElement );
				$fieldName = $parts[0];
				$orderingNum = 1;
				if ( count( $parts ) > 1 ) {
					if ( strtolower( $parts[1] ) == 'desc' ) {
						$orderingNum = -1;
					}
				}
				$sortArray[$fieldName] = $orderingNum;
			}
		}

		// Get the data!
		if ( array_key_exists( 'aggregate', $otherParams ) ) {
			if ( $sqlOptions['ORDER BY'] != '') {
				$aggregateArray[] = array( '$sort' => $sortArray );
			}
			if ( $sqlOptions['LIMIT'] != '' ) {
				$aggregateArray[] = array( '$limit' => intval( $sqlOptions['LIMIT'] ) );
			}
			$aggregateResult = $collection->aggregate( $aggregateArray );
			$resultsCursor = $aggregateResult['result'];
		} else {
			$resultsCursor = $collection->find( $findArray, $columns )->sort( $sortArray )->limit( $sqlOptions['LIMIT'] );
		}

		$values = array();
		foreach ( $resultsCursor as $doc ) {
			foreach ( $columns as $column ) {
				if ( strstr($column, ".") ) {
					// If the exact path of the value was
					// specified using dots (e.g., "a.b.c"),
					// get the value that way.
					$values[$column][] = self::getValueFromJSONArray( $doc, $column );
				} elseif ( isset( $doc[$column] ) && is_array( $doc[$column] ) ) {
					// If MongoDB returns an array for a column,
					// but the exact location of the value wasn't specified,
					// do some extra processing.
					if ( $column == 'geometry' && array_key_exists( 'coordinates', $doc['geometry'] ) ) {
						// Check if it's GeoJSON geometry:
						// http://www.geojson.org/geojson-spec.html#geometry-objects
						// If so, return it in a format that
						// the Maps extension can understand.
						$coordinates = $doc['geometry']['coordinates'][0];
						$coordinateStrings = array();
						foreach ( $coordinates as $coordinate ) {
							$coordinateStrings[] = $coordinate[1] . ',' . $coordinate[0];
						}
						$values[$column][] = implode( ':', $coordinateStrings );
					} else {
						// Just return it as JSON, the
						// lingua franca of MongoDB.
						$values[$column][] = json_encode( $doc[$column] );
					}
				} else {
					// It's a simple literal.
					$values[$column][] = (isset( $doc[$column] ) ? $doc[$column] : null);
				}
			}
		}

		if ($wgMainCacheType === CACHE_MEMCACHED && $edgMemCachedMongoDBSeconds > 0 ) {
			$wgMemc->set( $mckey, $values, $edgMemCachedMongoDBSeconds );
		}

		return $values;
	}

	static function searchDB( $db, $table, $vars, $conds, $sqlOptions ) {
		// Add on a space at the beginning of $table so that
		// $db->select() will treat it as a literal, instead of
		// putting quotes around it or otherwise trying to parse it,
		// so that aliases like "users u" will be accepted.
		// However, if a table prefix has been set, we need it added,
		// so don't make it a literal in that case.
		if ( $db->tablePrefix() == '' ) {
			$table = ' ' . $table;
		}
		$result = $db->select( $table, $vars, $conds, 'EDUtils::searchDB', $sqlOptions );
		if ( !$result ) {
			return wfMessage( "externaldata-db-invalid-query" )->text();
		}

		$rows = array();
		while ( $row = $db->fetchRow( $result ) ) {
			// Create a new row object, that uses the passed-in
			// column names as keys, so that there's always an
			// exact match between what's in the query and what's
			// in the return value (so that "a.b", for instance,
			// doesn't get chopped off to just "b").
			$new_row = array();
			foreach ( $vars as $i => $column_name ) {
				// Convert the encoding to UTF-8
				// if necessary - based on code at
				// http://www.php.net/manual/en/function.mb-detect-encoding.php#102510
				$dbField = $row[$i];
				if ( !function_exists( 'mb_detect_encoding' ) ||
					mb_detect_encoding( $dbField, 'UTF-8', true ) == 'UTF-8' ) {
					$new_row[$column_name] = $dbField;
				} else {
					$new_row[$column_name] = utf8_encode( $dbField );
				}
			}
			$rows[] = $new_row;
		}
		return $rows;
	}

	static function getXMLData( $xml ) {
		global $edgXMLValues;
		$edgXMLValues = array();

		// Remove comments from XML - for some reason, xml_parse()
		// can't handle them.
		$xml = preg_replace( '/<!--.*?-->/s', '', $xml );

		// Also, re-insert ampersands, after they were removed to
		// avoid parsing problems.
		$xml = str_replace( '&amp;', self::$ampersandReplacement, $xml );

		$xml_parser = xml_parser_create();
		xml_set_element_handler( $xml_parser, array( 'EDUtils', 'startElement' ), array( 'EDUtils', 'endElement' ) );
		xml_set_character_data_handler( $xml_parser, array( 'EDUtils', 'getContent' ) );
		if ( !xml_parse( $xml_parser, $xml, true ) ) {
			return wfMessage( 'externaldata-xml-error',
			xml_error_string( xml_get_error_code( $xml_parser ) ),
			xml_get_current_line_number( $xml_parser ) )->text();
		}
		xml_parser_free( $xml_parser );
		return $edgXMLValues;
	}

	static function isNodeNotEmpty( $node ) {
		return trim( $node[0] ) != '';
	}

	static function filterEmptyNodes( $nodes ) {
		if ( !is_array( $nodes ) ) return $nodes;
		return array_filter( $nodes, array( 'EDUtils', 'isNodeNotEmpty' ) );
	}

	static function getXPathData( $xml, $mappings, $ns ) {
		global $edgXMLValues;

		try {
			$sxml = new SimpleXMLElement( $xml );
		} catch ( Exception $e ) {
			return "Caught exception parsing XML: " . $e->getMessage();
		}
		$edgXMLValues = array();

		foreach ( $mappings as $local_var => $xpath ) {
			// First, register any necessary XML namespaces, to
			// avoid "Undefined namespace prefix" errors.
			$matches = array();
			preg_match_all( '/[\/\@]([a-zA-Z0-9]*):/', $xpath, $matches );
			foreach ( $matches[1] as $namespace ) {
				$sxml->registerXPathNamespace( $namespace, $ns );
			}

			// Now, get all the matching values, and remove any
			// empty results.
			$nodes = self::filterEmptyNodes( $sxml->xpath( $xpath ) );
			if ( !$nodes ) {
				continue;
			}

			// Convert from SimpleXMLElement to string.
			$nodesArray = array();
			foreach ( $nodes as $xmlNode ) {
				$nodesArray[] = (string)$xmlNode;
			}

			if ( array_key_exists( $xpath, $edgXMLValues ) ) {
				// At the moment, this code will never get
				// called, because duplicate values in
				// $mappings will have been removed already.
				$edgXMLValues[$xpath] = array_merge( $edgXMLValues[$xpath], $nodesArray );
			} else {
				$edgXMLValues[$xpath] = $nodesArray;
			}
		}
		return $edgXMLValues;
	}

	static function getValuesFromCSVLine( $csv_line ) {
		// regular expression copied from http://us.php.net/fgetcsv
		$vals = preg_split( '/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/', $csv_line );
		$vals2 = array();
		foreach ( $vals as $val ) {
			$vals2[] = trim( $val, '"' );
		}
		return $vals2;
	}

	static function getCSVData( $csv, $has_header, $delimiter = ',' ) {
		// from http://us.php.net/manual/en/function.str-getcsv.php#88311
		// str_getcsv() is a function that was only added in PHP 5.3.0,
		// so use the much older fgetcsv() if it's not there

		// actually, for now, always use fgetcsv(), since this call to
		// str_getcsv() doesn't work, and I can't test/debug it at the
		// moment
		//if ( function_exists( 'str_getcsv' ) ) {
		//	$table = str_getcsv( $csv );
		//} else {
			$fiveMBs = 5 * 1024 * 1024;
			$fp = fopen( "php://temp/maxmemory:$fiveMBs", 'r+' );
			fputs( $fp, $csv );
			rewind( $fp );
			$table = array();
			while ( $line = fgetcsv( $fp, 0, $delimiter ) ) {
				array_push( $table, $line );
			}
			fclose( $fp );
		//}

		// Get rid of blank characters - these sometimes show up
		// for certain encodings.
		foreach( $table as $i => $row ) {
			foreach ( $row as $j => $cell ) {
				$table[$i][$j] = str_replace( chr(0), '', $cell );
			}
		}

		// Get rid of the "byte order mark", if it's there - it could
		// be one of a variety of options, depending on the encoding.
		// Code copied in part from:
		// http://artur.ejsmont.org/blog/content/annoying-utf-byte-order-marks
		$sets = array(
			"\xFE",
			"\xFF",
			"\xFE\xFF",
			"\xFF\xFE",
			"\xEF\xBB\xBF",
			"\x2B\x2F\x76",
			"\xF7\x64\x4C",
			"\x0E\xFE\xFF",
			"\xFB\xEE\x28",
			"\x00\x00\xFE\xFF",
			"\xDD\x73\x66\x73",
		);
		$decodedFirstCell = utf8_decode( $table[0][0] );
		foreach ( $sets as $set ) {
			if ( 0 == strncmp( $decodedFirstCell, $set, strlen( $set ) ) ) {
				$table[0][0] = substr( $decodedFirstCell, strlen( $set ) + 1 );
				break;
			}
		}

		// Another "byte order mark" test, this one copied from the
		// Data Transfer extension - somehow the first one doesn't work
		// in all cases.
		$byteOrderMark = pack( "CCC", 0xef, 0xbb, 0xbf );
		if ( 0 == strncmp( $table[0][0], $byteOrderMark, 3 ) ) {
			$table[0][0] = substr( $table[0][0], 3 );
		}

		// Get header values, if this is 'csv with header'
		if ( $has_header ) {
			$header_vals = array_shift( $table );
			// On the off chance that there are one or more blank
			// lines at the beginning, cycle through.
			while ( count( $header_vals ) == 0 ) {
				$header_vals = array_shift( $table );
			}
		}

		// Unfortunately, some subpar CSV generators don't include
		// trailing commas, so that a line that should look like
		// "A,B,,," instead is just printed as "A,B".
		// To get around this, we first figure out the correct number
		// of columns in this table - which depends on whether the
		// CSV has a header or not.
		if ( $has_header ) {
			$num_columns = count( $header_vals );
		} else {
			$num_columns = 0;
			foreach ( $table as $line ) {
				$num_columns = max( $num_columns, count( $line ) );
			}
		}

		// Now "flip" the data, turning it into a column-by-column
		// array, instead of row-by-row.
		$values = array();
		foreach ( $table as $line ) {
			for ( $i = 0; $i < $num_columns; $i++ ) {
				// This check is needed in case it's an
				// uneven CSV file (see above).
				if ( array_key_exists( $i, $line ) ) {
					$row_val = trim( $line[$i] );
				} else {
					$row_val = '';
				}
				if ( $has_header ) {
					$column = strtolower( trim( $header_vals[$i] ) );
				} else {
					// start with an index of 1 instead of 0
					$column = $i + 1;
				}
				if ( array_key_exists( $column, $values ) ) {
					$values[$column][] = $row_val;
				} else {
					$values[$column] = array( $row_val );
				}
			}
		}
		return $values;
	}

	/**
	 * This function handles version 3 of the genomic-data format GFF,
	 * defined here:
	 * http://www.sequenceontology.org/gff3.shtml
	 */
	static function getGFFData( $gff ) {
		// use an fgetcsv() call, similar to the one in getCSVData()
		// (fgetcsv() can handle delimiters other than commas, in this
		// case a tab)
		$fiveMBs = 5 * 1024 * 1024;
		$fp = fopen( "php://temp/maxmemory:$fiveMBs", 'r+' );
		fputs( $fp, $gff );
		rewind( $fp );
		$table = array();
		while ( $line = fgetcsv( $fp, null, "\t" ) ) {
			// ignore comment lines
			if ( strpos( $line[0], '##' ) !== 0 ) {
				// special handling for final 'attributes' column
				if ( array_key_exists( 8, $line ) ) {
					$attributes = explode( ';', $line[8] );
					foreach ( $attributes as $attribute ) {
						$keyAndValue = explode( '=', $attribute, 2 );
						if ( count( $keyAndValue ) == 2 ) {
							$key = strtolower( $keyAndValue[0] );
							$value = $keyAndValue[1];
							$line[$key] = $value;
						}
					}
				}
				array_push( $table, $line );
			}
		}
		fclose( $fp );

		$values = array();
		foreach ( $table as $line ) {
			foreach ( $line as $i => $row_val ) {
				// each of the columns in GFF have a
				// pre-defined name - even the last column
				// has its own name, "attributes"
				if ( $i === 0 ) {
					$column = 'seqid';
				} elseif ( $i == 1 ) {
					$column = 'source';
				} elseif ( $i == 2 ) {
					$column = 'type';
				} elseif ( $i == 3 ) {
					$column = 'start';
				} elseif ( $i == 4 ) {
					$column = 'end';
				} elseif ( $i == 5 ) {
					$column = 'score';
				} elseif ( $i == 6 ) {
					$column = 'strand';
				} elseif ( $i == 7 ) {
					$column = 'phase';
				} elseif ( $i == 8 ) {
					$column = 'attributes';
				} else {
					// this is hopefully an attribute key
					$column = $i;
				}
				if ( array_key_exists( $column, $values ) ) {
					$values[$column][] = $row_val;
				} else {
					$values[$column] = array( $row_val );
				}
			}
		}
		return $values;
	}

	/**
	 * Helper function that determines whether an array holds a simple
	 * list of scalar values, with no keys (i.e., not an associative
	 * array).
	 */
	static function holdsSimpleList( $arr ) {
		$expectedKey = 0;
		foreach( $arr as $key => $val ) {
			if ( is_array( $val ) || $key != $expectedKey++ ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Recursive JSON-parsing function for use by getJSONData().
	 */
	static function parseTree( $tree, &$retrieved_values ) {
		foreach ( $tree as $key => $val ) {
			// TODO - this logic could probably be a little nicer.
			if ( is_array( $val ) && self::holdsSimpleList( $val ) ) {
				// If it just holds a simple list, turn the
				// array into a comma-separated list, then
				// pass it back in in order to do the final					// processing.
				$val = array( $key => implode( ', ', $val ) );
				self::parseTree( $val, $retrieved_values );
			} elseif ( is_array( $val ) && count( $val ) > 1 ) {
				self::parseTree( $val, $retrieved_values );
			} elseif ( is_array( $val ) && count( $val ) == 1 && is_array( current( $val ) ) ) {
				self::parseTree( current( $val ), $retrieved_values );
			} else {
				// If it's an array with just one element,
				// treat it like a regular value.
				// (Why is the null check necessary?)
				if ( $val != null && is_array( $val ) ) {
					$val = current( $val );
				}
				$key = strtolower( $key );
				if ( array_key_exists( $key, $retrieved_values ) ) {
					$retrieved_values[$key][] = $val;
				} else {
					$retrieved_values[$key] = array( $val );
				}
			}
		}
	}

	static function getJSONData( $json ) {
		$json_tree = FormatJson::decode( $json, true );
		if ( is_null( $json_tree ) ) {
			// It's probably invalid JSON.
			return wfMessage( 'externaldata-invalid-json' )->text();
		}
		$values = array();
		if ( is_array( $json_tree ) ) {
			self::parseTree( $json_tree, $values );
		}
		return $values;
	}

	static function fetchURL( $url, $post_vars = array(), $cacheExpireTime = 0, $get_fresh = false, $try_count = 1 ) {
		$dbr = wfGetDB( DB_SLAVE );
		global $edgStringReplacements, $edgCacheTable, $edgAllowSSL;

		if ( $post_vars ) {
			return Http::post( $url, array( 'postData' => $post_vars ) );
		}

		// do any special variable replacements in the URLs, for
		// secret API keys and the like
		foreach ( $edgStringReplacements as $key => $value ) {
			$url = str_replace( $key, $value, $url );
		}

		if ( !isset( $edgCacheTable ) || is_null( $edgCacheTable ) ) {
			if ( $edgAllowSSL ) {
				$contents = Http::get( $url, 'default', array( 'sslVerifyCert' => false, 'followRedirects' => false ) );
			} else {
				$contents = Http::get( $url );
			}
			// Handle non-UTF-8 encodings.
			// Copied from http://www.php.net/manual/en/function.file-get-contents.php#85008
			// Unfortunately, 'mbstring' functions are not available
			// in all PHP installations.
			if ( function_exists( 'mb_convert_encoding' ) ) {
				$contents = mb_convert_encoding( $contents, 'UTF-8',
					mb_detect_encoding( $contents, 'UTF-8, ISO-8859-1', true ) );
			}
			return $contents;
		}

		// check the cache (only the first 254 chars of the url)
		$row = $dbr->selectRow( $edgCacheTable, '*', array( 'url' => substr( $url, 0, 254 ) ), 'EDUtils::fetchURL' );

		if ( $row && ( ( time() - $row->req_time ) > $cacheExpireTime ) ) {
			$get_fresh = true;
		}

		if ( !$row || $get_fresh ) {
			if ( $edgAllowSSL ) {
				$page = Http::get( $url, 'default', array( CURLOPT_SSL_VERIFYPEER => false ) );
			} else {
				$page = Http::get( $url );
			}
			if ( $page === false ) {
				sleep( 1 );
				if ( $try_count >= self::$http_number_of_tries ) {
					echo wfMessage( 'externaldata-db-could-not-get-url', self::$http_number_of_tries )->text();
					return '';
				}
				$try_count++;
				return self::fetchURL( $url, $post_vars, $cacheExpireTime, $get_fresh, $try_count );
			}
			if ( $page != '' ) {
				$dbw = wfGetDB( DB_MASTER );
				// Delete the old entry, if one exists.
				$dbw->delete( $edgCacheTable, array( 'url' => substr( $url, 0, 254 )));
				// Insert contents into the cache table.
				$dbw->insert( $edgCacheTable, array( 'url' => substr( $url, 0, 254 ), 'result' => $page, 'req_time' => time() ) );
				return $page;
			}
		} else {
			return $row->result;
		}
	}

	static private function getDataFromText( $contents, $format, $mappings, $source ) {
		// For now, this is only done for the CSV formats.
		if ( is_array( $format ) ) {
			list( $format, $delimiter ) = $format;
		} else {
			$delimiter = ',';
		}

		if ( $format == 'xml' ) {
			return self::getXMLData( $contents );
		} elseif ( $format == 'xml with xpath' ) {
			return self::getXPathData( $contents, $mappings, $source );
		} elseif ( $format == 'csv' ) {
			return self::getCSVData( $contents, false, $delimiter );
		} elseif ( $format == 'csv with header' ) {
			return self::getCSVData( $contents, true, $delimiter );
		} elseif ( $format == 'json' ) {
			return self::getJSONData( $contents );
		} elseif ( $format == 'gff' ) {
			return self::getGFFData( $contents );
		} else {
			return wfMessage( 'externaldata-web-invalid-format', $format )->text();
		}
	}

	/**
	 * Checks whether this URL is allowed, based on the
	 * $edgAllowExternalDataFrom whitelist
	 */
	static public function isURLAllowed( $url ) {
		// this code is based on Parser::maybeMakeExternalImage()
		global $edgAllowExternalDataFrom;
		$data_from = $edgAllowExternalDataFrom;
		$text = false;
		if ( empty( $data_from ) ) {
			return true;
		} elseif ( is_array( $data_from ) ) {
			foreach ( $data_from as $match ) {
				if ( strpos( $url, $match ) === 0 ) {
					return true;
				}
			}
			return false;
		} else {
			if ( strpos( $url, $data_from ) === 0 ) {
				return true;
			} else {
				return false;
			}
		}
	}

	static public function getDataFromURL( $url, $format, $mappings, $postData = null, $cacheExpireTime ) {
		$url_contents = self::fetchURL( $url, $postData, $cacheExpireTime );
		// Show an error message if there's nothing there.
		if ( empty( $url_contents ) ) {
			return "Error: No contents found at URL $url.";
		}

		return self::getDataFromText( $url_contents, $format, $mappings, $url );
	}

	static private function getDataFromPath( $path, $format, $mappings ) {
		if ( !file_exists( $path ) ) {
			return "Error: No file found.";
		}
		$file_contents = file_get_contents( $path );
		// Show an error message if there's nothing there.
		if ( empty( $file_contents ) ) {
			return "Error: Unable to get file contents.";
		}

		return self::getDataFromText( $file_contents, $format, $mappings, $path );
	}

	static public function getDataFromFile( $file, $format, $mappings ) {
		global $edgFilePath;

		if ( array_key_exists( $file, $edgFilePath ) ) {
			return self::getDataFromPath( $edgFilePath[$file], $format, $mappings );
		} else {
			return "Error: No file is set for ID \"$file\".";
		}
	}

	static public function getDataFromDirectory( $directory, $fileName, $format, $mappings ) {
		global $edgDirectoryPath;

		if ( array_key_exists( $directory, $edgDirectoryPath ) ) {
			$directoryPath = $edgDirectoryPath[$directory];
			$path = realpath( $directoryPath . $fileName );
			if ( $path !== false && strpos( $path, $directoryPath ) === 0 ) {
				return self::getDataFromPath( $path, $format, $mappings );
			} else {
				return "Error: File name \"$fileName\" is not allowed for directory ID \"$directory\".";
			}
		} else {
			return "Error: No directory is set for ID \"$directory\".";
		}
	}

	/**
	 * Recursive function, used by getSOAPData().
	 */
	static public function getValuesForKeyInTree( $key, $tree ) {
		// The passed-in tree can be either an array or a stdObject -
		// we need it to be an array.
		if ( is_object( $tree ) ) {
			$tree = get_object_vars( $tree );
		}
		$values = array();
		foreach ( $tree as $curKey => $curValue ) {
			if ( is_object( $curValue ) || is_array( $curValue ) ) {
				$additionalValues = self::getValuesForKeyInTree( $key, $curValue );
				$values = array_merge( $values, $additionalValues );
			} elseif ( $curKey == $key ) {
				$values[] = $curValue;
			}
		}
		return $values;
	}

	static public function getSOAPData( $url, $requestName, $requestData, $responseName, $mappings) {
		$client = new SoapClient( $url );
		try {
			$result = $client->$requestName( $requestData );
		} catch ( Exception $e ) {
			return "Caught exception: " . $e->getMessage();
		}

		$realResultJSON = $result->$responseName;
		if ( $realResultJSON == '' ) {
			return 'Error: no data found for this set of "requestData" fields.';
		}

		$realResult = json_decode( $realResultJSON );
		$errorKey = '#Error:';
		if ( array_key_exists( $errorKey, $realResult ) ) {
			return 'Error: ' . $realResult->$errorKey;
		}

		$values = array();
		foreach ( $mappings as $fieldName ) {
			$values[$fieldName] = self::getValuesForKeyInTree( $fieldName, $realResult );
		}
		return $values;
	}

}
