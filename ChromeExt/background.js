chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 860,
            'height': 576
        },
        "resizable": false
    });
});