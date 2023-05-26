
//Global variables
let selectedBlockID
let structureID = 0;
let elementID = 0;
let elementType = "";

//Download - first function
const download = () => {

    $.get(URL, (e) => {
        const downloaded = JSON.parse(e);

        blocks.splice(0, blocks.length)
        structure.splice(0, structure.length)
        downloaded.blocks.forEach(e => {
            blocks.push(JSON.parse(e.content));
        })
        downloaded.containers.forEach(e => {
            structure.push(JSON.parse(e.content));
        })

        document.getElementById("load").style.setProperty("height", "0px");
        scructure_creator();
        creator()
    })

}

//Deleting methods

/**Delete block with content */
const delete_block = (element) => {
    newBlocks.forEach((e, index) => {
        if (e.id == element.id) {
            newBlocks.splice(index, 1);
        }
    })
    if (element.type == "vertical-list" || element.type == "horizontal-list") {
        element.elements.forEach(e => {
            if (e.type == "vertical-list" || e.type == "horizontal-list") {
                delete_block(blocks[blockIndex(e.id)])
            } else {
                blocks.splice(blockIndex(e.id), 1);
                toDelete.push({ id: e.id, type: "block" })
            }
        })
        blocks.splice(blockIndex(element.id), 1);
        toDelete.push({ id: element.id, type: "block" })

    } else {
        blocks.splice(blockIndex(element.id), 1);
    }

    blocks.forEach((e, index) => {
        switch (e.type) {
            case "vertical-list":
                e.elements.forEach((el, i) => {
                    if (el.id == element.id) {
                        blocks[index].elements.splice(i, 1);
                    }
                })
                break;
            case "horizontal-list":
                e.elements.forEach((el, i) => {
                    if (el.id == element.id) {
                        blocks[index].elements.splice(i, 1);
                    }
                })
                break;
        }
    })
    document.getElementById("el_e_" + element.id).remove();
}

/**Delete container with content */
const delete_container = (element) => {
    newContainers.forEach((e, index) => {
        if (e.id == element.id) {
            newContainers.splice(index, 1);
        }
    })
    toDelete.push({ id: element.id, type: "container" })
    delete_block(blocks[blockIndex(element.elements[0].id)])
    structure.splice(structureIndex(element.id), 1);

    document.getElementById("s_e_" + element.id).remove();

    scructure_creator()

}

//Functions adminstraitng structure tree

/**Generate strucutre tree */
const scructure_creator = () => {
    const structureFragment = document.getElementById("structure-fr");
    structureFragment.innerHTML = "";
    structure.forEach(element => {
        const id = "s_" + element.id;
        let type = "";

        switch (element.type) {
            case "normal":
                type = "Blok"
                break;
            case "calc":
                type = "Kalkulator";
                break;

        }

        const blockFR = div({
            className: "structure-element-title", innerHTML: type, id: id, events: {
                click: (e) => {
                    structureID = element.id;
                    if (e.target == blockFR) {
                        change_editor_s(element.id)

                    }
                }
            }
        }, [
            div({
                className: "f-el delete-button button-1", innerHTML: "Usuń blok", events: {
                    click: (e) => {
                        delete_container(element)
                    }
                }
            }, []),
            div({
                className: "f-el delete-button button-1", innerHTML: "Do góry", events: {
                    click: (e) => {
                        if (structureIndex(element.id) > 0) {
                            switch_container(element.id, structure[structureIndex(element.id) - 1].id);
                        }
                    }
                }
            }, []),
            div({
                className: "f-el delete-button button-1", innerHTML: "W dół", events: {
                    click: (e) => {
                        if (structureIndex(element.id) < structure.length - 1) {
                            switch_container(element.id, structure[structureIndex(element.id) + 1].id);
                        }
                    }
                }
            }, []),

        ])
        element.elements.forEach(el => {
            if (element.type == "normal") {
                blockFR.appendChild(structure_element(blocks[blockIndex(el.id)], blockFR, { first: true })[0])
            } else {
                blockFR.appendChild(
                    div({
                        className: "structure-element flex-container", innerHTML: el.name, id: id, events: {
                            click: (e) => {
                                elementID = el.id;
                                elementType = "option";
                                change_editor(el.id)
                            }
                        }
                    }, [])
                )
            }
        })
        if (element.type == "calc") {
            blockFR.appendChild(div({
                className: "structure-element flex-container", innerHTML: "Dodaj opcje", id: id, events: {
                    click: (e) => {
                        structure[structureIndex(element.id)].elements.push({ id: generateIndex(structure[structureIndex(element.id)].elements), name: "Opcja", elements: [], type: "list", next: "" })
                        scructure_creator()
                    }
                }
            }, []))
        }
        structureFragment.appendChild(blockFR)
    })
}

