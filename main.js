const api_key = "3556285c-13f0-45b2-b7cf-b39353f1389c"
let currentRoutesResponseArray
let AllRoutesResponseArray
let AllGuidesArray
let currentGuidesArray
let currentPage = 0;
let totalCount = 0;
const rowsPerPage = 5;
let currentRouteId = -1;
let currentGuideId = -1;

let DayOff = [
    "01-01", "01-02", "01-03", "01-04", "01-05", "01-06", "01-07", "01-08",
    "02-23",
    "03-08",
    "04-29", "04-30",
    "05-01", "05-09", "05-10",
    "06-12",
    "11-04",
    "12-30", "12-31"
]


function applyGuideOptionFilters(){
    let selector = document.getElementById("guideLanguagePlace");
    let selectedOption = selector.options[selector.selectedIndex];

    if (selectedOption.value === "Не выбран"){
        currentGuidesArray = AllGuidesArray;
    } else{
        currentGuidesArray = AllGuidesArray.filter(guide => {
            return guide.language.toString() === selectedOption.value;
        });
    }
    fillGuidesTable();
}

function purchaseButtonClick(){
    document.getElementById("guideBlock").style.display = 'block';

    let guideRows = document.getElementById("routesBody").children;
    for (let i = 0; i < guideRows.length; i++){
        guideRows[i].className = "";
    }
    let rowGuide = event.target.parentNode.parentNode;
    rowGuide.className = "table-success";
    let routeId = event.target.getAttribute("route-id");
    currentRouteId = routeId;
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.send();

    xhr.onload = function () {
        AllGuidesArray = this.response;
        currentGuidesArray = AllGuidesArray
        fillGuidesTable();
        fillGuidesOptions();
    }
}

function fillGuidesOptions(){
    let selector = document.getElementById("guideLanguagePlace")
    selector.innerHTML = '';
    selector.appendChild(createOption("Не выбран"));
    let uniqueObjects = getUniqueLanguages();
    uniqueObjects.forEach(name => {
        selector.appendChild(createOption(name));
    });
}

function getUniqueLanguages(){
    const uniqueLanguages = new Set();
    for (let i = 0; i < AllGuidesArray.length; i++){
        uniqueLanguages.add(AllGuidesArray[i].language.toString());
    }
    return uniqueLanguages;
}

function fillGuidesTable(){
    let tbody = document.getElementById("guidesBody");
    tbody.innerHTML = "";

    for (let i = 0; i < currentGuidesArray.length; i++) {
        let row = tbody.insertRow();

        let name = row.insertCell(0);

        name.innerText = currentGuidesArray[i].name.toString();
        let language = row.insertCell(1);
        language.innerText = currentGuidesArray[i].language.toString();
        let workExperience = row.insertCell(2);
        workExperience.innerText = currentGuidesArray[i].workExperience.toString();
        let pricePerHour = row.insertCell(3);
        pricePerHour.innerText = currentGuidesArray[i].pricePerHour.toString();

        let cellButton = row.insertCell(4);
        let button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-primary";
        button.setAttribute("data-bs-toggle", "modal");
        button.setAttribute("data-bs-target", "#purchaseModal");
        button.textContent = "Выбрать";
        button.setAttribute("guide-id", currentGuidesArray[i].id);
        button.addEventListener("click", buttonChooseClick);
        cellButton.appendChild(button);
    }
}

function clearModal(){
    document.getElementById("routeStartTime").value = "";
    document.getElementById("routeDate").value = "";
    document.getElementById("peopleNumber").value = "";
    document.getElementById("routeDuration").value = "1";
    document.getElementById("firstOption").checked = "";
    document.getElementById("firstOption").disabled = false;
    document.getElementById("secondOption").checked = "";
}

function buttonChooseClick(){
    clearModal();
    currentGuideId = event.target.getAttribute("guide-id");
    fillPurchaseModal();
    calculateAmount();
}

