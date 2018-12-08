install k6

Create device using:
$node createdevices -n 5 -login_prefix xxyyy3

Alternatively run registerdevice for a single device

On a separate shell run followig to simulate the browser side( vu's(-u 5) duration(1m)):
$k6 run   -d 1m -u 5 -e login_prefix=xxyyy3 oaauth.js

