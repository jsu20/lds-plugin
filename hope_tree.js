
function isRecord(key) {
  return key.includes('UiApi::RecordRepresentation') && !key.includes('__fields__');
}


// recursive function that builds Tree JSON object
function makeTreeJSON(key, recs, tree) {
  let obj = {'name':key};
  if (!(key in recs)) {
    console.log('key not in recs');
    console.log(key);
  }
  if (!('fields' in recs[key]) && (recs[key]['value'] === null || typeof(recs[key]['value'])!=='object')) { // is a leaf
    console.log('obj '+key);
    console.log(obj);
    return obj;
  }

  obj['children'] = [];

  // must be field
  if (!('fields' in recs[key])) {
    // special check for child Record
    let ref = recs[key]['value']['__ref']
    ref_obj = makeTreeJSON(ref, recs, tree);
    obj['children'].push(ref_obj);
    return obj;
  }

  let fields = recs[key]['fields'];
  for (field in fields) {
    // if (field == '__proto__') {
    //   continue;
    // }

    let ref = fields[field]['__ref'];
    console.log('field ref '+field+' '+ref);
    ref_obj = makeTreeJSON(ref, recs, tree);
    console.log('ref obj');
    console.log(ref_obj);
    obj['children'].push(ref_obj);
  }
  //
  // console.log('key '+key);
  // console.log(obj);
  console.log('obj '+key);
  console.log(obj);
  return obj;
}

// format Response JSON to pass into makeTreeJSON
function formatResponse(response) {
  let parentArray = []; // child - parent relationship
  let recordsArray = []; // keeps track of all Records
  let recs;
  let original_names = {}; // for names that had () replaced
  let isRoot = {};

  let tree = {};

  if (response.source && response.source.records) {
    recs = response.source.records;
    console.log('recs');
    console.log(recs);

    for (key in recs) {

      // is a field Record
      if (key.includes('__fields__') && recs[key]['value'] !== null && typeof(recs[key]['value']) == 'object' && ('__ref' in recs[key]['value'])) {
        let ref = recs[key]['value']['__ref']
        if (isRecord(ref)) {
          isRoot[ref] = false;
        }
      }
      // if (key.slice(-3) == '__r') {
      //   key_rec = key.substring(0, key.indexOf('__fields__')); // text before __fields__
      //   // console.log('slice');
      //   // console.log(key.slice(-3));
      //   // console.log(key_rec);
      //   isRoot[key_rec] = false;
      //   // special check for child Record
      //   let ref = recs[key]['value']['__ref']
      //   if (isRecord(ref)) {
      //     isRoot[ref] = false;
      //   }
      //
      // }
      else if (isRecord(key)) {
        // insert into recordsArray
        // if (!(key in recordsArray)) {
        //   recordsArray.push(key);
        // }
        if (!(key in isRoot)) {
          isRoot[key] = true;
          console.log('true key');
          console.log(key);
        }
        // get all fields
        if (recs[key]['fields']) {
          let fields = recs[key]['fields'];
          for (field in fields) {
            let ref = fields[field]['__ref'];
            if (isRecord(ref)) {
              isRoot[ref] = false;
            }
            // let ref = fields[field]['__ref']; // assuming is a __fields__?
            // // () can't exist, replace them
            // // if (ref.includes('(') || ref.includes(')')) {
            // //   let orig = ref;
            // //   ref = ref.replace('(', '_');
            // //   ref = ref.replace(')', '_');
            // //   original_names[ref] = orig;
            // // }
            // // add ref + parent to parent array
            // if (ref in parentArray) {
            //   parentArray[ref].push(key);
            // } else {
            //   parentArray[ref] = [key];
            // }
          }
        }
      }
    }

    // get root and root children
    let root = 'root';

    recs[root] = {"apiName": "root","fields":{}};
    for (key in isRoot) {
      if (isRoot[key]) {
        recs[root]['fields'][key] = {'__ref':key};
      }
    }
    // console.log('roots');
    // console.log(isRoot);
    // console.log('recs');
    // console.log(recs);
    return recs;

    // tree['name'] = root;
    // tree['children'] = [];
    // for (key in isRoot) {
    //   if (isRoot[key]) {
    //     tree['children'].push(key);
    //   }
    // }
  }
}
// newTree = {};
// new_recs = formatResponse(treeData);
// treeData = makeTreeJSON('root', new_recs, newTree);
// console.log(newTree);

