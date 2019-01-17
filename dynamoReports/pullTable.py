from __future__ import print_function # Python 2/3 compatibility
import boto3
from boto3.dynamodb.conditions import Key, Attr
from boto3.session import Session

client = boto3.client('dynamodb')


session = Session(aws_access_key_id='',aws_secret_access_key='',region_name='us-east-2')
dynamodb = session.resource('dynamodb')
table = dynamodb.Table('ResponseTimes')

table.

def report_rt_range(beg,end):
    table = dynamodb.Table('ResponseTimes')
    filter_exp=Key('Totalduration').gt(10000)

    response = table.scan(
        FilterExpression=filter_exp
    )
    return response


resp = report_rt_range(0,10000)
print (len(resp))
#Find min,avg,med,std-dev, 95th%, 99th%, max with counts

