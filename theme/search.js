"use strict";

// parse query

let params = (new URL(document.location)).searchParams;
let first_query = params.get('q');
console.log('first_query:', first_query);

if(first_query !== null && first_query !== '') {
    let searchbox = document.getElementById('searchbox');
    searchbox.value = first_query;
}

var persistence = {
    'index': null,
    'search_library': null,
};

// get siteurl and raw_url

function get_siteurl() {
    var path = window.location.pathname;
    var new_path = path.substr(0, path.lastIndexOf('/'));
    return [window.location.protocol, '//', window.location.host, new_path].join('');
}

if(typeof siteurl === 'undefined') {
    var siteurl = null;
}
if(siteurl === null) {
    var siteurl = get_siteurl();
}
console.log('siteurl:', siteurl);
var raw_url = siteurl + '/searchinfo/raw.json'

// generic

function apply_to_json(url, hook, fail_hook) {
    console.log('apply_to_json');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4) {
            if(this.status >= 200 && this.status <= 299) {
                console.log('received request for ' + url);
                var json = JSON.parse(this.responseText);
                hook(json);
            }
            else {
                console.warn('status code:', this.status);
                fail_hook(this.status);
            }
        }
    };
    xhttp.open('GET', url, true);
    xhttp.send();
}

// engine-specific

var get_index_url = {}
var create_index = {}
var search_index = {}

get_index_url['local'] = function() {return raw_url;}
create_index['local'] = function (json) {return json;}

search_index['local'] = function (index, query) {
    var docs = index['corpus'];
    var fields = index['fields'];
    var docs2 = [];
    for(var i=0; i<docs.length; ++i) {
        for(var j=0; j<fields.length; ++j) {
            var doc = docs[i];
            var s = doc[fields[j]];
            if(s !== undefined && s !== null && s.toLowerCase().includes(query.toLowerCase())) {
                docs2.push(doc);
            }
        }
    }
    return docs2;
}

get_index_url['elasticlunr'] = function () {
    return raw_url;
}

create_index['elasticlunr'] = function (json) {
    var index = elasticlunr(function() {
        var fields = json['fields'];
        for(var i=0; i<fields.length; ++i) {
            this.addField(fields[i]);
        }
        this.setRef('uci');
    });
    console.log('index created');
    var docs = json['corpus'];
    for(var i=0; i<docs.length; ++i) {
        index.addDoc(docs[i]);
    }
    return index;
}

search_index['elasticlunr'] = function (index, query) {
    var elasticlunr_results = index.search(query, {});
    console.log('elasticlunr_results:', elasticlunr_results);
    var results = []
    for(var i=0; i<elasticlunr_results.length; ++i) {
        results.push(elasticlunr_results[i]['doc']);
    }
    console.log('results:', results);
    return results;
}

var search_library = 'local';
if (typeof elasticlunr !== 'undefined' && elasticlunr !== null) {
    search_library = 'elasticlunr';
    console.log('found ' + search_library);
}

if (search_library === 'local') {
    console.warn('No search library found. Falling back to naive implementation.')
}
else {
    console.log('Using ' + search_library + ' for search.');
}
persistence['search_library'] = search_library;

// generic

function show_search_results(results) {
    var serp = document.getElementById('search-results');
    serp.innerHTML = '';
    if(results.length === 0) {
        var p = document.createElement('p');
        p.innerHTML = 'Your search did not match any documents.';
        serp.appendChild(p);
    }
    else {
        var ul = document.createElement('ul');
        var fields = [['title', true], ['uci', true], ['description', false]];
        for(var i=0; i<results.length; ++i) {
            var result = results[i];
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.setAttribute('href', result['url']);
            li.appendChild(a);
            for(var j=0; j<fields.length; ++j) {
                var field = fields[j][0];
                var clickable = fields[j][1];
                if(result[field] !== undefined) {
                    var div = document.createElement('div');
                    div.classList.add('search-result-' + field);
                    div.innerHTML = result[field];
                    if(clickable) {
                        a.appendChild(div);
                    }
                    else {
                        li.appendChild(div);
                    }
                }
            }
            ul.appendChild(li);
        }
        serp.appendChild(ul);
    }
}

function fail_hook(status) {
    var serp = document.getElementById('search-results');
    var p = document.createElement('p');
    p.innerHTML = 'Fetching search index failed with status code ' + status + '.';
    serp.appendChild(p);
}

function ajax_hook(json) {
    var index = create_index[search_library](json);
    persistence['index'] = index;
    if(first_query !== null && first_query !== '') {
        var results = search_index[search_library](index, first_query);
    }
    else {
        var results = [];
    }
    show_search_results(results);
}

if(first_query !== null && first_query !== '') {
    apply_to_json(get_index_url[search_library](), ajax_hook, fail_hook);
}
