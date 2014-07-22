'use strict';

/**
 * @ngdoc overview
 * @name skeletomePubmedAnnotatorApp
 * @description
 * # skeletomePubmedAnnotatorApp
 *
 * Main module of the application.
 */
angular.module('skeletomePubmedAnnotatorApp', [
    'ui.router', 'restangular', 'ui.select2', 'angular-loading-bar',
    'truncate'
])
    .run(function ($rootScope, $state, $stateParams, searchbar, $timeout, $http) { // instance-injector
        // This is an example of a run block.
        // You can have as many of these as you want.
        // You can only inject instances (not Providers)
        // into run blocks


        $rootScope.doSearch = function (terms) {
            if (terms && terms.length) {

                var publication = _.findWhere(terms, {
                    type: 'pubmed'
                });

                if (publication) {
                    $state.go('pubmed', {
                        pubmedId: publication.id
                    });
                    return;
                }

                // var hpoIds = [];
                // var meshIds = [];
                // angular.forEach(terms, function (term) {
                //     if (term.type === 'hpo') {
                //         hpoIds.push(term.id);
                //     }
                //     if (term.type === 'mesh') {
                //         meshIds.push(term.id);
                //     }
                // });
                $state.go('results', {
                    terms: angular.toJson(terms)
                    // hpo: hpoIds.join(','),
                    // mesh: meshIds.join(',')
                });
            }
        };



        $rootScope.$on('$stateChangeStart',
            function (event, toState) {
                console.log('toState', toState);
                if (toState.name !== 'results') {
                    searchbar.terms.length = 0;
                } else {
                    console.log('focus!');
                    $timeout(function () {
                        console.log('focus bnow!!');
                        $('#global-search').select2('focus', true);
                    });
                }
                // event.preventDefault();
                // transitionTo() promise will be rejected with 
                // a 'transition prevented' error
            });


        $rootScope.searchSelect = {
            placeholder: 'Search for HPO, Mesh, Title, Author',
            dropdownAutoWidth: true,
            width: 'element',
            multiple: true,
            minimumInputLength: 2,
            query: function (options) {
                console.log('options', options);

                $http.get('http://118.138.241.167:8080/phenopub/autocomplete?start=' + options.term).success(function (data) {
                    var meshes = _.map(data.MESH, function (mesh) {
                        mesh.type = 'mesh';
                        mesh.text = mesh.label + ' (MeSH)';
                        return mesh;
                    });
                    var hpos = _.map(data.HPO, function (hpo) {
                        hpo.type = 'hpo';
                        hpo.text = hpo.label + ' (HPO)';
                        return hpo;
                    });
                    var pubmeds = _.map(data.PUBMED, function (pubmed) {
                        pubmed.type = 'pubmed';
                        pubmed.text = pubmed.label + ' (Publication)';
                        return pubmed;
                    });

                    var results = meshes.concat(hpos).concat(pubmeds);
                    // console.log('meshes', results);
                    options.callback({
                        results: _.sortBy(results, function (result) {
                            return result.text.length;
                        })
                    });
                });
            }
        };

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.searchbar = searchbar;

    })
    .config(function ($stateProvider, $urlRouterProvider) {
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise('/');
        //
        // Now set up the states
        $stateProvider
            .state('search', {
                url: '/',
                controller: 'SearchCtrl',
                templateUrl: 'views/search.html'
            })
            .state('results', {
                url: '/results?terms',
                controller: 'ResultsCtrl',
                templateUrl: 'views/results.html'
            })
            .state('term', {
                url: '/term/:termId/:termType/:termName',
                controller: 'TermCtrl',
                templateUrl: 'views/term.html'
            })
            .state('pubmed', {
                url: '/pubmed/:pubmedId',
                controller: 'PubmedCtrl',
                templateUrl: 'views/pubmed.html'
            });
    });