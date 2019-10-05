/*********
GLOBAL SETTINGS & VARIBLES
***/
const rp = require('request-promise');
const cheerio = require('cheerio');

const listArr = [];
var ipArr = [],
  ExportArr = [];
Export = 0;

/*********
GLOBAL FUNCTIONS
***/
function getDateTime() {
  var date = new Date(),
    hour = date.getHours(),
    min = date.getMinutes(),
    sec = date.getSeconds();
  hour = (hour < 10 ? "0" : "") + hour;
  min = (min < 10 ? "0" : "") + min;
  sec = (sec < 10 ? "0" : "") + sec;
  return hour + ":" + min + ":" + sec;
}

function WAITING_LIST(network_range) {
  var data = {
    range: network_range
  };
  listArr.push(data);
}

function ASIC_SCANNER(network_range, last) {
  try {
    var evilscan = require('evilscan'),
      options = {
        target: network_range,
        port: '22,80',
        status: 'O',
        banner: true
      },
      scanner = new evilscan(options);
    scanner.on('result', function(data) {
      if (data.status == "open" && !data.banner.toString().includes("Ubuntu") && !ipArr.toString().includes(data.ip)) {
        ipArr.push(data.ip);
      }
    });
    scanner.on('done', function() {
      if (last != false) {
        ASIC_SCANNER(network_range, true);
      } else {
        console.log("[%s] **** SCAN RESULTS ****", getDateTime());
        console.log("[%s] %s", getDateTime(), ipArr);
        for (var i = 0, len = ipArr.length; i < len; i++) {
          ASIC_TCP(ipArr[i], ipArr.length);
        }
        // ASIC NUM == 0 on the network
        if (ipArr.length == 0) {
          // Run only GUI mod
          if (!process.argv.includes("console")) {
            $("#hideOnNull").hide();
            $("#scanAgain").hide();
            $("#numDevices").text("0 devices");
            $("#export").text("Try Again");
            setTimeout(function() { // Show new screen
              $('#step3').hide();
              $('#step4').show();
            }, 500);
          }
        }
      }
      return true;
    });
    scanner.on('error', function(err) {
      return false;
    });
    scanner.run();
  } catch (exception) {
    console.log(exception);
    return false;
  }
}

function ASIC_TCP(workerIP, asicNum) {
  var response = "",
    check = 0;
  const nets = require('net');
  var clients = nets.createConnection({
    host: workerIP,
    port: 4028
  }, () => {
    clients.write('pools');
    console.log("[%s] Fetching TCP => %s", getDateTime(), workerIP);
  });
  clients.setTimeout(10 * 1000);
  clients.on('timeout', () => {
    try {
      clients.destroy();
      clients.end(); // close connection
    } catch (exception) {}
  });
  clients.on('data', (data) => {
    check = 1;
    response += data.toString();
  });
  clients.on('error', (exception) => {});
  clients.on('close', () => {
    if (check == 0) {
      response = "timeout";
    }
    ASIC_TESTER(workerIP, response, asicNum);
  });
  clients.on('end', () => {
    try {
      clients.destroy();
      clients.end(); // close connection
    } catch (exception) {}
  });
}

function ASIC_TESTER(workerIP, response, asicNum) {

  var systemType = "";
  jobDone(workerIP, response, asicNum, "");

  /*
  if (!process.argv.includes("console")) {
    $.ajax({
      url: 'http://' + workerIP,
      type: 'GET',
      success: function(res) {
        var data = res;
        console.log(data);
        if (data.includes("AsicMiner")) {
          systemType = "innosilicon";
        }
        console.log(systemType);
        jobDone(workerIP, response, asicNum, "");
      },
      error: function(res) {
        jobDone(workerIP, response, asicNum, "");
      }
    });
  } else {

  }

  // Test for HOSTNAME
   const rpjson = {
          uri: 'http://' + workerIP,
          auth: {
              'user': 'root',
              'pass': 'root',
              'sendImmediately': false
          },
          transform: false,
          header: {
              'Accept': 'application/json'
          },
          json: true
      };


      rpjson.uri = 'http://' + workerIP + '/cgi-bin/get_system_info.cgi';
      rp(rpjson).promise().bind()
          .then(function(resp) {
              // REQUEST SUCCEEDED: DO SOMETHING
              //console.log(resp);
              var antStats = {};
              antStats.hostname = resp.hostname;
              jobDone(workerIP, response, asicNum, antStats.hostname);
          })

  */
  // test for Innosilicon
  // <title>AsicMiner</title>

  function jobDone(workerIP, response, asicNum, asicHostname) {
    Export++;
    if (response != "timeout") {
      var data = response.toString().trim();
      data = data.split("User"),
        data = data[1].split(',')[0].replace("=", "");

      if (data.toString().includes(".")) {
        // WORKER NAME DETECTED
        data = data.split('.')[1];
      } else {
        data = "";
      }
    } else {
      var data = "";
    }

    if (asicHostname.toLowerCase() != "antminer" || data == "") {
      data = asicHostname;
    }

    // GENERATING WORKERNAME IF EMPTY
    if (data == "") {
      var sub = workerIP.split('.')[2];
      var last = workerIP.split('.')[3];
      data = sub + "X" + last;
    }

    // Add to the list, this will be exported
    const workerData = {
      "worker": data,
      "type": "asic",
      "ip": workerIP
    }
    //       "system": systemType,
    ExportArr.push(workerData);

    console.log(ExportArr);

    // If match that means sync is done
    if (Export == asicNum) {
      if (!process.argv.includes("console")) {
        // Run only GUI mod
        $("#export").text("Export");
        $("#hideOnNull").show();
        $("#scanAgain").show();
        $("#numDevices").text(asicNum.toString() + " devices");
        setTimeout(function() { // Show new screen
          $('#step3').hide();
          $('#step4').show();
        }, 500);
      } else {
        // Run only on Console Mod
        console.log("*** JSON RESPONSE ***");
        console.log("");
        console.log(ExportArr);
        console.log("");
        console.log("Copy this to a .json file and you will able to import to minerstat.com");
        process.exit()
      }

    }
  }


}

/*********
DISCOVER NETWORK
***/

function discovery() {
  if (Object.keys(listArr).length > 0) {
    ASIC_SCANNER(listArr[0]["range"], false);
    listArr.splice(0, 1);
    setTimeout(discovery, 1 * 1000);
  } else {
    clearInterval(discovery);
  }
}

if (process.argv.includes("console")) {

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("");
  console.log("How to use?");
  console.log("Enter first 3 part of your local network. e.g: 192.168.0");

  rl.question('IP: ', (ipMask) => {
    console.log("");
    rl.close();

    WAITING_LIST(ipMask + ".X".replace(/X/gi, "0") + "/17");
    setTimeout(discovery, 1 * 1000);

  });
}

/*
// 10.X.X.X
// (out of memory issue || ENFILE || EMFILE)
// SAME AS 10.0.0.0/8

block = 0;
while (block <= 999) {
    WAITING_LIST("10." + block + ".0.0/16/24");
    block++;
}
*/