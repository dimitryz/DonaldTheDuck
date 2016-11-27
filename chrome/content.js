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
var BUBBLE_UP_IMAGE_SEARCH = 5;

/// The attribute assigned to an image to say it was visited by the replaceImage function
var VISITED_IMAGE_ATTR = "data-donalded";

/// Number of available images in the extension
var DONALD_IMAGE_COUNT = 6;

/// Maximum distance between the text and an image to show association
var MAX_DISTANCE_ASSOCIATION = 50;

/// Number of images in the assets with Donald 
var IMAGES_TO_LOAD_COUNT = 7;

/// Width of a small image
var SMALL_IMAGE_SIZE = 120;

/// List of loaded images of Donald
var IMAGES_OF_DONALD = [];

/// Small images of Donald. 120 x 120
var SMALL_IMAGES_OF_DONALD = [];

/// Main function for initializing the functionality
var init = function () {
    var remainingImagestoLoad = IMAGES_TO_LOAD_COUNT * 2;
    for (var i = 0, c = IMAGES_TO_LOAD_COUNT * 2; i < c ; i++) {
        var image = new Image();
        image.setAttribute("crossOrigin", "anonymous");
        image.addEventListener("load", function () {
            remainingImagestoLoad--;
            if (remainingImagestoLoad == 0) {
                // replaces all content in the page
                replaceContent(document.body);

                // monitors the body for future changes to the tree
                monitorForChanges(document.body);
            }
        });

        if (i % 2 == 0) {
            image.src = chrome.extension.getURL("assets/donald_" + i / 2 + ".png");
            IMAGES_OF_DONALD.push(image);
        } else {
            image.src = chrome.extension.getURL("assets/donald_" + (i - 1) / 2 + "_small.png");
            SMALL_IMAGES_OF_DONALD.push(image);
        }
    }
}

/**
 * Replaces all mention of DJT with DTD
 * 
 * @param DOMNode root The root node
 */
var replaceContent = function (root) {
    if (replaceTimeout) {
        return;
    }
    replaceTimeout = setTimeout(function () {
        replaceImages(root, false);
        replaceText(root);
        replaceTimeout = false;
    }, 300);
}
var replaceTimeout = null;

/**
 * Function iterates over all children of node and replaces the text.
 * 
 * Replaces all images surrounding the text too.
 * 
 * @param DOMNode node The root node at which to replace the text.
 */
var replaceText = function (node) {
    if (node.nodeType == 3) {
        var replaced = false;
        while (node.nodeValue.match(/Trump|TRUMP|-\s*DJT/)) {
            node.nodeValue = node.nodeValue.replace(/(J\.\s+)?(Trump|TRUMP)/, "Duck").replace(/-\s*DJT/, "- Duck");
            replaced = true;
        }
        if (replaced) {
            console.log(["Dealing with block", node.cloneNode(false)]);
            replaceImages(findNearestImages(closestBlockNode(node)), true);
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
 * @param DOMNode|Array node The node at which to start the search or a list of nodes
 * @param boolean ignoreMeta Will not search through the meta for terms related to Trump
 */
var replaceImages = function (node, ignoreMeta) {
    var images = [];
    if (typeof node.forEach != 'undefined') {
        images = node;
    } else if (node.nodeName == "IMG") {
        images = [node];
    } else {
        images = nodeCollectionToArray(node.getElementsByTagName("img"));
    }

    var imagesToReplace = [];
    images.forEach(function (image) {
        if (ignoreMeta) {
            console.log(["Image added by proximity", image.cloneNode(false)]);
        } else if (imageContainsTrump(image)) {
            console.log(["Image added because of content/meta", image.cloneNode(false)]);
        }
        if (ignoreMeta || imageContainsTrump(image)) {
            imagesToReplace.push(image);
        }
    });
    if (imagesToReplace.length < 1) {
        return;
    }

    var replaceImage = function (image) {
        var image = image.target || image;
        image.removeEventListener("load", replaceImage);
        drawDuckInImage(image);
    }

    imagesToReplace.forEach(function (image) {
        if (image.complete) {
            replaceImage(image);
        } else {
            image.addEventListener("load", replaceImage);
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
    var src = node.getAttribute("src") || "";

    // limits the size of the source so that we're not searching throught
    var lookThrough = [src.indexOf('data:image') === 0 ? "" : src, node.getAttribute("alt")];
    
    for (var i = 0; i < lookThrough.length && !contains; i++) {
        if (lookThrough[i] && lookThrough[i].match(/Trump|TRUMP|DJT_/)) {
            contains = true;
        }
    }
    return contains;
}

/**
 * Returns the nearest photo to the node.
 * 
 * @param DOMNode node The node to which return the nearest image
 * @return DOMNode|NULL The image node or null
 */
var findNearestImages = function (node) {
    var nearestImage = null;
    
    // finds the top-most block container from which to start searching for an image
    var container = node;
    var depth = BUBBLE_UP_IMAGE_SEARCH;
    while (depth > 0 && container.parentNode && container.parentNode != document.body) {
        container = container.parentNode;
        depth--;
    }

    var images = nodeCollectionToArray(container.getElementsByTagName('img'));
    var toReplace = [];
    images.forEach(function (image) {
        if (imageResemblesPhoto(image) && distanceBetweenNodes(node, image) <= MAX_DISTANCE_ASSOCIATION) {
            toReplace.push(image);
        }
    });

    return toReplace;
}

/**
 * Renders a new image in the given image node with the face of donald Duck.
 * 
 * @param DOMNode image The image node
 */
var drawDuckInImage = function (image) {
    var imageWidth  = image.width;
    var imageHeight = image.height;

    if (image.getAttribute(VISITED_IMAGE_ATTR)) {
        return;
    }
    image.setAttribute(VISITED_IMAGE_ATTR, "1");

    if (!imageWidth || !imageHeight) {
        return;
    }

    // only works with square images
    var duckSize = imageWidth > imageHeight ? imageHeight : imageWidth;
    var duckX    = (imageWidth - duckSize) / 2;
    var duckY    = (imageHeight - duckSize) / 2; 

    // loads the data and only then builds the canvas
    var duckImage;
    if (duckSize <= SMALL_IMAGE_SIZE) {
        duckImage = SMALL_IMAGES_OF_DONALD[Math.floor(Math.random() * SMALL_IMAGES_OF_DONALD.length)];
    } else {
        duckImage = IMAGES_OF_DONALD[Math.floor(Math.random() * IMAGES_OF_DONALD.length)];
    }
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", imageWidth * 2);
    canvas.setAttribute("height", imageHeight * 2);

    context = canvas.getContext("2d");
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.drawImage(duckImage, duckX, duckY, duckSize * 2, duckSize * 2);

    image.src = canvas.toDataURL();
}

/**
 * Sets up a monitor to check for changes
 * 
 * @param DOMNode A node to monitor
 * @return MutationObserver The observer
 */
var monitorForChanges = function (node) {
    var observer = new MutationObserver(function(mutations) {
        replaceContent(node);
    });
    observer.observe(node, { attributes: true, childList: true, characterData: true, subtree: true });
    return observer;
}

// Initializes the scripts

chrome.storage.sync.get([LocalStorageDisabledKey], function (items) {
    if (items[LocalStorageDisabledKey] != "true") {
        init();
    }
});