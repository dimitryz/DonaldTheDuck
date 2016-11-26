
/// Returns the checkbox for toggling enabled/disabled
var getInput = function () {
    return document.getElementById('iDisabled');
}

/// Toggle the input
var toggleDisabled = function (disabled) {
    if (disabled) {
        getInput().checked = "checked";
    } else {
        delete getInput().checked;
    }
}

/// Called when document has loaded
document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.sync.get([LocalStorageDisabledKey], function (items) {
        toggleDisabled(items[LocalStorageDisabledKey] == "true");
    });
    
    getInput().addEventListener("change", function (e) {
        var data = {};
        data[LocalStorageDisabledKey] = e.target.checked ? "true" : false;
        chrome.storage.sync.set(data);
       
        toggleDisabled(e.target.checked);
       
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab[0].id, {code: code});
        });
    });
});