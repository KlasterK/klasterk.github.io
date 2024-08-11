let toTop, height, toTopImage, contentElem, styleLink;

window.onload = function(event)
{
    toTop = document.querySelector('#to-top');
    contentElem = document.querySelector('#content');
    height = contentElem.getBoundingClientRect();
    height = height.y + height.height;
    toTopImage = toTop.querySelector('img');
    styleLink = document.querySelector('#style-link')
}

document.addEventListener('scroll', function(event)
{
    toTop.hidden = document.scrollingElement.scrollTop < height;
});