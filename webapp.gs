function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  var docId = null;
  if (e.parameter.doc) {
    var docUrlParts = e.parameter.doc.split('/');
    docId = docUrlParts[docUrlParts.length - 2];    
  }
  
  var approver = Session.getActiveUser().getEmail();
  
  var approvables = [];
  for (var i = 2; i <= sheet.getLastRow(); i++) {
    var approvers = parseApprovers(sheet.getRange(i,APPROVERS_COL_INDEX + 1).getValue());
    if (approvers.indexOf(approver) == -1) {
      continue;
    }
    
    var approvals = parseApprovers(sheet.getRange(i,APPROVALS_COL_INDEX + 1).getValue());
    if (docId && sheet.getRange(i,URL_COL_INDEX + 1).getValue().indexOf(docId) != -1) {
      if (approvals.indexOf(approver) == -1) {
        approvals.push(approver);
        sheet.getRange(i, APPROVALS_COL_INDEX + 1).setValue(approvals.join(','));      
      }
    }
    
    var url = sheet.getRange(i, URL_COL_INDEX + 1).getValue();
    approvables.push({
      title: sheet.getRange(i, TITLE_COL_INDEX + 1).getValue(),
      url: url,
      approved: approvals.indexOf(approver) != -1,
      approvalUrl: ScriptApp.getService().getUrl() + '?doc=' + encodeURIComponent(url)      
    });    
  }
  
  var template = HtmlService.createTemplateFromFile('page');
  template.approvables = approvables;
  return template.evaluate();  
}

function parseApprovers(str) {
  return str.split(',').filter(function(a) {return !!a;});
}
