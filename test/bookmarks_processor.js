

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
                            "url": "http://activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica",
                            "parentId": "menu________"
                        }
                    ]
                }
            ]
        }
    ];

    var browserSpy;
    var commonlibSpy;
    beforeEach(function () {
        browserSpy = {
            runtime: {
                onInstalled: {
                    addListener: sinon.spy()
                }
            },
            bookmarks: {
                getTree: sinon.stub(),
                update: sinon.spy()
            }
        };
    });
    afterEach(function () {
        // browserSpy.runtime.onInstalled.addListener.restore();
        // browserSpy.bookmarks.getTree.restore();
        // browserSpy.bookmarks.update.restore();
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
        var newBookmarkData = commonlib.generateNewBookmarkData({
            id: "911aHQ39pizY",
            oldTitle: "Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch",
            parents: [
                "root",
                "Bookmarks Menu"
            ],
            url: "http://activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica"
        });

        expect(newBookmarkData.newTitle).toEqual('Cenzura DoR de la Excelsior - o execuție politică - ActiveWatch ::: root bookmarksmenu');
        expect(newBookmarkData.id).toEqual('911aHQ39pizY');
        expect(newBookmarkData.url).toEqual('http://activewatch.ro/ro/freeex/reactie-rapida/cenzura-dor-de-la-excelsior-o-executie-politica');
    });

    it("should register onInstall when runInBackground", function () {
        commonlib.runInBackground(browserSpy);

        expect(browserSpy.runtime.onInstalled.addListener.called).toBeTruthy();
    });

    fit("should processAllBookmarks when runInBackground is called", function () {
        const dummyBookmarksTree = [{}];
        var promise = new Promise(function (resolve, reject) {
            resolve(dummyBookmarksTree);
        });
        browserSpy.bookmarks.getTree.returns(promise);

        var commonlibSpy = sinon.spy(commonlib, 'processAllBookmarks');
        commonlib.runInBackground(browserSpy);
        var listenerFunction = browserSpy.runtime.onInstalled.addListener.getCalls()[0].args[0];

        listenerFunction();

        expect(commonlibSpy.called).toBeTruthy();
    });

    xit("should process the tree and update the bookmarks when processAllBookmarks", function () {
        var bookmarkData = {
            id: 'bookmark_id',
            newTitle: 'my title ::: root'
        };
        var commonlibSpy = sinon.stub(commonlib, 'extractBookmarks');
        var promise = new Promise();
        promise.resolve([bookmarkData]);
        commonlibSpy.returns(promise);
        var dummyBookmarkTree = [{ name: "the tree" }];

        commonlib.processAllBookmarks(dummyBookmarkTree);

        commonlibSpy.calledWith();
        expect(browserSpy.bookmarks.update.calledWith(bookmarkData.id, {
            title: 'my title ::: root'
        })).toBeTruthy();
    });

});
