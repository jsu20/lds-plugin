// get data from current active tab
// $mds = (function getModuleDefRegistry() {
//   const cs = $A.componentService;
//   const moduleDefRegistry = Object.keys(cs).find(key => { return cs[key] !== null && !Array.isArray(cs[key]) && typeof cs[key] === 'object' && cs[key]['force/lds']; })
//   return cs[moduleDefRegistry];
// })();
// $lds = (function getLdsInstance(mds) {
//   const def = mds['force/lds'];
//   const instance = Object.keys(def).find(key => { return def[key] !== null && !Array.isArray(def[key]) && typeof def[key] === 'object'; })
//   return def[instance];
// })($mds);
// $ads = (function getRecordLibraryInstance(mds) {
//   const def = mds['markup://force:recordLibrary'];
//   const instance = Object.keys(def).find(key => { return def[key] !== null && !Array.isArray(def[key]) && typeof def[key] === 'object'; })
//   return def[instance];
// })($mds);
// send putSource command
let grafo = [
  {
    "id": "0",
    "parentIds": ["8"]
  },
  {
    "id": "1",
    "parentIds": []
  },
  {
    "id": "2",
    "parentIds": []
  },
  {
    "id": "3",
    "parentIds": ["11"]
  },
  {
    "id": "4",
    "parentIds": ["12"]
  },
  {
    "id": "5",
    "parentIds": ["18"]
  },
  {
    "id": "6",
    "parentIds": ["9", "15", "17"]
  },
  {
    "id": "7",
    "parentIds": ["3", "17", "20", "21"]
  },
  {
    "id": "8",
    "parentIds": []
  },
  {
    "id": "9",
    "parentIds": ["4"]
  },
  {
    "id": "10",
    "parentIds": ["16", "21"]
  },
  {
    "id": "11",
    "parentIds": ["2"]
  },
  {
    "id": "12",
    "parentIds": ["21"]
  },
  {
    "id": "13",
    "parentIds": ["4", "12"]
  },
  {
    "id": "14",
    "parentIds": ["1", "8"]
  },
  {
    "id": "15",
    "parentIds": []
  },
  {
    "id": "16",
    "parentIds": ["0"]
  },
  {
    "id": "17",
    "parentIds": ["19"]
  },
  {
    "id": "18",
    "parentIds": ["9"]
  },
  {
    "id": "19",
    "parentIds": []
  },
  {
    "id": "20",
    "parentIds": ["13"]
  },
  {
    "id": "21",
    "parentIds": []
  }
];
chrome.runtime.sendMessage({action: 'putSource', source: grafo});
