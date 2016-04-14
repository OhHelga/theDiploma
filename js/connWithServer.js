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
                    return '_partialViews/allCourses.html'
                else
                    return '_partialViews/mapCourses.html'
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
diplomaApp.service('userDataService', function() {
    var userId = 0;

    var addUserId = function(id) {
        userId.push(id);
    };

    var getUserId = function(){
        return userId;
    };

    return {
        addUserId: addUserId,
        getUserId: getUserId
    };
});

//CONTROLLERS for each part of the portal

//menu and authorization controller
diplomaApp.controller('MainCtrl', ['$scope', '$http', '$location', 'userDataService',
    function ($scope, $http, $location, userDataService) {
    if (document.cookie != "") {
        var cookies = document.cookie.split(';');
        user.login = cookies[0].split("=")[1];
        user.pass = cookies[1].split("=")[1];
        authorize(user);
    }

    $scope.show_user_data = function(userId) {
        if (userId != undefined)
            $location.url("/user/:" + userId + "/show");
    }

    $scope.show_all_courses = function() {
        $location.url("/courses#main");
    }

    $scope.authorize = function (user) {
        var remember = document.getElementById("remember-me").checked;
        if (user.login != undefined && user.pass != undefined)
            $http({
                method: 'GET',
                //url: '/api/user',
                params: { login: user.login, pass: user.pass },
                headers: { 'Content-Type': 'application/JSON' }
            }).
                success(function (data) {
                    if (remember) {
                        document.cookie = "login=" + user.login + ";pass=" + user.pass;
                    }
                    console.log(data);
                    $scope.User.Id = data;
                    //push id to service
                    userDataService.addUserId($scope.User.Id);
                })
                .error(function (error) {
                    console.log(error);
                });
    }

    $scope.register = function (user) {
        if (user.login != undefined && user.pass != undefined && user.email != undefined)
            $http({
                method: 'GET',
                //url: '/api/user',
                params: { login: user.login, pass: user.pass, email: user.email },
                headers: { 'Content-Type': 'application/JSON' }
            }).
                success(function (data) {
                    console.log(data);
                    $scope.User.Id = data;
                    //push id to service
                    //push id to service
                    userDataService.addUserId($scope.User.Id);
                    //go to profile page
                    $location.url("/user/:" + $scope.User.Id + "/show");
                })
                .error(function (error) {
                    //Showing error message
                    console.log(error);
                });
    }

    $scope.logout = function (userId) {
        document.cookie == "";
        userDataService.addUserId(0);
        $location.url("/courses");
    }

}]);

//user data controller
diplomaApp.controller('UserCtrl', ['$scope', '$http', '$location', 'userDataService', '$routeParams',
    function ($scope, $http, $location, userDataService, $routeParams) {
    //profile user
    $scope.user = {};
    $scope.user.Id = $routeParams.userId;

    //this user
    $scope.User = {};
    $scope.User.Id = userDataService.getUserId();
//    $scope.userTemplate = "_partialViews/userInfo.html";

    $scope.show_user_data = function (userId) {
        $http({
            method: 'GET',
            //url: '/api/user',
            params: { id: userId },
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
            params: { id: userId },
            headers: { 'Content-Type': 'application/JSON' }
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
        r.onloadend = function(e){
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
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);
                $location.url("/user/:" + $scope.user.Id + "/show");
            })
            .error(function (error) {
                console.log(error);
            });
    }

    if (JSON.stringify($routeParams) !== '{}')
        $routeParams.action == "show" ? $scope.show_user_data($scope.user.Id) : $scope.change_user_data($scope.user.Id);
}]);

//courses controller
diplomaApp.controller('CoursesCtrl', ['$scope', '$http', '$location', 'userDataService', '$routeParams', function ($scope, $http, $location, userDataService, $routeParams) {
    //this user
    $scope.User = {};
    $scope.User.Id = userDataService.getUserId();
    $scope.courses = {};
    $scope.show_all_categories = function () {
        $scope.courses = [
            {
                Name: 'One',
                Id: 1,
                group: 'applicants',
                subcourses: [
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
                subcourses: [
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

    $scope.show_filtered_courses = function(categoryIdsArr, subcategoryIdsArr, tagIdsArr, teacherIdsArr) {
        var categoryIds = typeof categoryIdsArr !== 'undefined' ? categoryIdsArr : [];
        var subcategoryIds = typeof subcategoryIdsArr !== 'undefined' ? subcategoryIdsArr : [];
        var tagIds = typeof tagIdsArr !== 'undefined' ? tagIdsArr : [];
        var teacherIds = typeof teacherIdsArr !== 'undefined' ? teacherIdsArr : [];

        $http({
            method: 'GET',
            //url: '/api/user',
            params: { categories: categoryIds, subcategories: subcategoryIds, tags: tagIds, teachers: teacherIds },
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);
                $location.url("/courses/filtered");
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.show_course_data = function(courseId) {
        $location.url("/course/" + courseId);
    }

    $routeParams.courses == "all" ? $scope.show_all_categories() : $scope.show_filtered_courses();
}]);

//advanced search controller
diplomaApp.controller('SearchCtrl', ['$scope', '$http', '$location', 'userDataService', '$routeParams', function ($scope, $http, $location, userDataService, $routeParams) {
    //this user
    $scope.User = {};
    $scope.User.Id = userDataService.getUserId();
    $scope.courses = {};

    $scope.show_filtered_courses = function(categoryIdsArr, subcategoryIdsArr, tagIdsArr, teacherIdsArr) {
        var categoryIds = typeof categoryIdsArr !== 'undefined' ? categoryIdsArr : [];
        var subcategoryIds = typeof subcategoryIdsArr !== 'undefined' ? subcategoryIdsArr : [];
        var tagIds = typeof tagIdsArr !== 'undefined' ? tagIdsArr : [];
        var teacherIds = typeof teacherIdsArr !== 'undefined' ? teacherIdsArr : [];

        $http({
            method: 'GET',
            //url: '/api/user',
            params: { categories: categoryIds, subcategories: subcategoryIds, tags: tagIds, teachers: teacherIds },
            headers: { 'Content-Type': 'application/JSON' }
        })
            .success(function (data) {
                console.log(data);
                $location.url("/courses/filtered");
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $routeParams.courses == "all" ? $scope.show_all_courses() : $scope.show_filtered_courses();
}]);

//course info controller
diplomaApp.controller('CourseInfoCtrl', ['$scope', '$http', '$location', 'userDataService', '$routeParams',
    function ($scope, $http, $location, userDataService, $routeParams) {

    $scope.course = {};

    $scope.show_course_data = function (courseId) {
        $http({
            method: 'GET',
            //url: '/api/user',
            params: {id: courseId},
            headers: {'Content-Type': 'application/JSON'}
        })
            .success(function (data) {
                console.log(data);
                $scope.course = data;
            })
            .error(function (error) {
                console.log(error);
            });
    }

    $scope.show_course_data($routeParams.courseId);

    $scope.go_to_main = function() {
        $location.url("/courses#main");
    }

        //функция добавления маркера
        function addMarker(location) {

            var shadow = new google.maps.MarkerImage('/Images/roles.png',
                new google.maps.Size(37, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 32)); // Теневое изображение

            var image = new google.maps.MarkerImage('/Images/smilies.png',
                new google.maps.Size(20, 32),
                new google.maps.Point(0, 0),
                new google.maps.Point(0, 32)); //изображение маркера

            marker = new google.maps.Marker({
                position: location,
                map: map,
                shadow: shadow,
                icon: image,
                title: "My title!)",
                zIndex: 999
            });//добавление маркера
        }


}]);