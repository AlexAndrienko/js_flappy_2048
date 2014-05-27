chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 840,
            'height': 560
        },
        "resizable": false
    });
});