/**Generate strucutre tree element */
const structure_element = (element, parent, data) => {
    const childs = [];
    const id = "el_" + element.id;
    const delete_button = div({
        className: "f-el delete-button button-1", innerHTML: "Usuń", events: {
            click: (e) => {
                delete_block(element)
                document.getElementById("el_" + element.id).remove();
            }
        }
    }, []);

    const buttons = [
        div({
            className: "f-el delete-button button-1", innerHTML: "Do góry", events: {
                click: (e) => {
                    if (blockIndex(element.id) > 0) {
                        switch_block(element.id, "up", blocks[blockIndex(element.id) - 1].type);
                    }
                }
            }
        }, []),
        div({
            className: "f-el delete-button button-1", innerHTML: "W dół", events: {
                click: (e) => {
                    if (blockIndex(element.id) < blocks.length - 1) {
                        switch_block(element.id, "down", element.type, blocks[blockIndex(element.id) + 1].type);
                    }
                }
            }
        }, [])
    ]
    switch (element.type) {
        case "vertical-list":
            const subChilds = [delete_button]

            if (data != undefined && data.first === true) {
                subChilds.pop();
                data.first = false;
            } else {
                subChilds.push(buttons[0])
                subChilds.push(buttons[1])
            }
            if (parent != undefined) {
                element = blocks[blockIndex(element.id)];
            }
            element.elements.forEach(element => {
                const x = structure_element(element, "vertical-list")[0];
                if (x != undefined) {
                    subChilds.push(x)

                }
            })
            childs.push(div({
                className: "structure-element", innerHTML: "Lista pionowa", id: id, events: {
                    click: (e) => {
                        if (e.target.id == ("el_" + element.id)) {
                            elementID = element.id;
                            elementType = element.type;
                            change_editor(element.id)
                        }

                    }
                }
            }, subChilds))
            break;
        case "text":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Pole tekstowe", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;


        case "link":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Link", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;
        case "card":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Karta", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;
        case "profile":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Profile", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;
        case "gallery":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Galeria", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;
        case "table":
            childs.push(div({
                className: "structure-element flex-container", innerHTML: "Tabela", id: id, events: {
                    click: (e) => {
                        elementID = element.id;
                        elementType = element.type;
                        change_editor(element.id)
                    }
                }
            }, [delete_button, ...buttons]))
            break;
        case "horizontal-list":
            const subChilds1 = [delete_button, ...buttons]
            if (parent != undefined) {
                element = blocks[blockIndex(element.id)];
            }
            element.elements.forEach(element => {
                const x = structure_element(element, "horizontal-list")[0];
                if (x != undefined) {
                    subChilds1.push(x)

                }
            })
            childs.push(div({
                className: "structure-element", innerHTML: "Lista pozioma", id: id, events: {
                    click: (e) => {
                        if (e.target.id == ("el_" + element.id)) {
                            elementID = element.id;
                            elementType = element.type;
                            change_editor(element.id)
                        }

                    }
                }
            }, subChilds1))
            break;

    }
    return childs;
}

//Switchers

/**Switch container */
const switch_container = (currentID, newID) => {
    const copy = { ...structure[structureIndex(currentID)] };
    copy.id = newID;
    const copy_2 = { ...structure[structureIndex(newID)] };
    copy_2.id = currentID;
    structure[structureIndex(currentID)] = copy_2;
    structure[structureIndex(newID)] = copy;

    scructure_creator()
    creator()
}

/**Switch block */
const switch_block = (currentID, direction) => {
    let x = -1
    blocks.forEach((e, index) => {
        if (e.type == "vertical-list" || e.type == "horizontal-list") {
            e.elements.forEach((el, i) => {
                if (el.id == currentID) {
                    x = parseInt(i);
                }
            })
            if (x != -1) {
                if (direction == "up") {


                    if (x > 0) {
                        const copy = { ...blocks[index].elements[x] };

                        const copy_2 = { ...blocks[index].elements[x - 1] };

                        blocks[index].elements[x] = copy_2;
                        blocks[index].elements[x - 1] = copy;
                    }
                } else {
                    if (x < blocks[index].elements.length - 1) {
                        const copy = { ...blocks[index].elements[x] };

                        const copy_2 = { ...blocks[index].elements[x + 1] };

                        blocks[index].elements[x] = copy_2;
                        blocks[index].elements[x + 1] = copy;
                    }
                }
                x = -1;
            }
        }
    })
    scructure_creator()
    creator()
}

