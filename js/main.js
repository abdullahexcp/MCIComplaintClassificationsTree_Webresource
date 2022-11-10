class MillerColumnCategory {
    constructor(categoryId = null, categoryName = null, parentId = null, isLowestLevel = true, items = []) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.parentId = parentId;
        this.isLowestLevel = isLowestLevel;
        this.items = items;
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

    populateNodes(category) {
        if (category && category instanceof BaseCategoryNode && category.nodes?.length)
            this.nodes = category.nodes;
    }
}

window.onload = onLoad;

const CATEGORIES = new Map();

function onLoad() {

    CATEGORIES.set('1', 'Complaint category');
    CATEGORIES.set('2', 'Main Classification');
    CATEGORIES.set('3', 'Sub Classification');
    const serviceMainNestedSubClassifications = getServiceMainNestedSubClassifications();
    const complaintCategories = getComplaintCategoriesNodes();
    //POPULATE MAIN CALSSIFICATIONS OF COMPLAINT CATS WITH SUB CLASSIFICATION 
    populateCategoryNodesChildNodesWithOtherCategoryNodes(complaintCategories, serviceMainNestedSubClassifications);
    //PREPARE CATNODE FOR MILLER COLS TO MAP AND SELECT CLASSIFICATIONS TREE AS MILLER COLUMN
    var parentCatNode = new BaseCategoryNode(null, null, complaintCategories);
    let rootMillerColumnCategory = MapClassificationsToParentMillerColumnCategory(parentCatNode, '1');
    //set child category to millerColumn
    let $millerCol = $("#category-miller-cols-container");
    $millerCol.millerColumn({
        isReadOnly: true,
        initData: rootMillerColumnCategory
    });
    console.log(parentCatNode);
    console.log(rootMillerColumnCategory);
}

function populateCategoryNodeChildNodesWithOtherCategoryNodes(categoryParentNodes, childCatgoryNodes) {
    if (categoryParentNodes?.nodes.length && childCatgoryNodes?.nodes.length)
        categoryParentNodes.forEach(parent => {
            if (parent?.nodes)
                parent.nodes.forEach(x => {
                    x.populateNodes(childCatgoryNodes.find(y => y.Id === x.Id))
                });
        });
}

