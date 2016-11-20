document.addEventListener("DOMContentLoaded", function () {
    var localStorageKey = "donald_disabled";
    var input = document.getElementById('iDisabled');

    input.removeAttribute("disabled");

    chrome.storage.local.get([localStorageKey], function (items) {
        if (items[localStorageKey]) {
            input.checked = "checked";
        }
    });

    input.addEventListener("change", function (e) {
        chrome.storage.local.set({localStorageKey: e.target.checked ? "1" : null});
    });
});