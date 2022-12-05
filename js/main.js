import classificationsTree from './complaintClassificationJson.json' assert {type: 'json'};
var selectedItems = new Map();

class MillerColumnCategory {
    constructor(categoryId = null, categoryName = null, parentId = null, isLowestLevel = true, items = []) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.parentId = parentId;
        this.isLowestLevel = isLowestLevel;
        this.items = items;
        this.query = null;
    }

    // filterItems() {
    //     if (this.query)
    //         return this._items.filter(x => x.itemName.includes(this.query))
    //     return this._items;
    // }

    // set items(items) {
    //     this._items = items;
    // }

    // get items() {
    //     return this.filterItems();
    // }
}

class MillerColumnCategoryItem {
    constructor(itemId, itemName, itemValue, itemAnswer, categoryId, parentId, searchResult, childCategory) {
        this.itemId = itemId ?? null;
        this.itemName = itemName ?? null;
        this.itemValue = itemValue ?? null;
        this.itemAnswer = itemAnswer ?? null;
        this.categoryId = categoryId ?? null;
        this.parentId = parentId ?? null;
        this.hasChildren = childCategory ? true : false;
        this.childCategory = childCategory ?? null;
        this.isDeletable = true;
        this.searchResult = searchResult ?? null;
    }
}

class BaseCategoryNode {
    constructor(id = null, text = null, answer = null, value = null, categoryId = null, parentNodeId = null, nodes = [], searchResult = null) {
        this.id = id;
        this.text = text;
        this.value = value;
        this.answer = answer;
        this.categoryId = categoryId;
        this.parentNodeId = parentNodeId;
        this.nodes = nodes;
        this.searchResult = searchResult;
    }
}

$(document).ready(onLoad);

const CATEGORIES = new Map();
let rootMillerColumnCategory;
let $millerCol;

function onLoad() {

    CATEGORIES.set('1', 'فئة الشكوي');
    CATEGORIES.set('2', 'Main Classification');
    CATEGORIES.set('3', 'Sub Classification');

    prepareDataForMillerCols();
    setupEditEventsOnMillerCols();
    OnSelectItemsSave();
    $('.filterItems').val('').trigger('change');
    $('.filterItems').change(function () {
        let query = $(this).val()
        FilterOnSearch.call(this, query);
    });
}

function MapClassificationsToParentMillerColumnCategory(parentCatNode, categoryId) {
    // 1- prepare parent category
    let parentCategory = new MillerColumnCategory(categoryId, CATEGORIES.get(categoryId), null, false);
    if (parentCatNode?.nodes?.length) {
        //2- populate child category items using  cat nodes
        for (let node of parentCatNode.nodes) {
            let millerColumnCategoryItem = prepareCategoryItem(node, (Number(categoryId) + 1) + "", categoryId, null);
            parentCategory.items.push(millerColumnCategoryItem);
        }
    }
    return parentCategory;
}

function prepareCategoryItem(categoryNode, categoryId, parentCategoryId, parentId) {
    // 1 - prepare node as miller column item 
    let categoryItem = new MillerColumnCategoryItem(categoryNode.id, categoryNode.text, categoryNode.value, categoryNode.answer, parentCategoryId, parentId, categoryNode.searchResult)
    if (categoryNode?.nodes?.length) {
        // 2- prepare child category
        let childCategory = new MillerColumnCategory(categoryId, CATEGORIES.get(categoryId), parentCategoryId, categoryId == '3');

        //3- populate child category items using  cat nodes
        for (let node of categoryNode.nodes) {
            let millerColumnCategoryItem = prepareCategoryItem(node, (Number(categoryId) + 1) + "", categoryId, categoryNode.id);
            childCategory.items.push(millerColumnCategoryItem);
        }

        categoryItem.hasChildren = true;

        //4- set child category
        categoryItem.childCategory = childCategory;
    }

    return categoryItem;
}


function prepareCategoryNodeNestedNodes(parentNode) {
    if (parentNode?.nodes?.length)
        for (let itemIndex in parentNode.nodes) {
            let node = parentNode.nodes[itemIndex];
            let categoryId = (Number(parentNode.categoryId) + 1) + "";
            let uid = parentNode.id + '-' + (Number(itemIndex) + 1);
            node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(uid, node.text, node.answer ?? null, node.id, categoryId, parentNode.id, node.nodes, node.searchResult));
            parentNode.nodes[itemIndex] = node;
        }
    return parentNode;
}

