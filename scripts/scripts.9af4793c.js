"use strict";angular.module("skeletomePubmedAnnotatorApp",["ui.router","restangular","ui.select2","angular-loading-bar","truncate"]).run(["$rootScope","$state","$stateParams","searchbar","$timeout","$http",function(a,b,c,d,e,f){a.doSearch=function(a){if(a&&a.length){var c=_.findWhere(a,{type:"pubmed"});if(c)return void b.go("pubmed",{pubmedId:c.id});b.go("results",{terms:angular.toJson(a)})}},a.$on("$stateChangeStart",function(a,b){console.log("toState",b),"results"!==b.name?d.terms.length=0:(console.log("focus!"),e(function(){console.log("focus bnow!!"),$("#global-search").select2("focus",!0)}))}),a.searchSelect={placeholder:"Search for HPO, Mesh, Title, Author",dropdownAutoWidth:!0,width:"element",multiple:!0,minimumInputLength:2,query:function(a){console.log("options",a),f.get("http://118.138.241.167:8080/phenopub/autocomplete?start="+a.term).success(function(b){var c=_.map(b.MESH,function(a){return a.type="mesh",a.text=a.label+" (MESH)",a}),d=_.map(b.HPO,function(a){return a.type="hpo",a.text=a.label+" (HPO)",a}),e=_.map(b.PUBMED,function(a){return a.type="pubmed",a.text=a.label+" (Publication)",a}),f=c.concat(d).concat(e);a.callback({results:_.sortBy(f,function(a){return a.text.length})})})}},a.$state=b,a.$stateParams=c,a.searchbar=d}]).config(["$stateProvider","$urlRouterProvider",function(a,b){console.log("ho there"),b.otherwise("/"),a.state("search",{url:"/",controller:"SearchCtrl",templateUrl:"views/search.html"}).state("results",{url:"/results?terms",controller:"ResultsCtrl",templateUrl:"views/results.html"}).state("term",{url:"/term/:termId/:termType/:termName",controller:"TermCtrl",templateUrl:"views/term.html"}).state("pubmed",{url:"/pubmed/:pubmedId",controller:"PubmedCtrl",templateUrl:"views/pubmed.html"}),console.log("why dont my states work")}]),angular.module("skeletomePubmedAnnotatorApp").controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],console.log("loading controller")}]),angular.module("skeletomePubmedAnnotatorApp").controller("AnnotationCtrl",["$scope","Restangular",function(a,b){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.pubmedId=17935554,a.selectedText="",a.getPubmed=function(c){b.one("pubmed",c).get().then(function(b){a.pubmed=b;var c=b.PubmedArticle.MedlineCitation.Article.Abstract.AbstractText;a.abstract=_.reduce(c,function(a,b){return a+b},""),console.log("pubmed",b),b.all("annotations").getList({}).then(function(b){a.annotations=b})})},a.addAnnotation=function(){a.annotations.unshift(a.annotation),a.annotation={}},a.removeAnnotation=function(b){a.annotations=_.without(a.annotations,b)},a.hpoSelect={dropdownAutoWidth:!0,multiple:!1,width:"element",query:function(a){console.log("options",a),b.all("hpos").getList({name:encodeURIComponent(a.term)}).then(function(b){var c={results:[]};angular.forEach(b,function(a){a.text=a.name,c.results.push(a)}),a.callback(c)})}}}]),angular.module("skeletomePubmedAnnotatorApp").directive("annotator",["$compile",function(a){return{templateUrl:"views/annotator.html",restrict:"E",scope:{annotations:"=",text:"="},link:function(b,c){function d(){var d=c.find(".abstract");d.html(f),a(d)(b)}function e(a,b){f=a,angular.forEach(b,function(a,b){var c=new RegExp("\\b("+a.originalSpan+")\\b","gi");f=f.replace(c,'<annotation data="annotations['+b+']"></annotation>')}),d()}var f;b.isAnnotating=!1,b.$watch("text",function(){e(b.text,b.annotations)}),b.$watch("annotations",function(a,c){console.log("annotations changed",a),!c&&a&&e(b.text,b.annotations)}),b.mouseDown=function(){console.log("down"),b.isAnnotating=!0},b.mouseUp=function(){console.log("up");var a=window.getSelection().getRangeAt(0);b.annotation={startOffset:a.startOffset,endOffset:a.endOffset,originalSpan:b.text.substring(a.startOffset,a.endOffset)},b.isAnnotating=!1}}}}]),angular.module("skeletomePubmedAnnotatorApp").directive("annotation",function(){return{templateUrl:"views/dir.annotation.html",restrict:"E",scope:{data:"="},link:function(a){a.$watch("data",function(a){console.log(a)}),a.mouseEnter=function(){a.isOver=!0},a.mouseLeave=function(){a.isOver=!1}}}}),angular.module("skeletomePubmedAnnotatorApp").controller("SearchCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("skeletomePubmedAnnotatorApp").controller("ResultsCtrl",["$scope","$stateParams","$http","searchbar",function(a,b,c,d){function e(b){a.pubmedDisplayLimit=h,a.pubmeds=_.filter(a.allPubmeds,function(a){var c=!0;return _.each(b,function(b){"hpo"===b.type&&(c=c&&!!_.findWhere(a.hpo,{id:b.id})),"mesh"===b.type&&(c=c&&!!_.findWhere(a.mesh,{id:b.id}))}),c})}function f(b){console.log("searching with terms",b);var e=_.reduce(b,function(a,b){return"hpo"===b.type&&a.push(b.id),a},[]),f=_.reduce(b,function(a,b){return"mesh"===b.type&&a.push(b.id),a},[]);angular.copy(b,d.terms),c.get("http://118.138.241.167:8080/phenopub/search?hpo="+e.join(",")+"&mesh="+f.join(",")).success(function(b){a.allPubmeds=_.values(b),a.pubmedDisplayLimit=Math.min(h,a.allPubmeds.length),_.each(b,function(a){a.id=a.pmid,_.each(a.hpo,function(a,b){a.id=b,a.type="hpo",a.text=a.label+" (HPO)"}),_.each(a.mesh,function(a,b){a.id=b,a.type="mesh",a.text=a.label+" (MeSH)"}),a.hpo=_.values(a.hpo),a.mesh=_.values(a.mesh)}),a.pubmeds=a.allPubmeds})}function g(b,d){var e=b.slice(0,d),f=_.reduce(e,function(a,b){return b.abstract||a.push(b.pmid),a},[]);f.length&&c.get("http://118.138.241.167:8080/phenopub/search?pmid="+f.join(",")).success(function(b){_.each(b,function(b,c){var d=_.findWhere(a.allPubmeds,{id:c});_.extend(d,b)})})}a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.allPubmeds=null,a.filterByTerms=[];var h=10;a.pubmedDisplayLimit=h,a.loadMore=function(){a.pubmedDisplayLimit=Math.min(a.pubmedDisplayLimit+10,a.pubmeds.length),g(a.pubmeds,a.pubmedDisplayLimit)},a.toggleFilter=function(b){if(a.hpoSearch="",b.isFiltering=!b.isFiltering,b.isFiltering)a.filterByTerms.push(b);else{var c=a.filterByTerms.indexOf(b);a.filterByTerms.splice(c,1)}e(a.filterByTerms)},a.$watchCollection("searchbar.terms",function(){a.allPubmeds=null,a.pubmeds=null}),f(angular.fromJson(b.terms)),a.$watchCollection("pubmeds",function(b){b&&(g(b,a.pubmedDisplayLimit),a.hpos=_.reduce(a.pubmeds,function(b,c){return _.each(c.hpo,function(c){var d=_.findWhere(b,{id:c.id});d?d.count++:(c.count=1,b.push(c)),c.isFiltering=!!_.findWhere(a.filterByTerms,{id:c.id,type:"hpo"})}),b},[]),a.meshes=_.reduce(a.pubmeds,function(b,c){return _.each(c.mesh,function(c){var d=_.findWhere(b,{id:c.id});d?d.count++:(c.count=1,b.push(c)),c.isFiltering=!!_.findWhere(a.filterByTerms,{id:c.id,type:"mesh"})}),b},[]))})}]),angular.module("skeletomePubmedAnnotatorApp").controller("HpoCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("skeletomePubmedAnnotatorApp").controller("TermCtrl",["$scope","$http","$stateParams",function(a,b,c){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"];var d;"hpo"===c.termType&&(d=b.get("http://118.138.241.167:8080/phenopub/hpo?id="+c.termId).then(function(a){return a.data})),"mesh"===c.termType&&(d=b.get("http://118.138.241.167:8080/phenopub/mesh?id="+c.termId).then(function(a){return a.data})),d.then(function(c){_.each(c.hpo,function(a,b){a.id=b,a.ic=parseFloat(a.ic)}),_.each(c.pubs,function(a){a.id=a.pmid}),console.log("pubmeds",c.pubs),c.mesh=_.values(c.mesh),c.hpo=_.values(c.hpo),a.term=c,a.maxIc=_.reduce(c.hpo,function(a,b){return Math.max(a,b.ic)},0),c.pubs=_.values(c.pubs);var d=c.pubs.slice(0,10),e=_.reduce(d,function(a,b){return b.abstract||a.push(b.pmid),a},[]);e.length&&b.get("phenopub/search?pmid="+e.join(",")).success(function(a){_.each(a,function(a,b){var d=_.findWhere(c.pubs,{id:b});console.log("extending",d,"with",a),_.extend(d,a)})})})}]),angular.module("skeletomePubmedAnnotatorApp").controller("PubmedCtrl",["$scope","$http","$stateParams",function(a,b,c){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],b.get("http://118.138.241.167:8080/phenopub/pmid?id="+c.pubmedId).then(function(b){var c=b.data;_.each(c.hpo,function(a,b){a.id=b,a.ic=parseFloat(a.ic)}),c.hpo=_.values(c.hpo),c.mesh=_.values(c.mesh),a.pubmed=c,a.maxIc=_.reduce(c.hpo,function(a,b){return Math.max(a,b.ic)},0),a.pubmed=c})}]),angular.module("skeletomePubmedAnnotatorApp").factory("searchterms",function(){return{terms:function(){return{}}}}),angular.module("skeletomePubmedAnnotatorApp").factory("searchbar",function(){return{terms:[],hello:"world"}}),angular.module("skeletomePubmedAnnotatorApp").factory("api",function(){var a=42;return{someMethod:function(){return a}}});