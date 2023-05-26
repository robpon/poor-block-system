
//Variables
const toDelete = [];
const files = [];
const newBlocks = [];
const newContainers = [];
const structure = []
const blocks = []
const timeouts = [];

let controled = null;
let deleteAnimation = false;

/**Safe */
$(window).bind("beforeunload", function() { 
    return confirm("Press a button!\nEither OK or Cancel.");
});


//Index searching methods

/**Finding index of block element by given id */
const blockIndex = (id) => {
    let i = 0;
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === id) {
            return i;
        }
    }

}

/**Finding index of structure element by given id */
const structureIndex = (id) => {
    let i = 0;
    for (let i = 0; i < structure.length; i++) {
        if (structure[i].id === id) {
            return i;
        }
    }

}

/**Finding index of option element by given id */
const optionIndex = (id, calc) => {
    const calculator = structure[structureIndex(calc)];
    let i = 0;
    calculator.elements.forEach((e, index) => {
        if (e.id == id) {
            i = index;
        }
    })
    return i;
}

/**Generate uniqe index for given array */
const generateIndex = (array, type) => {
    let max = 0;
    array.forEach(e => {
        if (e.id > max) {
            max = e.id;
        }
    });
    max++;
    if (type != undefined) {
        toDelete.forEach((e, index) => {
            if (e.id == max && e.type == type) {
                toDelete.splice(index, 1);
            }
        })
    }
    return max;
}

/**Changing editor of block*/
const change_editor = (id) => {
    if (elementType == "option") {
        document.getElementById("editor-fr").innerHTML = "";
        document.getElementById("editor-fr").appendChild(option_editor(structureID, id))
    } else {
        document.getElementById("editor-fr").innerHTML = "";
        document.getElementById("editor-fr").appendChild(element_editor(id))
    }

}
/**Changing editor of structure element*/
const change_editor_s = (id) => {
    document.getElementById("editor-fr").innerHTML = "";
    document.getElementById("editor-fr").appendChild(structure_editor(id))
}

/**Convert arrays to drop down list*/
const goToList = (id, option) => {
    const goToList = [];

    const calc = structure[structureIndex(id)];

    calc.elements.forEach(e => {
        if (e.id != option) {
            goToList.push({ name: e.name, type: e.id });
        }
    })
    goToList.push({ name: "Koniec", type: -1 });
    return goToList;
}

/**Updates session token*/
const update_token_lifetime = () => {
    setTimeout(() => {
        $.post(URL, { token: sessionStorage.getItem("token"), session: sessionStorage.getItem("sessionID") }, (data) => {
            const data_json = JSON.parse(data);
            if (data_json.type == "success") {
                update_token_lifetime();
                document.getElementById("token-state").innerHTML = "Token zaktualizowany poprawnie"
            } else {
                document.getElementById("token-state").innerHTML = "Błąd " + (new Date()).toLocaleString();
                sessionStorage.removeItem("token")
                $.post(URL);
                window.location = "login.html";
            }
        });
    }, 15000);
}

/**Log out user*/
const log_out = () => {
    sessionStorage.removeItem("token")
    window.location = "login.html";
}


//Primaty elements creators

/**Create div HTML element*/
const div = (json, childs) => {
    const div = document.createElement('div');
    Object.keys(json).forEach(key => {
        switch (key) {
            case 'events':
                Object.keys(json.events).forEach(key => {
                    div.addEventListener(key, json.events[key]);
                });
                break;
            case "data_set":

                Object.keys(json.data_set).forEach(key => {
                    div.dataset[key] = json.data_set[key];
                })
                break;
            default:
                div[key] = json[key];
                break;
        }
    })
    if (Array.isArray(childs)) {
        childs.forEach(child => div.appendChild(child));
    }
    return div;
}

/**Create any of HTML element (you must set in json type of object)*/
const cont = (json, childs) => {
    const div = document.createElement(json.type);
    Object.keys(json).forEach(key => {
        switch (key) {
            case 'events':
                Object.keys(json.events).forEach(key => {
                    div.addEventListener(key, json.events[key]);
                });
                break;
            case "data_set":

                Object.keys(json.data_set).forEach(key => {
                    div.dataset[key] = json.data_set[key];
                })
                break;
            default:
                div[key] = json[key];
                break;
        }
    })
    if (Array.isArray(childs)) {
        childs.forEach(child => div.appendChild(child));
    }
    return div;
}

