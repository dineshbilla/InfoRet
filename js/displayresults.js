
var queryresults;

function buildquery(inputtext, btitle, bcontent, bcategory, morelikethisid) {

    if (morelikethisid) {
        var url = "http://localhost:8983/solr/solrpedia/select?q=%7B!mlt+qf%3Dtext+mintf%3D2+mindf%3D2%7D" + morelikethisid;
        url += "&fl=title+text+cat+id&rows=200&wt=json&json.wrf=callback&indent=true&facet=true&facet.field=cat";
        return url;
    }

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
    url += "&fl=title+text+cat+id&rows=1000&wt=json&json.wrf=callback&indent=true&facet=true&facet.field=cat";
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
        var heading = document.createElement('p');
        var titlelink = document.createElement('a');
        titlelink.style.fontSize = "x-large";
        titlelink.textContent = value["title"];
        titlelink.href = "https:en.wikipedia.org/w/index.php?search=" + value["title"] + "&title=Special:Search";

        var morelikethislink = document.createElement('a');
        morelikethislink.textContent = "more like this";
        morelikethislink.id = value["id"];
        morelikethislink.className = "mlt";
        morelikethislink.addEventListener("click", function () {
            displayresults("", "", "", "", this.id);
        }, true);

        heading.appendChild(titlelink);
        heading.appendChild(document.createElement("br"));
        heading.appendChild(morelikethislink);

        var summary = document.createElement('p');
        // summary.style.fontWeight = "600";
        if (value["text"].length > 300) {
            summary.innerHTML = value["text"].substr(0, 300);
        } else {
            summary.innerHTML = value["text"];
        }

        searchresult.appendChild(heading);
        searchresult.appendChild(summary);

        rblock.appendChild(searchresult);

    });
    document.getElementById("numresults").innerHTML = "Number of documents found: " + ndocs;

}

function displayresults(inputtext, btitle, bcontent, bcategory, morelikethisid) {
    document.getElementById("searchresults").innerHTML = "";
    document.getElementById("facets").innerHTML = "";
    document.getElementById("spellcheck").innerHTML = "";

    // document.getElementById("numresults").innerHTML = "";

    var url = buildquery(inputtext, btitle, bcontent, bcategory, morelikethisid);

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

            var heading = document.createElement('p');
            var titlelink = document.createElement('a');
            titlelink.style.fontSize = "x-large";
            titlelink.textContent = value["title"];
            titlelink.href = "https:en.wikipedia.org/w/index.php?search=" + value["title"] + "&title=Special:Search";

            var morelikethislink = document.createElement('a');
            morelikethislink.textContent = "more like this";
            morelikethislink.id = value["id"];
            morelikethislink.className = "mlt";
            morelikethislink.addEventListener("click", function () {
                displayresults("", "", "", "", this.id);
            }, true);

            heading.appendChild(titlelink);
            heading.appendChild(morelikethislink);

            var summary = document.createElement('p');
            if (value["text"].length > 300) {
                summary.innerHTML = value["text"].substr(0, 300);
            } else {
                summary.innerHTML = value["text"];
            }

            searchresult.appendChild(heading);
            searchresult.appendChild(summary);
            rblock.appendChild(searchresult);


        });

        //display the facets
        var index = 0;
        var facetArray = queryresults.facet_counts.facet_fields.cat;
        var facetblock = document.getElementById("facets");

        var headingtext = document.createElement("p");
        headingtext.innerHTML = "<b id = 'blacktext'> Top Categories \b";
        facetblock.appendChild(headingtext);

        while (index < facetArray.length && index < 20) {
            if (facetArray[index + 1] == 0) break;
            var link = document.createElement('a');
            link.className = "link"
            link.textContent = facetArray[index] + " (" + facetArray[index + 1] + ") ";
            link.id = facetArray[index];
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


        // spellcheck suggestions
        if (queryresults.spellcheck.suggestions.length > 0) {
            var suggest = document.getElementById("spellcheck");
            suggest.innerHTML = "<b id = 'blacktext'> Do you mean: \b";
            var suggestions = queryresults.spellcheck.suggestions[1].suggestion;

            for (var ix = 0; ix < suggestions.length; ix++) {
                var clink = document.createElement('a');
                clink.textContent = suggestions[ix]+" ";
                clink.id = suggestions[ix];
                clink.className = "spellcheck";
                clink.addEventListener("click", function () {
                    document.getElementById("inputtext").value = this.id;
                    displayresults(this.id, btitle, bcontent, bcategory, "");
                }, true);
                suggest.appendChild(clink);
                //suggest.innerHTML += " ";
            }
        }
    });

}

