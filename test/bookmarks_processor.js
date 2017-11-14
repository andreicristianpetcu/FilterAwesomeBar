

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

    var commonlibSpy;
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
        var browser = {
            runtime: {
                onInstalled: {
                    addListener: sinon.stub()
                }
            },
            bookmarks: {
                getTree: sinon.stub(),
                update: sinon.stub()
            }
        };
        window.browser = browser;
    });
    afterEach(function () {
        if (commonlibSpy) {
            commonlibSpy.restore();
        }
    });

    it("should return leaf items", function () {
        var extractedBookmarks = commonlib.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks.length).toBe(1);
    });

    it("should have correct fields", function () {
        var extractedBookmarks = commonlib.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks[0].id).toBe('911aHQ39pizY');
    });

    it("should not process 'place:' bookmarks", function () {
        var shouldProccess = commonlib.shouldProcessBookmark({
            "url": "place:type=6&sort=14&maxResults=10"
        });

        expect(shouldProccess).toBe(false);
    });

    it("should not process 'place:' bookmarks", function () {
        var extractedBookmarks = commonlib.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks[0].parents).toEqual(['root', 'Bookmarks Menu']);
    });

    it("generate a new title containing the folders", function () {
        var newBookmarkData = commonlib.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(' ::: ')[0]).toEqual('Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch');
        expect(newBookmarkData.newTitle.split(' ::: ')[1]).toEqual('froot fbookmarksmenu');
        expect(newBookmarkData.id).toEqual('911aHQ39pizY');
        expect(newBookmarkData.url).toEqual('http://www.activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica');
    });

    it("generate a new title containing the folders even if it was generated before", function () {
        bookmarkData.oldTitle = bookmarkData.oldTitle + " ::: root bookmarksmenu";
        var newBookmarkData = commonlib.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(bookmarkData.oldTitle).length).toEqual(1);
    });

    it("generate a new title containing the domain parts", function () {
        var newBookmarkData = commonlib.generateNewBookmarkData(bookmarkData);

        expect(newBookmarkData.newTitle.split(' ::: ')[2]).toEqual('dwww dactivewatch dro');
        expect(newBookmarkData.id).toEqual('911aHQ39pizY');
        expect(newBookmarkData.url).toEqual('http://www.activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica');
    });

    it("should register onInstall when runInBackground", function () {
        commonlib.runInBackground(browser);

        expect(browser.runtime.onInstalled.addListener.calledWith(commonlib.onInstalledListener)).toBeTruthy();
    });
    
});
