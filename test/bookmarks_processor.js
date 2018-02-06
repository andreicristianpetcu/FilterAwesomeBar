

describe("Bookmarks processor", function () {
    var twoBookmarks = [
        {
            "id": "root________",
            "title": "",
            "index": 0,
            "dateAdded": 1479429737223,
            "type": "folder",
            "dateGroupModified": 1510400958433,
            "children": [
                {
                    "id": "menu________",
                    "title": "Bookmarks Menu",
                    "index": 0,
                    "dateAdded": 1479429737223,
                    "type": "folder",
                    "parentId": "root________",
                    "dateGroupModified": 1510400835461,
                    "children": [
                        {
                            "id": "BfDj-W-s4IrU",
                            "title": "Recent Tags",
                            "index": 0,
                            "dateAdded": 1479429737579,
                            "type": "bookmark",
                            "url": "place:type=6&sort=14&maxResults=10",
                            "parentId": "menu________"
                        },
                        {
                            "id": "911aHQ39pizY",
                            "title": "Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch",
                            "index": 1,
                            "dateAdded": 1494163621320,
                            "type": "bookmark",
                            "url": "http://www.activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica",
                            "parentId": "menu________"
                        }
                    ]
                }
            ]
        }
    ];

    var bookmarkData;
    var separator = " ::: ";
    beforeEach(function () {
        bookmarkData = {
            id: "911aHQ39pizY",
            oldTitle: "Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch",
            parents: [
                "root",
                "Bookmarks Menu"
            ],
            url: "http://www.activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica"
        };
        window.browser = chrome;
    });

    afterEach(function () {
        chrome.flush();
    });

    it("should return leaf items", function () {
        var extractedBookmarks = window.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks.length).toBe(1);
    });

    it("should have correct fields", function () {
        var extractedBookmarks = window.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks[0].id).toBe('911aHQ39pizY');
    });

    it("should not process 'place:' bookmarks", function () {
        var shouldProccess = window.shouldProcessBookmark({
            "url": "place:type=6&sort=14&maxResults=10"
        });

        expect(shouldProccess).toBe(false);
    });

    it("should not process 'place:' bookmarks", function () {
        var extractedBookmarks = window.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks[0].parents).toEqual(['root', 'Bookmarks Menu']);
    });

    it("generate a new title containing the folders", function () {
        var newBookmarkData = window.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(' ::: ')[0]).toEqual('Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch');
        expect(newBookmarkData.newTitle.split(' ::: ')[1]).toEqual('froot fbookmarksmenu');
        expect(newBookmarkData.id).toEqual('911aHQ39pizY');
        expect(newBookmarkData.url).toEqual('http://www.activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica');
    });

    it("generate a new title containing the folders even if it was generated before", function () {
        bookmarkData.oldTitle = bookmarkData.oldTitle + " ::: root bookmarksmenu";
        var newBookmarkData = window.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(bookmarkData.oldTitle).length).toEqual(1);
    });

    it("generate a new title containing the domain parts", function () {
        var newBookmarkData = window.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(' ::: ')[2]).toEqual('dwww dactivewatch dro');
    });

    it("generate a new title containing the url path parts", function () {
        var newBookmarkData = window.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(' ::: ')[3]).toEqual('pro pfreeex preactierapida pcenzuradordelaexcelsioroexecutiepolitica');
    });

    it("runInBackground should register onInstall listener", function () {
        window.runInBackground();

        expect(browser.runtime.onInstalled.addListener.withArgs(window.processAllBookmarks).calledOnce).toBeTruthy();
    });

    it("runInBackground should register context menu", function () {
        window.runInBackground();

        expect(browser.contextMenus.create.withArgs({
            id: "processAllBookmarks",
            title: "Filter AwesomeBar run!",
            contexts: ["all"]
        }).calledOnce).toBeTruthy();
        expect(browser.contextMenus.onClicked.addListener.withArgs(onClickedListener).calledOnce).toBeTruthy();
    });

    it("runInBackground should update and moved listeners", function () {
        runInBackground();

        expect(browser.bookmarks.onCreated.addListener.withArgs(fetchAndReprocessBookmark).calledOnce).toBeTruthy();
        expect(browser.bookmarks.onMoved.addListener.withArgs(fetchAndReprocessBookmark).calledOnce).toBeTruthy();
    })
});
