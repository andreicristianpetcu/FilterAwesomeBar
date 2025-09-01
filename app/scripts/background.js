// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import './common.js';

let bookmarkCache = [];
let reverting = false;

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  processAllBookmarks();
  updateBookmarkCache();
});

// Handle browser action clicks (toggle bookmark suffixes)
chrome.action.onClicked.addListener(() => {
  revertBookmarks();
});

// Handle bookmark changes
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  fetchAndReprocessBookmark(id);
  updateBookmarkCache();
});

chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
  fetchAndReprocessBookmark(id);
  updateBookmarkCache();
});

chrome.bookmarks.onChanged.addListener((id, changeInfo) => {
  fetchAndReprocessBookmark(id);
  updateBookmarkCache();
});

chrome.bookmarks.onRemoved.addListener(() => {
  updateBookmarkCache();
});

// Omnibox functionality
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  const suggestions = searchBookmarks(text);
  const searchType = getSearchTypeEmoji(text);
  suggest(suggestions.map(bookmark => ({
    content: bookmark.url,
    description: `${searchType} ${formatBookmarkForDisplay(bookmark.title)} - ${bookmark.url}`
  })));
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  // If text is a URL, navigate to it
  if (text.startsWith('http://') || text.startsWith('https://')) {
    navigateToUrl(text, disposition);
    return;
  }
  
  // Otherwise, search bookmarks and navigate to first match
  const results = searchBookmarks(text);
  if (results.length > 0) {
    navigateToUrl(results[0].url, disposition);
  }
});

function navigateToUrl(url, disposition) {
  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url: url });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url: url });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url: url, active: false });
      break;
  }
}

function formatBookmarkForDisplay(title) {
  // Extract the original title and folder information from the suffix
  const parts = title.split(separator);
  if (parts.length < 2) {
    return title; // No suffix, return as-is
  }
  
  const originalTitle = parts[0];
  const suffixPart = parts[1];
  
  // Extract folder parts (they start with 'f')
  const folderMatches = suffixPart.match(/f[a-zA-Z0-9]+/g);
  const folders = folderMatches ? folderMatches.map(f => f.substring(1)) : [];
  
  // Build hierarchical path: Parent / Child / Bookmark
  if (folders.length > 0) {
    return `${folders.join(' / ')} / ${originalTitle}`;
  }
  
  return originalTitle;
}

function getSearchTypeEmoji(query) {
  const queryLower = query.toLowerCase();
  
  // Folder search: ffedora
  if (queryLower.startsWith('f') && queryLower.length > 1) {
    return '📂';
  }
  
  // Domain search: dfedora  
  if (queryLower.startsWith('d') && queryLower.length > 1) {
    return '🌐';
  }
  
  // Path search: pgithub
  if (queryLower.startsWith('p') && queryLower.length > 1) {
    return '🛤️';
  }
  
  // Default search (title + URL)
  return '🔍';
}

