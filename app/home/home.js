/************************************************************ Developer: Minhas Kamal (minhaskamal024@gmail.com)       ** Website: https://github.com/MinhasKamal/DownGit          ** License: GNU General Public License version-3            ************************************************************/'use strict';var homeModule = angular.module('homeModule', [	'ngRoute',]);homeModule.config([	'$routeProvider',    	function ($routeProvider) {		$routeProvider			.when('/home', {                templateUrl: 'app/home/home.html',                controller: [				'$scope',				'$routeParams',				'$location',				'toastr',				'homeService',								function($scope, $routeParams, $location, toastr, homeService){					$scope.downUrl="";					$scope.url="";					$scope.processing={val: false};										var templateUrl = "github.com";					var downloadUrlPrefix = "https://minhaskamal.github.io/DownGit/#/home?url=";										if($routeParams.url){						$scope.url=$routeParams.url;					}										if($scope.url.match(templateUrl)){						var processingRef = $scope.processing;						homeService.downloadZippedFiles($scope.url, processingRef);					}else if($scope.url!=""){						toastr.warning("Invalid URL",{iconClass: 'toast-down'});					}										$scope.createDownLink = function(){						$scope.downUrl="";												if(!$scope.url){							return;						}												if($scope.url.match(templateUrl)){							$scope.downUrl = downloadUrlPrefix + $scope.url;						}else if($scope.url!=""){							toastr.warning("Invalid URL",{iconClass: 'toast-down'});						}					};														}],            });    }]);homeModule.factory('homeService', [	'$http',	'$q',	    function ($http, $q) {		var urlPrefix = "";		var urlPostfix = "";			var resolveUrl = function(url){			var repoPath = new URL(url).pathname;			var splitPath = repoPath.split("/", 5);						var resolvedUrl = {};			resolvedUrl.author = splitPath[1];			resolvedUrl.repository = splitPath[2];			resolvedUrl.branch = splitPath[4];			resolvedUrl.directoryPath = repoPath.split(resolvedUrl.branch+"/", 2)[1];						return resolvedUrl;		}				var downloadDir = function(resolvedUrl, processing){			processing.val=true;			var urlPrefix = "https://api.github.com/repos/"+resolvedUrl.author+                "/"+resolvedUrl.repository+"/contents/";			var urlPostfix = "?ref="+resolvedUrl.branch;						var url = urlPrefix+resolvedUrl.directoryPath+urlPostfix;			var dirPaths = [];			var files = [];			var requestedPromises = [];						//dirPaths.push(resolvedUrl.directoryPath);			$http.get(url).then(function (response){				for (var i=response.data.length-1; i>=0; i--){					if(response.data[i].type=="dir"){						dirPaths.push(response.data[i].path);					}else{						getFile(response.data[i].path, response.data[i].download_url,							files, requestedPromises);					}				}								var dirSplits = resolvedUrl.directoryPath.split("/");				var downloadFileName = dirSplits[dirSplits.length-1];				var zip = new JSZip();				$q.all(requestedPromises).then(function(data) {					for(var i=files.length-1; i>=0; i--){						zip.file(downloadFileName+"/"+files[i].path.split(downloadFileName+"/")[1],							files[i].data);					}										processing.val=false;					zip.generateAsync({type:"blob"}).then(function(content) {						saveAs(content, downloadFileName+".zip");					});				});			});			//requestedPromises.push(promise);					}				var getFile = function (path, url, files, requestedPromises) {			var promise = $http.get(url, {responseType: "arraybuffer"}).then(function (file){				files.push({path:path, data:file.data});			});			requestedPromises.push(promise);		}	    	return {			downloadZippedFiles: function(url, processing){				var resolvedUrl = resolveUrl(url);								if(!resolvedUrl.directoryPath || resolvedUrl.directoryPath==""){					var downloadUrl = "https://github.com/"+resolvedUrl.author+"/"+						resolvedUrl.repository+"/archive/"+resolvedUrl.branch+".zip";					window.location = downloadUrl;				}else {					downloadDir(resolvedUrl, processing);					}			},    	};    }]);