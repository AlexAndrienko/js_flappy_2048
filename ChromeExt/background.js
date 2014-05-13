chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 850,
            'height': 565
        },
        "resizable": false
    });
});