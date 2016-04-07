angular.module('ZuPortal.Rob.Apps', [])

.factory('ZuReportsAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        crossTrainingProcesses: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CrossTrainingProcesses.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        crossTrainingRoster: function (selectedDepartment, shiftSelect) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CrossTrainingRoster.aspx', { params: { locationId: $localStorage.locationId, department: selectedDepartment, shift: shiftSelect } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        crossTrainingUpdate: function (wmsid, boolean, departmentData) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/Crosstraining.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                markerWmsid: $localStorage.user.id,
                associateWmsid: wmsid,
                actionValue: boolean,
                mainDepartment: departmentData[0],
                subDepartment: departmentData[1],
                subProcess: departmentData[2]
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        transferRequests: function (status) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/TransferRequests.aspx', { params: { locationId: $localStorage.locationId, status: status } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        transferRequestSingleUpdate: function (entryId, status, notes) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/updateTransferRequest.aspx', $httpParamSerializer({
                entryId: entryId,
                status: status,
                notes: notes,
                updatedBy: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        vot_vtoReport: function (department, shift, reportType, reportDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/VOT-VTOData.aspx', { params: { locationId: $localStorage.locationId, department: department, shift: shift, reportType: reportType, reportDate: reportDate } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        highFiveReview: function (status) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/HighFiveReview.aspx', { params: { locationId: $localStorage.locationId, status: status } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        highFiveUpdate: function (entryId, nomineeName, nomineeWmsId, value, status, description) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/updateHighFive.aspx', $httpParamSerializer({
                entryId: entryId,
                nomineeName: nomineeName,
                nomineeWmsId: nomineeWmsId,
                value: value,
                status: status,
                description: description,
                updatedBy: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        donationsLogReport: function (fromDate, toDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/DonationsLogReport.aspx', { params: { locationId: $localStorage.locationId, fromDate: fromDate, toDate: toDate } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        airReport: function (fromDate, toDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/AIRReport.aspx', { params: { locationId: $localStorage.locationId, fromDate: fromDate, toDate: toDate } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        airUpdate: function (entryId, updateInfo) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/updateAIR.aspx', $httpParamSerializer({
                entryId: entryId,
                followUp: updateInfo.followUp || "false",
                followUpComments: updateInfo.followUpComments || "",
                isRecordable: updateInfo.isRecordable || "false",
                remove: updateInfo.remove || "false",
                removeComments: updateInfo.removeComments || "",
                medicalOnly: updateInfo.medicalOnly || "false",
                medicalOnlyDate_start: updateInfo.medicalOnly ? updateInfo.medicalOnlyDate_start : "0001-01-01 00:00:00",
                medicalOnlyDate_end: updateInfo.medicalOnly ? updateInfo.medicalOnlyDate_end : "0001-01-01 00:00:00",
                lostTime: updateInfo.lostTime || "false",
                lostTimeDate_start: updateInfo.lostTime ? updateInfo.lostTimeDate_start : "0001-01-01 00:00:00",
                lostTimeDate_end: updateInfo.lostTime ? updateInfo.lostTimeDate_end : "0001-01-01 00:00:00",
                restricted: updateInfo.restricted || "false",
                transfer: updateInfo.transfer || "false",
                typeOfInjury: updateInfo.typeOfInjury,
                typeOfIncident: updateInfo.typeOfIncident,
                eqmntInvolved: updateInfo.eqmntInvolved || "false",
                eqmntDesc: updateInfo.eqmntInvolved ? updateInfo.eqmntDesc : "",
                drugTested: updateInfo.eqmntInvolved ? updateInfo.drugTested : "",
                updatedBy: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        PendingHRForms: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/PendingHRForms.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        UpdateFormStatus: function (info, status, reason) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/UpdateFormStatus.aspx', $httpParamSerializer({
                entryId: info.id,
                deliveryStatus: status ? 1 : 0,
                exemptStatus: status ? 0 : 1,
                exemptNotes: status ? "" : reason,
                deliveredBy: status ? $localStorage.user.id : 0,
                exemptedBy: status ? 0 : $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        insertFeedbacks: function (feedbacks) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/InsertPendingFCForms.aspx', $httpParamSerializer({
                feedbacks: feedbacks,
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        getAssocErrors: function (wmsID, Dt, Dt2, locationId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/GetICQAOverview.aspx', { params: { data: wmsID, end: Dt2, start: Dt, location: locationId, getType: 'getZPREmployeeErrorsDetail' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    };
})

.controller('FCProd', function ($scope, $rootScope, $timeout, $http, $sessionStorage, $localStorage, uiGridConstants, ModalService, blockUI, ZuPortal_CONFIG, ZuReportsAPI, $filter) {

    $scope.weekSelect = null;

    window.onbeforeunload = function () {
        return '';
    };

    $scope.correctiveActions = 0;

    $scope.exemptions = 0;

    $scope.highFives = 0;

    $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/FCProdWeeks.aspx', { params: { locationId: $localStorage.locationId } })
        .then(function (res) {
            if (angular.isArray(res.data)) {
                var start = [
                    {
                        option: 'Select Week',
                        value: null
                    }
                ];

                var weeks = _.map(_.sortBy(res.data, function (week) {
                    var date = new Date(week.week).getTime();
                    return -date;
                }), function (week) {
                    var weekEnd = new Date(week.week);
                    weekEnd.setDate(weekEnd.getDate() + 7);
                    return {
                        option: 'Week Ending: ' + $filter('date')(weekEnd, 'shortDate'),
                        value: week.week
                    };
                });

                $scope.weeks = _.union(start, weeks);
            };
        });

    $scope.gridOptions = {
        data: [],
        enableFiltering: true,
        enableRowSelection: false,
        enableSelectAll: false,
        enableGridMenu: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'FCProd.csv',
        exporterSuppressColumns: ['avg'
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            $scope.$watch('gridApi.selection.getSelectedRows()', function (n, o) {
                if (n) {
                    $scope.correctiveActions = _.filter(n, function (assoc) {
                        return (assoc.caLevel == 100 && assoc.exempt == false) || assoc.caLevel == 101;
                    }).length;
                    $scope.exemptions = _.filter(n, function (assoc) {
                        return assoc.exempt == true;
                    }).length;
                    $scope.highFives = _.filter(n, function (assoc) {
                        return assoc.caLevel == 10 && assoc.exempt == false;
                    }).length;
                };
            }, true)
        }
    };

    $scope.funcRates = {
        funcs: [],
        weeks: {
            0: {},
            1: {},
            2: {},
            3: {},
        }
    };

    $scope.getData = function () {
        var getWeek = $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/FCProdData.aspx', { params: { locationId: $localStorage.locationId, week: $scope.weekSelect } })
        .then(function (res) {
            if (angular.isArray(res.data)) {
                var data = res.data;

                $scope.gridOptions.data = [];
                var tempData = [];

                _.uniq(_.pluck(data, 'weekArray')).forEach(function (array, i) {
                    if (array.split(',').length == 4) {
                        $scope.weekStartDays = _.sortBy(array.split(','), function (date) { return date; });
                        return;
                    };
                });

                _.filter(data, function (associate) {
                    return associate.operation == 'Putaway'
                }).forEach(function (associate, i) {
                    associate.operation = 'Stow';
                });
                $scope.funcRates.funcs = _.sortBy(_.uniq(_.pluck(data, 'operation')), function (operation) { return operation; });

                data.forEach(function (associate, index) {

                    associate.progActions = [
                        {
                            label: 'Action',
                            value: null
                        },
                        {
                            label: 'Positive',
                            value: 10
                        },
                        {
                            label: 'Next Level',
                            value: 100
                        },
                        {
                            label: 'Verbal',
                            value: 101
                        }
                    ];
                    associate.typeNameCombo = associate.fullName + ' (' + associate.type.substr(0, 1).toLowerCase() + ')';

                    associate.inclInAvg = true;
                    associate.goals = {};
                    associate.mins = {};
                    associate.weeks = {};
                    associate.weekArray = associate.weekArray.split(',');
                    associate.unitsArray = associate.unitsArray.split(',');
                    associate.hoursArray = associate.hoursArray.split(',');
                    var errorsArray = associate.errorsArray;
                    if (!errorsArray) {
                        var errors = [];
                        for (var i = 0; i < associate.weekArray.length; i++) {
                            errors.push(0);
                        };
                        associate.errorsArray = errors;
                    } else {
                        associate.errorsArray = _.map(errorsArray.split(','), function (errors) {
                            return errors == '' ? 0 : +errors;
                        });
                    };
                    var UPHs = [], Hours = [];
                    associate.weekArray.forEach(function (weekDay, assocWeekIndex) {
                        var weekIndex = $scope.weekStartDays.indexOf(weekDay);
                        if (!$scope.funcRates.weeks[weekIndex][associate.operation]) {
                            $scope.funcRates.weeks[weekIndex][associate.operation] = +associate.uph_goal;
                        };

                        //Setting weekstart to that Sunday.
                        var weekStart = new Date(weekDay);
                        weekStart.setDate(weekStart.getDate() - 2);
                        weekStart = weekStart.getTime();

                        //Setting week end to Saturday.
                        var year = weekDay.substr(0, 4);
                        var month = +weekDay.substr(5, 2) - 1;
                        var day = weekDay.substr(8, 2);
                        var weekEnd = new Date(year, month, day, 23, 59, 59, 0);
                        weekEnd.setDate(weekEnd.getDate() + 4);
                        weekEnd = weekEnd.getTime();

                        //Checking if this week is the associate's first.
                        var year = associate.hireDate.substr(0, 4);
                        var month = +associate.hireDate.substr(5, 2) - 1;
                        var day = associate.hireDate.substr(8, 2);
                        var hireDate = new Date(year, month, day, 0, 0, 0, 0);
                        var lc_weekOne = hireDate.getTime();
                        lc_weekOne = lc_weekOne <= weekEnd && lc_weekOne >= weekStart;

                        //Checking if this week is the associate's second.
                        var lc_weekTwo = hireDate;
                        lc_weekTwo.setDate(lc_weekTwo.getDate() + 7);
                        lc_weekTwo = lc_weekTwo.getTime();
                        lc_weekTwo = lc_weekTwo <= weekEnd && lc_weekTwo >= weekStart;

                        //Setting goal to start.
                        var goal = $scope.funcRates.weeks[weekIndex][associate.operation];

                        //Adjusting goal based on LC.
                        if (lc_weekOne) {
                            goal = goal * 0.5;
                        } else if (lc_weekTwo) {
                            goal = goal * 0.75;
                        };

                        var top = goal * 1.05;
                        var min = goal * (associate.flex ? 0.75 : 0.90);

                        var units = +associate.unitsArray[assocWeekIndex];
                        var hours = +associate.hoursArray[assocWeekIndex];
                        var uph = units / hours;

                        var errors = associate.errorsArray[assocWeekIndex];
                        var accuracy = ((1 - (errors / units)) * 1) * 100;

                        associate.weeks[weekIndex] = {
                            uph_goal: goal,
                            uph_min: min,
                            lc: lc_weekOne || lc_weekTwo,
                            lc_weekOne: lc_weekOne,
                            lc_weekTwo: lc_weekTwo,
                            units: units,
                            hours: hours,
                            uph: uph,
                            errors: errors,
                            accuracy: accuracy,
                            madeGoal: uph >= goal,
                            madeMin: uph >= min,
                            madeTop: uph >= top,
                            excel: [units, hours, uph].join(',')

                        };

                        UPHs.push(goal);
                        Hours.push(hours);
                    });
                    //associate.weeks[3].hours >= 9;
                    if (associate.weeks[3] && associate.weeks[3].hours >= 9) {
                        var units = _.reduce(associate.unitsArray, function (memo, num) { return +memo + +num; }, 0);
                        var hours = _.reduce(associate.hoursArray, function (memo, num) { return +memo + +num; }, 0);
                        var uph = units / hours;
                        var errors = _.reduce(associate.errorsArray, function (memo, num) { return +memo + +num; }, 0);
                        var accuracy = ((1 - (errors / units)) * 1) * 100;

                        var expectedUnits = [];
                        for (var i = 0; i < UPHs.length; i++) {
                            expectedUnits.push(+UPHs[i] * +Hours[i])
                        };

                        expectedUnits = _.reduce(expectedUnits, function (memo, num) { return memo + num; }, 0);

                        var goal = expectedUnits / hours;
                        var top = goal * 1.05;
                        var min = goal * (associate.flex ? 0.75 : 0.90)
                        associate.fourWeek = {
                            uph_goal: goal,
                            units: units,
                            hours: hours,
                            uph: uph,
                            errors: errors,
                            accuracy: accuracy,
                            madeGoal: uph >= goal,
                            madeMin: uph >= min,
                            madeTop: uph >= top,
                            excel: [units, hours, uph].join(',')
                        };

                        associate.selected = false;

                        if (associate.exempt) {
                            associate.exemptReason = associate.exempt;
                            associate.exempt = true;
                            associate.locked = true;
                        } else {
                            associate.exempt = false;
                        };

                        if (associate.created) {
                            associate.caLevel = associate.created;
                            associate.locked = true;
                        } else if (associate.type == 'Zulily' && associate.unitsArray.length == 4 && associate.weeks[0].madeTop && associate.weeks[1].madeTop && associate.weeks[2].madeTop && associate.weeks[3].madeTop) {
                            if (!associate.fourWeek.errors) {
                                associate.caLevel = 10;
                            } else {
                                associate.caLevel = null;
                                associate.progActions[0].label = 'Action (P)'
                            };

                            associate.progActions.splice(3, 1);
                            associate.progActions.splice(2, 1);
                        } else if (!associate.weeks[3].madeMin && !associate.fourWeek.madeMin) {
                            associate.caLevel = 100;
                            associate.progActions.splice(1, 1);
                        } else if (!associate.weeks[3].madeMin && associate.fourWeek.madeMin) {
                            associate.exemptReason = [];
                            associate.exemptReason.push('Auto Exempt');
                            var exemptExplained = [
                                'Week 4 UPH (',
                                associate.weeks[3].uph.toFixed(2),
                                ') below Week 4 Min (',
                                associate.weeks[3].uph_min.toFixed(2),
                                '). 4 Week UPH (',
                                associate.fourWeek.uph.toFixed(2),
                                ') is above weighted 4 Week Min (',
                                min.toFixed(2), ')'
                            ].join('');
                            associate.exemptReason.push(exemptExplained);
                            associate.exemptReason = associate.exemptReason.join(',');
                            associate.caLevel = 101;
                            associate.progActions.splice(2, 1);
                            associate.progActions.splice(1, 1);
                        } else {
                            associate.caLevel = null;
                            associate.progActions.splice(1, 1);
                        }

                        tempData.push(associate);
                    }
                });

                $scope.gridOptions.data = _.sortBy(tempData, function (assoc) { return -assoc.weeks[3].uph });

                $scope.gridOptions.columnDefs = [
                    {
                        name: 'typeNameCombo',
                        displayName: 'Name (Employer)',
                        width: 175,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableColumnMenu: false,
                        cellTemplate: '<a ng-click="grid.appScope.expandInfo(row.entity)">{{ row.entity.fullName }} ({{ row.entity.type.substr(0, 1) | uppercase }})</a>',
                        filters: [
                            {
                                condition: uiGridConstants.filter.CONTAINS
                            },
                            {
                                noTerm: true,
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: _.map(_.sortBy(_.uniq(_.pluck(tempData, 'type')), function (type) { return type }), function (type) { return { value: '(' + type.substr(0, 1).toLowerCase() + ')', label: type } })
                            }
                        ]
                    },
                    {
                        name: 'managerName',
                        displayName: 'Manager',
                        width: 120,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableColumnMenu: false,
                        visible: false,
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: _.sortBy(_.uniq(_.map(tempData, function (assoc) {
                                return { value: assoc.managerName, label: assoc.managerName }
                            }), function (filter) {
                                return filter.label
                            }), function (uniqFilter) {
                                return uniqFilter.label
                            })
                        }
                    },
                    {
                        name: 'func',
                        displayName: 'Operation',
                        width: 120,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableColumnMenu: false,
                        cellTemplate: '<div>{{ row.entity.operation }}</div>',
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: _.sortBy(_.uniq(_.map(tempData, function (assoc) { return { value: assoc.func, label: assoc.operation } }), function (filter) { return filter.label }), function (uniqFilter) { return uniqFilter.label })
                        }
                    },
                    {
                        name: 'avg',
                        width: 45,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableColumnMenu: false,
                        displayName: 'Avg.',
                        headerCellTemplate: '<div style="text-align: center">\n    {{ col.displayName }}\n    <br>\n    <button class="btn btn-block btn-sm btn-primary" ng-click="grid.appScope.average()">View</button>\n    <label ng-class="{\'btn btn-block btn-sm btn-default\': !grid.appScope.selectedAll, \'btn btn-block btn-sm  btn-info\' : grid.appScope.selectedAll}">\n        <input type="checkbox" ng-model="grid.appScope.selectedAll" ng-click="grid.appScope.selectAll()" ng-hide="true" /> <span class="glyphicon glyphicon-ok" aria-hidden="true"></label>\n</div>\n',
                        cellTemplate: '<label ng-class="{\'btn btn-block btn-sm  btn-default\': !row.entity.inclInAvg, \'btn btn-block btn-sm n btn-info\' : row.entity.inclInAvg}"><input ng-model="row.entity.inclInAvg" type="checkbox" ng-hide="true"/><span class="glyphicon glyphicon-ok" aria-hidden="true"></label>',
                        enableColumnMenu: false
                    },
                    {
                        name: 'hireDate',
                        displayName: 'Hired',
                        width: 80,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedLeft: true,
                        enableHiding: false,
                        enableColumnMenu: false,
                        cellFilter: 'date: \'shortDate\''
                    },
                    {
                        name: 'shift',
                        displayName: 'Shift',
                        width: 70,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableColumnMenu: false,
                        filters: [
                            {
                                condition: uiGridConstants.filter.STARTS_WITH,
                                placeholder: 'Shift'
                            },
                            {
                                noTerm: true,
                                type: uiGridConstants.filter.SELECT,
                                selectOptions: _.map(_.sortBy(_.uniq(_.pluck(tempData, 'shift')), function (shift) { return shift }), function (shift) { return { value: shift, label: shift } })
                            }
                        ]
                    },
                    {
                        name: 'weeks[3].madeGoal',
                        displayName: 'Goal',
                        width: 60,
                        pinnedLeft: true,
                        cellTemplate: '<div>{{ row.entity.weeks[3].madeGoal.toString().toUpperCase() }}</div>',
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: true, label: 'T' }, { value: false, label: 'F' }]
                        },
                        pinnedLeft: true,
                        enablePinning: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'weeks[3].madeMin',
                        displayName: 'Min',
                        width: 60,
                        pinnedLeft: true,
                        cellTemplate: '<div>{{ row.entity.weeks[3].madeMin.toString().toUpperCase() }}</div>',
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: true, label: 'T' }, { value: false, label: 'F' }]
                        },
                        pinnedLeft: true,
                        enablePinning: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'flex',
                        displayName: 'Flex',
                        width: 60,
                        pinnedLeft: true,
                        cellTemplate: '<div>{{ row.entity.flex == 1 ? \'TRUE\' : \'FALSE\' }}</div>',
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: 1, label: 'T' }, { value: 0, label: 'F' }]
                        },
                        pinnedLeft: true,
                        enablePinning: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'lc',
                        displayName: 'LC',
                        width: 60,
                        pinnedLeft: true,
                        cellTemplate: '<div>{{ row.entity.lc == 1 ? \'TRUE\' : \'FALSE\' }}</div>',
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: [{ value: 1, label: 'T' }, { value: 0, label: 'F' }]
                        },
                        pinnedLeft: true,
                        enablePinning: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'fourWeek.excel',
                        width: 170,
                        pinnedRight: true,
                        sort: {
                            enabled: false,
                            type: null
                        },
                        displayName: 'FW Units, FW Hours, FW UPH',
                        data: {
                            quality: false
                        },
                        headerCellTemplate: '<div style="text-align: center">Four Week Data\n    <br>\n    <br>\n    <i class="fa pull-right" ng-class="{\'fa-exclamation\' : !col.colDef.data.quality, \'fa-exclamation-triangle\' : col.colDef.data.quality}" style="cursor: pointer; margin-right: 5px;" ng-click="grid.appScope.errors(col)" title="{{ !col.colDef.data.quality ? \'Show Errors\' : \'Collapse Errors\' }}"></i><br>\n    <div style="width: 100%">\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'40%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'units\')" class="tableCellHeader col-xs-3">Units</div>\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'hours\')" class="tableCellHeader col-xs-3">Hrs.</div>\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'uph\')" class="tableCellHeader col-xs-3">UPH</div>\n        <div style="width: 15%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'errors\')" ng-if="col.colDef.data.quality" class="tableCellHeader col-xs-3">Err</div>\n        <div style="width: 25%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'accuracy\')" ng-if="col.colDef.data.quality" class="tableCellHeader col-xs-3">Acc</div>\n    </div>\n</div>\n',
                        cellTemplate: '<div style="text-align: center; width: 100%; margin: 0 !important" class="row" ng-class="{\'label-warning\' : row.entity.fourWeek.madeMin && !row.entity.weeks[3].madeMin , \'label-danger whiteText\' : !row.entity.fourWeek.madeMin && !row.entity.weeks[3].madeMin, \'label-success whiteText\' : row.entity.weeks[3].madeGoal}">\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'40%\' }}; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.units | number: 0 }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }}; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.hours | number: 2 }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }}; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.uph | number: 2 }}</div>\n    <div style="width: 15%; padding: 2px !important; border: 1px solid #ccc; cursor: pointer" ng-if="col.colDef.data.quality" class="col-xs-3"  ng-click="grid.appScope.getErrors(col.colDef, row.entity)">{{ row.entity.fourWeek.errors }}</div>\n    <div style="width: 25%; padding: 2px !important; border: 1px solid #ccc;" ng-if="col.colDef.data.quality" class="col-xs-3" >{{ row.entity.fourWeek.accuracy | number: 2 }}%</div>\n</div>\n',
                        enableColumnMenu: false
                    },
                    {
                        name: 'exemptReason',
                        width: 70,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedRight: true,
                        enableHiding: false,
                        displayName: 'Exempt Reason,Exempt Comments',
                        headerCellTemplate: '<div><div class="ui-grid-cell-contents"><span>Exempt</span></div></div>',
                        cellTemplate: '<button ng-click="grid.appScope.exempt(row.entity, col)" ng-class="{\'btn btn-default btn-sm\': !row.entity.exempt,\'btn btn-info btn-sm\' : row.entity.exempt}" ng-if="!row.entity.locked || (row.entity.locked && row.entity.exempt)">Exempt</button>\n',
                        enableColumnMenu: false
                    },
                    {
                        name: 'locked',
                        width: 40,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedRight: true,
                        enableHiding: false,
                        displayName: 'Action Taken',
                        headerCellTemplate: '<div style="height:90px">\n    <div style="transform: rotate(270deg); position: absolute; top: 60px; left: 5px;">Take</div>\n    <div style="    transform: rotate(270deg); position: absolute; top: 15px;">Action</div>\n</div>',
                        cellTemplate: '<label ng-class="{\'notSelected\': !row.entity.selected && row.entity.caLevel, \'btn btn-default btn-sm\': !row.entity.selected ,\'btn btn-info btn-sm\' : row.entity.selected}" class="btn btn-sm btn-default" ng-click="grid.appScope.selectRow(row.entity)" ng-if="!row.entity.locked">\n <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n</label>',
                        enableColumnMenu: false
                    },
                    {
                        name: 'caLevel',
                        width: 120,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedRight: true,
                        enableHiding: false,
                        displayName: 'Action',
                        headerCellTemplate: '<div style="text-align: left; padding: 5px">\n    {{ col.displayName.split(\' \')[0] }}<br>\n    {{ col.displayName.split(\' \')[1] }}\n</div>\n',
                        cellTemplate: '<select class="btn btn-sm" ng-class="{\'noGo\': row.entity.selected && !row.entity.caLevel, \'go\': row.entity.selected && row.entity.caLevel}" ng-model="row.entity.caLevel" style="height: 30px;width: 100px; margin-left: 2px; float: left;" ng-if="!row.entity.exempt" ng-options="action.value as action.label for action in row.entity.progActions" ng-disabled="row.entity.locked"></select>\n',
                        enableColumnMenu: false
                    }
                ];

                for (var i = 0; i < 4; i++) {
                    var year = $scope.weekStartDays[i].substr(0, 4);
                    var month = +$scope.weekStartDays[i].substr(5, 2) - 1;
                    var day = $scope.weekStartDays[i].substr(8, 2);
                    var date = new Date(year, month, day, 0, 0, 0, 0);
                    $scope.gridOptions.columnDefs.push({
                        name: 'weeks[' + i + '].excel',
                        width: 170,
                        enableHiding: true,
                        sort: {
                            enabled: false,
                            type: null
                        },
                        displayName: ['W' + (i + 1) + ' Units', 'W' + (i + 1) + ' Hours', 'W' + (i + 1) + ' UPH'].join(','),
                        data: {
                            index: i,
                            displayDate: date,
                            date: $scope.weekStartDays[i],
                            weekNum: 'Week ' + (i + 1),
                            quality: false
                        },
                        headerCellTemplate: '<div style="text-align: center">{{ col.colDef.data.weekNum }}\n    <br>Tuesday {{ col.colDef.data.displayDate | date : \'shortDate\' }}\n    <br>\n    <i class="fa fa-cogs pull-right" style="cursor: pointer; margin-right: 5px;" ng-click="grid.appScope.editWeek(col.colDef.data.index)"></i><i class="fa  pull-right" ng-class="{\'fa-exclamation\' : !col.colDef.data.quality, \'fa-exclamation-triangle\' : col.colDef.data.quality}" style="cursor: pointer; margin-right: 5px;" ng-click="grid.appScope.errors(col)" title="{{ !col.colDef.data.quality ? \'Show Errors\' : \'Collapse Errors\' }}"></i><br>\n    <div style="width: 100%">\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'40%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'units\')" class="tableCellHeader col-xs-3">Units</div>\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'hours\')" class="tableCellHeader col-xs-3">Hrs.</div>\n        <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'uph\')" class="tableCellHeader col-xs-3">UPH</div>\n        <div style="width: {{ col.colDef.data.quality ? \'15%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'errors\')" ng-if="col.colDef.data.quality" class="tableCellHeader col-xs-3">Err</div>\n        <div style="width: {{ col.colDef.data.quality ? \'25%\' : \'30%\' }};cursor:pointer" ng-click="grid.appScope.sortCol(col, \'accuracy\')" ng-if="col.colDef.data.quality" class="tableCellHeader col-xs-3">Acc</div>\n    </div>\n</div>\n',
                        cellTemplate: '<div style="text-align: center; width: 100%; margin: 0 !important;" class="row" ng-class="{\'label-danger whiteText\' : !row.entity.weeks[col.colDef.data.index].madeMin, \'label-success whiteText\' : row.entity.weeks[col.colDef.data.index].madeGoal}" ng-if="row.entity.weeks[col.colDef.data.index]">\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'40%\' }};" class="col-xs-3" ng-class="{\'regCell\': !row.entity.weeks[col.colDef.data.index].lc, \'lc1Cell\': row.entity.weeks[col.colDef.data.index].lc_weekOne, \'lc2Cell\': row.entity.weeks[col.colDef.data.index].lc_weekTwo}">{{ row.entity.weeks[col.colDef.data.index].units | number: 0 }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};" class="col-xs-3" ng-class="{\'regCell\': !row.entity.weeks[col.colDef.data.index].lc, \'lc1Cell\': row.entity.weeks[col.colDef.data.index].lc_weekOne, \'lc2Cell\': row.entity.weeks[col.colDef.data.index].lc_weekTwo}">{{ row.entity.weeks[col.colDef.data.index].hours }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'20%\' : \'30%\' }};" class="col-xs-3" ng-class="{\'regCell\': !row.entity.weeks[col.colDef.data.index].lc, \'lc1Cell\': row.entity.weeks[col.colDef.data.index].lc_weekOne, \'lc2Cell\': row.entity.weeks[col.colDef.data.index].lc_weekTwo}">{{ row.entity.weeks[col.colDef.data.index].uph | number: 1 }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'15%\' : \'30%\' }}; cursor: pointer;" ng-if="col.colDef.data.quality" class="col-xs-3" ng-class="{\'regCell\': !row.entity.weeks[col.colDef.data.index].lc, \'lc1Cell\': row.entity.weeks[col.colDef.data.index].lc_weekOne, \'lc2Cell\': row.entity.weeks[col.colDef.data.index].lc_weekTwo}" ng-click="grid.appScope.getErrors(col.colDef, row.entity)">{{ row.entity.weeks[col.colDef.data.index].errors }}</div>\n    <div style="width: {{ col.colDef.data.quality ? \'25%\' : \'30%\' }};" ng-if="col.colDef.data.quality" class="col-xs-3" ng-class="{\'regCell\': !row.entity.weeks[col.colDef.data.index].lc, \'lc1Cell\': row.entity.weeks[col.colDef.data.index].lc_weekOne, \'lc2Cell\': row.entity.weeks[col.colDef.data.index].lc_weekTwo}">{{ row.entity.weeks[col.colDef.data.index].accuracy | number: 2 }}%</div>\n</div>',
                        enableColumnMenu: false
                    })
                };
            };
        });

        Q.all([getWeek])
            .then(function () {
                angular.element(".ui-grid-viewport")[1].scrollLeft = 1000;
            });
    };

    $scope.sortCol = function (col, columnName) {
        for (var i = 12; i <= 15; i++) {
            $scope.gridOptions.columnDefs[i].sort = {
                enabled: false,
                type: null
            };
        };

        col.sort = {
            enabled: true,
            type: !col.sort.type ? 'asc' : col.sort.type == 'asc' ? 'desc' : col.sort.type == 'desc' ? 'asc' : null
        };

        $scope.gridOptions.data = _.sortBy($scope.gridOptions.data, function (assoc) {
            switch (col.name) {
                case 'fourWeek.excel':
                    if (col.sort.type == 'asc') {
                        return -assoc.fourWeek[columnName];
                    } else {
                        return assoc.fourWeek[columnName];
                    };
                default:
                    if (col.sort.type == 'asc') {
                        return !assoc.weeks[col.colDef.data.index] ? 1000 : -assoc.weeks[col.colDef.data.index][columnName];
                    } else {
                        return !assoc.weeks[col.colDef.data.index] ? -1000 : assoc.weeks[col.colDef.data.index][columnName];
                    };
            };
        });
    };

    $scope.errors = function (col) {
        col.colDef.data.quality = !col.colDef.data.quality;
        col.colDef.width = col.colDef.data.quality ? 250 : 170;
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN)
    }

    $scope.selectRow = function (assoc) {
        assoc.selected = !assoc.selected;
        $scope.gridApi.selection.toggleRowSelection(assoc);
    };

    $scope.editWeek = function (weekIndex) {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Operations for Week {{ headerWeek }}</h4>\n            </div>\n            <div class="modal-body">\n                <table class="table table-condensed table-hover table-striped">\n                    <thead>\n                        <tr>\n                            <th>\n                                Operation\n                            </th>\n                            <th>\n                                Min\n                            </th>\n                            <th>\n                                Goal\n                            </th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr ng-repeat="operation in funcRates.funcs">\n                            <td>\n                                {{ operation }}\n                            </td>\n                            <td>\n                                {{ funcRates.weeks[weekIndex][operation] * 0.90 | number : 2 }}\n                            </td>\n                            <td>\n                                <input class="form-control" type="number" min="1" ng-model="funcRates.weeks[weekIndex][operation]"></input>\n                            </td>\n                        </tr>\n                    </tbody>\n                </table>\n            </div>\n            <div class="modal-footer">\n                <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button>\n                <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal">Save</button>\n            </div>\n        </div>\n    </div>\n',
            controller: function ($scope, $rootScope, funcRates, weekIndex, close) {
                $scope.funcRates = funcRates;
                $scope.weekIndex = weekIndex;
                $scope.headerWeek = weekIndex + 1;

                $scope.save = function () {
                    close({ funcRates: $scope.funcRates })
                };
            },
            inputs: {
                funcRates: angular.copy($scope.funcRates),
                weekIndex: weekIndex
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (save) {
                if (save) {
                    $scope.funcRates = save.funcRates;
                    blockUI.start();
                    $scope.funcRates.funcs.forEach(function (operation, i) {
                        $scope.gridOptions.data.forEach(function (associate, i) {
                            if (associate.operation == operation && associate.weeks[weekIndex]) {
                                var goal = $scope.funcRates.weeks[weekIndex][operation];
                                if (associate.weeks[weekIndex].lc_weekOne) {
                                    goal = goal * 0.5;
                                } else if (associate.weeks[weekIndex].lc_weekTwo) {
                                    goal = goal * 0.75;
                                };
                                var min = goal * (associate.flex ? 0.75 : 0.90);
                                var lc_weekOne = associate.weeks[weekIndex].lc_weekOne;
                                var lc_weekTwo = associate.weeks[weekIndex].lc_weekTwo;
                                var lc = lc_weekOne || lc_weekTwo;
                                var units = associate.weeks[weekIndex].units;
                                var hours = associate.weeks[weekIndex].hours;
                                var uph = associate.weeks[weekIndex].uph;
                                var excel = associate.weeks[weekIndex].excel;
                                associate.weeks[weekIndex] = {
                                    uph_goal: goal,
                                    uph_min: min,
                                    lc: lc,
                                    lc_weekOne: lc_weekOne,
                                    lc_weekTwo: lc_weekTwo,
                                    units: units,
                                    hours: hours,
                                    uph: uph,
                                    errors: associate.weeks[weekIndex].errors,
                                    accuracy: associate.weeks[weekIndex].accuracy,
                                    madeGoal: uph >= goal,
                                    madeMin: uph >= (goal * (associate.flex ? 0.75 : 0.90)),
                                    madeTop: uph >= (goal * 1.05),
                                    excel: excel
                                };
                            };
                        });
                    });
                    $scope.funcRates.funcs.forEach(function (operation, i) {
                        $scope.gridOptions.data.forEach(function (associate, i) {
                            if (associate.operation == operation) {
                                var UPHs = [], Hours = [];
                                angular.forEach(associate.weeks, function (week, weekNum) {
                                    var goal = $scope.funcRates.weeks[weekNum][operation];
                                    if (associate.weeks[weekNum].lc_weekTwo) {
                                        goal = goal * 0.5;
                                    } else if (associate.weeks[weekNum].lc_weekTwo) {
                                        goal = goal * 0.75;
                                    };
                                    UPHs.push(goal);
                                    Hours.push(week.hours);
                                });

                                var expectedUnits = [];
                                for (var i = 0; i < UPHs.length; i++) {
                                    expectedUnits.push(+UPHs[i] * +Hours[i])
                                };

                                expectedUnits = _.reduce(expectedUnits, function (memo, num) { return memo + num; }, 0);

                                var goal = expectedUnits / associate.fourWeek.hours;
                                var min = goal * (associate.flex ? 0.75 : 0.90);
                                var units = associate.fourWeek.units;
                                var hours = associate.fourWeek.hours;
                                var uph = associate.fourWeek.uph;
                                var excel = associate.fourWeek.excel;
                                associate.fourWeek = {
                                    uph_goal: goal,
                                    units: units,
                                    hours: hours,
                                    uph: uph,
                                    errors: associate.fourWeek.errors,
                                    accuracy: associate.fourWeek.accuracy,
                                    madeGoal: uph >= goal,
                                    madeMin: uph >= min,
                                    madeTop: uph >= (goal * 1.05),
                                    excel: excel
                                };

                                associate.progActions = [
                                    {
                                        label: 'Action',
                                        value: null
                                    },
                                    {
                                        label: 'Positive',
                                        value: 10
                                    },
                                    {
                                        label: 'Next Level',
                                        value: 100
                                    },
                                    {
                                        label: 'Verbal',
                                        value: 101
                                    }
                                ];

                                if (associate.type == 'Zulily' && associate.unitsArray.length == 4 && associate.weeks[0].madeTop && associate.weeks[1].madeTop && associate.weeks[2].madeTop && associate.weeks[3].madeTop) {
                                    if (!associate.fourWeek.errors) {
                                        associate.caLevel = 10;
                                    } else {
                                        associate.caLevel = null;
                                        associate.progActions[0].label = 'Action (P)'
                                    };

                                    associate.progActions.splice(3, 1);
                                    associate.progActions.splice(2, 1);
                                } else if (!associate.weeks[3].madeMin && !associate.fourWeek.madeMin) {
                                    associate.exemptReason = null;
                                    associate.caLevel = 100;
                                    associate.progActions.splice(1, 1);
                                } else if (!associate.weeks[3].madeMin && associate.fourWeek.madeMin) {
                                    associate.exemptReason = ['Auto Exempt'];
                                    var exemptExplained = ['Week 4 UPH (', associate.weeks[3].uph.toFixed(2), ') below Week 4 Min (', associate.weeks[3].uph_min.toFixed(2), '). 4 Week UPH (', associate.fourWeek.uph.toFixed(2), ') is above weighted 4 Week Min (', min.toFixed(2), ')'].join('');
                                    associate.exemptReason.push(exemptExplained);
                                    associate.exemptReason = associate.exemptReason.join(',');
                                    associate.caLevel = 101;
                                    associate.progActions.splice(2, 1);
                                    associate.progActions.splice(1, 1);
                                } else {
                                    associate.exemptReason = null;
                                    associate.caLevel = null;
                                    associate.progActions.splice(1, 1);
                                }
                            };
                        });
                    });
                    blockUI.stop();
                };
            });
        });
    };

    $scope.selectedAll = true;

    $scope.selectAll = function () {
        $scope.selectedAll = !$scope.selectedAll;

        $scope.gridOptions.data.forEach(function (item) {
            item.inclInAvg = $scope.selectedAll;
        });
    };

    $scope.average = function () {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Operation Averages</h4>\n            </div>\n            <div class="modal-body">\n                <uib-tabset>\n                    <uib-tab ng-repeat="(id, shift) in shifts">\n                        <uib-tab-heading>\n                            {{ shift.name }}\n                        </uib-tab-heading>\n                        <table class="table table-condensed table-hover table-striped">\n                            <thead>\n                                <tr>\n                                    <th>\n                                        Operation\n                                    </th>\n                                    <th>\n                                        Units\n                                    </th>\n                                    <th>\n                                        Hours\n                                    </th>\n                                    <th>\n                                        Associates\n                                    </th>\n                                    <th>\n                                        UPH\n                                    </th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                <tr ng-repeat="(name, operation) in shift.operations">\n                                    <td>\n                                        {{ name }}\n                                    </td>\n                                    <td>\n                                        {{ operation.units | number }}\n                                    </td>\n                                    <td>\n                                        {{ operation.hours | number : 2 }}\n                                    </td>\n                                    <td>\n                                        {{ operation.associates | number }}\n                                    </td>\n                                    <td>\n                                        {{ operation.units / operation.hours | number : 2 }}\n                                    </td>\n                                </tr>\n                            </tbody>\n                        </table>\n                    </uib-tab>\n                </uib-tabset>\n            </div>\n        </div>\n    </div>\n',
            controller: function ($scope, $rootScope, data, close) {
                var operations = {};
                _.sortBy(_.pluck(data, 'operation'), function (operation) { return operation }).forEach(function (operation) {
                    operations[operation] = {
                        units: 0,
                        hours: 0,
                        associates: 0
                    };
                });
                var shifts = {
                    0: {
                        name: 'All',
                        operations: angular.copy(operations)
                    },
                    1: {
                        name: 'Days',
                        operations: angular.copy(operations)
                    },
                    2: {
                        name: 'Nights',
                        operations: angular.copy(operations)
                    }
                };

                data.forEach(function (associate, i) {
                    if (associate.inclInAvg && associate.shift) {
                        var shift = +associate.shift.substr(0, 1);
                        angular.forEach(associate.weeks, function (week, weekNum) {
                            var units = associate.weeks[weekNum].units;
                            var hours = associate.weeks[weekNum].hours;
                            shifts[0].operations[associate.operation].units += +units;
                            shifts[0].operations[associate.operation].hours += +hours;
                            shifts[shift].operations[associate.operation].units += +units;
                            shifts[shift].operations[associate.operation].hours += +hours;
                        });
                        shifts[0].operations[associate.operation].associates += 1;
                        shifts[shift].operations[associate.operation].associates += 1;
                    };
                });

                $scope.shifts = shifts;
            },
            inputs: {
                data: $scope.gridOptions.data
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.exempt = function (row, col) {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n  <div class="modal-dialog">\n        <div class="modal-content">\n           <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button> \n              <h4 class="modal-title">Exemption for {{ data.fullName }}</h4>\n            </div>\n            <div class="modal-body">\n          Reason:<br>\n           <select class="form-control" ng-options="reason.value as reason.label for reason in reasons" ng-model="exempt.reason"></select>\n           Comments:<br>\n             <textarea ng-model="exempt.comments" class="form-control" style="height: 100%; width: 100%; font-size: 20px;" rows="12"></textarea>\n           </div>\n            <div class="modal-footer"> <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button> <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal" ng-disabled="data.locked || (exempt.reason == \'Other\' && !exempt.comments)">Save</button></div>\n     </div>\n    </div>\n</div>',
            controller: function ($scope, $rootScope, data, close) {
                var reasons = _.sortBy(["", "Arrivals", "Auto Exempt", "IB Prep", "Cross Function LC", "Freight Mix", "Function Jumping", "Goal Post Error", "LC", "Lead", "NC Receive", "Other", "Pod Captain", "Problem Solve", "Project", "Returns", "Showing Improvement", "Traffic Cop", "Training", "Zuiss"], function (reason) {
                    return reason
                });
                $scope.reasons = _.map(reasons, function (reason) {
                    if (!reason) {
                        return {
                            label: '',
                            value: null
                        };
                    } else {
                        return {
                            label: reason,
                            value: reason
                        };
                    };
                });
                $scope.exempt = {
                    reason: (data.exemptReason && data.exemptReason.split(',')[0]) || null,
                    comments: (data.exemptReason && data.exemptReason.split(',')[1]) || null
                };
                $scope.data = data;
                $scope.exit = false;
                $scope.save = function () {
                    $scope.exit = true;
                    close($scope.exempt);
                };
            },
            inputs: {
                data: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                if (result.reason) {
                    row.exemptReason = [result.reason, result.comments].join(',');
                    row.exempt = true;
                    if (!row.selected) {
                        row.selected = true;
                        $scope.gridApi.selection.toggleRowSelection(row);
                    };
                } else {
                    row.exemptReason = null;
                    row.exempt = false;
                    if (row.selected) {
                        row.selected = false;
                        $scope.gridApi.selection.toggleRowSelection(row);
                    };
                };
            });
        });
    };

    $scope.submitFeedbacks = function (selected) {
        selected.forEach(function (row, i) {
            selected[i] = {
                wmsId: row.wmsId,
                hireDate: row.hireDate,
                locationId: row.locationId,
                caLevel: row.caLevel,
                uph_goal: row.weeks[3].uph_goal,
                weeks: row.weeks,
                fourWeek: row.fourWeek,
                reviewWeekDate: row.reviewWeekDate,
                exempt: row.exempt ? true : false,
                exemptNotes: row.exempt ? row.exemptReason : null,
                fullName: row.fullName,
                shift: row.shift,
                dept: row.homeDept,
                operation: row.operation == 'Stow' ? 'Putaway' : row.operation,
                managerName: row.managerName,
                kronosId: row.kronosId,
                employer: row.type
            };
        });
        var caLevelCheck = _.without(_.map(_.pluck(selected, 'caLevel'), function (row) { return row === null }), false);
        if (caLevelCheck.length) {
            $rootScope.changeResponse = {
                failure: true,
                message: 'Please select a "Progressive Action" for all selected rows!'
            };
            return;
        };

        blockUI.start();
        ZuReportsAPI.insertFeedbacks(JSON.stringify(selected))
            .then(function (res) {
                if (angular.isObject(res) && angular.isNumber(+res.Success) && +res.Success > 0) {
                    $scope.gridOptions.data.forEach(function (associate, i) {
                        if (associate.selected) {
                            $scope.gridApi.selection.toggleRowSelection(associate);
                            associate.selected = false;
                            associate.locked = true;
                        };
                    });
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Successfully Created ' + +res.Success + ' Feedbacks(s)!'
                    };
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    };
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An unknown error has occured. Please try again.'
                };
            });
    };

    $scope.expandInfo = function (row) {

        ModalService.showModal({
            templateUrl: 'templates/dialogs/viewAssoc.html',
            controller: function ($scope, $rootScope, info, close) {

                $scope.assocInfo = {
                    fullName: info.fullName,
                    shift: info.shift,
                    func: info.homeDept,
                    kronosId: info.kronosId,
                    type: info.type,
                    hireDate: info.hireDate,
                    picLink: info.picLink
                };
            },
            inputs: {
                info: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.getErrors = function (col, row) {
        var locationId = +$localStorage.locationId;
        var wmsId = row.wmsId;
        var shift = +row.shift.substr(0, 1);
        var i = col.data.index;
        if (col.data.index || col.data.index > -1) {
            var year = +$scope.weekStartDays[i].substr(0, 4);
            var month = +$scope.weekStartDays[i].substr(5, 2) - 1;
            var day = +$scope.weekStartDays[i].substr(8, 2);
            var startDate = new Date(year, month, day, 0, 0, 0, 0);
            var endDate = new Date(year, month, day, 23, 59, 59, 999);
            endDate.setDate(endDate.getDate() + 6);
        } else {
            var year = +$scope.weekStartDays[0].substr(0, 4);
            var month = +$scope.weekStartDays[0].substr(5, 2) - 1;
            var day = +$scope.weekStartDays[0].substr(8, 2);
            var startDate = new Date(year, month, day, 0, 0, 0, 0);

            var year = +$scope.weekStartDays[3].substr(0, 4);
            var month = +$scope.weekStartDays[3].substr(5, 2) - 1;
            var day = +$scope.weekStartDays[3].substr(8, 2);
            var endDate = new Date(year, month, day, 23, 59, 59, 999);
            endDate.setDate(endDate.getDate() + 6);
        };
        var errors;

        startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
        endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());

        blockUI.start();
        var getErrors = ZuReportsAPI.getAssocErrors(wmsId, startDate.toJSON(), endDate.toJSON(), locationId)
            .then(function (res) {
                blockUI.stop();
                if (angular.isArray(res)) {
                    errors = _.groupBy(res, function (audit) { return audit.departmentname });

                    angular.forEach(errors, function (errorsArray, dept) {
                        var length = 0;
                        errorsArray = _.groupBy(errorsArray, function (error) { return error.trackid; });

                        angular.forEach(errorsArray, function (trackId, i) {
                            length += 1;
                        });

                        errors[dept] = {
                            length: length,
                            errorsArray: errorsArray
                        };
                    });
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An unknown error has occured.'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An unknown error has occured.'
                };
            });
        Q.all([getErrors])
            .then(function () {
                ModalService.showModal({
                    template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Errors for {{ info.fullName }}</h4>\n            </div>\n            <div class="modal-body">\n                <uib-tabset>\n                    <uib-tab ng-repeat="(dept, data) in errors">\n                        <uib-tab-heading>\n                            {{ dept }}\n                            <span class="badge">{{ data.length }}</span>\n                        </uib-tab-heading>\n                        <table class="table table-condensed table-striped table-hover">\n                           <thead>\n                               <tr>\n                                  <th>\n                                      Error Id\n                                  </th>\n                                 <th>\n                                      Error\n                                 </th>\n                                 <th>\n                                      Notes\n                                 </th>\n                             </tr>\n                         </thead>\n                          <tbody>\n                               <tr ng-repeat="(id, error) in data.errorsArray">\n                                  <td>\n                                      <a ui-sref="app.ICQAFollowUpDetail({ trackid: id })" target="_blank">{{ id }}</a>\n                                 </td>\n                                 <td>\n                                      {{ error[0].ErrorName || error[0].ExceptionType }}\n                                    </td>\n                                 <td>\n                                      {{ error[0].Notes }}\n                                  </td>\n                             </tr>\n                         </tbody>\n                        </table>\n                    </uib-tab>\n                </uib-tabset>\n            </div>\n        </div>\n    </div>\n</div>\n',
                    controller: function ($scope, $rootScope, errors, info, close) {
                        $scope.errors = errors;

                        $scope.info = info;
                    },
                    inputs: {
                        errors: errors,
                        info: row
                    }
                }).then(function (modal) {
                    modal.element.modal();
                    modal.close;
                });
            });
    };

});