function MapClassificationsToParentMillerColumnCategory(parentCatNode, categoryId) {
    // 1- prepare child category
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








function getComplaintCategoriesNodes() {
    return complaintCategories = [
        new BaseCategoryNode(
            "1", "	Offices	", [
            new BaseCategoryNode("16", "	المظهر العام	", []),
            new BaseCategoryNode("17", "	النظافة	", []),
            new BaseCategoryNode("18", "	سهولة الوصول للفرع	", []),
            new BaseCategoryNode("19", "	ساعات العمل	", []),
            new BaseCategoryNode("20", "	الأمن و السلامة العامة	", [])
        ]
        ),
        new BaseCategoryNode(
            "2", "	Behavior	", [
            new BaseCategoryNode("21", "	تقصير في الأداء	", []),
            new BaseCategoryNode("22", "	سوء التعامل	", []),
            new BaseCategoryNode("23", "	فساد	", [])
        ]
        ),
        new BaseCategoryNode(
            "3", "	Sevices	", [
            new BaseCategoryNode("1", "	السجل التجاري	", []),
            new BaseCategoryNode("2", "	الاسماء التجارية	", []),
            new BaseCategoryNode("4", "	خدمات المهن الاستشارية	", []),
            new BaseCategoryNode("5", "	خدمات الشركات	", []),
            new BaseCategoryNode("7", "	تراخيص المختبرات	", []),
            new BaseCategoryNode("8", "	شهادة المنشأ	", []),
            new BaseCategoryNode("9", "	اللجان شبه القضائية	", []),
            new BaseCategoryNode("10", "	أعمال الفسح	", []),
            new BaseCategoryNode("11", "	الوكالات التجارية	", []),
            new BaseCategoryNode("12", "	تراخيص الذهب و المعادن الثمينة	", []),
            new BaseCategoryNode("13", "	خدمات مكتب الفصل في المنازعات التجارية	", []),
            new BaseCategoryNode("14", "	تراخيص التخفيضات	", []),
            new BaseCategoryNode("15", "	التصاريح الموسمية لمركبات الخدمات التموينية	", []),
            new BaseCategoryNode("24", "	التزام الشركات	", []),
            new BaseCategoryNode("25", "	حوكمة الشركات	", []),
            new BaseCategoryNode("26", "	الغرفة التجارية	", []),
            new BaseCategoryNode("30", "	الفرع الالكتروني	", []),
            new BaseCategoryNode("31", "	معروف	", []),
            new BaseCategoryNode("32", "	الدخول الموحد	", []),
            new BaseCategoryNode("33", "	التجديد بخطوة	", []),
            new BaseCategoryNode("34", "	خدمات منصة SBC	", []),
            new BaseCategoryNode("35", "	المخالفات	", []),
            new BaseCategoryNode("66", "	المراقب الموحد	", [])
        ]
        )
    ];

}

function getServiceMainNestedSubClassifications() {
    return serviceMainNestedSubClassifications = [
        new BaseCategoryNode(
            "1", "	Commercial Register	", [
            new BaseCategoryNode("1", "	اصدار سجل تجاري رئيسي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("2", "	اصدار سجل تجاري فرعي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("3", "	تجديد سجل تجاري رئيسي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("4", "	تجديد سجل  تجاري فرعي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("5", "	تعديل نشاط سجل تجاري مؤسسة للسعوديين	", []),
            new BaseCategoryNode("6", "	تعديل عنوان  سجل تجاري مؤسسة للسعوديين	", []),
            new BaseCategoryNode("7", "	تعديل راس مال  سجل تجاري مؤسسة للسعوديين	", []),
            new BaseCategoryNode("8", "	تعيين مدير مؤسسة للسعوديين	", []),
            new BaseCategoryNode("9", "	شطب سجل تجاري  رئيسي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("10", "	افادة عدم وجود سجلات	", []),
            new BaseCategoryNode("11", "	افادة (افراد)	", []),
            new BaseCategoryNode("12", "	مستخرج مؤسسة 	", []),
            new BaseCategoryNode("13", "	اصدار سجل رئيسي شركة لمواطن سعودي 	", []),
            new BaseCategoryNode("14", "	اصدار سجل تجاري رئيسي شركة للخليجيين	", []),
            new BaseCategoryNode("15", "	تجديد سجل  تجاري فرعي لشركة	", []),
            new BaseCategoryNode("16", "	تجديد سجل تجاري  رئيسي شركة للسعوديين	", []),
            new BaseCategoryNode("17", "	تجديد سجل تجاري  رئيسي شركة للخليجيين	", []),
            new BaseCategoryNode("18", "	تحويل المؤسسة الى شركة	", []),
            new BaseCategoryNode("19", "	تحويل السجل التجاري من رئيسي إلى فرعي أو العكس	", []),
            new BaseCategoryNode("20", "	مستخرج شركة	", []),
            new BaseCategoryNode("21", "	اصدار سجل تجاري رئيسي مؤسسة للخليجين	", []),
            new BaseCategoryNode("22", "	اصدار سجل تجاري فرعي مؤسسة للخليجين	", []),
            new BaseCategoryNode("26", "	اصدار تراخيص مكاتب الخدمات العامة	", []),
            new BaseCategoryNode("27", "	تجديد  تراخيص مكاتب الخدمات العامة	", []),
            new BaseCategoryNode("28", "	الغاء  تراخيص مكاتب الخدمات العامة	", []),
            new BaseCategoryNode("29", "	تجديد سجل تجاري رئيسي مؤسسة للخليجين	", []),
            new BaseCategoryNode("30", "	تجديد سجل تجاري فرعي مؤسسة للخليجين	", []),
            new BaseCategoryNode("31", "	تعديل نشاط  سجل تجاري مؤسسة للخليجين	", []),
            new BaseCategoryNode("32", "	تعديل عنوان  سجل تجاري مؤسسة للخليجين	", []),
            new BaseCategoryNode("33", "	تعديل راس مال سجل تجاري مؤسسة للخليجين	", []),
            new BaseCategoryNode("34", "	شطب  سجل تجاري فرعي مؤسسة للخليجين	", []),
            new BaseCategoryNode("35", "	تعيين مدير مؤسسة للخليجيين	", []),
            new BaseCategoryNode("36", "	تصحيح السجلات المربوطة بالحفيظة 	", []),
            new BaseCategoryNode("37", "	المؤسسات الوقفية	", []),
            new BaseCategoryNode("38", "	المؤسسات الخيرية	", []),
            new BaseCategoryNode("39", "	الجمعيات التعاونية 	", []),
            new BaseCategoryNode("40", "	نقل ملكية سجل تجاري مؤسسة للسعوديين	", []),
            new BaseCategoryNode("41", "	نقل ملكية سجل تجاري مؤسسة للخليجيين	", []),
            new BaseCategoryNode("42", "	اصدار سجل تجاري فرعي لشركة 	", []),
            new BaseCategoryNode("43", "	تجديد سجل تجاري رئيسي شركة مساهمة	", []),
            new BaseCategoryNode("44", "	تجديد سجل تجاري فرعي شركة مساهمة	", []),
            new BaseCategoryNode("45", "	تجديد سجل تجاري رئيسي شركة مهنية	", []),
            new BaseCategoryNode("46", "	تجديد سجل تجاري فرعي شركة مهنية	", []),
            new BaseCategoryNode("47", "	تجديد سجل تجاري رئيسي شركة قابضة	", []),
            new BaseCategoryNode("48", "	تجديد سجل تجاري فرعي شركة قابضة	", []),
            new BaseCategoryNode("50", "	تعديل سجل تجاري رئيسي لشركة مساهمة مغلقة 	", []),
            new BaseCategoryNode("51", "	تعديل سجل تجاري فرعي لشركة مساهمة مغلقة 	", []),
            new BaseCategoryNode("52", "	تعديل سجل تجاري رئيسي لشركة مساهمة مدرجة	", []),
            new BaseCategoryNode("53", "	تعديل سجل تجاري فرعي لشركة مساهمة مدرجة 	", []),
            new BaseCategoryNode("54", "	شطب  سجل تجاري رئيسي شركة للسعوديين	", []),
            new BaseCategoryNode("55", "	شطب  سجل تجاري رئيسي شركة  للخليجيين	", []),
            new BaseCategoryNode("56", "	شطب  سجل تجاري رئيسي شركة  لفروع الشركات  الأجنبية	", []),
            new BaseCategoryNode("57", "	شطب  سجل تجاري رئيسي شركة  لفروع الشركات الخليجية	", []),
            new BaseCategoryNode("58", "	شطب  سجل تجاري رئيسي لشركة مختلطة	", []),
            new BaseCategoryNode("59", "	شطب  سجل تجاري رئيسي لشركة مساهمة	", []),
            new BaseCategoryNode("61", "	شطب سجل فرع شركة 	", []),
            new BaseCategoryNode("62", "	تحويل السجل التجاري من شركة إلى مؤسسة	", []),
            new BaseCategoryNode("166", "	شطب سجل تجاري  فرعي مؤسسة للسعوديين	", []),
            new BaseCategoryNode("167", "	شطب سجل تجاري رئيسي مؤسسة للخليجين	", []),
            new BaseCategoryNode("185", "	تحويل السجل التجاري الرئيسي  إلى فرعي أو العكس للخليجيين	", []),
            new BaseCategoryNode("186", "	تعديل السجل التجاري للشركات	", []),
            new BaseCategoryNode("187", "	شطب سجل تجاري لشخص متوفي	", []),
            new BaseCategoryNode("188", "	نقل ملكية سجل تجاري من شخص متوفى	", []),
            new BaseCategoryNode("189", "	ترجمة السجل التجاري	", []),
            new BaseCategoryNode("190", "	تجديد السجل التجاري بخطوة	", []),
            new BaseCategoryNode("194", "	إستعادة السجل التجاري المشطوب	", []),
            new BaseCategoryNode("196", "	الرقم الوطني الموحد 700	", []),
            new BaseCategoryNode("198", "	QR الرمز التجاري	", []),
            new BaseCategoryNode("804010000", "	استرجاع النشاط السابق لما قبل تنفيذ عملية العكس	", []),
            new BaseCategoryNode("348", "	تحديث السجل التجاري	", [])
        ]
        ),
        new BaseCategoryNode(
            "2", "	Trade names	", [
            new BaseCategoryNode("63", "	حجز اسم تجاري لسعودي	"),
            new BaseCategoryNode("64", "	حجز اسم تجاري لخليجي	"),
            new BaseCategoryNode("65", "	حجز اسم تجاري للجهات الحكومية وشبه الحكومية	"),
            new BaseCategoryNode("66", "	حجز اسم تجاري أجنبي	"),
            new BaseCategoryNode("67", "	إعادة فحص اسم مرفوض إلكترونياً	"),
            new BaseCategoryNode("199", "	اعتراض على رفض حجز الاسم التجاري	")
        ]
        ),
        new BaseCategoryNode(
            "4", "	Consulting professions services	", [
            new BaseCategoryNode("70", "	التراخيص الجديدة للمهن الاستشارية	"),
            new BaseCategoryNode("71", "	إصدار رخصة فرع مكتب مهني	"),
            new BaseCategoryNode("72", "	تجديد الرخص المهنية	"),
            new BaseCategoryNode("73", "	تعديل الرخص المهنية	"),
            new BaseCategoryNode("74", "	الغاء التراخيص المهنية	"),
            new BaseCategoryNode("370", "	تعديل بيانات المستخدم	"),

        ]
        ),
        new BaseCategoryNode(
            "5", "	Corporate Services	", [
            new BaseCategoryNode("78", "	تأسيس الشركات المحدودة-تضامنية-توصية بسيطة	"),
            new BaseCategoryNode("79", "	 قرارات الشركاء الجديد	"),
            new BaseCategoryNode("80", "	الافادات - خدمات الشركات	"),
            new BaseCategoryNode("81", "	تحديث بيانات الشركات	"),
            new BaseCategoryNode("82", "	تأسيس الشركات القابضة (ذات المسئولية المحدودة – مساهمة )	"),
            new BaseCategoryNode("83", "	فتح فروع شركات خليجية 	"),
            new BaseCategoryNode("84", "	تعديل فروع شركات خليجية	"),
            new BaseCategoryNode("85", "	تجديد  فروع شركات خليجية	"),
            new BaseCategoryNode("86", "	فتح فروع لشركات أجنبية	"),
            new BaseCategoryNode("87", "	تعديل فروع شركات أجنبية 	"),
            new BaseCategoryNode("88", "	تجديد  فروع شركات أجنبية	"),
            new BaseCategoryNode("89", "	فتح (فروع) لفروع شركات خليجية 	"),
            new BaseCategoryNode("90", "	تعديل (فروع) لفروع شركات خليجية 	"),
            new BaseCategoryNode("91", "	تجديد  (فروع) لفروع شركات خليجية 	"),
            new BaseCategoryNode("92", "	شطب  (فروع) لفروع شركات خليجية 	"),
            new BaseCategoryNode("93", "	فتح (فروع) لفروع شركات أجنبية 	"),
            new BaseCategoryNode("94", "	تعديل (فروع) لفروع شركات أجنبية 	"),
            new BaseCategoryNode("95", "	تجديد  (فروع) لفروع شركات أجنبية 	"),
            new BaseCategoryNode("96", "	شطب  (فروع) لفروع شركات أجنبية  	"),
            new BaseCategoryNode("98", "	تأسيس الشركات المهنية	"),
            new BaseCategoryNode("99", "	تحويل الكيان القانوني لشركة المساهمة الى شركة ذات مسئولية محدودة	"),
            new BaseCategoryNode("100", "	تحويل من شركة ذات مسؤولية محدودة الى شركة مساهمة مقفلة 	"),
            new BaseCategoryNode("197", "	قرارات الشركاء القديم	"),
            new BaseCategoryNode("201", "	حذف طلب تحديث مقبول بالخطأ	"),
            new BaseCategoryNode("349", "	ترجمة عقود	"),
            new BaseCategoryNode("350", "	ترجمة السجل التجاري للشركات	"),
            new BaseCategoryNode("351", "	تحديث سجل تجاري شركة (رئيسي - فرعي)	")
        ]
        ),
        new BaseCategoryNode(
            "24", "	Corporate commitment	", [
            new BaseCategoryNode("101", "	استقبال الشكاوى من المساهمين والشركاء	"),
            new BaseCategoryNode("169", "	إفادة الجهات الحكومية	"),
            new BaseCategoryNode("170", "	الرد على إدارات الشركات بخصوص رفع الحجب التأشير	")
        ]
        ),
        new BaseCategoryNode(
            "25", "	Corporate Governance	", [
            new BaseCategoryNode("168", "	ايقاف السجلات  ورفع الايقاف	"),
            new BaseCategoryNode("171", "	نشر قرارات الجمعية العامة غير العادية	"),
            new BaseCategoryNode("173", "	الافادات للشركات المساهمة	"),
            new BaseCategoryNode("174", "	دراسة النظام الأساسي للشركات المساهمة المدرجة	"),
            new BaseCategoryNode("110", "	طلبات تأسيس الشركات المساهمة	"),
            new BaseCategoryNode("181", "	متابعة إحاطة الوزارة بالجمعية	"),
            new BaseCategoryNode("182", "	تحديث سجل المساهمين	"),
            new BaseCategoryNode("200", "	نشر القرارات المساهمة	")
        ]
        ),
        new BaseCategoryNode(
            "6", "	Trademarks	", [
            new BaseCategoryNode("111", "	تسجيل العلامة التجارية ( أفراد 0 منشأت - جهات حكومية وشبة حكومية)	"),
            new BaseCategoryNode("112", "	تجديد علامة تجارية 	"),
            new BaseCategoryNode("113", "	اعتراض على قرار قبول تسجيل علامة تجارية	"),
            new BaseCategoryNode("114", "	تظلم على رفض تسجيل علامة تجارية	"),
            new BaseCategoryNode("115", "	قيد وكيل تسجيل علامة تجارية في سجل الوكلاء	"),
            new BaseCategoryNode("116", "	نقل ملكية العلامة التجارية	"),
            new BaseCategoryNode("117", "	تعديل اسم المالك أو العنوان أو العلامة أو الوكيل	"),
            new BaseCategoryNode("118", "	الغاء الترخيص باستخدام العلامة التجارية	"),
            new BaseCategoryNode("119", "	شطب العلامة التجارية او شطب بعض السلع أو الخدمات	"),
            new BaseCategoryNode("120", "	الترخيص باستخدام العلامة التجارية	"),
            new BaseCategoryNode("121", "	رهن/فك رهن العلامة التجارية	"),
            new BaseCategoryNode("122", "	صور شهادة التسجيل طبق الأصل/مستخرج	"),
            new BaseCategoryNode("123", "	البحث عن علامة تجارية	"),
            new BaseCategoryNode("124", "	شهادة إيداع علامة تجارية	")
        ]
        ),
        new BaseCategoryNode(
            "7", "	Laboratory Licenses	", [
            new BaseCategoryNode("125", "	ترخيص مبدئي لمختبر	"),
            new BaseCategoryNode("126", "	ترخيص نهائي لمختبر	")
        ]
        ),
        new BaseCategoryNode(
            "8", "	Certificate of Origin	", [
            new BaseCategoryNode("128", "	إصدار شهادة منشأ 	"),
            new BaseCategoryNode("129", "	تعديل شهادة المنشأ	"),
            new BaseCategoryNode("130", "	إستخراج بدل فاقد لشهادة المنشأ	"),
            new BaseCategoryNode("131", "	إصدار نسخة طبق الأصل	"),
            new BaseCategoryNode("132", "	إلغاء شهادة منشأ	"),
            new BaseCategoryNode("133", "	إصدار شهادة منشأ بأثر رجعي	"),
            new BaseCategoryNode("364", "	طباعة شهادة منشأ	"),
            new BaseCategoryNode("365", "	منتجات شهادة المنشأ	"),
            new BaseCategoryNode("366", "	توقيع شهادة المنشأ	"),
            new BaseCategoryNode("367", "	مستوردين شهادة المنشأ	"),
            new BaseCategoryNode("368", "	طلبات شهادة المنشأ	"),
            new BaseCategoryNode("369", "	رصيد شهادة المنشأ	")
        ]
        ),
        new BaseCategoryNode(
            "9", "	Paralegal Committees	", [
            new BaseCategoryNode("135", "	الفصل في المخالفات النظامية وأيقاع الغرامات والجزاءات	"),
            new BaseCategoryNode("137", "	الفصل في الشكاوى المقدمة من أصحاب الشأن المتعلقة بالأسماء التجارية	"),
            new BaseCategoryNode("139", "	تسليم قرار لجنة التحقيق وتوقيع العقوبات في نظام الأسماء التجارية.	"),
            new BaseCategoryNode("140", "	تسليم قرار لجنة النظر  في مخالفات نظام الشركات	"),
            new BaseCategoryNode("141", "	تسليم قرار لجنة توقيع عقوبات نظام السجل التجاري.	"),
            new BaseCategoryNode("142", "	تسليم قرار لجنة الفصل في مخالفات نظام المعادن الثمينة والأحجار الكريمة.	"),
            new BaseCategoryNode("143", "	تسليم قرار هيئة تطبيق العقوبات الواردة في نظام الوكالات التجارية.	")
        ]
        ),
        new BaseCategoryNode(
            "10", "	Glades	", [
            new BaseCategoryNode("144", "	الفسح الكيميائي -إصدار إذن استيراد للمواد الكيميائية الخطرة	"),
            new BaseCategoryNode("145", "	الفسح الكيميائي -إصدار إذن استيراد للمواد الكيميائية غير الخطرة	"),
            new BaseCategoryNode("146", "	الفسح الكيميائي - إصدار إذن فسح لأجهزة التقطير 	"),
            new BaseCategoryNode("147", "	الفسح الكيميائي -إصدار ترخيص مزاولة نشاط استيراد مواد تابعة لاتفاقية حظر الاسلحة الكيميائية	"),
            new BaseCategoryNode("148", "	الفسح الكيميائي-إصدار اذن فسح مواد تابعة لاتفاقية حظر الأسلحة الكيميائية	"),
            new BaseCategoryNode("149", "	الفسح الجمركي للبضائع 	")
        ]
        ),
        new BaseCategoryNode(
            "11", "	Commercial Agencies	", [
            new BaseCategoryNode("150", "	طلب تسجيل قيد وكالة تجارية 	"),
            new BaseCategoryNode("151", "	طلب تجديد قيد  وكالة تجارية 	"),
            new BaseCategoryNode("153", "	طلب تعديل في العقود او السجلات التجارية للوكيل او الموزع	"),
            new BaseCategoryNode("154", "	طلب شطب قيد وكالة تجارية من الوكيل	"),
            new BaseCategoryNode("155", "	طلب شطب قيد وكالة تجارية من الموكل 	")
        ]
        ),
        new BaseCategoryNode(
            "12", "	Gold and precious metals licenses	", [
            new BaseCategoryNode("156", "	ترخيص المعادن الثمينة والاحجار الكريمة 	"),
            new BaseCategoryNode("157", "	تعديل تراخيص المعادن الثمينة والاحجار الكريمة	"),
            new BaseCategoryNode("158", "	شطب تراخيص المعادن الثمينة والاحجار الكريمة	"),
            new BaseCategoryNode("159", "	بدل فاقد ترخيص معادن ثمينة	")
        ]
        ),
        new BaseCategoryNode(
            "13", "	Services of the Office for the Settlement of Commercial Disputes	", [
            new BaseCategoryNode("160", "	طلب الاعتراض ضد قرار مكتب الفصل	"),
            new BaseCategoryNode("161", "	طلب دفع مبلغ عقوبتي الغرامة والتشهير وطلب رفع الأسم من قائمتي إيقاف الخدمات والقبض	"),
            new BaseCategoryNode("162", "	استلام قرار مكتب الفصل وختمه بصيغة التنفيذ	"),
            new BaseCategoryNode("163", "	طلب إعادة فتح الدعوى بعد الشطب	")
        ]
        ),
        new BaseCategoryNode(
            "14", "	Discount Licenses	", [
            new BaseCategoryNode("164", "	اصدار تراخيص التخفيضات	"),
            new BaseCategoryNode("183", "	طلبات الموافقة علي العروض الترويجية	")
        ]
        ),
        new BaseCategoryNode(
            "15", "	Seasonal permits for ration vehicles	", [
            new BaseCategoryNode("165", "خدمة التصاريح الموسمية لمركبات الخدمات التموينية لشركات الاعاشة والتغذية")
        ]
        ),
        new BaseCategoryNode(
            "26", "	Chamber of Commerce	", [
            new BaseCategoryNode("191", "	إصدار	"),
            new BaseCategoryNode("192", "	تجديد	"),
            new BaseCategoryNode("193", "	مزامنة	"),
            new BaseCategoryNode("371", "	الفواتير المفقودة لنظام الغرف التجارية	")
        ]
        ),
        new BaseCategoryNode(
            "27", "	E-shops	", [
            new BaseCategoryNode("195", "	تسجيل/تفعيل المتاجر الإلكترونية	")
        ]
        ),
        new BaseCategoryNode(
            "28", "	Commercial Report Application	", [
            new BaseCategoryNode("202", "	الدخول على التطبيق	"),
            new BaseCategoryNode("203", "	رفع البلاغ	")
        ]
        ),
        new BaseCategoryNode(
            "30", "	الفرع الالكتروني	", [
            new BaseCategoryNode("300", "	اصدار سجل تجاري رئيسي – فرعي لشركة اجنبية	"),
            new BaseCategoryNode("301", "	اصدار سجل تجاري رئيسي او فرعي لمؤسسة لمواطني دول مجلس التعاون	"),
            new BaseCategoryNode("302", "	التحويل من فرع شركة الى فرع شركة أخرى 	"),
            new BaseCategoryNode("303", "	اصدار سجل تجاري رئيسي – فرعي لشركة – مختلطة	"),
            new BaseCategoryNode("304", "	تجديد سجل تجاري رئيسي او فرعي لمؤسسة لمواطني دول مجلس التعاون	"),
            new BaseCategoryNode("305", "	اصدار سجل تجاري رئيسي لفرع شركة اجنبية	"),
            new BaseCategoryNode("306", "	اصدار سجل تجاري رئيسي لفرع شركة خليجية	"),
            new BaseCategoryNode("307", "	اصدار سجل تجاري فرعي لشركة مساهمة	"),
            new BaseCategoryNode("308", "	اصدار سجل تجاري لشركة مهنية سعودية او مختلطة	"),
            new BaseCategoryNode("309", "	التحويل من فرع شركة الى مؤسسة رئيسي – فرعي	"),
            new BaseCategoryNode("310", "	تجديد السجل التجاري لشركة مهنية او مختلطة	"),
            new BaseCategoryNode("311", "	العقود التي يكون نشاطها مرخص من هيئة السوق المالية بحصر على نشاط معين	"),
            new BaseCategoryNode("312", "	العقود التي يكون أحد أطراف العقد جهة حكومية	"),
            new BaseCategoryNode("313", "	العقود التي تحمل أحكام قضائية	"),
            new BaseCategoryNode("314", "	تجديد سجل تجاري رئيسي – فرعي لشركة – مختلطة	"),
            new BaseCategoryNode("315", "	تجديد سجل تجاري رئيسي – فرعي لشركة – أجنبية	"),
            new BaseCategoryNode("316", "	تجديد سجل تجاري رئيسي او فرعي لشركة للخليجي	"),
            new BaseCategoryNode("317", "	تحويل السجل من فرعي الى رئيسي لمؤسسة لمواطني دول مجلس التعاون	"),
            new BaseCategoryNode("318", "	تحويل المؤسسات التي يكون مالكها صك وقف أو جهة حكومية إلى شركة مستقلة	"),
            new BaseCategoryNode("319", "	تجديد سجل تجاري رئيسي لفرع شركة خليجية	"),
            new BaseCategoryNode("320", "	تجديد سجل تجاري فرعي لشركة مساهمة	"),
            new BaseCategoryNode("321", "	تجديد سجل تجاري رئيسي لفرع شركة اجنبية	"),
            new BaseCategoryNode("322", "	تحويل فرع شركة خليجية أو مؤسسة مالكها خليجي إلى شركة مستقلة	"),
            new BaseCategoryNode("323", "	تحويل سجل شركة رئيسي الى مؤسسة	"),
            new BaseCategoryNode("324", "	تحويل الورثة مؤسسة مورثهم إلى شركة	"),
            new BaseCategoryNode("325", "	تعديل سجل تجاري رئيسي لفرع شركة اجنبية	"),
            new BaseCategoryNode("326", "	تعديل سجل تجاري رئيسي او فرعي لمؤسسة لمواطني دول مجلس التعاون	"),
            new BaseCategoryNode("327", "	تحويل نوع سجل تجاري للشركات (رئيسي الى فرعي والعكس)	"),
            new BaseCategoryNode("328", "	تحويل فرع شركة مساهمة إلى شركة مستقلة	"),
            new BaseCategoryNode("329", "	تعديل سجل تجاري لشركة مساهمة	"),
            new BaseCategoryNode("330", "	حجز اسم تجاري اجنبي بناء على اتفاقية بين شركة اجنبية وعميل سعودي	"),
            new BaseCategoryNode("331", "	حجز اسم تجاري لجهة حكومية	"),
            new BaseCategoryNode("332", "	حجز اسم تجاري لجمعية خيرية	"),
            new BaseCategoryNode("333", "	حجز اسم تجاري للخليجيين	"),
            new BaseCategoryNode("334", "	حجز اسم تجاري وقف	"),
            new BaseCategoryNode("335", "	رفع الايقاف عن السجل بسبب الاسم التجاري	"),
            new BaseCategoryNode("336", "	شطب سجل تجاري رئيسي لشركة اجنبية	"),
            new BaseCategoryNode("337", "	شطب سجل تجاري رئيسي لشركة خليجية	"),
            new BaseCategoryNode("338", "	شطب سجل تجاري رئيسي لشركة مختلطة	"),
            new BaseCategoryNode("339", "	شطب سجل تجاري رئيسي لشركة وطنية	"),
            new BaseCategoryNode("340", "	شطب سجل تجاري رئيسي وتحول الفرع لرئيسي لمؤسسة لسعودي.	"),
            new BaseCategoryNode("341", "	شطب سجل تجاري لمؤسسة لسعودي	"),
            new BaseCategoryNode("342", "	شطب سجل تجاري فرعي لشركة	"),
            new BaseCategoryNode("343", "	شطب سجل تجاري لمؤسسة لمواطني دول مجلس التعاون	"),
            new BaseCategoryNode("344", "	شطب سجل تجاري لمؤسسة لشخص متوفي	"),
            new BaseCategoryNode("345", "	عقود التأسيس التي يكون أحد أطراف العقد شركة لا يمكن إجراء تحديث لها  مثل :(شركة سعودية نوعها محدودة برأس مال خليجي)	"),
            new BaseCategoryNode("346", "	نقل ملكية سجل تجاري لشخص متوفي	"),
            new BaseCategoryNode("347", "	عقود التأسيس التي يكون أحد أطراف العقد شركة مساهمة	"),
            new BaseCategoryNode("804010001", "	تعديل ترجمة	")
        ]
        ),
        new BaseCategoryNode(
            "32", "	EFILE	", [
            new BaseCategoryNode("352", "	استعادة كلمة المرور	"),
            new BaseCategoryNode("353", "	التفاويض الإلكترونية	"),
            new BaseCategoryNode("354", "	تسجيل مستخدم جديد	"),
            new BaseCategoryNode("355", "	ايقاف / رفع ايقاف	"),
            new BaseCategoryNode("356", "	تحديث بيانات	")
        ]
        ),
        new BaseCategoryNode(
            "31", "	Maroof	", [
            new BaseCategoryNode("357", "	تعديل بيانات المتجر	"),
            new BaseCategoryNode("358", "	إيقاف متجر	"),
            new BaseCategoryNode("359", "	تفعيل متجر	"),
            new BaseCategoryNode("360", "	إضافة متجر	"),
            new BaseCategoryNode("361", "	إصدار سجل تجاري عن طريق معروف	")
        ]
        ),
        new BaseCategoryNode(
            "33", "	Renewal in one step	", [
            new BaseCategoryNode("362", "	مؤسسات الفردية	"),
            new BaseCategoryNode("363", "	خدمات الشركات	")
        ]
        ),
        new BaseCategoryNode(
            "66", "	المخالفات التجارية	", [
            new BaseCategoryNode("234", "	المخالفات التجارية	")
        ]
        ),
        new BaseCategoryNode(
            "34", "	SBC Services	", [
            new BaseCategoryNode("372", "	إصدار سجل مؤسسة فردية SBC	"),
            new BaseCategoryNode("373", "	 تعديل سجل مؤسسة SBC	"),
            new BaseCategoryNode("374", "	 تجديد سجل مؤسسة SBC	"),
            new BaseCategoryNode("375", "	 شطب سجل مؤسسة SBC	"),
            new BaseCategoryNode("376", "	تحويل نوع سجل مؤسسة SBC	"),
            new BaseCategoryNode("377", "	 طباعة مستخرج سجل مؤسسة SBC	"),
            new BaseCategoryNode("378", "	 طباعة شهادة سجل مؤسسة SBC	")
        ]
        ),
        new BaseCategoryNode(
            "35", "	المخالفات	", [
            new BaseCategoryNode("379", "	اعتراض على مخالفة نظام الشركات	"),
            new BaseCategoryNode("380", "	مشكلة تقنية عند سداد المخالفة	"),
            new BaseCategoryNode("381", "	بيانات المخالفة غير صحيحة	"),
            new BaseCategoryNode("382", "	اعتراض  على مخالفة تجارية	")
        ]
        )
    ]
}