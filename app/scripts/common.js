// exports.helloObject = {hello: "world"};
const commonlib = {};

if (window) {
    window.commonlib = commonlib;
}
if (typeof exports !== 'undefined') {
    exports.commonlib = commonlib;
}
function extractBookmarks(browserBookmarks, parents) {
    if (typeof parents === 'undefined') {
        parents = []
    }
    var returnedBookmars = [];
    browserBookmarks.forEach(function (browserBookmark) {
        if (shouldProcessBookmark(browserBookmark)) {
            returnedBookmars.push({
                id: browserBookmark.id,
                parents: parents.slice(0)
            });
        } else if (browserBookmark.type === 'folder') {
            var childParents = parents.slice(0);
            var currentTitle;
            if (browserBookmark.id === "root________") {
                currentTitle = 'root';
            } else {
                currentTitle = browserBookmark.title;
            }
            childParents.push(currentTitle);
            const childBookmarks = extractBookmarks(browserBookmark.children, childParents);
            Array.prototype.push.apply(returnedBookmars, childBookmarks);
        }
    }, this);
    return returnedBookmars;
}

function shouldProcessBookmark(browserBookmark) {
    return browserBookmark.type === 'bookmark' && browserBookmark.url.indexOf('place:') === -1;
}

function generateNewBookmarkData(bookmarkData) {
    const oldTitle = bookmarkData.title;
    var newTitle = oldTitle;
    newTitle = newTitle + " :::";
    bookmarkData.parents.forEach(function (parent) {
        newTitle = newTitle + " " + parent.toLowerCase().replace(" ", "");
    });

    const newBookmarkData = {
        id: bookmarkData.id,
        newTitle: newTitle
    }

    return newBookmarkData;
}

function onInstalled(api) {
    api.runtime.onInstalled.addListener(function () {
        
    });
}

commonlib.extractBookmarks = extractBookmarks;
commonlib.shouldProcessBookmark = shouldProcessBookmark;
commonlib.generateNewBookmarkData = generateNewBookmarkData;
commonlib.onInstalled = onInstalled;
