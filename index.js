var AWS = require('aws-sdk');
var PromiseFtp = require('promise-ftp');
var moment = require('moment');
// Set the region 
AWS.config.update({region: 'us-west-2'});

const getFtpList = async (event, ftp) => {
  console.log("Getting the list...");

  return ftp.connect(event.connection)
    .then(function (serverMessage) {
      return ftp.list(event.path);
    }).then(function (list) {
      return list.map(file => ({serviceName: 'checkFtpServer', fileName:file.name, fileDate:file.date, fileHash: stringHash(file.name+':'+file.date)}));
    });
};

const getFtpStatus = async (docClient) => {
  console.log("Getting the item...");
  var params = {
    TableName:tableName,
    Key: {
      'serviceName': 'sample'
    }
  };
  
  return docClient.get(params).promise()
    .then(function (ftpStatus) {return ftpStatus.Item;});
};

// const compareHashes = async (currentHash, storedHash) => {
//   return new Promise((resolve, reject) => {
//     if (currentHash)
    
//   });
//   console.log("Getting the item...");
//   var params = {
//     TableName:tableName,
//     Key: {
//       'serviceName': 'sample'
//     }
//   };
  
//   return docClient.get(params).promise();
// };

const putFileData = async (docClient, serviceName, file) => {
  console.log('putting');
  var params = {
    TableName: 'ftpFileList',
    Key: {
      'serviceName': serviceName
    },
    Item: file,
    // ReturnValues: 'NONE'
  };
  
  return docClient.put(params).promise();
};

const updateHashList = async (docClient, ftpStatus, listHash, fileList) => {
  console.log("Updating the item...");
  var params = {
    TableName:tableName,
    Key: {
      'serviceName': ftpStatus.serviceName
    },
    UpdateExpression: "set listHash = :h, updatedOn=:u, fileList=:f",
    ExpressionAttributeValues:{
        ":h":listHash,
        ":u":moment().toISOString(),
        ":f":fileList
    },
    ReturnValues:"UPDATED_NEW"
  };
  
  return docClient.update(params).promise();
};

exports.handler = async (event) => {
  
  try {
    console.log('checkFtpServer: ' + event.connection);
    
    var ftp = new PromiseFtp();
    let list = await getFtpList(event, ftp);
//    console.log(JSON.stringify(list));
    ftp.close;
    // let ftpStatus = await getFtpStatus(docClient);
    
    // var listHash = stringHash(JSON.stringify(list));
    // console.log(JSON.stringify(ftpStatus));
    
    // if (ftpStatus.listHash != listHash) {
    //   var oldList = new Set(ftpStatus.fileList);
    //   var validList = list.filter((item) => {
    //     return !oldList.has(item);
    //   });
    //   // console.log('==> ' + JSON.stringify(validList));
    //   let updatedStatus = await updateHashList(docClient, ftpStatus, listHash, list);
    // }
    
    for (var file of list) {
      console.log(file);
      // let stuff = await putFileData(docClient, 'checkFtpServer', file);
    }
    
    console.log('stuff');
    console.log(stuff);

    // console.log('new hash: ' + stringHash(JSON.stringify(list)));
    // console.log(ftpStatus);
    
  } catch (error) {
    console.log(error.message);
  }
  
};



