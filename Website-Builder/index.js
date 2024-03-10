function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);    
}

function drop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let userOptionRaw = ev.dataTransfer.getData("text");
    let userOption = document.getElementById(userOptionRaw);
    // Different responses depending on what the user selected/dropped
    let element;
    switch (userOption.id) {
        case "selector-c1":
            element = createElement("div", [".gen-section", ".gen-outlines"], null);
            createElement("div", [".gen-cell", ".gen-outlines"], element); // column
            ev.target.appendChild(element);
            break;
        case "selector-c2":
            element = createElement("div", [".gen-section", ".gen-outlines"], null);
            createElement("div", [".gen-cell", ".gen-outlines"], element); // col1
            createElement("div", [".gen-cell", ".gen-outlines"], element); // col2
            ev.target.appendChild(element);
            break;
        case "selector-c3":
            element = createElement("div", [".gen-section", ".gen-outlines"], null);
            createElement("div", [".gen-cell", ".gen-outlines"], element);
            createElement("div", [".gen-cell", ".gen-outlines"], element);
            createElement("div", [".gen-cell", ".gen-outlines"], element);
            ev.target.appendChild(element);
            break;
        case "selector-c2_3/7":
            element = createElement("div", [".gen-section", ".gen-outlines"], null);
            createElement("div", [".gen-cell", "flex-basis:30%;", ".gen-outlines"], element); // col1
            createElement("div", [".gen-cell", "flex-basis:70%;", ".gen-outlines"], element); // col2
            ev.target.appendChild(element);
            break;
        default:
            if (userOption.id) { // Means user is dragging elements within canvas instead of sidebar

                /* Handle section rearrangement */
                if (userOption.classList.contains('gen-section')) {
                    let dropPosition = ev.clientY;
                    let elements = document.querySelectorAll('.gen-section');
                    let closestElement = null;
                    elements.forEach((element) => {
                        if (!closestElement || Math.abs(dropPosition - element.getBoundingClientRect().top) < Math.abs(dropPosition - closestElement.getBoundingClientRect().top)) {
                            closestElement = element;
                        }
                    });

                    if (dropPosition < closestElement.getBoundingClientRect().top + closestElement.offsetHeight / 2) {
                        // Insert before the closest element if the drop position is above its midpoint
                        closestElement.parentNode.insertBefore(userOption, closestElement);
                    } else {
                        // Insert after the closest element if the drop position is below its midpoint
                        closestElement.parentNode.insertBefore(userOption, closestElement.nextSibling);
                    }
                } 
                
                /* Handle cell rearrangement */
                else if (userOption.classList.contains('gen-cell')) {
                    let dropPositionX = ev.clientX;
                    let elements = document.querySelectorAll('.gen-cell');
                    let closestElement = null; // Closest element to the cell we are hovering in relation to curosor position
                    elements.forEach((element) => {
                        if (!closestElement || Math.abs(dropPositionX - element.getBoundingClientRect().left) < Math.abs(dropPositionX - closestElement.getBoundingClientRect().left)) {
                            closestElement = element;
                        }
                    });
                    let hoveredElement = ev.target;
                    let hoveringCell = hoveredElement.closest(".gen-cell"); // Cell we are currently hovering
                    let hoveringSection = hoveredElement.closest(".gen-section"); // Section we are currently hovering

                    if (hoveringSection.hasChildNodes()) {
                        // Check if the drop position is before the first cell of the closest section
                        if (dropPositionX < hoveringSection.getBoundingClientRect().left + closestElement.offsetWidth / 2) {
                            hoveringCell.parentNode.insertBefore(userOption, hoveringCell);
                        }
                        // Check if the drop position is after the last cell of the closest section
                        else if (dropPositionX > hoveringSection.getBoundingClientRect().right - closestElement.offsetWidth / 2) {
                            hoveringSection.appendChild(userOption);
                        }
                        // Otherwise handle normal logic - but ensure single-cell-next-section drag/drop behaviour doesn't occur
                        else if (hoveringCell.parentNode === closestElement.parentNode) {
                            // Insert before the closest element if the drop position is left of its midpoint else drop to right
                            if (Math.abs(dropPositionX - closestElement.getBoundingClientRect().left) < Math.abs(dropPositionX - closestElement.getBoundingClientRect().right)) {
                                closestElement.parentNode.insertBefore(userOption, closestElement);
                            } else {
                                closestElement.parentNode.insertBefore(userOption, closestElement.nextSibling);
                            }
                        }
                    } else {
                        // Insert into empty section
                        hoveredElement.appendChild(userOption);
                    }
                }

            } else {
                console.log("Couldn't find the id of element dragged!");
            }
    }
}

function handleDragEnter(ev) {
    ev.stopPropagation();

    let targetElement = ev.target;
    let draggedElement = ev.fromElement;

    console.log("DEBUG TARGET ELEMENT: ", targetElement);
    console.log("DEBUG DRAGGED ELEMENT: ", draggedElement);

    if (targetElement.classList.contains('gen-section')) {
        //targetEl.style.background = 'orange';
    }
    else if (targetElement.classList.contains('gen-cell') && targetElement.parentNode !== draggedElement) {
        targetElement.style.background = 'green';
    }
}

/* Generate a random ID for generated elements */
function randomId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 4; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/* When user drags elemet to canvas this is used to create it */
function createElement(type, styler, parentNode) {
    const element = document.createElement(type);
    let generatedID = randomId();
    element.id = generatedID;
    element.setAttribute("draggable", true);
    element.setAttribute("ondragstart", "drag(event)");
    element.setAttribute("ondrop", "drop(event)");
    element.setAttribute("ondragenter", "handleDragEnter(event)");
    element.classList.add("gen");
    // Go through styler array to extract all styles for element
    for (let i = 0; i < styler.length; i++) {
        // Check if styler has an actual style passed to it or if a class has been passed
        if (styler[i].startsWith('.')) {
            styler[i] = styler[i].slice(1); // We want 'className' NOT '.className'
            element.classList.add(styler[i]);
        } else {
            // Add element specific style to canvas div-style container
            let styles = `<style>#${generatedID}{ ${styler[i]} }</style>`;
            let styleContainer = document.getElementById("style-ctr");
            styleContainer.insertAdjacentHTML("beforeend", styles);
        }
    }
    // If being called by child then attatch child to parent
    if (parentNode !== null) {
        parentNode.appendChild(element);
        element.innerHTML = generatedID;
    }
    return element;
}

/* Highlight the area where the element will be dropped so user knows what to expect */
function dropHighlight(elementID, position, color) {
    let element = document.getElementById(elementID);
    switch (position) {
        case "top":
            element.classList.add()
            break;
        case "bottom":
            break;
        case "left":
            break;
        case "right":
            break;
        default:
            console.log("Can't highlight the element in said position!");
    }
}