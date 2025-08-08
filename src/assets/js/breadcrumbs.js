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
  let breadcrumbHtml = '';
  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += pathSegments[i] + '/';
    
    const isLast = i === pathSegments.length - 1;
    const displayName = i === 0 ? 'Home' : decodeURIComponent(pathSegments[i]);
    
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
