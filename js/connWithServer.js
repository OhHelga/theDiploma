/**
 * Created by MorgensternUser on 05.04.2016.
 */
//Defining an Angular module
var diplomaApp = angular.module('diplomaApp', ['ngRoute']);

//CONFIGURATION to resolve urls, templates and controllers
diplomaApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/courses/:courses', {
            templateUrl: function(params) {
                if (params.courses == "all")
                    return '_partialViews/allCategories.html'
                else
                    return '_partialViews/filterCourses.html'
            },
            controller: 'CoursesCtrl'
        }).
        when('/course/:courseId', {
            templateUrl: '_partialViews/courseInfo.html',
            controller: 'CourseInfoCtrl'
        }).
        when('/search', {
            templateUrl: '_partialViews/advancedSearch.html',
            controller: 'SearchCtrl'
        }).
        when('/user/:userId/:action', {
            templateUrl: function (params) {
                if (params.action == "show")
                    return '_partialViews/UserInfo.html'
                else
                    return '_partialViews/UserInfoChange.html'
            },
            controller: 'UserCtrl'
        }).
        otherwise({
            redirectTo: '/courses/all'
        });
    }
]);

//SERVICE to pass data between controllers
diplomaApp.service('dataService', function() {
    var userId = 0;
    var filter = {};

    var addUserId = function(id) {
        userId = id;
    };

    var getUserId = function(){
        return userId;
    };

    var addFilter = function(f) {
        filter = f;
    }

    var getFilter = function() {
        return filter;
    }

    return {
        addUserId: addUserId,
        getUserId: getUserId,

        addFilter: addFilter,
        getFilter: getFilter
    };
});

//CONTROLLERS for each part of the portal

//menu and authorization controller
diplomaApp.controller('MainCtrl', ['$scope', '$http', '$location', 'dataService',
    function ($scope, $http, $location, dataService) {

    $scope.show_user_data = function(userId) {
        if (userId != undefined) {
            changeMenu(document.getElementById('0'));
            $location.url("/user/:" + userId + "/show");
        }
    }

    $scope.show_all_categories = function() {
        changeMenu(document.getElementById('1'));
        $location.url("/courses#main");
    }

    $scope.go_to_filtering = function() {
        changeMenu(document.getElementById('2'));
        $location.url("/search#main");
    }

    $scope.authorize = function (user) {
        var remember = document.getElementById("remember-me").checked;
        if (user.login != undefined && user.pass != undefined)
            $http({
                method: 'GET',
                //url: '/api/user',
                params: { email: user.login, password: user.pass, remember: remember },
                headers: { 'Content-Type': 'application/JSON' }
            }).
                success(function (data) {
                    console.log(data);
                    $scope.User.Id = data;
                    //push id to service
                    dataService.addUserId($scope.User.Id);
                    //change trigger for front-end js
                    isAuthorised = true;
                })
                .error(function (error) {
                    console.log(error);
                });
    }

    $scope.register = function (user) {
        if (user.pass != undefined && user.email != undefined)
            $http({
                method: 'POST',
                url: '/api/users/register',
                params: { first_name: user.first_name, second_name: user.second_name, last_name: user.last_name,
                    email: user.email, password: user.pass  },
                headers: { 'Content-Type': 'application/JSON' }
            }).
                success(function (data) {
                    console.log(data);
                    changeMenu(document.getElementById('1'));
                    $location.url("/courses#main");
                })
                .error(function (error) {
                    //Showing error message
                    console.log(error);
                });
    }

}]);

//user data controller
diplomaApp.controller('UserCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams',
    function ($scope, $http, $location, dataService, $routeParams) {
        //profile user
        $scope.user = {};
        $scope.user.Id = $routeParams.userId;

        //this user
        $scope.User = {};
        $scope.User.Id = dataService.getUserId();
//    $scope.userTemplate = "_partialViews/userInfo.html";

        $scope.show_user_data = function (userId) {
            $http({
                method: 'GET',
                //url: '/api/user',
                params: {id: userId},
                headers: {'Content-Type': 'application/JSON'}
            })
                .success(function (data) {
                    console.log(data);
                    $scope.user = data;
                })
                .error(function (error) {
                    console.log(error);
                });
        }

        $scope.change_user_data = function (userId) {
            $http({
                method: 'GET',
                //url: '/api/user',
                params: {id: userId},
                headers: {'Content-Type': 'application/JSON'}
            })
                .success(function (data) {
                    console.log(data);
                    $scope.user = data;
                })
                .error(function (error) {
                    console.log(error);
                });
        }

        $scope.save_user_data = function (user) {
            $scope.data = "null";
            //get new avatar
            var f = document.getElementById('file').files[0],
                r = new FileReader();
            r.onloadend = function (e) {
                //$scope.data = e.target.result;
                user.Avatar = r.result;
                //??????????save data here
            }
            r.readAsBinaryString(f);

            //??????????save data here
            $http({
                method: 'POST',
                //url: '/api/user',
                data: JSON.stringify(user),
                headers: {'Content-Type': 'application/JSON'}
            })
                .success(function (data) {
                    console.log(data);

                    changeMenu(document.getElementById('0'));
                    $location.url("/user/:" + $scope.user.Id + "/show");
                })
                .error(function (error) {
                    console.log(error);
                });
        }

        $scope.logout = function () {
            $http({
                method: 'POST',
                //url: '/api/user',
                headers: {'Content-Type': 'application/JSON'}
            }).success(function () {
                    dataService.addUserId(0);
                    changeMenu(document.getElementById('1'));
                    $location.url("/courses#main");
                })
                .error(function (error) {
                    console.log(error);
                });
        }

        if (JSON.stringify($routeParams) !== '{}')
            $routeParams.action == "show" ? $scope.show_user_data($scope.user.Id) : $scope.change_user_data($scope.user.Id);
    }]);

