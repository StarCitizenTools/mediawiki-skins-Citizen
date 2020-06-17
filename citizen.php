<?php
/**
 * Citizen - A responsive skin developed for the Star Citizen Wiki
 *
 * This file is part of Citizen.
 *
 * Citizen is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Citizen is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Citizen.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file
 */

if ( function_exists( 'wfLoadSkin' ) ) {
	wfLoadSkin( 'Citizen' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Citizen'] = __DIR__ . '/i18n';

	return true;
}

die( 'This version of the Citizen skin requires MediaWiki 1.31+' );
