/**
 * RISE API Documentation — Client-side Search
 */

(function () {
  'use strict';

  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) return;

  let searchIndex = [];
  let searchTimeout = null;

  // Load search index
  fetch('assets/search-index.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      searchIndex = data;
    })
    .catch(function () {
      // Silently fail — search just won't work
    });

  // Fuzzy search helper
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
      var match = fuzzyMatch(item.title, lowerQuery) ||
                  fuzzyMatch(item.path, lowerQuery) ||
                  fuzzyMatch(item.description, lowerQuery) ||
                  fuzzyMatch(item.module, lowerQuery);
      if (match) {
        results.push(item);
        if (results.length >= 20) break;
      }
    }

    renderResults(results, query);
  }

  function renderResults(results, query) {
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
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
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

  // Close search on click outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-search')) {
      searchResults.classList.add('hidden');
    }
  });

  // ── Theme toggle ──

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    var savedTheme = localStorage.getItem('rise-api-theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '&#9788;';
    }

    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      if (current === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('rise-api-theme', 'light');
        themeToggle.innerHTML = '&#9790;';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('rise-api-theme', 'dark');
        themeToggle.innerHTML = '&#9788;';
      }
    });
  }

  // ── Mobile menu toggle ──

  var menuBtn = document.getElementById('menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      document.querySelector('.nav-links').classList.toggle('open');
    });
  }

})();
