export class PagePreparator {
    constructor(iconPNG, iconSVG) {
        this.iconPNG = iconPNG;
        this.iconSVG = iconSVG;
    }

    init() {
        console.log('Should to prepare icons first...');
        console.log('    PNG', this.iconPNG);
        console.log('    SVG', this.iconSVG);

        console.log('Setting up icon to page...');
        let link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = this.iconPNG;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
}