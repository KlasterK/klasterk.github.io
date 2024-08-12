let toTop, height, themeIndex, selTheme;
const LS_THEME = 'klasterk-kkghio-theme';

window.addEventListener('load', function(event)
{
    toTop    = document.querySelector('#to-top');
    height   = document.querySelector('#content-plan').getBoundingClientRect();
    height   = height.y + height.height;
    selTheme = document.querySelector('#select-theme');

    selTheme.selectedIndex = themeIndex;
    selTheme.addEventListener('change', onChangeInSelTheme);
});

let theme = localStorage.getItem(LS_THEME);
if(theme == 'light') themeIndex = 1;
else if(theme == 'dark') {
    themeIndex = 2;
    switchDarkTheme(true);
} else {
    themeIndex = 0;
    switchDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

document.addEventListener('scroll', function(event)
{
    toTop.hidden = document.scrollingElement.scrollTop < height;
});

function onChangeInSelTheme(event)
{
    switch(selTheme.selectedIndex)
    {
        case 0: localStorage.removeItem(LS_THEME);
                switchDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
                break;
        case 1: localStorage.setItem(LS_THEME, 'light');
                switchDarkTheme(false);
                break;
        case 2: localStorage.setItem(LS_THEME, 'dark');
                switchDarkTheme(true);
                break;
    }
}

function switchDarkTheme(sw)
{
    if(sw) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'style1d.css';
        link.id = 'dark-theme-link'
        document.head.append(link);
    } else {
        let link = document.getElementById('dark-theme-link');
        if(link) link.remove();
    }
}