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

    filterItems() {
        if (this.query)
            return this._items.filter(x => x.itemName.includes(this.query))
        return this._items;
    }

    set items(items) {
        this._items = items;
    }

    get items() {
        return this.filterItems();
    }
}

class MillerColumnCategoryItem {
    constructor(itemId, itemName, categoryId, parentId, searchResult, childCategory) {
        this.itemId = itemId ?? null;
        this.itemName = itemName ?? null;
        this.categoryId = categoryId ?? null;
        this.parentId = parentId ?? null;
        this.hasChildren = childCategory ? true : false;
        this.childCategory = childCategory ?? null;
        this.isDeleteable = false;
        this.searchResult = searchResult ?? null;
    }
}

class BaseCategoryNode {
    constructor(id = null, text = null, nodes = [], searchResult = null) {
        this.Id = id;
        this.Text = text;
        this.Nodes = nodes;
        this.searchResult = searchResult;
    }

    set Id(id = null) {
        this.id = id;
    }
    get Id() {
        return this.id;
    }
    set Text(text = null) {
        this.text = text;
    }
    get Text() {
        return this.text;
    }
    set Nodes(nodes = []) {
        if (Array.isArray(nodes))
            this.nodes = nodes;
        else
            console.error("Invalid array object to set ", nodes);
    }
    get Nodes() {
        return this.nodes;
    }
    set SearchResult(data) {
        this.searchResult = data;
    }
    get SearchResult() {
        return this.searchResult;
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

    prepareDataForMillerCols(classificationsTree);

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
        parentCatNode.nodes.forEach(node => {
            let millerColumnCategoryItem = prepareCategoryItem(node, (Number(categoryId) + 1) + "", categoryId, null);
            parentCategory.items.push(millerColumnCategoryItem);
        })
    }
    return parentCategory;
}

function prepareCategoryItem(categoryNode, categoryId, parentCategoryId, parentId) {
    // 1 - prepare node as miller column item 
    let categoryItem = new MillerColumnCategoryItem(categoryNode.Id, categoryNode.Text, parentCategoryId, parentId, categoryNode.SearchResult)
    // 2- prepare child category
    let childCategory = new MillerColumnCategory(categoryId, CATEGORIES.get(categoryId), parentCategoryId, categoryId == '3');
    if (categoryNode?.nodes?.length) {
        //3- populate child category items using  cat nodes
        categoryNode.nodes.forEach(node => {
            let millerColumnCategoryItem = prepareCategoryItem(node, (Number(categoryId) + 1) + "", categoryId, categoryNode.Id);
            childCategory.items.push(millerColumnCategoryItem);
        })

        categoryItem.hasChildren = true;
    }
    //4- set child category
    categoryItem.childCategory = childCategory;

    return categoryItem;
}


function prepareCategoryNodeNestedNodes(categoryNode) {
    if (categoryNode?.Nodes?.length)
        for (let node of categoryNode.Nodes) {
            node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(node.id, node.text, [...node.nodes], node.searchResult));
            let foundNodeIndex = categoryNode.Nodes.findIndex(x => x.id === node.id);
            categoryNode.nodes[foundNodeIndex] = node;
        }
    return categoryNode;
}

function getComplaintCategoriesNodes(dataItems) {
    let nodes = [];
    for (let item of dataItems) {
        let node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(item.id, item.text, [...item.nodes], item.searchResult));
        nodes.push(node);
    }
    return nodes;
}

function prepareDataForMillerCols(dataItems) {
    const complaintCategories = getComplaintCategoriesNodes(dataItems);
    var parentCategoryNode = new BaseCategoryNode(null, null, complaintCategories);
    rootMillerColumnCategory = MapClassificationsToParentMillerColumnCategory(parentCategoryNode, '1');
    $millerCol = $("#category-miller-cols-container");

    $millerCol.millerColumn({
        isReadOnly: true,
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