//Content creators

/**Content creator, generate editable page view from top to bottom */
const creator = () => {
    if (document.getElementById("body").children.length == 1) {
        document.getElementById("body").appendChild(editor_label());
    }
    for (let i = 2; i < document.getElementById("body").children.length; i++) {
        document.getElementById("body").removeChild(document.getElementById("body").children[i])
    }
    document.getElementById("body").appendChild(div({ className: "inner-body", id: "elements-container", style: "margin-left: 0px;" }));
    const elementsContainer = document.getElementById("elements-container");
    structure.forEach((element, index) => {
        const id = "s_e_" + element.id;
        let type = "";


        switch (element.type) {
            case "normal":
                type = "Blok"
                const blockFR = div({ className: "block", id: id, style: "border-bottom: 1px solid #dae2ea90; background-size: cover;" }, [])

                if (structure[index].name != undefined) {
                    blockFR.style.backgroundImage = "url("+ element.id + "_c/" + element.name + ")";
                }
                element.elements.forEach(el => {
                    blockFR.appendChild(element_creator(blocks[blockIndex(el.id)], undefined)[0])
                })
                elementsContainer.appendChild(blockFR)
                break;
            case "calc":
                type = "Kalkulator";
                elementsContainer.appendChild(calculator(element))
                break;
        }

    })
}

/**Recreate block with given id */
const re_create = (id, index) => {
    const blockFR = document.getElementById(id);
    blockFR.innerHTML = "";
    const element = blocks[index];
    element.elements.forEach(el => {
        blockFR.appendChild(element_creator(blocks[blockIndex(el.id)], "", { ID: id, index: index })[0])
    })
}

/**Create one element or elements if given block was vertical-list or horizontal-list */
const element_creator = (element, parent, data) => {
    const childs = [];
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)

    switch (element.type) {
        case "vertical-list":
            const subChilds = []
            if (parent != undefined) {
                element = blocks[blockIndex(element.id)];
            }
            element.elements.forEach(element => {
                const x = element_creator(element, "vertical-list", data)[0];
                if (x != undefined) {
                    subChilds.push(x)

                }
            })
            childs.push(div({ className: "vertical-list", style: element.style, id: id }, subChilds))
            break;
        case "horizontal-list":
            const subChilds1 = []
            if (parent != undefined) {
                element = blocks[blockIndex(element.id)];
            }
            element.elements.forEach(element => {
                const x = element_creator(element, "horizontal-list", data)[0];
                if (x != undefined) {
                    subChilds1.push(x)

                }
            })
            childs.push(div({ className: "horizontal-list", style: element.style, id: id }, subChilds1))
            break;
        case "text":
            childs.push(
                text_editor({
                    content: blocks[blockIndex(element.id)].content, fun: (e) => {
                        blocks[blockIndex(element.id)].content = e.target.innerHTML;
                    }, id: id, style: blocks[blockIndex(element.id)].style
                }))
            break;
        case "gallery":
            childs.push(
                gallery(element)
            )
            break;
        case "card":
            childs.push(
                card(element)
            )
            break;
        case "profile":
            childs.push(
                card_with_photo(element)
            )
            break;
        case "table":
            childs.push(
                table(element)
            )
            break;
        case "link":
            childs.push(
                link(element)
            )
            break;
    }
    return childs;
}

