var localStorageKey = "disabledDonaldTheDuck";

var getInput = function () {
    return document.getElementById('iDisabled');
}

var toggleDisabled = function (disabled) {
    if (disabled) {
        getInput().checked = "checked";
    } else {
        delete getInput().checked;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    chrome.storage.sync.get([localStorageKey], function (items) {
        toggleDisabled(items[localStorageKey] == "true");
    });
    
    getInput().addEventListener("change", function (e) {
        var data = {};
        data[localStorageKey] = e.target.checked ? "true" : false;
        chrome.storage.sync.set(data);
       
        toggleDisabled(e.target.checked);
       
        chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
            var code = 'window.location.reload();';
            chrome.tabs.executeScript(tab[0].id, {code: code});
        });
    });
});