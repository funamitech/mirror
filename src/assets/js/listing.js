/*!
 * YuruMirror directory listing enhancements: breadcrumbs, file-type icons
 * and page titles for the nginx fancyindex table.
 *
 * Partially based on nginx-fancyindex-flat-theme, licensed under the GNU
 * General Public License. See the LICENSE file for details.
 *
 * Copyright (C)
 *  2018 Alexander Haase <ahaase@alexhaase.de>
 */
(function() {
  'use strict';

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
    return index === 0 && DISTROS[segment] ? DISTROS[segment] : segment;
  }

  /* -------------------------------------------------------- breadcrumbs */

  function renderBreadcrumbs() {
    var list = document.getElementById('breadcrumbs');
    if (!list) return;

    var parts = segments();
    var crumbs = [{ label: '~', href: '/', title: 'Home' }];
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
      if (dirs) parts.push(dirs + (dirs === 1 ? ' directory' : ' directories'));
      if (files) parts.push(files + (files === 1 ? ' file' : ' files'));
      count.textContent = parts.join(' · ');
    }

    if (!dirs && !files) {
      list.hidden = true;
      var empty = document.createElement('p');
      empty.className = 'px-5 py-10 text-center text-sm text-faint';
      empty.textContent = 'This directory is empty.';
      list.parentElement.appendChild(empty);
    }
  }

  /* -------------------------------------------------------------- title */

  function updateTitles() {
    var parts = segments();
    if (!parts.length) return;

    var distro = DISTROS[parts[0]];
    var current = displayName(parts[parts.length - 1], parts.length - 1);

    var heading = document.getElementById('directory-title');
    if (heading) heading.textContent = current;

    document.title = distro && parts.length > 1 ?
      current + ' · ' + distro + ' — YuruMirror' :
      current + ' — YuruMirror';
  }

  renderBreadcrumbs();
  enhanceTable();
  updateTitles();
})();
