function bindClick( collToggle, collSection, i, j ) {
	return function () {
		j = i + 1;
		this.classList.toggle( 'section-toggle--collapsed' );
		collSection[ j ].classList.toggle( 'section-collapsible--collapsed' );
	};
}

function main() {
	var collSection = document.getElementsByClassName( 'section-collapsible' ),
		collToggle = document.getElementsByClassName( 'section-toggle' ),
		i, j;

	for ( i = 0; i < collToggle.length; i++ ) {
		collToggle[ i ].addEventListener( 'click', bindClick( collToggle, collSection, i, j ) );
	}
}

main();
