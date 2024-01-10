const api_key = "3556285c-13f0-45b2-b7cf-b39353f1389c"
let allOrdersArray;
let AllRoutesArray;
let currentGuideID;

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

function redirectToMainPage(){
    window.location.href = "index.html";
}

function getOrders(){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        allOrdersArray = this.response;
        fillOrdersTable();
    };

    xhr.send();
}

function getRoute(id){
    let route;
    for (let i = 0; i < AllRoutesArray.length; i++){
        if (AllRoutesArray[i].id.toString() === id.toString()){
            route = AllRoutesArray[i];
        }
    }
    return route
}

function fillOrdersTable(){
    let tbody = document.getElementById("routesPurchaseBody");
    tbody.innerHTML = "";

    for (let i = 0; i < allOrdersArray.length; i++) {
        let row = tbody.insertRow();

        let number = row.insertCell(0);
        let num = i + 1;
        number.innerText = num.toString();

        let route = getRoute(allOrdersArray[i].route_id);
        let name = row.insertCell(1);
        name.innerText = route.name.toString();


        let date = row.insertCell(2);
        date.innerText = allOrdersArray[i].date.toString();

        let price = row.insertCell(3);
        price.innerText = allOrdersArray[i].price.toString();

        let cellButton = row.insertCell(4);
        let buttonLook = createButton("bi-eye-fill", "orderModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, lookOrderButtonClick);
        let buttonEdit = createButton("bi-pencil-fill", "orderModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, editOrderButtonClick);
        let buttonDelete = createButton("bi-trash-fill", "deleteModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, deleteOrderButtonClick);
        cellButton.appendChild(buttonLook);
        cellButton.appendChild(buttonEdit);
        cellButton.appendChild(buttonDelete);
    }
}

function getOrder(id){
    let order;
    for (let i = 0; i < allOrdersArray.length; i++){
        if (allOrdersArray[i].id.toString() === id.toString()){
            order = allOrdersArray[i];
        }
    }

    return order;
}

function getGuide(id){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/guides/${id}?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    let guide;

    xhr.onload = function () {
        if (xhr.status === 200){
            guide = this.response;
        } else {
            console.log(xhr.onerror);
        }
    };

    xhr.send();
    return guide;
}

function disableModal(bool){
    document.getElementById("routeDate").disabled = bool;
    document.getElementById("routeStartTime").disabled = bool;
    document.getElementById("routeDuration").disabled = bool;
    document.getElementById("peopleNumber").disabled = bool;
    document.getElementById("firstOption").disabled = bool;
    document.getElementById("secondOption").disabled = bool;
}

function setModalValues(date, time, duration, num, firstOp, secondOP, price){
    document.getElementById("routeDate").value = date;
    document.getElementById("routeStartTime").value = time;
    document.getElementById("routeDuration").value = duration;
    document.getElementById("peopleNumber").value = num;
    document.getElementById("firstOption").checked = firstOp;
    document.getElementById("secondOption").checked = secondOP;
    document.getElementById("totalAmount").innerText = price;
}

function lookOrderButtonClick(){
    currentGuideID = event.currentTarget.getAttribute("order-id");
    let order = getOrder(currentGuideID);
    setModalValues(order.date, order.time, order.duration, order.persons,
        order.optionFirst, order.optionSecond, order.price);
    disableModal(true);
    document.getElementById("modalCancelButton").style.display = 'none';
    document.getElementById("modalPurchaseEdit").style.display = 'none';
}

function editOrderButtonClick(){
    currentGuideID = event.currentTarget.getAttribute("order-id");
    let order = getOrder(currentGuideID);
    setModalValues(order.date, order.time, order.duration, order.persons,
        order.optionFirst, order.optionSecond, order.price);
    disableModal(false);
    document.getElementById("modalCancelButton").style.display = 'block';
    document.getElementById("modalPurchaseEdit").style.display = 'block';
}

function deleteOrderButtonClick(){
    if (confirm("Вы уверены, что хотите удалить данный заказ?")) {
        deleteOrder(event.currentTarget.getAttribute("order-id"));
    }
}

function purchaseEditButtonClick(){

}

function createAlert(msg, type){
    const alertPlaceholder = document.getElementById('purchaseAlertPlaceholder');
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

function deleteOrder(id){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders/${id}?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        if (xhr.status){
            createAlert("Запись успешна удалена!", "success");
            getOrders();
        } else{
            createAlert("Ошибка при удаление: " + this.response.error, "danger")
        }
    }

    xhr.send();
}

function createButton(iconClass, modalId, routeId, guideId, orderId, handler) {
    let button = document.createElement("button");
    button.type = "button";
    button.className = "btn p-1";
    button.setAttribute("data-bs-toggle", "modal");
    button.setAttribute("data-bs-target", "#" + modalId);

    let icon = document.createElement("i");
    icon.className = "bi " + iconClass;
    button.appendChild(icon);

    button.setAttribute("route-id", routeId);
    button.setAttribute("guide-id", guideId);
    button.setAttribute("order-id", orderId);
    button.addEventListener("click", handler);

    return button;
}

function checkPeopleNumber(){
    if (event.target.value > 10){
        document.getElementById("firstOption").disabled = true;
        document.getElementById("firstOption").checked = "";
    } else{
        document.getElementById("firstOption").disabled = false;
    }
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
    pricePerHour = parseInt(getGuide(currentGuideID).pricePerHour);

    amount = pricePerHour * routeDuration * dayOffCoef + morningPlus + eveningPlus + peoplePlus;
    amount *= secondOptionCoef;
    if (document.getElementById("firstOption").checked){
        amount *= firstOptionCoef;
    }

    document.getElementById("totalAmount").innerText = Math.ceil(amount).toString();
}

function getAllRoutes(){
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
        AllRoutesArray = this.response;
        getOrders();
    }

    xhr.send();
}

window.onload = function (){
    getAllRoutes();
}