/**Create textarea HTML element*/
const input = (classes, events, text, id, placeholder) => {
    const div = document.createElement('textarea');
    div.className = classes;
    div.addEventListener('input', (event) => {
        event.target.style.height = "";
        event.target.style.height = event.target.scrollHeight + "px";
    });
    div.value = text;
    div.style.width = "90%";
    Object.keys(events).forEach(key => {
        div.addEventListener(key, events[key]);
    });
    if (id !== "" && id !== undefined) {
        div.id = id;
    }
    if (placeholder !== undefined) {
        div.placeholder = placeholder;
    }
    return div;
}

/**Create input HTML element*/
const real_input = (classes, events, text, placeholder, type, id, data_set) => {
    const div = document.createElement('input');
    div.className = classes;
    div.type = type;
    div.value = text;
    div.placeholder = placeholder;
    Object.keys(events).forEach(key => {
        div.addEventListener(key, (e) => {
            events[key](e)
        });
    });
    if (id !== "" && id !== undefined) {
        div.id = id;
    }
    if (data_set !== undefined) {
        Object.keys(data_set).forEach(key => {
            div.dataset[key] = data_set[key];
        })
    }
    return div;
}

/**Create button HTML element*/
const button = (classes, events, icon) => {
    const img = document.createElement('button');
    if (icon !== undefined) {
        const icon_obj = document.createElement('img');
        icon_obj.className = "format-icon"
        icon_obj.src = URL + icon;
        img.appendChild(icon_obj)
    }
    img.className = classes;
    Object.keys(events).forEach(key => {
        const img1 = img;
        img.addEventListener(key, (e) => {
            events[key](e, img1)
        });
    });
    return img;
}

/**Create img HTML element (old version)*/
const img = (classes, events, src, isFile, style, positions) => {
    const img = document.createElement('img');
    img.className = classes;
    console.log(style)
    img.style = style;
    img.crossOrigin = "Anonymous";

    if (isFile === undefined) {
        img.src = URL + src;
    } else {
        img.src = src;
    }
    if (positions != undefined) {
        img.style.top = positions[0] + "px";
        img.style.left = positions[1] + "px";
    }
    Object.keys(events).forEach(key => {
        const img1 = img;
        img.addEventListener(key, (e) => {
            events[key](e, img1)
        });
    });
    return img;
}

/**Download image*/
async function download_image(path, element) {
    const image = new Image();
    image.src = URL1 + path;
    image.onerror = () => {
        image.src = URL;
    }

    image.onload = () => {
        element.src = image.src;
    }


}

//Complex primary objects

/**Create text editor HTML label*/
const editor_label = () => {
    const block = div({ className: "flex-container" }, [
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("justifyLeft", false, null);
                console.log("Structure", structure)
                console.log("Blocks", blocks)


            }
        }, "a_left.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("justifyRight", false, null);

            }
        }, "a_right.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("justifyFull", false, null);

            }
        }, "a_full.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("justifyCenter", false, null);

            }
        }, "a_center.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("bold", false, null);

            }
        }, "bold.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("italic", false, null);

            }
        }, "italic.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand("underline", false, null);

            }
        }, "underline.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('styleWithCSS', false, true);
                document.execCommand("foreColor", false, ("#" + prompt("Kolor HEX", "")));
            }
        }, "palette.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('hiliteColor', false, ("#" + prompt("Kolor HEX", "")));

            }
        }, "highlight.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('insertOrderedList', false, true);

            }
        }, "numbers_list.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('insertUnorderedList', false, true);

            }
        }, "dots_list.svg"),
        ,
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('createLink', false, prompt("Nazwa linku", ""));
            }
        }, "link.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('unlink', false, false);
            }
        }, "unlink.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('removeFormat', false, false);
            }
        }, "removefor.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "1");
            }
        }, "c1.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "2");
            }
        }, "c2.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "3");
            }
        }, "c3.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "4");
            }
        }, "c4.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "5");
            }
        }, "c5.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "6");
            }
        }, "c6.svg"),
        button("top-bottom-m-b b-o-square", {
            click: () => {
                document.execCommand('fontSize', false, "7");
            }
        }, "c7.svg"),


    ]);
    return block;
}