function getComplaintCategoriesNodes(dataItems) {
    let nodes = [];
    for (let itemIndex in dataItems) {
        let item = dataItems[itemIndex];
        let uid = (Number(itemIndex) + 1) + "";
        let node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(uid, item.text, item.answer ?? null, item.id, "1", null, item.nodes, item.searchResult));
        nodes.push(node);
    }
    return nodes;
}

var complaintCategories;

function prepareDataForMillerCols(searchResult = null) {
    let dataTreeList = JSON.parse(JSON.stringify(complaintCategories ?? []));
    if (!dataTreeList?.length)
        dataTreeList = complaintCategories = getComplaintCategoriesNodes(classificationsTree);
    else if (searchResult)
        dataTreeList = searchResult;
    let parentCategoryNode = new BaseCategoryNode(null, null, null, null, null, null, dataTreeList);
    rootMillerColumnCategory = MapClassificationsToParentMillerColumnCategory(parentCategoryNode, '1');
    $millerCol = $("#category-miller-cols-container");

    $millerCol.millerColumn({
        isReadOnly: false,
        initData: rootMillerColumnCategory
    });
    //
    RestoreSelectedItems();
}

function RestoreSelectedItems() {

    if (selectedItems?.size) {
        selectedItems = new Map([...selectedItems].sort());
        for (let [key, value] of selectedItems) {
            let item = getMillerColItemById(rootMillerColumnCategory, value);
            if (item) {
                $(`.miller-col-list-item[data-category-id="${key}"][data-item-id="${value}"]`).click();
            }
        }
    }
}


function FilterOnSearch(query) {
    if (!query?.length)
        return prepareDataForMillerCols();

    let searchResult = JSON.parse(JSON.stringify(complaintCategories)); // to clone the array with new different nested references
    searchResult = searchResult.filter(item => filterItemAndNodes(item, query.toLowerCase()));
    console.log('search results: ', searchResult);
    return prepareDataForMillerCols(searchResult);
}

function filterItemAndNodes(item, query) {
    //first step - loop through to filter nodes
    if (item?.nodes?.length)
        item.nodes = item.nodes.filter(item => filterItemAndNodes(item, query));

    //last step - check if matched item 
    if (item?.text && item.text.toLowerCase().includes(query)) {
        item.searchResult = {
            startIndex: item.text.toLowerCase().indexOf(query),
            length: query.length
        };
        return true;
    }
    else // or has children that match
        return item?.nodes?.length;
}
var iconList = [];

function prepareDialogFullBody(isQA = false) {

    let dialogFullbody = $("<div/>");
    let dialogBody = $("<div/>").addClass("middle-body");

    dialogBody.append($("<i/>").attr("id", "element-icon").attr("name", "iconName").addClass("material-icons").addClass("dropbtn").text("clear").attr("onclick", "toggleDropdown()"));

    let dialogDropdown = $("<div/>").attr("id", "myDropdown").addClass("dropdown-content");

    for (var k = 0; k < iconList.length; k++) {
        $dialogDropdown.append($("<div/>").addClass("dropdown-element").append($("<i/>").addClass("material-icons").text(iconList[k])));
    }

    dialogBody.append(dialogDropdown);
    dialogBody.append($("<input/>").attr("name", "itemValue").attr("placeholder", "enter item value"));
    if (!isQA) {
        dialogBody.append($("<input/>").attr("name", "itemName").attr("placeholder", "enter item name"));
    } else {
        dialogBody.append($("<input/>").attr("name", "itemQuestion").attr("placeholder", "enter question"));
        dialogBody.append($("<input/>").attr("name", "itemAnswer").attr("placeholder", "enter answer"));
    }
    dialogBody.append($("<div/>").addClass("clearfix"));

    let dialogFooter = $("<div/>").addClass("footer");
    let buttonCreate = $("<button/>").attr("type", "button").addClass("button create").append($("<i/>").addClass("material-icons").addClass("add").text("add"));

    dialogFooter.append(buttonCreate).append($("<div/>").addClass("clearfix"));

    dialogFullbody.append(dialogBody);
    dialogFullbody.append(dialogFooter);

    return dialogFullbody;
}

function OnSelectItemsSave() {
    $millerCol.on("item-selected", ".miller-col-list-item", function (event, data) {
        if (data.categoryId)
            selectedItems.set(data.categoryId, data.itemId);
    });
}

