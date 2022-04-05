// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
// Set the region
AWS.config.update({
  region: "ap-south-1",
});

// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
var docClient = new AWS.DynamoDB.DocumentClient();

var queueURL = "https://sqs.ap-south-1.amazonaws.com/000263543451/TestQueue";

var params = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};

sqs.receiveMessage(params, function (err, data) {
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {

    console.log("Received Messages", data.Messages[0].MessageAttributes);
    var id =  data.Messages[0].MessageAttributes.ID.StringValue;
    var name = data.Messages[0].MessageAttributes.Name.StringValue;
    var add = data.Messages[0].MessageAttributes.Address.StringValue;
    var phone = data.Messages[0].MessageAttributes.Phone.StringValue;
    var start = data.Messages[0].MessageAttributes.Start_Des.StringValue;
    var final = data.Messages[0].MessageAttributes.Final_Des.StringValue;

    var table = "Cloudoea";
    var ID = parseInt(id);
    var Phone = parseInt(phone);

    var params1 = {
      TableName:table,
      Item:{
          "ID": ID,
          "Name": name, 
          "Address": add,
          "Phone": Phone,
          "Start_Des": start,
          "Final_Des": final      
      }
  };

    console.log("Adding a new item...");
    docClient.put(params1, function (err, data) {
      if (err) {
        console.error(
          "Unable to add item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
      }
    });

    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  }
});