function calculateAmount(){
    let amount = 0;

    let firstOptionCoef = 1.15;
    let secondOptionCoef = 1;
    if (document.getElementById("secondOption").checked){
        secondOptionCoef = 1.3;
    }

    let routeTime = document.getElementById("routeStartTime").value.split(":");
    let routeTimeHours = parseInt(routeTime[0]);
    let routeTimeMinutes = parseInt(routeTime[1]);
    let morningPlus = 0, eveningPlus = 0;
    if (routeTimeHours >= 9 && routeTimeHours <= 12){
        if (!(routeTimeHours === 12 && routeTimeMinutes > 0)){
            morningPlus = 400;
        }
    }
    if (routeTimeHours >= 20 && routeTimeHours <= 23){
        if (!(routeTimeHours === 23 && routeTimeMinutes > 0)){
            morningPlus = 1000;
        }

    }
    let dayOffCoef = 1;

    let date = document.getElementById("routeDate").value;
    DayOff.forEach(dateoff=>{
        if (dateoff.toString().includes(date)){
            dayOffCoef = 1.5;
        }

    });
    let peopleNumber = parseInt(document.getElementById("peopleNumber").value);
    let peoplePlus = 0;
    if (peopleNumber > 5 && peopleNumber <= 10){
        peoplePlus = 1000;
        firstOptionCoef = 1.25;
    } else if (peopleNumber > 10 && peopleNumber <= 20){
        peoplePlus = 1500;

    }
    let selector = document.getElementById("routeDuration");

    let routeDuration = parseInt(selector.options[selector.selectedIndex].value);
    let pricePerHour = 0;
    AllGuidesArray.forEach(guide =>{
        if (guide.id == currentGuideId){
            pricePerHour = parseInt(guide.pricePerHour);
        }

    });

    amount = pricePerHour * routeDuration * dayOffCoef + morningPlus + eveningPlus + peoplePlus;
    amount *= secondOptionCoef;
    if (document.getElementById("firstOption").checked){
        amount *= firstOptionCoef;
    }

    document.getElementById("totalAmount").innerText = Math.ceil(amount).toString();
}

function fillPurchaseModal(){
    let routeName, guideName;
    AllRoutesResponseArray.forEach(route =>{
        if (route.id == currentRouteId){
            routeName = route.name;
        }
    });

    AllGuidesArray.forEach(guide =>{
        if (guide.id == currentGuideId){
            guideName = guide.name;
        }
    });
    document.getElementById("modalGuideName").innerText = guideName;
    document.getElementById("modalRouteName").innerText = routeName;
}

function fillOptionSelector(){
    let selector = document.getElementById("selectorPlace")
    selector.innerHTML = '';
    selector.appendChild(createOption("Не выбрано"));
    let uniqueObjects = getUniqueObjects();
    uniqueObjects.forEach(name => {
        selector.appendChild(createOption(name));
    });
}

function applyGuideSearchFilters() {
    applyGuideOptionFilters();

    let maxExp = parseInt(document.getElementById("maxExp").value);
    let minExp = parseInt(document.getElementById("minExp").value);
    if (!isNaN(minExp) && isNaN(maxExp)){
        currentGuidesArray = currentGuidesArray.filter(guide =>{
            return parseInt(guide.workExperience) >= minExp;
        });
    } else if (isNaN(minExp) && !isNaN(maxExp)){
        currentGuidesArray = currentGuidesArray.filter(guide =>{
            return parseInt(guide.workExperience) <= maxExp;
        });
    } else if (!isNaN(minExp) && !isNaN(maxExp)){
        currentGuidesArray = currentGuidesArray.filter(guide =>{
            return parseInt(guide.workExperience) <= maxExp && parseInt(guide.workExperience) >= minExp;
        });
    }
    fillGuidesTable();
}

function applyRouteSearchFilters() {
    let searchedName = document.getElementById("inputName").value;
    applyRouteOptionFilters();
    currentRoutesResponseArray = currentRoutesResponseArray.filter(route => {
        return route.name.toString().includes(searchedName);
    });
    currentPage = 1;
    updatePagination(1);
    fillRoutesTable();
}

function applyRouteOptionFilters(){
    let selector = document.getElementById("selectorPlace");
    let selectedOption = selector.options[selector.selectedIndex];

    currentPage = 1;
    if (selectedOption.value === "Не выбрано"){
        currentRoutesResponseArray = AllRoutesResponseArray;
    } else{
        currentRoutesResponseArray = AllRoutesResponseArray.filter(route => {
            return route.mainObject.toString().includes(selectedOption.value);
        });
    }
    updatePagination(1);
    fillRoutesTable();
}

function createAlert(msg, type){
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);

        setTimeout(() => {
            wrapper.remove();
        }, 5000);
    }
    appendAlert(msg, type);
}

function redirectToLK(){
    window.location.href = "personalAccount.html";
}

function purchaseSubmitButtonClick(){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";

    let order = makeOrderData();

    xhr.onload = function () {
        if (xhr.status === 200) {
            createAlert("Экскурсия успешно оформлена!", "success");
        } else {
            createAlert("Ошибка при оформлении: " + this.response.error, "danger");
        }
    };

    xhr.send(order);


}

