/**
 * v1.4.0.0
 */
import classificationsTree from './complaintClassificationJson.json' assert {type: 'json'};
function Category() {

    var _this = this;

    _this.categoryId = guid();

    _this.setCategoryId = function (categoryId) {

        _this.categoryId = categoryId;

    };

    _this.getCategoryId = function () {
        return _this.categoryId;
    };


    _this.setCategoryName = function (categoryName) {

        _this.categoryName = categoryName;

    };
    _this.getCategoryName = function () {
        return _this.categoryName;
    };


    _this.setParentId = function (parentId) {

        _this.parentId = parentId;

    };
    _this.getParentId = function () {
        return _this.parentId;
    };


    _this.setIsLowestLevel = function (isLowestLevel) {
        _this.isLowestLevel = isLowestLevel;
    };
    _this.getIsLowestLevel = function () {
        return _this.isLowestLevel
    };

    _this.setItems = function (categoryItems) {
        _this.items = categoryItems;
    };
    _this.getItems = function () {
        return _this.items
    }


}

function CategoryItem() {

    var _this = this;

    _this.itemId = guid();

    _this.setItemId = function (itemId) {

        _this.itemId = itemId;

    };

    _this.getItemId = function () {
        return _this.itemId;
    };


    _this.setItemName = function (itemName) {

        _this.itemName = itemName;

    };
    _this.getItemName = function () {
        return _this.itemName;
    };


    _this.setItemIcon = function (itemIcon) {

        _this.itemIcon = itemIcon;

    };
    _this.getItemIcon = function () {
        return _this.itemIcon;
    };


    _this.setParentId = function (parentId) {

        _this.parentId = parentId;

    };
    _this.getParentId = function () {
        return _this.parentId;
    };


    _this.setCategoryId = function (categoryId) {

        _this.categoryId = categoryId;

    };
    _this.getCategoryId = function () {
        return _this.categoryId;
    };


    _this.setHasChildren = function (hasChildren) {
        _this.hasChildren = hasChildren;
    };
    _this.getHasChildren = function () {
        return _this.hasChildren
    };

    _this.setNumChildren = function (numChildren) {
        _this.numChildren = numChildren;
        _this.setHasChildren(numChildren != 0);
    }

    _this.getNumChildren = function () {
        return _this.numChildren;
    };

    _this.isDeletable = true;
    _this.setIsDeletable = function (isDeletable) {
        _this.isDeletable = isDeletable;
    };
    _this.getIsDeletable = function () {
        return _this.isDeletable
    };


}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}


