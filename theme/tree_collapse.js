"use strict";

var TREE_COLLAPSOR_TAGS = ['UL', 'OL'];

function toggle_lists(element) {
    var has_child = false;
    for(let child of element.children) {
        if(TREE_COLLAPSOR_TAGS.indexOf(child.tagName) >= 0) {
            child.classList.toggle('collapsed-tree-node');
            has_child = true;
        }
    }
    if(has_child) {
        element.classList.toggle('collapsor-tree-node');
    }
}

function collapsor(event) {
    var target = event.target;
    if(target.tagName === 'LI') {
        toggle_lists(target);
    }
    else if(TREE_COLLAPSOR_TAGS.indexOf(target.tagName) < 0 && target.parentElement.tagName === 'LI') {
        toggle_lists(target.parentElement);
    }
}

function attach_collapsor() {
    var elements = document.getElementsByClassName('tree-collapsible');
    for(let element of elements) {
        if(TREE_COLLAPSOR_TAGS.indexOf(element.tagName) >= 0) {
            element.addEventListener('click', collapsor);
        }
        else {
            for(let child of element.children) {
                if(TREE_COLLAPSOR_TAGS.indexOf(child.tagName) >= 0) {
                    child.addEventListener('click', collapsor);
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', attach_collapsor);
document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.classList.add('tree-collapse-js');
});
