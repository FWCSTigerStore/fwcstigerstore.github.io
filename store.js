/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */
//FROM https://developers.google.com/sheets/api/quickstart/js
// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '121005583930-rg8vb71qq25rfevvmi3krh3lr0o3clau.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCI-AEx3ZdOx9W03_iKRMcJCRJl4AB-Qd0';


// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = ["https://sheets.googleapis.com/$discovery/rest?version=v4",'https://people.googleapis.com/$discovery/rest?version=v1'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let gLoggedIn = false;
const loginGoogleBtn = document.getElementById('login-google');
const gradeInput = document.getElementById('grade');
const enterBtn = document.getElementById('enter-store');
const halftimeInput = document.getElementById('halftime');
const reviewOrderBtn = document.getElementById('review-order')
const submitOrderBtn = document.getElementById('submit-order')
const bucksCountlbl = document.getElementById('bucks-count')
const accountInfoBtn = document.getElementById('accountInfo')
const items = document.querySelectorAll('.shopItem')
const storeSheetID = "1TKWtiI-wUWlls54dvuuhWThRKEon2TZ3MNj_WKztCP4"//TEST - "1FzgpF7zWxAEZqDGVi-ynbrXbktBhPUmNN8b04nzSJlE" ACTUAL - "1TKWtiI-wUWlls54dvuuhWThRKEon2TZ3MNj_WKztCP4"
const pricesSheetName = "Shop Prices"
const suppliesSheetName = "Shop Supplies"
const bankSheetName = "Bank"
const ordersSheetName = "Orders"
const accountSheetName = "Accounts"
let gradeColumn
let studentName
let studentGrade
let halftimeFacilitator
let numOfTigerBucks
let studentRow
let maxRaffles
let maxSnacks
let maxSchool
let itemPrices
let itemSupplies
let rafflesBought = 0
let snacksBought = 0
let schoolBought = 0
const date = new Date();
const fullDate = date.toLocaleDateString();
let currentTime = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
currentTime = militaryToStandardTime(currentTime)
function militaryToStandardTime(mTime) {
    let time = mTime.split(':'); // convert to array

    // fetch
    var hours = Number(time[0]);
    var minutes = Number(time[1]);
    var seconds = Number(time[2]);

    // calculate
    var timeValue;

    if (hours > 0 && hours <= 12) {
    timeValue= "" + hours;
    } else if (hours > 12) {
    timeValue= "" + (hours - 12);
    } else if (hours == 0) {
    timeValue= "12";
    }
    
    timeValue += (minutes < 10) ? ":0" + minutes : ":" + minutes;  // get minutes
    timeValue += (seconds < 10) ? ":0" + seconds : ":" + seconds;  // get seconds
    timeValue += (hours >= 12) ? " P.M." : " A.M.";  // get AM/PM
    return timeValue
}
let order = {
    timestamp: fullDate + " " + currentTime,
    orderName: "",
    orderHalftime: "",
    orderItems: []
}
let numOfItemsBought = 0
let numOfOrders
const store = document.getElementById('store');

document.getElementById('login-google').style.visibility = 'hidden';
document.getElementById('enter-store').style.visibility = 'hidden';
document.getElementById('school-info').style.visibility = 'hidden';
document.getElementById('cart').style.visibility = 'hidden';
store.style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
    gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOC,
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('login-google').style.visibility = 'visible';
        
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
        throw (resp);
        }
        gLoggedIn = true;
        let label = document.createElement('label');
        label.textContent = "Successfully logged into Google!"
        label.id="logged-in"
        document.getElementById('google-signin').remove()
        let accountNames = await getValueRow(storeSheetID, accountSheetName, "A1:D", 0);
        let orderNames = await getValueRow(storeSheetID, ordersSheetName, "A1:B", 1);
        studentName = await peopleAPI()
        if(orderNames.includes(studentName)){
            alert("You have already placed an order!")
            window.location.href = "https://fwcstigerstore.github.io/"
        }
        if(!accountNames.includes(studentName)){
            document.getElementById('school-info').style.visibility = 'visible';
            checkIfCompletedLogin()
        }else{
            alert("Logging In, please wait...")
            let accountIndex = accountNames.indexOf(studentName) + 1     
            studentGrade = await getValue(storeSheetID, accountSheetName, "B" + accountIndex);
            halftimeFacilitator = await getValue(storeSheetID, accountSheetName, "C" + accountIndex);
            order.orderName = studentName
            order.orderHalftime = halftimeFacilitator[0]
            studentRow = await getValue(storeSheetID, accountSheetName, "D" + accountIndex);
            gradeColumn = await getValue(storeSheetID, accountSheetName, "E" + accountIndex);
            numOfTigerBucks = await getValue(storeSheetID, bankSheetName, gradeColumn + studentRow)
            enterStore()
        }
    };
    
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({prompt: 'consent'});
        
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
    }
}