/**Add new start model of selected object */
const addNew = (type) => {
    switch (type) {
        case "block":
            const ID = generateIndex(structure, "container");
            const IDX = generateIndex(blocks, "block");
            model = { "id": IDX, "type": "vertical-list", "classes": "f-el", "elements": [] };
            blocks.push(model)
            structure.push({
                "id": ID,
                "elements": [],
                "visable": 1,
                "style": "",
                "title": "",
                "type": "normal",
                "elements": [
                    {
                        "type": "vertical-list",
                        "id": IDX
                    }
                ]

            })
            newContainers.push({ "id": ID, content: "" })
            newBlocks.push({ id: IDX, content: "" })
            const blockFR = div({ className: "block", id: "s_e_" + ID, style: "border-bottom: 1px solid #dae2ea90;" }, [
                div({ className: "vertical-list", id: "el_e_" + IDX })
            ])
            const elementsContainer = document.getElementById("elements-container");
            elementsContainer.appendChild(blockFR)

            break;
        case "calc":
            const ID2 = generateIndex(structure, "container");
            structure.push({
                "id": ID2,
                "title": "",
                "elements": [],
                "visable": 1,
                "style": "",
                "type": "calc"
            })
            newContainers.push({ "id": ID2, content: "" })
            break;

        default:
            if (elementType == "vertical-list" || elementType == "horizontal-list") {
                const index = blockIndex(elementID);
                const ID = generateIndex(blocks, "block");
                var model = {};
                switch (type) {
                    case "vertical-list":
                        model = { "id": ID, "type": "vertical-list", "classes": "f-el", "elements": [] };
                        break;
                    case "horizontal-list":
                        model = { "id": ID, "type": "horizontal-list", "classes": "f-el", "elements": [] };
                        break;
                    case "text":
                        model = { "id": ID, "type": "text", "classes": "f-el", "style": "", "content": "" };
                        break;
                    case "gallery":
                        model = { "id": ID, "type": "gallery", "classes": "f-el", "style": "", "elements": [], "type1": "1", lastID: 0, "positions": [] };
                        break;
                    case "card":
                        model = { "id": ID, "type": "card", "classes": "f-el", "style": "", "title": "", "content": "" };
                        break;
                    case "profile":
                        model = { "id": ID, "type": "profile", "classes": "f-el", "style": "", "title": "", "content": "", "photo": "" };
                        break;
                    case "link":
                        model = { "id": ID, "type": "link", "classes": "f-el", "style": "", "content": "", "icon": "" };
                        break;
                    case "table":
                        model =
                        {
                            "id": ID,
                            "type": "table",
                            "height": 0,
                            "width": 0,
                            "data": [],
                            "classes": "f-el",
                            "style": ""
                        }
                        break;
                    case "calc":

                        break;
                }
                blocks.push(model)
                newBlocks.push({ id: ID, content: "" })
                blocks[index].elements.push({
                    "type": type,
                    "id": ID
                });

                re_create("el_e_" + elementID, index);
            }
            break;
    }
    scructure_creator();

}

//Blocks models

//Gallery
let press = false;
let press_on = false;

document.addEventListener("mouseup", (e) => {
    press_on = false;
    press = false;

});
document.addEventListener("mousedown", (e) => {
    if (press == false) {
        press = true;
    }
});
let rect = null;
let r_t = 0;
let r_l = 0;
let EL = null

let last_cursor_top = 0;
let last_cursor_left = 0;

let indexC = 0;

let indexB = 0;
document.addEventListener("mousemove", (e) => {
    if (press_on == true && press == true) {
        if (EL.style.left == undefined || EL.style.left == "") {
            EL.style.left = "0px";
        }

        if (EL.style.top == undefined || EL.style.top == "") {
            EL.style.top = "0px";
        }

        const top = parseInt(EL.style.top, 10) + (e.y - last_cursor_top);
        const left = parseInt(EL.style.left, 10) + (e.x - last_cursor_left);
        EL.style.top = top + "px";
        EL.style.left = left + "px";

        last_cursor_top = e.y;
        last_cursor_left = e.x;
        blocks[indexB].positions[indexC] = [top, left];
    }
});

