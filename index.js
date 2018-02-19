var http = require('http');
var fs = require('fs');
var path = require('path');

var fileName="./Results1.json";
var fileNameRec="./ResultsREC.txt";

const types={
	'.js':{contentType:'text/javascript'},
	'.css':{contentType:'text/css'},
	'.html':{contentType:'text/html'},
	'.jpg':{contentType:'image/jpg'},
	'.png':{contentType:'image/png'},
	default:{contentType:'text/html'}
};

http.createServer(function (request, response) {

const {method,url,headers} = request;

if(method==='POST'){
    let postData="";
    request.on('data',data=>{
        postData+=data;
    });
    request.on('end',()=>{
        processPost(request,response,postData);
    });
}else{
    processGet(request,response);
}

function processPost(request,response,postData){
    let data={};
    try{ 
      data = JSON.parse(postData);
      response.statusCode=201;
     
     fs.readFile(fileName, (err, result) => {
    if (err) {
      console.log(err);
    }
    let obj = JSON.parse(result); // То что нужно
    obj.push({PlayerName: data.name, Points:data.pts}); 
       var jayson = JSON.stringify(obj); 
       
    fs.writeFile(fileName, jayson+"\n",'utf8', function readFileCallback(err, data){
         if (err){
            console.log(err);
          } else {
        console.log("File Saved!");

        getTop10();
        console.log("Resorted");
      }
    });
    
  });


     } catch(e){
        response.statusCode=400;
      }
    console.log("\nPOST = ", data.name,data.pts);
    
    response.end();
}

function getTop10() {

   fs.readFile(fileName, (err, result) => {
    if (err) {
      console.log(err);
    }

    let data = JSON.parse(result);

    data = sortAndProcess(data); 
  });

}

function sortAndProcess(jsObj){
    var sortPoints = [];
    var sortNames=[];
    for(var i=0;i<jsObj.length ;i++)
    {
        sortPoints.push(parseInt(jsObj[i].Points));
        sortNames.push(jsObj[i].PlayerName);
    }
    for(var i=0;i<sortPoints.length;i++)
    {
        for(var j=0;j<sortPoints.length-1;j++)
        {
          if(sortPoints[j]<sortPoints[j+1]){

            var temp=sortPoints[j];
            sortPoints[j]=sortPoints[j+1];
            sortPoints[j+1]=temp;

            temp=sortNames[j];
            sortNames[j]=sortNames[j+1];
            sortNames[j+1]=temp;
          }
        }
    }
    var recList;;
    var size=10;
    if(size>sortPoints.length) {
        size=sortPoints.length;
    }
    for(var i=0;i<10 ;i++)
    {
           recList+=sortNames[i]+": "+sortPoints[i]+"<br>\n";
    }
    recList=recList.substring(9);
    console.log(recList);
     fs.writeFile(fileNameRec, recList,'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                console.log("File Saved!");
            }
        }); 

}

function processGet(request,response){
console.log(request.url+"\n");


var filePath = '.' + request.url;

if (filePath == './'||filePath == './public/RemoveBlocks/index.html?')
    filePath = './public/RemoveBlocks/index.html';

if(filePath=='./public/RemoveBlocks/About.html?')
    filePath = './public/RemoveBlocks/About.html';

let fileExt = path.extname(request.url);
let url = request.url;

 if(url==fileNameRec.substring(1)){
    getTop10();
} 

let responseParams=types[fileExt]||types.default;

response.setHeader("Content-Type",responseParams.contentType);

fs.readFile(filePath, function(error, content) {
    if (error) {
        if(error.code == 'ENOENT'){
           response.writeHead(400);
            response.end('<h1>ERROR 404</h1>\n <p>Page Not Found</p>\n');
            response.end();
        }
        else {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error\n');
            response.end(); 
        }
    }
    else {
        response.writeHead(200, { 'Content-Type': responseParams.contentType });
        response.end(content, 'utf-8');
    }
});

}
}).listen(8080);