function searchBookmarks(query) {
  if (!query || query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  
  // Check for prefix-based search (f/d/p)
  if (queryLower.startsWith('f') && queryLower.length > 1) {
    // Search folders: ffedora
    const folderQuery = queryLower.substring(1);
    return bookmarkCache
      .filter(bookmark => {
        const titleLower = bookmark.title.toLowerCase();
        return titleLower.includes(`f${folderQuery}`);
      })
      .slice(0, 12);
  }
  
  if (queryLower.startsWith('d') && queryLower.length > 1) {
    // Search domains: dfedora
    const domainQuery = queryLower.substring(1);
    return bookmarkCache
      .filter(bookmark => {
        const titleLower = bookmark.title.toLowerCase();
        return titleLower.includes(`d${domainQuery}`);
      })
      .slice(0, 12);
  }
  
  if (queryLower.startsWith('p') && queryLower.length > 1) {
    // Search paths: pfedora
    const pathQuery = queryLower.substring(1);
    return bookmarkCache
      .filter(bookmark => {
        const titleLower = bookmark.title.toLowerCase();
        return titleLower.includes(`p${pathQuery}`);
      })
      .slice(0, 12);
  }
  
  // Default: search title and URL
  return bookmarkCache
    .filter(bookmark => {
      const titleLower = bookmark.title.toLowerCase();
      const urlLower = bookmark.url.toLowerCase();
      return titleLower.includes(queryLower) || urlLower.includes(queryLower);
    })
    .slice(0, 12); // Limit to 12 suggestions
}

function updateBookmarkCache() {
  chrome.bookmarks.getTree().then(tree => {
    bookmarkCache = extractAllBookmarks(tree);
  });
}

function extractAllBookmarks(bookmarksTree) {
  const bookmarks = [];
  
  function traverse(items) {
    items.forEach(item => {
      if (item.url && shouldProcessBookmark(item)) {
        bookmarks.push({
          id: item.id,
          title: item.title,
          url: item.url
        });
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  }
  
  traverse(bookmarksTree);
  return bookmarks;
}

// Legacy functions adapted for manifest v3
function fetchAndReprocessBookmark(bookmarkId) {
  if (reverting === false) {
    chrome.bookmarks.getSubTree(bookmarkId).then(foundBookmarks => {
      const foundBookmark = foundBookmarks[0];
      if (foundBookmark.type !== 'folder') {
        crawlParentTitles(foundBookmark.parentId).then(parents => {
          foundBookmark.parents = parents;
          foundBookmark.oldTitle = foundBookmark.title;
          reprocessBookmark(foundBookmark);
        });
      } else {
        processBookmarksTreeBookmarks(foundBookmarks);
      }
    });
  }
}

function processAllBookmarks() {
  return chrome.bookmarks.getTree().then(bookmarksTree => {
    return processBookmarksTreeBookmarks(bookmarksTree);
  });
}

function processBookmarksTreeBookmarks(bookmarksTree) {
  const extractedBookmarks = extractBookmarks(bookmarksTree);
  extractedBookmarks.forEach(oldBookmarkData => {
    reprocessBookmark(oldBookmarkData);
  });
}

function reprocessBookmark(oldBookmarkData) {
  const newBookmarkData = generateNewBookmarkData(oldBookmarkData);
  if (oldBookmarkData.oldTitle !== newBookmarkData.newTitle && !newBookmarkData.newTitle.startsWith(separator)) {
    chrome.bookmarks.update(newBookmarkData.id, {
      title: newBookmarkData.newTitle
    });
  }
}

function revertBookmarks() {
  reverting = !reverting;
  if (reverting) {
    chrome.bookmarks.getTree().then(bookmarksTree => {
      const allBookmarksList = getBookmarksTreeAsList(bookmarksTree);
      allBookmarksList.forEach(bookmark => {
        chrome.bookmarks.update(bookmark.id, {
          title: bookmark.title.split(separator)[0]
        });
      });
    });
  } else {
    processAllBookmarks();
  }
}

function getBookmarksTreeAsList(bookmarksTree) {
  const bookmarksList = [];
  bookmarksTree.forEach(bookmark => {
    bookmarksList.push(bookmark);
    if (typeof bookmark.children !== 'undefined') {
      bookmarksList.push.apply(bookmarksList, getBookmarksTreeAsList(bookmark.children));
    }
  });
  return bookmarksList;
}

function crawlParentTitles(parentId, previousParents) {
  if (typeof parentId === 'undefined' || typeof previousParents === 'undefined') {
    previousParents = [];
  }
  return chrome.bookmarks.get(parentId).then(foundBookmarks => {
    const foundBookmark = foundBookmarks[0];
    const bookmarkTitle = getBookmarkTitle(foundBookmark);
    if (bookmarkTitle !== '') {
      previousParents.push(bookmarkTitle);
    }
    if (typeof foundBookmark.parentId === 'undefined') {
      return Promise.resolve(previousParents.reverse());
    } else {
      return crawlParentTitles(foundBookmark.parentId, previousParents);
    }
  });
}