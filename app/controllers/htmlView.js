var args = arguments[0] || {};

var url = 'html/' + args + '.html';
console.log("ATTEMPTING TO READ", url);
var url_file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, url);
var htmlContent = url_file.read().text;

console.log("FOUND HTML CONTENT", url, htmlContent);

$.webView.html = htmlContent;