//
// var treeData =
//   {
//     "name": "Top Level",
//     "children": [
//       {
//         "name": "Level 2: A",
//         "children": [
//           { "name": "Son of A" },
//           { "name": "Daughter of A" }
//         ]
//       },
//       { "name": "Level 2: B" }
//     ]
//   };


function getText(key, recs) {
  if (key == 'root') {
    return 'root';
  }
  if (!key.includes('__fields__')) { //is Record
    return recs[key]['apiName'] ?? key;
  }
  if (key.slice(-3) == '__r') {
    return key.substring(key.indexOf('__fields__') + '__fields__'.length, key.length - 3);
  }
  return key.substring(key.indexOf('__fields__') + '__fields__'.length);
}

function getValue(key, recs) {
  if (key == 'root') {
    return 'root';
  }
  if (!key.includes('__fields__')) { //is Record
    return key.substring('UiApi::RecordRepresentation:'.length);
  }
  if (key.slice(-3) == '__r') {
    return key.substring('UiApi::RecordRepresentation:'.length, key.length - 3);
  }

  if (recs[key]['displayValue'] === null) {
    return recs[key]['value'] ?? key;
  }
  return recs[key]['displayValue'];
}




request = {
  "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__Id": {
    "displayValue": null,
    "value": "0050M00000BqCTkQAN"
  },
  "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__Name": {
    "displayValue": null,
    "value": "Jocelin Su"
  },
  "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__SystemModstamp": {
    "displayValue": "6/21/2020 10:10 PM",
    "value": "2020-06-22T05:10:10.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000BqCTkQAN": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "ee32715a4459514ac17b03873c258ee0",
    "fields": {
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__Id"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__Name"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000BqCTkQAN__fields__SystemModstamp"
      }
    },
    "id": "0050M00000BqCTkQAN",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-18T22:50:27.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T05:10:10.000Z",
    "weakEtag": 1592802610000
  },
  "UiApi::AbstractRecordAvatarRepresentation:0F90M0000002GA5SAM": {
    "backgroundColor": null,
    "eTag": "62650ac8583c0eba689d65362b26f093",
    "height": null,
    "photoMetadata": {
      "companyBluemasterId": null,
      "responseId": null
    },
    "photoUrl": "https://org62--c.na128.content.force.com/profilephoto/7290M000000BLOi/T",
    "provider": null,
    "recordId": "0F90M0000002GA5SAM",
    "type": "Photo",
    "width": null
  },
  "UiApi::RecordAvatarsBulk__0F90M0000002GA5SAM": {
    "result": {
      "__ref": "UiApi::AbstractRecordAvatarRepresentation:0F90M0000002GA5SAM"
    },
    "statusCode": 200
  },
  "UiApi::RecordAvatarsBulk": {
    "0F90M0000002GA5SAM": {
      "__ref": "UiApi::RecordAvatarsBulk__0F90M0000002GA5SAM"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-04-21T05:55:45.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003iqIZWAY"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DzrqGQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-20T04:37:28.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__CreatedDate": {
    "displayValue": null,
    "value": "2019-08-02T09:28:07.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Id": {
    "displayValue": null,
    "value": "0050M00000ET1JkQAL"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-22T15:02:17.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Name": {
    "displayValue": null,
    "value": "Denna Mafie"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000ohIh/T"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T19:09:17.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Title": {
    "displayValue": null,
    "value": "Global Projects Specialist"
  },
  "UiApi::RecordRepresentation:0050M00000ET1JkQAL": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "6e61aeb6c17756f3d3043fed5cb4f674",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL__fields__Title"
      }
    },
    "id": "0050M00000ET1JkQAL",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-22T15:02:17.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T19:09:17.000Z",
    "weakEtag": 1592852957000
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__Member": {
    "displayValue": "Denna Mafie",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000ET1JkQAL"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000ET1JkQAL"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-18T21:02:33.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqIZWAY": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "c49dc1f55b6759e79ab14f654512ce98",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqIZWAY__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003iqIZWAY",
    "lastModifiedById": "0050M00000DzrqGQAR",
    "lastModifiedDate": "2020-05-20T04:37:28.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-18T21:02:33.000Z",
    "weakEtag": 1592514153000
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-04-20T16:59:30.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003ipy3WAA"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DzrqGQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-20T04:39:31.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__CreatedDate": {
    "displayValue": null,
    "value": "2019-09-05T17:10:26.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Id": {
    "displayValue": null,
    "value": "0050M00000F534fQAB"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-02T02:24:38.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Name": {
    "displayValue": null,
    "value": "Larry Kamguia"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000oi34/T"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T15:17:15.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Title": {
    "displayValue": null,
    "value": "Senior Program Manager, Student Relations"
  },
  "UiApi::RecordRepresentation:0050M00000F534fQAB": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "718fedda9d159ebdf89fb880eba71ea9",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB__fields__Title"
      }
    },
    "id": "0050M00000F534fQAB",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-02T02:24:38.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T15:17:15.000Z",
    "weakEtag": 1592839035000
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__Member": {
    "displayValue": "Larry Kamguia",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000F534fQAB"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000F534fQAB"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-15T18:38:19.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ipy3WAA": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "8ae6dddbb8a8a63ed2a478360c40e188",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ipy3WAA__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003ipy3WAA",
    "lastModifiedById": "0050M00000DzrqGQAR",
    "lastModifiedDate": "2020-05-20T04:39:31.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-15T18:38:19.000Z",
    "weakEtag": 1592246299000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-03-19T21:55:56.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003ROaiWAG"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000ATyL5QAL"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-03-19T21:55:58.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__CreatedDate": {
    "displayValue": null,
    "value": "2018-10-12T11:23:26.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Id": {
    "displayValue": null,
    "value": "0050M00000Ev7daQAB"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000Fn3UhQAJ"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-01T18:05:26.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Name": {
    "displayValue": null,
    "value": "Lisa Glen"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M0000007RJr/T"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T21:33:38.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Title": {
    "displayValue": null,
    "value": "Futureforce Events Manager"
  },
  "UiApi::RecordRepresentation:0050M00000Ev7daQAB": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "2e81ce30b9f15781655f10a811d1778d",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB__fields__Title"
      }
    },
    "id": "0050M00000Ev7daQAB",
    "lastModifiedById": "0050M00000Fn3UhQAJ",
    "lastModifiedDate": "2020-06-01T18:05:26.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T21:33:38.000Z",
    "weakEtag": 1592861618000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__Member": {
    "displayValue": "Lisa Glen",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000Ev7daQAB"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000Ev7daQAB"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-16T23:26:47.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaiWAG": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "2650966a687ee01f15cbb1f1484f3a9d",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaiWAG__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003ROaiWAG",
    "lastModifiedById": "0050M00000ATyL5QAL",
    "lastModifiedDate": "2020-03-19T21:55:58.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-16T23:26:47.000Z",
    "weakEtag": 1592350007000
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-05-29T17:32:26.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003j9X5WAI"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DzrqGQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-29T17:32:28.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-01-04T03:08:17.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Id": {
    "displayValue": null,
    "value": "0050M00000F57fsQAB"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-22T15:26:03.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Name": {
    "displayValue": null,
    "value": "Sean Callahan-Dinish"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000ewVf/T"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T15:26:03.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Title": {
    "displayValue": null,
    "value": "Senior Recruiter, Futureforce AMER"
  },
  "UiApi::RecordRepresentation:0050M00000F57fsQAB": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "569468e81758e8717f0d3fd590f224fe",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB__fields__Title"
      }
    },
    "id": "0050M00000F57fsQAB",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-22T15:26:03.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T15:26:03.000Z",
    "weakEtag": 1592839563000
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__Member": {
    "displayValue": "Sean Callahan-Dinish",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000F57fsQAB"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000F57fsQAB"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-01T14:31:26.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003j9X5WAI": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "09d676a48898c22d3005c390ec9645de",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003j9X5WAI__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003j9X5WAI",
    "lastModifiedById": "0050M00000DzrqGQAR",
    "lastModifiedDate": "2020-05-29T17:32:28.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-01T14:31:26.000Z",
    "weakEtag": 1591021886000
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-06-09T18:28:16.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003MBRlWAO"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DzrqGQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-12T18:06:01.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__CreatedDate": {
    "displayValue": null,
    "value": "2019-04-10T20:16:22.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Id": {
    "displayValue": null,
    "value": "0050M00000Dzr6SQAR"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-18T19:13:03.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Name": {
    "displayValue": null,
    "value": "Stephanie Fong"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000ofKl/T"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-19T06:15:59.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Title": {
    "displayValue": null,
    "value": "Senior Talent Scout"
  },
  "UiApi::RecordRepresentation:0050M00000Dzr6SQAR": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "39a7ed973eaf34db6764a56913fa892b",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR__fields__Title"
      }
    },
    "id": "0050M00000Dzr6SQAR",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-18T19:13:03.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-19T06:15:59.000Z",
    "weakEtag": 1592547359000
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__Member": {
    "displayValue": "Stephanie Fong",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000Dzr6SQAR"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000Dzr6SQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-12T20:49:33.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003MBRlWAO": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "b2ae8350eaa549698c84794e1dcc7fb3",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003MBRlWAO__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003MBRlWAO",
    "lastModifiedById": "0050M00000DzrqGQAR",
    "lastModifiedDate": "2020-06-12T18:06:01.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-12T20:49:33.000Z",
    "weakEtag": 1591994973000
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-06-12T18:06:10.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003jFPKWA2"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000F57UuQAJ"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-15T16:38:55.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-01-01T19:52:01.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Id": {
    "displayValue": null,
    "value": "0050M00000F57UuQAJ"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-22T15:45:41.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Name": {
    "displayValue": null,
    "value": "Richard Noguchi"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M0000007fej/T"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T17:27:08.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Title": {
    "displayValue": null,
    "value": "Talent Scout"
  },
  "UiApi::RecordRepresentation:0050M00000F57UuQAJ": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "c6b4e9292e38e82dcff53801d42a10da",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ__fields__Title"
      }
    },
    "id": "0050M00000F57UuQAJ",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-22T15:45:41.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T17:27:08.000Z",
    "weakEtag": 1592846828000
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__Member": {
    "displayValue": "Richard Noguchi",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000F57UuQAJ"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000F57UuQAJ"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-15T16:38:56.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003jFPKWA2": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "231fcd107b443c8d7e19f80f03e75807",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003jFPKWA2__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003jFPKWA2",
    "lastModifiedById": "0050M00000F57UuQAJ",
    "lastModifiedDate": "2020-06-15T16:38:55.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-15T16:38:56.000Z",
    "weakEtag": 1592239136000
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-04-21T05:55:28.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003iqHbWAI"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DuXmeQAF"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-19T00:16:38.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__CreatedDate": {
    "displayValue": null,
    "value": "2017-02-08T17:16:00.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Id": {
    "displayValue": null,
    "value": "0050M00000CyjbDQAR"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-02T00:30:23.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Name": {
    "displayValue": null,
    "value": "Cori Lanigan"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000exLX/T"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T17:17:54.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Title": {
    "displayValue": null,
    "value": "Sr. Content Marketing Specialist, AMER"
  },
  "UiApi::RecordRepresentation:0050M00000CyjbDQAR": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "c3278665668d042e9af8d1b005fc4340",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR__fields__Title"
      }
    },
    "id": "0050M00000CyjbDQAR",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-02T00:30:23.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T17:17:54.000Z",
    "weakEtag": 1592846274000
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__Member": {
    "displayValue": "Cori Lanigan",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000CyjbDQAR"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000CyjbDQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-12T22:10:54.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqHbWAI": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "57adc63cef57b9fc1c7eb65151a409f4",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqHbWAI__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003iqHbWAI",
    "lastModifiedById": "0050M00000DuXmeQAF",
    "lastModifiedDate": "2020-05-19T00:16:38.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-12T22:10:54.000Z",
    "weakEtag": 1591999854000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-03-19T21:55:48.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003ROaTWAW"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000009j9ORAAY"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-18T01:19:55.000Z"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__CreatedDate": {
    "displayValue": null,
    "value": "2014-02-14T09:32:16.000Z"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "EUR"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Id": {
    "displayValue": null,
    "value": "00530000009j9ORAAY"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-16T00:44:17.000Z"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Name": {
    "displayValue": null,
    "value": "Caitlin McCauley"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000e0oP/T"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-21T21:01:37.000Z"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Title": {
    "displayValue": null,
    "value": "Events Manager, Futureforce"
  },
  "UiApi::RecordRepresentation:00530000009j9ORAAY": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "e8a118387aace66c134e854330bd7c7d",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY__fields__Title"
      }
    },
    "id": "00530000009j9ORAAY",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-16T00:44:17.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-21T21:01:37.000Z",
    "weakEtag": 1592773297000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__Member": {
    "displayValue": "Caitlin McCauley",
    "value": {
      "__ref": "UiApi::RecordRepresentation:00530000009j9ORAAY"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__MemberId": {
    "displayValue": null,
    "value": "00530000009j9ORAAY"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-16T13:29:58.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaTWAW": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "a950f3430b09b97ce7cd0c1c40b9447c",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaTWAW__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003ROaTWAW",
    "lastModifiedById": "00530000009j9ORAAY",
    "lastModifiedDate": "2020-05-18T01:19:55.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-16T13:29:58.000Z",
    "weakEtag": 1592314198000
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-05-19T21:16:52.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003EZV5WAO"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DzrqGQAR"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-29T17:32:44.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__CreatedDate": {
    "displayValue": null,
    "value": "2019-02-14T12:04:40.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Id": {
    "displayValue": null,
    "value": "0050M00000DvdM8QAJ"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-22T15:20:48.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Name": {
    "displayValue": null,
    "value": "Vincent Dinh"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000T9LV/T"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-22T23:09:40.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Title": {
    "displayValue": null,
    "value": "Talent Scout, Futureforce AMER"
  },
  "UiApi::RecordRepresentation:0050M00000DvdM8QAJ": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "97d3326722a363770600b90ff1f3ef99",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ__fields__Title"
      }
    },
    "id": "0050M00000DvdM8QAJ",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-22T15:20:48.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-22T23:09:40.000Z",
    "weakEtag": 1592867380000
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__Member": {
    "displayValue": "Vincent Dinh",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000DvdM8QAJ"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000DvdM8QAJ"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-17T17:43:59.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003EZV5WAO": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "6886fd65e94fd5a20d52cd2e15d478aa",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003EZV5WAO__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003EZV5WAO",
    "lastModifiedById": "0050M00000DzrqGQAR",
    "lastModifiedDate": "2020-05-29T17:32:44.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-17T17:43:59.000Z",
    "weakEtag": 1592415839000
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-04-21T05:54:59.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003iqISWAY"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000DuXmeQAF"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-05-20T16:21:28.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__CreatedDate": {
    "displayValue": null,
    "value": "2019-02-15T09:54:37.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Id": {
    "displayValue": null,
    "value": "0050M00000DvdNLQAZ"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-19T09:21:07.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Name": {
    "displayValue": null,
    "value": "MINJI LYE"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M0000003lt1/T"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-19T09:21:07.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Title": {
    "displayValue": null,
    "value": "Talent Scout, Futureforce AMER"
  },
  "UiApi::RecordRepresentation:0050M00000DvdNLQAZ": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "f6362a5eaf7d589d3d46f3a25daf8ec6",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ__fields__Title"
      }
    },
    "id": "0050M00000DvdNLQAZ",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-19T09:21:07.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-19T09:21:07.000Z",
    "weakEtag": 1592558467000
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__Member": {
    "displayValue": "MINJI LYE",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000DvdNLQAZ"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000DvdNLQAZ"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-12T17:35:15.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003iqISWAY": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "790be6af027342ff201dde84a400a929",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003iqISWAY__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003iqISWAY",
    "lastModifiedById": "0050M00000DuXmeQAF",
    "lastModifiedDate": "2020-05-20T16:21:28.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-12T17:35:15.000Z",
    "weakEtag": 1591983315000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CollaborationGroupId": {
    "displayValue": null,
    "value": "0F90M0000002GA5SAM"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CollaborationRole": {
    "displayValue": "Manager",
    "value": "Admin"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CreatedDate": {
    "displayValue": null,
    "value": "2020-03-19T21:53:01.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__Id": {
    "displayValue": null,
    "value": "0FB0M000003ROaEWAW"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__LastModifiedById": {
    "displayValue": null,
    "value": "0050M00000ATyL5QAL"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-03-19T22:08:12.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__CreatedDate": {
    "displayValue": null,
    "value": "2016-07-25T14:22:59.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__CurrencyIsoCode": {
    "displayValue": null,
    "value": "USD"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Id": {
    "displayValue": null,
    "value": "0050M00000ATyL5QAL"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__LastModifiedById": {
    "displayValue": null,
    "value": "00530000004tNS4AAM"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__LastModifiedDate": {
    "displayValue": null,
    "value": "2020-06-02T00:17:35.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Name": {
    "displayValue": null,
    "value": "Stephanie Mackenzie"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__SmallPhotoUrl": {
    "displayValue": null,
    "value": "https://org62--c.na128.content.force.com/profilephoto/7290M000000srdm/T"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-20T06:20:02.000Z"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Title": {
    "displayValue": null,
    "value": "Program Manager, Futureforce"
  },
  "UiApi::RecordRepresentation:0050M00000ATyL5QAL": {
    "apiName": "User",
    "childRelationships": {},
    "eTag": "549d33dcd7f0b5e82ddc02cd9ebdbcef",
    "fields": {
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__CreatedDate"
      },
      "CurrencyIsoCode": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__CurrencyIsoCode"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__LastModifiedDate"
      },
      "Name": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Name"
      },
      "SmallPhotoUrl": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__SmallPhotoUrl"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__SystemModstamp"
      },
      "Title": {
        "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL__fields__Title"
      }
    },
    "id": "0050M00000ATyL5QAL",
    "lastModifiedById": "00530000004tNS4AAM",
    "lastModifiedDate": "2020-06-02T00:17:35.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-20T06:20:02.000Z",
    "weakEtag": 1592634002000
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__Member": {
    "displayValue": "Stephanie Mackenzie",
    "value": {
      "__ref": "UiApi::RecordRepresentation:0050M00000ATyL5QAL"
    }
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__MemberId": {
    "displayValue": null,
    "value": "0050M00000ATyL5QAL"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__SystemModstamp": {
    "displayValue": null,
    "value": "2020-06-19T16:55:59.000Z"
  },
  "UiApi::RecordRepresentation:0FB0M000003ROaEWAW": {
    "apiName": "CollaborationGroupMember",
    "childRelationships": {},
    "eTag": "b68dfa8aa040e88b6ca25cbfba2556ad",
    "fields": {
      "CollaborationGroupId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CollaborationGroupId"
      },
      "CollaborationRole": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CollaborationRole"
      },
      "CreatedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__CreatedDate"
      },
      "Id": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__Id"
      },
      "LastModifiedById": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__LastModifiedById"
      },
      "LastModifiedDate": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__LastModifiedDate"
      },
      "Member": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__Member"
      },
      "MemberId": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__MemberId"
      },
      "SystemModstamp": {
        "__ref": "UiApi::RecordRepresentation:0FB0M000003ROaEWAW__fields__SystemModstamp"
      }
    },
    "id": "0FB0M000003ROaEWAW",
    "lastModifiedById": "0050M00000ATyL5QAL",
    "lastModifiedDate": "2020-03-19T22:08:12.000Z",
    "recordTypeId": null,
    "recordTypeInfo": null,
    "systemModstamp": "2020-06-19T16:55:59.000Z",
    "weakEtag": 1592585759000
  }
};



