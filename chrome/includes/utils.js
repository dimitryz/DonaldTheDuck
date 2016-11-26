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

/**
 * Returns the closest block node to the given element
 * 
 * @param DOMNode node The node for which to find the closest parent that is a block
 * @return DOMNode The closest parent block node
 */
var closestBlockNode = function (node) {
    var parent = node;
    while (parent.parentNode && (parent.nodeType != 1 || window.getComputedStyle(parent).display == 'inline')) {
        parent = parent.parentNode;
    }
    return parent;
}

/**
 * Returns the distance between two elements.
 * 
 * @param DOMNode firstNode First node
 * @param DOMNode secondNode Second node
 * @return Float The distance
 */
var distanceBetweenNodes = function (firstNode, secondNode) {
    return mezr.distance(firstNode, secondNode);
}

/**
 * Returns true if the given image matches the size of a photo.
 * 
 * @param DOMNode node Checks that the image is of a certain size
 * @return boolean True if the image is a photo
 */
var imageResemblesPhoto = function (node) {
    return node.width && node.height && node.width >= node.height && node.width > 40; 
}

/**
 * Returns an array from a list of nodes
 * 
 * @param Node collection
 * @return Array
 */
var nodeCollectionToArray = function (nodeCollection) {
    return Array.prototype.slice.call(nodeCollection);
}