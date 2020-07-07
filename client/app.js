// let groupName = document.querySelector("#groupName");

// window.addEventListener('DOMContentLoaded', ()=> {
//     ws = new WebSocket(`ws://localhost:8000/ws`);
//     ws.addEventListener('open', onConnectionOpen);
//     ws.addEventListener('message', onMessageRecieved);
// })

// function onConnectionOpen() {
//     console.log('connection opened');
//     const queryParams = getQueryParams();
//     console.log(queryParams);
//     if (!queryParams.name || !queryParams.group) {
//         window.location.href = "login.html";
//         return;
//     }
//     groupName.innerHTML = queryParams.group;

//     const event = {
//         event: "join",
//         groupName: queryParams.group,
//         name: queryParams.name,
//       };
//     ws.send(JSON.stringify(event));
// }

// function onMessageRecieved() {
//     console.log('message recieved');
// }

// function getQueryParams() {
//     const search = window.location.search.substring(1);
//     const pairs = search.split("&");
//     const params = {};
//     for (const pair of pairs) {
//       const parts = pair.split("=");
//       params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
//     }

//     return params;
//   }
