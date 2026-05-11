import { strict as assert } from "node:assert";
import { test } from "node:test";
import { buildManifest } from "./generate-versions-json.mjs";

test( "buildManifest sorts versions descending and selects highest as stable", () => {
	const result = buildManifest( [ "v3.14", "v3.15", "v3.13", "README.md", "not-a-version" ] );

	assert.deepEqual( result.versions.map( ( v ) => v.id ), [ "v3.15", "v3.14", "v3.13" ] );
	assert.equal( result.stable, "v3.15" );
	assert.equal( result.main, "/" );
} );

test( "buildManifest sorts by minor numerically (10 > 9)", () => {
	const result = buildManifest( [ "v3.9", "v3.10", "v3.2" ] );

	assert.deepEqual( result.versions.map( ( v ) => v.id ), [ "v3.10", "v3.9", "v3.2" ] );
} );

test( "buildManifest produces no stable when there are no versions", () => {
	const result = buildManifest( [] );

	assert.equal( result.stable, undefined );
	assert.deepEqual( result.versions, [] );
	assert.equal( result.main, "/" );
} );

test( "buildManifest sorts by major when majors differ", () => {
	const result = buildManifest( [ "v2.99", "v3.0" ] );

	assert.deepEqual( result.versions.map( ( v ) => v.id ), [ "v3.0", "v2.99" ] );
} );

test( "buildManifest emits path with leading and trailing slashes", () => {
	const result = buildManifest( [ "v3.15" ] );

	assert.equal( result.versions[ 0 ].path, "/v3.15/" );
} );
