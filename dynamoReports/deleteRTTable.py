from __future__ import print_function # Python 2/3 compatibility
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-2')

table = dynamodb.Table('ResponseTimes')

table.delete()