loginGoogleBtn.addEventListener('click', () => {
    handleAuthClick()
});


function checkIfCompletedLogin(){
    if(gLoggedIn){
        document.getElementById('enter-store').style.visibility = 'visible';
    } else{
        document.getElementById('enter-store').style.visibility = 'hidden';
    }
   
    
}
//domcontetnloaded
document.addEventListener('DOMContentLoaded', () => {
     //Increase login div opacity slowly start at 0 end at 1
        let loginDiv = document.getElementById('login')
        let loginDivOpacity = 0
        let loginDivInterval = setInterval(() => {
            loginDiv.style.opacity = loginDivOpacity
            loginDivOpacity += 0.05
            if(loginDivOpacity >= 1){
                clearInterval(loginDivInterval)
            }
        }
        , 50)
})

async function getValue(spreadsheetId, sheetName, range){
    try{
    response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        });
        const result = response.result;
        console.log(result)
        const output = result.values[0]
        console.log(output)
        return output;
    } catch(err){
        console.error("Error when trying to get cells: " + err.message)
        
    }
}

async function getIntValue(spreadsheetId, sheetName, range){
    try{
    response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        });
        const result = response.result;
        console.log(result)
        const output = result.values[0]
        console.log(output)
        return parseInt(output);
    } catch(err){
        console.error("Error when trying to get cells: " + err.message)
        
    }
}

async function getValueRow(spreadsheetId, sheetName, range, primaryKey){
    const data = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
      });
      
      //here you will get that array of arrays
      const allData = data.result.values; 
      
      //Now you have to find an index in the subarray of Primary Key (such as 
      //email or anything like that
      
      const flattenedData = allData.map((someArray) => {
        return someArray[primaryKey]; //My primary key is on the index 2 in the email 
        Array
    });

      return flattenedData;
}


async function getValueKeyPair(spreadsheetId, sheetName, range, key, value){
    const data = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
      });
      
      //here you will get that array of arrays
      const allData = data.result.values; 
      
      //Now you have to find an index in the subarray of Primary Key (such as 
      //email or anything like that
      
      const keyArray = allData.map((someArray) => {
        return someArray[key]; //My primary key is on the index 2 in the email 
        Array
    });
    const valueArray = allData.map((someArray) => {
        return someArray[value]; 
        Array
    });
    let keyValueArray = []
   keyArray.forEach((v, i) => {
    keyValueArray[v] = valueArray[i]
   })

      return keyValueArray;
}

//FROM https://developers.google.com/sheets/api/guides/values
function updateValues(spreadsheetId, sheetName, range, _values, callback) {
    let values = [
        [
        // Cell values ...
        ],
        // Additional rows ...
    ];
    values = _values;
    const body = {
        values: values,
    };
    try {
        gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: sheetName + "!" + range,
        valueInputOption: "USER_ENTERED",
        resource: body,
        }).then((response) => {
        const result = response.result;
        console.log(`${result.updatedCells} cells updated.`);
        if (callback) callback(response);
        });
    } catch (err) {
        //document.getElementById('content').innerText = err.message;
        console.error("Error when trying to update cells: " + err.message);
        return;
    }
}


