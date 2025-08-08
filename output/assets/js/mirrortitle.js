function dynamicTitle()
{
    const distros = { 
      "arch": "Arch Linux",
      "arcolinux": "ArcoLinux",
      "artix": "Artix Linux",
      "blendos": "blendOS",
      "cachy": "CachyOS",
      "endeavouros": "EndeavourOS",
      "fyralabs": "Fyra Labs Projects (Terra, Ultramarine)",
      "manjaro": "Manjaro Linux",
      "xerolinux": "XeroLinux",
      "arch-mact2": "Arch Linux extras for Macs with T2",
      "manjaro-mact2": "Manjaro Linux extras for Macs with T2",
      "yurumc": "YuruMC Files",
    };
    var mirror = distros[document.location.pathname.split('/')[1]];
    if (mirror)
    {
        document.title = mirror + " - YuruMirror";
    }
}
