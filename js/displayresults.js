
var queryresults;

function buildquery(inputtext, btitle, bcontent, bcategory) {
    var url = "http://localhost:8983/solr/solrpedia/select?q=" + inputtext;
    if (btitle || bcategory || bcontent) {
        url += "&defType=dismax&qf=";
        var plus = false;
        if (btitle) {
            url += "title^" + btitle;
            plus = true;
        }
        // this is mandatory field
        if (bcontent) {
            if (plus == true) url += "+";
            else plus = true;
            url += "text^" + bcontent;
        }
        else {
            if (plus == true) url += "+";
            else plus = true;
            url += "text^1";
        }
        if (bcategory) {
            if (plus == true) url += "+";
            url += "cat^" + bcategory;
        }
    }
    url += "&fl=title+text+cat&rows=100&wt=json&json.wrf=callback&indent=true&facet=true&facet.field=cat";
    return url;
}

function filterQuery(category) {
    document.getElementById("searchresults").innerHTML = "";
    var rblock = document.getElementById("searchresults");
    var docArray = queryresults.response.docs;
    var ndocs = 0;
    $.each(docArray, function (key, value) {
        if (category && $.inArray(category, value.cat) == -1) return true;
        ndocs++;
        var searchresult = document.createElement('p');
        var titlelink = document.createElement('a');
        titlelink.style.fontSize = "x-large";
        titlelink.textContent = value["title"];
        titlelink.href = "https:en.wikipedia.org/w/index.php?search=" + value["title"] + "&title=Special:Search";
        var summary = document.createElement('p');
        // summary.style.fontWeight = "600";
        if (value["text"].length > 300) {
            summary.innerHTML = value["text"].substr(0, 300);
        } else {
            summary.innerHTML = value["text"];
        }

        searchresult.appendChild(titlelink);
        searchresult.appendChild(summary);

        rblock.appendChild(searchresult);

    });
    document.getElementById("numresults").innerHTML = "Number of documents found: " + ndocs;

}

function displayresults(inputtext, btitle, bcontent, bcategory) {
    document.getElementById("searchresults").innerHTML = "";
    document.getElementById("facets").innerHTML = "";
    // document.getElementById("numresults").innerHTML = "";
    
    var url = buildquery(inputtext, btitle, bcontent, bcategory);

    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'JSONP',
        jsonpCallback: 'callback',
        crossDomain: true
    }).done(function (data) {
        queryresults = data;
        document.getElementById("numresults").innerHTML = "Number of documents found: " + queryresults.response.numFound;

        var rblock = document.getElementById("searchresults");
        rblock.appendChild(document.createElement("br"));
        
        // display the results --> title and text summary
        $.each(queryresults.response.docs, function (key, value) {
            //console.log(value["title"]);
            var searchresult = document.createElement('p');
            var titlelink = document.createElement('a');
            titlelink.style.fontSize = "x-large";
            titlelink.textContent = value["title"];
            titlelink.href = "https:en.wikipedia.org/w/index.php?search=" + value["title"] + "&title=Special:Search";
            var summary = document.createElement('p');
            // summary.style.fontWeight = "600";
            if (value["text"].length > 300) {
                summary.innerHTML = value["text"].substr(0, 300);
            } else {
                summary.innerHTML = value["text"];
            }

            searchresult.appendChild(titlelink);
            // searchresult.appendChild(document.createElement("br"));
            searchresult.appendChild(summary);
            // searchresult.appendChild(document.createElement("br"));

            rblock.appendChild(searchresult);
            // document.getElementById("searchresults").innerHTML += value["title"];
            // document.getElementById("searchresults").appendChild(document.createElement("br"));

        });
        
        //display the facets
        var index = 0;
        var facetArray = queryresults.facet_counts.facet_fields.cat;
        var facetblock = document.getElementById("facets");

        var headingtext = document.createElement("p");
        headingtext.innerHTML = "Top Categories";
        headingtext.style.fontStyle = "bold";

        facetblock.appendChild(headingtext);

        while (index < facetArray.length && index < 20) {

            var link = document.createElement('a');
            link.className = "link"
            link.textContent = facetArray[index] + " (" + facetArray[index + 1] + ") ";
            link.id = facetArray[index];
            // link.href = "link";
            link.addEventListener("click", function () {
                filterQuery(this.id);
            }, true);

            facetblock.appendChild(link);
            facetblock.appendChild(document.createElement("br"));

            index += 2;
        }
        facetblock.appendChild(document.createElement("br"));
        var link = document.createElement('a');
        link.textContent = "Clear Selection";
        link.addEventListener("click", function () {
            filterQuery("");
        }, true);
        facetblock.appendChild(link);
        facetblock.appendChild(document.createElement("br"));
    });

}

