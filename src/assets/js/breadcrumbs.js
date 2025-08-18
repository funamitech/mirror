/*!
 *
 * This file is part of the nginx-fancyindex-flat-theme, licensed under the GNU
 * General Public License. See the LICENSE file for details.
 *
 * Copyright (C)
 *  2018 Alexander Haase <ahaase@alexhaase.de>
 */

/**
 * Generate breadcrumb navigation based on the current URL path
 * Called from HTML pages
 */
function generateBreadcrumbs() { // eslint-disable-line no-unused-vars
  const pathSegments = window.location.pathname.replace(/\/$/, '').split('/');
  const displaySegments = pathSegments.slice();
  let breadcrumbHtml = '';
  let currentPath = '';

  // Map only the display name, do not alter actual path segments
  switch (pathSegments[1]) {
    case 'arch':
      displaySegments[1] = 'Arch Linux';
      break;
    case 'artix':
      displaySegments[1] = 'Artix Linux';
      break;
    case 'blendos':
      displaySegments[1] = 'blendOS';
      break;
    case 'cachy':
      displaySegments[1] = 'CachyOS';
      break;
    case 'endeavouros':
      displaySegments[1] = 'EndeavourOS';
      break;
    case 'endeavouros-t2':
      displaySegments[1] = 'EndeavourOS ISOs for Macs with T2';
      break;
    case 'fyralabs':
      displaySegments[1] = 'Fyra Labs Projects (Terra, Ultramarine)';
      break;
    case 'manjaro':
      displaySegments[1] = 'Manjaro Linux';
      break;
    case 'arch-mact2':
      displaySegments[1] = 'Arch Linux extras for Macs with T2';
      break;
    case 'yurumc':
      displaySegments[1] = 'YuruMC Files';
      break;
  }

  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += pathSegments[i] + '/';
    
    const isLast = i === pathSegments.length - 1;
    const displayName = i === 0 ? 'Home' : decodeURIComponent(displaySegments[i]);
    
    breadcrumbHtml += '<li class="breadcrumb-item' + 
      (isLast ? ' active" aria-current="page"' : '"') + '>';
    
    if (!isLast) {
      breadcrumbHtml += '<a href="' + currentPath + '">';
    }
    
    breadcrumbHtml += displayName;
    
    if (!isLast) {
      breadcrumbHtml += '</a>';
    }
    
    breadcrumbHtml += '</li>';
  }
  
  document.getElementById('breadcrumbs').innerHTML = breadcrumbHtml;
}