(function ($) {

    $.fn.millerColumn = function (options) {

        var settings = {
            isReadOnly: true,
            height: '400px'
        };

        var isDebugEnabled = true;

        var args = Array.prototype.slice.call(arguments);

        if (typeof args[0] != "string")
            settings = $.extend(settings, options);

        //using var instead of const to support IE
        var SCALE_TYPE_SCALE_UP = "scaleup";
        var SCALE_TYPE_SCALE_DOWN = "scaledown";
        var SHRINK_DIRECTION_LEFT = "left";
        var SHRINK_DIRECTION_RIGHT = "right";
        var MILLER_COL_HIDDEN_CLASS = "hidden";

        var CLASS_SELECTED = "selected";

        var SELECTOR_IS_SELECTED = ".selected";

        var HAS_CHILDREN = "has-children";

        var windowWidth = $(window).outerWidth();

        //TODO: Refactor hard coded class and attribute names.

        if ("addCol" == args[0]) {

            if (!isInitialized.call(this)) {
                if (isDebugEnabled) {
                    console.log("element is is not initialized as a miller column. You need to call jQuery('#id).millerColumn() first.");
                }
                return;
            }


            if (args[1].jquery) {

                //WARNING: this arg type is deprecated.
                args[1].insertBefore(getLoadingCol.call(this));


            } else if (args[1].categoryId) { //args[1] to detect if it is a valid category obj

                try {

                    var category = args[1];

                    if (!category.categoryId) {
                        hideLoadingCol.call(this);
                        return;
                    }


                    var lastVisibleCol = getLastVisibleCol.call(this);
                    var lastVisibleNonColLoadingContainer = lastVisibleCol.is(".col-loading") ? lastVisibleCol.prev() : lastVisibleCol;

                    if (lastVisibleNonColLoadingContainer.length !== 0 && category.categoryId === lastVisibleNonColLoadingContainer.data("category-id")) {

                        console.warn("Category is already added, ignoring addCol call ...");
                        hideLoadingCol.call(this);
                        return;

                    }


                    var selectedListItem = lastVisibleNonColLoadingContainer.find(getColListItemSelector()).filter(".selected");


                    for (var j = 0; category.items && j < category.items.length; ++j) {

                        var item = category.items[j];

                        if (selectedListItem.length != 0 && selectedListItem.data("item-id") != item.parentId) {

                            console.warn("Response expired; current selected item is not same as the parent of provided list item.");
                            hideLoadingCol.call(this);
                            return;

                        }

                    }


                } catch (error) {
                    console.error(error);
                    hideLoadingCol.call(this);
                }

                var readOnly = JSON.parse($(this).attr("data-is-read-only"));

                if (readOnly && category.items.length == 0)
                    return;

                var newMillerCol = $("<div/>");

                newMillerCol.addClass("miller-col-container");
                newMillerCol.attr("data-category-id", category.categoryId);
                newMillerCol.attr("data-category-name", category.categoryName);
                newMillerCol.attr("data-is-lowest-level", category.isLowestLevel);
                newMillerCol.attr("data-parent-id", category.parentId);
                newMillerCol.data("children", category.items)

                var millerColTitle = $("<div/>"),
                    millerColTitleText = $("<div>").addClass("miller-col-title-text").append($("<span/>").text(category.categoryName));

                if (!readOnly) {
                    var millerColAction = $("<span/>").addClass("miller-col-actions");
                    millerColAction.append($("<i/>").addClass("material-icons").addClass("action-edit").addClass("miller-col-title-icons").text("edit"));
                    millerColAction.append($("<i/>").addClass("material-icons").addClass("action-add").addClass("miller-col-title-icons").text("add"));
                    millerColTitleText.append(millerColAction);
                }

                millerColTitle.addClass("miller-col-title");
                millerColTitle.append(millerColTitleText);
                newMillerCol.append(millerColTitle);

                var millerColBody = $("<div/>").addClass("miller-col-body");

                for (var i = 0; i < category.items.length; ++i) {

                    var millerColListItem = buildColListItem(category.items[i], readOnly);

                    millerColBody.append(millerColListItem);

                }

                newMillerCol.append(millerColBody);

                newMillerCol.insertBefore(getLoadingCol.call(this));

            }


            return this;

        } else if ("addItem" == args[0]) {

            var addedItemData = args[1];

            var listParentAddedItem = $(this).find(getColListItemSelector()).filter("[data-item-id = '" + addedItemData.parentId + "']");

            if (null != listParentAddedItem) {
                var parentAlreadyWithChildren = listParentAddedItem.data("has-children");
                listParentAddedItem.data("has-children", true);
                listParentAddedItem.attr("data-has-children", true);
                if (!parentAlreadyWithChildren) {
                    listParentAddedItem.append($("<i/>").addClass("material-icons").text("navigate_next").addClass("has-children"));
                }
            }
            var colContainer = getMillerColContainers.call(this).filter("[data-category-id='" + addedItemData.categoryId + "']");

            if (null == colContainer) {
                if (isDebugEnabled) {
                    console.log("Cant find category with id: " + addedItemData.categoryId);
                }
                return;
            }

            var colListItemContainer = colContainer.find(getColListItemContainer());

            colListItemContainer.append(buildColListItem(addedItemData, false));

            return this;


        } else if ("updateCategory" == args[0]) {

            var updatedCategoryData = args[1];

            var updatedCategory = $(this).find(getColContainerSelector()).filter("[data-category-id = '" + updatedCategoryData.categoryId + "']");

            if (null != updatedCategory) {
                console.log("updating category name");
                updatedCategory.find(".miller-col-title-text").find("span").first().text(updatedCategoryData.categoryName);
                updatedCategory.attr("data-category-name", updatedCategoryData.categoryName);
                updatedCategory.attr("data-is-lowest-level", updatedCategoryData.isLowestLevel);
            }

            return this;

        } else if ("updateItem" == args[0]) {

            var updatedtemData = args[1];

            var listUpdatedItem = $(this).find(getColListItemSelector()).filter("[data-item-id = '" + updatedtemData.itemId + "']");

            if (null != listUpdatedItem) {
                listUpdatedItem.find(".list-item-text").text(updatedtemData.itemName);
                listUpdatedItem.attr("data-item-name", updatedtemData.itemName);
                listUpdatedItem.find(".list-item-icon").text(updatedtemData.itemIcon);
                listUpdatedItem.attr("data-item-icon", updatedtemData.itemIcon);
            }

            return this;

        } else if ("deleteItem" == args[0]) {

            var deletedItemData = args[1];

            var listDeletedItem = $(this).find(getColListItemSelector()).filter("[data-item-id = '" + deletedItemData.itemId + "']");

            var listParentItem = $(this).find(getColListItemSelector()).filter("[data-item-id = '" + deletedItemData.parentId + "']");

            if (null != listParentItem) {
                var childrenLeft = $(this).find(getColListItemSelector()).filter("[data-parent-id = '" + deletedItemData.parentId + "']");
                if (null == childrenLeft || childrenLeft.length == 0) {
                    listParentItem.data("has-children", false);
                    listParentItem.attr("data-has-children", false);
                    listParentItem.find("i").filter(".has-children").remove();
                }
            }

            //remove children col container.
            $(listDeletedItem).closest(getColContainerSelector()).next(getColContainerSelectorExcludeColLoading()).remove();

            if (null != listDeletedItem)
                listDeletedItem.remove();

            return this;

        } else if ("destroy" == args[0]) {

            if (isInitialized.call(this)) {
                // remove all miller-column object events
                $(this).find("*").addBack().off();

                // remove all window events related to miller-column object
                $(window).off("." + $(this).attr("id"));

                // remove specific attributes
                $(this).removeAttr("millerized");
                $(this).removeAttr("data-is-read-only");
                $(this).removeAttr("style");

                // empty miller-column object
                $(this).empty();

                if (isDebugEnabled)
                    console.log("miller-column destroyed !");
            } else {
                if (isDebugEnabled)
                    console.log("miller-column is not initialized so nothing to destroy ...");
            }

            return;

        } else if ("ismillerized" == args[0]) {

            return isInitialized.call(this);
        }

        // function filterMillerColItems(query) {
        //     let millerColBody = $(this).parent().parent().siblings(".miller-col-body");
        //     let items = millerColBody.find('.miller-col-list-item');
        //     for (let item of items) {
        //         $(item).attr('style', 'display:none')
        //         console.log($(item));
        //         let found = $(item).attr('data-item-name').includes(query);
        //         if (found) {
        //             $(item).attr('style', 'display:table')
        //         }
        //     }

        // }

        function buildColListItem(item, readOnly) {

            var millerColListItem = $("<div/>").addClass("miller-col-list-item");

            millerColListItem.attr("data-has-children", item.hasChildren);
            millerColListItem.attr("data-item-id", item.itemId);
            millerColListItem.attr("data-parent-id", item.parentId);
            millerColListItem.attr("data-category-id", item.categoryId);
            millerColListItem.attr("data-is-deletable", item.isDeletable);
            millerColListItem.attr("data-item-name", item.itemName);
            millerColListItem.attr("data-item-icon", item.itemIcon);
            // check to mark search results items
            if (item.isSearchResult)
                millerColListItem.addClass("search-item-result");


            var $listItemIcon = $("<i/>").addClass("material-icons list-item-icon");
            millerColListItem.append($listItemIcon);

            if (item.itemIcon != "" && item.itemIcon != null)
                $listItemIcon.text(item.itemIcon);

            let itemText = item.itemName;
            if (item.searchResult)
                itemText = itemText.substr(0, item.searchResult.startIndex) +
                    "<span class='list-item-search-result' >" +
                    itemText.substr(item.searchResult.startIndex, item.searchResult.length) +
                    "</span>" +
                    itemText.substr(item.searchResult.startIndex + item.searchResult.length);
            millerColListItem.append($("<span/>").html(itemText).addClass("list-item-text"));

            if (item.hasChildren)
                millerColListItem.append($("<i/>").addClass("material-icons").text("navigate_next").addClass("has-children"));

            if (item.categoryId === "3")
                millerColListItem.append($("<i/>").addClass("material-icons").text("grade").addClass("favourable-item"));

            if (false == readOnly) {
                var listItemActions = $("<span/>").addClass("list-item-actions").append($("<i/>").addClass("material-icons").addClass("edit").text("edit"));
                listItemActions.append($("<i/>").addClass("material-icons").addClass("delete").text("delete"));

                millerColListItem.append(listItemActions);
            }

            if (item.numChildren != null && item.numChildren != 0) {

                millerColListItem.append($("<span/>").addClass("num-children-badge").text(item.numChildren));

            }

            return millerColListItem;
        }

        function getTotalInnerColsWidth() {

            var totalWidth = 0;

            if (isDebugEnabled) {
                console.log("About to calculate total width ...");
            }

            getMillerColContainers.call(this).each(function () {

                if (isViewHidden.call(this))
                    return;

                totalWidth += $(this).outerWidth();

                if (isDebugEnabled) {
                    console.log("added width: " + $(this).outerWidth())
                }

            });

            //include loading col width if it is showing.
            totalWidth = totalWidth + (!isViewHidden.call(getLoadingCol.call(this)) ? getLoadingCol.call(this).outerWidth() : 0);

            if (isDebugEnabled) {
                console.log("totalColsWidth: " + totalWidth + " body width:" + $(this).outerWidth());
            }

            return totalWidth;
        }

        function init() {

            hideNavCols.call(this);

            hideLoadingCol.call(this);

            resizeMillerColumn.call(this);

            initialize.call(this);

        }



        function hideNavCols() {

            hidePrevNavCol.call(this);
            hideNextNavCol.call(this);

        }

        function initialize() {

            if (getMillerColsBody.call(this).length == 0) { //if user has not build the miller ui structure using html manually

                var preNav = $("<span/>")
                    .addClass("miller-col-nav nav-prev hidden")
                    .append($("<i/>")
                        .addClass("material-icons")
                        .text("navigate_before"));


                var millerColsBody = $("<div/>")
                    .addClass("miller-cols-body");

                var millerColLoading = $("<div/>")
                    .addClass("miller-col-loading-container col-loading hidden")
                    .append($("<div/>")
                        .addClass("miller-col-body")
                        .append($("<div/>")
                            .addClass("miller-col-list-item loading-icon-container spinner")));

                millerColsBody.append(millerColLoading);

                var nextNav = $("<span/>")
                    .addClass("miller-col-nav nav-next hidden")
                    .append($("<i/>")
                        .addClass("material-icons")
                        .text("navigate_next"));

                $(this).append(preNav).append(millerColsBody).append(nextNav);

            }

            $(this).addClass("miller-cols-container-wrapper");

            $(this).css({
                height: settings.height
            });

            $(this).attr("millerized", "");
            $(this).attr("data-is-read-only", settings.isReadOnly);
        }

        function isInitialized() {
            return $(this).is("[millerized]");
        }

        function getMillerColContainers() {
            return $(this).find(".miller-col-container")
        }

        function getColLoadingSelector() {
            return ".col-loading";
        }

        function getLoadingCol() {
            return $(this).find(getColLoadingSelector())
        }

        function showLoadingCol() {
            return showView.call(getLoadingCol.call(this));
        }

        function hideLoadingCol() {
            return hideView.call(getLoadingCol.call(this));
        }

        function getPrevNav() {
            return $(this).find(".miller-col-nav.nav-prev");
        }

        function getNextNav() {
            return $(this).find(".miller-col-nav.nav-next");
        }

        function getMillerColsBody() {
            return $(this).find(".miller-cols-body");
        }

        function getColListItemSelector() {
            return ".miller-col-body .miller-col-list-item"
        }

        function getColListItemContainer() {
            return ".miller-col-body"
        }

        function getColContainerSelector() {
            return ".miller-col-container"
        }

        function getColContainerSelectorExcludeColLoading() {
            return ".miller-col-container:not(.col-loading)"
        }


        function getFirstVisibleCol() {

            var firstVisibleCol = getMillerColsBody.call(this).find(".miller-col-container:not(.hidden):first");

            return firstVisibleCol.length != 0 ? firstVisibleCol :
                (isViewHidden.call(getLoadingCol.call(this)) ? null : getLoadingCol.call(this));
        }

        function hasLeftHiddenCol() {
            return isViewHidden.call(getFirstVisibleCol.call(this).prev());
        }

        function hasRightHiddenCol() {
            return isViewHidden.call(getLastVisibleCol.call(this).next().not(getColLoadingSelector()));
        }

        function getLastVisibleCol() {

            return !isViewHidden.call(getLoadingCol.call(this)) ? getLoadingCol.call(this) :
                getMillerColsBody.call(this).find(".miller-col-container:not(.hidden):last");

        }

        function isViewHidden() {
            return $(this).hasClass(MILLER_COL_HIDDEN_CLASS);
        }

        function hideView() {
            if (!isViewHidden.call(this))
                $(this).addClass(MILLER_COL_HIDDEN_CLASS);
        }

        function showView() {
            if (isViewHidden.call(this))
                $(this).removeClass(MILLER_COL_HIDDEN_CLASS);
        }

        function showPrevNavCol() {
            showView.call(getPrevNav.call(this))
        }

        function isNextNavColHidden() {
            return isViewHidden.call(getNextNav.call(this));
        }

        function isPrevNavColHidden() {
            return isViewHidden.call(getPrevNav.call(this))
        }

        function showNextNavCol() {
            showView.call(getNextNav.call(this));
        }

        function hidePrevNavCol() {
            hideView.call(getPrevNav.call(this));
        }

        function hideNextNavCol() {
            hideView.call(getNextNav.call(this))
        }

        function isOverFlowing() {

            //the body must at least show one column
            if ($(getMillerColsBody.call(this)).children(":not(.hidden)").length <= 1)
                return false;

            return getMillerColsBody.call(this).outerWidth() + 1 < getTotalInnerColsWidth.call(getMillerColsBody.call(this))
        }

        function overFlowsWith(child) {

            var millerColsBody = getMillerColsBody.call(this);

            return isOverFlowing.call(this) ||
                millerColsBody.outerWidth() + 1 < getTotalInnerColsWidth.call(millerColsBody) + child.outerWidth()
        }

        function selectItem() {

            if ($(this).is(SELECTOR_IS_SELECTED))
                return;

            $(this).addClass(CLASS_SELECTED);
        }

        function deselectItem() {
            $(this).removeClass(CLASS_SELECTED);
        }

        function removeTrailingColContainers() {
            $(this).nextAll(":not(.col-loading)").remove();
        }

        function getCategoryItem() {

            var categoryItem = new CategoryItem();

            categoryItem.setCategoryId($(this).attr("data-category-id"));
            categoryItem.setItemId($(this).attr("data-item-id"));
            categoryItem.setItemName($(this).attr("data-item-name"));
            categoryItem.setItemIcon($(this).attr("data-item-icon"));
            categoryItem.setHasChildren($(this).attr("data-has-children"));
            categoryItem.setIsDeletable($(this).attr("data-is-deletable"));
            categoryItem.setParentId($(this).attr("data-parent-id"));

            return categoryItem;

        }

        function getCategory() {

            var category = new Category();

            category.setCategoryId($(this).attr("data-category-id"));
            category.setCategoryName($(this).attr("data-category-name"));
            category.setIsLowestLevel($(this).attr("data-is-lowest-level"));
            category.setParentId($(this).attr("data-parent-id"));

            return category;

        }


        function scaleUpLeft() {

            while (!isOverFlowing.call(this) && hasLeftHiddenCol.call(this)) {

                showView.call(getFirstVisibleCol.call(this).prev())

            }

            //undo the last show if there is overflow
            if (isOverFlowing.call(this)) {
                hideView.call(getFirstVisibleCol.call(this))
            }

            if (!hasLeftHiddenCol.call(this)) {
                hidePrevNavCol.call(this);
            }


            if (!hasLeftHiddenCol.call(this) && !isNextNavColHidden.call(this) && !overFlowsWith.call(this, getLastVisibleCol.call(this).next()))
                resizeMillerColumn.call(this, SHRINK_DIRECTION_RIGHT, SCALE_TYPE_SCALE_UP);

        }

        function scaleDownLeft() {

            while (isOverFlowing.call(this)) {

                hideView.call(getFirstVisibleCol.call(this));

                showPrevNavCol.call(this);

            }

        }

        function scaleUpRight() {

            while (!isOverFlowing.call(this) && hasRightHiddenCol.call(this)) {

                showView.call(getLastVisibleCol.call(this).next());

                if (!hasRightHiddenCol.call(this)) {
                    hideNextNavCol.call(this);
                    break;
                }

            }

            if (!hasRightHiddenCol.call(this) && !isPrevNavColHidden.call(this) && !overFlowsWith.call(this, getFirstVisibleCol.call(this).prev())
            )
                resizeMillerColumn.call(this, SHRINK_DIRECTION_LEFT, SCALE_TYPE_SCALE_UP)


        }

        function scaleDownRight() {

            while (isOverFlowing.call(this)) {

                hideView.call(getLastVisibleCol.call(this));
                showNextNavCol.call(this);

            }

        }

        function resizeMillerColumn(direction, scaleType) {

            scaleType = scaleType || SCALE_TYPE_SCALE_DOWN;

            direction = direction || SHRINK_DIRECTION_LEFT;

            switch (direction) {

                case SHRINK_DIRECTION_RIGHT:

                    switch (scaleType) {

                        case SCALE_TYPE_SCALE_DOWN:
                            scaleDownRight.call(this);
                            break;

                        case SCALE_TYPE_SCALE_UP:
                            scaleUpRight.call(this);
                            break;

                        default:
                            console.error("Unkown scaleType: " + scaleType);

                    }
                    break;

                case SHRINK_DIRECTION_LEFT:

                    switch (scaleType) {
                        case SCALE_TYPE_SCALE_DOWN:
                            scaleDownLeft.call(this);
                            break;

                        case SCALE_TYPE_SCALE_UP:
                            scaleUpLeft.call(this);
                            break;

                        default:
                            console.error("Unknown scaleType:" + scaleType)
                    }

                    break;

                default:
                    console.error("Unknown hideDirection: " + direction)

            }


        }


        var waitForFinalEvent = (function () {
            var timers = {};
            return function (callback, ms, uniqueId) {
                if (!uniqueId) {
                    uniqueId = "Don't call this twice without a uniqueId";
                }
                if (timers[uniqueId]) {
                    clearTimeout(timers[uniqueId]);
                }
                timers[uniqueId] = setTimeout(callback, ms);
            };
        })();


        return this.each(function () {

            var millerColumn = this;

            init.call(millerColumn);

            if (args[0] && args[0]["initData"]) { //arg[0] root col

                //hide all cols except col load b/se arg[0] => root col
                $(millerColumn).find(getColContainerSelectorExcludeColLoading()).remove();

                $(millerColumn).millerColumn("addCol", args[0]["initData"]);

            }

            getPrevNav.call(millerColumn).on("click", function () {

                showView.call(getFirstVisibleCol.call(millerColumn).prev());

                if (!hasLeftHiddenCol.call(millerColumn))
                    hidePrevNavCol.call(millerColumn);

                resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_RIGHT);

            });

            getNextNav.call(millerColumn).on("click", function () {

                showView.call(getLastVisibleCol.call(millerColumn).next());

                if (!hasRightHiddenCol.call(millerColumn))
                    hideNextNavCol.call(millerColumn);

                resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT);

            });


            getMillerColsBody.call(millerColumn).on("DOMNodeInserted", function (event) {

                //resize only if col is added.
                if (!$(event.target).is(getColContainerSelector()))
                    return;

                if (isDebugEnabled) {
                    console.log("Dom inserted..");
                }

                hideLoadingCol.call(millerColumn);

                resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT);

            });


            getMillerColsBody.call(millerColumn).on("DOMNodeRemoved", function (event) {

                //resize only if col is removed.
                if (!$(event.target).is(getColContainerSelector()))
                    return;
                if (isDebugEnabled) {
                    console.log("Dom removed..");
                }

                resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT, SCALE_TYPE_SCALE_UP);

            });

            /**
             * Fires item-selected event when an item is selected along with the necessary data.
             */
            getMillerColsBody.call(millerColumn).on("click", getColListItemSelector(), function () {

                var currentColContainer = $(this).closest(getColContainerSelector());

                removeTrailingColContainers.call(currentColContainer);

                if (!isNextNavColHidden.call(millerColumn))
                    hideNextNavCol.call(millerColumn);

                if ($(this).data(HAS_CHILDREN) == true) {
                    showLoadingCol.call(millerColumn);
                }

                resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT, SCALE_TYPE_SCALE_DOWN);

                deselectItem.call((currentColContainer).find(getColListItemSelector()));

                selectItem.call(this);

                //Firing item-selected event.
                var data = getCategoryItem.call(this);

                $(this).trigger("item-selected", data);

                //check if item data is already provided during init

                var children = currentColContainer.data("children");

                console.log("children:" + children)

                if (children) {

                    for (var i = 0; i < children.length; ++i) {

                        if (data.itemId === children[i].itemId) {

                            if (children[i].childCategory) {

                                $(millerColumn).millerColumn("addCol", children[i].childCategory);

                            }

                            break;
                        }

                    }

                }

                if (isDebugEnabled) {
                    console.log("fired item-selected event: " + JSON.stringify(data))
                }

            });

            getMillerColsBody.call(millerColumn).on("click", ".list-item-actions .edit", function (event) {

                var currentItemContainer = $(this).closest(getColListItemSelector());

                //Firing edit-item event.
                var data = getCategoryItem.call(currentItemContainer);

                $(currentItemContainer).trigger("edit-item", data);

                if (isDebugEnabled) {
                    console.log("fired edit item event: " + JSON.stringify(data));
                }

                event.stopPropagation();

            });

            getMillerColsBody.call(millerColumn).on("click", ".list-item-actions .delete", function (event) {

                var currentItemContainer = $(this).closest(getColListItemSelector());

                //Firing delete-item event.
                var data = getCategoryItem.call(currentItemContainer);

                $(currentItemContainer).trigger("delete-item", data);

                if (isDebugEnabled) {
                    console.log("fired delete item event: " + JSON.stringify(data));
                }

                event.stopPropagation();

            });

            getMillerColsBody.call(millerColumn).on("click", ".miller-col-actions .action-add", function () {

                var currentColContainer = $(this).closest(getColContainerSelector());
                var parentColContainer = currentColContainer.prev();

                //Firing add-item event.
                var data = getCategory.call(currentColContainer);

                if (parentColContainer)
                    data.parentId = $(parentColContainer).find(getColListItemSelector()).filter(SELECTOR_IS_SELECTED).data("item-id");

                $(currentColContainer).trigger("add-item", data);

                if (isDebugEnabled) {
                    console.log("fired add item event: " + JSON.stringify(data));
                }

            });

            getMillerColsBody.call(millerColumn).on("click", ".miller-col-actions .action-edit", function () {

                var currentColContainer = $(this).closest(getColContainerSelector());
                var parentColContainer = currentColContainer.prev();

                //Firing edit-column-title event.
                var data = getCategory.call(currentColContainer);

                if (parentColContainer) {
                    data.parentId = $(parentColContainer).find(getColListItemSelector()).filter(SELECTOR_IS_SELECTED).data("item-id");
                    data.prevColumnId = $(parentColContainer).find(getColListItemSelector()).filter(SELECTOR_IS_SELECTED).data("category-id");
                }

                $(currentColContainer).trigger("edit-column-title", data);

                if (isDebugEnabled) {
                    console.log("fired edit-column-title event: " + JSON.stringify(data));
                }

            });


            $(window).on("resize." + $(millerColumn).attr("id"), function (event) {

                waitForFinalEvent(function () {

                    if (!isInitialized.call(millerColumn))
                        return;

                    if (isDebugEnabled) {
                        console.log("window resized..");
                    }

                    if ($(window).outerWidth() == windowWidth)
                        return;

                    if (isDebugEnabled) {
                        console.log("About to resize: old width:" + windowWidth + " new one: " + $(window).outerWidth());
                    }

                    //disable nav cols
                    hideNavCols.call(millerColumn);

                    if ($(window).outerWidth() < windowWidth) {
                        resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT, SCALE_TYPE_SCALE_DOWN);
                    } else {
                        resizeMillerColumn.call(millerColumn, SHRINK_DIRECTION_LEFT, SCALE_TYPE_SCALE_UP);
                    }

                    //re-enable navs
                    if (hasRightHiddenCol.call(millerColumn))
                        showNextNavCol.call(millerColumn);

                    if (hasLeftHiddenCol.call(millerColumn))
                        showPrevNavCol.call(millerColumn);

                    windowWidth = $(window).outerWidth();

                }, 500, $(millerColumn).attr("id"));

            });

        });

    }

})(jQuery);
