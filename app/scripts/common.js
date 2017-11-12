// exports.helloObject = {hello: "world"};
const commonlib = {};

if (window) {
    window.commonlib = commonlib;
}
if (typeof exports !== 'undefined') {
    exports.commonlib = commonlib;
}
function extractBookmarks(browserBookmarks) {
    var returnedBookmars = [];
    browserBookmarks.forEach(function (browserBookmark) {
        if (shouldProcessBookmark(browserBookmark)) {
            returnedBookmars.push({ id: browserBookmark.id });
        } else if (browserBookmark.type === 'folder') {
            const childBookmarks = extractBookmarks(browserBookmark.children);
            Array.prototype.push.apply(returnedBookmars, childBookmarks);
        }
    }, this);
    return returnedBookmars;
}

function shouldProcessBookmark(browserBookmark){
    return browserBookmark.type === 'bookmark' && browserBookmark.url.indexOf('place:') === -1;
}

commonlib.extractBookmarks = extractBookmarks;
commonlib.shouldProcessBookmark = shouldProcessBookmark;