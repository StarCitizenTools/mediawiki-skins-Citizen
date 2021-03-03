function bindClick( collHeading, collSection, i, j ) {
	return function () {
		j = i + 1;
		this.classList.toggle( 'section-heading--collapsed' );
		collSection[ j ].classList.toggle( 'section-collapsible--collapsed' );
	};
}

function main() {
	var collHeading = document.getElementsByClassName( 'section-heading' ),
		collSection = document.getElementsByClassName( 'section-collapsible' ),
		i, j;

	for ( i = 0; i < collHeading.length; i++ ) {
		collHeading[ i ].addEventListener( 'click', bindClick( collHeading, collSection, i, j ) );
	}
}

main();
