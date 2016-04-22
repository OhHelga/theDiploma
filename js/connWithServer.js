/**
 * Created by MorgensternUser on 05.04.2016.
 */
//Defining an Angular module
var diplomaApp = angular.module('diplomaApp', ['ngRoute', 'integralui']);

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
        when('/course/:courseId/:action', {
            templateUrl: function(params) {
                if (params.courses == "show")
                    return '_partialViews/courseInfo.html'
                else
                    return '_partialViews/courseInfoChange.html'
            },
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

//DIRECTIVE for password confirmation
diplomaApp.directive('pwCheck', [function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        var v = elem.val()===$(firstPassword).val();
                        ctrl.$setValidity('pwmatch', v);
                    });
                });
            }
        }
    }]);

//CONTROLLERS for each part of the portal

//menu controller
diplomaApp.controller('MainCtrl', ['$scope', '$http', '$location', 'dataService',
    function ($scope, $http, $location) {

    $scope.show_user_data = function(userId) {
        //if (userId != undefined) {
            $location.url("/user/:" + userId + "/show");
        //}
    }

    $scope.show_all_categories = function() {
        $location.url("/courses#main");
    }

    $scope.go_to_filtering = function() {
        $location.url("/search#main");
    }
}]);

//user data controller
diplomaApp.controller('UserCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams',
    function ($scope, $http, $location, dataService, $routeParams) {
        //profile user
        $scope.user = {};
        $scope.user.id = $routeParams.userId;

        //this user
        $scope.User = {};
        $scope.User.id = dataService.getUserId();

        $scope.authorize = function (user) {
            var remember = document.getElementById("remember-me").checked;
            //if (user.email != undefined && user.pass != undefined)
                $http({
                    method: 'GET',
                    //url: '/api/user',
                    params: { email: user.email, password: user.pass, remember: remember },
                    headers: { 'Content-Type': 'application/JSON' }
                }).
                    success(function (data) {
                        console.log(data);
                        $scope.User.id = data;
                        //push id to service
                        dataService.addUserId($scope.User.id);
                        //change trigger for front-end js
                        isAuthorised = true;
                    })
                    .error(function (error) {
                        console.log(error);
                    });
        }

        $scope.register = function (user) {
            console.log(user);
            //if (user.pass != undefined && user.email != undefined)
                $http({
                    method: 'POST',
                    //url: '/api/users/register',
                    params: { first_name: user.first_name, second_name: user.second_name, last_name: user.last_name,
                        email: user.email, password: user.pass  },
                    headers: { 'Content-Type': 'application/JSON' }
                }).
                    success(function (data) {
                        console.log(data);
                        $location.url("/courses#main");
                    })
                    .error(function (error) {
                        //Showing error message
                        console.log(error);
                    });
        }

        $scope.get_user_data = function (userId) {
            changeMenu(document.getElementById('0'));
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
        /*
        $scope.change_user_data = function (userId) {
            changeMenu(document.getElementById('0'));
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
*/
        $scope.save_user_data = function (user) {
            $scope.data = "null";
            //get new avatar
            var f = document.getElementById('file').files[0],
                r = new FileReader();
            //???
            //user.avatar = f;
            //or binary data?
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

                    $location.url("/user/:" + $scope.user.id + "/show");
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
                    $location.url("/courses#main");
                })
                .error(function (error) {
                    console.log(error);
                });
        }

        if (JSON.stringify($routeParams) !== '{}')
            $scope.get_user_data($scope.user.id);
            //$routeParams.action == "show" ? $scope.show_user_data($scope.user.id) : $scope.change_user_data($scope.user.id);
    }]);

