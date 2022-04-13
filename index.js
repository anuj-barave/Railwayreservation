const express = require('express');
const path = require('path');
const app = express();
var AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/recieve',(req,res)=>{
  
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
  res.redirect('view');

});

app.get('/view',(req,res)=>{
  var AWS = require("aws-sdk");

  // Set a region to interact with (make sure it's the same as the region of your table)
  AWS.config.update({region: 'ap-south-1'});
  
  
  
  // Create the Service interface for DynamoDB
  var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  
  // Create the Document Client interface for DynamoDB
  var ddbDocumentClient = new AWS.DynamoDB.DocumentClient();
  
  async function scanForResults(){
      try {
          var params = {
              TableName: "Cloudoea"
          };
          var result = await dynamodb.scan(params).promise()
          // console.log(result.Items[0].Name);
         res.render('view_records', {data: result.Items});
      } catch (error) {
          console.error(error);
      }
  }
  scanForResults()
});


app.post('/form1', (req, res) => {
  var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  var no= req.body.id;
  var name = req.body.name1;
  var add = req.body.address;
  var phone = req.body.phone;
  var start = req.body.start;
  var final = req.body.final;
  

  var params = {
   // Remove DelaySeconds parameter and value for FIFO queues
  DelaySeconds: 10,
  MessageAttributes: {
    "ID": {
      DataType: "Number",
      StringValue: no
    },
    "Name": {
      DataType: "String",
      StringValue: name
    },
    "Address": {
      DataType: "String",
      StringValue: add
    },
    "Phone": {
      DataType: "Number",
      StringValue: phone
    },
    "Start_Des": {
      DataType: "String",
      StringValue: start
    },
    "Final_Des": {
      DataType: "String",
      StringValue: final
    }
  },
  MessageBody: "Test Message",
  // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
  // MessageGroupId: "Group1",  // Required for FIFO queues
  QueueUrl: "https://sqs.ap-south-1.amazonaws.com/000263543451/TestQueue"
};



sqs.sendMessage(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});
  res.redirect('recieve');
});



PORT = 3203
app.listen(PORT, () => console.log(`App listening on port ${PORT}`),);