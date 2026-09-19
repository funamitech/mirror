/*!
 * YuruMirror directory listing enhancements: breadcrumbs, file-type icons
 * and page titles for the nginx fancyindex table.
 *
 * Every listing shares one static header/footer (templates/theme/), so
 * Korean listing chrome is a client-side string swap: see KO below.
 *
 * Partially based on nginx-fancyindex-flat-theme, licensed under the GNU
 * General Public License. See the LICENSE file for details.
 *
 * Copyright (C)
 *  2018 Alexander Haase <ahaase@alexhaase.de>
 */
(function() {
  'use strict';

  /* ==================================================================
   * KOREAN LISTING CHROME (translators: edit the VALUES only)
   *
   * Used when the visitor's language is Korean: ?lang= in the URL, else
   * the `lang` cookie set by the language switch, else the browser's
   * navigator.language. English is the default.
   *
   * The values below are still ENGLISH PLACEHOLDERS, copied from the keys.
   * - text: exact text of an element, aria-label or title in the shared
   *   header, nav, footer and table head (keys match the English markup
   *   in templates/theme/ and templates/partials/{nav,footer}.html).
   * - html: whole paragraphs with inline links or icons, keyed by their
   *   English text; the value replaces the paragraph's inner HTML.
   * - js: strings this script builds itself. {n} is a number.
   * ================================================================== */
  var KO = {
    text: {
      // Page chrome (templates/theme/header.html)
      'Browsing — YuruMirror': 'Browsing — YuruMirror',
      'Breadcrumb': 'Breadcrumb',
      'Directory listing': 'Directory listing',
      'Index': 'Index',
      // Table head (written by nginx fancyindex)
      'File Name': 'File Name',
      'File Size': 'File Size',
      'Date': 'Date',
      // Navigation (templates/partials/nav.html)
      'Main': 'Main',
      'Mobile': 'Mobile',
      'Distros': 'Distros',
      'Donate': 'Donate',
      'Source on GitHub': 'Source on GitHub',
      'Toggle color theme': 'Toggle color theme',
      'Menu': 'Menu',
      'Arch Linux for T2 Macs': 'Arch Linux for T2 Macs',
      'EndeavourOS T2 ISOs': 'EndeavourOS T2 ISOs',
      'KOReader nightly': 'KOReader nightly',
      'Back to YuruVerse': 'Back to YuruVerse',
      // Footer (templates/partials/footer.html)
      'Email': 'Email',
      'Remove +SPAM and use real @ and .': 'Remove +SPAM and use real @ and .',
      'Mirrors': 'Mirrors',
      'All repositories →': 'All repositories →',
      'Powered by': 'Powered by',
      'This theme (GPL)': 'This theme (GPL)',
      'Network': 'Network',
      '4 Gbps uplink': '4 Gbps uplink',
      'Seoul, South Korea': 'Seoul, South Korea',
      'Oracle Cloud': 'Oracle Cloud'
    },
    html: {
      'Fast, laid-back package mirrors for Arch-based distros — served from Seoul with love.':
        'Fast, laid-back package mirrors for Arch-based distros — served from Seoul with\n' +
        '<svg class="inline size-3.5 text-accent" aria-hidden="true"><use href="#i-heart"/></svg>' +
        '<span class="sr-only">love</span>.',
      '© 2022–2026 funami.tech YuruVerse. Some Rights Reserved.':
        '© 2022–2026 <a class="footer-link" href="https://funami.tech">funami.tech YuruVerse</a>. Some Rights Reserved.',
      'Proudly participating in the ROKFOSS project.':
        'Proudly participating in the <a class="footer-link" href="https://http.krfoss.org">ROKFOSS project</a>.'
    },
    js: {
      home: 'Home',
      directory: '{n} directory',
      directories: '{n} directories',
      file: '{n} file',
      files: '{n} files',
      empty: 'This directory is empty.',
      titleSuffix: ' — YuruMirror'
    }
  };

  /* English strings this script builds; same keys as KO.js. */
  var EN = {
    home: 'Home',
    directory: '{n} directory',
    directories: '{n} directories',
    file: '{n} file',
    files: '{n} files',
    empty: 'This directory is empty.',
    titleSuffix: ' — YuruMirror'
  };

  /* --------------------------------------------------------- language */

  function detectLang() {
    var m = /[?&]lang=(en|ko)(?:&|$)/.exec(location.search);
    if (m) return m[1];
    m = /(?:^|;\s*)lang=(en|ko)(?:;|$)/.exec(document.cookie);
    if (m) return m[1];
    var nav = (navigator.language || '').toLowerCase();
    return nav === 'ko' || nav.indexOf('ko-') === 0 ? 'ko' : 'en';
  }

  var LANG = detectLang();
  var STR = LANG === 'ko' ? KO.js : EN;

  function t(text) {
    return LANG === 'ko' && Object.prototype.hasOwnProperty.call(KO.text, text) ? KO.text[text] : text;
  }

  function plural(n, one, many) {
    return STR[n === 1 ? one : many].replace('{n}', n);
  }

  var DISTROS = {
    'arch': 'Arch Linux',
    'arcolinux': 'ArcoLinux',
    'artix': 'Artix Linux',
    'blendos': 'blendOS',
    'cachy': 'CachyOS',
    'endeavouros': 'EndeavourOS',
    'endeavouros-t2': 'EndeavourOS T2 ISOs',
    'fyralabs': 'Fyra Labs',
    'arch-mact2': 'Arch Linux for T2 Macs',
    'yurumc': 'YuruMC'
  };

  var ICONS = {
    'text': ['txt', 'md', 'rst', 'log', 'nfo', 'pdf', 'doc', 'docx', 'odt', 'rtf'],
    'shield-check': ['sig', 'asc', 'gpg', 'sha256', 'sha512', 'md5', 'b2'],
    'database': ['db', 'files', 'abs', 'links'],
    'file-image': ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'tif', 'tiff', 'webp', 'avif'],
    'file-music': ['aac', 'aiff', 'flac', 'm4a', 'mp3', 'ogg', 'opus', 'wav'],
    'file-video': ['avi', 'flv', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ogv', 'webm', 'wmv'],
    'file-archive': ['7z', 'apk', 'bz2', 'cab', 'dmg', 'gz', 'jar', 'lz', 'lz4', 'lzma', 'mrpack',
      'pkg', 'rar', 'tar', 'tbz2', 'tgz', 'txz', 'xz', 'zip', 'zst'],
    'disc': ['iso', 'img', 'qcow2', 'raw'],
    'file-code': ['c', 'cpp', 'cs', 'h', 'hpp', 'java', 'js', 'json', 'py', 'rs', 'sh', 'swift',
      'toml', 'xml', 'yaml', 'yml']
  };

  var EXT_ICON = {};
  Object.keys(ICONS).forEach(function(iconName) {
    ICONS[iconName].forEach(function(ext) {
      EXT_ICON[ext] = iconName === 'text' ? 'file-text' : iconName;
    });
  });

  /* Row icons are CSS masks keyed by a class (see input.css): adding one
   * class per row is far cheaper than inserting an inline <svg><use> pair
   * per row, which dominated load time on 16k-file pool/ directories. */
  function iconClass(href) {
    var dot = href.lastIndexOf('.');
    if (dot < 0 || dot < href.lastIndexOf('/')) return 'icon-file';
    return 'icon-' + (EXT_ICON[href.slice(dot + 1).toLowerCase()] || 'file');
  }

  /** Path segments of the current directory, decoded. */
  function segments() {
    return location.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
      .map(decodeURIComponent);
  }

  function displayName(segment, index) {
    return index === 0 && DISTROS[segment] ? t(DISTROS[segment]) : segment;
  }

  /* -------------------------------------------------------- breadcrumbs */

  function renderBreadcrumbs() {
    var list = document.getElementById('breadcrumbs');
    if (!list) return;

    var parts = segments();
    var crumbs = [{ label: '~', href: LANG === 'ko' ? '/ko/' : '/', title: STR.home }];
    var path = '';
    parts.forEach(function(part, i) {
      path += '/' + encodeURIComponent(part);
      crumbs.push({ label: displayName(part, i), href: path + '/' });
    });

    var fragment = document.createDocumentFragment();
    crumbs.forEach(function(crumb, i) {
      var item = document.createElement('li');
      var last = i === crumbs.length - 1;
      if (last) {
        item.setAttribute('aria-current', 'page');
        item.textContent = crumb.label;
      } else {
        var link = document.createElement('a');
        link.href = crumb.href;
        link.textContent = crumb.label;
        if (crumb.title) link.setAttribute('aria-label', crumb.title);
        item.appendChild(link);
      }
      fragment.appendChild(item);
    });
    list.appendChild(fragment);

    // Keep the deepest crumb in view — but only after the browser has
    // laid the page out anyway: reading scrollWidth right here would
    // force a synchronous layout of thousands of still-dirty table rows.
    var scrollToEnd = function() { list.scrollLeft = list.scrollWidth; };
    if (window.requestAnimationFrame) requestAnimationFrame(scrollToEnd);
    else scrollToEnd();
  }

  /* --------------------------------------------------------- file table */

  function enhanceTable() {
    var list = document.getElementById('list');
    if (!list) return;

    list.removeAttribute('cellpadding');
    list.removeAttribute('cellspacing');
    var ths = list.querySelectorAll('th');
    for (var i = 0; i < ths.length; i++) ths[i].removeAttribute('style');

    var dirs = 0;
    var files = 0;
    var body = list.tBodies[0];

    if (body) {
      // Snapshot the live rows collection first: the className writes
      // below invalidate HTMLCollection caches, so indexing into the live
      // collection would turn this loop O(n²).
      var rows = Array.prototype.slice.call(body.rows);
      var parentRow = null;
      for (var r = 0, n = rows.length; r < n; r++) {
        var cell = rows[r].cells[0];
        var link = cell && cell.firstElementChild;
        if (!link || link.tagName !== 'A') {
          link = cell && cell.querySelector('a');
          if (!link) continue;
        }

        var href = link.getAttribute('href') || '';
        if (href.lastIndexOf('../', 0) === 0) {
          parentRow = rows[r]; // covered by the breadcrumbs
          continue;
        }

        if (href.charAt(href.length - 1) === '/') {
          dirs++;
          link.className = 'entry-link is-dir icon-folder';
        } else {
          files++;
          link.className = 'entry-link ' + iconClass(href);
        }
      }
      if (parentRow) parentRow.remove();
    }

    var count = document.getElementById('entry-count');
    if (count) {
      var parts = [];
      if (dirs) parts.push(plural(dirs, 'directory', 'directories'));
      if (files) parts.push(plural(files, 'file', 'files'));
      count.textContent = parts.join(' · ');
    }

    if (!dirs && !files) {
      list.hidden = true;
      var empty = document.createElement('p');
      empty.className = 'px-5 py-10 text-center text-sm text-faint';
      empty.textContent = STR.empty;
      list.parentElement.appendChild(empty);
    }
  }

  /* -------------------------------------------------------------- title */

  function updateTitles() {
    var parts = segments();
    if (!parts.length) return;

    var distro = DISTROS[parts[0]] && t(DISTROS[parts[0]]);
    var current = displayName(parts[parts.length - 1], parts.length - 1);

    var heading = document.getElementById('directory-title');
    if (heading) heading.textContent = current;

    document.title = distro && parts.length > 1 ?
      current + ' · ' + distro + STR.titleSuffix :
      current + STR.titleSuffix;
  }

  /* ----------------------------------------------------- Korean chrome */

  var LINKS_KO = { '/': '/ko/', '/donate.html': '/ko/donate.html', '/#mirrors': '/ko/#mirrors' };

  function collapse(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  /** Swap the shared English chrome for KO. The file table body is skipped:
   * it can hold thousands of rows and has no chrome in it. */
  function translateChrome() {
    if (LANG !== 'ko') return;
    document.documentElement.lang = 'ko';
    if (document.title) document.title = t(document.title);

    var scopes = document.querySelectorAll('body > header, main > nav, main section > header, #list thead, body > footer');
    Array.prototype.forEach.call(scopes, function(scope) {
      // Paragraphs with inline markup first, whole
      Array.prototype.forEach.call(scope.querySelectorAll('p'), function(p) {
        var key = collapse(p.textContent);
        if (Object.prototype.hasOwnProperty.call(KO.html, key)) p.innerHTML = KO.html[key];
      });

      var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      for (var node = walker.nextNode(); node; node = walker.nextNode()) {
        var text = collapse(node.nodeValue);
        if (text && text !== t(text)) node.nodeValue = node.nodeValue.replace(/\S[\s\S]*\S|\S/, t(text));
      }

      Array.prototype.forEach.call(scope.querySelectorAll('[aria-label], [title], a[href]'), function(el) {
        ['aria-label', 'title'].forEach(function(attr) {
          var value = el.getAttribute(attr);
          if (value) el.setAttribute(attr, t(value));
        });
        var href = el.getAttribute('href');
        if (el.tagName === 'A' && Object.prototype.hasOwnProperty.call(LINKS_KO, href)) el.setAttribute('href', LINKS_KO[href]);
      });
      if (scope.hasAttribute('aria-label')) scope.setAttribute('aria-label', t(scope.getAttribute('aria-label')));
    });

    // The switch now leads back to English (the labels are final, not placeholders)
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang-switch]'), function(link) {
      link.setAttribute('href', '?lang=en');
      link.setAttribute('hreflang', 'en');
      link.setAttribute('lang', 'en');
      var label = link.querySelector('[data-lang-label]');
      var hint = link.querySelector('[data-lang-hint]');
      if (label) label.textContent = 'English';
      if (hint) {
        hint.textContent = ' (영어)';
        hint.setAttribute('lang', 'ko');
      }
    });
  }

  translateChrome();
  renderBreadcrumbs();
  enhanceTable();
  updateTitles();
})();
