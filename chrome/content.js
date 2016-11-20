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

/// Number of nodes to traverse up the tree to find related images
var BUBBLE_UP_IMAGE_SEARCH = 4;

/// The attribute assigned to an image to say it was visited by the replaceImage function
var VISITED_IMAGE_ATTR = "data-donalded";

/// Function iterates over all children of node and replaces instances of Trump with Duck
var replaceText = function (node) {
    if (node.nodeName == "#text") {
        var replaced = false;
        
        while (node.nodeValue.match(/Trump|-\s*DJT/)) {
            node.nodeValue = node.nodeValue.replace(/(J\.\s+)?Trump/, "Duck").replace(/-\s*DJT/, "- Duck");
            replaced = true;
        }

        if (replaced) {
            var levelsToGoUp = BUBBLE_UP_IMAGE_SEARCH;
            var targetNode   = node;
            while (levelsToGoUp > 0 && targetNode.parentNode && targetNode.parentNode != document) {
                targetNode = targetNode.parentNode;
                levelsToGoUp -= 1;
            }
            replaceImages(targetNode, true);
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
 * Replaces all images under the given node with images of Donald Duck.
 * 
 * Setting true on the `ignoreMeta` will replace all images of a certain size.
 * Otherwise, the script will only replace images that include the words Trump,
 * J. Trump or DJT_ in either the source or alt attributes.
 * 
 * @param DOMNode node The node at which to start the search
 * @param boolean ignoreMeta Will not search through the meta for terms related to Trump
 */
var replaceImages = function (node, ignoreMeta) {
    var replaceImage = function (image) {
        if ((ignoreMeta && imageResemblesPhoto(image)) || imageContainsTrump(image)) {
            drawDuckInImage(image);
        }
    }

    var images;
    if (node.nodeName == "IMG") {
        images = [node];
    } else {
        images = Array.prototype.slice.call(node.getElementsByTagName("img"));
    }

    images.forEach(function (image) {
        if (image.getAttribute(VISITED_IMAGE_ATTR)) {
            return;
        }
        
        image.setAttribute(VISITED_IMAGE_ATTR, "1");

        if (image.complete) {
            replaceImage(image);
        } else {
            image.addEventListener("load", function (e) {
                replaceImage(e.target);
            });
        }
    });
}

/**
 * Returns true if the image appears to be of Trump.
 * 
 * @param DOMNode node An image node
 * @return boolean True if there is a mention of trump
 */
var imageContainsTrump = function (node) {
    var contains = false;
    var lookThrough = [node.getAttribute("src"), node.getAttribute("alt")];
    for (var i = 0; i < lookThrough.length && !contains; i++) {
        if (lookThrough[i] && lookThrough[i].match('/Trump|DJT_/')) {
            contains = true;
        }
    }
    return contains;
}

/**
 * Returns true if the given image matches the size of a photo.
 * 
 * @param DOMNode node Checks that the image is of a certain size
 * @return boolean True if the image is a photo
 */
var imageResemblesPhoto = function (node) {
    return node.width && node.height && node.width >= node.height && node.width > 45; 
}

/**
 * Renders a new image in the given image node with the face of donald Duck.
 * 
 * Curerntly uses the icon.png image for the duck. Only square images allowed.
 * 
 * @param DOMNode image The image node
 */
var drawDuckInImage = function (image) {
    var imageWidth  = image.naturalWidth || image.width;
    var imageHeight = image.naturalHeight || image.height;

    if (!imageWidth || !imageHeight) {
        return;
    }

    // only works with square images
    var duckSize = imageWidth > imageHeight ? imageHeight : imageWidth;
    var duckX    = (imageWidth - duckSize) / 2;
    var duckY    = (imageHeight - duckSize) / 2; 

    // loads the data and only then builds the canvas
    var duckImage = new Image();
    duckImage.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.setAttribute("width", imageWidth);
        canvas.setAttribute("height", imageHeight);

        context = canvas.getContext("2d");
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(duckImage, duckX, duckY, duckSize, duckSize);

        image.src = canvas.toDataURL();
    }
    duckImage.setAttribute("crossOrigin", "anonymous");
    duckImage.setAttribute("src", chrome.extension.getURL('assets/icon.png'));
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
    
    // replaces all text
    replaceText(document);
    
    // replaces all images but only those whose meta matches terms suggesting trump
    replaceImages(document.body, false);

    // monitors the body for future changes to the tree
    monitorForChanges(document.body);
}, 100);