//courses controller
diplomaApp.controller('CoursesCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams', function ($scope, $http, $location, dataService, $routeParams) {
    //this user
    $scope.User = {};
    $scope.User.id = dataService.getUserId();
    $scope.courses = {};
    var markers = [];
    $scope.show_all_categories = function () {
        changeMenu(document.getElementById('1'));
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
    }

    //ACHTUNG! CLEAN THIS
    $scope.show_filtered_courses = function(categoryIdsArr, subcategoryIdsArr, teacherIdsArr) {
        var categoryIds = typeof categoryIdsArr !== 'undefined' ? categoryIdsArr : [];
        var subcategoryIds = typeof subcategoryIdsArr !== 'undefined' ? subcategoryIdsArr : [];
        var teacherIds = typeof teacherIdsArr !== 'undefined' ? teacherIdsArr : [];
        var filter = {
            categoryIds: categoryIds.concat(subcategoryIds),
            teacherIds: teacherIds
        };
        dataService.addFilter(filter);
        $location.url("/courses/filtered#main");
    }

    $scope.show_filtered_courses_data = function() {
        changeMenu(document.getElementById('1'));
        var filter = dataService.getFilter();
        //initialize the map
        initialize();

        $http({
            method: 'GET',
            //url: '/api/user',
            params: { categories: filter.categoryIds, teachers: filter.teacherIds, buildings: filter.buildingIds },
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);

                var coords = [];
                for (var i = 0; i < coords.length; i++) {
                    var content = "";
                    for (var j = 0; j < courses.length; j++) {
                        if (courses[j].coordId == coords[i].id)
                            content += "<div class='row' data-ng-click='show_course_data(" + courses[j].id + ")'> " + courses[j].name + "</div>";
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
            if (markers[i].id === index) {
                toggleBounce(markers[i].marker);
                break;
            }
    }

    $scope.show_course_data = function(courseId) {
        $location.url("/course/" + courseId + "/show");
    }

    $scope.add_course = function() {
        $location.url("/course/new/add");
    }

    $scope.go_to_filtering = function() {
        $location.url("/search#main");
    }

    $routeParams.courses == "all" ? $scope.show_all_categories() : $scope.show_filtered_courses_data();
}]);

//advanced search controller
diplomaApp.controller('SearchCtrl', ['$scope', '$location', '$http', 'dataService', 'IntegralUITreeViewService', function ($scope, $location, $http, dataService, $treeService) {
    $scope.filter = dataService.getFilter();
    $scope.teachersToAdd = [], $scope.addedTeachers = [];
    $scope.buildingsToAdd = [], $scope.addedBuildings = [];
    $scope.categories = [];

    $scope.treeName = "treeCategories";
    $scope.itemIcon = "icons-medium empty-doc";
    $scope.checkStates = ['checked', 'unchecked'];
    $scope.currentState = 'checked';
    $scope.checkList = [];

    $scope.checkBoxSettings = {
        autoCheck: true,
        threeState: false
    }

    $scope.show_data_for_search = function(){
        changeMenu(document.getElementById('2'));
        $http({
            method: 'GET',
            //url: '/api/user',
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);

                for (var i = 0; i < $scope.teachersToAdd.length; i++) {
                    $scope.teachersToAdd[i].FullName = $scope.teachersToAdd[i].first_name + " " + $scope.teachersToAdd[i].second_name + " " + $scope.teachersToAdd[i].last_name;
                    for (var j = 0; j < filter.teacherIds; j++)
                        if ($scope.filter.teacherIds[j] == $scope.teachersToAdd[i].id)
                            $scope.teachersToAdd[i].isAdded = true;
                        else
                            $scope.teachersToAdd[i].isAdded = false;
                }
                for (var i = 0; i < $scope.buildingsToAdd.length; i++) {
                    for (var j = 0; j < filter.buildingIds; j++)
                        if ($scope.filter.buildingIds[j] == $scope.buildingsToAdd[i].id)
                            $scope.buildingsToAdd[i].isAdded = true;
                        else
                            $scope.buildingsToAdd[i].isAdded = false;
                }

                for (var i = 0; i < $scope.preCategories.length; i++) {
                    for (var j = 0; j < $scope.preCategories[i].subcategories.length; j++) {
                        $scope.categories[i].subcategories[j].checkState = 'unchecked';
                        $scope.categories[i].subcategories[j].text = $scope.preCategories[i].subcategories[j].name;
                    }
                    $scope.categories[i].text = $scope.preCategories[i].name;
                    $scope.categories[i].checkState = 'unchecked';
                }

                for (var i = 0; i < $scope.preCategories.length; i++) {
                    for (var j = 0; j < $scope.preCategories[i].subcategories.length; j++)
                        for (var k = 0; k < $scope.filter.categoryIds.length; k++) {
                            if ($scope.filter.categoryIds[k] == $scope.preCategories[i].subcategories[j].id)
                                $scope.categories[i].subcategories[j].checkState = 'checked';
                            else if ($scope.filter.categoryIds[k] == $scope.preCategories[i].id)
                                $scope.categories[i].checkState = 'checked';
                        }
                }
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.add_teachers = function() {
        $scope.addedTeachers = [];
        for (var i = 0; i < $scope.teachersToAdd; i++)
            if ($scope.teachersToAdd[i].isAdded)
                $scope.addedTeachers.push($scope.teachersToAdd[i]);
    }

    $scope.add_buildings = function() {
        $scope.addedBuildings = [];
        for (var i = 0; i < $scope.buildingsToAdd; i++)
            if ($scope.buildingsToAdd[i].isAdded)
                $scope.addedBuildings.push($scope.buildingsToAdd[i]);
    }

    $scope.remove_teacher = function(teacher) {
        var index = $scope.addedTeachers.indexOf(teacher);
        $scope.addedTeachers.splice(index, 1);
    }

    $scope.remove_building = function(building) {
        var index = $scope.addedBuildings.indexOf(building);
        $scope.addedBuildings.splice(index, 1);
    }

    $scope.filter_courses = function() {
        $scope.checkList = $treeService.getCheckList($scope.treeName, $scope.currentState);
        $scope.filter = {};

        for (var i = 0; i < $scope.checkList.length; i++)
            $scope.filter.categoryIds.push($scope.checkList[i].id);

        for (var i = 0; i < $scope.addedTeachers.length; i++)
            $scope.filter.teacherIds.push($scope.addedTeachers[i].id);

        for (var i = 0; i < $scope.addedBuildings.length; i++)
            $scope.filter.buildingIds.push($scope.addedBuildings[i].id);

        dataService.addFilter($scope.filter);
        $location.url("/courses/filtered#main");
    }

    $scope.clear_filtering = function() {
        $scope.teachersToAdd = [], $scope.addedTeachers = [];
        $scope.categories = [];
    }

    $scope.show_data_for_search();
}]);

//course data controller
diplomaApp.controller('CourseInfoCtrl', ['$scope', '$http', '$location', 'dataService', '$routeParams', function ($scope, $http, $location, dataService, $routeParams) {
    if ($routeParams.action != "show")
        changeMenu(document.getElementById('3'));
    $scope.course = {};

    $scope.get_course_data = function (courseId) {
        if ($routeParams.action == "show")
            changeMenu(document.getElementById('1'));
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

    $scope.go_to_main = function() {
        $location.url("/courses#main");
    }

    $scope.enter_course = function() {
        $http({
            method: 'GET',
            //url: '/api/user',
            params: { userId: dataService.getUserId(), courseId: $scope.course.id },
            headers: { 'Content-Type': 'application/JSON' }
        }).
            success(function (data) {
                console.log(data);
                $location.url("/user/:" + dataService.getUserId() + "/show");
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.change_course = function() {
        $location.url("/course/" + $scope.course.id + "/change");
    }

    $scope.save_course = function() {
        $http({
            method: 'POST',
            //url: '/api/user',
            params: { course: $scope.course },
            headers: { 'Content-Type': 'application/JSON' }
        }).
            success(function (data) {
                console.log(data);
                $location.url("/course/:" + data + "/show");
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.go_back = function() {
        if ($routeParams.action != "add")
            $location.url("/course/:" + $scope.course.id + "/show");
        else
            $location.url("/search");
    }

    if ($routeParams.action != "add")
        $scope.get_course_data($routeParams.courseId);
}]);