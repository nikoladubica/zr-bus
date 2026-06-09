export const tileLayers = [
    {
        name: 'Grayscale',
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        selected: true,
        subdomains: [],
    },
    {
        name: 'Grayscale-Light',
        url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
        selected: true,
        subdomains: [],
    },
    {
        name: 'Nature',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        selected: false,
        subdomains: [],
    },
    {
        name: 'Google - Map',
        url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        selected: false,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    },
    {
        name: 'Google - Hybrid',
        url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
        selected: false,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    },
    {
        name: 'Google - Satelite',
        url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        selected: false,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    },
    {
        name: 'Google - Traffic',
        url: 'https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}',
        selected: false,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    },
];

export const position = { lat: 45.380324641019214, lng: 20.390627789875914 };
