const { Client, Databases, Query } = Appwrite;
const client = new Client();
const databases = new Databases(client);

let initArr = [];
const boxAmount = 9999;

const databaseId = "66b629070003982f4ede";
const collectionId = "66b6291f0007038bb23d";
const projectId = "66b623af0029e5881737"
client.setEndpoint("https://cloud.appwrite.io/v1").setProject(projectId); 

document.addEventListener("DOMContentLoaded", async function() {

    client.subscribe(`databases.${databaseId}.collections.${collectionId}.documents`, response => {
        let value = false;
        if(response.events[0].endsWith(".create")){
             value = response.payload.value;
        }
        initArr[response.payload.$id] = value;
        updateTotalCounter();
        document.getElementById(response.payload.$id).checked = value;    
    });

    const result = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.limit(100000000)]
    );
    console.log(result)
    for(let i = 0; i < result.documents.length; i++) {
        const id = result.documents[i].$id;
        if(id < boxAmount) {
            initArr[id] = true;
        }
    }

    updateTotalCounter();
    updateCounter(0);

    const div = document.getElementById("main");  
    for(let i = 1; i <= boxAmount; i++){
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = initArr[i]
        checkbox.id = i;
        checkbox.height = "100px";
        checkbox.addEventListener("change", function() { checkboxToggle(checkbox)});
        div.appendChild(checkbox);
    }
});

function checkboxToggle(checkbox) {
    if(checkbox.checked) {
        databases.createDocument(
            databaseId,  
            collectionId, 
            checkbox.id,
            { value: true }
        ).then(function (response) {
            initArr[checkbox.id] = true;
            updateCounter(1);
            console.log("Created successfully:", response);
        }).catch(function (error) {
            console.error("Failed to create:", error)
        });
    }
    else {
        databases.deleteDocument(
            databaseId,  
            collectionId, 
            checkbox.id,
        ).then(function (response) {
            initArr[checkbox.id] = false;
            updateCounter(-1);
            console.log("Deleted successfully:", response);
        }).catch(function (error) {
            console.error("Failed to delete:", error)
        });
    }
}

function updateCounter(value) {
    let count = localStorage.getItem("count");
    if(count == null) {
        count = 0;
    }
    const newCount = parseInt(count) + value;
    localStorage.setItem("count", newCount);
    const personalChecksCounter = document.getElementById("personalChecksCounter");
    personalChecksCounter.innerText = `You checked ${newCount} boxes.`; 
}

function updateTotalCounter() {
    const totalChecks = document.getElementById("totalChecks");
    totalChecks.innerText = initArr.filter(Boolean).length + " boxes are ✅";
}