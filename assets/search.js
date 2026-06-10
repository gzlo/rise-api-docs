/**
 * RISE API Documentation — Client-side Search & Theme
 */
(function () {
  'use strict';

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) return;

  var searchIndex = [];
  var searchTimeout = null;

  fetch('/assets/search-index.json')
    .then(function (r) { return r.json(); })
    .then(function (data) { searchIndex = data; })
    .catch(function () {});

  function fuzzyMatch(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();
    var ti = 0;
    for (var qi = 0; qi < query.length; qi++) {
      var found = text.indexOf(query[qi], ti);
      if (found === -1) return false;
      ti = found + 1;
    }
    return true;
  }

  function performSearch(query) {
    if (!query || query.length < 2 || searchIndex.length === 0) {
      searchResults.classList.add('hidden');
      return;
    }

    var results = [];
    var lowerQuery = query.toLowerCase();

    for (var i = 0; i < searchIndex.length; i++) {
      var item = searchIndex[i];
      if (fuzzyMatch(item.title, lowerQuery) ||
          fuzzyMatch(item.path, lowerQuery) ||
          fuzzyMatch(item.description, lowerQuery) ||
          fuzzyMatch(item.module, lowerQuery)) {
        results.push(item);
        if (results.length >= 20) break;
      }
    }

    renderResults(results);
  }

  function renderResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">No endpoints found</div>';
      searchResults.classList.remove('hidden');
      return;
    }

    var html = '';
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      html += '<a href="' + r.url + '" class="search-result-item">' +
        '<div class="result-title"><span class="method-badge method-' + r.verb.toLowerCase() + '">' + r.verb + '</span> ' +
        escapeHtml(r.title) + '</div>' +
        '<div class="result-desc">' + escapeHtml(r.description) + '</div>' +
        '</a>';
    }
    searchResults.innerHTML = html;
    searchResults.classList.remove('hidden');
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(text));
    return d.innerHTML;
  }

  searchInput.addEventListener('input', function () {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      performSearch(searchInput.value.trim());
    }, 200);
  });

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      searchInput.blur();
    }
    if (e.key === 'Enter') {
      var first = searchResults.querySelector('.search-result-item');
      if (first) window.location.href = first.getAttribute('href');
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.sidebar-search')) {
      searchResults.classList.add('hidden');
    }
  });

  // ── Theme toggle ──

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    var saved = localStorage.getItem('rise-api-docs-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '&#9790; Dark';
    } else {
      themeToggle.innerHTML = '&#9788; Light';
    }

    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('rise-api-docs-theme', 'dark');
        themeToggle.innerHTML = '&#9788; Light';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('rise-api-docs-theme', 'light');
        themeToggle.innerHTML = '&#9790; Dark';
      }
    });
  }

  // ── Mobile sidebar toggle ──

  var sidebarToggle = document.getElementById('sidebar-toggle');
  var sidebar = document.getElementById('sidebar');
  var sidebarOverlay = document.getElementById('sidebar-overlay');

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.style.display = 'none';
  }

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      if (sidebarOverlay) sidebarOverlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    });

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });
  }

  // Close search on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      searchInput.blur();
    }
  });
})();
