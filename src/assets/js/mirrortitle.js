/**
 * Dynamically set page title based on the distribution being mirrored
 * Called from HTML pages
 */
function dynamicTitle() { // eslint-disable-line no-unused-vars
  const distros = { 
    'arch': 'Arch Linux',
    'arcolinux': 'ArcoLinux',
    'artix': 'Artix Linux',
    'blendos': 'blendOS',
    'cachy': 'CachyOS',
    'endeavouros': 'EndeavourOS',
    'endeavouros-t2': 'EndeavourOS ISOs for Macs with T2',
    'fyralabs': 'Fyra Labs Projects (Terra, Ultramarine)',
    'manjaro': 'Manjaro Linux',
    'arch-mact2': 'Arch Linux extras for Macs with T2',
    'yurumc': 'YuruMC Files'
  };
  
  const mirror = distros[document.location.pathname.split('/')[1]];
  if (mirror) {
    document.title = mirror + ' - YuruMirror';
  }
}
