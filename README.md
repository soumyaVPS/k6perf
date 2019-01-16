
Test hosted app:
    https://perf-tk-rp.herokuapp.com
    sampleuser: tree123666

Alternatively, createuser and authenticate links
    createuser link:
    http://perfsyntheticwallets-env.dpxssdrz7n.us-east-2.elasticbeanstalk.com/createUser?login=peruvian125

    login link:
    httpperfsyntheticwallets-env.dpxssdrz7n.us-east-2.elasticbeanstalk.com/notified?devicetoken=elYWjUdm1O4:APA91bGveIgqwCegLGp1RTdrUYPB1e7BEMHauKi84nLSDw9ie94ckxDOx9cp9mH4ITue-BxE3SFs28hoQGA7i9ynK6DL70e09k9Qe6bLd1icC5FfDN4RHfJy2YYAgbRavQRtZM-e1bf

To run the tests execute:
1.Install k6
2. k6  run -u=<number of users> -d=1m -e login_prefix=testuser12345673 oauth-test.js
    