//courses controller
diplomaApp.controller('CoursesCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams', function ($scope, $http, $location, dataService, $routeParams) {
    //this user
    $scope.User = {};
    $scope.User.Id = dataService.getUserId();
    $scope.courses = {};
    var markers = [];
    $scope.show_all_categories = function () {
        $scope.categories = [
            {
                Name: 'One',
                Id: 1,
                group: 'applicants',
                subcategories: [
                    {
                        Name: 'OneOne',
                        Id: 11
                    },
                    {
                        Name: 'OneTwo',
                        Id: 12
                    }
                ]
            },
            {
                Name: 'Two',
                Id: 2,
                group: 'students',
                subcategories: [
                    {
                        Name: 'TwoOne',
                        Id: 21
                    },
                    {
                        Name: 'TwoTwo',
                        Id: 22
                    }
                ]
            }
        ]
 /*
        $http({
            method: 'GET',
            //url: '/api/user',
            headers: {'Content-Type': 'application/JSON'}
        })
            .success(function (data) {
                console.log(data);
                $scope.courses = data;
            })
            .error(function (error) {
                console.log(error);
            });
*/
    }

    $scope.show_filtered_courses = function(categoryIdsArr, subcategoryIdsArr, teacherIdsArr) {
        var categoryIds = typeof categoryIdsArr !== 'undefined' ? categoryIdsArr : [];
        var subcategoryIds = typeof subcategoryIdsArr !== 'undefined' ? subcategoryIdsArr : [];
        var teacherIds = typeof teacherIdsArr !== 'undefined' ? teacherIdsArr : [];
        var filter = {
            categoryIds: categoryIds.concat(subcategoryIds),
            teacherIds: teacherIds
        };
        dataService.addFilter(filter);
        changeMenu(document.getElementById('1'));
        $location.url("/courses/filtered#main");
    }

    $scope.show_filtered_courses_data = function() {
        var filter = dataService.getFilter();
        //initialize the map
        initialize();

        $http({
            method: 'GET',
            //url: '/api/user',
            params: { categories: filter.categoryIds, teachers: filter.teacherIds },
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);

                var coords = [];
                for (var i = 0; i < coords.length; i++) {
                    var content = "";
                    for (var j = 0; j < courses.length; j++) {
                        if (courses[j].coordId == coords[i].Id)
                            content += "<div class='row' data-ng-click='show_course_data(" + courses[j].Id + ")'> " + courses[j].Name + "</div>";
                    }
                    markers[i].marker = addMarker(coords.lat, coords.lng, content);
                }
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.bounce_marker = function (index) {
        for (var i = 0; i < markers.length; i++)
            if (markers[i].Id === index) {
                toggleBounce(markers[i].marker);
                break;
            }
    }

    $scope.show_course_data = function(courseId) {
        changeMenu(document.getElementById('1'));
        $location.url("/course/" + courseId);
    }

    $scope.go_to_filtering = function() {
        changeMenu(document.getElementById('2'));
        $location.url("/search#main");
    }

    $routeParams.courses == "all" ? $scope.show_all_categories() : $scope.show_filtered_courses_data();
}]);

//advanced search controller
diplomaApp.controller('SearchCtrl', ['$scope', '$location', 'dataService', function ($scope, $location, dataService) {
    $scope.filter = dataService.getFilter();

    $scope.filter_courses = function() {
        dataService.addFilter($scope.filter);
        $location.url("/courses/filtered#main");
    }

}]);

//course info controller
diplomaApp.controller('CourseInfoCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams',
    function ($scope, $http, $location, dataService, $routeParams) {

    $scope.course = {};

    $scope.show_course_data = function (courseId) {
        //initialize the map
        initialize();
        addMarker(50.448029, 30.451108, "Course name");
/*        $http({
            method: 'GET',
            //url: '/api/user',
            params: { id: courseId },
            headers: {'Content-Type': 'application/JSON'}
        })
            .success(function (data) {
                console.log(data);
                $scope.course = data;
            })
            .error(function (error) {
                console.log(error);
            });
 */
    }

    $scope.show_course_data($routeParams.courseId);

    $scope.go_to_main = function() {
        changeMenu(document.getElementById('1'));
        $location.url("/courses#main");
    }

    $scope.enter_course = function() {
        $http({
            method: 'GET',
            //url: '/api/user',
            params: { userId: dataService.getUserId(), courseId: $scope.course.Id },
            headers: { 'Content-Type': 'application/JSON' }
        }).
            success(function (data) {
                console.log(data);
                changeMenu(document.getElementById('0'));
                $location.url("/user/:" + userId + "/show");
            })
            .error(function (error) {
                console.log(error);
            });
    }
}]);