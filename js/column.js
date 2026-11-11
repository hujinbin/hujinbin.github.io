(function() {
    function $() {
        return Array.prototype.slice.call(document.querySelectorAll.apply(document, arguments));
    }

    // copy widgets in the right column, when exist, to the bottom of the left column
    if ($('.columns .column-right').length && $('.columns .column-right-shadow').length && !$('.columns .column-right-shadow')[0].children.length) {
        for (const child of $('.columns .column-right')[0].children) {
            // 广告 DOM 不能克隆；移动端已有主内容广告，不复制隐藏侧栏里的广告和 iframe。
            if (child.classList.contains('adsense-widget')) continue;
            $('.columns .column-right-shadow')[0].append(child.cloneNode(true));
        }
    }
}());
