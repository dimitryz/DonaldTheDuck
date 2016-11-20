/// Function iterates over all children of node and replaces instances of Trump with Duck
var replaceText = function (node) {
    if (node.nodeName == "#text") {
        if (node.nodeValue.match(/Trump/)) {
            node.nodeValue = node.nodeValue.replace(/Trump/, "Duck");
        }
    } else {
        for (var i = 0; i < node.childNodes.length; i++) {
            replaceText(node.childNodes[i]);
        }
    }
}

/// Triggers the pattern replacement when document is ready
var tid = setInterval(function () {
    if (document.readyState !== 'complete') return;
    clearInterval(tid);       
    
    replaceText(document);
}, 100);