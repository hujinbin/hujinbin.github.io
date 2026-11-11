(function () {
    if (window.BlogAdsense) {
        window.BlogAdsense.scan();
        return;
    }
    var units = new Map();
    var frame = null;
    function collapse(container) {
        var widget = container.closest('.adsense-widget');
        if (widget) widget.hidden = true;
    }
    function request(container, state) {
        if (state.requested || !container.isConnected) return;
        if (window.__blogAdsenseLoaderFailed) {
            collapse(container);
            return;
        }
        var rect = container.getBoundingClientRect();
        var style = window.getComputedStyle(container);
        if (rect.width <= 0 || !container.getClientRects().length || style.visibility === 'hidden') return;
        if (rect.top > window.innerHeight + 300 || rect.bottom < -300) return;
        var client = container.getAttribute('data-ad-client');
        var slot = container.getAttribute('data-ad-slot');
        if (!client || !slot) return;
        var ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.style.width = '100%';
        ad.setAttribute('data-ad-client', client);
        ad.setAttribute('data-ad-slot', slot);
        ad.setAttribute('data-ad-format', container.getAttribute('data-ad-format') || 'auto');
        ad.setAttribute('data-full-width-responsive', 'true');
        var layout = container.getAttribute('data-ad-layout');
        if (layout) ad.setAttribute('data-ad-layout', layout);
        container.appendChild(ad);
        state.requested = true;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            container.setAttribute('data-request-state', 'queued');
        } catch (error) {
            container.setAttribute('data-request-state', 'error');
            collapse(container);
        }
    }
    function scan() {
        frame = null;
        units.forEach(function (state, container) {
            if (!container.isConnected) {
                if (state.resize) state.resize.disconnect();
                units.delete(container);
            }
        });
        document.querySelectorAll('.google-ad-unit').forEach(function (container) {
            var state = units.get(container);
            if (!state) {
                state = { requested: false };
                units.set(container, state);
                if (window.ResizeObserver) {
                    state.resize = new ResizeObserver(schedule);
                    state.resize.observe(container);
                }
            }
            var ad = container.querySelector('ins');
            if (window.__blogAdsenseLoaderFailed || (ad && ad.getAttribute('data-ad-status') === 'unfilled')) collapse(container);
            else request(container, state);
        });
    }
    function schedule() {
        if (frame === null) frame = window.requestAnimationFrame(scan);
    }
    function start() {
        if (window.MutationObserver) {
            var observer = new MutationObserver(schedule);
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-ad-status'] });
        }
        window.addEventListener('resize', schedule);
        window.addEventListener('scroll', schedule, { passive: true });
        document.addEventListener('pjax:complete', schedule);
        document.addEventListener('adsense:loader-error', schedule);
        schedule();
    }
    window.BlogAdsense = { scan: schedule };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