enterBtn.addEventListener('click', async () => {
    studentGrade = gradeInput.value
    halftimeFacilitator = halftimeInput.value
    order.orderName = studentName
    order.orderHalftime = halftimeFacilitator
    
    
    if(studentGrade == 6)
    {
        gradeColumn = "K"
        let flattenedData = await getValueRow(storeSheetID, bankSheetName, "J1:K100", 0);
        console.log(flattenedData)
        if(!flattenedData.includes(studentName)){
            alert("Please make sure you entered your name correctly and try again!")
            return;
        }
        studentRow = flattenedData.indexOf(studentName) + 1;
    } else if(studentGrade == 7){
        gradeColumn = "G"
        let flattenedData = await getValueRow(storeSheetID, bankSheetName, "F1:G100", 0);
        console.log(flattenedData)
        if(!flattenedData.includes(studentName)){
            alert("Please make sure you entered your name correctly and try again!")
            return;
        }
        studentRow = flattenedData.indexOf(studentName) + 1;
    } else
    {
        gradeColumn = "C"
        let flattenedData = await getValueRow(storeSheetID, bankSheetName, "B1:C100", 0);
        console.log(flattenedData)
        if(!flattenedData.includes(studentName)){
            alert("Please make sure you entered your name correctly and try again!")
            return;
        }
        studentRow = flattenedData.indexOf(studentName) + 1;
    }
    numOfTigerBucks = await getValue(storeSheetID, bankSheetName, gradeColumn + studentRow)
    if(numOfTigerBucks == undefined){
        alert("Please make sure you entered the correct grade and try again!")
        return;
    }
    createAccount()
    
    enterStore()
})

async function createAccount(){
    let numOfAccounts = await getIntValue(storeSheetID, accountSheetName, "H1")
    let accountNumber = numOfAccounts + 1
    await updateValues(storeSheetID, accountSheetName, "A" + (accountNumber + 1), [[studentName, studentGrade, halftimeFacilitator, studentRow, gradeColumn]])
    await updateValues(storeSheetID, accountSheetName, "H1", [[accountNumber]])
}

async function enterStore(){
    console.log(gradeColumn + studentRow)
    
    
    bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
    maxRaffles = await getIntValue(storeSheetID, pricesSheetName, "F2")
    maxSnacks = await getIntValue(storeSheetID, pricesSheetName, "F3")
    maxSchool = await getIntValue(storeSheetID, pricesSheetName, "F4")
    
    itemPrices = await getValueKeyPair(storeSheetID, pricesSheetName, "A2:B", 0, 1);
    itemSupplies = await getValueKeyPair(storeSheetID, suppliesSheetName, "A2:B50", 0, 1);
    displayItemPrices()
    const login = document.getElementById('login');
    //fade out login startin at 1 end at 0
    let loginDivInterval = setInterval(() => {
        if (login.style.opacity > 0) {
            login.style.opacity -= 0.05;
        } else {
            clearInterval(loginDivInterval);
            login.style.display = "none";
            login.remove()
            store.style.opacity = 0;
            store.style.visibility = 'visible';
            //fade in store startin at 0 end at 1
            let storeDivOpacity = 0
            let storeDivInterval = setInterval(() => {
                store.style.opacity = storeDivOpacity
                storeDivOpacity += 0.05
                if(storeDivOpacity >= 1){
                    clearInterval(storeDivInterval)
                }
            }
            , 50)
        }
    }, 50);
    alert("Welcome " + studentName + " to the Tiger Store! You are in " + studentGrade + "th grade and have " + numOfTigerBucks + " tiger bucks" )

    
}

function displayItemPrices(){
    items.forEach((item) => {
        itemPrice = itemPrices[item.querySelector('.addToCart').id]
        item.querySelector('.itemPrice').textContent = itemPrice + " Tiger Bucks"
    })
}

async function peopleAPI(){
    let pName;

       
   // pName = gapi.client.people.people.get({
   //     'resourceName': 'people/me',
    //    'requestMask': 'names'
    //    });
    
    response = await gapi.client.people.people.get({
        'resourceName': 'people/me',
      'requestMask.includeField': 'person.names'
      });
      const connections = response.result.names[0].displayName;
     // if (!connections || connections.length == 0) {
        //document.getElementById('content').innerText = 'No connections found.';
       // console.log("NO CONNECTION FOUND")
       // return;
      //}
      // Flatten to string to display
     /* const output = connections.reduce(
          (str, person) => {
            if (!person.names || person.names.length === 0) {
              return `${str}Missing display name\n`;
            }
            return `${str}${person.names[0].displayName}\n`;
          },
          'Connections:\n');
    */
    console.log(connections)
    return connections;
}