/**Drop down element used to edit blocks*/
const drop_down_editor = (title, type, id, options, name, editor_block, current) => {
    let currentIndex = 0;
    console.log(title, options, name, editor_block, current)
    if (current != undefined && current.type == "index") {
        currentIndex = current.current;
    } else {
        if (current == undefined) {
            if (type == "options") {
                currentIndex = options.length - 1;
            } else {
                currentIndex = 0;
            }
        } else {
            if (current.current == -1) {

            } else {
                options.forEach((e, index) => {

                    if (e.type == current.current) {
                        currentIndex = index;
                    }
                })
            }

        }

    }

    const index = blockIndex(id);
    switch (type) {
        case "yes/no":
            const options2 = cont({ type: "select" }, [
                cont({ type: "option", innerHTML: "Tak" }),
                cont({ type: "option", innerHTML: "Nie" })
            ])
            const block = div({ className: "block", style: "padding-top:10px;" }, [
                div({ className: "", innerHTML: title }),
                cont({
                    type: "label", className: "dorop-down", events: {
                        change: (e) => {
                            blocks[index][name] = e.target.selectedIndex;
                        }
                    }
                }, [options2])
            ])
            return block;

            break;
        case "options":
            const childs = [];
            options.forEach(e => {
                childs.push(cont({ type: "option", innerHTML: e.name }));
            });
            const options1 = cont({ type: "select" }, childs)
            options1.selectedIndex = currentIndex;
            const block1 = div({ className: "block", style: "padding-top:10px;" }, [
                div({ className: "", innerHTML: title }),
                cont({
                    type: "label", className: "dorop-down", events: {
                        change: (e) => {
                            switch (name) {
                                case "justify-content":
                                    $("#el_e_" + id).css(name, options[e.target.selectedIndex].type);
                                    blocks[index].style = document.getElementById("el_e_" + id).getAttribute("style");
                                    break;
                                case "align-items":
                                    $("#el_e_" + id).css(name, options[e.target.selectedIndex].type);
                                    blocks[index].style = document.getElementById("el_e_" + id).getAttribute("style");
                                    break;
                                case "c_options":
                                    structure[structureIndex(id.id)].elements[optionIndex(id.option, id.id)][id.type] = options[e.target.selectedIndex].type;
                                    if (id.type == "type") {
                                        re_create_option_editor(id.id, id.option, editor_block);
                                    }
                                    break;
                                case "c_i_options":
                                    structure[structureIndex(id.id)].elements[optionIndex(id.option, id.id)].elements[id.inner_option][id.type] = options[e.target.selectedIndex].type;
                                    break;
                                default:
                                    blocks[index][name] = (e.target.selectedIndex + 1).toString();
                                    const currentID = document.getElementById("s_e_" + structureID).children[0].id.split("el_e_")[1];
                                    re_create("el_e_" + currentID, blockIndex(parseInt(currentID)));
                                    break;
                            }

                        }
                    }
                }, [options1])
            ])
            return block1;
            break;
    }

}

/**Input element used to edit style of block*/
const input_editor = (title, type, id, data) => {
    const index = blockIndex(id);
    if (document.getElementById("el_e_" + id) != undefined) {
        if (data == undefined) {
            const block = div({ className: "f-el block input-editor", style: "padding-top:10px;" }, [
                div({ className: "", innerHTML: title }),
                real_input("small-input", {
                    input: (e) => {
                        $("#el_e_" + id).css(type, e.target.value);
                        blocks[blockIndex(id)].style = document.getElementById("el_e_" + id).getAttribute("style");
                    }
                }
                    , document.getElementById("el_e_" + id).style[type], "")
            ])
            return block;
        } else {
            const block = div({ className: "f-el block input-editor", style: "padding-top:10px;" }, [
                div({ className: "", innerHTML: title })
            ])
            if (data.type == "inner_element") {
                switch (data.id) {
                    case "img":
                        block.appendChild(real_input("small-input", {
                            input: (e) => {
                                $("#el_e_" + id).children("img").css(type, e.target.value);
                                blocks[blockIndex(id)].imgStyle = document.getElementById("el_e_" + id).children[0].getAttribute("style");
                                console.log(blocks[blockIndex(id)].imgStyle);
                            }
                        }
                            , document.getElementById("el_e_" + id).children[0].style[type], ""))
                        break;
                }
            }
            return block;
        }

    } else {
        return div({});
    }
}

/**Input element used to edit block variables*/
const input_editor_in = (title, type, id) => {
    const index = blockIndex(id);
    if (document.getElementById("el_e_" + id) != undefined) {
        const block = div({ className: "f-el block", style: "padding-top:10px;" }, [
            div({ className: "", innerHTML: title }),
            real_input("small-input", {
                input: (e) => {
                    blocks[index][type] = e.target.value;
                }
            }
                , document.getElementById("el_e_" + id).style[type], "")
        ])
        return block;
    } else {
        return div({});
    }
}

