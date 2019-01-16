from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key, Attr

# Helper class to convert a DynamoDB item to JSON.

dynamodb = boto3.resource('dynamodb', region_name='us-east-2', endpoint_url="http://localhost:8000")

table = dynamodb.Table('ResponseTimes')


response = table.query(
    KeyConditionExpression=Key('duration').gt(40000)
)

for i in response['Items']:
    print(i)
