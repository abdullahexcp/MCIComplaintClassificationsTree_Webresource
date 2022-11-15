import classificationsTree from './complaintClassificationJson.json' assert {type: 'json'};
var classificationsTreeCopy = [...classificationsTree];
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
    constructor(itemId, itemName, categoryId, parentId, childCategory) {
        this.itemId = itemId ?? null;
        this.itemName = itemName ?? null;
        this.categoryId = categoryId ?? null;
        this.parentId = parentId ?? null;
        this.hasChildren = childCategory ? true : false;
        this.childCategory = childCategory ?? null;
        this.isDeleteable = false;
    }
}
class BaseCategoryNode {
    constructor(id = null, text = null, nodes = []) {
        this.Id = id;
        this.Text = text;
        this.Nodes = nodes;
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
        //let catId = $(this).attr('data-catId');
        //filterItems(query, catId);
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
    let categoryItem = new MillerColumnCategoryItem(categoryNode.Id, categoryNode.Text, parentCategoryId, parentId)
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

///*** OLD Search approach ******** */
//***
// function filterItems(query, categoryId) {
//     let foundCategory = getNestedCategoryById(rootMillerColumnCategory, categoryId);
//     if (foundCategory)
//         foundCategory.query = query;
// }

// function getNestedCategoryById(rootCategory, queryCategoryId) {
//     if (rootCategory.categoryId === queryCategoryId)
//         return rootCategory;
//     else if (rootCategory?.items.length && queryCategoryId) {
//         let result;
//         for (let item of rootCategory.items) {
//             if (!item.childCategory)
//                 continue;
//             result = getNestedCategoryById(item.childCategory, queryCategoryId);
//             if (result)
//                 return result;
//         }
//     }
//     return null;
// }

///**** end old search approach ****** */

function prepareCategoryNodeNestedNodes(categoryNode) {
    if (categoryNode?.Nodes?.length)
        for (let node of categoryNode.Nodes) {
            node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(node.id, node.text, [...node.nodes]));
            let foundNodeIndex = categoryNode.Nodes.findIndex(x => x.id === node.id);
            categoryNode.nodes[foundNodeIndex] = node;
        }
    return categoryNode;
}

function getComplaintCategoriesNodes(dataItems) {
    let nodes = [];
    for (let item of dataItems) {
        let node = prepareCategoryNodeNestedNodes(new BaseCategoryNode(item.id, item.text, [...item.nodes]));
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
    searchResult = searchResult.filter(item => filterItemAndNodes(item, query));
    console.log('search results: ', searchResult);
    if (searchResult?.length)
        return prepareDataForMillerCols(searchResult);
    return prepareDataForMillerCols(classificationsTree);
}

function filterItemAndNodes(item, query) {

    //first step - loop through to filter nodes
    if (item?.nodes?.length)
        item.nodes = item.nodes.filter(item => filterItemAndNodes(item, query));

    //last step - check if matched item 
    if (item?.text && item.text.trim().includes(query)) {
        item.result = true;
        return true;
    }
    else // or has children that match
        return item?.nodes?.length;
}



// function FilterOnSearch(query) {

//     if (query == null || query.length == 0)
//         return prepareTreeByArray(classificationsTree);
//     let finalArray = [];
//     classificationsTreeCopy.forEach(function (item, index) {
//         let searchArray = [];
//         let newItem = { ...item };
//         filterArray(newItem, query, searchArray);
//         if (searchArray.length > 0) {
//             newItem.nodes = [...searchArray];
//             finalArray.push(newItem);
//         }
//         else
//             if (item.text.includes(query)) {
//                 newItem.nodes = [];
//                 finalArray.push(newItem);
//             }


//     });
//     classificationsTreeCopy = [...classificationsTree];
//     return prepareTreeByArray(finalArray);
// }

// function filterArray(node, query, searchArray) {
//     let isSearchContained = false;
//     if (node.nodes != null && node.nodes.length > 0) {
//         node.nodes.forEach(function (item, index) {
//             if (item.text.includes(query)) {
//                 node.nodes = node.nodes.filter(x => x.text.includes(query));
//                 isSearchContained = true;
//             }
//             filterArray(item, query, searchArray);
//         });
//     }
//     if (isSearchContained) {
//         let nodeIndx = searchArray.indexOf(node);
//         if (nodeIndx > -1)
//             searchArray[nodeIndx] = { ...node };
//         else
//             searchArray.push(node);

//     }
//     return;
// }

