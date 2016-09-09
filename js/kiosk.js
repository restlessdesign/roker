;(function(root) {

// Public Methods ______________________________________________________________

function goFullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
    else if (element.mozRequestFullscreen) {
        element.mozRequestFullscreen();
    }
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// Events ______________________________________________________________________

document.documentElement.addEventListener('click', function(e) {
    goFullScreen(document.documentElement);
});

// Exports _____________________________________________________________________

    root.goFullScreen = goFullScreen;

}(window));