/**Gallery element creator */
const gallery = (element) => {
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)
    element = blocks[index]
    let imgStyle = "";
    if (element.imgStyle != undefined) {
        imgStyle = element.imgStyle;
    }
    switch (element.type1) {
        case "1":
            switch (element.elements.length) {
                case 1:
                    return div({ className: "gallery-1", id: id, style: element.style }, [
                        img("gallery-element-1 s-ga-el", {}, (element.id + "/" + element.elements[0]), undefined, imgStyle)
                    ]);
                case 2:
                    return div({ className: "gallery-1", id: id, style: element.style }, [
                        img("gallery-element-1-2 s-ga-el", {}, (element.id + "/" + element.elements[0]), undefined, imgStyle),
                        img("gallery-element-2-2 s-ga-el", {}, (element.id + "/" + element.elements[1]), undefined, imgStyle)
                    ]);
                case 3:
                    return div({ className: "gallery-1", id: id, style: element.style }, [
                        img("gallery-element-1-1 s-ga-el", {}, (element.id + "/" + element.elements[0]), undefined, imgStyle),
                        img("gallery-element-1-2-1 s-ga-el", {}, (element.id + "/" + element.elements[1]), undefined, imgStyle),
                        img("gallery-element-2-2 s-ga-el", {}, (element.id + "/" + element.elements[2]), undefined, imgStyle),
                    ]);
                case 4:
                    return div({ className: "gallery-1", id: id, style: element.style }, [
                        img("gallery-element-1-1 s-ga-el", {}, (element.id + "/" + element.elements[0]), undefined, imgStyle),
                        img("gallery-element-1-2-1 s-ga-el", {}, (element.id + "/" + element.elements[1]), undefined, imgStyle),
                        img("gallery-element-2-1 s-ga-el", {}, (element.id + "/" + element.elements[2]), undefined, imgStyle),
                        img("gallery-element-2-2-1 s-ga-el", {}, (element.id + "/" + element.elements[3]), undefined, imgStyle),
                    ]);
                default:
                    return div({ className: "gallery-1 f-el", id: id, style: element.style }, [
                        img("gallery-element-1 s-ga-el", {}, "image.svg")
                    ]);
                    break;

            }
            break;
        case "2":
            return div({ className: "gallery-2", id: id, style: element.style }, [
                img("gallery-2-element", {}, (element.id + "/" + element.elements[0]), undefined, imgStyle)
            ]);
            break;
        case "3":
            const gallery_3 = div({ className: "gallery-3", id: id, style: element.style }, []);
            element.elements.forEach((e, index) => {
                gallery_3.appendChild(img("gallery-3-el", {}, (element.id + "/" + e), undefined, element.imgStyle));
            })
            return gallery_3;
            break;
        case "4":
            const photos = [];

            element.elements.forEach((e, index) => {
                photos.push(img("gallery-element-4 s-ga-el img-x", {
                    mousedown: (e) => {
                        const el = e.target.parentNode;
                        rect = el.getBoundingClientRect();
                        r_t = rect.top;
                        r_l = rect.left;
                        press_on = true;
                        EL = e.target;
                        last_cursor_top = e.y;
                        last_cursor_left = e.x;
                        indexC = index;
                        indexB = blockIndex(element.id);
                    }

                }, (element.id + "/" + element.elements[index]), undefined, imgStyle, element.positions[index]))
            })
            return div({ className: "gallery-4", id: id, style: element.style }, photos);
            break;

    }

}

/**Card creator */
const card = (element) => {
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)
    element = blocks[index]

    const card = div({ className: "card", style: element.style, id: id }, [
        text_editor({ content: element.title, small: true, fun: (e) => { blocks[blockIndex(element.id)].title = e.target.innerHTML } }),
        text_editor({ content: element.content, small: true, fun: (e) => { blocks[blockIndex(element.id)].content = e.target.innerHTML } })
    ])

    return card;
}

/**Profile creator */
const card_with_photo = (element) => {
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)
    element = blocks[index]
    let imgStyle = "";
    if (element.imgStyle != undefined) {
        imgStyle = element.imgStyle;
    }
    const card = div({ className: "card", style: element.style, id: id }, [
        img("profile", {}, element.id + "/" + element.name, undefined, imgStyle),
        text_editor({ content: element.title, small: true, fun: (e) => { blocks[blockIndex(element.id)].title = e.target.innerHTML } }),
        text_editor({ content: element.content, small: true, fun: (e) => { ; blocks[blockIndex(element.id)].content = e.target.innerHTML; } })
    ])

    return card;
}

/**Link creator */
const link = (element) => {
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)
    element = blocks[index]
    let imgStyle = "";
    if (element.imgStyle != undefined) {
        imgStyle = element.imgStyle;
    }
    const link = div({
        className: "link", id: id, events: {
            click: (e) => {

            }
        }
    }, [
        img("link-icon", {}, element.id + "/" + element.name, undefined, imgStyle),
        text_editor({ content: element.content, small: true, fun: (e) => { blocks[index].content = e.target.innerHTML } })
    ])

    return link;
}

//Table

/**Table creator */
const table = (element) => {
    const id = "el_e_" + element.id;
    const index = blockIndex(element.id)
    element = blocks[index]


    const block =
        div({ className: "block f-el-dominant", id: id }, [
            div({ className: "flex-container", style: "justify-content: center; margin-top: 10px; margin-bottom: 10px;" }, [
                div({
                    className: "f-el top-bottom-m-b b-o", innerHTML: "Dodaj wiersz", events: {
                        click: () => {
                            for (let i = 0; i < element.width; i++) {
                                element.data[i].push("");
                            }
                            element.height = element.height + 1;
                            block.removeChild(block.lastChild);
                            block.appendChild(fill_table(blocks[index], element.id, block));
                        }
                    }
                }),
                div({
                    className: "f-el top-bottom-m-b b-o", innerHTML: "Dodaj kolumnę", events: {
                        click: () => {
                            const newColumn = []
                            for (let i = 0; i < element.height; i++) {
                                newColumn.push("");
                            }
                            element.data.push(newColumn);
                            element.width = element.width + 1;
                            block.removeChild(block.lastChild);
                            block.appendChild(fill_table(blocks[index], element.id, block));
                        }
                    }
                })
            ])

        ])
    block.appendChild(fill_table(element, element.id, block));
    return block;
}