/**Input element used to edit style of structure*/
const input_editor_s = (title, type, id, o) => {
    if (o == undefined) {
        const index = structureIndex(id);
        const block = div({ className: "f-el block input-editor", style: "padding-top:10px;" }, [
            div({ className: "", innerHTML: title }),
            real_input("small-input", {
                input: (e) => {
                    $("#s_e_" + id).css(type, e.target.value);
                    structure[index].style = document.getElementById("s_e_" + id).getAttribute("style");
                }
            }, document.getElementById("s_e_" + id).style[type], "")
        ])
        return block;
    } else {
        const index = structureIndex(id);
        const block = div({ className: "f-el block input-editor", style: "padding-top:10px;" }, [
            div({ className: "", innerHTML: title }),
            real_input("small-input", {
                input: (e) => {
                    structure[index][type] = e.target.value;
                }
            }, structure[index][type], "")
        ])
        return block;
    }

}

/**Photo element*/
const img_element = (classes, events, src, block, name, type) => {
    const img = document.createElement('img');
    img.className = classes;
    img.crossOrigin = "Anonymous";
    switch (type) {
        case "profile":
            download_image(src, img);
            break;
        default:
            download_image(src, img);

    }
    Object.keys(events).forEach(key => {
        const img1 = img;
        img.addEventListener(key, (e) => {
            events[key](e, img1)
        });
    });
    return img;
}

/**Getting file extenstion*/
const getFileExtension = (file) => {
    return file.name.split('.').pop()
}

/**Image element*/
const photo_element = (id, index, new_photo, parent) => {
    if (new_photo === false) {
        const block = div({ className: "block photo-element-container", style: "padding-top:10px;" }, [])

        block.append(
            div({
                className: "delete-photo", events: {
                    click: (e) => {
                        if (files.length == 0) {
                            toDelete.push({
                                type: "file",
                                dir: blocks[blockIndex(id)].id + "/" + blocks[blockIndex(id)].elements[index]
                            })
                        }
                        for (let i = 0; i < files.length; i++) {
                            if (files[i].name == blocks[blockIndex(id)].elements[index]) {
                                files.splice(i, 1)
                                i = files.length + 80;
                            }
                            if (i == files.length - 1) {
                                toDelete.push({
                                    type: "file",
                                    dir: blocks[blockIndex(id)].id + "/" + blocks[blockIndex(id)].elements[index]
                                })
                            }

                        }

                        blocks[blockIndex(id)].elements.splice(index, 1);
                        blocks[blockIndex(id)].positions.splice(index, 1);
                        block.parentNode.removeChild(block)
                    }
                }
            }, [
                img("relative center-v-h", {}, "/delete.svg")
            ]),
            img_element("photo-element", {}, blocks[blockIndex(id)].id + "/" + blocks[blockIndex(id)].elements[index], blocks[blockIndex(id)], blocks[blockIndex(id)].elements[index])
        )
        return block;
    } else {
        const block = div({
            className: "block", style: "padding-top:10px;", events: {
                click: (e) => {
                    const x = document.getElementById("file");
                    const y = x.cloneNode(true);

                    x.parentNode.replaceChild(y, x);
                    document.getElementById("file").addEventListener("change", (event) => {
                        const name = blocks[blockIndex(id)].lastID + "." + getFileExtension(event.target.files[0]);
                        blocks[blockIndex(id)].lastID++;
                        blocks[blockIndex(id)].positions.push([0, 0]);
                        blocks[blockIndex(id)].elements.push(name);
                        const newFile = {
                            id: blocks[blockIndex(id)].id,
                            file: event.target.files[0],
                            name: name
                        }
                        const reader = new FileReader();

                        reader.onload = (event1) => {
                            block.lastChild.src = event1.target.result;
                        }

                        reader.readAsDataURL(event.target.files[0]);
                        files.push(newFile);
                        block.parentNode.appendChild(photo_element(id, 0, true, block.parent))
                    })
                    document.getElementById("file").click();
                }
            }
        }, [
            img("photo-element", {}, "cc.png"),
        ])
        return block;
    }

}

