var AWS = require('aws-sdk');
var PromiseFtp = require('promise-ftp');
var moment = require('moment');
var streamer = require('stream');
// Set the region 
AWS.config.update({region: 'us-west-2'});

const getFtpFile = async (item, ftp, s3) => {
  console.log("Getting the list...");

  return ftp.connect({host: item.ftpRequest.host, user: item.ftpRequest.username, password: item.ftpRequest.password})
    .then(function (serverMessage) {
      console.log('-> ' + item.ftpRequest.path + item.fileName);
      return ftp.get(item.ftpRequest.path + item.fileName);
    }).then(function (stream) {
      const uploadStream = ({ Bucket, Key }) => {
        const s3 = new AWS.S3();
        const pass = new streamer.PassThrough();
        return {
          writeStream: pass,
          promise: s3.upload({ Bucket, Key, Body: pass }).promise(),
        };
      };
      
      const { writeStream, promise } = uploadStream({Bucket:item.ftpRequest.destinationBucket, Key:item.fileName+'.'+item.fileDate});
        stream.pipe(writeStream);
        return promise;
    });
};

exports.handler = async (event) => {
  
  var s3 = new AWS.S3();
  
  try {

    for (var record of event.Records) {
      var ftp = new PromiseFtp();
      console.log(record.dynamodb);
      var item = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      
      let streami = await getFtpFile(item, ftp, s3);
      
      ftp.close;
      
    }
    
  } catch (error) {
    console.log(error.message);
  }

};