/**Table filler */
const fill_table = (element, id, block) => {
    const table = div({ className: "table-container" }, []);
    const prc = 90 / (element.width);
    let gtc = "10% "
    for (let i = 1; i < element.width + 1; i++) {
        gtc += ` ${prc}%`;
    }
    let gtr = ""
    for (let i = 0; i < element.height + 1; i++) {
        gtr += " auto";
    }
    table.style.gridTemplateColumns = gtc;
    table.style.gridTemplateRows = gtr;
    for (let i = 0; i < element.width + 1; i++) {
        if (i != 0) {
            for (let j = 0; j < element.height + 1; j++) {
                if (j != 0) {
                    table.appendChild(table_cell(i, j, id));
                } else {
                    table.appendChild(column_switch(i, j, id, block))
                }
            }
        } else {
            for (let j = 1; j < element.height + 1; j++) {
                if (j != 0) {
                    table.appendChild(row_switch(i, j, id, block));
                }
            }
        }

    }
    return table;
}

/**Table cell creator */
const table_cell = (i, j, id) => {
    const style = "grid-column: " + (i + 1) + " / " + (i + 2) + ";grid-row: " + (j + 1) + " / " + (j + 2);
    const block = div({ className: "table-cell", style: style }, [
        text_editor({
            content: blocks[blockIndex(id)].data[i - 1][j - 1], fun: (e) => {
                blocks[blockIndex(id)].data[i - 1][j - 1] = e.target.innerHTML;
            }, small: true
        })
    ]);

    return block;
}

/**Row switcher */
const row_switch = (i, j, id, parent) => {
    const style = "grid-column: " + (i + 1) + " / " + (i + 2) + ";grid-row: " + (j + 1) + " / " + (j + 2);
    j -= 1;
    i -= 1;
    const block = div({ className: "table-cell flex-container", style: style }, [
        div({
            className: "f-el change-button", events: {
                click: () => {
                    for (let k = 0; k < blocks[blockIndex(id)].width; k++) {
                        if (j > 0) {
                            const copy = blocks[blockIndex(id)].data[k][j];
                            blocks[blockIndex(id)].data[k][j] = blocks[blockIndex(id)].data[k][j - 1];
                            blocks[blockIndex(id)].data[k][j - 1] = copy;
                        }
                    }
                    parent.removeChild(parent.lastChild);
                    parent.appendChild(fill_table(blocks[blockIndex(id)], id, parent));
                }
            }
        }, [div({ innerHTML: "W górę", className: "relative center-v" })]),
        div({
            className: "f-el change-button", events: {
                click: () => {
                    for (let k = 0; k < blocks[blockIndex(id)].width; k++) {
                        if (j < blocks[blockIndex(id)].height - 1) {
                            const copy = blocks[blockIndex(id)].data[k][j];
                            blocks[blockIndex(id)].data[k][j] = blocks[blockIndex(id)].data[k][j + 1];
                            blocks[blockIndex(id)].data[k][j + 1] = copy;
                        }
                    }
                    parent.removeChild(parent.lastChild);
                    parent.appendChild(fill_table(blocks[blockIndex(id)], id, parent));
                }
            }
        }, [div({ innerHTML: "W dół", className: "relative center-v" })])
    ]);
    return block;

}

/**Colum switcher */
const column_switch = (i, j, id, parent) => {
    const style = "grid-column: " + (i + 1) + " / " + (i + 2) + ";grid-row: " + (j + 1) + " / " + (j + 2);
    j -= 1;
    i -= 1;
    const block = div({ className: "table-cell flex-container", style: style }, [
        div({
            className: "f-el change-button", events: {
                click: () => {
                    if (i > 0) {
                        const copy = blocks[blockIndex(id)].data[i];
                        blocks[blockIndex(id)].data[i] = blocks[blockIndex(id)].data[i - 1];
                        blocks[blockIndex(id)].data[i - 1] = copy;
                    }
                    parent.removeChild(parent.lastChild);
                    parent.appendChild(fill_table(blocks[blockIndex(id)], id, parent));
                }
            }
        }, [div({ innerHTML: "W lewo", className: "relative center-v" })]),
        div({
            className: "f-el change-button", events: {
                click: () => {
                    if (i < blocks[blockIndex(id)].width - 1) {
                        const copy = blocks[blockIndex(id)].data[i];
                        blocks[blockIndex(id)].data[i] = blocks[blockIndex(id)].data[i + 1];
                        blocks[blockIndex(id)].data[i + 1] = copy;
                    }
                    parent.removeChild(parent.lastChild);
                    parent.appendChild(fill_table(blocks[blockIndex(id)], id, parent));
                }
            }
        }, [div({ innerHTML: "W prawo", className: "relative center-v" })])
    ]);
    return block;

}

