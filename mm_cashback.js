const overlay = document.createElement('div');
const form = document.createElement('form');
overlay.id = 'bc-id-overlay';
form.id = 'bc-id-form';
window.IntervalNum = 0;

const priceSelector = '.item-money .item-price span';
const bonusSelector = '.item-money .item-bonus span.bonus-amount';
const discountSelector = 'span[class*="old-price-discount"][class$="price"]';
const discountPercentageSelector = 'div.discount-percentage';

const rootSelectors = [
    '.catalog-items-list',
]

const showMoreBtnSelectors = [
    '.catalog-items-list__show-more',
    '.cnc-catalog-listing__show-more',
    'button.catalog-listing__show-more',
]

const outOfStockSelector = '.catalog-listing__out-of-stock_items'
const outOfStockSelectors = ['.catalog-items-list__out-of-stock-heading']

const RewardDicount = 'DST';
const RewardCashback = 'CHK';

const SortDesc = 'DSC';
const SortTotalCost = 'TTC';

// идентификаторы элементов формы
const whatFind = 'bc-id-w-f';
const percentId = 'bc-id-min-per';
const howSort = 'bc-id-sort';
const pageId = 'bc-id-max-page';
const submitBtn = 'bc-id-smt';

const hostname = 'megamarket.ru';
const itemsCatalogExample = 'https://megamarket.ru/catalog/';

const cashBackSortType = `<div id="div-${howSort}">
                            <label for="${howSort}">
                                Сорт-ка:
                            </label>
                            <select id="${howSort}">
                            <option value="${SortTotalCost}" selected>Цена-кэшбэк</option>
                                <option value="${SortDesc}">По убыв. %</option>
                            </select>
                            </div>`;

document.addEventListener('change', function(event){
    var target = event.target;
    if (target.id == whatFind) {
    var howSortHTML = document.getElementById(howSort);
    if (target.value == RewardCashback) {
        if (!howSortHTML) {
        document.getElementById(whatFind).insertAdjacentHTML('afterend', cashBackSortType);
        }
    } else {
        if (howSortHTML) {
        var divSortType = document.getElementById(`div-${howSort}`);
        if (divSortType) divSortType.parentNode.removeChild(divSortType);
        }
    }
    }
});

function isItemsExists() {
    if (getItems().length) return true;
    return false;
}

function isFormOpen() {
    return window.bestCashFormOpen;
}

function formIsOpen() {
    window.bestCashFormOpen = true;	
}

function formIsClose() {
    window.bestCashFormOpen = false;
}

function getInput() {
    console.log(`Form is open? Answer: ${window.bestCashFormOpen }`)

    if (isFormOpen()) return;

    let formHtml = `<label for="${whatFind}">
                    Что ищем?
                    </label>
                    <select id="${whatFind}">
                    <option value="${RewardDicount}" selected>Скидку</option>
                    <option value="${RewardCashback}">Кэшбэк</option>
                    </select>
                    <label for="${percentId}"">
                    Мин. %:
                    </label>
                    <input type="number" id="${percentId}" name="min-percent" value="" required">`;
    if (window.MyBCL) {
    formHtml += `<p><b>${window.MyBCL.length} шт.</b></p>`
    } else {
    formHtml += `<label for="${pageId}">Страниц:</label><input type="number" id="${pageId}" name="max-page"">`;
    }
    
    formHtml += `<input id="${submitBtn}" type="submit" value="СТАРТ">`
    
    if (getHostname() != hostname) {
        form.tagName = 'DIV';
        formHtml = `<div><h4>Перейдите на <a href="${itemsCatalogExample}">${hostname}</a></h4></div>`;
    } else if (!(isItemsExists() || window.MyBCL)) {
    form.tagName = 'DIV';
    formHtml = `<div><h4>Товары не обнаружены</h4></div>`;
    } else {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const percent = parseInt(document.getElementById(percentId).value);
        const rewardType = document.getElementById(whatFind).value;
        const sortType = rewardType == RewardCashback ? document.getElementById(howSort).value : undefined;
        let page;

        if (window.MyBCL) {
        page = 0;
        } else {
        page = parseInt(document.getElementById(pageId).value);
        }

        
        removeBookmarklet();

        start(percent, page, rewardType, sortType);

        formIsClose()
    });
    }

    form.innerHTML = '';
    form.insertAdjacentHTML(
    'beforeend',
    formHtml
    );

    addBookmarklet();
    overlay.addEventListener('click', removeBookmarklet, { once: true });
}

function addBookmarklet() {
    document.body.insertAdjacentElement('beforeend', overlay);
    document.body.insertAdjacentElement('beforeend', form);

    formIsOpen();
}

function removeBookmarklet() {
    form.parentNode.removeChild(form);
    overlay.parentNode.removeChild(overlay);

    formIsClose();
    window.bestCashFormOpen = false;
}

const itemsSelectors = [
    'div.catalog-item-mobile',
    'div.catalog-item',
]

function getRoot() {
    let root;
    for (let sel of rootSelectors) {
        root = document.querySelector(sel);
        if (root) break;
    }
    return root;
}

