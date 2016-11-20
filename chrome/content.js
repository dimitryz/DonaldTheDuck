/*

This file is part of DonaldTheDuck Browser Extension.

DonaldTheDuck Browser Extension is free software: you can redistribute it 
and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version.

DonaldTheDuck Browser Extension is distributed in the hope that it will be
useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with DonaldTheDuck Browser Extension.  If not, see <http://www.gnu.org/licenses/>.

*/

/// Function iterates over all children of node and replaces instances of Trump with Duck
var replaceText = function (node) {
    if (node.nodeName == "#text") {
        while (node.nodeValue.match(/Trump/)) {
            node.nodeValue = node.nodeValue.replace(/(J\.\s+)?Trump/, "Duck");
        }
    } else {
        for (var i = 0; i < node.childNodes.length; i++) {
            replaceText(node.childNodes[i]);
        }
        // The following would create too many function calls.
        //
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