
;(function(window) {

	'use strict';

	var mainContainer = document.getElementById('verify-main-section'),
		openCtrl = document.getElementById('go-verify-tag-btn'),
		closeCtrl = document.getElementById('btn-search-close'),
		searchContainer = document.getElementById('verify-search-section'),
		inputSearch = document.getElementsById('verify-search-input');

	function init() {
		initEvents();	
	}

	function initEvents() {
		openCtrl.addEventListener('click', openSearch);
		closeCtrl.addEventListener('click', closeSearch);
		document.addEventListener('keyup', function(ev) {
			// escape key.
			if( ev.keyCode == 27 ) {
				closeSearch();
			}
		});
	}

	function openSearch() {
		mainContainer.classList.add('main-wrap--move');
		searchContainer.classList.add('search--open');
		inputSearch.focus();
	}

	function closeSearch() {
		mainContainer.classList.remove('main-wrap--move');
		searchContainer.classList.remove('search--open');
		inputSearch.blur();
		inputSearch.value = '';
	}

	init();

})(window);