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
});

PORT = 3201
app.listen(PORT, () => console.log(`App listening on port ${PORT}`),);