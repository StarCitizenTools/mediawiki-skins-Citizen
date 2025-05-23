/**
 * Various enhancements to the page content
 */

/**
 * @return {void}
 */
function init() {
	addUserAnniversary();
}

/**
 * Append cake emoji to user registration date if it's the user's anniversary
 *
 * @return {void}
 */
function addUserAnniversary() {
	document.querySelectorAll( '.citizen-user-regdate' ).forEach( ( date ) => {
		const timestamp = date.getAttribute( 'datetime' );
		const anniversary = new Date( timestamp );
		const today = new Date();

		if (
			anniversary.getMonth() !== today.getMonth() ||
			anniversary.getDate() !== today.getDate()
		) {
			return;
		}

		const cake = document.createElement( 'span' );
		cake.textContent = ' 🎂';
		cake.classList.add( 'citizen-user-regdate-anniversary' );
		cake.setAttribute( 'aria-label', 'anniversary' );
		date.insertAdjacentElement( 'beforeend', cake );
	} );
}

module.exports = {
	init: init
};