/**Image elment for single photos*/
const photo_element_once = (id) => {
    const block = div({
        className: "f-el block", style: "padding-top:10px; width: calc(100%)", events: {
            click: (e) => {
                const x = document.getElementById("file");
                const y = x.cloneNode(true);

                x.parentNode.replaceChild(y, x);
                document.getElementById("file").addEventListener("change", (event) => {
                    const name = "one." + getFileExtension(event.target.files[0]);
                    const newFile = {
                        id: blocks[blockIndex(id)].id,
                        file: event.target.files[0],
                        name: name
                    }
                    blocks[blockIndex(id)].name = name;
                    const reader = new FileReader();

                    reader.onload = (event1) => {
                        block.children[0].src = event1.target.result;
                        document.getElementById("el_e_" + blocks[blockIndex(id)].id).children[0].src = event1.target.result
                    }
                    reader.readAsDataURL(event.target.files[0]);
                    files.push(newFile);
                    const clone = document.createElement("input");
                    clone.type = "file";
                    clone.id = "file";
                    document.getElementById("file").replaceWith(clone);
                })
                document.getElementById("file").click();
            }
        }
    }, [
        img_element("photo-element-1", {}, blocks[blockIndex(id)].id + "/" + blocks[blockIndex(id)].name),
    ])
    return block;
}

/**Photo element for structure*/
const photo_element_s = (id) => {
    const block = div({
        className: "f-el block", style: "padding-top:10px; width: 100%;", events: {
            click: (e) => {
                const x = document.getElementById("file");
                const y = x.cloneNode(true);

                x.parentNode.replaceChild(y, x);
                document.getElementById("file").addEventListener("change", (event) => {
                    const name = "background." + getFileExtension(event.target.files[0]);
                    const newFile = {
                        id: structure[structureIndex(id)].id + "_c",
                        blockID: structure[structureIndex(id)].id,
                        file: event.target.files[0],
                        name: name
                    }
                    structure[structureIndex(id)].name = name;
                    const reader = new FileReader();

                    reader.onload = (event1) => {
                        block.children[0].src = event1.target.result;
                        document.getElementById("s_e_" + structure[structureIndex(id)].id).children[0].style.backgroundImage = "url(" + event1.target.result + ")"
                    }
                    reader.readAsDataURL(event.target.files[0]);
                    files.push(newFile);
                    $('#file').off('change');
                })
                document.getElementById("file").click();
            }
        }
    }, [
        img_element("photo-element", {}, structure[structureIndex(id)].id + "_c/" + structure[structureIndex(id)].name),
    ])
    return block;
}