function setupEditEventsOnMillerCols() {

    $millerCol.on("col-add-item", ".miller-col-container", function (event, data) {
        debugger
        let isQA = data.categoryId == 2 /* for QA */;
        let dialogFullbody = prepareDialogFullBody(isQA);
        var dialog = createDialog(dialogFullbody, "Create child for: " + data.itemName);

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.create").on("click touch", function (event) {


            let itemValue = $(this).closest("#popup").find("input[name='itemValue']").val();
            let itemName, itemAnswer;

            if (isQA) {
                itemName = $(this).closest("#popup").find("input[name='itemQuestion']").val();
                itemAnswer = $(this).closest("#popup").find("input[name='itemAnswer']").val();
            }
            else
                itemName = $(this).closest("#popup").find("input[name='itemName']").val();

            let parentCategoryId = (parseInt(data.categoryId) - 1) + "";

            let uid = Number(data.itemId) + '-';
            let insertedNode = new BaseCategoryNode("", itemName, itemAnswer ?? null, itemValue, data.categoryId, data.itemId);
            if (parentCategoryId == "0") {//top parent node
                uid += complaintCategories.length + 1;
                insertedNode.id = uid;
                complaintCategories.push(insertedNode);
            }
            else {
                let parentNode = findDeleteNodeByNodeIdCatId(new BaseCategoryNode(null, null, null, null, "1", null, complaintCategories), data.parentId);
                uid += parentNode.nodes.length + 1;
                insertedNode.id = uid;
                insertedNode.parentNodeId = parentNode.id;
                parentNode.nodes.push(insertedNode);
            }


            prepareDataForMillerCols();

            $("#popup").remove();

        });

        $("body").append(dialog);

        dialog = dialog.popup({
            width: 400,
            height: "auto",
            top: 100
        });

        dialog.open();

    });

    $millerCol.on("add-item", ".miller-col-list-item", function (event, data) {
        debugger
        let isQA = data.categoryId == 2 /* for QA */;
        let dialogFullbody = prepareDialogFullBody(isQA);
        var dialog = createDialog(dialogFullbody, "Create child for: " + data.itemName);

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.create").on("click touch", function (event) {
            let itemName, itemAnswer;
            let itemValue = $(this).closest("#popup").find("input[name='itemValue']").val();
            if (isQA) {
                itemName = $(this).closest("#popup").find("input[name='itemQuestion']").val();
                itemAnswer = $(this).closest("#popup").find("input[name='itemAnswer']").val();
            }
            else
                itemName = $(this).closest("#popup").find("input[name='itemName']").val();


            // data is the parent item
            let childCategoryId = (Number(data.categoryId) + 1) + "";

            let uid = Number(data.itemId) + '-';
            let insertedNode = new BaseCategoryNode("", itemName, itemAnswer ?? null, itemValue, childCategoryId, data.itemId);

            let parentNode = findDeleteNodeByNodeIdCatId(new BaseCategoryNode(null, null, null, null, "1", null, complaintCategories), data.itemId);
            uid += parentNode.nodes.length + 1;
            insertedNode.id = uid;
            insertedNode.parentNodeId = parentNode.id;
            parentNode.nodes.push(insertedNode);

            prepareDataForMillerCols();

            $("#popup").remove();

        });

        $("body").append(dialog);

        dialog = dialog.popup({
            width: 400,
            height: "auto",
            top: 100
        });

        dialog.open();

    });

    $millerCol.on("edit-column-title", ".miller-col-container", function (event, data) {

        var $dialogFullbody = $("<div/>");
        var $dialogBody = $("<div/>").addClass("middle-body");

        var $dialogDropdown = $("<div/>").attr("id", "myDropdown").addClass("dropdown-content");

        for (var k = 0; k < iconList.length; k++) {
            $dialogDropdown.append($("<div/>").addClass("dropdown-element").append($("<i/>").addClass("material-icons").text(iconList[k])));
        }

        $dialogBody.append($dialogDropdown);

        $dialogBody.append($("<input/>").attr("name", "categoryName"));
        $dialogBody.append($("<div/>").addClass("clearfix"));

        var $dialogFooter = $("<div/>").addClass("footer");
        var $buttonCreate = $("<button/>").attr("type", "button").addClass("button create").append($("<i/>").addClass("material-icons").addClass("add").text("add"));

        $dialogFooter.append($buttonCreate).append($("<div/>").addClass("clearfix"));

        $dialogFullbody.append($dialogBody);
        $dialogFullbody.append($dialogFooter);

        var dialog = createDialog($dialogFullbody, "Update: " + data.categoryName);

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.create").on("click touch", function (event) {

            var catName = $(this).closest("#popup").find("input[name='categoryName']").val();
            data.categoryName = catName;
            CATEGORIES.set(data.categoryId, data.categoryName);
            $millerCol.millerColumn("updateCategory", data);

            $("#popup").remove();

        });

        $("body").append(dialog);

        dialog = dialog.popup({
            width: 400,
            height: "auto",
            top: 100
        });

        dialog.open();

    });

    $millerCol.on("delete-item", ".miller-col-list-item", function (event, data) {

        var $dialogBody = $("<div/>");

        $dialogBody.append("Are you sure you want to delete this item?");

        var $dialogFooter = $("<div/>").addClass("footer");
        var $buttonCreate = $("<button/>").attr("type", "button").addClass("delete button").append($("<i/>").addClass("material-icons").addClass("delete").text("delete"));

        $dialogFooter.append($buttonCreate).append($("<div/>").addClass("clearfix"));

        $dialogBody.append($dialogFooter);

        var dialog = createDialog($dialogBody, "Delete Item " + data.itemName);

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.delete").on("click touch", function () {
            debugger
            findDeleteNodeByNodeIdCatId(new BaseCategoryNode(null, null, null, null, "1", null, complaintCategories), data.itemId, true);
            prepareDataForMillerCols();
            $("#popup").remove();

        });

        $("body").append(dialog);

        dialog = dialog.popup({
            width: 400,
            height: "auto",
            top: 100
        });

        dialog.open();

    });


    $millerCol.on("edit-item", ".miller-col-list-item", function (event, data) {

        let dialogFullbody = prepareDialogFullBody(data.categoryId == 3 /* for QA */);
        let dialog = createDialog(dialogFullbody, "Edit Item for: " + data.itemName);

        $(dialog).on("click touch", ".popup-close", function () {
            $("#popup").remove();
        });

        $(dialog).find(".button.positive").on("click touch", function () {

            let itemName = $(this).closest("#popup").find("input[name='itemName']").val();
            let iconName = $(this).closest("#popup").find("i[name='iconName']").html();
            if (iconName == "clear") iconName = "";

            let categoryItem = findDeleteNodeByNodeIdCatId(new BaseCategoryNode(null, null, null, null, "1", null, complaintCategories), data.itemId)

            categoryItem.text = itemName;
            prepareDataForMillerCols();

            $("#popup").remove();

        });

        $("body").append(dialog);

        dialog = dialog.popup({
            width: 400,
            height: "auto",
            top: 100
        });

        dialog.open();
    });

    const createDialog = function (dialogBodyContent, dialogTitle) {

        //remove prev popup instances
        $("#popup").remove();

        var $dialog = $("<div/>").attr("id", "popup").addClass("popup-wrapper hide");
        var $dialogContent = $("<div/>").addClass("popup-content");
        var $dialogTitle = $("<div/>").addClass("popup-title");
        var $btnClose = $("<button/>").attr("type", "button").addClass("popup-close").text("X");
        var $h3 = $("<h3/>").text(dialogTitle);
        var $dialogBody = $("<div/>").addClass("popup-body").append(dialogBodyContent);

        $dialogTitle.append($btnClose).append($h3);

        $dialogContent.append($dialogTitle).append($dialogBody);

        return $dialog.append($dialogContent);
    }

    const findDeleteNodeByNodeIdCatId = function (rootNode, queryItemId, queryDelete = false) {

        if (rootNode?.nodes.length && queryItemId) {
            let result;
            for (let item of rootNode.nodes) {
                if (item.id == queryItemId) {
                    if (queryDelete) {
                        if (queryItemId.split('-').length == 1)//if top parent list as recognized by '-' of nested uid
                            complaintCategories = complaintCategories.filter(x => x.id != item.id);
                        else
                            rootNode.nodes = rootNode.nodes.filter(x => x.id != item.id);
                    }
                    return item;
                }
                else {
                    result = findDeleteNodeByNodeIdCatId(item, queryItemId, queryDelete);
                    if (result)
                        return result;
                }
            }
        }
        return null;
    }
}

function getMillerColItemById(rootCategory, queryItemId) {
    if (rootCategory?.items.length && queryItemId) {
        let result;
        for (let item of rootCategory.items) {
            if (item.itemId == queryItemId)
                result = item;
            else
                result = getMillerColItemById(item.childCategory, queryItemId);
            if (result)
                return result;
        }
    }
    return null;
}