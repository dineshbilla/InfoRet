
function displayresults(inputtext){
document.getElementById("searchresults").innerHTML = "";
// document.getElementById("numresults").innerHTML = "";
var url = "http://localhost:8983/solr/solrpedia/select?q="+inputtext+"&wt=json&json.wrf=callback&fl=title+text&rows=100&indent=true";
var queryresults;
$.ajax({
    type:'GET',
    url: url,
    dataType: 'JSONP',
    jsonpCallback: 'callback',
    crossDomain: true
    }).done(function(data){
        queryresults = data;
        document.getElementById("numresults").innerHTML = "Number of documents found: " + queryresults.response.numFound;
        var rblock = document.getElementById("searchresults");
        rblock.appendChild(document.createElement("br"));
        $.each(queryresults.response.docs,function(key,value){
            //console.log(value["title"]);
            var searchresult = document.createElement('p');
            var titlelink = document.createElement('a');
            titlelink.style.fontSize = "x-large";
            titlelink.textContent = value["title"];
            titlelink.href = "https:en.wikipedia.org/w/index.php?search="+value["title"]+"&title=Special:Search";
            var summary = document.createElement('p');
            // summary.style.fontWeight = "600";
            if(value["text"].length > 300){
                summary.innerHTML = value["text"].substr(0,300);
            } else {
                summary.innerHTML = value["text"];
            }
            
            searchresult.appendChild(titlelink);
            searchresult.appendChild(document.createElement("br"));
            searchresult.appendChild(summary);
            searchresult.appendChild(document.createElement("br"));
            
            rblock.appendChild(searchresult);
            // document.getElementById("searchresults").innerHTML += value["title"];
            // document.getElementById("searchresults").appendChild(document.createElement("br"));

});

        });

}

