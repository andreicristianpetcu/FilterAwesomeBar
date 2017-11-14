// exports.helloObject = {hello: "world"};
const commonlib = {};

if (window) {
    window.commonlib = commonlib;
}
// if (typeof exports !== 'undefined') {
//     exports.commonlib = commonlib;
// }

const separator = " ::: ";

function extractBookmarks(browserBookmarks, parents) {
    if (typeof parents === 'undefined') {
        parents = []
    }
    var returnedBookmars = [];
    browserBookmarks.forEach(function (browserBookmark) {
        if (shouldProcessBookmark(browserBookmark)) {
            returnedBookmars.push({
                id: browserBookmark.id,
                parents: parents.slice(0),
                url: browserBookmark.url,
                oldTitle: browserBookmark.title
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

function getFolderParts(parents){
    var concatenatedDirectories = "";
    parents.forEach(function (parent) {
        concatenatedDirectories = concatenatedDirectories + "f" + parent.toLowerCase().replace(" ", "") + " ";
    });
    return concatenatedDirectories.substr(0, concatenatedDirectories.length-1); 
}

function getDomainParts(fullUrl){
    const hostname = new URL(fullUrl).hostname;
    const separatedHostnameParts = hostname.split(".").map((old) => {
        return "d" + old + " ";
    }).join("");
    return separatedHostnameParts.substr(0, separatedHostnameParts.length-1);
}

function generateNewBookmarkData(bookmarkData) {
    const originalPageTitle = bookmarkData.oldTitle.split(separator)[0];
    const newTitle = originalPageTitle + separator + getFolderParts(bookmarkData.parents)
            + separator + getDomainParts(bookmarkData.url);
    const newBookmarkData = {
        id: bookmarkData.id,
        newTitle: newTitle,
        url: bookmarkData.url
    }

    return newBookmarkData;
}

function onInstalledListener() {
    return browser.bookmarks.getTree().then(function (bookmarksTree) {
        return commonlib.processAllBookmarks(bookmarksTree);
    });
};

function runInBackground(browser) {
    return browser.runtime.onInstalled.addListener(onInstalledListener);
}

function processAllBookmarks(bookmarksTree) {
    var extractedBookmarks = extractBookmarks(bookmarksTree);
    extractedBookmarks.forEach(function (oldBookmarkData) {
        var newBookmarkData = generateNewBookmarkData(oldBookmarkData);
        browser.bookmarks.update(newBookmarkData.id, {
            title: newBookmarkData.newTitle,
            url: newBookmarkData.url
        }).then(function (updateResult) {
        }, function (error) {
        });
    });
}

commonlib.extractBookmarks = extractBookmarks;
commonlib.shouldProcessBookmark = shouldProcessBookmark;
commonlib.generateNewBookmarkData = generateNewBookmarkData;
commonlib.runInBackground = runInBackground;
commonlib.processAllBookmarks = processAllBookmarks;
commonlib.onInstalledListener = onInstalledListener;
commonlib.separator = separator;