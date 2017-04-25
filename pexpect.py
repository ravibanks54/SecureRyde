import pexpect
import time
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setup(7, GPIO.OUT)
p = GPIO.PWM(7.50)
p.start(7.5)

try:
    p.ChangeDutyCycle(7.5)

    isUnlocked = False

    c = pexpect.spawn('geth --testnet --verbosity 1 console')

    c.expect('>')
    c.sendline("personal.unlockAccount('0xf0d271e17d629565130d367fae122e5c55107baf',\"capstone\")\r");
    time.sleep(8)
    c.expect('>')
    c.sendline("var abi = \[{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'custLat','type':'string'} ,{'name':'custLong','type':'string'} ],'name':'confirmTrip','outputs':\[],'payable':true,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddress','type':'address'} ],'name':'returnPosition','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'withdrawFunds','outputs':\[{'name':'','type':'bool'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'destLat','type':'string'} ,{'name':'destLong','type':'string'} ],'name':'startRide','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ],'name':'finishRide','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ],'name':'confirmPayment','outputs':\[{'name':'','type':'uint256'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'checkLockStatus','outputs':\[{'name':'','type':'bool'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'newLat','type':'string'} ,{'name':'newLong','type':'string'} ],'name':'updatePosition','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'i','type':'uint256'} ],'name':'getLocationByIndex','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ,{'name':'','type':'address'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'initLat','type':'string'} ,{'name':'initLong','type':'string'} ],'name':'joinCarRegistry','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'getNumberOfCars','outputs':\[{'name':'','type':'uint256'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'returnDestination','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'returnRates','outputs':\[{'name':'','type':'string'} ,{'name':'','type':'string'} ,{'name':'','type':'string'} ],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[{'name':'carAddr','type':'address'} ,{'name':'newLockState','type':'bool'} ],'name':'toggleLock','outputs':\[],'payable':false,'type':'function'} ,{'constant':false,'inputs':\[],'name':'checkTripStatus','outputs':\[{'name':'','type':'uint256'} ],'payable':false,'type':'function'} ,{'inputs':\[],'payable':false,'type':'constructor'} ,{'anonymous':false,'inputs':\[{'indexed':false,'name':'carAddr','type':'address'} ,{'indexed':false,'name':'TripStatus','type':'string'} ],'name':'TripStatusUpdate','type':'event'} ]\r")
    time.sleep(8)
    c.expect('>')
    c.sendline("var MyContract = web3.eth.contract(abi);\r")
    time.sleep(8)
    c.expect('>')
    c.sendline("var contract = MyContract.at('0x36d8b62a8cc06a9b3d1a2c4cafd9be6f64d31034');\r")
    time.sleep(8)
    c.expect('>')

    while (True):
        # continuously check if car is called
        while(True):
            c.sendline("contract.checkTripStatus.call()\r")
            time.sleep(3)
            i = c.expect(["1111", "2222", "3333"])
            if i == 0:
                break
            elif i == 1:
                print "error: two"
            elif i == 2:
                print "error: timeout"
        c.expect('>')
        time.sleep(10)
        c.sendline("contract.returnPosition.call(eth.accounts\[0])\r")
        time.sleep(5)
        # starting ryde
        while(True):
            c.sendline("contract.checkTripStatus.call()\r")
            time.sleep(3)
            i = c.expect(["1111", "2222", "3333"])
            if i == 0:
                continue
            elif i == 1:
                break
            elif i == 2:
                print "error: three"
        c.expect('>')
        print "This Ryde has started!"

        # locking/unlocking and ending ryde
        while(True):
            c.sendline("contract.checkLockStatus.call()\r")
            time.sleep(3)
            j = c.expect(["true", "false"])
            if (j == 0) and (not isUnlocked):
                p.ChangeDutyCycle(2.5)
                isUnlocked = True
            elif (j == 1) and (isUnlocked):
                p.ChangeDutyCycle(7.5)
                isUnlocked = False
            c.expect('>')
            c.sendline("contract.checkTripStatus.call()\r")
            time.sleep(3)

            i = c.expect(["1111", "2222", "3333"])
            if i == 0:
                print "error: one"
            elif i == 1:
                continue
            elif i == 2:
                break
        print "This Ryde has ended!"
        p.ChangeDutyCycle(2.5)
        time.sleep(5)
        p.ChangeDutyCycle(7.5)
        isUnlocked = False

except KeyboardInterrupt:
    p.stop()
    GPIO.cleanup()