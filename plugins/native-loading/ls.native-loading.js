(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	'use strict';

	var imgSupport = 'loading' in HTMLImageElement.prototype;
	var iframeSupport = 'loading' in HTMLIFrameElement.prototype;

	console.warn('Not tested don\'t use in production');

	if (!window.addEventListener || !window.MutationObserver || (!imgSupport && !iframeSupport)) {
		return;
	}

	var nativeLoadingCfg;
	var isConfigSet = false;
	var oldPrematureUnveil = lazySizes.prematureUnveil;
	var cfg = lazySizes.cfg;

	function disableEvents() {
		var throttledCheckElements = lazySizes.loader.checkElems;

		window.removeEventListener('scroll', throttledCheckElements, true);
		window.removeEventListener('resize', throttledCheckElements, true);

		['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'].forEach(function(name){
			document.removeEventListener(name, throttledCheckElements, true);
		});
	}

	function runConfig() {
		isConfigSet = true;

		nativeLoadingCfg = cfg.nativeLoading || {};

		if (imgSupport && iframeSupport && nativeLoadingCfg.disableListeners) {
			disableEvents();
			nativeLoadingCfg.setLoadingAttribute = true;
		}

		if (nativeLoadingCfg.setLoadingAttribute) {
			window.addEventListener('lazybeforeunveil', function(e){
				var element = e.target;

				if ('loading' in element && !element.getAttribute('loading')) {
					element.setAttribute('loading', 'lazy');
				}
			}, true);
		}
	}

	lazySizes.prematureUnveil = function prematureUnveil(element) {

		if (!isConfigSet) {
			runConfig();
		}

		if ('loading' in element &&
			(nativeLoadingCfg.setLoadingAttribute || element.getAttribute('loading')) &&
			(element.getAttribute('data-sizes') != 'auto' || element.offsetWidth)) {
			lazySizes.loader.unveil(element);
			return true;
		}

		if (oldPrematureUnveil) {
			return oldPrematureUnveil(element);
		}
	};

}));