//Calculator

/**Calculator creator */
const calculator = (element) => {

    const block = div({ className: "calculator" }, [
        div({ className: "c-m-title", innerHTML: "Kalkulator", style: "align-text: center; margin-left: 10px; margin-top: 10px;" })
    ])
    if (element.elements[0].type == "list") {
        drop_down_option(element.elements[0], element, block, []);
    } else {
        input_option(element.elements[0], element, block, []);
    }

    return block;
}

/**Calculator ending price*/
const calculate_price = (element, operations) => {
    let price = 1;
    if (element.start != undefined) {
        price = parseInt(element.start)
    }

    for (let i1 = 0; i1 < operations.length; i1++) {
        price += " " + operations[i1];
        const splited = price.split(" ");

        for (let i = 0; i < splited.length; i++) {
            switch (splited[i]) {
                case "*":
                    splited[i - 1] = parseFloat(splited[i - 1]) * parseFloat(splited[i + 1]);
                    splited.splice(i, 2);
                    i--;
                    break;
                case "/":
                    splited[i - 1] = parseFloat(splited[i - 1]) / parseFloat(splited[i + 1]);
                    splited.splice(i, 2);
                    i--;
                    break;
            }

        }
        for (let i = 0; i < splited.length; i++) {
            switch (splited[i]) {
                case "+":
                    splited[i - 1] = parseFloat(splited[i - 1]) + parseFloat(splited[i + 1]);
                    splited.splice(i, 2);
                    i--;
                    break;
                case "-":
                    splited[i - 1] = parseFloat(splited[i - 1]) - parseFloat(splited[i + 1]);
                    splited.splice(i, 2);
                    i--;
                    break;
            }
        }

        price = splited[0]
    }
    return price;
}

/**End creator */
const ending_option = (element, parent, operations) => {
    parent.appendChild(
        div({ innerHTML: calculate_price(element, operations) + " zł za lekcję", style: "margin-left: 10px; font-size: 20px;", className: "c-m-title" })
    )
}

/**Calculator drop down option creator */
const drop_down_option = (option, element, parent, operations) => {
    const childs = [];
    option.elements.forEach(e => {
        childs.push(cont({ type: "option", innerHTML: e.name }));
    });
    const options1 = cont({
        type: "select", className: "c-select", events: {
            change: (e) => {
                let INDEX = e.target.selectedIndex;
                const calculator = block.parentNode.childNodes;

                let was = false;
                for (let i = 0; i < calculator.length; i++) {
                    if (was == false) {
                        if (block == calculator[i]) {
                            was = true;
                            operations.splice(i - 1, calculator.length - i - 1);
                        }
                    } else {
                        block.parentNode.removeChild(calculator[i])
                        i--;
                    }
                }
                operations.push(option.elements[INDEX].operation)

                if (option.elements[INDEX].next != -1 && option.elements[INDEX].next != "") {
                    element.elements.forEach((e, index) => {
                        if (option.elements[INDEX].next == e.id) {
                            if (e.type == "list") {
                                drop_down_option(e, element, parent, operations);
                            } else {
                                input_option(e, element, parent, operations);
                            }
                        }
                    })
                } else {
                    ending_option(element, parent, operations)
                }
            }
        }
    }, childs)

    const block = div({ className: "c-option" }, [
        div({ className: "c-title", innerHTML: option.name }, []),
        div({ className: "c-drop-down" }, [options1])
    ])

    parent.appendChild(block)

    if (option.elements[0].next != -1 && option.elements[0].next != '') {
        element.elements.forEach((e, index) => {
            if (option.elements[0].next == e.id) {
                operations.push(option.elements[0].operation)
                if (e.type == "list") {
                    drop_down_option(e, element, parent, operations);
                } else {
                    input_option(e, element, parent, operations);
                }
            }
        })
    } else {
        operations.push(option.elements[0].operation)
        ending_option(element, parent, operations)
    }


}

