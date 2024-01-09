const api_key = "3556285c-13f0-45b2-b7cf-b39353f1389c"
let allOrdersArray;
let AllRoutesArray;

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
        let buttonLook = createButton("bi-eye-fill", "lookModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, lookOrderButtonClick);
        let buttonEdit = createButton("bi-pencil-fill", "editModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, editOrderButtonClick);
        let buttonDelete = createButton("bi-trash-fill", "editModal",
            route.id, allOrdersArray[i].guide_id, allOrdersArray[i].id, deleteOrderButtonClick);
        cellButton.appendChild(buttonLook);
        cellButton.appendChild(buttonEdit);
        cellButton.appendChild(buttonDelete);
    }
}

function lookOrderButtonClick(){

}

function editOrderButtonClick(){

}

function deleteOrderButtonClick(){
    if (confirm("Вы уверены, что хотите удалить данный заказ?")) {
        deleteOrder(event.currentTarget.getAttribute("order-id"));
    }
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