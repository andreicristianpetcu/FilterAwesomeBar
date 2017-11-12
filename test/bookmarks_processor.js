

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

    it("and so is a spec", function () {
        var extractedBookmarks = commonlib.extractBookmarks(twoBookmarks);

        expect(extractedBookmarks.length).toBe(2);
    });
});