function makeOrderData(){
    let order = new FormData();

    const firstOption = document.getElementById("firstOption").checked ? 1 : 0;
    const secondOption = document.getElementById("secondOption").checked ? 1 : 0;

    order.append("guide_id", currentGuideId);
    order.append("route_id", currentRouteId);
    order.append("date", document.getElementById("routeDate").value.toString());
    order.append("time", document.getElementById("routeStartTime").value.toString());
    order.append("duration", document.getElementById("routeDuration").value.toString());
    order.append("persons", document.getElementById("peopleNumber").value.toString());
    order.append("price", document.getElementById("totalAmount").innerText.toString());
    order.append("optionFirst", firstOption.toString());
    order.append("optionSecond", secondOption.toString());

    return order;
}

function getUniqueObjects() {
    const uniqueObjects = new Set();
    const re = new RegExp("/(\\s-\\s)|(\\s–\\s)|(\\s-\\s)|(\\s-\\s)/");
    for (let i = 0; i < AllRoutesResponseArray.length; i++){
        let objects = AllRoutesResponseArray[i].mainObject.toString().split(re);
        for (let j = 0; j < objects.length; j++){
            if (objects[j] !== undefined && objects[j].length > 4 && objects[j].length < 25){
                uniqueObjects.add(objects[j]);
            }
        }
    }
    return uniqueObjects;
}

function createOption(content) {
    const option = document.createElement('option');
    option.value = content;
    option.text = content;
    return option;
}
function fillRoutesTable() {
    let tbody = document.getElementById("routesBody");
    tbody.innerHTML = "";

    for (let i = (currentPage - 1) * rowsPerPage; i < currentPage * rowsPerPage; i++) {
        if (i < totalCount) {
            if (currentRoutesResponseArray[i] !== undefined){
                let row = tbody.insertRow();

                let name = row.insertCell(0);
                name.innerText = currentRoutesResponseArray[i].name.toString();

                let discr = row.insertCell(1);
                discr.innerText = currentRoutesResponseArray[i].description.toString();

                let objects = row.insertCell(2);
                objects.innerText = currentRoutesResponseArray[i].mainObject.toString();

                let buttons = row.insertCell(3);
                let button = document.createElement("button");
                button.type = "button";
                button.className = "btn btn-primary";
                button.textContent = "Оформить";
                button.setAttribute("route-id", currentRoutesResponseArray[i].id);
                if (parseInt(currentRouteId) === parseInt(currentRoutesResponseArray[i].id)){
                    row.className = "table-success";
                }
                button.addEventListener("click", purchaseButtonClick);
                buttons.appendChild(button);
            }
        }
    }
}

function clickOnPagination(){
    let listElement = event.target;
    if (listElement.getElementsByClassName("page-link").length === 0){
        if (listElement.id === "next" && currentPage < currentRoutesResponseArray.length/rowsPerPage){
            updatePagination(parseInt(currentPage) + 1);
        } else if (listElement.id === "prev" && parseInt(currentPage) > 1){
            updatePagination(parseInt(currentPage) - 1);
        }
    }
}

function updatePagination(value) {
    currentPage = value;
    totalCount = currentRoutesResponseArray.length;

    document.getElementById("current-interval-start").innerText = currentPage.toString();
    let maxPages = currentRoutesResponseArray.length/rowsPerPage;
    if (Math.floor(maxPages) < maxPages){
        maxPages = Math.floor(maxPages) + 1;
    } else {
        maxPages = Math.floor(maxPages);
    }
    document.getElementById("current-interval-end").innerText = maxPages.toString();

    let isLastPage = currentPage >= Math.ceil(totalCount / rowsPerPage);
    let isFirstPage = currentPage === 1;

    if (isLastPage){
        document.getElementById("next").className = "page-link disabled";
    } else{
        document.getElementById("next").className = "page-link";
    }

    if (isFirstPage){
        document.getElementById("prev").className = "page-link disabled";
    } else {
        document.getElementById("prev").className = "page-link";
    }
    fillRoutesTable();
}


function getRoutes(){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.send();

    xhr.onload = function () {
        AllRoutesResponseArray = this.response;
        currentRoutesResponseArray = AllRoutesResponseArray
        updatePagination(1);
        fillRoutesTable();
        fillOptionSelector();
    }
}

function checkPeopleNumber(){
    if (event.target.value > 10){
        document.getElementById("firstOption").disabled = true;
        document.getElementById("firstOption").checked = "";
    } else{
        document.getElementById("firstOption").disabled = false;
    }
}

window.onload = function () {
    getRoutes();
    document.getElementById("inputName").addEventListener("input", applyRouteSearchFilters);
};