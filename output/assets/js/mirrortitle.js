function getMirrorType(foldername)
{
    switch (foldername.toLowerCase())
    {
        case "arch":
            return "Arch Linux - YuruMirror";
        case "arcolinux":
            return "ArcoLinux - YuruMirror";
        case "artix":
            return "Artix Linux - YuruMirror";
        case "endeavouros":
            return "EndeavourOS - YuruMirror";
        case "manjaro":
            return "Manjaro Linux - YuruMirror";
        case "xerolinux":
            return "XeroLinux - YuruMirror";
        case "arch-mact2":
            return "Arch Linux extras for Macs with T2 - YuruMirror";
        case "manjaro-mact2":
            return "Manjaro Linux extras for Macs with T2 - YuruMirror";
    }
}

function dynamicTitle()
{
    var mirror = getMirrorType(document.location.pathname.split('/')[1]);
    if (mirror)
    {
        document.title = mirror;
    }
}