items.forEach((itemO) => {
    let item = itemO.querySelector('.addToCart')
    item.addEventListener('click', () => {
        let itemType = item.dataset.type;
        console.log(snacksBought)
        let itemPrice = itemPrices[item.id]
        if(parseInt(itemPrice) > parseInt(numOfTigerBucks)){
            alert("You only have " + numOfTigerBucks + " tiger bucks and you need " + itemPrice + " tiger bucks") 
            return
        }
        let itemSupply = itemSupplies[item.id]
        if(parseInt(itemSupply) <= 0){
            alert("Sorry, we are out of " + item.id)
            return
        }
        if(itemType == "school"){
            if(schoolBought >= maxSchool){
                alert("You have bought the max number of school items!")
                return
            }
            schoolBought++
        } else if(itemType == "snacks"){
            if(snacksBought >= maxSnacks){
                alert("You have bought the max number of snacks!")
                return
            }
           snacksBought++
        } else if(itemType == "raffle"){
            if(rafflesBought >= maxRaffles){
                alert("You have bought the max number of raffle tickets!")
                return
            }
            rafflesBought++
        }
        
        
        itemSupplies[item.id] -= 1
        numOfTigerBucks -= itemPrice
        numOfItemsBought++
        order.orderItems.push(item.id)
        bucksCountlbl.textContent = `${numOfTigerBucks} Tiger Bucks`
        alert("You bought " + item.id + " for " + itemPrice + " tiger bucks!")

    })
})

reviewOrderBtn.addEventListener('click', () => {
    document.getElementById('store').remove()
    document.getElementById('cart').style.visibility = 'visible';
    loadShopCart()
})

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

submitOrderBtn.addEventListener('click', async () => {
    numOfOrders = await getIntValue(storeSheetID, ordersSheetName, "H1")
    //alert(`Order Summary: \n Name: ${order.orderName} \n Halftime Facilitator: ${order.orderHalftime} \n Item #1: ${order.orderItem1} \n Item #2: ${order.orderItem2} \n Item #3: ${order.orderItem3}`)
    numOfOrders++;
    console.log(order)
    let orderItemsChecked = []
    let orderedItems = []
    let itemsOrdered = ""
    var bar = new Promise((resolve, reject) => {
        order.orderItems.forEach(async (item, index, array) => {
            //Get Item Names
            
            let itemNames = await getValueRow(storeSheetID, suppliesSheetName, "A1:A100", 0);
            let row = itemNames.indexOf(item) + 1
            
            await updateValues(storeSheetID, suppliesSheetName, "B" + row, [[itemSupplies[item]]])
           //Check if item is already in orderItemsChecked
             if(orderItemsChecked.includes(item)){
                return;
             }
             let numOfItem = countInArray(order.orderItems, item)
    
           // orderedItems.push(item + " x" + numOfItem)
           console.log(item, "ITEM")
           console.log(typeof item, "ITEM TYPE")
           console.log(typeof numOfItem, "NUM TYPE")
            itemsOrdered += ", " + item + " x" + numOfItem;
            console.log(itemsOrdered, "ITEMS ORDERED LOOP")
            orderItemsChecked.push(item)
            if(index === array.length -1 ){
                resolve()
            }
    
        })
    })
    bar.then(async () => {

    

    
        console.log(itemsOrdered, "ITEMS ORDERED")
        
        await updateValues(storeSheetID, ordersSheetName, "A" + (parseInt(numOfOrders) + 1), [[order.timestamp,order.orderName, order.orderHalftime, itemsOrdered]])
        await updateValues(storeSheetID, ordersSheetName, "H1" , [[parseInt(numOfOrders)]])
        
        await updateValues(storeSheetID, bankSheetName, gradeColumn + studentRow, [[numOfTigerBucks]])
        location.reload()
    })

})


function loadShopCart(){
    const table = document.getElementById('shop-cart')
    order.orderItems.forEach(item => {
       
    
        let newEntry = document.createElement('tr')
        let orderItemName = document.createElement('td')
        orderItemName.textContent = item
        let orderItemCost = document.createElement('td')
        orderItemCost.textContent = itemPrices[item]
        table.appendChild(newEntry)
        newEntry.appendChild(orderItemName)
        newEntry.appendChild(orderItemCost)
    });
}