/**Calculator input option creator */
const input_option = (option, element, parent, operations) => {
    const block = div({ className: "c-option" }, [])

    block.append(
        div({ className: "c-title", innerHTML: option.name }, []),
        div({ className: "c-input" }, [
            real_input("input-calculator", {
                input: (e) => {
                    let INDEX = 0;
                    for (let i = 0; i < option.elements.length; i++) {
                        if ((option.elements[i].down <= parseInt(e.target.value) && option.elements[i].up >= parseInt(e.target.value)) || (option.elements[i].down <= parseInt(e.target.value) && option.elements[i].up == -1)) {
                            INDEX = i;
                            i = option.elements.length;

                        }
                    }
                    const calculator = block.parentNode.childNodes;

                    let was = false;
                    for (let i = 0; i < calculator.length; i++) {
                        if (was == false) {
                            if (block == calculator[i]) {
                                was = true;
                                operations.splice(i - 1, calculator.length - i - 1);
                            }
                        } else {
                            block.parentNode.removeChild(calculator[i])
                            i--;
                        }
                    }
                    operations.push(option.elements[INDEX].operation)

                    if (option.elements[INDEX].next != -1 && option.elements[INDEX].next != "") {
                        element.elements.forEach((e, index) => {
                            if (option.elements[INDEX].next == e.id) {
                                if (e.type == "list") {
                                    drop_down_option(e, element, parent, operations);
                                } else {
                                    input_option(e, element, parent, operations);
                                }
                            }
                        })
                    } else {
                        ending_option(element, parent, operations)
                    }

                }
            }, 0)
        ])
    )
    parent.appendChild(block)
    if (option.elements[0].next != -1 && option.elements[0].next != '') {
        element.elements.forEach((e, index) => {
            if (option.elements[0].next == e.id) {
                operations.push(option.elements[0].operation)
                if (e.type == "list") {
                    drop_down_option(e, element, parent, operations);
                } else {
                    input_option(e, element, parent, operations);
                }
            }
        })
    } else {
        ending_option(element, parent, operations)
    }


}

//Account menager

/**Downloading user list */
const account_list = () => {
    document.getElementById("users-list").innerHTML = "";
    $.get(URL, (e) => {
        const downloaded = JSON.parse(e);
        let admin = false;
        downloaded.array.forEach((el, index) => {
            if (el.email === sessionStorage.getItem("email")) {
                if (el.userRange == "admin") {
                    admin = true;
                }
            }
        })
        downloaded.array.forEach((el, index) => {
            const block = div({ className: "horizontal-list card", style: "width: calc(100% - 20px); box-sizing: border-box; height: fit-content; min-height: unset;" }, [
                div({ className: "f-el-dominant", innerHTML: el.name }),
                div({ className: "f-el-dominant", innerHTML: el.userRange }),
                div({ className: "f-el-dominant", innerHTML: el.email }),
            ]);
            if (admin) {
                block.appendChild(
                    div({ className: "f-el-dominant " }, [
                        div({
                            className: "", innerHTML: "Usuń", events: {
                                click: (ev) => {
                                    deleteUser(el.email)
                                    document.getElementById("users-list").removeChild(document.getElementById("users-list").children[index]);
                                }
                            }
                        })
                    ])
                )
            }

            document.getElementById("users-list").appendChild(block);
        })

        document.getElementById("load").style.setProperty("height", "0px");

    })
}

/**Adding new user */
const addUser = () => {
    const email = document.getElementById("email-user").value;
    const range = document.getElementById("range-selector").selectedIndex == 0 ? "editor" : "admin";
    $.post(URL, { type: "new", token: sessionStorage.getItem("token"), sessionID: sessionStorage.getItem("sessionID"), email: email, range: range }, function (data) {
        account_list();
    });
}

/**Deleteing user */
const deleteUser = (email) => {
    $.post(URL, { type: "delete", token: sessionStorage.getItem("token"), sessionID: sessionStorage.getItem("sessionID"), email: email }, function (data) { });
}

/**Update user password */
const updatePassword = () => {
    const password = document.getElementById("password").value;
    const newPassword = document.getElementById("newPassword").value;
    $.post(URL, { email: sessionStorage.getItem("email"), type: "update", update_type: "password", token: sessionStorage.getItem("token"), session: sessionStorage.getItem("sessionID"), password: password, newPassword: newPassword }, function (data) { });
}
