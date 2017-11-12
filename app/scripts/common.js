// exports.helloObject = {hello: "world"};
const commonlib = {};

if (window) {
    window.commonlib = commonlib;
}
// if (typeof exports !== 'undefined') {
//     exports.commonlib = commonlib;
// }

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
        newTitle: newTitle,
        url: bookmarkData.url
    }

    return newBookmarkData;
}

function runInBackground(browser) {
    browser.runtime.onInstalled.addListener(function () {
        browser.bookmarks.getTree().then(function (bookmarksTree) {
            commonlib.processAllBookmarks(bookmarksTree);
        });
    });
}

function processAllBookmarks(bookmarksTree) {
    console.log("bookmarksTree=" + bookmarksTree);
    var extractedBookmarks = extractBookmarks(bookmarksTree);
    console.log("extractedBookmarks=" + extractedBookmarks);
    extractedBookmarks.forEach(function (newBookmarkData) {
        browser.bookmarks.update(newBookmarkData.id, {
            title: newBookmarkData.newTitle,
            url: newBookmarkData.url
        }).then(function(){}, function(error){
            console.log("error " + error);
        });
    });
}

commonlib.extractBookmarks = extractBookmarks;
commonlib.shouldProcessBookmark = shouldProcessBookmark;
commonlib.generateNewBookmarkData = generateNewBookmarkData;
commonlib.runInBackground = runInBackground;
commonlib.processAllBookmarks = processAllBookmarks;