//
// newTree = {};
// new_recs = formatResponse(request);
// console.log('new recs');
// console.log(new_recs);
// treeData = makeTreeJSON('root', new_recs, newTree);
// console.log('treeData');
// console.log(treeData);
// createCollapsibleTree(treeData, new_recs);
//
// var treeData = [
//   {
//     "name": "Top Level",
//     "parent": "null",
//     "children": [
//       {
//         "name": "Level 2: A",
//         "parent": "Top Level",
//         "children": [
//           {
//             "name": "Son of A",
//             "parent": "Level 2: A"
//           },
//           {
//             "name": "Daughter of A",
//             "parent": "Level 2: A"
//           }
//         ]
//       },
//       {
//         "name": "Level 2: B",
//         "parent": "Top Level"
//       }
//     ]
//   }
// ];

function generateTree(treeData, records) {
  // clear screen 
  d3.selectAll("body > *").remove();
// ************** Generate the tree diagram	 *****************
var margin = {top: 20, right: 120, bottom: 20, left: 120},
	width = 1500 - margin.right - margin.left,
	height = 2500 - margin.top - margin.bottom;

var i = 0,
	duration = 750,
	root;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData;
root.x0 = height / 2;
root.y0 = 0;

update(root);

d3.select(self.frameElement).style("height", "500px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	  .on("click", click);

  nodeEnter.append("circle")
	  .attr("r", 1e-6)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
	  .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
	  .attr("r", 10)
	  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
	  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
	  .duration(duration)
	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	  .remove();

  nodeExit.select("circle")
	  .attr("r", 1e-6);

  nodeExit.select("text")
	  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", function(d) {
		var o = {x: source.x0, y: source.y0};
		return diagonal({source: o, target: o});
	  });

  // Transition links to their new position.
  link.transition()
	  .duration(duration)
	  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
	  .duration(duration)
	  .attr("d", function(d) {
		var o = {x: source.x, y: source.y};
		return diagonal({source: o, target: o});
	  })
	  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
	d._children = d.children;
	d.children = null;
  } else {
	d.children = d._children;
	d._children = null;
  }
  update(d);
}
}




// stores tabId that opened this devtools window
let tabId = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('got message');
  if (request.tabId == tabId && request.action == 'giveSource') {
    console.log('giveSource');
    console.log(tabId);
    console.log(JSON.stringify(request));
    newTree = {};
    new_recs = formatResponse(request);
    console.log('new recs');
    console.log(new_recs);
    treeData = makeTreeJSON('root', new_recs, newTree);
    console.log(treeData);
    generateTree(treeData, new_recs);
  }

});

//
chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
  // format response to be put in sugiyama-DAG
  alert('getSource devtools');
  alert(response.tabId);
  console.log(response);
  tabId = response.tabId;
  newTree = {};
  new_recs = formatResponse(response);
  console.log('new recs');
  console.log(new_recs);
  let treeData = makeTreeJSON('root', new_recs, newTree);
  console.log(treeData);
  generateTree(treeData, new_recs);


});