function getMoreBtn() {
    let btn;
    for (let sel of showMoreBtnSelectors) {
        btn = document.querySelector(sel);
        if (btn) break;
    }
    
    return btn;
}

function getPrice(pt) {
    return parseInt(pt.replace(' ', ''));
}

function getItems() {
    let items = [];
    for (let sel of itemsSelectors) {
        items = document.querySelectorAll(sel)
        if (items.length) break;
    }
    return Array.from(items);
}

function isOutOfStockExists() {
    for (var sel of outOfStockSelectors) {
    if (document.querySelectorAll(sel).length) return true;
    }
    return false;
}

function removeItemFromPage(item) {
    try {
    item.parentNode.removeChild(item);
    } catch {
    
    }
    
}

function removeItemsFromPage(items) {
    items.forEach(function(el, i) {
        removeItemFromPage(el);
    })
}

function removeOutOfStock() {
    let div = document.querySelector(outOfStockSelector);
    if (div) {
        removeItemFromPage(div);
    }
}

function getItemPriceBonusPercents(itemDiv, rewardType) {
    let rewardSelector;
    if (rewardType == RewardCashback) {
    rewardSelector = bonusSelector;
    } else {
    rewardSelector = discountSelector;
    }

    let p = itemDiv.querySelector(priceSelector).textContent;
    let b = itemDiv.querySelector(rewardSelector).textContent;

    pp = getPrice(p);
    bp = getPrice(b);
    if (rewardType == RewardCashback) {
    ps = Math.round(bp / pp * 100);
    } else {
    ps = 100 - Math.round(pp / bp * 100);
    }

    

    return [pp, bp, ps];
}

function parsing(percents, root, rewardType, sortType) {
    /*if (!items.length) {
        items = getItems();
    }*/
    
    let newItems = [];

    for (let item of window.MyBCL) {
        try {
        var [p, b, ps] = getItemPriceBonusPercents(item, rewardType);

        var tItem = item.cloneNode(true);

        if (ps >= percents) {
            newItems.push(tItem);
            var totalCost = p - b;

            removeItemFromPage(tItem.querySelector(discountPercentageSelector));
            tItem.dataset['totalCost'] = totalCost;
            tItem.dataset['percents'] = ps;

            var tItemPriceDiv = tItem.querySelector(priceSelector);
            
            var val = `${ps}%`;
            if (rewardType == RewardCashback) val = `${totalCost} ₽ | ` + val;
            tItemPriceDiv.insertAdjacentHTML(
            'beforebegin',
            `<span style="color:red;">${val}</span><br>`);
        }
        } catch {
            continue;
        }
    }

    root.innerHTML = '';
    var sortingFunc = sortType == SortTotalCost ? sortingByTotalCost : sortingByPercentDesc;
    newItems.sort(sortingFunc);
    newItems.forEach((el, index) => root.appendChild(el));

    
    
}

function getDataPercents(item, datasetName) {
    return parseInt(item.dataset[datasetName]);
}

function sortingByPercentDesc(a, b) {
    // Сортировка по убыванию %
    try {
    var aPer = getDataPercents(a, 'percents');
    var bPer = getDataPercents(b, 'percents');
    if (aPer > bPer) return -1;
    if (aPer == bPer) return 0;
    if (aPer < bPer) return 1;
    } catch {}
}

function sortingByTotalCost(a, b) {
    var aTotalCost = getDataPercents(a, 'totalCost');
    var bTotalCost = getDataPercents(b, 'totalCost');

    if (aTotalCost > bTotalCost) return 1;
    if (aTotalCost == bTotalCost) return 0;
    if (aTotalCost < bTotalCost) return -1;
}

function delay() {
    return new Promise(resolve => setTimeout(resolve, 3000));
}

async function paginateWithCollectItems(maxPage, curPage=0) {    
    let btn = getMoreBtn();
    curPage += 1;
    
    
    let newItems;
    while (true) {
        newItems = getItems();
        if (newItems.length) break;
        console.log('page loading waiting...')
        await delay(1000);
    }
    
    removeItemsFromPage(newItems);
    
    window.MyBCL = window.MyBCL.concat(Array.from(newItems));

    if (maxPage && curPage == maxPage || maxPage < 1) {
        removeItemFromPage(btn);
        return;
    }

    if (isOutOfStockExists()) {
    removeOutOfStock();
    removeItemFromPage(btn);
    return;
    }
    
    if (btn) {
        btn.click();
        await delay();
        return await paginateWithCollectItems(maxPage, curPage);
    } else {
        return;
    }
}

async function startParsing(pCount, maxPage, rewardType, sortType) {
    // старт парсинга
    if (!window.MyBCL) {
    window.MyBCL = new Array();
    await paginateWithCollectItems(maxPage, 0);
    }

    let root = getRoot();
    parsing(pCount, root, rewardType, sortType);
}

function getHostname() {
    // получить текущий адрес сайта
    return window.location.hostname;
}

function start(pCount, maxPage, rewardType, sortType) {
    
    // pCount: минимальный процент кэшбэка, например 73
    // maxPage: максимальное количество страниц пагинации
    if (pCount < 0) pCount = 0;
    startParsing(pCount, maxPage, rewardType, sortType);
}
