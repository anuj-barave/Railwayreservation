#!/bin/sh
sudo su
yum update -y
yum install -y httpd
service httpd start
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
sudo yum install nodejs -y
sudo yum install npm -y
