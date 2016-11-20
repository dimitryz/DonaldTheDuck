/// Function iterates over all children of node and replaces instances of Trump with Duck
var replaceText = function (node) {
    if (node.nodeName == "#text") {
        if (node.nodeValue.match(/Trump/)) {
            node.nodeValue = node.nodeValue.replace(/(J\.\s+)?Trump/, "Duck");
        }
    } else {
        for (var i = 0; i < node.childNodes.length; i++) {
            replaceText(node.childNodes[i]);
        }
        // node.childNodes.forEach(function (n) {
        //     replaceText(n);
        // });
    }
}

/**
 * Sets up a monitor to check for changes
 * 
 * @param DOMNode A node to monitor
 * @return MutationObserver The observer
 */
var monitorForChanges = function (node) {
    var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            for (var j = 0; j < mutations[i].addedNodes.length; j++) {
                replaceText(mutations[i].addedNodes[j]);
            }
        }
    });
    observer.observe(node, { attributes: true, childList: true, characterData: true, subtree: true });
    return observer;
}

/// Triggers the pattern replacement when document is ready
var tid = setInterval(function () {
    if (document.readyState !== 'complete') return;
    clearInterval(tid);    

    console.log("Donald Duck initialized.");   
    
    replaceText(document);
    monitorForChanges(document.body);
}, 100);