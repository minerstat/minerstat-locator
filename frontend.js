const {
    shell
} = require('electron');
const remote = require('electron').remote,
    electron = require('electron'),
    save = require('save-file'),
    app = remote.app;
var fs = require('fs'),
    fullpath = app.getPath("appData");

/*
	MAIN FRAME BUTTONS
*/
document.getElementsByClassName("minimize")[0].addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.minimize();
});
document.getElementsByClassName("close")[0].addEventListener("click", function(e) {
    var window = remote.getCurrentWindow();
    window.close();
});

(function(console){

    console.save = function(data, filename){

        if(!data) {
            console.error('LOCATOR => No data')
            return;
        }

        if(!filename) filename = 'locator_export.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

$(function() {
    var allFound = false;
    $('#start').on('click', function() {
        $('#step1').hide();
        $('#step2').show();
        
        $('#block8').val(IP_PART1); 
        $('#block16').val(IP_PART2); 
        $('#block24').val(IP_PART3); 
        
    });

    $('#continue').on('click', function() {
        $('#step2').hide();
        $('#step3').show();
		
		IP_PART1 = $('#block8').val();
		IP_PART2 = $('#block16').val();
		IP_PART3 = $('#block24').val();
		// Find all device
		WAITING_LIST(IP_PART1 + "." + IP_PART2 + "." + IP_PART3 + ".X".replace(/X/gi, "0") + "/19");
		setTimeout(discovery, 1 * 1000);
		
    });

    $('#export').on('click', function() { 
    // Download JSON export	
    	if (Export > 0) {
			console.save(ExportArr);
		} else {
			Export = 0;
			ipArr = [];
    		ExportArr = [];
			$('#step1').hide();
			$('#step3').hide();
			$('#step4').hide();
        	$('#step2').show();
		}
    });
    $('#scanAgain').on('click', function() {
    	Export = 0;
    	ipArr = [];
    	ExportArr = [];
    	$('#step1').hide();
		$('#step3').hide();
		$('#step4').hide();
        $('#step2').show();
    });
});