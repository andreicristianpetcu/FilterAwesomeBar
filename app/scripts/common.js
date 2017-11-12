// exports.helloObject = {hello: "world"};
const commonlib = {};

if(window){
    window.commonlib = commonlib;
}
if (typeof exports !== 'undefined') {
    exports.commonlib = commonlib;
}
function extractBookmarks(browserBookmarks){
    var returnedBookmars = [];
    browserBookmarks.forEach(function(browserBookmark) {
        if(browserBookmark.type == 'bookmark'){
            returnedBookmars.push({id: browserBookmark.id});
        } else if (browserBookmark.type == 'folder'){
            const childBookmarks = extractBookmarks(browserBookmark.children);
            Array.prototype.push.apply(returnedBookmars, childBookmarks);
            console.log("childBookmarks=" + childBookmarks);
        }
    }, this);
    return returnedBookmars;
}

commonlib.extractBookmarks = extractBookmarks;