import classificationsTree from './complaintClassificationJson.json' assert {type: 'json'};
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
    constructor(itemId, itemName, categoryId, parentId, searchResult, childCategory) {
        this.itemId = itemId ?? null;
        this.itemName = itemName ?? null;
        this.categoryId = categoryId ?? null;
        this.parentId = parentId ?? null;
        this.hasChildren = childCategory ? true : false;
        this.childCategory = childCategory ?? null;
        this.isDeletable = true;
        this.searchResult = searchResult ?? null;
    }
}

class BaseCategoryNode {
    constructor(id = null, text = null, categoryId = null, nodes = [], searchResult = null) {
        this.id = id;
        this.text = text;
        this.categoryId = categoryId;
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
    let categoryItem = new MillerColumnCategoryItem(categoryNode.id, categoryNode.text, parentCategoryId, parentId, categoryNode.searchResult)
    // 2- prepare child category
    let childCategory = new MillerColumnCategory(categoryId, CATEGORIES.get(categoryId), parentCategoryId, categoryId == '3');
    if (categoryNode?.nodes?.length) {
        //3- populate child category items using  cat nodes
        for (let node of categoryNode.nodes) {
            let millerColumnCategoryItem = prepareCategoryItem(node, (Number(categoryId) + 1) + "", categoryId, categoryNode.id);
            childCategory.items.push(millerColumnCategoryItem);
        }

        categoryItem.hasChildren = true;
    }
    //4- set child category
    categoryItem.childCategory = childCategory;

    return categoryItem;
}


function prepareCategoryNodeNestedNodes(categoryNode) {
    if (categoryNode?.nodes?.length)
        for (let node of categoryNode.nodes) {
            node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(node.id, node.text, (parseInt(categoryNode.categoryId) + 1) + "", node.nodes, node.searchResult));
            let foundNodeIndex = categoryNode.nodes.findIndex(x => x.id === node.id);
            if (foundNodeIndex > -1)
                categoryNode.nodes[foundNodeIndex] = node;
        }
    return categoryNode;
}

function getComplaintCategoriesNodes(dataItems) {
    let nodes = [];
    for (let item of dataItems) {
        let node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(item.id, item.text, "1", item.nodes, item.searchResult));
        nodes.push(node);
    }
    return nodes;
}
var complaintCategories;
function prepareDataForMillerCols() {
    if (!complaintCategories?.length)
        complaintCategories = getComplaintCategoriesNodes(classificationsTree);
    var parentCategoryNode = new BaseCategoryNode(null, null, null, complaintCategories);
    rootMillerColumnCategory = MapClassificationsToParentMillerColumnCategory(parentCategoryNode, '1');
    $millerCol = $("#category-miller-cols-container");

    $millerCol.millerColumn({
        isReadOnly: false,
        initData: rootMillerColumnCategory
    });
}