/**Editor generator for blocks*/
const element_editor = (id) => {
    console.log(id)

    if (document.getElementById("el_e_" + id) != undefined) {
        const element = blocks[blockIndex(id)];
        console.log(element)
        const block = div({ className: "vertical-list padding", style: "padding-top:6px;" }, [
            div({ innerHTML: "Edycja", style: "font-size: 20px; ", className: "editor-title" }),
            input_editor("Szerokość (px/%)", "width", id),
            input_editor("Wysokość (px/%)", "height", id),
            input_editor("Zaokrąglenie (px/%)", "border-radius", id),
            input_editor("Padding (px/%)", "padding", id),
            input_editor("Margines (px/%)", "margin", id),
            input_editor("Kolor", "background-color", id)
        ]);

        switch (element.type) {
            case "vertical-list":
                block.appendChild(drop_down_editor("Pozycja pozioma", "options", id, [{ name: "Lewo", type: "start" }, { name: "Środek", type: "center" }, { name: "Prawo", type: "end" }, { name: "Normalny", type: "normal" }], "justify-content"))
                block.appendChild(drop_down_editor("Pozycja pionowa", "options", id, [{ name: "Lewo", type: "start" }, { name: "Środek", type: "center" }, { name: "Prawo", type: "end" }, { name: "Normalny", type: "normal" }], "align-items"))
                break;
            case "horizontal-list":
                block.appendChild(drop_down_editor("Pozycja pozioma", "options", id, [{ name: "Lewo", type: "start" }, { name: "Środek", type: "center" }, { name: "Prawo", type: "end" }, { name: "Normalny", type: "normal" }], "justify-content"))
                block.appendChild(drop_down_editor("Pozycja pionowa", "options", id, [{ name: "Lewo", type: "start" }, { name: "Środek", type: "center" }, { name: "Prawo", type: "end" }, { name: "Normalny", type: "normal" }], "align-items"))
                break;
            case "link":
                block.appendChild(input_editor_in("Link", "link", id));
                block.append(
                    div({ innerHTML: "Edycja zdjęcia", style: "font-size: 20px; ", className: "editor-title" }),
                    input_editor("Szerokość (px/%)", "width", id, { type: "inner_element", id: "img" }),
                    input_editor("Wysokość (px/%)", "height", id, { type: "inner_element", id: "img" }),
                    input_editor("Zaokrąglenie (px/%)", "border-radius", id, { type: "inner_element", id: "img" }),
                    input_editor("Padding (px/%)", "padding", id, { type: "inner_element", id: "img" }),
                    input_editor("Margines (px/%)", "margin", id, { type: "inner_element", id: "img" }),
                    input_editor("Kolor", "background-color", id, { type: "inner_element", id: "img" })

                )
                block.appendChild(photo_element_once(id));
                break;
            case "gallery":
                block.append(
                    div({ innerHTML: "Edycja zdjęcia", style: "font-size: 20px; ", className: "editor-title" }),
                    input_editor("Szerokość (px/%)", "width", id, { type: "inner_element", id: "img" }),
                    input_editor("Wysokość (px/%)", "height", id, { type: "inner_element", id: "img" }),
                    input_editor("Zaokrąglenie (px/%)", "border-radius", id, { type: "inner_element", id: "img" }),
                    input_editor("Padding (px/%)", "padding", id, { type: "inner_element", id: "img" }),
                    input_editor("Margines (px/%)", "margin", id, { type: "inner_element", id: "img" }),
                    input_editor("Kolor", "background-color", id, { type: "inner_element", id: "img" })

                )

                block.appendChild(drop_down_editor("Mozliwość przyblizenia", "yes/no", id, undefined, "zoom"));
                block.appendChild(drop_down_editor("Typ", "options", id, [{ name: "Typ 1", type: "gallery-1" }, { name: "Typ 2", type: "gallery-2" }, { name: "Typ 3", type: "gallery-3" }, { name: "Typ 4", type: "gallery-4" }], "type1", undefined, { current: ("gallery-" + element.type1) }))
                switch (element.type1) {
                    case "2":
                        block.appendChild(input_editor("Czas animacji (s/ms)", "animation", id));
                        break;
                    case "3":
                        block.appendChild(input_editor("Czas animacji (s/ms)", "animation", id));
                        break;

                }
                block.appendChild(div({ className: "editor-title", style: "margin-top: 10px; font-size: 20px;", innerHTML: "Zdjęcia" }));
                element.elements.forEach((e, i) => {
                    block.appendChild(photo_element(id, i, false, block))
                })
                block.appendChild(photo_element(id, 0, true, block))
                break;
            case "profile":
                block.append(
                    div({ innerHTML: "Edycja zdjęcia", style: "font-size: 20px; ", className: "editor-title" }),
                    input_editor("Szerokość (px/%)", "width", id, { type: "inner_element", id: "img" }),
                    input_editor("Wysokość (px/%)", "height", id, { type: "inner_element", id: "img" }),
                    input_editor("Zaokrąglenie (px/%)", "border-radius", id, { type: "inner_element", id: "img" }),
                    input_editor("Padding (px/%)", "padding", id, { type: "inner_element", id: "img" }),
                    input_editor("Margines (px/%)", "margin", id, { type: "inner_element", id: "img" }),
                    input_editor("Kolor", "background-color", id, { type: "inner_element", id: "img" })

                )
                block.appendChild(div({ className: "", innerHTML: "Zdjęcie" }));
                block.appendChild(photo_element_once(id));
                break;

        }

        return block;
    } else {
        return div({});
    }

}

/**Editor generator for structure*/
const structure_editor = (id) => {
    const element = structure[structureIndex(id)];
    const block = div({ className: "vertical-list padding", style: "padding-top:6px;" }, [
        div({ innerHTML: "Edycja", style: "font-size: 20px; " }),
        input_editor_s("Nazwa bloku", "title", id, true),
        input_editor_s("Padding (px/%)", "padding", id),
        input_editor_s("Margines (px/%)", "margin", id),
        input_editor_s("Kolor", "background-color", id),
        photo_element_s(id)
    ]);

    block.appendChild(
        button("top-bottom-m-b b-o-square center-h relative", {
            click: () => {
                toDelete.push({ id: id, type: "structure-photo" })
                structure[structureIndex(id)].name = undefined;
                document.getElementById("s_e_" + structure[structureIndex(id)].id).children[0].style.backgroundImage = "url()"
            }
        }, "delete.svg")
    );
    return block;
}

