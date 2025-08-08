/* This file is part of nginx-fancyindex-flat-theme.
 *
 * nginx-fancyindex-flat-theme is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * nginx-fancyindex-flat-theme is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
 * Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see
 *
 *  http://www.gnu.org/licenses/
 *
 *
 * Copyright (C)
 *  2018 Alexander Haase <ahaase@alexhaase.de>
 *
 *
 * NOTE: The following comment will be used as short version of the copyright
 *       notice above to be included in compressed files, too.
 */

/*!
 *
 * This file is part of the nginx-fancyindex-flat-theme, licensed under the GNU
 * General Public License. See the LICENSE file for details.
 *
 * Copyright (C)
 *  2018 Alexander Haase <ahaase@alexhaase.de>
 */

/**
 * Apply the styling of the directory listing table.
 *
 * The default directory listing table can be styled only basically via CSS.
 * This function will apply additional styles to it and adds an extra column for
 * icons.
 * 
 * Called from HTML pages
 */
function generateList() { // eslint-disable-line no-unused-vars
  /**
   * Get the filetype of a specific file based on the file extension.
   *
   * @param {string} filename - the filename to be checked
   * @return {string} the file's filetype
   */
  function getFileType(filename) {
    /* First, check if the file is a directory (i.e. has a trailing slash). */
    if (filename.endsWith('/')) {
      return 'folder';
    }

    /* For all other kinds of files, check the file extension (converted to
     * lower case to ignore the extension's case). */
    switch (filename.split('.').pop().toLowerCase()) {
    case 'txt':
      return 'text';

    case 'pdf':
      return 'pdf';

    case 'bmp':
    case 'gif':
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'tif':
    case 'tiff':
      return 'image';

    case 'aac':
    case 'aiff':
    case 'm4a':
    case 'mp3':
    case 'ogg':
    case 'opus':
    case 'wav':
      return 'audio';

    case 'amv':
    case 'avi':
    case 'flv':
    case 'm4v':
    case 'mkv':
    case 'mov':
    case 'mp4':
    case 'm4p':
    case 'mpeg':
    case 'mpg':
    case 'ogv':
    case 'vob':
    case 'webm':
    case 'wmv':
      return 'video';

    case '7z':
    case 'a':
    case 'apk':
    case 'ar':
    case 'bin':
    case 'bz2':
    case 'cab':
    case 'dmg':
    case 'gz':
    case 'iso':
    case 'jar':
    case 'lz':
    case 'lzma':
    case 'lzo':
    case 'pak':
    case 'partimg':
    case 'rar':
    case 's7z':
    case 'tar':
    case 'tbz2':
    case 'tgz':
    case 'tlz':
    case 'txz':
    case 'xz':
    case 'zip':
    case 'zst':
      return 'archive';

    case 'doc':
    case 'docx':
    case 'odt':
    case 'rtf':
      return 'word';

    case 'csv':
    case 'ods':
    case 'xls':
    case 'xlsx':
      return 'excel';

    case 'odp':
    case 'ppt':
    case 'pptx':
      return 'powerpoint';

    case 'c':
    case 'class':
    case 'cpp':
    case 'cs':
    case 'h':
    case 'hpp':
    case 'hxx':
    case 'java':
    case 'py':
    case 'sh':
    case 'swift':
    case 'vb':
      return 'code';

    default:
      return 'file';
    }
  }

  /**
   * Get the font awesome icon to be used for a specific filetype.
   *
   * @param {string} filetype - the filetype for which an icon is required
   * @return {string} the HTML icon tag to be used
   */
  function getIcon(filetype) {
    /**
     * Get the font awesome class of the icon to be used.
     *
     * @param {string} filetype - the filetype for which an icon is required
     * @return {string} the icon class to be used
     */
    function getFontAwesomeClass(filetype) {
      switch (filetype) {
      case 'folder':
        return 'fa-folder';

      case 'archive':
        return 'fa-file-zipper';
      case 'audio':
        return 'fa-file-audio';
      case 'code':
        return 'fa-file-code';
      case 'excel':
        return 'fa-file-excel';
      case 'image':
        return 'fa-file-image';
      case 'pdf':
        return 'fa-file-pdf';
      case 'powerpoint':
        return 'fa-file-powerpoint';
      case 'text':
        return 'fa-file-lines';
      case 'video':
        return 'fa-file-video';
      case 'word':
        return 'fa-file-word';
          
        /* If none of the previous types matched, use a generic file icon. */
      default:
        return 'fa-file';
      }
    }

    /* Return the file icon HTML tag to be used for the file passed to this
     * function. */
    return '<i class="fa fa-fw ' + getFontAwesomeClass(filetype) +
           '" aria-hidden="true"></i>';
  }

  const list = document.getElementById('list');

  /* Remove the default style attributes and add modern table styling classes.
   * Text will not be wrapped by default, except for long filenames which
   * use the 'filename' class. */
  list.removeAttribute('cellpadding');
  list.removeAttribute('cellspacing');
  list.classList.add('table', 'table-sm', 'table-hover', 'text-nowrap');

  /* Hide table header on mobile devices since file size and last-modified
   * columns are hidden, leaving only the filename column visible. */
  list.tHead.children[0].classList.add('d-none', 'd-md-table-row');

  /* If we're in a subdirectory, remove the 'Parent Directory' row, as the
   * navigation is covered by the breadcrumbs. */
  if (window.location.pathname !== '/') {
    // More careful parent directory removal - look for specific parent directory indicators
    for (let i = 1; i < list.rows.length; i++) {
      const row = list.rows[i];
      if (row.cells && row.cells.length > 0) {
        const cell = row.cells[0];
        const link = cell.querySelector('a');
        if (link && (link.getAttribute('href') === '../' || 
                     link.textContent.trim() === 'Parent Directory' || 
                     link.textContent.trim() === '../')) {
          list.deleteRow(i);
          break;
        }
      }
    }
  }

  /* Check if icons already exist (nginx might be generating them) */
  let hasExistingIcons = false;
  if (list.rows.length > 0 && list.rows[0].cells.length > 0) {
    // Check if first cell contains an icon or if it's very narrow (indicating icon column)
    const firstCell = list.rows[0].cells[0];
    if (firstCell && (firstCell.querySelector('img') || 
                      firstCell.querySelector('i') || 
                      firstCell.offsetWidth < 50)) {
      hasExistingIcons = true;
    }
  }

  /* Iterate over all rows (including the thead) to add individual classes for
   * each cell or adding new cells. */
  for (let i = 0; i < list.rows.length; i++) {
    const row = list.rows[i];
    let filetype = '';

    /* Add a new cell for the file-type icon only if icons don't already exist */
    if (!hasExistingIcons) {
      // Check if the first cell exists and has children before accessing innerHTML
      if (row.cells[0] && row.cells[0].children && row.cells[0].children[0]) {
        filetype = getFileType(row.cells[0].children[0].innerHTML);
      } else if (row.cells[0] && row.cells[0].textContent) {
        // Fallback: use textContent if no children found
        filetype = getFileType(row.cells[0].textContent.trim());
      }
      
      row.insertCell(0).innerHTML = (i > 0) ? getIcon(filetype) : '';
    }

    /* Set the classes for all cells. All cells except the filename will fit
     * their contents. The filename cell is the only allowed to wrap. The last
     * two cells (file size and last-modified date) will be hidden on small
     * (i.e. mobile) devices.*/
    if (!hasExistingIcons) {
      // New icon column + existing columns
      row.cells[0].classList.add('icon-cell');
      row.cells[1].classList.add('px-2', 'py-1', 'filename');
      row.cells[2].classList.add('px-2', 'py-1', 'd-none', 'd-md-table-cell');
      row.cells[3].classList.add('px-2', 'py-1', 'd-none', 'd-md-table-cell');
    } else {
      // Existing columns (nginx already has icons)
      row.cells[0].classList.add('icon-cell'); // First column is already the icon
      row.cells[1].classList.add('px-2', 'py-1', 'filename');
      row.cells[2].classList.add('px-2', 'py-1', 'd-none', 'd-md-table-cell');
      row.cells[3].classList.add('px-2', 'py-1', 'd-none', 'd-md-table-cell');
      
      // If nginx generated icons, replace them with our Font Awesome icons
      if (i > 0) {
        if (row.cells[1] && row.cells[1].children && row.cells[1].children[0]) {
          filetype = getFileType(row.cells[1].children[0].innerHTML);
        } else if (row.cells[1] && row.cells[1].textContent) {
          filetype = getFileType(row.cells[1].textContent.trim());
        }
        row.cells[0].innerHTML = getIcon(filetype);
      }
    }

    /* If the file is a picture, add the data attribute for lightbox2, so one
     * is able to easily navigate through the pictures. */
    const filenameCell = hasExistingIcons ? row.cells[1] : row.cells[1];
    if (filetype === 'image' && filenameCell && 
        filenameCell.children && filenameCell.children[0]) {
      filenameCell.children[0].setAttribute('data-lightbox', 'roadtrip');
    }
  }
}