function FilterOnSearch(query) {
    if (!query?.length)
        return prepareDataForMillerCols(classificationsTree);

    let searchResult = JSON.parse(JSON.stringify(classificationsTree)); // to clone the array with new different nested references
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


function setupEditEventsOnMillerCols() {
    var iconList = ["clear", "store", "call", "wifi", "portrait"];

    $millerCol.on("add-item", ".miller-col-container", function (event, data) {

        var $dialogFullbody = $("<div/>");
        var $dialogBody = $("<div/>").addClass("middle-body");

        $dialogBody.append($("<i/>").attr("id", "element-icon").attr("name", "iconName").addClass("material-icons").addClass("dropbtn").text("clear").attr("onclick", "toggleDropdown()"));

        var $dialogDropdown = $("<div/>").attr("id", "myDropdown").addClass("dropdown-content");

        for (var k = 0; k < iconList.length; k++) {
            $dialogDropdown.append($("<div/>").addClass("dropdown-element").append($("<i/>").addClass("material-icons").text(iconList[k])));
        }

        $dialogBody.append($dialogDropdown);

        $dialogBody.append($("<input/>").attr("name", "itemName"));
        $dialogBody.append($("<div/>").addClass("clearfix"));

        var $dialogFooter = $("<div/>").addClass("footer");
        var $buttonCreate = $("<button/>").attr("type", "button").addClass("button create").append($("<i/>").addClass("material-icons").addClass("add").text("add"));

        $dialogFooter.append($buttonCreate).append($("<div/>").addClass("clearfix"));

        $dialogFullbody.append($dialogBody);
        $dialogFullbody.append($dialogFooter);

        var dialog = createDialog($dialogFullbody, "Create child for: " + data.categoryName);

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.create").on("click touch", function (event) {

            var itemName = $(this).closest("#popup").find("input[name='itemName']").val();
            var iconName = $(this).closest("#popup").find("i[name='iconName']").html();
            if (iconName == "clear") iconName = "";

            var categoryItem = new CategoryItem();

            categoryItem.setItemName(itemName);
            categoryItem.setCategoryId(data.categoryId);
            categoryItem.setParentId(data.parentId);
            categoryItem.setItemIcon(iconName);
            categoryItem.setHasChildren(false);
            categoryItem.setIsDeletable(false);

            //itemCategories.insert(categoryItem);

            $millerCol.millerColumn("addItem", categoryItem);

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

            //itemCategories.insert(categoryItem);

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
            findDeleteNodeByNodeIdCatId(new BaseCategoryNode(null, null, null, complaintCategories), data.categoryId, data.itemId, true);
            prepareDataForMillerCols();
            //$millerCol.millerColumn("deleteItem", categoryItem);
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

        var $dialogFullbody = $("<div/>");
        var $dialogBody = $("<div/>").addClass("middle-body");

        $dialogBody.append($("<i/>").attr("id", "element-icon").attr("name", "iconName").addClass("material-icons").addClass("dropbtn").text(typeof data.itemIcon == 'undefined' || data.itemIcon == "" ? "clear" : data.itemIcon).attr("onclick", "toggleDropdown()"));

        var $dialogDropdown = $("<div/>").attr("id", "myDropdown").addClass("dropdown-content");

        for (var k = 0; k < iconList.length; k++) {
            $dialogDropdown.append($("<div/>").addClass("dropdown-element").append($("<i/>").addClass("material-icons").text(iconList[k])));
        }

        $dialogBody.append($dialogDropdown);

        $dialogBody.append($("<input/>").attr("name", "itemName").attr("value", data.itemName));
        $dialogBody.append($("<div/>").addClass("clearfix"));

        var $dialogFooter = $("<div/>").addClass("footer");
        var $buttonCreate = $("<button/>").attr("type", "button").addClass("positive button").append($("<i/>").addClass("material-icons").addClass("edit").text("save"));

        $dialogFooter.append($buttonCreate).append($("<div/>").addClass("clearfix"));

        $dialogFullbody.append($dialogBody);
        $dialogFullbody.append($dialogFooter);

        var dialog = createDialog($dialogFullbody, "Edit Item");

        $(dialog).on("click touch", ".popup-close", function () {

            $("#popup").remove();

        });

        $(dialog).find(".button.positive").on("click touch", function () {

            var itemName = $(this).closest("#popup").find("input[name='itemName']").val();
            var iconName = $(this).closest("#popup").find("i[name='iconName']").html();
            if (iconName == "clear") iconName = "";

            var categoryItem = itemCategories.findOne({
                itemId: data.itemId
            });

            data.itemName = itemName;
            data.iconName = iconName;

            //itemCategories.update(data);

            $millerCol.millerColumn("updateItem", data);

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

    const createDialog = function ($dialogBodyContent, dialogTitle) {

        //remove prev popup instances
        $("#popup").remove();

        var $dialog = $("<div/>").attr("id", "popup").addClass("popup-wrapper hide");
        var $dialogContent = $("<div/>").addClass("popup-content");
        var $dialogTitle = $("<div/>").addClass("popup-title");
        var $btnClose = $("<button/>").attr("type", "button").addClass("popup-close").text("X");
        var $h3 = $("<h3/>").text(dialogTitle);
        var $dialogBody = $("<div/>").addClass("popup-body").append($dialogBodyContent);

        $dialogTitle.append($btnClose).append($h3);

        $dialogContent.append($dialogTitle).append($dialogBody);

        return $dialog.append($dialogContent);
    }

    const findDeleteNodeByNodeIdCatId = function (rootNode, queryCategoryId, queryItemId, queryDelete = false) {

        if (rootNode?.nodes.length && queryCategoryId && queryItemId) {
            let result;
            for (let item of rootNode.nodes) {
                if (item.id == queryItemId && item.categoryId == queryCategoryId) {
                    if (queryDelete)
                        rootNode.nodes = rootNode.nodes.filter(x => x.id != item.id);
                    return item;
                }
                else {
                    result = findDeleteNodeByNodeIdCatId(item, queryCategoryId, queryItemId, queryDelete);
                    if (result)
                        return result;
                }
            }
        }
        return null;
    }
}