/**Text editor generator*/
const text_editor = (json) => {
    var size = 10;

    if (json.small != undefined) {
        const editor = div({ className: "max-width center-h relative formatting-editor ", events: { input: json.fun }, contentEditable: "true", placeholder: "dd" }, []);
        editor.innerHTML = json.content;
        if (json.withLabel == true) {
            const block = div({ className: "text-editor-small", style: json.style }, [
                div({ innerHTML: json.name, className: "title" }, []),
                editor_label(),
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        } else {
            const block = div({ className: "text-editor-small", style: json.style }, [
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        }

    } else {
        const editor = div({ className: "max-width center-h relative formatting-editor", events: { input: json.fun }, contentEditable: "true", placeholder: "dd" }, []);
        editor.innerHTML = json.content;
        if (json.withLabel == true) {
            const block = div({ className: "text-editor", style: json.style }, [
                div({ innerHTML: json.name, className: "title" }, []),
                editor_label(),
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        } else {
            const block = div({ className: "text-editor", style: json.style }, [
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        }
    }

}

/**Text from editor generator*/
const text = (json) => {
    if (json.small != undefined) {
        const editor = div({ className: "max-width center-h relative formatting-editor ", events: { input: json.fun }, contentEditable: "false", placeholder: "dd" }, []);
        editor.innerHTML = json.content;
        if (json.withLabel == true) {
            const block = div({ className: "text-editor-small" }, [
                div({ innerHTML: json.name, className: "title" }, []),
                editor_label(),
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        } else {
            const block = div({ className: "text-editor-small" }, [
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        }

    } else {
        const editor = div({ className: "max-width center-h relative formatting-editor", events: { input: json.fun }, contentEditable: "false", placeholder: "dd" }, []);
        editor.innerHTML = json.content;
        if (json.withLabel == true) {
            const block = div({ className: "text-editor" }, [
                div({ innerHTML: json.name, className: "title" }, []),
                editor_label(),
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        } else {
            const block = div({ className: "text-editor" }, [
                editor
            ])
            if (json.id !== undefined) {
                block.id = json.id;
            }
            return block;
        }
    }

}

/**Input editor*/
const input_editor_op = (title, type, id, option, inner_option) => {
    const block = div({ className: "f-el block input-editor", style: "padding-top:10px;" }, [
        div({ className: "", innerHTML: title }),
        real_input("small-input", {
            input: (e) => {
                structure[structureIndex(id)].elements[optionIndex(option, id)].elements[inner_option][type] = e.target.value;
            }
        }, structure[structureIndex(id)].elements[optionIndex(option, id)].elements[inner_option][type], "")
    ])
    return block;
}


/**Option element for drop down*/
const option_element = (id, option, inner_option, e) => {
    let open = false;
    const block = div({ className: "drop" }, [
        div({
            className: "", innerHTML: "Opcja " + (inner_option + 1), events: {
                click: (e) => {
                    if (open) {
                        e.target.parentNode.children[1].classList.remove("open-drop");
                        e.target.parentNode.children[1].classList.add("hidden-drop");
                    } else {
                        e.target.parentNode.children[1].classList.add("open-drop");
                        e.target.parentNode.children[1].classList.remove("hidden-drop");
                    }

                    open = !open;
                }
            }
        }),
        div({ className: " hidden-drop", innerHTML: "" }, [
            input_editor_op("Nazwa", "name", id, option, inner_option),
            input_editor_op("Wartość", "value", id, option, inner_option),
            drop_down_editor("Następna opcja (domyślna)", "options", { option, id, inner_option, type: "next" }, goToList(id, option), "c_i_options"),
            input_editor_op("Operacja", "operation", id, option, inner_option)
        ])
    ])

    return block;
}

/**Option element for input*/
const option_element_1 = (id, option, inner_option, e) => {
    let open = true;
    const block = div({ className: "drop" }, [
        div({
            className: "", innerHTML: "Opcja " + (inner_option + 1), events: {
                click: (e) => {
                    if (open) {
                        e.target.parentNode.children[1].classList.remove("open-drop");
                        e.target.parentNode.children[1].classList.add("hidden-drop");
                    } else {
                        e.target.parentNode.children[1].classList.add("open-drop");
                        e.target.parentNode.children[1].classList.remove("hidden-drop");
                    }

                    open = !open;
                }
            }
        }),
        div({ className: "hidden-drop", innerHTML: "" }, [
            input_editor_op("Granica dolna", "down", id, option, inner_option),
            input_editor_op("Granica górna", "up", id, option, inner_option),
            input_editor_op("Nazwa", "name", id, option, inner_option),
            input_editor_op("Wartość", "value", id, option, inner_option),
            drop_down_editor("Następna opcja (domyślna)", "options", { option, id, inner_option, type: "next" }, goToList(id, option), "c_i_options", undefined, { current: option.next, x: true }),
            input_editor_op("Operacja", "operation", id, option, inner_option)
        ])
    ])

    return block;
}

/**Option element for drop down*/
const type_editor = (id, option, parent) => {
    const calc = structure[structureIndex(id)];
    const currentOption = calc.elements[optionIndex(option, id)];
    const block = div({}, []);
    if (currentOption.type == "list") {
        const elements = currentOption.elements;
        elements.forEach((e, index) => {
            block.appendChild(option_element(id, option, index, e))
        });
    } else {
        const elements = currentOption.elements;
        elements.forEach((e, index) => {
            block.appendChild(option_element_1(id, option, index, e))
        });
    }

    block.appendChild(div({
        innerHTML: 'Dodaj opcje', events: {
            click: (e) => {
                structure[structureIndex(id)].elements[optionIndex(option, id)].elements.
                    push({ id: generateIndex(structure[structureIndex(id)].elements[optionIndex(option, id)].elements), name: "", value: "", next: "", operation: "", down: 0, up: 0 });
                re_create_option_editor(id, option, parent)
            }
        }
    }, []))
    return block;

}

/**Recreator of option*/
const re_create_option_editor = (id, option, block) => {
    const calc = structure[structureIndex(id)];
    const currentOption = calc.elements[optionIndex(option, id)];
    block.innerHTML = "";
    block.append(drop_down_editor("Type", "options", { option, id, type: "type", block }, [{ name: "Liczba", type: "number" }, { name: "Lista", type: "list" }], "c_options", block, { current: currentOption.type, type: "type" }),
        drop_down_editor("Następna opcja (domyślna)", "options", { option, id, type: "next" }, goToList(id, option), "c_options", block, { current: currentOption.next, type: "type" }),
        div({ className: "f-el block", style: "padding-top:10px;" }, [
            div({ className: "", innerHTML: "Nazwa opcji" }),
            real_input("small-input", {
                input: (e) => {
                    structure[structureIndex(id)].elements[optionIndex(option, id)].name = e.target.value;
                }
            }, currentOption.name, "")
        ]),
        type_editor(id, option, block))
}

/**Creator of option*/
const option_editor = (id, option) => {
    const calc = structure[structureIndex(id)];
    const currentOption = calc.elements[optionIndex(option, id)];
    const block = div({}, [])
    block.append(drop_down_editor("Type", "options", { option, id, type: "type" }, [{ name: "Liczba", type: "number" }, { name: "Lista", type: "list" }], "c_options", block, { current: currentOption.type, type: "type" }),
        drop_down_editor("Następna opcja (domyślna)", "options", { option, id, type: "next" }, goToList(id, option), "c_options", block, { current: currentOption.next, type: "type" }),
        div({ className: "f-el block", style: "padding-top:10px;" }, [
            div({ className: "", innerHTML: "Nazwa opcji" }),
            real_input("small-input", {
                input: (e) => {
                    structure[structureIndex(id)].elements[optionIndex(option, id)].name = e.target.value;
                }
            }, currentOption.name, "")
        ]),
        type_editor(id, option, block))

    return block;
}


/**Uploading method*/
const upload = () => {
    console.log("Upload", structure)
    console.log("New Blocks", newBlocks)
    console.log("New Containers", newContainers);
    console.log("To delete", toDelete);
    document.getElementById("load").style.setProperty("height", "100%");
    $.post(URL, {
        newContainers: convert(newContainers),
        containers: convert(structure),
        newBlocks: convert(newBlocks),
        blocks: convert(blocks),
        toDelete: JSON.stringify(toDelete)
    }, (e) => {
        console.log(e)
        if (files.length == 0) {
            document.getElementById("load").style.setProperty("height", "0px");
            download()
        }

        files.forEach(e => {
            var formData = new FormData();

            formData.append("file", e.file);
            formData.append("name", e.name);
            formData.append("id", e.id);
            $.ajax({
                type: "POST", url: UR, data: formData, async: true,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                success: function (response) {
                    document.getElementById("load").style.setProperty("height", "0px");

                    download()
                },
                timeout: 60000
            })
        })

    })
}

/**Converter*/
const convert = (array) => {
    const coverted = [];

    array.forEach(e => {
        coverted.push({
            id: e.id,
            str: JSON.stringify(e)
        })
    })
    return JSON.stringify(coverted);
}