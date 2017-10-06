APPROVAL_FOLDER_ID = 'INSERT_FOLDER_ID';

TITLE_COL_INDEX = 0;
URL_COL_INDEX = 1;
OWNER_COL_INDEX = 2;
APPROVERS_COL_INDEX = 3;
APPROVALS_COL_INDEX = 4;

// Mock GmailApp till we are sure it works
GmailApp = {
  sendEmail: function(recipient,subject,body) {
    Logger.log('Test email to: ' + recipient + ' with subject "' + subject + '": ' + body);
  }
};

function getApproval() {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var newFiles = findNewFiles();
  for (var i = 0; i < newFiles.length; i++ ) {
    var file = newFiles[i];
    sheet.appendRow([file.getName(),file.getUrl(),file.getOwner().getEmail()]);
  }
  
  var data = sheet.getDataRange().getDisplayValues();
  for (var i = 1; i < data.length; i++) {
    processRow(data[i]);
  }
}

function findNewFiles() {
  
  var folder = DriveApp.getFolderById(APPROVAL_FOLDER_ID);
  var files = folder.getFiles();
  var scriptProperties = PropertiesService.getScriptProperties();
  
  var newFiles = [];
  
  while(files.hasNext()) {
    var file = files.next();
    var key = 'file/' + file.getUrl()
    
    if (!scriptProperties.getProperty(key)){
      scriptProperties.setProperty(key, JSON.stringify({exists: true}));
      newFiles.push(file);      
    }
  }

  if (newFiles.length > 0 ) {
    Logger.log(newFiles.length + ' new files added!');
  }
  
  return newFiles;
}

function processRow(row) {
  if (!row[OWNER_COL_INDEX]) {
    GmailApp.sendEmail(Session.getActiveUser().getEmail(),'Missing owner for ' + row[TITLE_COL_INDEX],'Please set an owner for ' + row[URL_COL_INDEX]);
    return;
  }
  
  if (!row[APPROVERS_COL_INDEX]) {
    GmailApp.sendEmail(row[OWNER_COL_INDEX],'Missing approvers for ' + row[TITLE_COL_INDEX],'Please set approvers for ' + row[TITLE_COL_INDEX]);
    return;
  }

  checkApprovals(row);
}


function checkApprovals(row) {
  var approvers = row[APPROVERS_COL_INDEX].split(',');
  var approvals = row[APPROVALS_COL_INDEX].split(',');
  
  for (var j=0; j< approvers.length; j++) {
    if (approvals.indexOf(approvers[j]) == -1) {
      GmailApp.sendEmail(approvers[j],'Please review ' + row[TITLE_COL_INDEX],'Please review and approve the following file: ' + row[URL_COL_INDEX]);      
    }
  }
}


function reset() {
  PropertiesService.getScriptProperties().deleteAllProperties();
}

