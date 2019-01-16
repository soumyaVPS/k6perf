from __future__ import print_function # Python 2/3 compatibility
import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-2')

table = dynamodb.create_table(
   TableName ='ResponseTimes',
      KeySchema = [
                {'AttributeName' : 'guid',
                    'KeyType' : 'HASH'
                }],
        AttributeDefinitions=[
        {
            'AttributeName': 'guid',
            'AttributeType': 'S'
        }],
        ProvisionedThroughput={
        'ReadCapacityUnits': 10,
        'WriteCapacityUnits': 10
    }
)

