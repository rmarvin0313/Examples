angular.module('ZuPortal.Rob.Apps', [])

.factory('OutboundAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        OBDock: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/OBDock.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        OBDockDoors: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/availableOBDockDoors.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        addTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/addOBDockTrailer.aspx', $httpParamSerializer({
                addDoor: trailer.location,
                addSort: trailer.sort,
                addTrailerNumber: trailer.trailerNumber,
                addTDR: 0,
                addComments: trailer.comments,
                locationID: $localStorage.locationId,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        removeTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/removeOBDockTrailer.aspx', $httpParamSerializer({
                entryId: trailer.entryid,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        playTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/playOBDockTrailer.aspx', $httpParamSerializer({
                entryId: trailer.entryid,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        stopTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/stopOBDockTrailer.aspx', $httpParamSerializer({
                entryId: trailer.entryid,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        editTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/editOBDockTrailer.aspx', $httpParamSerializer({
                editEntryID: trailer.entryid,
                editDoor: trailer.location,
                editSort: trailer.carrier,
                editTrailerNumber: trailer.trailernumber,
                editSeal: trailer.seal,
                editTDR: ZuPortal_CONFIG.boolean[trailer.tdr],
                editComments: trailer.comments,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        manifestTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/manifestOBDockTrailer.aspx', $httpParamSerializer({
                manifestEntryID: trailer.entryid,
                manifestSealNumber: trailer.seal,
                manifestTrailerWeight: trailer.weight,
                manifestTrailerPackages: trailer.packages,
                manifestComments: trailer.comments,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        departTrailer: function (trailer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/departOBDockTrailer.aspx', $httpParamSerializer({
                departEntryID: trailer.entryid,
                departComments: trailer.comments,
                userId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        invalidLogEntry: function (entry) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/InvalidLogEntry.aspx', $httpParamSerializer({
                assocId: entry.assocId.value,
                verifyId: entry.verifyId.value,
                pslip: entry.pslip.value,
                shipmentId: entry.shipmentId.value,
                orderSwap: entry.orderSwap.value,
                wrongShipmentId: entry.wrongShipmentId.value,
                userId: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    };
})

.controller('OBDock', function ($scope, $rootScope, $http, $cookies, $localStorage, OutboundAPI, ZuPortal_CONFIG, ModalService, blockUI, $state) {
    $scope.trailers = {
        active: {
            open: true,
            title: 'Active',
            class: 'activeTrailers',
            contents: []
        },
        readyToManifest: {
            open: false,
            title: 'Ready to Manifest',
            class: 'stoppedTrailers',
            contents: []
        },
        readyToDepart: {
            open: false,
            title: 'Ready to Depart',
            class: 'manifestedTrailers',
            contents: []
        },
        inactive: {
            open: false,
            title: 'Trailers In Yard',
            class: 'inactiveTrailers',
            contents: []
        }
    };

    $scope.statusIs = function (trailer, status) {
        if (angular.isArray(status)) {
            var found = false;
            status.forEach(function (s, i) {
                if (trailer.trailerstatus == s) {
                    found = true;
                    return;
                };
            });
            return found;
        } else {
            return trailer.trailerstatus == status
        }
    };

    blockUI.start();

    OutboundAPI.OBDock()
        .then(function (response) {
            blockUI.stop();
            response.forEach(function (trailer, t) {
                trailer.tdr = ZuPortal_CONFIG.OBDockTDRStatus[trailer.tdr];

                trailer.timestamp = trailer.timestamp + '.000-0800';
                if (trailer.trailerstatus == 1 && (trailer.location != 'OB_YARD' && trailer.location.indexOf('SLIP') < 0)) {
                    $scope.trailers.active.contents.push(trailer);

                } else if (trailer.trailerstatus == 2) {
                    $scope.trailers.readyToManifest.contents.push(trailer);

                } else if (trailer.trailerstatus == 3) {
                    $scope.trailers.readyToDepart.contents.push(trailer);

                } else {
                    $scope.trailers.inactive.contents.push(trailer);

                }
            });
        }, function (err) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get trailer list!'
            };
        });

    $scope.addTrailer = function () {
        ModalService.showModal({
            templateUrl: 'templates/outbound/dock-management/dialogs/add.html',
            controller: function ($scope, $rootScope, OutboundAPI, close, ZuPortal_CONFIG) {
                $scope.submit = function (trailer) {
                    close(trailer);
                };

                $scope.trailer = {
                    location: null,
                    sort: null,
                    trailerNumber: null,
                    comments: null
                };

                $scope.sorts = ZuPortal_CONFIG.sortOptions;

                OutboundAPI.OBDockDoors()
                    .then(function (response) {
                        response.push({ locations: 'OB_YARD' })
                        $scope.availableDoors = response;
                    }, function (err) {

                    })
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close
                .then(function (result) {
                    if (result) {
                        blockUI.start();
                        OutboundAPI.addTrailer(result)
                            .then(function (response) {
                                blockUI.stop();
                                if (+response > 0 && angular.isNumber(+response)) {
                                    $state.reload();
                                } else {
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Encountered an error adding ' + result.trailerNumber + ', please try again!'
                                    }
                                }
                            }, function (err) {
                                blockUI.stop();
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Encountered an error adding ' + result.trailerNumber + ', please try again!'
                                }
                            });
                    }
                });
        });
    };

    $scope.remove = function (trailer) {
        ModalService.showModal({
            templateUrl: 'templates/outbound/dock-management/dialogs/remove.html',
            controller: function ($scope, $rootScope, trailer, close) {
                $scope.trailer = trailer;
                $scope.submit = function (trailer) {
                    close(trailer);
                };
            },
            inputs: {
                trailer: trailer
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close
                .then(function (result) {
                    if (result) {
                        blockUI.start();
                        OutboundAPI.removeTrailer(result)
                            .then(function (response) {
                                blockUI.stop();
                                if (+response > 0 && angular.isNumber(+response)) {
                                    $state.reload();
                                } else {
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Encountered an error removing ' + result.trailernumber + ', please try again!'
                                    }
                                }
                            }, function (err) {
                                blockUI.stop();
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Encountered an error removing ' + result.trailernumber + ', please try again!'
                                }
                            });
                    }
                });
        });
    };

    $scope.edit = function (trailer) {
        ModalService.showModal({
            templateUrl: 'templates/outbound/dock-management/dialogs/edit.html',
            controller: function ($scope, $rootScope, OutboundAPI, close, ZuPortal_CONFIG, trailer) {
                $scope.submit = function (trailer) {
                    close($scope.trailer);
                };

                $scope.trailer = angular.copy(trailer);

                $scope.original = angular.copy(trailer);

                $scope.sorts = ZuPortal_CONFIG.sortOptions;

                $scope.$watch('trailer', function (n, o) {
                    $scope.same = _.isEqual(n, $scope.original);
                }, true);

                OutboundAPI.OBDockDoors()
                    .then(function (response) {
                        response.unshift({ locations: trailer.location });
                        response.push({ locations: 'OB_YARD' })
                        $scope.availableDoors = response;
                    }, function (err) {

                    })
            },
            inputs: {
                trailer: trailer
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close
                .then(function (result) {
                    if (result) {
                        blockUI.start();
                        OutboundAPI.editTrailer(result)
                            .then(function (response) {
                                blockUI.stop();
                                if (+response > 0 && angular.isNumber(+response)) {
                                    $state.reload();
                                } else {
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Encountered an error editing ' + result.trailernumber + ', please try again!'
                                    }
                                }
                            }, function (err) {
                                blockUI.stop();
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Encountered an error editing ' + result.trailernumber + ', please try again!'
                                }
                            });
                    };
                });
        });
    };

    $scope.play = function (trailer) {
        blockUI.start();
        OutboundAPI.playTrailer(trailer)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $state.reload();
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Encountered an error playing ' + trailer.trailernumber + ', please try again!'
                    }
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Encountered an error playing ' + trailer.trailernumber + ', please try again!'
                }
            });
    };

    $scope.stop = function (trailer) {
        blockUI.start();
        OutboundAPI.stopTrailer(trailer)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $state.reload();
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Encountered an error stopping ' + trailer.trailernumber + ', please try again!'
                    }
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Encountered an error stopping ' + trailer.trailernumber + ', please try again!'
                }
            });
    };

    $scope.manifest = function (trailer) {
        ModalService.showModal({
            templateUrl: 'templates/outbound/dock-management/dialogs/manifest.html',
            controller: function ($scope, $rootScope, OutboundAPI, close, ZuPortal_CONFIG, trailer) {
                $scope.submit = function (trailer) {
                    close($scope.trailer);
                };

                $scope.trailer = angular.copy(trailer);

                $scope.manifestUrl = ZuPortal_CONFIG.ZuDash_URLS.OB_Dock_ManifestURL[$localStorage.locationId];
            },
            inputs: {
                trailer: trailer
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close
                .then(function (result) {
                    if (result) {
                        blockUI.start();
                        OutboundAPI.manifestTrailer(result)
                            .then(function (response) {
                                blockUI.stop();
                                if (+response > 0 && angular.isNumber(+response)) {
                                    $state.reload();
                                } else {
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Encountered an error manifesting ' + result.trailernumber + ', please try again!'
                                    }
                                }
                            }, function (err) {
                                blockUI.stop();
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Encountered an error manifesting ' + result.trailernumber + ', please try again!'
                                }
                            });
                    };
                });
        });
    };

    $scope.depart = function (trailer) {
        ModalService.showModal({
            templateUrl: 'templates/outbound/dock-management/dialogs/depart.html',
            controller: function ($scope, $rootScope, OutboundAPI, close, ZuPortal_CONFIG, trailer) {
                $scope.submit = function (trailer) {
                    close($scope.trailer);
                };

                $scope.trailer = angular.copy(trailer);
            },
            inputs: {
                trailer: trailer
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close
                .then(function (result) {
                    if (result) {
                        blockUI.start();
                        OutboundAPI.departTrailer(result)
                            .then(function (response) {
                                blockUI.stop();
                                if (+response > 0 && angular.isNumber(+response)) {
                                    $state.reload();
                                } else {
                                    $rootScope.changeResponse = {
                                        failure: true,
                                        message: 'Encountered an error departing ' + result.trailernumber + ', please try again!'
                                    }
                                }
                            }, function (err) {
                                blockUI.stop();
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Encountered an error departing ' + result.trailernumber + ', please try again!'
                                }
                            });
                    };
                });
        });
    }
})

.controller('InvalidLog', function ($scope, $rootScope, $cookies, blockUI, OutboundAPI, EmployeesAPI, $state, SCAN_EVENT) {
    blockUI.start();
    EmployeesAPI.getRoster()
        .then(function (res) {
            if (angular.isArray(res)) {
                $scope.associates = res;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Roster!'
            };
        });

    $scope.form = {
        assocId: {
            value: null,
            required: true
        },
        verifyId: {
            value: null,
            required: true
        },
        pslip: {
            value: false,
            required: true
        },
        shipmentId: {
            value: null,
            required: false
        },
        orderSwap: {
            value: false,
            required: true
        },
        wrongShipmentId: {
            value: null,
            required: false
        }
    };

    var backup = angular.copy($scope.form);

    $scope.$watch('form', function (n, o) {
        var valid = true;
        angular.forEach(n, function (a, q) {
            if (a.required && a.value == null) valid = false;
        })

        $scope.valid = valid;
    }, true)

    $scope.selectAssociate = function (associate) {
        $scope.searchTerm = null;
        $scope.selectedAssociate = associate;
        $scope.form.assocId.value = associate.wmsId;
    };

    $scope.submit = function (form) {
        blockUI.start();
        OutboundAPI.invalidLogEntry(form)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $scope.form = angular.copy(backup);
                    $scope.selectedAssociate = null;

                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Invalid logged successfully'
                    };
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: response.Error
                    };
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An error occured while submitting invalid.'
                }
            });
    };
})

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

.controller('CrossTrainingRoster', function ($scope, $rootScope, ZuReportsAPI, uiGridConstants, $state, blockUI, $localStorage) {
    $scope.update = function (wmsid, trainingValue, col) {
        ZuReportsAPI.crossTrainingUpdate(wmsid, trainingValue, col.split('-'))
            .then(function (response) {
                $rootScope.changeResponse = {};
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse.message = 'Associate updated successfully!';
                    $rootScope.changeResponse.success = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.success = false;
                    }, 1000);
                } else {
                    $rootScope.changeResponse.message = 'An error occured while updated the associate!';
                    $rootScope.changeResponse.failure = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.failure = false;
                    }, 1000);
                }
            }, function (err) {
                $rootScope.changeResponse.message = 'An error occured while updated the associate!';
                $rootScope.changeResponse.failure = true;
                setTimeout(function () {
                    $rootScope.changeResponse.failure = false;
                }, 1000);
            });
    };

    $scope.colFilters = {};

    $scope.visibleCols = {};

    $scope.filterCols = function (title, cols) {
        var visible = $scope.visibleCols[title];
        $scope.visibleCols[title] = !visible;
        cols.forEach(function (col, i) {
            $scope.gridOptions.columnDefs[col].visible = !visible;
        });
        $scope.gridApi.grid.refresh();
    };

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [100, 200, 300, 400, 500, 1000, 2000],
        paginationPageSize: 2000,
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'CrossTrainingRoster.csv',
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            { name: 'fullName', width: 150, displayName: 'Name', pinnedLeft: true },
            { name: 'func', width: 150, displayName: 'Home Function', pinnedLeft: true },
            { name: 'shift', width: 150, displayName: 'Shift', pinnedLeft: true },
            { name: 'type', width: 150, displayName: 'Employer', pinnedLeft: true }
        ]
    };
    $scope.departments = {};
    ZuReportsAPI.crossTrainingProcesses()
        .then(function (getProcessesData) {
            getProcessesData.forEach(function (department, d) {
                if (angular.isArray($scope.colFilters[department.mainDepartment])) {
                    $scope.colFilters[department.mainDepartment].push($scope.gridOptions.columnDefs.length);
                } else {
                    $scope.colFilters[department.mainDepartment] = [$scope.gridOptions.columnDefs.length];
                }
                $scope.visibleCols[department.mainDepartment] = true;
                var concatInfo = department.mainDepartment + '-' + department.subDepartment + '-' + department.subProcess;
                $scope.departments[concatInfo] = false;
                $scope.gridOptions.columnDefs.push({
                    name: concatInfo,
                    width: 170,
                    visible: true,
                    displayName: department.mainDepartment + '<br>' + department.subDepartment + '-' + department.subProcess,
                    headerCellTemplate: '<div ng-class="{\'sortable\': sortable}" class="' + department.mainDepartment + '"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span ng-bind-html="col.displayName | sanitize"></span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
                    enablePinning: false,
                    cellTemplate: '<label ng-class="{\'btn btn-default\': !row.entity[col.name], \'btn btn-success\' : row.entity[col.name]}"><input type="checkbox" ng-model="row.entity[col.name]" ng-checked="{{ row.entity[col.name] }}" ng-click="grid.appScope.update(row.entity.wmsid, row.entity[col.name], col.name)" style="display: none;"/></label>',
                    filter: {
                        noTerm: true,
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: [{ value: true, label: 'Trained' }, { value: false, label: 'Not Trained' }]
                    }
                });
            });
        }, function (error) {
            //TODO need to add error handling.
        });

    $scope.getDepartment = function () {
        if ($scope.departmentSelect) {
            ZuReportsAPI.crossTrainingRoster($scope.departmentSelect, $scope.shiftSelect)
                .then(function (getAssociatesData) {
                    $scope.gridOptions.data = [];
                    getAssociatesData.forEach(function (associate, a) {
                        if (associate.trained != null) {
                            associateTrainedObject = angular.copy(associate.trained.split(','));
                        } else {
                            associateTrainedObject = [];
                        };

                        var shifts = {
                            1: {
                                ICQA: {
                                    1: {
                                        A: 'gray',
                                        B: 'brown',
                                        C: 'purple',
                                        F: 'green',
                                        G: 'green'
                                    },
                                    2: {
                                        A: 'blue',
                                        B: 'black',
                                        C: 'yellow',
                                        F: 'green',
                                        G: 'green'
                                    }
                                },
                                Inbound: {
                                    1: {
                                        A: 'lightpurple',
                                        B: 'orange',
                                        C: 'yellow',
                                        F: 'brown',
                                        G: 'brown'
                                    },
                                    2: {
                                        A: 'blue',
                                        B: 'black',
                                        C: 'green',
                                        F: 'brown',
                                        G: 'brown'
                                    }
                                },
                                Outbound: {
                                    1: {
                                        A: 'pink',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow'
                                    },
                                    2: {
                                        A: 'gray',
                                        B: 'purple',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow'
                                    }
                                },
                                Zebra: {
                                    1: {
                                        A: 'orange',
                                        B: 'orange',
                                        C: 'orange',
                                        F: 'orange',
                                        G: 'yellow'
                                    },
                                    2: {
                                        A: 'orange',
                                        B: 'orange',
                                        C: 'orange',
                                        F: 'orange',
                                        G: 'orange'
                                    }
                                },
                                Support: {
                                    1: {
                                        A: 'pink',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow'
                                    },
                                    2: {
                                        A: 'gray',
                                        B: 'purple',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow'
                                    }
                                }
                            },
                            2: {
                                ICQA: {
                                    1: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'purple',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    },
                                    2: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    }
                                },
                                Inbound: {
                                    1: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'purple',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    },
                                    2: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    }
                                },
                                Outbound: {
                                    1: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'purple',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    },
                                    2: {
                                        A: 'blue',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    }
                                },
                                Zebra: {
                                    1: {
                                        A: 'orange',
                                        B: 'orange',
                                        C: 'orange',
                                        F: 'orange',
                                        G: 'orange',
                                        W: 'black'
                                    },
                                    2: {
                                        A: 'orange',
                                        B: 'orange',
                                        C: 'orange',
                                        F: 'orange',
                                        G: 'orange',
                                        W: 'black'
                                    }
                                },
                                Support: {
                                    1: {
                                        A: 'pink',
                                        B: 'red',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    },
                                    2: {
                                        A: 'gray',
                                        B: 'purple',
                                        C: 'green',
                                        F: 'yellow',
                                        G: 'yellow',
                                        W: 'black'
                                    }
                                }
                            }
                        };

                        if (associate.department == 'Management') {
                            associate.shiftColor = 'black';
                        } else {
                            associate.shiftColor = shifts[$localStorage.locationId][associate.department][associate.shift.split('')[0]][associate.shift.split('')[1]];
                        };

                        associate = _.extend(associate, angular.copy($scope.departments));
                        associateTrainedObject.forEach(function (trainedArea, t) {
                            associate[trainedArea] = true;
                        });
                    });
                    $scope.gridOptions.data = getAssociatesData;
                }, function (error) {
                    //TODO need to add error handling.
                });
        };
    };

    $scope.createTags = function (selected) {
        if (selected.length) {
            var pages = _.chain(selected).groupBy(function (element, index) {
                return Math.floor(index / 14);
            }).toArray().value();
            $state.go('boardTags', { data: pages });
        } else {
            $rootScope.changeResponse = {
                failure: true,
                message: 'No rows selected!'
            };
        }
    };
})

.controller('BoardTags', function ($scope, $stateParams, $state, blockUI) {
    if (!$stateParams.data || !$stateParams.data.length) {
        $state.go('app.404', null, {
            location: false
        });
    };

    $scope.data = $stateParams.data;

    $scope.departments = {
        ICQA: [
            {
                short: 'LEAD',
                long: 'ICQA Lead',
                required: ['ICQA-ICQA-Lead']
            },
            {
                short: 'AR',
                long: 'Amnesty Resolution',
                required: ['ICQA-ICQA-Amnesty Resolution']
            },
            {
                short: 'CC',
                long: 'Cycle Count',
                required: ['ICQA-ICQA-Cycle Count']
            },
            {
                short: 'JP',
                long: 'Jack Pot',
                required: ['ICQA-ICQA-Jack Pot']
            },
            {
                short: 'PA',
                long: 'Pack Audits',
                required: ['ICQA-ICQA-Pack Audits']
            },
            {
                short: 'PE',
                long: 'Pick Exceptions',
                required: ['ICQA-ICQA-Pick Exceptions']
            },
            {
                short: 'PS',
                long: 'Problem Solving',
                required: ['ICQA-ICQA-Problem Solving']
            },
            {
                short: 'RA',
                long: 'Recv Audits',
                required: ['ICQA-ICQA-Recv Audits']
            },
            {
                short: 'SE',
                long: 'Stow Exceptions',
                required: ['ICQA-ICQA-Stow Exceptions']
            },
            {
                short: 'T',
                long: 'Tickets',
                required: ['ICQA-ICQA-Tickets']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Pack',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'DOCK',
                long: 'Dock Crew',
                required: ['Outbound-Pack-Dock Crew', 'Outbound-Pack-Dock Clerk']
            }
        ],
        Inbound: [
            {
                short: 'PICK',
                long: 'Picking',
                required: ['Outbound-Pick-Picker', 'Outbound-Pick-Lead']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'IC',
                long: 'Any IC Function',
                required: ['ICQA-ICQA-Amnesty Resolution', 'ICQA-ICQA-Cycle Count', 'ICQA-ICQA-Jack Pot', 'ICQA-ICQA-Pack Audits', 'ICQA-ICQA-Pick Exceptions', 'ICQA-ICQA-Problem Solving', 'ICQA-ICQA-Recv Audits', 'ICQA-ICQA-Stow Exceptions', 'ICQA-ICQA-Tickets']
            },
            {
                short: 'ZBR',
                long: 'Zebra',
                required: ['Zebra-ZEBRA-General']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'LEAD',
                long: 'Inbound Lead',
                required: ['Inbound-Arrivals-Lead', 'Inbound-Receiving-Lead']
            },
            {
                short: 'zuISS',
                long: 'Inbound Support Specialist ',
                required: ['Inbound-zuISS-zuISS']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'PREP',
                long: 'Receiving Prep',
                required: ['Inbound-Receiving-Prep']
            },
            {
                short: 'NCR',
                long: 'Non-Con Receiving',
                required: ['Inbound-Receiving-Non-Con RCV']
            },
            {
                short: 'PR',
                long: 'Pallet Receiving',
                required: ['Inbound-Receiving-Pallet RCV']
            },
            {
                short: 'PC',
                long: 'POD Captian',
                required: ['Inbound-Receiving-POD Captian']
            },
            {
                short: 'LR',
                long: 'Line Runner',
                required: ['Inbound-Receiving-Line Runner']
            },
            {
                short: 'RTN',
                long: 'Returns',
                required: ['Inbound-Receiving-Returns']
            }
        ],
        Maintenance: [
            {
                short: 'SPS',
                long: 'Singles Problem Solve',
                required: ['Outbound-Pack-Singles Problem Solve']
            },
            {
                short: 'PWPS',
                long: 'Putwall Problem Solve',
                required: ['Outbound-Pack-Putwall Problem Solve']
            },
            {
                short: 'LEAD',
                long: 'Pick Lead OR Pack Lead',
                required: ['Outbound-Pack-Lead', 'Outbound-Pick-Lead']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'IC',
                long: 'Any IC Function',
                required: ['ICQA-ICQA-Amnesty Resolution', 'ICQA-ICQA-Cycle Count', 'ICQA-ICQA-Jack Pot', 'ICQA-ICQA-Pack Audits', 'ICQA-ICQA-Pick Exceptions', 'ICQA-ICQA-Problem Solving', 'ICQA-ICQA-Recv Audits', 'ICQA-ICQA-Stow Exceptions', 'ICQA-ICQA-Tickets']
            },
            {
                short: 'ZBR',
                long: 'Zebra',
                required: ['Zebra-ZEBRA-General']
            },
            {
                short: 'IOL',
                long: 'Inventory in Odd Locations',
                required: ['Outbound-Pack-IOL']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'PICK',
                long: 'Picking',
                required: ['Outbound-Pick-Picker', 'Outbound-Pick-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Pack',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'DOCK',
                long: 'Dock Crew',
                required: ['Outbound-Pack-Dock Crew', 'Outbound-Pack-Dock Clerk']
            },
            {
                short: 'LR',
                long: 'Line Runner',
                required: ['Outbound-Pack-Runner', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'CS',
                long: 'Case Cealer',
                required: ['Outbound-Pack-Case Sealer', 'Outbound-Pack-Lead']
            },
            {
                short: 'LB',
                long: 'Line Backer',
                required: ['Outbound-Pack-Line Backer', 'Outbound-Pack-Lead']
            }
        ],
        Management: [],
        Outbound: [
            {
                short: 'SPS',
                long: 'Singles Problem Solve',
                required: ['Outbound-Pack-Singles Problem Solve']
            },
            {
                short: 'PWPS',
                long: 'Putwall Problem Solve',
                required: ['Outbound-Pack-Putwall Problem Solve']
            },
            {
                short: 'LEAD',
                long: 'Pick Lead OR Pack Lead',
                required: ['Outbound-Pack-Lead', 'Outbound-Pick-Lead']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'IC',
                long: 'Any IC Function',
                required: ['ICQA-ICQA-Amnesty Resolution', 'ICQA-ICQA-Cycle Count', 'ICQA-ICQA-Jack Pot', 'ICQA-ICQA-Pack Audits', 'ICQA-ICQA-Pick Exceptions', 'ICQA-ICQA-Problem Solving', 'ICQA-ICQA-Recv Audits', 'ICQA-ICQA-Stow Exceptions', 'ICQA-ICQA-Tickets']
            },
            {
                short: 'ZBR',
                long: 'Zebra',
                required: ['Zebra-ZEBRA-General']
            },
            {
                short: 'IOL',
                long: 'Inventory in Odd Locations',
                required: ['Outbound-Pack-IOL']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'PICK',
                long: 'Picking',
                required: ['Outbound-Pick-Picker', 'Outbound-Pick-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Pack',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'DOCK',
                long: 'Dock Crew',
                required: ['Outbound-Pack-Dock Crew', 'Outbound-Pack-Dock Clerk']
            },
            {
                short: 'LR',
                long: 'Line Runner',
                required: ['Outbound-Pack-Runner', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'CS',
                long: 'Case Cealer',
                required: ['Outbound-Pack-Case Sealer', 'Outbound-Pack-Lead']
            },
            {
                short: 'LB',
                long: 'Line Backer',
                required: ['Outbound-Pack-Line Backer', 'Outbound-Pack-Lead']
            }
        ],
        Support: [
            {
                short: 'SPS',
                long: 'Singles Problem Solve',
                required: ['Outbound-Pack-Singles Problem Solve']
            },
            {
                short: 'PWPS',
                long: 'Putwall Problem Solve',
                required: ['Outbound-Pack-Putwall Problem Solve']
            },
            {
                short: 'LEAD',
                long: 'Pick Lead OR Pack Lead',
                required: ['Outbound-Pack-Lead', 'Outbound-Pick-Lead']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'IC',
                long: 'Any IC Function',
                required: ['ICQA-ICQA-Amnesty Resolution', 'ICQA-ICQA-Cycle Count', 'ICQA-ICQA-Jack Pot', 'ICQA-ICQA-Pack Audits', 'ICQA-ICQA-Pick Exceptions', 'ICQA-ICQA-Problem Solving', 'ICQA-ICQA-Recv Audits', 'ICQA-ICQA-Stow Exceptions', 'ICQA-ICQA-Tickets']
            },
            {
                short: 'ZBR',
                long: 'Zebra',
                required: ['Zebra-ZEBRA-General']
            },
            {
                short: 'IOL',
                long: 'Inventory in Odd Locations',
                required: ['Outbound-Pack-IOL']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'PICK',
                long: 'Picking',
                required: ['Outbound-Pick-Picker', 'Outbound-Pick-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Pack',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'DOCK',
                long: 'Dock Crew',
                required: ['Outbound-Pack-Dock Crew', 'Outbound-Pack-Dock Clerk']
            },
            {
                short: 'LR',
                long: 'Line Runner',
                required: ['Outbound-Pack-Runner', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'CS',
                long: 'Case Cealer',
                required: ['Outbound-Pack-Case Sealer', 'Outbound-Pack-Lead']
            },
            {
                short: 'LB',
                long: 'Line Backer',
                required: ['Outbound-Pack-Line Backer', 'Outbound-Pack-Lead']
            }
        ],
        Zebra: [
            {
                short: 'PICK',
                long: 'Picking',
                required: ['Outbound-Pick-Picker', 'Outbound-Pick-Lead']
            },
            {
                short: 'SP',
                long: 'Singles Pack',
                required: ['Outbound-Pack-S Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PWP',
                long: 'Putwall Pack',
                required: ['Outbound-Pack-Pw Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'NCP',
                long: 'Non-Con Pack',
                required: ['Outbound-Pack-Nc Pack', 'Outbound-Pack-Lead']
            },
            {
                short: 'PUT',
                long: 'Putwall Put',
                required: ['Outbound-Pack-Put', 'Outbound-Pack-Lead']
            },
            {
                short: 'IC',
                long: 'Any IC Function',
                required: ['ICQA-ICQA-Amnesty Resolution', 'ICQA-ICQA-Cycle Count', 'ICQA-ICQA-Jack Pot', 'ICQA-ICQA-Pack Audits', 'ICQA-ICQA-Pick Exceptions', 'ICQA-ICQA-Problem Solving', 'ICQA-ICQA-Recv Audits', 'ICQA-ICQA-Stow Exceptions', 'ICQA-ICQA-Tickets']
            },
            {
                short: 'OP',
                long: 'Order Picker',
                required: ['General-PIT-Orderpicker']
            },
            {
                short: 'TDR',
                long: 'Trailer Dock & Release',
                required: ['General-TDR-Auditor', 'General-TDR-Lead', 'General-TDR-Spotter']
            },
            {
                short: 'LEAD',
                long: 'Zebra Lead',
                required: ['Inbound-Arrivals-Lead', 'Inbound-Receiving-Lead']
            },
            {
                short: 'zuISS',
                long: 'Inbound Support Specialist ',
                required: ['Inbound-zuISS-zuISS']
            },
            {
                short: 'ARVL',
                long: 'Arrivals',
                required: ['Inbound-Arrivals-Arriver']
            },
            {
                short: 'RCV',
                long: 'Receiving',
                required: ['Inbound-Receiving-Receiver']
            },
            {
                short: 'STOW',
                long: 'Stow',
                required: ['Inbound-Stow-Stower']
            },
            {
                short: 'PREP',
                long: 'Receiving Prep',
                required: ['Inbound-Receiving-Prep']
            },
            {
                short: 'NCR',
                long: 'Non-Con Receiving',
                required: ['Inbound-Receiving-Non-Con RCV']
            },
            {
                short: 'PR',
                long: 'Pallet Receiving',
                required: ['Inbound-Receiving-Pallet RCV']
            },
            {
                short: 'PC',
                long: 'POD Captian',
                required: ['Inbound-Receiving-POD Captian']
            },
            {
                short: 'LR',
                long: 'Line Runner',
                required: ['Inbound-Receiving-Line Runner']
            },
            {
                short: 'RTN',
                long: 'Returns',
                required: ['Inbound-Receiving-Returns']
            }
        ]

    };

    $scope.associateHas = function (associate, required) {
        var has = false;
        required.forEach(function (cap) {
            if (associate[cap]) has = true;
        });

        return has;
    };
})

.controller('TransferRequests', function ($scope, $rootScope, ZuReportsAPI, uiGridConstants) {
    $scope.status = {
        approved: false,
        pending: true,
        rejected: false
    };
    $scope.getData = function () {
        var search = '';
        if ($scope.status.approved || $scope.status.pending || $scope.status.rejected) {
            if ($scope.status.approved) {
                search += ',\'Approved\'';
            };
            if ($scope.status.pending) {
                search += ',\'Pending\'';
            };
            if ($scope.status.rejected) {
                search += ',\'Rejected\'';
            };
            search = search.substr(1, search.length);
        } else {
            search = '\'Pending\'';
        }
        ZuReportsAPI.transferRequests(search)
            .then(function (data) {
                $scope.gridOptions.data = data;
            }, function (err) {
                //TODO need to add error handling.
            });
    };
    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'TransferRequests.csv',
        exporterSuppressColumns: ['updateSingle'],
        rowHeight: 40,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            { name: 'fullName', displayName: 'Full Name', pinnedLeft: true },
            {
                name: 'hireDate',
                displayName: 'Hire Date',
                cellFilter: 'date:\'short\'',
            },
            { name: 'type', displayName: 'Employer' },
            { name: 'currentShift', displayName: 'Shift' },
            { name: 'currentDepartment', displayName: 'Department' },
            { name: 'requestedShift', displayName: 'Req. Shift' },
            { name: 'requestedDepartment', displayName: 'Req. Department' },
            {
                name: 'status',
                displayName: 'Status',
                cellTemplate: '<select class="form-control" ng-model="row.entity.status"><option>Approved</otpion><option>Pending</otpion><option>Rejected</otpion></select>'
            },
            {
                name: 'notes',
                displayName: 'Notes',
                cellTemplate: '<textarea style="height: 90% !important" class="form-control" ng-model="row.entity.notes"></textarea>'
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                enableFiltering: false
            },
            {
                name: 'updateSingle',
                displayName: 'Update',
                width: 200,
                enableFiltering: false,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span><div class="btn-group"><label ng-class="{\'btn btn-default\': !grid.appScope.selectedAll, \'btn btn-info\' : grid.appScope.selectedAll}"><input type="checkbox" ng-model="grid.appScope.selectedAll" ng-click="grid.appScope.selectAll()" ng-hide="true"/>Select<br>All</label><button class="btn btn-success" onclick="return false;" ng-click="grid.appScope.updateSelected(grid.options.data)">Update<br>All</button></div></span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
                cellTemplate: '<div class="btn-group"><label ng-class="{\'btn btn-default\': !row.entity.checked, \'btn btn-info\' : row.entity.checked}" class="btn btn-default"><input ng-model="row.entity.checked" type="checkbox" ng-hide="true"/>Select</label><button onclick="return false;" class="btn btn-success" ng-click="grid.appScope.singleUpdate(row.entity, grid)">Update</button></div>',
                enableSorting: false
            }
        ]
    };
    $scope.singleUpdate = function (transferInfo) {
        ZuReportsAPI.transferRequestSingleUpdate(transferInfo.entryId, transferInfo.status, transferInfo.notes)
            .then(function (response) {
                $rootScope.changeResponse = {};
                if (+response > 0 && angular.isNumber(+response)) {
                    var index = $scope.gridOptions.data.indexOf(transferInfo);
                    $scope.gridOptions.data.splice(index, 1);
                    $rootScope.changeResponse.message = 'Transfer updated successfully!';
                    $rootScope.changeResponse.success = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.success = false;
                    }, 1000);
                } else {
                    $rootScope.changeResponse.message = 'An error occured while updated the transfer!';
                    $rootScope.changeResponse.failure = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.failure = false;
                    }, 1000);
                }
            }, function (err) {
                $rootScope.changeResponse = {};
                $rootScope.changeResponse.message = 'An error occured while updated the transfer!';
                $rootScope.changeResponse.failure = true;
                setTimeout(function () {
                    $rootScope.changeResponse.failure = false;
                }, 1000);
            });
    };
    $scope.selectAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        $scope.gridOptions.data.forEach(function (item) {
            item.checked = $scope.selectedAll;
        });
    };
    $scope.updateSelected = function (data) {
        if (data.length == 0) {
            return;
        }
        data.forEach(function (row, r) {
            if (row.checked) {
                $scope.singleUpdate(row);
            }
        })
    };
})

.controller('VTO-VOTReport', function ($scope, $rootScope, ZuReportsAPI, uiGridConstants) {
    $scope.reportType = '';
    $scope.departmentSelect = '';
    $scope.shiftSelect = '';
    $scope.isOpen = false;
    $scope.selectedDate = '';
    $scope.openCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.isOpen = true;
    };
    $scope.getReport = function () {
        var department = angular.copy($scope.departmentSelect), shift = angular.copy($scope.shiftSelect);
        if ($scope.reportType != '' && $scope.selectedDate != '') {
            if (department == '') {
                department = 'All';
            };
            if (shift == '') {
                shift = 'All';
            };
            ZuReportsAPI.vot_vtoReport(department, shift, $scope.reportType, $scope.selectedDate)
                .then(function (data) {
                    $scope.gridOptions.data = data;
                }, function (err) {
                });
        }
    };
    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [100, 200, 300, 400, 500, 1000],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        showGridFooter: true,
        showColumnFooter: true,
        exporterCsvFilename: $scope.reportType + 'Report.csv',
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            { name: 'fullName', displayName: 'Full Name' },
            {
                name: 'hireDate',
                displayName: 'Hire Date',
                cellFilter: 'date:\'MM/dd/yyyy\''
            },
            { name: 'type', displayName: 'Employer' },
            { name: 'shift', displayName: 'Desired Shift' },
            { name: 'mainDepartment', displayName: 'Department' },
            { name: 'subDepartment', displayName: 'Sub Department' },
            {
                name: 'selectedDate',
                displayName: 'Date',
                cellFilter: 'date:\'MM/dd/yyyy\''
            },
            {
                name: 'desiredHours',
                displayName: 'Hours',
                aggregationType: uiGridConstants.aggregationTypes.sum
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date:\'MM/dd/yyyy HH:mm:ss\''
            }
        ]
    };
})

.controller('HighFiveReview', function ($scope, $rootScope, ZuReportsAPI, uiGridConstants, ModalService) {
    $scope.expandDescription = function (row) {
        ModalService.showModal({
            template: '<div class="modal" ng-class="{\'animated bounceInDown\' : !exit, \'animated bounceOutUp\' : exit}">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">High Five Description for {{ fullData.nomineeName }}</h4> </div>\n            <div class="modal-body">\n                <p><b>Submitted By: </b> {{ fullData.submitterName }}</p>\n                <p><b>zulily Value: </b> {{ zulilyValues[fullData.zulilyValue].longName }}</p>\n                <textarea ng-model="editedDescription" class="form-control" style="height: 100%; width: 100%; font-size: 20px;" rows="12"></textarea>\n                <select class="form-control" ng-model="status"><option>Approved</otpion><option>Pending</otpion><option>Rejected</otpion></select>\n            </div>\n            <div class="modal-footer">\n                <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button>\n                <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal" ng-disabled="originalDescription == editedDescription && originalStatus == status">Save</button>\n            </div>\n        </div>\n    </div>\n</div>\n',
            controller: function ($scope, $rootScope, hfData, close) {
                $scope.zulilyValues = {
                    color: { color: "#CA5DA5", longName: "COLOR OUTSIDE THE LINES" },
                    embrace: { color: "#B7D46C", longName: "EMBRACE CHANGE" },
                    impossible: { color: "#FE6B32", longName: "MAKE THE IMPOSSIBLE HAPPEN" },
                    ownership: { color: "#F3BC42", longName: "TAKE OWNERSHIP" },
                    work: { color: "#708BC0", longName: "WE WORK FOR MOM" }
                };
                $scope.fullData = hfData;
                $scope.exit = false;
                $scope.originalDescription = angular.copy(hfData.reasonDescription)
                $scope.editedDescription = hfData.reasonDescription;
                $scope.originalStatus = angular.copy(hfData.status);
                $scope.status = hfData.status
                $scope.save = function () {
                    $scope.exit = true;
                    close({ description: $scope.editedDescription, status: $scope.status });
                };
                $scope.cancel = function () {
                    $scope.exit = true;
                    close($scope.originalDescription);
                };
            },
            inputs: {
                hfData: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                row.reasonDescription = result.description;
                row.status = result.status;
                row.checked = true;
            });
        });
    };
    $scope.zulilyValues = {
        color: { color: "#CA5DA5", longName: "COLOR OUTSIDE THE LINES" },
        embrace: { color: "#B7D46C", longName: "EMBRACE CHANGE" },
        impossible: { color: "#FE6B32", longName: "MAKE THE IMPOSSIBLE HAPPEN" },
        ownership: { color: "#F3BC42", longName: "TAKE OWNERSHIP" },
        work: { color: "#708BC0", longName: "WE WORK FOR MOM" }
    };
    $scope.status = {
        approved: false,
        pending: true,
        rejected: false
    };
    $scope.getData = function () {
        var search = '';
        if ($scope.status.approved || $scope.status.pending || $scope.status.rejected) {
            if ($scope.status.approved) {
                search += ',\'Approved\'';
            };
            if ($scope.status.pending) {
                search += ',\'Pending\'';
            };
            if ($scope.status.rejected) {
                search += ',\'Rejected\'';
            };
            search = search.substr(1, search.length);
        } else {
            search = '\'Pending\'';
        }
        ZuReportsAPI.highFiveReview(search)
            .then(function (data) {
                $scope.gridOptions.data = data;
            }, function (err) {
                //TODO need to add error handling.
            });
    };
    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'HighFiveReview.csv',
        exporterSuppressColumns: ['updateSingle'],
        rowHeight: 40,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'nomineeName',
                pinnedLeft: true,
                width: 150,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Nominee<br>Name</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'nomineeShift',
                pinnedLeft: true,
                width: 80,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Nominee<br>Shift</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'nomineeFunction',
                pinnedLeft: true,
                width: 100,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Nominee<br>Department</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'nomineeHireDate',
                cellFilter: 'date:\'MM/dd/yyyy\'',
                pinnedLeft: true,
                width: 150,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Nominee<br>Hire Date</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'submitterName',
                width: 150,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Submitter<br>Name</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'submitterShift',
                width: 80,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Submitter<br>Shift</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'submitterFunction',
                width: 100,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Submitter<br>Department</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'submitterHireDate',
                width: 150,
                cellFilter: 'date:\'MM/dd/yyyy\'',
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span>Submitter<br>Hire Date</span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
            },
            {
                name: 'zulilyValue',
                displayName: 'Zulily Value',
                width: 200,
                cellTemplate: '<div class="ui-grid-cell-contents ng-binding ng-scope">{{ grid.appScope.zulilyValues[row.entity.zulilyValue].longName }}</div>'
            },
            {
                name: 'reasonDescription',
                displayName: 'Description',
                width: 150,
                cellTemplate: '<button onclick="return false;" class="btn btn-primary btn-sm" ng-click="grid.appScope.expandDescription(row.entity)">Expand Description</button>'
            },
            {
                name: 'status',
                displayName: 'Status',
                width: 150,
                cellTemplate: '<select class="form-control" ng-model="row.entity.status"><option>Approved</otpion><option>Pending</otpion><option>Rejected</otpion></select>'
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                width: 150,
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                enableFiltering: false
            },
            {
                name: 'updateSingle',
                displayName: 'Update',
                width: 200,
                enableFiltering: false,
                headerCellTemplate: '<div ng-class="{\'sortable\': sortable}"> <div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> <span><div class="btn-group"><label ng-class="{\'btn btn-default\': !grid.appScope.selectedAll, \'btn btn-info\' : grid.appScope.selectedAll}"><input type="checkbox" ng-model="grid.appScope.selectedAll" ng-click="grid.appScope.selectAll()" ng-hide="true"/>Select<br>All</label><button class="btn btn-success" onclick="return false;" ng-click="grid.appScope.updateSelected(grid.options.data)">Update<br>All</button></div></span> <span ui-grid-visible="col.sort.direction" ng-class="{\'ui-grid-icon-up-dir\': col.sort.direction==asc, \'ui-grid-icon-down-dir\': col.sort.direction==desc, \'ui-grid-icon-blank\': !col.sort.direction}"> &nbsp; </span> </div><div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !==false" ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="ui-grid-icon-angle-down">&nbsp;</i> </div><div ui-grid-filter></div></div>',
                cellTemplate: '<div class="btn-group" ng-hide="row.entity.tempStatus == \'Approved\'"><label ng-class="{\'btn btn-default\': !row.entity.checked, \'btn btn-info\' : row.entity.checked}" class="btn btn-default"><input ng-model="row.entity.checked" type="checkbox" ng-hide="true"/>Select</label><button onclick="return false;" class="btn btn-success" ng-click="grid.appScope.singleUpdate(row.entity, grid)">Update</button></div>',
                enableSorting: false
            }
        ]
    };
    $scope.singleUpdate = function (highFiveInfo) {
        ZuReportsAPI.highFiveUpdate(highFiveInfo.entryId, highFiveInfo.nomineeName, highFiveInfo.nomineeWmsId, $scope.zulilyValues[highFiveInfo.zulilyValue].longName, highFiveInfo.status, highFiveInfo.reasonDescription)
            .then(function (response) {
                $rootScope.changeResponse = {};
                if (+response > 0 && angular.isNumber(+response)) {
                    var index = $scope.gridOptions.data.indexOf(highFiveInfo);
                    $scope.gridOptions.data.splice(index, 1);
                    $rootScope.changeResponse.message = 'High Five updated successfully!';
                    $rootScope.changeResponse.success = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.success = false;
                    }, 1000);
                } else {
                    $rootScope.changeResponse.message = 'An error occured while updating the High Five!';
                    $rootScope.changeResponse.failure = true;
                    setTimeout(function () {
                        $rootScope.changeResponse.failure = false;
                    }, 1000);
                }
            }, function (err) {
                $rootScope.changeResponse = {};
                $rootScope.changeResponse.message = 'An error occured while updating the High Five!';
                $rootScope.changeResponse.failure = true;
                setTimeout(function () {
                    $rootScope.changeResponse.failure = false;
                }, 1000);
            });
    };
    $scope.selectAll = function () {
        if ($scope.selectedAll) {
            $scope.selectedAll = true;
        } else {
            $scope.selectedAll = false;
        }
        $scope.gridOptions.data.forEach(function (item) {
            if (item.tempStatus != 'Approved') {
                item.checked = $scope.selectedAll;
            }
        });
    };
    $scope.updateSelected = function (data) {
        if (data.length == 0) {
            return;
        }
        data.forEach(function (row, r) {
            if (row.checked) {
                $scope.singleUpdate(row);
            }
        });
    };
})

.controller('DonationsLogReport', function ($scope, $rootScope, $cookies, ZuReportsAPI, uiGridConstants, ModalService) {
    $scope.fromDate = '';
    $scope.fromIsOpen = false;
    $scope.openFromCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.fromIsOpen = true;
    };
    $scope.toDate = '';
    $scope.toIsOpen = false;
    $scope.openToCalendar = function (e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.toIsOpen = true;
    };
    $scope.getReport = function () {
        if ($scope.fromDate == '' || $scope.toDate == '') {
            return;
        } else {
            var fromDate = new Date(angular.copy($scope.fromDate));
            fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
            var toDate = new Date(angular.copy($scope.toDate));
            toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
            ZuReportsAPI.donationsLogReport(fromDate, toDate)
                .then(function (data) {
                    $scope.gridOptions.data = data;
                }, function (err) {
                    //TODO need to add error handling.
                });
        };
    };
    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'DonationsLogReport.csv',
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'fullName',
                displayName: 'Name',
                width: 150,
            }, {
                name: 'shift',
                displayName: 'Shift',
                width: 150,
            }, {
                name: 'func',
                displayName: 'Department',
                width: 150,
            }, {
                name: 'type',
                displayName: 'Employer',
                width: 150,
            }, {
                name: 'area',
                displayName: 'Bldg. Area',
                width: 150,
            }, {
                name: 'origin',
                displayName: 'Origin Dept.',
                width: 150,
            }, {
                name: 'skuNumber',
                displayName: 'SKU',
                width: 150,
            }, {
                name: 'skuQuantity',
                displayName: 'Quantity',
                width: 150,
            }, {
                name: 'skuPrice',
                displayName: 'Price Each',
                width: 150,
            }, {
                name: 'skuLocation',
                displayName: 'Location',
                width: 150,
            }, {
                name: 'ticketNumber',
                displayName: 'ticketNumber',
                width: 150,
            }, {
                name: 'donateReason',
                displayName: 'Donate Reason',
                width: 150,
            }, {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                width: 150,
            }
        ]
    };
})

.controller('AIRReport', function ($scope, $rootScope, $cookies, ZuReportsAPI, uiGridConstants, blockUI, ModalService, ZuPortal_CONFIG) {
    $scope.fromDate = '';

    $scope.toDate = '';

    $rootScope.changeResponse = {};

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'AIRReport.csv',
        exporterSuppressColumns: ['imageLinks', 'mTools', 'print'],
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'entryid',
                displayName: 'ID',
                width: 50,
                pinnedLeft: true
            }, {
                name: 'typeOfIncident',
                displayName: 'Type of Incident',
                width: 150,
            }, {
                name: 'enteredBy',
                displayName: 'Entered By',
                width: 150,
            }, {
                name: 'assocInfo',
                displayName: 'Associate Info',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandInfo(row.entity.assocInfo, row.entity.assocInfo != null)" ng-if="row.entity.assocInfo != null">Expand</button>',
                width: 150,
            }, {
                name: 'nonEmployeeInfo',
                displayName: 'Non Employee Info',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandInfo(row.entity.nonEmployeeInfo, row.entity.assocInfo != null)" ng-if="row.entity.nonEmployeeInfo != null">Expand</button>',
                width: 150,
            }, {
                name: 'dateTimeOfIncident',
                displayName: 'DateTime of Incident',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                width: 150,
            }, {
                name: 'dateTimeIncidentReported',
                displayName: 'DateTime Reported',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                width: 150,
            }, {
                name: 'areaOfIncident',
                displayName: 'Area',
                width: 150,
            }, {
                name: 'painLevel',
                displayName: 'Pain Level',
                width: 150,
            }, {
                name: 'previousInjury',
                displayName: 'Previous Injury',
                width: 150,
            }, {
                name: 'previousInjuryDate',
                displayName: 'Previous Injury Date',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                width: 150,
            }, {
                name: 'objInvolved',
                displayName: 'Object Involved',
                width: 150,
            }, {
                name: 'objInvolvedWht',
                displayName: 'Object Weight',
                cellFilter: 'lbs',
                width: 150,
            }, {
                name: 'objInvolvedDesc',
                displayName: 'Object Desc.',
                width: 150,
            }, {
                name: 'medclAttn',
                displayName: 'Medical Attention',
                width: 150,
            }, {
                name: 'medclAttnDesc',
                displayName: 'Medical Desc.',
                width: 150,
            }, {
                name: 'medclAttnProvided',
                displayName: 'Medical Type',
                width: 150,
            }, {
                name: 'typeOfAction',
                displayName: 'Type Of Action',
                width: 150,
            }, {
                name: 'typeOfInjury',
                displayName: 'Type Of Injury',
                width: 150,
            }, {
                name: 'bodypart',
                displayName: 'Body Part',
                width: 150,
            }, {
                name: 'statusOfAssoc',
                displayName: 'Status of Assoc',
                width: 150,
            }, {
                name: 'witnesses',
                displayName: 'Witnesses',
                width: 150,
            }, {
                name: 'eqmntInvolved',
                displayName: 'Eqmt Involved',
                width: 150,
            }, {
                name: 'eqmntDesc',
                displayName: 'Eqmt Desc.',
                width: 150,
            }, {
                name: 'drugTested',
                displayName: 'Drug Tested',
                width: 150,
            }, {
                name: 'pptyDmg',
                displayName: 'Property Dmg.',
                width: 150,
            }, {
                name: 'pptyDmgDesc',
                displayName: 'Ppty. Dmg. Desc.',
                width: 150,
            }, {
                name: 'descOfInc',
                displayName: 'Descritpion Of Inc.',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandBigFive(row.entity, col.name, col.displayName)" title="{{ col.displayName }}" >Expand</button>',
                width: 150,
            }, {
                name: 'unsafeBehavior',
                displayName: 'Unsafe Behavior',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandBigFive(row.entity, col.name, col.displayName)" title="{{ col.displayName }}" >Expand</button>',
                width: 150,
            }, {
                name: 'unsafeCondition',
                displayName: 'Unsafe Condition',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandBigFive(row.entity, col.name, col.displayName)" title="{{ col.displayName }}" >Expand</button>',
                width: 150,
            }, {
                name: 'rootCause',
                displayName: 'Root Cause',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandBigFive(row.entity, col.name, col.displayName)" title="{{ col.displayName }}" >Expand</button>',
                width: 150,
            }, {
                name: 'actionPlan',
                displayName: 'Action Plan',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandBigFive(row.entity, col.name, col.displayName)" title="{{ col.displayName }}" >Expand</button>',
                width: 150,
            }, {
                name: 'imageLinks',
                displayName: 'Images',
                cellTemplate: '<button onclick="return false;" class="btn btn-info btn-sm" ng-click="grid.appScope.expandImages(row.entity.imageLinks)" ng-if="row.entity.imageLinks.length > 2">Images</button>',
                width: 150,
            }, {
                name: 'followUpFinished',
                displayName: 'Follow Up',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.followUpFinished ? "Finished" : "Outstanding" }}</div>',
                width: 100,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Finished' }, { value: 0, label: 'Outstanding' }]
                },
                pinnedLeft: true
            }, {
                name: 'isRecordable',
                displayName: 'Recordable',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.isRecordable ? "Yes" : "No" }}</div>',
                width: 100,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
                },
                pinnedLeft: true
            }, {
                name: 'transfer',
                displayName: 'Job Transfer',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Job<br>Transfer</div><div ui-grid-filter></div>',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.transfer ? "Yes" : "No" }}</div>',
                width: 80,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
                },
                pinnedLeft: true
            }, {
                name: 'restricted',
                displayName: 'Restricted Duty',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Restricted<br>Duty</div><div ui-grid-filter></div>',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.restricted ? "Yes" : "No" }}</div>',
                width: 90,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
                },
                pinnedLeft: true
            }, {
                name: 'medicalOnly',
                displayName: 'Medical Only',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Medical<br>Only</div><div ui-grid-filter></div>',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.medicalOnly ? "Yes" : "No" }}</div>',
                width: 80,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
                },
                pinnedLeft: true
            }, {
                name: 'lostTime',
                displayName: 'Lost Time',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Lost<br>Time</div><div ui-grid-filter></div>',
                cellTemplate: '<div class="ui-grid-cell-contents">{{ row.entity.lostTime ? "Yes" : "No" }}</div>',
                width: 60,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }]
                },
                pinnedLeft: true
            }, {
                name: 'mTools',
                displayName: 'Manager Tools',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Manager<br>Tools</div>',
                cellTemplate: '<button class="btn btn-info btn-sm" ng-click="grid.appScope.managerTools(row.entity)">Manage</button>',
                width: 80,
                pinnedLeft: true
            }, {
                name: 'print',
                displayName: 'Print',
                headerCellTemplate: '<div class="ui-grid-cell-contents">Print</div>',
                cellTemplate: '<a class="btn btn-info btn-sm" ng-href="' + ZuPortal_CONFIG.ZuDash_URLS.APIURL + '/requests/AIRPrint.aspx?airId={{row.entity.entryid}}" target="_blank">Print</a>',
                width: 50,
                pinnedLeft: true
            }, {
                name: 'employer',
                displayName: 'Employer',
                width: 150,
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: []
                },
                pinnedLeft: true
            }, {
                name: 'currentDate',
                displayName: 'Date Recorded',
                cellFilter: 'date:\'MM/dd/yy h:mma\'',
                width: 150,
            }
        ]
    };

    $scope.getReport = function () {
        if ($scope.fromDate == '' || $scope.toDate == '') {
            return;
        } else {
            blockUI.start();
            var fromDate = new Date(angular.copy($scope.fromDate));
            fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
            var toDate = new Date(angular.copy($scope.toDate));
            toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
            ZuReportsAPI.airReport(fromDate, toDate)
                .then(function (data) {
                    $scope.gridOptions.data = data;

                    $scope.gridOptions.columnDefs[41].filter.selectOptions = _.uniq(employers, function (item, key) { return item.value.toLowerCase() });
                    $scope.gridApi.grid.refresh();
                    blockUI.stop();
                }, function (err) {
                    blockUI.stop();
                });
        };
    };

    $scope.expandInfo = function (infoArray, isAssoc) {
        var info = infoArray.split(',');

        ModalService.showModal({
            templateUrl: 'templates/dialogs/expandInfo.html',
            controller: function ($scope, $rootScope, info, isAssoc, close) {
                $scope.isAssoc = isAssoc;

                if (isAssoc) {
                    $scope.assocInfo = {
                        fullName: info[1] + ', ' + info[0],
                        shift: info[2],
                        func: info[3],
                        kronosId: info[4],
                        type: info[5],
                        hireDate: info[6],
                        picLink: info[7]
                    };
                } else {
                    $scope.nonEmployeeInfo = {
                        firstName: info[0],
                        lastName: info[1],
                        company: info[2]
                    };
                };
            },
            inputs: {
                info: info,
                isAssoc: isAssoc
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.expandBigFive = function (row, col, colName) {
        ModalService.showModal({
            templateUrl: 'templates/dialogs/expandBigFive.html',
            controller: function ($scope, $rootScope, data, title, close) {
                $scope.data = data;

                $scope.title = title;
            },
            inputs: {
                title: colName,
                data: row[col]
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.expandImages = function (imageArray) {
        var images = imageArray.split(',');
        ModalService.showModal({
            templateUrl: 'templates/dialogs/expandImages.html',
            controller: function ($scope, $rootScope, images, close) {
                $scope.slides = [];

                images.forEach(function (image, i) {
                    $scope.slides.push({
                        image: image
                    })
                })
            },
            inputs: {
                images: images
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.managerTools = function (row) {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Manager Tools</h4>\n            </div>\n            <div class="modal-body" style="text-align: center">\n                <uib-tabset>\n                    <uib-tab heading="Follow-Up">\n                        <h4>Follow-Up Finished?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.followUp ,\'btn btn-info btn-sm\' : airData.followUp}">\n                            <input type="checkbox" ng-model="airData.followUp" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <hr/>\n                        <h4>Follow-Up Comments</h4>\n                        <textarea class="form-control" ng-model="airData.followUpComments" placeholder="Follow-Up Comments" rows="10"></textarea>\n                    </uib-tab>\n                    <uib-tab heading="Misc. OSHA">\n                        <h4>Is Recordable?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.isRecordable ,\'btn btn-info btn-sm\' : airData.isRecordable}">\n                            <input type="checkbox" ng-model="airData.isRecordable" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <hr>\n                        <h4>Restricted Duty?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.restricted ,\'btn btn-info btn-sm\' : airData.restricted}">\n                            <input type="checkbox" ng-model="airData.restricted" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <hr>\n                        <h4>Job Tranfer?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.transfer ,\'btn btn-info btn-sm\' : airData.transfer}">\n                            <input type="checkbox" ng-model="airData.transfer" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                    </uib-tab>\n                    <uib-tab heading="Medical">\n                        <h4>Medical Only?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.medicalOnly ,\'btn btn-info btn-sm\' : airData.medicalOnly}">\n                            <input type="checkbox" ng-model="airData.medicalOnly" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <hr/>\n                        <h4>Medical Only Dates</h4>\n                        <div class="btn-group">\n                            <button type="button" class="btn btn-primary btn-sm" ng-click="medicalIsOpen_start=!medicalIsOpen_start">Start <i class="fa fa-calendar"></i></button>\n                            <input type="text" class="btn form-control input-sm" ng-click="medicalIsOpen_start=!medicalIsOpen_start" datetime-picker="yyyy-MM-dd" enable-time="false" ng-model="airData.medicalOnlyDate_start" is-open="medicalIsOpen_start" />\n                            <button type="button" class="btn btn-primary btn-sm" ng-click="medicalIsOpen_end=!medicalIsOpen_end">End <i class="fa fa-calendar"></i></button>\n                            <input type="text" class="btn form-control input-sm" ng-click="medicalIsOpen_end=!medicalIsOpen_end" datetime-picker="yyyy-MM-dd" enable-time="false" ng-model="airData.medicalOnlyDate_end" is-open="medicalIsOpen_end" />\n                        </div>\n                    </uib-tab>\n                    <uib-tab heading="Lost Time">\n                        <h4>Lost Time?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.lostTime ,\'btn btn-info btn-sm\' : airData.lostTime}">\n                            <input type="checkbox" ng-model="airData.lostTime" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <hr/>\n                        <h4>Lost Time Dates</h4>\n                        <div class="btn-group">\n                            <button type="button" class="btn btn-primary btn-sm" ng-click="lostTimeIsOpen_start=!lostTimeIsOpen_start">Start <i class="fa fa-calendar"></i></button>\n                            <input type="text" class="btn form-control input-sm" ng-click="lostTimeIsOpen_start=!lostTimeIsOpen_start" datetime-picker="yyyy-MM-dd" enable-time="false" ng-model="airData.lostTimeDate_start" is-open="lostTimeIsOpen_start" />\n                            <button type="button" class="btn btn-primary btn-sm" ng-click="lostTimeIsOpen_end=!lostTimeIsOpen_end">End <i class="fa fa-calendar"></i></button>\n                            <input type="text" class="btn form-control input-sm" ng-click="lostTimeIsOpen_end=!lostTimeIsOpen_end" datetime-picker="yyyy-MM-dd" enable-time="false" ng-model="airData.lostTimeDate_end" is-open="lostTimeIsOpen_end" />\n                        </div>\n                    </uib-tab>\n                    <uib-tab heading="Edit">\n                        <h4>Type of Incident</h4>\n                        <select class="form-control" ng-options="type as type for type in incidentTypes" ng-model="airData.typeOfIncident"></select>\n                        <hr/>\n                        <h4>Type of Injury</h4>\n                        <select class="form-control" ng-options="type as type for type in injuryTypes" ng-model="airData.typeOfInjury"></select>\n                        <hr/>\n                        <h4>Equipment Involved?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.eqmntInvolved ,\'btn btn-info btn-sm\' : airData.eqmntInvolved}">\n                            <input type="checkbox" ng-model="airData.eqmntInvolved" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <div ng-if="airData.eqmntInvolved">\n                            <h4>Equipment Description</h4>\n                            <textarea class="form-control" ng-model="airData.eqmntDesc" placeholder="Description"></textarea>\n                            <h4>Drug Tested</h4>\n                            <select class="form-control" ng-options="bool as bool for bool in bools" ng-model="airData.drugTested"></select>\n                        </div>\n                        <hr/>\n                        <h4>Remove?</h4>\n                        <label ng-class="{\'btn btn-default btn-sm\': !airData.remove ,\'btn btn-info btn-sm\' : airData.remove}">\n                            <input type="checkbox" ng-model="airData.remove" ng-hide="true" /><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> </label>\n                        <br>\n                        <br>\n                        <textarea class="form-control" ng-model="airData.removeComments" placeholder="Remove Comments" ng-show="airData.remove"></textarea>\n                    </uib-tab>\n                </uib-tabset>\n            </div>\n            <div class="modal-footer">\n                <button type="button" class="btn btn-success btn-lg" ng-click="updateAir()" ng-disabled="(airData.remove && !airData.removeComments) || (airData.eqmntInvolved && (!airData.eqmntDesc || !airData.drugTested)) || (airData.medicalOnly && (!airData.medicalOnlyDate_start || !airData.medicalOnlyDate_end)) || (airData.lostTime && (!airData.lostTimeDate_start || !airData.lostTimeDate_end))" data-dismiss="modal">Submit</button>\n            </div>\n        </div>\n    </div>\n</div>\n',
            controller: function ($scope, $rootScope, data, close) {
                $scope.airData = {
                    followUp: +data.followUpFinished == 1,
                    followUpComments: data.followUpComments,
                    isRecordable: +data.isRecordable == 1,
                    remove: false,
                    removeComments: null,
                    medicalOnly: +data.medicalOnly == 1,
                    medicalOnlyDate_start: data.medicalOnlyDate_start == "0001-01-01T00:00:00" ? null : data.medicalOnlyDate_start,
                    medicalOnlyDate_end: data.medicalOnlyDate_end == "0001-01-01T00:00:00" ? null : data.medicalOnlyDate_end,
                    lostTime: +data.lostTime == 1,
                    lostTimeDate_start: data.lostTimeDate_start == "0001-01-01T00:00:00" ? null : data.lostTimeDate_start,
                    lostTimeDate_end: data.lostTimeDate_end == "0001-01-01T00:00:00" ? null : data.lostTimeDate_end,
                    restricted: data.restricted,
                    transfer: data.transfer,
                    typeOfInjury: data.typeOfInjury,
                    typeOfIncident: data.typeOfIncident,
                    eqmntInvolved: data.eqmntInvolved == "Yes",
                    eqmntDesc: data.eqmntDesc,
                    drugTested: data.drugTested
                };

                $scope.injuryTypes = ['Abrasion', 'Amputation', 'Bite/Sting', 'Burn', 'Contusion', 'Crush', 'Cut/Laceration', 'Dislocation', 'Electric Shock', 'Foreign Body', 'Fracture', 'Illness/Disease', 'Impale', 'Infection', 'Inflammation', 'Puncture', 'Skin Irritation', 'Sprain/ Strain'];

                $scope.incidentTypes = ['First Aid', 'Injury Incident', 'Near Miss', 'Non Work Related', 'PIT with Injury', 'PIT without Injury', 'Property or Product Damage']

                $scope.bools = ['No', 'Yes'];

                $scope.updateAir = function () {
                    close($scope.airData);
                };
            },
            inputs: {
                data: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                blockUI.start();
                ZuReportsAPI.airUpdate(row.entryid, result)
                    .then(function (response) {
                        if (+response > 0 && angular.isNumber(+response)) {
                            $rootScope.changeResponse = {
                                message: 'AIR updated successfully!',
                                success: true
                            };
                            row.followUpFinished = result.followUp;
                            row.followUpComments = result.followUpComments;
                            row.isRecordable = result.isRecordable;
                            row.medicalOnly = result.medicalOnly;
                            row.medicalOnlyDate_start = result.medicalOnly ? result.medicalOnlyDate_start : null;
                            row.medicalOnlyDate_end = result.medicalOnly ? result.medicalOnlyDate_end : null;
                            row.lostTime = result.lostTime;
                            row.lostTimeDate_start = result.lostTime ? result.lostTimeDate_start : null;
                            row.lostTimeDate_end = result.lostTime ? result.lostTimeDate_start : null;
                            row.restricted = result.restricted;
                            row.transfer = result.transfer;
                            row.typeOfInjury = result.typeOfInjury;
                            row.typeOfIncident = result.typeOfIncident;
                            row.eqmntInvolved = result.eqmntInvolved;
                            row.eqmntDesc = result.eqmntDesc;
                            row.drugTested = result.drugTested;
                            if (result.remove) {
                                var index = $scope.gridOptions.data.indexOf(row);
                                $scope.gridOptions.data.splice(index, 1);
                            }
                        } else {
                            $rootScope.changeResponse = {
                                message: 'An error occured while updating the AIR!',
                                failure: true
                            };
                        }
                        blockUI.stop();
                    }, function (err) {
                        $rootScope.changeResponse = {
                            message: 'An error occured while updating the AIR!',
                            failure: true
                        };
                        blockUI.stop();
                    });
            });
        });
    };
})

.controller('PendingHRForms', function ($scope, $rootScope, ZuReportsAPI, uiGridConstants, ModalService, blockUI, ZuPortal_CONFIG) {
    blockUI.start();

    ZuReportsAPI.PendingHRForms()
        .then(function (data) {
            if (angular.isArray(data)) {
                $scope.employerData = {};
                angular.forEach(_.groupBy(data, function (row) { return row.type }), function (data, type) {
                    var count = 0;
                    $scope.employerData[type] = {
                        name: type,
                        managers: _.map(_.filter(data, function (employer) { return employer.type == type; }), function (group) {
                            var managerCount = 0;
                            return {
                                name: group.managerName,
                                pendingDelivery: _.groupBy(_.sortBy(_.map(group.pendingDelivery.split(';'), function (assoc) {
                                    count += 1;
                                    managerCount += 1;
                                    assoc = assoc.split('|');
                                    return {
                                        id: assoc[0],
                                        name: assoc[1],
                                        link: assoc[2],
                                        type: assoc[3],
                                        added: new Date(assoc[4]),
                                        exemptReason: ''
                                    }
                                }), function (assoc) {
                                    return assoc.name;
                                }), function (assoc) {
                                    return assoc.type == "HF" ? "High Five" : "Corrective"
                                }),
                                count: managerCount
                            };
                        }),
                        logo: 'css/images/' + type.toLowerCase() + '_logo.png',
                        style: type == 'Zulily' ? { 'width': '60px' } : { 'width': '150px' },
                        count: count,
                    }
                });
            };
            blockUI.stop();
        }, function (err) {
            blockUI.stop();
        });

    $scope.activePdf = {
        link: '',
        id: 0
    };

    $rootScope.changeResponse = {};

    $scope.selectedAssoc = {
        info: {},
        managerName: '',
        employer: ''
    };

    $scope.viewPdf = function (assoc, managerName, employer) {
        $scope.selectedAssoc.info = assoc;
        $scope.activePdf.link = ZuPortal_CONFIG.ZuDash_URLS.APIURL + assoc.link.replace('/data', 'data');
        $scope.activePdf.id = Number(assoc.id);
        $scope.employerData[employer].managers.forEach(function (manager, i) {
            if (manager.name == managerName) {
                managerName = i;
            };
        });
        $scope.selectedAssoc.managerName = managerName;
        $scope.selectedAssoc.employer = employer;
    };

    $scope.changeStatus = function (status) {
        if (status) {
            blockUI.start();
            ZuReportsAPI.UpdateFormStatus($scope.selectedAssoc.info, status)
                .then(function (response) {
                    if (+response > 0 && angular.isNumber(+response)) {
                        var assoc = $scope.selectedAssoc.info;
                        var type = assoc.type == "HF" ? "High Five" : "Corrective";
                        var index = $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery[type].indexOf(assoc);
                        $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery[type].splice(index, 1);
                        $scope.employerData[$scope.selectedAssoc.employer].count += -1;
                        $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].count += -1;
                        $scope.activePdf = {
                            link: '',
                            id: 0
                        };

                        $scope.selectedAssoc = {
                            info: {},
                            managerName: '',
                            employer: ''
                        };
                        $rootScope.changeResponse.message = 'Form Delivered successfully!';
                        $rootScope.changeResponse.success = true;
                    } else {
                        $rootScope.changeResponse.message = 'An error occured while delivering the form!';
                        $rootScope.changeResponse.failure = true;
                    }
                    blockUI.stop();
                }, function (err) {
                    $rootScope.changeResponse.message = 'An error occured while delivering the form!';
                    $rootScope.changeResponse.failure = true;
                    blockUI.stop();
                });
        } else {
            ModalService.showModal({
                template: '<div class="modal" ng-class="{\'animated bounceInDown\' : !exit, \'animated bounceOutUp\' : exit}">\n	<div class="modal-dialog">\n		<div class="modal-content">\n			<div class="modal-header">\n				<button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button> \n				<h4 class="modal-title">Expemption for {{ data.name }}</h4>\n			</div>\n			<div class="modal-body">\n			Description:<br>\n				<textarea ng-model="exemptReason" class="form-control" style="height: 100%; width: 100%; font-size: 20px;" rows="12"></textarea>\n			</div>\n			<div class="modal-footer"> <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button> <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal" ng-disabled="exemptReason == \'\'">Submit</button></div>\n		</div>\n	</div>\n</div>',
                controller: 'exemptionController',
                inputs: {
                    data: $scope.selectedAssoc.info
                }
            }).then(function (modal) {
                modal.element.modal();
                modal.close.then(function (result) {
                    if (result > '') {
                        blockUI.start();
                        ZuReportsAPI.UpdateFormStatus($scope.selectedAssoc.info, status, result)
                            .then(function (response) {
                                if (+response > 0 && angular.isNumber(+response)) {
                                    var assoc = $scope.selectedAssoc.info;
                                    var type = assoc.type == "HF" ? "High Five" : "Corrective Action";
                                    var index = $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery[type].indexOf(assoc);
                                    $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery[type].splice(index, 1);
                                    $scope.employerData[$scope.selectedAssoc.employer].count += -1;
                                    $scope.activePdf = {
                                        link: '',
                                        id: 0
                                    };

                                    $scope.selectedAssoc = {
                                        info: {},
                                        managerName: '',
                                        employer: ''
                                    };
                                    $rootScope.changeResponse.message = 'Associate Exempted successfully!';
                                    $rootScope.changeResponse.success = true;
                                } else {
                                    $rootScope.changeResponse.message = 'An error occured while exempting the associate!';
                                    $rootScope.changeResponse.failure = true;
                                }
                                blockUI.stop();
                            }, function (err) {
                                $rootScope.changeResponse.message = 'An error occured while exempting the associate!';
                                $rootScope.changeResponse.failure = true;
                                blockUI.stop();
                            });
                    }
                });
            });
        };
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
                        cellTemplate: '<label ng-class="{\'notSelected\': !row.entity.selected && row.entity.caLevel, \'btn btn-default btn-sm\': !row.entity.selected ,\'btn btn-info btn-sm\' : row.entity.selected}" class="btn btn-sm btn-default" ng-click="grid.appScope.selectRow(row.entity)" ng-if="!row.entity.locked">\n	<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n</label>',
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
            item.inclInAvg = $scope.selectedAll
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
            template: '<div class="modal animated bounceInDown">\n	<div class="modal-dialog">\n		<div class="modal-content">\n			<div class="modal-header">\n				<button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button> \n				<h4 class="modal-title">Exemption for {{ data.fullName }}</h4>\n			</div>\n			<div class="modal-body">\n			Reason:<br>\n			<select class="form-control" ng-options="reason.value as reason.label for reason in reasons" ng-model="exempt.reason"></select>\n			Comments:<br>\n				<textarea ng-model="exempt.comments" class="form-control" style="height: 100%; width: 100%; font-size: 20px;" rows="12"></textarea>\n			</div>\n			<div class="modal-footer"> <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button> <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal" ng-disabled="data.locked || (exempt.reason == \'Other\' && !exempt.comments)">Save</button></div>\n		</div>\n	</div>\n</div>',
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
        var offset = locationId == 1 ? 0 : 3;
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
                    template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Errors for {{ info.fullName }}</h4>\n            </div>\n            <div class="modal-body">\n                <uib-tabset>\n                    <uib-tab ng-repeat="(dept, data) in errors">\n                        <uib-tab-heading>\n                            {{ dept }}\n                            <span class="badge">{{ data.length }}</span>\n                        </uib-tab-heading>\n                        <table class="table table-condensed table-striped table-hover">\n                        	<thead>\n                        		<tr>\n                        			<th>\n                        				Error Id\n                        			</th>\n                        			<th>\n                        				Error\n                        			</th>\n                        			<th>\n                        				Notes\n                        			</th>\n                        		</tr>\n                        	</thead>\n                        	<tbody>\n                        		<tr ng-repeat="(id, error) in data.errorsArray">\n                        			<td>\n                        				<a ui-sref="app.ICQAFollowUpDetail({ trackid: id })" target="_blank">{{ id }}</a>\n                        			</td>\n                        			<td>\n                        				{{ error[0].ErrorName || error[0].ExceptionType }}\n                        			</td>\n                        			<td>\n                        				{{ error[0].Notes }}\n                        			</td>\n                        		</tr>\n                        	</tbody>\n                        </table>\n                    </uib-tab>\n                </uib-tabset>\n            </div>\n        </div>\n    </div>\n</div>\n',
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

})

.factory('KioskAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        associateLogin: function (barcode) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/kioskLoginInfo.aspx', { params: { badgeId: barcode, locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        kioskHighFiveRoster: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/kioskHighFiveRoster.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data;
                }, function (error) {
                    return error;
                });
        },
        submitHighFive: function (associateId, zulilyValue, highFiveDescription) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/KioskHighFive.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                associateId: associateId,
                submitterId: $localStorage.user.id,
                zulilyValue: zulilyValue,
                highFiveDescription: highFiveDescription
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        locationShifts: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/locationShifts.aspx', { params: { outputType: "JSON", locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        existingTransfers: function (wmsId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/kioskExistingTransfers.aspx', { params: { wmsId: wmsId, locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        submitTransfer: function (fullName, wmsId, hireDate, type, cshift, cdept, rshift, rdept) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/TransferRequest.aspx', $httpParamSerializer({
                fullName: fullName,
                wmsId: wmsId,
                hireDate: hireDate,
                type: type,
                cshift: cshift,
                cdept: cdept,
                rshift: rshift,
                rdept: rdept,
                status: 'Pending',
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        removeTransfer: function (transfer) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/removeTransferRequest.aspx', $httpParamSerializer({
                transferId: transfer.TransferId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        existingVOT: function (wmsId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/kioskExistingVOTDays.aspx', { params: { wmsId: wmsId, locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        submitVOT: function (wmsId, type, shift, dept, func, votDate) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/VOTSignup.aspx', $httpParamSerializer({
                wmsId: wmsId,
                type: type,
                shift: shift,
                dept: dept,
                func: func,
                votDate: votDate,
                hours: 10,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        removeVOT: function (id) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/removeVOTSignup.aspx', $httpParamSerializer({
                votId: id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        existingVTO: function (wmsId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/kioskExistingVTODays.aspx', { params: { wmsId: wmsId, locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        submitVTO: function (wmsId, type, shift, dept, func, vtoDate) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/VTOSignup.aspx', $httpParamSerializer({
                wmsId: wmsId,
                type: type,
                shift: shift,
                dept: dept,
                func: func,
                vtoDate: vtoDate,
                hours: 10,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        removeVTO: function (id) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/removeVTOSignup.aspx', $httpParamSerializer({
                vtoId: id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    }
})

.controller('Kiosk', function ($scope, $interval, $cookies, $state, $rootScope, $localStorage) {
    $interval(function () {
        if ($cookies.get('KioskUserInfo') == null && $localStorage.user == null) {
            $cookies.remove('KioskUserInfo');
            $cookies.remove('KioskUserInfo', { path: '/' });
            $rootScope.kioskLoggedIn = false;
            $state.go('app.kiosk.kioskLogin');
        }
    }, 30000);

    if ($cookies.get('KioskUserInfo') == null && $localStorage.user == null) {
        $rootScope.kioskLoggedIn = false;
        $state.go('app.kiosk.kioskLogin');
    };
})

.service('kioskLoginCheck', function ($cookies, $rootScope, $state, $localStorage) {
    return {
        get: function (backTo) {
            if (!$cookies.get('KioskUserInfo') && !$localStorage.user) {
                $rootScope.kioskLoggedIn = false;
                if (backTo) {
                    $state.go('app.kiosk.kioskLogin', { backTo: backTo });
                    return;
                } else {
                    $state.go('app.kiosk.kioskLogin', { backTo: null });
                    return;
                };
            } else if (!$cookies.get('KioskUserInfo') && $localStorage.user.id && $state.current.name == 'app.kiosk.kioskHF') {

            } else if (!$cookies.get('KioskUserInfo') && $localStorage.user.id && $state.current.name != 'app.kiosk.kioskHF') {
                $rootScope.kioskLoggedIn = false;
                if (backTo) {
                    $state.go('app.kiosk.kioskLogin', { backTo: backTo });
                    return;
                } else {
                    $state.go('app.kiosk.kioskLogin', { backTo: null });
                    return;
                };
            } else {
                $rootScope.kioskLoggedIn = true;
            }
        }
    }
})

.controller('KioskLogin', function ($scope, $rootScope, $cookies, KioskAPI, $state, SCAN_EVENT, $stateParams, blockUI) {
    $rootScope.scannerEnabled = true;
    $cookies.remove('KioskUserInfo');
    $cookies.remove('KioskUserInfo', { path: '/' });
    $rootScope.kioskLoggedIn = false;

    $scope.$on(SCAN_EVENT, function (e, msg) {
        blockUI.start();
        KioskAPI.associateLogin(msg.barcode)
            .then(function (response) {
                blockUI.stop();
                if (response.length > 0) {
                    var now = new Date(), time = now.getTime(), expireTime = time + 300000;
                    now.setTime(expireTime);
                    $cookies.put('KioskUserInfo', JSON.stringify(response), { path: '/', expires: now });
                    $cookies.put('portalUserId', response[0].wmsID, { path: '/', expires: now });
                    $rootScope.kioskLoggedIn = true;
                    if ($stateParams.backTo) {
                        $state.go($stateParams.backTo);
                    } else {
                        $state.go('app.kiosk.kioskHome');
                    }
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Invalid Badge ID'
                    }
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'API Error occured.'
                }
            });
    })
})

.controller('KioskHome', function ($scope, kioskLoginCheck, $state) {
    kioskLoginCheck.get($state.current.name);

    $scope.links = [
        {
            name: 'High-Five',
            stateName: 'app.kiosk.kioskHF'
        },
        {
            name: 'Transfer',
            stateName: 'app.kiosk.transfer'
        },
        {
            name: 'VOT',
            stateName: 'app.kiosk.vot'
        },
        {
            name: 'VTO',
            stateName: 'app.kiosk.vto'
        }
    ]
})

.controller('HighFive', function ($scope, $rootScope, $cookies, KioskAPI, $state, kioskLoginCheck) {
    kioskLoginCheck.get($state.current.name);

    KioskAPI.kioskHighFiveRoster()
        .then(function (data) {
            $scope.associates = _.filter(data.data, function (assoc) { return assoc.type == 'Zulily' });
        }, function (err) {
        });

    $scope.selectAssociate = function (associate) {
        $scope.searchTerm = '';
        $scope.selectedAssociate = associate;
    };

    $scope.zulilyValue = '';

    $scope.valueInfo = {
        default: { borderColor: "#ffffff", fontColor: "#000000 !important", placeHolder: "Who, What, When, Where, and Why", url: '' },
        color: { borderColor: "#CA5DA5 !important", fontColor: "#CA5DA5 !important", placeHolder: "*Employee came up with process improvement that was implemented.", url: '/images/color.png' },
        embrace: { borderColor: "#B7D46C !important", fontColor: "#B7D46C !important", placeHolder: "*Employee saw that there was a 5S project that needed completed. Asked to help out and completed the project.\n*A change is implemented and an associate sees where it can be done better. Associate helps come up with a fix for the procedure.", url: '/images/embrace.png' },
        impossible: { borderColor: "#FE6B32 !important", fontColor: "#FE6B32 !important", placeHolder: "*An employee was given a task where there was limited time and a lot of hustle needed. Employee completed task successfully without complaint.\n*Employee sees neighbor struggling, so they help break down a few boxes and sweep area to help that employee out.", url: '/images/impossible.png' },
        ownership: { borderColor: "#F3BC42 !important", fontColor: "#F3BC42 !important", placeHolder: "*Employee saw that there was a broken cart. Instead of leaving it for someone else to find, the employee took it to a lead.\n*Employee sees a safety issue and reports it.\n*Employee goes above and beyond to clean messy area.", url: '/images/ownership.png' },
        work: { borderColor: "#708BC0 !important", fontColor: "#708BC0 !important", placeHolder: "*Employee was packing and saw that an item was dirty. Reported issue to lead.\n*Employee sees an abandoned stow cart in aisle. Employee lets lead know that it was abandoned and asks to stow it.\n*Employee has outstanding production (ex. 150%+ to goal).", url: '/images/work.png' }
    };

    $scope.submitHighFive = function () {
        if ($scope.selectedAssociate != null && ($scope.zulilyValue != null || $scope.zulilyValue != 'default') && $scope.highFiveDescription != null) {
            KioskAPI.submitHighFive($scope.selectedAssociate.wmsId, $scope.zulilyValue, $scope.highFiveDescription)
                .then(function (data) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'High Five submitted successfully!'
                    };

                    $state.go('app.kiosk.kioskHome');
                }, function () {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An unhandle error has occured.<br>Please try again later.'
                    };

                    $state.go('app.kiosk.kioskHome');
                });
        };
    };
})

.controller('AssociateTransfer', function ($scope, $rootScope, $cookies, KioskAPI, $state, kioskLoginCheck, blockUI, ModalService) {
    kioskLoginCheck.get($state.current.name);

    if ($cookies.get("KioskUserInfo")) {
        $scope.userInfoArray = angular.fromJson($cookies.get("KioskUserInfo"))[0];
    } else {
        return;
    };

    $scope.transferType = null;

    ModalService.showModal({
        templateUrl: 'templates/kiosk/dialogs/disclmainer.html',
        controller: function ($scope) {

        }
    }).then(function (modal) {
        modal.element.modal();
        modal.close;
    });

    $scope.transferTypes = [
        {
            id: 'ssdd',
            name: 'Same Shift Different Department',
            click: function (type) {
                $scope.transferType = type;

                $scope.form = {
                    shift: {
                        value: $scope.userInfoArray.shift,
                        required: false
                    },
                    department: {
                        value: null,
                        required: true
                    }
                };
            }
        }, {
            id: 'dssd',
            name: 'Same Department Different Shift',
            click: function (type) {
                $scope.transferType = type;

                $scope.form = {
                    shift: {
                        value: null,
                        required: true
                    },
                    department: {
                        value: $scope.userInfoArray.mainDepartment,
                        required: false
                    }
                };
            }
        }, {
            id: 'dsdd',
            name: 'Different Shift Different Department',
            click: function (type) {
                $scope.transferType = type;

                $scope.form = {
                    shift: {
                        value: null,
                        required: true
                    },
                    department: {
                        value: null,
                        required: true
                    }
                };
            }
        }, {
            id: 'vcr',
            name: 'View Current Transfer Requests',
            click: function (type) {
                $scope.transferType = type;

                $scope.form = {
                    shift: {
                        value: null,
                        required: false
                    },
                    department: {
                        value: null,
                        required: false
                    }
                }
            }
        },
    ];

    $scope.shifts = {
        'Day Shifts': [],
        'Night Shifts': []
    };

    $scope.depts = [
        'ICQA',
        'Inbound',
        'Facilities',
        'Outbound',
        'Zebra'
    ];

    $scope.availableDept = function (depts) {
        depts = depts.split(',');
        return depts.indexOf($scope.form.department.value) > -1;
    };

    $scope.form = {
        shift: {
            value: null,
            required: false
        },
        department: {
            value: null,
            required: false
        }
    };

    KioskAPI.locationShifts()
        .then(function (res) {
            res.forEach(function (shift, key) {
                if (shift.ShiftID.substring(0, 1) == 1) {
                    $scope.shifts['Day Shifts'].push(shift);
                } else {
                    $scope.shifts['Night Shifts'].push(shift);
                }
            })
        }, function (err) {

        });

    KioskAPI.existingTransfers($scope.userInfoArray.wmsID)
        .then(function (res) {
            $scope.existingTransfers = _.map(res, function (request) {
                var updated = new Date(request.timestamp);
                var expires = updated;
                expires.setDate(expires.getDate() + 90);
                return {
                    TransferId: request.TransferId,
                    WmsID: request.WmsID,
                    addedTimestamp: request.addedTimestamp,
                    cdept: request.cdept,
                    cshift: request.cshift,
                    hire: request.hire,
                    locationId: request.locationId,
                    name: request.name,
                    notes: request.notes,
                    rdept: request.rdept,
                    rshift: request.rshift,
                    status: request.status,
                    timestamp: request.timestamp,
                    expires: request.status == 'Approved' ? expires : null,
                    type: request.type,
                    updatedBy: request.updatedBy,
                }
            });

            $scope.hasApproved = _.pluck(res, 'status').indexOf('Approved') > -1;
        }, function (err) {
            $scope.existingTransfers = [];
        });

    $scope.remove = function (row) {
        blockUI.start();
        KioskAPI.removeTransfer(row)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Transfer removed sucessfully!'
                    };

                    var index = $scope.existingTransfers.indexOf(row);

                    $scope.existingTransfers.splice(index, 1);
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Transfer not removed, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Transfer not removed, please try again!'
                };
            });
    };

    $scope.nullShift = function () {
        if ($scope.form.shift.required) {
            $scope.form.shift.value = null;
        };
    };

    $scope.cancel = function () {
        $state.go('app.kiosk.kioskHome');
    };

    $scope.reset = function () {
        location.reload();
    };

    $scope.submit = function () {
        blockUI.start();
        KioskAPI.submitTransfer($scope.userInfoArray.fullName,
            $scope.userInfoArray.wmsID,
            $scope.userInfoArray.hireDate,
            $scope.userInfoArray.type,
            $scope.userInfoArray.shift,
            $scope.userInfoArray.mainDepartment,
            $scope.form.shift.value,
            $scope.form.department.value)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Transfer submitted sucessfully!'
                    };
                    $state.go('app.kiosk.kioskHome');
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Transfer not submitted, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Transfer not submitted, please try again!'
                };
            });
    };
})

.controller('VOTSignup', function ($scope, $rootScope, $cookies, KioskAPI, $state, kioskLoginCheck, blockUI, ZuPortal_CONFIG, $localStorage) {
    kioskLoginCheck.get($state.current.name);

    if ($cookies.get("KioskUserInfo")) {
        $scope.userInfoArray = angular.fromJson($cookies.get("KioskUserInfo"))[0];
    } else {
        return;
    };

    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate)
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    $scope.list = [
        {
            id: 'ICQA',
            dept: 'ICQA'
        }, {
            id: 'Arrivals',
            dept: 'Inbound'
        }, {
            id: 'Receive',
            dept: 'Inbound'
        }, {
            id: 'Stow',
            dept: 'Inbound'
        }, {
            id: 'Pick',
            dept: 'Outbound'
        }, {
            id: 'Pack',
            dept: 'Outbound'
        }, {
            id: 'Shipping',
            dept: 'Outbound'
        }
    ];

    $scope.shiftPhonetic = $scope.userInfoArray.shift.substring(1);

    $scope.assocOffDays = ZuPortal_CONFIG.offDays[$localStorage.locationId][$scope.shiftPhonetic];

    var startDate = new Date();

    startDate.setHours(0)
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(000);

    var stopDate = startDate.addDays(13);

    $scope.nextTwoWeeks = getDates(startDate, stopDate);
    $scope.existingDays = {
        dates: [],
        funcs: [],
        ids: []
    };

    $scope.form = {
        dept: null,
        required: true
    };

    $scope.daySignups = [];

    KioskAPI.existingVOT($scope.userInfoArray.wmsID)
        .then(function (res) {
            res.forEach(function (dateInfo, index) {
                $scope.existingDays.dates.push(dateInfo.infoArray.split(',')[0])
                $scope.existingDays.funcs.push(dateInfo.infoArray.split(',')[1])
                $scope.existingDays.ids.push(Number(dateInfo.infoArray.split(',')[2]))
            });

            $scope.nextTwoWeeks.forEach(function (weekDay, d) {
                var otDayDate = weekDay.getFullYear() + '-' + ('0' + (weekDay.getMonth() + 1)).slice(-2) + '-' + ('0' + weekDay.getDate()).slice(-2)

                var match = $scope.assocOffDays.indexOf(ZuPortal_CONFIG.weekDays[weekDay.getDay()])
                if (match > -1) {
                    var exists = $scope.existingDays.dates.indexOf(otDayDate);
                    $scope.daySignups.push({
                        exists: exists > -1,
                        func: $scope.existingDays.funcs[exists] || null,
                        id: $scope.existingDays.ids[exists] || null,
                        date: otDayDate + 'T00:00:00'
                    });
                };
            })
        }, function (err) {
            $scope.nextTwoWeeks.forEach(function (weekDay, d) {
                var otDayDate = weekDay.getFullYear() + '-' + ('0' + (weekDay.getMonth() + 1)).slice(-2) + '-' + ('0' + weekDay.getDate()).slice(-2)

                $scope.daySignups.push({
                    exists: false,
                    func: null,
                    id: null,
                    date: otDayDate + 'T00:00:00'
                });
            })
        });

    $scope.signUp = function (index, date) {
        blockUI.start();
        KioskAPI.submitVOT(
            $scope.userInfoArray.wmsID,
            $scope.userInfoArray.type,
            $scope.userInfoArray.shift,
            $scope.form.dept.dept,
            $scope.form.dept.id,
            date)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'VOT submitted sucessfully!'
                    };

                    $scope.daySignups[index] = {
                        exists: true,
                        func: $scope.form.dept.id,
                        id: +response,
                        date: date
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'VOT not submitted, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'VOT not submitted, please try again!'
                };
            });
    };

    $scope.removeDay = function (index, id, date) {
        KioskAPI.removeVOT(id)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'VOT removed sucessfully!'
                    };

                    $scope.daySignups[index] = {
                        exists: false,
                        func: null,
                        id: null,
                        date: date
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'VOT not removed, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'VOT not removed, please try again!'
                };
            });
    };

})

.controller('VTOSignup', function ($scope, $rootScope, $cookies, KioskAPI, $state, kioskLoginCheck, blockUI, ZuPortal_CONFIG, $localStorage) {
    kioskLoginCheck.get($state.current.name);

    if ($cookies.get("KioskUserInfo")) {
        $scope.userInfoArray = angular.fromJson($cookies.get("KioskUserInfo"))[0];
    } else {
        return;
    };

    Date.prototype.addDays = function (days) {
        var dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }

    function getDates(startDate, stopDate) {
        var dateArray = new Array();
        var currentDate = startDate;
        while (currentDate <= stopDate) {
            dateArray.push(currentDate)
            currentDate = currentDate.addDays(1);
        }
        return dateArray;
    }

    $scope.list = [
        {
            id: 'ICQA',
            dept: 'ICQA'
        }, {
            id: 'Arrivals',
            dept: 'Inbound'
        }, {
            id: 'Receive',
            dept: 'Inbound'
        }, {
            id: 'Stow',
            dept: 'Inbound'
        }, {
            id: 'Pick',
            dept: 'Outbound'
        }, {
            id: 'Pack',
            dept: 'Outbound'
        }, {
            id: 'Shipping',
            dept: 'Outbound'
        }
    ];

    $scope.shiftPhonetic = $scope.userInfoArray.shift.substring(1);

    $scope.assocWorkDays = ZuPortal_CONFIG.workDays[$localStorage.locationId][$scope.shiftPhonetic];

    var startDate = new Date();

    startDate.setHours(0)
    startDate.setMinutes(0);
    startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
    startDate.setSeconds(0);
    startDate.setMilliseconds(000);

    var stopDate = startDate.addDays(13);

    $scope.nextTwoWeeks = getDates(startDate, stopDate);
    $scope.existingDays = {
        dates: [],
        funcs: [],
        ids: []
    };

    $scope.daySignups = [];

    KioskAPI.existingVTO($scope.userInfoArray.wmsID)
        .then(function (res) {
            res.forEach(function (dateInfo, index) {
                $scope.existingDays.dates.push(dateInfo.infoArray.split(',')[0])
                $scope.existingDays.funcs.push(dateInfo.infoArray.split(',')[1])
                $scope.existingDays.ids.push(Number(dateInfo.infoArray.split(',')[2]))
            });

            $scope.nextTwoWeeks.forEach(function (weekDay, d) {
                var vtoDayDate = weekDay.getFullYear() + '-' + ('0' + (weekDay.getMonth() + 1)).slice(-2) + '-' + ('0' + weekDay.getDate()).slice(-2)

                var match = $scope.assocWorkDays.indexOf(ZuPortal_CONFIG.weekDays[weekDay.getDay()])
                if (match > -1) {
                    var exists = $scope.existingDays.dates.indexOf(vtoDayDate);
                    $scope.daySignups.push({
                        exists: exists > -1,
                        func: $scope.existingDays.funcs[exists] || null,
                        id: $scope.existingDays.ids[exists] || null,
                        date: vtoDayDate + 'T00:00:00'
                    });
                };
            })
        }, function (err) {
            $scope.nextTwoWeeks.forEach(function (weekDay, d) {
                var vtoDayDate = weekDay.getFullYear() + '-' + ('0' + (weekDay.getMonth() + 1)).slice(-2) + '-' + ('0' + weekDay.getDate()).slice(-2)

                $scope.daySignups.push({
                    exists: false,
                    func: null,
                    id: null,
                    date: vtoDayDate + 'T00:00:00'
                });
            })
        });

    $scope.signUp = function (index, date) {
        blockUI.start();
        KioskAPI.submitVTO(
            $scope.userInfoArray.wmsID,
            $scope.userInfoArray.type,
            $scope.userInfoArray.shift,
            $scope.userInfoArray.mainDepartment,
            $scope.userInfoArray.subDepartment,
            date)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'VTO submitted sucessfully!'
                    };

                    $scope.daySignups[index] = {
                        exists: true,
                        func: $scope.userInfoArray.subDepartment,
                        id: +response,
                        date: date
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'VTO not submitted, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'VTO not submitted, please try again!'
                };
            });
    };

    $scope.removeDay = function (index, id, date) {
        KioskAPI.removeVTO(id)
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'VTO removed sucessfully!'
                    };

                    $scope.daySignups[index] = {
                        exists: false,
                        func: null,
                        id: null,
                        date: date
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'VTO not removed, please try again!'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'VTO not removed, please try again!'
                };
            });
    };

})

.factory('InboundAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        submitDonation: function (donation) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/DonationsLog.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                portalUserId: $localStorage.user.id,
                area: donation.area,
                origin: donation.origin,
                skuNumber: donation.skuNumber,
                skuQuantity: donation.skuQuantity,
                skuPrice: donation.skuPrice,
                location: donation.location,
                ticketNumber: donation.ticketNumber,
                donateReason: donation.donateReason,
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    }
})

.controller('DonationsLog', function ($scope, $rootScope, $cookies, InboundAPI) {
    $scope.questions = {
        area: '',
        origin: '',
        skuNumber: '',
        skuQuantity: '',
        skuPrice: '',
        location: '',
        ticketNumber: '',
        donateReason: ''
    };
    $scope.step = 1;
    $scope.back = function () {
        if ($scope.step != 1) {
            $scope.step += -1;
        };
    };
    $scope.next = function () {
        if ($scope.step != 9) {
            $scope.step += 1;
        };
    };
    $scope.change = function (step) {
        $scope.step = step;
    };
    $scope.submit = function () {
        var required = true;
        angular.forEach($scope.questions, function (answer, question) {
            if (required) {
                if (answer == '') {
                    $scope.step = Object.keys($scope.questions).indexOf(question) + 1;
                    required = false;
                    $rootScope.changeResponse = {};
                    $rootScope.changeResponse.message = question + ' requires an answer!';
                    return;
                };
            };
        });
        if (required) {
            InboundAPI.submitDonation($scope.questions)
                .then(function (response) {
                    $rootScope.changeResponse = {};
                    $scope.questions = {
                        area: '',
                        origin: '',
                        skuNumber: '',
                        skuQuantity: '',
                        skuPrice: '',
                        location: '',
                        ticketNumber: '',
                        donateReason: ''
                    };
                    $scope.step = 1;
                    if (+response > 0 && angular.isNumber(+response)) {
                        $rootScope.changeResponse.message = 'Donation logged Successfully!';
                        $rootScope.changeResponse.success = true;
                    } else {
                        $rootScope.changeResponse.message = 'An error occured while logging the donation!';
                        $rootScope.changeResponse.failure = true;
                    }
                }, function (err) {
                    $rootScope.changeResponse.message = 'An error occured while logging the donation!';
                    $rootScope.changeResponse.failure = true;
                });
        } else {
            $rootScope.changeResponse.warning = true;
        }
    }
})

.factory('SafetyAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        getAIRRoster: function (airData) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/AIRRoster.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        }, submitAIR: function (airData) {

            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/AIREntry.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                portalUserId: $localStorage.user.id,
                airData: JSON.stringify(airData)
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        }
    }
})

.directive('bodyPartModel', function () {
    return {
        restrict: 'E',
        scope: {},
        link: function (scope, element, attrs) {
            scope.selectedBodyPart = '';
            scope.$watch("selectedBodyPart", function (n, o) {
                scope.$parent.airData.bodyPart = angular.copy(scope.selectedBodyPart);
            });
        },
        templateUrl: 'templates/dialogs/body.html'
    };
})

.controller('AIREntry', function ($scope, $rootScope, $interval, $cookies, SafetyAPI, ModalService, $localStorage, blockUI, $sessionStorage, $state, ZuPortal_CONFIG) {

    $scope.$storage = $localStorage;

    $scope.session = $sessionStorage;

    $scope.autoSave = false;

    var autoSaveTimer;

    $scope.autoSaveSwitch = function (t) {
        if (t) {
            $scope.saveAIR();
            $localStorage.lastSave = new Date();
            autoSaveTimer = $interval(function () {
                $scope.saveAIR();
                $localStorage.lastSave = new Date();
            }, 60000);
        } else {
            $interval.cancel(autoSaveTimer);
            autoSaveTimer = undefined;
        };
    };

    $rootScope.changeResponse = {};

    blockUI.start();

    SafetyAPI.getAIRRoster()
        .then(function (data) {
            $scope.AIRRoster = data;
            blockUI.stop();
        }, function (err) {

            blockUI.stop();
        });

    $scope.page = 1;

    $scope.fc = ZuPortal_CONFIG.locationsId[$localStorage.locationId];

    $scope.todaysDate = new Date();

    $scope.airData = {
        typeOfIncident: { value: '', page: 1, required: true, questionName: 'Type Of Incident' },
        dateTimeOfIncident: { value: '', page: 3, required: true, questionName: 'Date/ Time of Incident', valid: false },
        dateTimeIncidentReported: { value: '', page: 3, required: true, questionName: 'Date/ Time Incident Reported' },
        areaOfIncident: { value: '', page: 3, required: true, questionName: 'Area' },
        painLevel: { value: '', page: 3, required: false, questionName: 'Pain Level' },
        typeOfAction: { value: '', page: 3, required: true, questionName: 'Type of Action' },
        typeOfInjury: { value: '', page: 3, required: false, questionName: 'Type of Injury' },
        statusOfAssoc: { value: '', page: 3, required: true, questionName: 'Associate Status' },
        bodyPart: { value: '', page: 3, required: false, questionName: 'Body Part' },
        previousInjury: { value: '', page: 3, required: false, questionName: 'Previous Injury' },
        previousInjuryDate: { value: '', page: 3, required: false, questionName: 'Previous Injury Date' },
        objInvolved: { value: '', page: 4, required: true, questionName: 'Object Involved' },
        objInvolvedDesc: { value: '', page: 4, required: false, questionName: 'Object Description' },
        objInvolvedWht: { value: '', page: 4, required: false, questionName: 'Object Weight' },
        medclAttn: { value: '', page: 4, required: false, questionName: 'Medical Attention' },
        medclAttnProvided: { value: '', page: 4, required: false, questionName: 'Medical Attention Provided' },
        medclAttnDesc: { value: '', page: 4, required: false, questionName: 'Medical Attention Desc.' },
        witnesses: { value: '', page: 4, required: true, questionName: 'Witnesses' },
        witness1: { value: '', page: 4, required: false, questionName: 'Witness 1' },
        witness2: { value: '', page: 4, required: false, questionName: 'Witness 2' },
        eqmntInvolved: { value: '', page: 4, required: true, questionName: 'Equiment Involved' },
        drugTested: { value: '', page: 4, required: false, questionName: 'Drug Tested' },
        eqmntDesc: { value: '', page: 4, required: false, questionName: 'Equipment Desc.' },
        pptyDmg: { value: '', page: 4, required: true, questionName: 'Property Damage' },
        pptyDmgImages: { value: '', page: 4, required: false, questionName: 'Propty Damage Images' },
        pptyDmgDesc: { value: '', page: 4, required: false, questionName: 'Property Damage Desc.' },
        descOfInc: { value: '', page: 5, required: true, questionName: 'Description of Incident' },
        unsafeCondition: { value: '', page: 5, required: true, questionName: 'Unsafe Condition' },
        unsafeBehavior: { value: '', page: 5, required: true, questionName: 'Unsafe Behavior' },
        rootCause: { value: '', page: 5, required: true, questionName: 'Root cause' },
        actionPlan: { value: '', page: 6, required: true, questionName: 'Action Plan' },
        actionPlanOwner: { value: '', page: 6, required: true, questionName: 'Plan Owner' },
        actionPlanDate: { value: '', page: 6, required: true, questionName: 'Plan Date' },
        optionalImages: { value: '', page: 7, required: false, questionName: 'Images' }
    };

    var airDataReset = angular.copy($scope.airData);

    $scope.switchType = function (n) {

        if (n == 'First Aid' || n == 'Injury Incident' || n == 'PIT with Injury') {
            $scope.airData.eqmntInvolved.value = '';
            $scope.airData.pptyDmg.value = '';
            if (n == 'PIT with Injury') { $scope.airData.eqmntInvolved.value = 'Yes'; $scope.airData.pptyDmg.value = 'Yes'; };
            $scope.airData.painLevel.required = true;
            $scope.airData.typeOfInjury.required = true;
            $scope.airData.statusOfAssoc.required = true;
            $scope.airData.bodyPart.required = true;
            $scope.airData.previousInjury.required = true;
            $scope.airData.medclAttn.required = true;
        } else if (n == 'Near Miss') {
            $scope.airData.eqmntInvolved.value = '';
            $scope.airData.pptyDmg.value = '';
            $scope.airData.painLevel.required = false;
            $scope.airData.typeOfInjury.required = false;
            $scope.airData.statusOfAssoc.required = true;
            $scope.airData.bodyPart.required = false;
            $scope.airData.previousInjury.required = false;
            $scope.airData.medclAttn.required = true;
        } else if (n == 'Non Work Related') {
            $scope.airData.eqmntInvolved.value = '';
            $scope.airData.pptyDmg.value = '';
            $scope.airData.painLevel.required = false;
            $scope.airData.typeOfInjury.required = false;
            $scope.airData.statusOfAssoc.required = true;
            $scope.airData.bodyPart.required = false;
            $scope.airData.previousInjury.required = false;
            $scope.airData.medclAttn.required = true;
        } else if (n == 'PIT without Injury') {
            $scope.airData.eqmntInvolved.value = 'Yes';
            $scope.airData.pptyDmg.value = 'Yes';
            $scope.airData.painLevel.required = false;
            $scope.airData.typeOfInjury.required = false;
            $scope.airData.statusOfAssoc.required = true;
            $scope.airData.bodyPart.required = false;
            $scope.airData.previousInjury.required = false;
            $scope.airData.medclAttn.required = false;
        } else if (n == 'Property or Product Damage') {
            $scope.airData.eqmntInvolved.value = 'No';
            $scope.airData.pptyDmg.value = 'Yes';
            $scope.airData.painLevel.required = true;
            $scope.airData.typeOfInjury.required = true;
            $scope.airData.statusOfAssoc.required = true;
            $scope.airData.bodyPart.required = true;
            $scope.airData.previousInjury.required = true;
            $scope.airData.medclAttn.required = true;
        };

    };

    $scope.assocInfo = '';

    $scope.nonEmployeeInfo = '';

    $scope.assocFound = false;

    $scope.nonEmployee = false;

    $scope.searchAssoc = function () {
        $scope.assocInfo = '';
        $scope.assocFound = false;
        $scope.nonEmployeeInfo = '';
        $scope.nonEmployee = false;
        if ($scope.assocId != '') {
            $scope.AIRRoster.forEach(function (assoc, id) {
                if (assoc.kronosid == $scope.assocId) {
                    $scope.assocInfo = angular.copy(assoc);
                    $scope.assocFound = true;
                    $scope.assocId = '';
                };
            });
            if (!$scope.assocFound) {
                $rootScope.changeResponse.message = 'Associate not found!';
                $rootScope.changeResponse.failure = true;
                $scope.assocId = '';
            };
        };
    };

    $scope.nonEmployeeBtn = function () {
        $scope.assocInfo = '';
        $scope.assocId = '';
        $scope.assocFound = false;
        $scope.nonEmployeeInfo = '';
        $scope.nonEmployee = true;
    };

    $scope.resetAssoc = function () {
        $scope.assocInfo = '';
        $scope.assocId = '';
        $scope.assocFound = false;
        $scope.nonEmployeeInfo = '';
        $scope.nonEmployee = false;
    };

    $scope.selectBodyPart = function () {
        ModalService.showModal({
            templateUrl: 'templates/dialogs/bodyPop.html',
            controller: function ($scope, $rootScope, close) {
                $scope.airData = {
                    bodyPart: ''
                };
                $scope.save = function () {
                    close($scope.airData.bodyPart);
                };
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (bodyPart) {
                $scope.airData.bodyPart.value = bodyPart;
            });
        });
    };

    $scope.$watch('airData.pptyDmgImages.value', function (n, o) {
        if (angular.isArray(n)) {
            n.forEach(function (imageData, key) {
                var imageLength = ((imageData.length - 22) * (3 / 4)) / 1048576;
                if (imageLength > 2) {
                    $rootScope.changeResponse.message = 'Image #' + (key + 1) + ' is over 2 MBs, and was removed.';
                    $rootScope.changeResponse.warning = true;
                    delete $scope.airData.pptyDmgImages.value[key];
                };
            });
        };
    });

    $scope.$watch('airData.optionalImages.value', function (n, o) {
        if (angular.isArray(n)) {
            n.forEach(function (imageData, key) {
                var imageLength = ((imageData.length - 22) * (3 / 4)) / 1048576;
                if (imageLength > 2) {
                    $rootScope.changeResponse.message = 'Image #' + (key + 1) + ' is over 2 MBs, and was removed.';
                    $rootScope.changeResponse.warning = true;
                    delete $scope.airData.pptyDmgImages.value[key];
                };
            });
        };
    });

    $scope.$watch('airData.objInvolvedWht.value', function (n, o) {
        if (n != '') {
            if (isNaN(Number(n)) && $scope.airData.objInvolved.value == 'Yes') {
                $scope.airData.objInvolvedWht.value = '';
                $rootScope.changeResponse.message = 'Object weight must be a number.';
                $rootScope.changeResponse.failure = true;
                return;
            } else if (Number(n) == 0) {
                $scope.airData.objInvolvedWht.value = '';
                $rootScope.changeResponse.message = 'Object weight must be a positive number.';
                $rootScope.changeResponse.failure = true;
                return;
            }
        }
    });

    $scope.change = function (pageNum) {
        $scope.page = pageNum;
    };

    $scope.saveAIR = function () {
        $scope.airData.pptyDmgImages.value = null;
        $scope.airData.optionalImages.value = null;
        $localStorage.AIRFormData = null;
        $localStorage.assocInfo = null;
        $localStorage.assocInfo = null;
        $localStorage.AIRFormData = JSON.stringify(angular.copy($scope.airData));
        $localStorage.assocInfo = JSON.stringify(angular.copy($scope.assocInfo));
        $localStorage.nonEmployeeInfo = JSON.stringify(angular.copy($scope.nonEmployeeInfo));
        $localStorage.lastSave = new Date();
    };

    $scope.loadAIR = function () {
        if ($localStorage.AIRFormData != null) {
            $scope.airData = JSON.parse(angular.copy($localStorage.AIRFormData));
        };
        if ($localStorage.assocInfo.length > 2) {
            $scope.assocFound = true;
            $scope.assocInfo = JSON.parse(angular.copy($localStorage.assocInfo));
        };
        if ($localStorage.nonEmployeeInfo.length > 2) {
            $scope.assocFound = false;
            $scope.nonEmployee = true;
            $scope.nonEmployeeInfo = JSON.parse(angular.copy($localStorage.nonEmployeeInfo));
        };
    };

    $scope.eraseSavedAIR = function () {
        $localStorage.AIRFormData = null;
        $localStorage.assocInfo = null;
        $localStorage.assocInfo = null;
        $localStorage.lastSave = null;
    };

    $scope.submit = function () {
        if (typeof $localStorage.locationId == 'undefined' || typeof $cookies.get('IsAuthenticated') == 'undefined') {
            $scope.saveAIR();
            $state.go('app.login', { backTo: $state.current.name });
        };

        if (($scope.airData.pptyDmg.value == 'Yes' || $scope.airData.typeOfIncident.value == 'Property or Product Damage') && !angular.isArray($scope.airData.pptyDmgImages.value)) {
            $scope.page = 4;
            $rootScope.changeResponse.message = 'Images for Property Damage Required.';
            $rootScope.changeResponse.failure = true;
            return;
        };

        if ($scope.assocInfo == '' && $scope.nonEmployeeInfo == '') {
            $scope.page = 2;
            $rootScope.changeResponse.message = 'Please search for an associate, or select Non Employee for contractors/ visitors.';
            $rootScope.changeResponse.failure = true;
            return;
        };

        blockUI.start();

        $scope.airData.submitterName = $localStorage.user.loginName;

        $scope.AIRRoster.forEach(function (assoc, id) {
            if ($localStorage.user.id == assoc.wmsid) {
                $scope.airData.submitterName = assoc.fullName;
                return;
            };
        });

        $scope.airData.dateTimeOfIncident.value = new Date($scope.airData.dateTimeOfIncident.value);

        $scope.airData.dateTimeOfIncident.value.setMinutes($scope.airData.dateTimeOfIncident.value.getMinutes() - $scope.airData.dateTimeOfIncident.value.getTimezoneOffset());

        $scope.airData.dateTimeIncidentReported.value = new Date($scope.airData.dateTimeIncidentReported.value);

        $scope.airData.dateTimeIncidentReported.value.setMinutes($scope.airData.dateTimeIncidentReported.value.getMinutes() - $scope.airData.dateTimeIncidentReported.value.getTimezoneOffset());

        $scope.airData.actionPlanDate.value = new Date($scope.airData.actionPlanDate.value);

        $scope.airData.actionPlanDate.value.setMinutes($scope.airData.actionPlanDate.value.getMinutes() - $scope.airData.actionPlanDate.value.getTimezoneOffset());

        if ($scope.airData.previousInjuryDate.value != '') {
            $scope.airData.previousInjuryDate.value = new Date($scope.airData.previousInjuryDate.value);

            $scope.airData.previousInjuryDate.value.setMinutes($scope.airData.previousInjuryDate.value.getMinutes() - $scope.airData.previousInjuryDate.value.getTimezoneOffset());
        };

        $scope.airData.fc = $scope.fc;

        $scope.airData.assocFound = $scope.assocFound;

        $scope.airData.assocInfo = $scope.assocInfo;

        $scope.airData.nonEmployee = $scope.nonEmployee;

        $scope.airData.nonEmployeeInfo = $scope.nonEmployeeInfo;

        SafetyAPI.submitAIR($scope.airData)
            .then(function (response) {
                if (+response > 0 && angular.isNumber(+response)) {
                    $scope.airData = airDataReset

                    $scope.assocInfo = '';

                    $scope.nonEmployeeInfo = '';

                    $scope.assocFound = false;

                    $scope.nonEmployee = false;

                    $localStorage.AIRFormData = null;

                    $localStorage.assocInfo = null;

                    $localStorage.assocInfo = null;

                    $localStorage.lastSave = null;

                    $scope.page = 1;

                    $rootScope.changeResponse.message = 'AIR Submitted successfully!';

                    $rootScope.changeResponse.success = true;

                    blockUI.stop();

                } else {
                    $rootScope.changeResponse.message = "Error: " + response.error;

                    $rootScope.changeResponse.falure = true;

                    blockUI.stop();
                };
            }, function (err) {
                if (angular.isObject(err)) {
                    $rootScope.changeResponse.message = "Error: " + err.error;

                    $rootScope.changeResponse.falure = true;
                } else {
                    $rootScope.changeResponse.message = "Error: Could not connect to the server.";

                    $rootScope.changeResponse.falure = true;

                    blockUI.stop();
                }
            });
    };

})

.factory('getDateOfWeek', function () {
    return function getDateOfISOWeek(w, y) {
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 7 - simple.getDay());
        return ISOweekStart;
    }
})

.factory('CSAPI', function ($http, removeDiacritics, $httpParamSerializer, $localStorage, ZuPortal_CONFIG) {
    return {
        zipcodeData: function (zipcode) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + zipcode + '&sensor=true')
                .then(function (data) {
                    var info = {
                        city: null,
                        state: null
                    };
                    if (angular.isArray(data.data.results)) {
                        data.data.results.forEach(function (value, index) {
                            if (value.address_components.length == 3 || value.address_components.length == 4) {
                                info.city = removeDiacritics.replace(value.address_components[1].short_name);
                                info.state = removeDiacritics.replace(value.address_components[2].short_name);
                            } else if (value.address_components.length == 5) {
                                info.city = removeDiacritics.replace(value.address_components[1].short_name);
                                info.state = removeDiacritics.replace(value.address_components[3].short_name);
                            } else if (value.address_components.length == 6) {
                                info.city = removeDiacritics.replace(value.address_components[2].short_name);
                                info.state = removeDiacritics.replace(value.address_components[5].short_name);
                            }
                        });
                    };

                    return info;

                }, function (error) {
                    return error.data;
                });
        },
        submitOrderSwap: function (data) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/CSReturnForm.aspx', $httpParamSerializer({
                OrderSwapData: data,
                username: $localStorage.user.loginName
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        getReport: function (fromDate, toDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSReturnsReport.aspx', { params: { fromDate: fromDate, toDate: toDate } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        getReportFC: function (fromDate, toDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSReturnsReport.aspx', {
                params: {
                    fromDate: fromDate,
                    toDate: toDate,
                    locationId: $localStorage.locationId
                }
            })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        getExport: function (fromDate, toDate) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSReturnsExport.aspx', { params: { fromDate: fromDate, toDate: toDate } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        uploadUPSData: function (json) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/CSUploadUPSData.aspx', $httpParamSerializer({
                data: json
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        getRoster: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSRoster.aspx')
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        updateTitle: function (row, newEntry) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/CSUpdateTitle.aspx', $httpParamSerializer({
                agentId: row.connectFirstId,
                position: row.title,
                newEntry: newEntry
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        updateDate: function (agentId, colName, newValue) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/CSUpdateDate.aspx', $httpParamSerializer({
                agentId: agentId,
                colName: colName,
                newValue: newValue
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        createFeedback: function (row) {
            //return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/CSCreateFeedback.aspx', $httpParamSerializer({
            return $http.post('http://localhost:56415/injections/CSCreateFeedback.aspx', $httpParamSerializer({
                data: row
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    };
})

.controller('CSProd', function ($scope, $rootScope, $timeout, $http, $sessionStorage, $localStorage, uiGridConstants, ModalService, getDateOfWeek, blockUI, ZuPortal_CONFIG, CSAPI) {

    $scope.weekSelect = '';

    $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSProdWeeks.aspx')
        .then(function (res) {
            if (angular.isArray(res.data)) {
                $scope.weeks = res.data;
            };
        });

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100, 200, 300, 400, 500],
        enableFiltering: true,
        enableSelectAll: true,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.getData = function () {
        $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/CSProdData.aspx', { params: { week: $scope.weekSelect } })
        .then(function (res) {
            if (angular.isArray(res.data)) {
                var data = res.data;
                $scope.gridOptions.data = [];
                var tempData = []

                _.uniq(_.pluck(data, 'weekArray')).forEach(function (array, i) {
                    if (array.split(',').length == 4) {
                        $scope.weekStartDays = _.sortBy(array.split(','), function (date) { return date; });
                        return;
                    }
                });

                data.forEach(function (associate, index) {
                    associate.weeks = {}
                    associate.weekArray = associate.weekArray.split(',');
                    associate.contactsArray = associate.contactsArray.split(',');
                    associate.hoursArray = associate.hoursArray.split(',');
                    associate.weekArray.forEach(function (weekDay) {
                        associate.weeks[$scope.weekStartDays.indexOf(weekDay)] = {
                            contacts: +associate.contactsArray[associate.weekArray.indexOf(weekDay)],
                            hours: +associate.hoursArray[associate.weekArray.indexOf(weekDay)],
                            cph: +associate.contactsArray[associate.weekArray.indexOf(weekDay)] / +associate.hoursArray[associate.weekArray.indexOf(weekDay)],
                            madeGoal: +associate.contactsArray[associate.weekArray.indexOf(weekDay)] / +associate.hoursArray[associate.weekArray.indexOf(weekDay)] >= +associate.cph_goal,
                            madeMin: +associate.contactsArray[associate.weekArray.indexOf(weekDay)] / +associate.hoursArray[associate.weekArray.indexOf(weekDay)] >= +associate.cph_min
                        }
                    });
                    if (associate.weeks[3] && associate.weeks[3].hours >= 9) {
                        associate.fourWeek = {
                            contacts: _.reduce(associate.contactsArray, function (memo, num) { return +memo + +num; }, 0),
                            hours: Math.round(_.reduce(associate.hoursArray, function (memo, num) { return +memo + +num; }, 0) * 100) / 100,
                            cph: Math.round(_.reduce(associate.contactsArray, function (memo, num) { return +memo + +num; }, 0) / _.reduce(associate.hoursArray, function (memo, num) { return +memo + +num; }, 0) * 100) / 100,
                            madeGoal: _.reduce(associate.contactsArray, function (memo, num) { return +memo + +num; }, 0) / _.reduce(associate.hoursArray, function (memo, num) { return +memo + +num; }, 0) >= +associate.cph_goal,
                            madeMin: _.reduce(associate.contactsArray, function (memo, num) { return +memo + +num; }, 0) / _.reduce(associate.hoursArray, function (memo, num) { return +memo + +num; }, 0) >= +associate.cph_min
                        };
                        tempData.push(associate)
                    }
                });
                $scope.titles = _.object(_.uniq(_.pluck(tempData, 'positionId')), _.uniq(_.pluck(tempData, 'positionName')))

                var titleObject = _.object(_.uniq(_.pluck(tempData, 'positionName')), _.uniq(_.pluck(tempData, 'positionId')));
                var titlesFilter = []
                angular.forEach(titleObject, function (title, i) {
                    titlesFilter.push({
                        label: i,
                        value: title
                    });
                });

                $scope.gridOptions.data = _.sortBy(tempData, function (assoc) { return -assoc.weeks[3].cph });

                $scope.gridOptions.columnDefs = [
                    {
                        name: 'fullName',
                        displayName: 'Agent Name',
                        width: 150,
                        pinnedLeft: true,
                        enableColumnMenu: false
                    },
                    {
                        name: 'positionId',
                        displayName: 'Title',
                        width: 95,
                        pinnedLeft: true,
                        filter: {
                            noTerm: true,
                            type: uiGridConstants.filter.SELECT,
                            selectOptions: titlesFilter
                        },
                        cellTemplate: '<div>{{ grid.appScope.titles[row.entity.positionId] }}</div>',
                        pinnedLeft: true,
                        enablePinning: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false
                    },
                    {
                        name: 'goal',
                        displayName: 'Goal/Min',
                        width: 80,
                        pinnedLeft: true,
                        enablePinning: false,
                        enableFiltering: false,
                        enableHiding: false,
                        enableSorting: false,
                        enableColumnMenu: false,
                        cellTemplate: '<div>{{ row.entity.cph_goal | number : 1 }}/{{ row.entity.cph_min | number : 1 }}</div>'
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
                        name: 'managerName',
                        displayName: 'Supervisor',
                        width: 150,
                        pinnedLeft: true,
                        enableColumnMenu: false
                    },
                    {
                        name: 'fourWeekData',
                        width: 200,
                        pinnedRight: true,
                        sort: {
                            enabled: false,
                            type: null
                        },
                        displayName: 'Four Week Data',
                        headerCellTemplate: '<div style="text-align: center">{{ col.displayName }}<br><br><div style="width: 100%"><div style="width: 50%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'contacts\')" class="tableCellHeader">Contacts</div><div style="width: 25%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'hours\')" class="tableCellHeader">Hrs.</div><div style="width: 25%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'cph\')" class="tableCellHeader">CPH</div></div></div>',
                        cellTemplate: '<div style="text-align: center; width: 100%; margin: 0 !important" class="row" ng-class="{\'label-warning\' : row.entity.fourWeek.madeMin && !row.entity.weeks[3].madeMin , \'label-danger whiteText\' : !row.entity.fourWeek.madeMin && !row.entity.weeks[3].madeMin, \'label-success whiteText\' : row.entity.weeks[3].madeGoal}">\n    <div style="width: 50%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.contacts }}</div>\n    <div style="width: 25%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.hours }}</div>\n    <div style="width: 25%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.fourWeek.cph | number: 3 }}</div>\n</div>\n',
                        enableColumnMenu: false
                    },
                    {
                        name: 'exempt',
                        width: 65,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedRight: true,
                        enableHiding: false,
                        displayName: 'Exempt',
                        cellTemplate: '<button onclick="return false;" ng-click="grid.appScope.exempt(row.entity, col)" ng-class="{\'btn btn-default btn-sm\': !row.entity.exempt,\'btn btn-info btn-sm\' : row.entity.exempt}" ng-disabled="row.entity.fourWeek.madeGoal || row.entity.weeks[3].madeGoal">Exempt</button>\n',
                        enableColumnMenu: false
                    },
                    {
                        name: 'level',
                        width: 160,
                        enableFiltering: false,
                        enableSorting: false,
                        pinnedRight: true,
                        enableHiding: false,
                        displayName: 'Progressive Action',
                        cellTemplate: '<select class="btn btn-sm" ng-model="row.entity.caLevel" style="height: 30px;" ng-disabled="row.entity.weeks[3].madeGoal || row.entity.exempt">\n    <option value="" disabled selected>Action</option>\n    <option value="0" ng-selected="row.entity.weeks[3].madeGoal" ng-if="row.entity.weeks[3].madeGoal">Positive</option>\n    <option value="1">Verbal Coaching</option>\n    <option value="2">PIP 1</option>\n    <option value="3">PIP 2</option>\n    <option value="4">PIP 3</option>\n    <option value="6">Written Warning</option>\n    <option value="7">Final Written</option>\n    <option value="8">Termination</option>\n</select>\n',
                        enableColumnMenu: false
                    }
                ];

                for (var i = 0; i < 4; i++) {
                    var date = new Date($scope.weekStartDays[i]);

                    date.setHours(date.getHours() + 168);
                    $scope.gridOptions.columnDefs.push({
                        name: 'week' + (i + 1),
                        width: 200,
                        enableHiding: true,
                        sort: {
                            enabled: false,
                            type: null
                        },
                        displayName: { weekNum: 'Week ' + (i + 1), date: $scope.weekStartDays[i], displayDate: date, index: i },
                        headerCellTemplate: '<div style="text-align: center">{{ col.displayName.weekNum }}<br>WE Monday {{ col.displayName.displayDate | date : \'shortDate\' }}<br><div style="width: 100%"><div style="width: 50%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'contacts\')" class="tableCellHeader">Contacts</div><div style="width: 25%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'hours\')" class="tableCellHeader">Hrs.</div><div style="width: 25%;cursor:pointer" ng-click="grid.appScope.sortCol(col, \'cph\')" class="tableCellHeader">CPH</div></div></div>',
                        cellTemplate: '<div style="text-align: center; width: 100%; margin: 0 !important" class="row" ng-class="{\'label-danger whiteText\' : !row.entity.weeks[col.displayName.index].madeMin, \'label-success whiteText\' : row.entity.weeks[col.displayName.index].madeGoal}" ng-if="row.entity.weeks[col.displayName.index]">\n    <div style="width: 50%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.weeks[col.displayName.index].contacts }}</div>\n    <div style="width: 25%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.weeks[col.displayName.index].hours }}</div>\n    <div style="width: 25%; padding: 2px !important; border: 1px solid #ccc;" class="col-xs-3">{{ row.entity.weeks[col.displayName.index].cph | number: 3 }}</div>\n</div>',
                        enableColumnMenu: false
                    })
                }
            };
        });
    };

    $scope.sortCol = function (col, columnName) {
        for (var i = 4; i <= 8; i++) {
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
                case 'fourWeekData':
                    if (col.sort.type == 'asc') {
                        return -assoc.fourWeek[columnName];
                    } else {
                        return assoc.fourWeek[columnName];
                    };
                default:
                    if (col.sort.type == 'asc') {
                        return !assoc.weeks[col.displayName.index] ? 1000 : -assoc.weeks[col.displayName.index][columnName];
                    } else {
                        return !assoc.weeks[col.displayName.index] ? -1000 : assoc.weeks[col.displayName.index][columnName];
                    };
            };
        });
    };

    $scope.exempt = function (row, col) {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n	<div class="modal-dialog">\n		<div class="modal-content">\n			<div class="modal-header">\n				<button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button> \n				<h4 class="modal-title">Expemption for {{ data.fullName }}</h4>\n			</div>\n			<div class="modal-body">\n			Description:<br>\n				<textarea ng-model="exemptReason" class="form-control" style="height: 100%; width: 100%; font-size: 20px;" rows="12"></textarea>\n			</div>\n			<div class="modal-footer"> <button type="button" ng-click="close()" class="btn btn-danger" data-dismiss="modal">Close</button> <button type="button" ng-click="save()" class="btn btn-success" data-dismiss="modal">Save</button></div>\n		</div>\n	</div>\n</div>',
            controller: 'exemptionController',
            inputs: {
                data: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                if (result > '') {
                    row.exemptReason = result;
                    row.exempt = true;
                } else {
                    row.exemptReason = '';
                    row.exempt = false;
                }
            });
        });
    };

    $scope.submitFeedbacks = function (selected) {
        blockUI.start();
        for (var i = 0; i < selected.length; i++) {
            CSAPI.createFeedback(selected[i])
            .then(function (res) {
                blockUI.stop();
                if (angular.isObject(res.Success)) {
                    row.oldTitle = row.title;
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
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
        }
    };

})

.controller('CSRoster', function ($scope, $rootScope, $localStorage, CSAPI, blockUI, uiGridConstants) {
    $scope.$local = $localStorage;

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100, 200, 300, 400, 500, 1000, 2000],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'Employees.csv',
        exporterSuppressColumns: ['view', 'badge'],
        onRegisterApi: function registerGridApi(gridApi) {
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                if (!newValue) {
                    $scope.gridOptions.data.forEach(function (assoc, i) {
                        if (assoc.connectFirstId == rowEntity.connectFirstId) {
                            $scope.gridOptions.data[i][colDef.name] = oldValue;
                            $rootScope.changeResponse = {
                                failure: true,
                                message: 'New values cannot be null!'
                            };
                            return;
                        }
                    });
                    return;
                } else if (newValue == oldValue) {
                    return;
                } else {
                    $scope.changeDate(rowEntity.connectFirstId, colDef, newValue.toJSON().split('.')[0]);
                };
            });
        },
        columnDefs: [
            {
                name: 'fullName',
                displayName: 'Name',
                enableCellEdit: false
            },
            {
                name: 'managerName',
                displayName: 'Supervisor Name',
                enableCellEdit: false
            },
            {
                name: 'connectFirstId',
                displayName: 'Connect-First ID',
                enableCellEdit: false,
                cellFilter: 'lowercase'
            },
            {
                name: 'username',
                displayName: 'Username',
                enableCellEdit: false,
                cellFilter: 'lowercase'
            },
            {
                name: 'email',
                displayName: 'Email',
                enableCellEdit: false
            },
            {
                name: 'oldTitle',
                displayName: 'Title',
                cellTemplate: '<select style="max-height:30px" class="btn btn-xs form-control" ng-options="position.positionId as position.positionName for position in grid.appScope.positions" ng-model="row.entity.title" ng-change="grid.appScope.changeRole(row.entity)"></select>',
                filter: {
                    noTerm: true,
                    type: uiGridConstants.filter.SELECT,
                    selectOptions: []
                },
                enableCellEdit: false
            },
            {
                name: 'hireDate',
                displayName: 'Hire Date',
                type: 'date',
                cellFilter: 'date:\'MM/dd/yy\'',
                enableCellEdit: true
            },
            {
                name: 'promoDate',
                displayName: 'Promo Date',
                type: 'date',
                cellFilter: 'date:\'MM/dd/yy\'',
                enableCellEdit: true
            }
        ]
    };

    blockUI.start();
    CSAPI.getRoster()
        .then(function (res) {
            if (angular.isObject(res)) {
                res.roster.forEach(function (assoc, i) {
                    assoc.hireDate = new Date(assoc.hireDate);
                    assoc.promoDate = new Date(assoc.promoDate);
                });
                $scope.gridOptions.data = res.roster;
                $scope.positions = res.positions
                res.positions.forEach(function (position, i) {
                    $scope.gridOptions.columnDefs[5].filter.selectOptions.push({
                        value: position.positionId,
                        label: position.positionName
                    });
                });
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Roster!'
            };
        });

    $scope.changeRole = function (row) {
        var newEntry = row.oldTitle == 0;

        CSAPI.updateTitle(row, newEntry)
        .then(function (res) {
            if (+res > 0 && angular.isNumber(+res)) {
                row.oldTitle = row.title;
                $rootScope.changeResponse = {
                    success: true,
                    message: 'Title updated successfully.'
                };
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An unknown error has occured. Please try again.'
            };
        });
    };

    $scope.changeDate = function (agentId, colDef, newValue) {
        blockUI.start();
        CSAPI.updateDate(agentId, colDef.name, newValue)
        .then(function (res) {
            if (+res > 0 && angular.isNumber(+res)) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    success: true,
                    message: colDef.displayName + ' updated successfully.'
                };
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An unknown error has occured. Please try again.'
            };
        });
    };
})

.controller('CSReturnsForm', function ($scope, $rootScope, blockUI, CSAPI) {
    $scope.form = {
        orderswap: {
            displayName: 'Order Swap?',
            required: true,
            value: null,
            tab: 0
        },
        containerType: {
            displayName: 'Container Type',
            required: false,
            value: null,
            tab: 0
        },
        pickTicket: {
            displayName: 'Pick Ticket #',
            required: false,
            value: null,
            tab: 0
        },
        verifyLabel: {
            displayName: 'Verify Label',
            required: false,
            value: null,
            tab: 0
        },
        origin: {
            displayName: 'Origin',
            required: false,
            value: null,
            tab: 0
        },
        products: {
            displayName: 'Contents',
            required: true,
            value: null,
            tab: 1
        },
        orderNumber: {
            displayName: 'Order #',
            required: true,
            value: null,
            tab: 1
        },
        createShipment: {
            displayName: 'Create Label?',
            required: true,
            value: null,
            tab: 1
        },
        refunded: {
            displayName: 'Refunded?',
            required: true,
            value: null,
            tab: 1
        },
        disposition: {
            displayName: 'Disposition',
            required: true,
            value: null,
            tab: 1
        },
        international: {
            displayName: 'International?',
            required: true,
            value: null,
            tab: 1
        },
        intendedCustomerName: {
            displayName: 'Intended Customer Name',
            required: false,
            value: null,
            tab: 2
        },
        intendedCustomerEmail: {
            displayName: 'Intended Customer Email',
            required: false,
            value: null,
            tab: 2
        },
        intendedCustomerAddress: {
            displayName: 'Intended Customer Address',
            required: false,
            value: null,
            tab: 2
        },
        intendedCustomerZipcode: {
            displayName: 'Intended Customer Zipcode',
            required: false,
            value: null,
            tab: 2
        },
        intendedCustomerCity: {
            displayName: 'Intended Customer City',
            required: false,
            value: null,
            tab: 2
        },
        intendedCustomerState: {
            displayName: 'Intended Customer State',
            required: false,
            value: null,
            tab: 2
        },
        actualCustomerName: {
            displayName: 'Actual Customer Name',
            required: false,
            value: null,
            tab: 3
        },
        actualCustomerEmail: {
            displayName: 'Actual Customer Email',
            required: false,
            value: null,
            tab: 3
        },
    };

    $scope.$watch('form', function (n, o) {

        var index = 0;

        $scope.required = {};

        $scope.finished = {};

        angular.forEach($scope.form, function (questions, key) {
            if (!$scope.required[index]) {
                $scope.required[index] = _.without(_.map($scope.form, function (item) {
                    if (item.tab == index && item.required) {
                        return item.required;
                    } else {
                        return 0;
                    };
                }), 0);
            };

            if (!$scope.finished[index]) {
                $scope.finished[index] = _.without(_.map($scope.form, function (item) {
                    if (item.tab == index && item.required) {
                        return item.value != null;
                    } else {
                        return 0;
                    };
                }), 0, false);
            };

            index++;
        });
    }, true);

    var formBackup = angular.copy($scope.form);

    $scope.$watch('form.intendedCustomerZipcode.value', function (newValue, oldValue) {
        if (newValue) {
            if (newValue.length == 5 || newValue.length == 10) {
                blockUI.start();
                CSAPI.zipcodeData(newValue)
                    .then(function (res) {
                        blockUI.stop();
                        if (res.city && res.state) {
                            $scope.form.intendedCustomerCity.value = res.city;
                            $scope.form.intendedCustomerState.value = res.state;
                            $rootScope.changeResponse = {
                                success: true,
                                message: 'City: ' + res.city + '<br>State: ' + res.state
                            }
                        } else {
                            $scope.form.intendedCustomerCity.value = null;
                            $scope.form.intendedCustomerState.value = null;
                            $rootScope.changeResponse = {
                                failure: true,
                                message: 'Invalid zipcode'
                            }
                        }
                    }, function (err) {
                        blockUI.stop();
                        $scope.form.intendedCustomerCity.value = null;
                        $scope.form.intendedCustomerState.value = null;
                        $rootScope.changeResponse = {
                            failure: true,
                            message: 'Invalid zipcode'
                        }
                    })
            }
        }
    });



    $scope.tabs = [
        {
            heading: 'FC Related Info',
            visible: true,
            active: true,
            contents: [
                {
                    element: 'select',
                    model: 'orderswap',
                    change: function (orderswap) {
                        $scope.tabs[3].visible = orderswap.id == 1;
                        $scope.tabs[0].contents.forEach(function (item, i) {
                            if (i) {
                                item.visible = orderswap.id == 1;
                            };
                        });
                        angular.forEach($scope.form, function (q, i) {
                            if ((!q.tab && i != 'orderswap') || q.tab == 3) {
                                q.required = orderswap.id == 1;
                                q.value = null;
                            };
                        });
                    },
                    options: [
                        {
                            name: 'Yes',
                            id: 1
                        }, {
                            name: 'No',
                            id: 0
                        }
                    ],
                    header: 'Is this an order swap?:',
                    visible: true,
                    footer: false
                }, {
                    element: 'img',
                    click: function (type) {
                        $scope.form.containerType.value = type;
                    },
                    imgs: [
                        {
                            src: 'css/images/imgBag.jpg',
                            id: 'Bag'
                        }, {
                            src: 'css/images/imgBox.jpg',
                            id: 'Box'
                        }, {
                            src: 'css/images/JiffyBag.png',
                            id: 'JiffyMailer'
                        }
                    ],
                    header: 'Container Type:',
                    visible: false,
                    footer: true,
                    footerText: 'Select whether the container is a bag or box'
                }, {
                    element: 'select',
                    model: 'origin',
                    options: [
                        {
                            name: 'Dropship',
                            id: 'Dropship'
                        }, {
                            name: 'Ohio Core',
                            id: 'CMH'
                        }, {
                            name: 'Ohio Zebra',
                            id: 'CMH_ZPS'
                        }, {
                            name: 'Nevada Core',
                            id: 'RNO'
                        }, {
                            name: 'Nevada Zebra',
                            id: 'RNO_ZPS'
                        }, {
                            name: 'Penn. Core',
                            id: 'ABE'
                        }, {
                            name: 'Penn. Zebra',
                            id: 'ABE_ZPS'
                        }, {
                            name: 'Unknown',
                            id: 'Unknown'
                        }
                    ],
                    header: 'Origin:',
                    visible: false,
                    footer: false
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'pickTicket',
                    placeholder: 'Pick Ticket #',
                    header: 'Pick Ticket:',
                    visible: false,
                    footer: false
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'verifyLabel',
                    placeholder: 'Verify Label',
                    header: 'Verify Label On Package:',
                    visible: false,
                    footer: true,
                    footerText: 'Look on the package and, if you can, record the verify label on the package'
                }
            ]
        }, {
            heading: 'CS Related Info',
            visible: true,
            contents: [
                {
                    element: 'input',
                    type: 'radio',
                    hide: true,
                    model: 'createShipment',
                    radios: [
                        {
                            value: true,
                            label: 'Yes'
                        },
                        {
                            value: false,
                            label: 'No'
                        }
                    ],
                    header: 'Create Label: ',
                    visible: true
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'orderNumber',
                    placeholder: 'Order #',
                    header: 'Order Number:',
                    visible: true,
                    footer: false
                }, {
                    element: 'input',
                    type: 'radio',
                    hide: true,
                    model: 'refunded',
                    radios: [
                        {
                            value: true,
                            label: 'Yes'
                        },
                        {
                            value: false,
                            label: 'No'
                        }
                    ],
                    header: 'Refunded: ',
                    visible: true
                }, {
                    element: 'select',
                    model: 'disposition',
                    options: [
                        {
                            name: 'Item(s) Destroyed',
                            id: 'destroyed'
                        }, {
                            name: 'Item(s) Donated',
                            id: 'donated'
                        }, {
                            name: 'Reshipped to customer',
                            id: 'reshipped'
                        }
                    ],
                    header: 'Disposition:',
                    visible: true,
                    footer: false
                }, {
                    element: 'input',
                    type: 'radio',
                    click: function (international) {
                        $scope.tabs[2].visible = !international;
                        angular.forEach($scope.form, function (q, i) {
                            if (q.tab == 2) {
                                q.required = !international;
                                q.value = null;
                            };
                        });
                    },
                    hide: true,
                    model: 'international',
                    radios: [
                        {
                            value: true,
                            label: 'Yes'
                        },
                        {
                            value: false,
                            label: 'No'
                        }
                    ],
                    header: 'International: ',
                    visible: true
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'products',
                    placeholder: 'Product Information',
                    header: 'Product Information: ',
                    visible: true,
                    footer: true,
                    footerText: 'Separated by commas May be a SKU, Product ID, or a brief item description.'
                }
            ]
        }, {
            heading: 'Intended Customer Info',
            visible: false,
            contents: [
                {
                    element: 'input',
                    type: 'text',
                    model: 'intendedCustomerName',
                    placeholder: 'Name',
                    header: 'Customer Name:',
                    visible: true,
                    footer: true,
                    footerText: 'That the shipment was intended for.'
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'intendedCustomerEmail',
                    placeholder: 'Email',
                    header: 'Customer Email:',
                    visible: true,
                    footer: true,
                    footerText: 'That the shipment was intended for.'
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'intendedCustomerAddress',
                    placeholder: 'Address',
                    header: 'Customer Address:',
                    visible: true,
                    footer: true,
                    footerText: 'That the shipment was intended for.'
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'intendedCustomerZipcode',
                    placeholder: 'Zipcode',
                    header: 'Customer Zipcode:',
                    visible: true,
                    footer: true,
                    footerText: 'That the shipment was intended for.'
                }
            ]
        }, {
            heading: 'Actual Customer Info',
            visible: false,
            contents: [
                {
                    element: 'input',
                    type: 'text',
                    model: 'actualCustomerName',
                    placeholder: 'Name',
                    header: 'Customer Name:',
                    visible: true,
                    footer: true,
                    footerText: 'That received the shipment in error.'
                }, {
                    element: 'input',
                    type: 'text',
                    model: 'actualCustomerEmail',
                    placeholder: 'Email',
                    header: 'Customer Email:',
                    visible: true,
                    footer: true,
                    footerText: 'That received the shipment in error.'
                }
            ]
        }
    ];

    var backup = {
        form: angular.copy($scope.form),
        tabs: angular.copy($scope.tabs)
    };

    $scope.submit = function () {
        blockUI.start();
        CSAPI.submitOrderSwap(JSON.stringify($scope.form))
            .then(function (response) {
                blockUI.stop();
                if (+response > 0 && angular.isNumber(+response)) {
                    $scope.form = backup.form;
                    $scope.tabs = backup.tabs;
                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Return Logged Successfully!'
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Encountered an error, please try again!'
                    }
                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Encountered an error, please try again!'
                }
            });
    };
})

.controller('CSReturnsReport', function ($scope, $rootScope, blockUI, CSAPI, csvParser) {
    $scope.dateRange = {
        to: '',
        from: ''
    }
    $scope.fromDate = '';
    $scope.toDate = '';

    $scope.csv = {
        input: null
    };

    $scope.uploadFile = function () {
        var validCheck = $scope.csv.input != null;

        var fileInput = $scope.csv.input.split(',')[1];

        var inputFormat = $scope.csv.input.split(',')[0];

        if (inputFormat == csvParser.desiredFormat && validCheck) {
            blockUI.start();

            var fileResult = csvParser.convert(atob(fileInput));

            CSAPI.uploadUPSData(fileResult)
                .then(function (response) {
                    blockUI.stop();
                    $scope.csv.input = null;
                    if (+response > 0 && angular.isNumber(+response)) {
                        $rootScope.changeResponse = {
                            success: true,
                            message: 'File Upload Successfully!<br>' + response.toString() + ' Tracking numbers entered.'
                        };
                    } else {
                        $rootScope.changeResponse = {
                            failure: true,
                            message: 'Encountered an error, please try again!'
                        };
                    }
                }, function (err) {
                    blockUI.stop();
                    $scope.csv.input = null;
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Encountered an error, please try again!'
                    };
                });
        } else {
            $rootScope.changeResponse = {
                failure: true,
                message: 'Invalid file format!'
            };
            $scope.csv.input = null
        }
    };

    $scope.getReport = function (from, to) {
        if (from == '' || to == '') {
            return;
        } else {
            blockUI.start();
            var fromDate = new Date(angular.copy(from));
            fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
            var toDate = new Date(angular.copy(to));
            toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
            CSAPI.getReport(fromDate, toDate)
                .then(function (data) {
                    blockUI.stop();
                    if (angular.isArray(data) && data.length > 0) {

                        var now = new Date();
                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                        $scope.gridOptions.exporterCsvFilename = 'CS_Returns_Report_' + now.toJSON().split('.')[0].toString() + '.csv';
                        $scope.gridOptions.columnDefs = [];
                        angular.forEach(data[0], function (value, key) {
                            $scope.gridOptions.columnDefs.push({
                                name: key,
                                displayName: key
                            });
                        });
                        $scope.gridOptions.data = data;
                    } else {
                        $rootScope.changeResponse = {
                            failure: true,
                            message: 'No data to display!'
                        }
                    }
                }, function (err) {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get report!'
                    }
                });
        };
    };

    $scope.getExport = function (from, to) {
        if (from == '' || to == '') {
            return;
        } else {
            blockUI.start();
            var fromDate = new Date(angular.copy(from));
            fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
            var toDate = new Date(angular.copy(to));
            toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
            CSAPI.getExport(fromDate, toDate)
                .then(function (data) {
                    blockUI.stop();
                    if (angular.isArray(data) && data.length > 0) {

                        var now = new Date();
                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                        $scope.gridOptions.exporterCsvFilename = 'UPS_Export_' + now.toJSON().split('.')[0].toString() + '.csv';
                        $scope.gridOptions.columnDefs = [];
                        angular.forEach(data[0], function (value, key) {
                            $scope.gridOptions.columnDefs.push({
                                name: key,
                                displayName: '',
                            });
                        });
                        $scope.gridOptions.data = data;
                    } else {
                        $rootScope.changeResponse = {
                            failure: true,
                            message: 'No data to display!'
                        }
                    }
                }, function (err) {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get export!'
                    }
                });
        };
    };

    $scope

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: []
    };
})

.controller('OrderSwapReport', function ($scope, $rootScope, blockUI, CSAPI, csvParser, $localStorage) {
    $scope.dateRange = {
        to: '',
        from: ''
    };

    $scope.$local = $localStorage;

    $scope.getReport = function (from, to) {
        if (from == '' || to == '') {
            return;
        } else {
            blockUI.start();
            var fromDate = new Date(angular.copy(from));
            fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
            var toDate = new Date(angular.copy(to));
            toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
            CSAPI.getReportFC(fromDate, toDate)
                .then(function (data) {
                    blockUI.stop();
                    if (angular.isArray(data) && data.length > 0) {

                        var now = new Date();
                        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                        $scope.gridOptions.exporterCsvFilename = 'Order_Swap_Report_' + now.toJSON().split('.')[0].toString() + '.csv'
                        $scope.gridOptions.data = data;
                    } else {
                        $rootScope.changeResponse = {
                            failure: true,
                            message: 'No data to display!'
                        }
                    }
                }, function (err) {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get report!'
                    }
                });
        };
    };

    $scope.URLs = {
        1: 'http://rno-ui.rno.corp.zulily.com',
        2: 'http://cbs-ui.corp.zulily.com',
        3: 'http://abe-ui.abe.corp.zulily.com',
        4: 'http://zbrrno-ui.rno.corp.zulily.com',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com',
        6: 'http://zbrabe-ui.abe.corp.zulily.com'
    }

    $scope.gridOptions = {
        data: [],
        columnDefs: [
            {
                name: 'originFC',
                displayName: 'FC',
                width: 50
            },
            {
                name: 'pickTicket',
                displayName: 'Pick Ticket #',
                cellTemplate: '<a ng-href="{{ grid.appScope.URLs[grid.appScope.$local.locationId] }}/fulfillment/shipping/shipment_search_results.aspx?search={{ row.entity.pickTicket | uppercase }}" target="_blank">{{ row.entity.pickTicket | uppercase }}</a>',
                width: 200
            },
            {
                name: 'containertype',
                displayName: 'Container Type',
                width: 200
            },
            {
                name: 'verifyLabel',
                displayName: 'Verify Label',
                cellTemplate: '<a ng-href="{{ grid.appScope.URLs[grid.appScope.$local.locationId] }}/fulfillment/shipping/shipment_search_results.aspx?search={{ row.entity.verifyLabel | uppercase }}" target="_blank">{{ row.entity.verifyLabel | uppercase }}</a>',
                pinnedLeft: true,
                width: 200
            },
            {
                name: 'productInfo',
                displayName: 'Contents',
                width: 200
            },
            {
                name: 'icustName',
                displayName: 'Intended Customer Name',
                width: 200
            },
            {
                name: 'icustAddress',
                displayName: 'Intended Customer Address',
                width: 200
            },
            {
                name: 'icustCity',
                displayName: 'Intended Customer City',
                width: 200
            },
            {
                name: 'icustState',
                displayName: 'Intended Customer State',
                width: 200
            },
            {
                name: 'acustName',
                displayName: 'Actual Customer Name',
                width: 200
            },
            {
                name: 'trackingNumber',
                displayName: 'Tracking Number',
                cellTemplate: '<a ng-href="http://wwwapps.ups.com/WebTracking/track?track=yes&trackNums={{ row.entity.trackingNumber }}" target="_blank">{{ row.entity.trackingNumber }}</a>',
                width: 200
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date: "short"',
                width: 200
            }
        ],
        paginationPageSizes: [25, 50, 75, 100],
        enableColumnResizing: true,
        enableFiltering: true,
        enablePinning: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        }
    };
})

.controller('exemptionController', function ($scope, $rootScope, data, close) {
    $scope.exemptReason = data.exemptReason || '';
    $scope.data = data;
    $scope.exit = false;
    $scope.save = function () {
        $scope.exit = true;
        close($scope.exemptReason);
    };
})

.factory('EmployeesAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        getRoster: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/activeRoster.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        getNonRoster: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/inactiveRoster.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        updateWMSEmployees: function () {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/updateWMSEmployees.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        uploadEmployeeImage: function (imageData, username) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/uploadEmployeeImage.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                imageData: imageData,
                username: username
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        getUserInfo: function (userId, isEmployee) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/getUserInfo.aspx', $httpParamSerializer({
                locationId: $localStorage.locationId,
                userId: userId,
                isEmployee: isEmployee
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        getZuPortalCapabilities: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/capabilities.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        updateEmpPerm: function (action, permName, userId, locationId) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/updateEmpPerm.aspx', $httpParamSerializer({
                action: action,
                permName: permName,
                userId: userId,
                locationId: locationId,
                assignedBy: $localStorage.user.loginName
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        attachWindows: function (username, password, wmsId, wmsUsername, locationId) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/attachWindows.aspx', $httpParamSerializer({
                username: username,
                password: password,
                wmsId: wmsId,
                wmsUsername: wmsUsername,
                locationId: locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        removeWindows: function (wmsId, locationId) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/removeWindows.aspx', $httpParamSerializer({
                wmsId: wmsId,
                locationId: locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        }
    }
})

.controller('BadgeTool', function ($scope, $rootScope, $localStorage, $sessionStorage, EmployeesAPI, blockUI, uiGridConstants, $http, $timeout, $stateParams) {
    $scope.assocSearch = '';

    $scope.$local = $localStorage;

    $scope.employeeUrls = {
        1: 'http://rno-ui.rno.corp.zulily.com:9050/user/#/',
        2: 'http://cbs-ui.corp.zulily.com:9050/user/#/',
        3: 'http://abe-ui.abe.corp.zulily.com:9050/user/#/',
        4: 'http://zbrrno-ui.rno.corp.zulily.com:9050/user/#/',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com:9050/user/#/',
        6: 'http://zbrabe-ui.abe.corp.zulily.com/:9050/user/#/'
    }

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'Roster.csv',
        exporterSuppressColumns: ['view', 'edit'],
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        }
    };

    $scope.getEmployees = function () {
        blockUI.start();
        EmployeesAPI.getRoster()
            .then(function (res) {
                if (angular.isArray(res)) {
                    $scope.table = {
                        employees: true,
                        nonEmployees: false
                    };
                    $scope.gridOptions.columnDefs = [
                            {
                                name: 'fullName',
                                displayName: 'Name',
                                width: 200
                            },
                            {
                                name: 'kronosId',
                                displayName: 'Kronos Id'
                            },
                            {
                                name: 'func',
                                displayName: 'Function'
                            },
                            {
                                name: 'shift',
                                displayName: 'Shift'
                            },
                            {
                                name: 'type',
                                displayName: 'Employer'
                            },
                            {
                                name: 'username',
                                displayName: 'WMS Login',
                                width: 150
                            },
                            {
                                name: 'managerName',
                                displayName: 'Manager',
                                width: 200
                            },
                            {
                                name: 'view',
                                displayName: '',
                                pinnedRight: true,
                                headerCellTemplate: '<div></div>',
                                cellTemplate: '<div style="width: 89%"><button class="btn btn-info btn-sm btn-block" ng-click="grid.appScope.viewAssoc(row.entity)" ng-if="row.entity.username != null">View</button><a ng-href="{{ grid.appScope.employeeUrls[grid.appScope.$local.locationId] }}userSummary/" target="_blank" class="btn btn-danger btn-sm btn-block" ng-if="row.entity.username == null" title="Might have wrong KronosId in WMS">Search</a></div>'
                            }
                    ];
                    $scope.gridOptions.data = res;
                    blockUI.stop();
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get Roster!'
                    };
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            });
        ;
    };

    $scope.getNonEmployees = function () {
        blockUI.start();
        EmployeesAPI.getNonRoster()
            .then(function (res) {
                if (angular.isArray(res)) {
                    $scope.table = {
                        employees: false,
                        nonEmployees: true
                    };
                    $scope.gridOptions.columnDefs = [
                            {
                                name: 'fullName',
                                displayName: 'Name',
                                width: 200
                            },
                            {
                                name: 'username',
                                displayName: 'WMS Login',
                                width: 150
                            },
                            {
                                name: 'active',
                                displayName: 'WMS Status',
                                cellTemplate: '<div ng-if="row.entity.active == 1">Active</div><div ng-if="row.entity.active == 0">Inactive</div>',
                                width: 150
                            },
                            {
                                name: 'view',
                                displayName: '',
                                pinnedRight: true,
                                headerCellTemplate: '<div></div>',
                                cellTemplate: '<div style="width: 89%"><button class="btn btn-info btn-sm btn-block" ng-click="grid.appScope.viewAssoc(row.entity)">View</button></div>'
                            }
                    ];
                    $scope.gridOptions.data = res;
                    blockUI.stop();
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get Roster!'
                    };
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            });

    };

    $scope.getEmployees();

    $scope.table = {
        employees: true,
        nonEmployees: false
    };


    $scope.activeAssoc = {
        firstName: 'Sock',
        lastName: 'Monkey',
        employer: 'Zulily',
        picLink: 'http://zuportal.corp.zulily.com/images/default.jpg',
        badgeBarcode: 'http://zuportal.corp.zulily.com:6174/requests/barcode.aspx?data=monkey&width=206&height=60'
    }

    $scope.viewAssoc = function (row) {
        $stateParams.userId = null;

        blockUI.start();

        $scope.size = {
            firstName: 25,
            lastName: 25
        };

        $scope.pic = {
            forCrop: null,
            forUpload: null
        };

        $http.get(row.picLink)
             .then(function (res) {
                 blockUI.stop();
                 $scope.hasImage = true;
             }, function (err) {
                 blockUI.stop();
                 $scope.hasImage = false;
             });

        $scope.activeAssoc = {
            firstName: row.fullName.split(', ')[1],
            lastName: row.fullName.split(', ')[0],
            employer: row.type,
            username: row.username,
            picLink: row.picLink,
            badgeBarcode: 'http://zuportal.corp.zulily.com:6174/requests/barcode.aspx?data=' + row.badge + '&width=206&height=60'
        };
    };

    $scope.pic = {
        forCrop: null,
        forUpload: null
    };

    $scope.hasImage = false;

    if ($stateParams.userId) {
        blockUI.start();
        var employee = EmployeesAPI.getUserInfo($stateParams.userId, true)
            .then(function (res) {
                blockUI.stop();
                if (angular.isArray(res) && res.length > 0) {
                    var assocInfo = res[0];

                    $scope.activeAssoc = {
                        firstName: assocInfo.firstName,
                        lastName: assocInfo.lastName,
                        employer: assocInfo.type,
                        username: assocInfo.username,
                        picLink: 'http://zuportal.corp.zulily.com/images/' + assocInfo.locationId + '/' + assocInfo.username + '.jpg',
                        badgeBarcode: 'http://zuportal.corp.zulily.com:6174/requests/barcode.aspx?data=' + assocInfo.badge + '&width=206&height=60'
                    };
                } else {
                    EmployeesAPI.getUserInfo($stateParams.userId, false)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isArray(res) && res.length > 0) {
                                var assocInfo = res[0];

                                $scope.activeAssoc = {
                                    firstName: assocInfo.firstName,
                                    lastName: assocInfo.lastName,
                                    employer: 'Zulily',
                                    username: assocInfo.username,
                                    picLink: 'http://zuportal.corp.zulily.com/images/' + assocInfo.locationID + '/' + assocInfo.username + '.jpg',
                                    badgeBarcode: 'http://zuportal.corp.zulily.com:6174/requests/barcode.aspx?data=' + assocInfo.badge + '&width=206&height=60'
                                };
                            } else {
                                $rootScope.changeResponse = {
                                    failure: true,
                                    message: 'Unable to get associates info.'
                                }
                            }
                        }, function (error) {
                            blockUI.stop();
                            $rootScope.changeResponse = {
                                failure: true,
                                message: 'Unable to get associates info.'
                            }
                        });
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get associates info.'
                }
            });
    }

    $scope.$watch('activeAssoc', function (n, o) {
        $http.get(n.badgeBarcode)
            .then(function (res) {
                $scope.barcode = res.data;
            });
    }, true);

    $scope.size = {
        firstName: 25,
        lastName: 25
    };

    $scope.printBadge = function () {
        var printContents = document.getElementById('badgeContainer').innerHTML;
        var popupWin = window.open('', '_blank', 'width=700,height=700');
        popupWin.document.open();
        popupWin.document.write('<html><head><style>\n	.userBadge {\n		width: 204.096px;\n		height: 315px;\n		text-align: center;\n		overflow: hidden;\n	}\n\n	.logo {\n		max-height: 38px;\n		margin-top: 10px;\n	}\n\n	.firstName, .lastName {\n		font-weight: bold;\n		font-family: Arial, Helvetica, sans-serif;\n		width: 100%;\n		margin: 0;\n  		white-space: nowrap;\n  		padding: 0;\n  		line-height: 1;\n	}\n\n	.userPic {\n		width: 105px;\n		height: 130px;\n		margin-top: 5px;\n	}\n\n	.barcode {\n		width: 201px;\n		height: 70px;\n	}\n\n\n</style></head><body onload="window.print()">' + printContents + '</html>');

        setTimeout(function () {
            popupWin.print();
            popupWin.close();
        }, 200);
    };

    $scope.updateWMSEmployees = function () {
        blockUI.start();
        EmployeesAPI.updateWMSEmployees()
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    }
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    }

                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                }
            });
    };

    $scope.uploadImage = function (imageData, username) {
        blockUI.start();
        EmployeesAPI.uploadEmployeeImage(imageData.substr(imageData.indexOf(',') + 1), username)
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    };

                    $scope.pic = {
                        forCrop: null,
                        forUpload: null
                    };
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    };
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                };
            });
    };

    $scope.getCrop = function (picLink) {
        blockUI.start();
        $http.get(picLink, { responseType: "blob" })
            .then(function (res) {
                fr = new FileReader();
                fr.onload = function () {
                    $timeout(function () {
                        blockUI.stop();
                        $scope.pic.forCrop = fr.result;
                    }, 1000)
                };
                fr.readAsDataURL(res.data);
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get image!'
                }
            });
    };
})

.controller('Employees', function ($scope, $rootScope, $localStorage, EmployeesAPI, blockUI, uiGridConstants) {
    $scope.$local = $localStorage;

    $scope.employeeUrls = {
        1: 'http://rno-ui.rno.corp.zulily.com:9050/user/#/',
        2: 'http://cbs-ui.corp.zulily.com:9050/user/#/',
        3: 'http://abe-ui.abe.corp.zulily.com:9050/user/#/',
        4: 'http://zbrrno-ui.rno.corp.zulily.com:9050/user/#/',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com:9050/user/#/',
        6: 'http://zbrabe-ui.abe.corp.zulily.com/:9050/user/#/'
    };

    $scope.table = {
        employees: true,
        nonEmployees: false
    };

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100, 200, 300, 400, 500, 1000, 2000],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'Employees.csv',
        exporterSuppressColumns: ['view', 'badge'],
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        }
    };



    $scope.getEmployees = function () {
        $scope.gridOptions.columnDefs = [];
        blockUI.start();
        EmployeesAPI.getRoster()
            .then(function (res) {
                if (angular.isArray(res)) {
                    $scope.table = {
                        employees: true,
                        nonEmployees: false
                    };
                    $scope.gridOptions.columnDefs = [
                        {
                            name: 'fullName',
                            displayName: 'Name',
                            width: 200
                        },
                        {
                            name: 'kronosId',
                            displayName: 'Kronos Id'
                        },
                        {
                            name: 'seniorityDate',
                            displayName: 'Hire Date',
                            cellFilter: 'date: \'shortDate\''
                        },
                        {
                            name: 'func',
                            displayName: 'Function'
                        },
                        {
                            name: 'shift',
                            displayName: 'Shift'
                        },
                        {
                            name: 'type',
                            displayName: 'Employer'
                        },
                        {
                            name: 'managerName',
                            displayName: 'Manager',
                            width: 200
                        },
                        {
                            name: 'view',
                            displayName: 'Manage Details',
                            pinnedRight: true,
                            enableFiltering: false,
                            enablePinning: false,
                            enableHiding: false,
                            enableSorting: false,
                            cellTemplate: '<div style="width: 89%"><a class="btn btn-info btn-sm btn-block" ui-sref="app.userDetails({ userId : row.entity.wmsId })" target="_blank" ng-if="row.entity.username != null">Manage Details</a><a ui=sref="app.employees" target="_blank" class="btn btn-danger btn-sm btn-block" ng-if="row.entity.username == null" title="Might have wrong KronosId in WMS">Search</a></div>'
                        },
                        {
                            name: 'badge',
                            displayName: 'Print Badge',
                            pinnedRight: true,
                            enableFiltering: false,
                            enablePinning: false,
                            enableHiding: false,
                            enableSorting: false,
                            cellTemplate: '<div style="width: 89%"><a class="btn btn-info btn-sm btn-block" ui-sref="app.badgeTool({ userId : row.entity.wmsId })" target="_blank">Print Badge</a></div>'
                        }
                    ];
                    $scope.gridOptions.data = res;
                    blockUI.stop();
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get Roster!'
                    };
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            });

    };

    $scope.getNonEmployees = function () {
        $scope.gridOptions.columnDefs = [];
        blockUI.start();
        EmployeesAPI.getNonRoster()
            .then(function (res) {
                if (angular.isArray(res)) {
                    $scope.table = {
                        employees: false,
                        nonEmployees: true
                    };
                    $scope.gridOptions.columnDefs = [
                            {
                                name: 'fullName',
                                displayName: 'Name',
                                width: 200
                            },
                            {
                                name: 'username',
                                displayName: 'WMS Login',
                                width: 150
                            },
                            {
                                name: 'active',
                                displayName: 'WMS Status',
                                width: 150
                            },
                            {
                                name: 'view',
                                displayName: 'Manage Details',
                                pinnedRight: true,
                                enableFiltering: false,
                                enablePinning: false,
                                enableHiding: false,
                                enableSorting: false,
                                cellTemplate: '<div style="width: 89%"><a class="btn btn-info btn-sm btn-block" ui-sref="app.userDetails({ userId : row.entity.wmsID })" target="_blank">Manage Details</a></div>'
                            },
                            {
                                name: 'badge',
                                displayName: 'Print Badge',
                                pinnedRight: true,
                                enableFiltering: false,
                                enablePinning: false,
                                enableHiding: false,
                                enableSorting: false,
                                cellTemplate: '<div style="width: 89%"><a class="btn btn-info btn-sm btn-block" ui-sref="app.badgeTool({ userId : row.entity.wmsID })" target="_blank">Print Badge</a></div>'
                            }
                    ];
                    $scope.gridOptions.data = res;
                    blockUI.stop();
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'Unable to get Roster!'
                    };
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            });

    };

    $scope.updateWMSEmployees = function () {
        blockUI.start();
        EmployeesAPI.updateWMSEmployees()
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    }
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    }

                }
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                }
            });
    };

    $scope.getEmployees();
})

.controller('UserDetails', function ($scope, $rootScope, $localStorage, EmployeesAPI, blockUI, $stateParams, $state) {

    $scope.employeeUrls = {
        1: 'http://rno-ui.rno.corp.zulily.com:9050/user/#/userDetail/',
        2: 'http://cbs-ui.corp.zulily.com:9050/user/#/userDetail/',
        3: 'http://abe-ui.abe.corp.zulily.com:9050/user/#/userDetail/',
        4: 'http://zbrrno-ui.rno.corp.zulily.com:9050/user/#/userDetail/',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com:9050/user/#/userDetail/',
        6: 'http://zbrabe-ui.abe.corp.zulily.com/:9050/user/#/userDetail/'
    };

    $scope.letters = {
        Z: {
            margin: '0px'
        },
        U: {
            margin: '75px'
        },
        L1: {
            margin: '150px',
            height: '50px'
        },
        I: {
            margin: '0px'
        },
        L2: {
            margin: '75px'
        },
        Y: {
            margin: '150px'
        }
    };

    $scope.popoverTemplateUrl = 'permissionsPopover.html';

    $scope.changeRole = function (event, permName) {

        EmployeesAPI.updateEmpPerm(event.target.checked, permName, $stateParams.userId, $localStorage.locationId)
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    if (event.target.checked) {
                        $scope.assocInfo.zuportal += ',' + permName;
                    } else {
                        var permissions = $scope.assocInfo.zuportal.split(',');

                        permissions.forEach(function (capability, index) {
                            if (capability == permName) {
                                permissions.splice(index, 1);
                                $scope.assocInfo.zuportal = permissions.join(',');
                            };
                        });
                    };
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    };
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    };

                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                };
            });
    };

    $scope.hasPermission = function (check) {
        var matches = false;

        if ($scope.assocInfo && $scope.assocInfo.zuportal) {
            $scope.assocInfo.zuportal.split(',').forEach(function (balance, i) {
                if (check == balance) {
                    matches = true;
                }
            });
        }

        return matches;
    };

    blockUI.start();

    EmployeesAPI.getZuPortalCapabilities()
        .then(function (res) {
            blockUI.stop();
            if (angular.isArray(res)) {
                $scope.platforms = res;

                if ($stateParams.userId) {
                    blockUI.start();
                    EmployeesAPI.getUserInfo($stateParams.userId, true)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isArray(res) && res.length > 0) {
                                $scope.assocInfo = res[0];

                                $scope.assocInfo.picLink = 'http://zuportal.corp.zulily.com/images/' + $scope.assocInfo.locationId + '/' + $scope.assocInfo.username + '.jpg';

                                $scope.assocInfo.wmsLink = $scope.employeeUrls[$localStorage.locationId] + $scope.assocInfo.wmsId;
                            } else {
                                EmployeesAPI.getUserInfo($stateParams.userId, false)
                                    .then(function (res) {
                                        blockUI.stop();
                                        if (angular.isArray(res) && res.length > 0) {
                                            $scope.assocInfo = res[0];

                                            $scope.assocInfo.picLink = 'http://zuportal.corp.zulily.com/images/' + $scope.assocInfo.locationID + '/' + $scope.assocInfo.username + '.jpg';

                                            $scope.assocInfo.wmsLink = $scope.employeeUrls[$localStorage.locationId] + $scope.assocInfo.wmsID;
                                        } else {
                                            $state.go('app.404', null, {
                                                location: false
                                            });
                                        }
                                    }, function (error) {
                                        blockUI.stop();
                                        $state.go('app.404', null, {
                                            location: false
                                        });
                                    });
                            }
                        }, function (error) {
                            blockUI.stop();
                            $state.go('app.404', null, {
                                location: false
                            });
                        });
                } else {
                    $state.go('app.404', null, {
                        location: false
                    });
                }
            } else {
                blockUI.stop();
            }
        }, function (error) {
            blockUI.stop();
        });

    $scope.loginInfo = {
        username: null,
        password: null
    };

    $scope.attachWindows = function () {
        EmployeesAPI.attachWindows($scope.loginInfo.username, $scope.loginInfo.password, $scope.assocInfo.wmsId, $scope.assocInfo.username, $localStorage.locationId)
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $scope.assocInfo.windowsAttached = 1;
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    };
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    };

                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                };
            });
    };

    $scope.removeWindows = function () {
        EmployeesAPI.removeWindows($scope.assocInfo.wmsId, $localStorage.locationId)
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $scope.assocInfo.windowsAttached = 0;
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    };
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    }
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    };

                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                };
            });
    };
})

.factory('NonInvAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        dashboard: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/NonInvDashboard.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        productDetails: function (skuId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/NonInvProductDetails.aspx', {
                params: {
                    locationId: $localStorage.locationId,
                    id: skuId
                }
            })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        validate: function (value, type) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/nonInvValidation.aspx', $httpParamSerializer({
                value: value,
                type: type,
                locationId: $localStorage.locationId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        check: function (request, type) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/nonInvCheck.aspx', $httpParamSerializer({
                request: request,
                type: type,
                locationId: $localStorage.locationId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        transaction: function (request, type, app) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/nonInvTransaction.aspx', $httpParamSerializer({
                request: request,
                type: type,
                app: app,
                wmsId: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        SKUs: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/NonInvSkus.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        editSku: function (sku) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/nonInvEditSku.aspx', $httpParamSerializer({
                sku: sku,
                locationId: $localStorage.locationId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        addSku: function (form) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/nonInvAddSku.aspx', $httpParamSerializer({
                vendor: form.vendor,
                description: form.description,
                eachType: form.eachType,
                eachPerType: form.eachPerType,
                wmsId: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        uploadImage: function (imageData, skuId) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/uploadNonInvImage.aspx', $httpParamSerializer({
                imageData: imageData,
                skuId: skuId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        Containers: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/NonInvContainers.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        Transactions: function (id, type, limit) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/nonInvTransactions.aspx', {
                params: {
                    id: id,
                    type: type,
                    limit: limit,
                    locationId: $localStorage.locationId
                }
            })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        binDetails: function (binId) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/nonInvBinDetails.aspx', {
                params: {
                    locationId: $localStorage.locationId,
                    id: binId
                }
            })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        disableId: function (id, type) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/nonInvDisable.aspx', $httpParamSerializer({
                id: id,
                type: type
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        enableId: function (id, type) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/nonInvEnable.aspx', $httpParamSerializer({
                id: id,
                type: type
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        deleteId: function (id, type) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/nonInvDelete.aspx', $httpParamSerializer({
                id: id,
                type: type
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        addArea: function (form) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/nonInvAddArea.aspx', $httpParamSerializer({
                name: form.name,
                wmsId: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        addBin: function (form) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'injections/nonInvAddBin.aspx', $httpParamSerializer({
                areaId: form.areaId,
                name: form.binName,
                type: form.binType,
                wmsId: $localStorage.user.id,
                locationId: $localStorage.locationId
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        },
        editBin: function (binDetails) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/nonInvEditBin.aspx', $httpParamSerializer({
                binId: binDetails.binId,
                areaId: binDetails.areaId,
                type: binDetails.binType
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error.data;
                });
        }
    }
})

.controller('NonInvDash', function ($scope, $rootScope, NonInvAPI, blockUI, uiGridConstants, $timeout) {
    blockUI.start();

    NonInvAPI.dashboard()
        .then(function (res) {
            blockUI.stop();
            if (angular.isObject(res)) {
                res.building = {
                    grid: {
                        data: res.building,
                        enableGridMenu: true,
                        exporterMenuPdf: false,
                        paginationPageSizes: [25, 50, 75, 100],
                        exporterCsvFilename: 'Non-Inventory_Building-Rollup.csv',
                        columnDefs: [
                            {
                                name: 'skuName',
                                displayName: 'SKU',
                                cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvProduct({skuId: row.entity.skuId})" target="_blank">{{ row.entity.skuName }}</a></div></div>'
                            },
                            {
                                name: 'description',
                                displayName: 'Description'
                            },
                            {
                                name: 'eachType',
                                displayName: 'Each Type'
                            },
                            {
                                name: 'count',
                                displayName: 'SKU Count',
                                cellFilter: 'number'
                            },
                            {
                                name: 'eachCount',
                                displayName: 'Each Count',
                                cellFilter: 'number'
                            },
                            {
                                name: 'locationTotal',
                                displayName: 'Total',
                                cellFilter: 'number'
                            }
                        ]
                    }
                };

                $scope.allBins = {
                    data: res.location,
                    enableGridMenu: true,
                    exporterMenuPdf: false,
                    paginationPageSizes: [25, 50, 75, 100],
                    exporterCsvFilename: 'Non-Inventory_Location-Rollup.csv',
                    columnDefs: [
                        {
                            name: 'binName',
                            displayName: 'Location',
                            cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvContainers({binId: row.entity.binId})" target="_blank">{{ row.entity.binName }}</a></div></div>'
                        },
                        {
                            name: 'skuName',
                            displayName: 'SKU',
                            cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvProduct({skuId: row.entity.skuId})" target="_blank">{{ row.entity.skuName }}</a></div></div>'
                        },
                        {
                            name: 'description',
                            displayName: 'Description'
                        },
                        {
                            name: 'eachType',
                            displayName: 'Each Type'
                        },
                        {
                            name: 'count',
                            displayName: 'SKU Count',
                            cellFilter: 'number'
                        },
                        {
                            name: 'eachCount',
                            displayName: 'Each Count',
                            cellFilter: 'number'
                        },
                        {
                            name: 'locationTotal',
                            displayName: 'Total',
                            cellFilter: 'number'
                        }
                    ]
                };

                res.location = _.groupBy(res.location, function (sku) { return sku.areaName });
                angular.forEach(res.location, function (bins, areaName) {
                    res.location[areaName] = {
                        grid: {
                            data: bins,
                            paginationPageSizes: [25, 50, 75, 100],
                            enableGridMenu: true,
                            exporterMenuPdf: false,
                            exporterCsvFilename: 'Non-Inventory_Location-Rollup(' + areaName + ').csv',
                            columnDefs: [
                                {
                                    name: 'binName',
                                    displayName: 'Location',
                                    cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvContainers({binId: row.entity.binId})" target="_blank">{{ row.entity.binName }}</a></div></div>'
                                },
                                {
                                    name: 'skuName',
                                    displayName: 'SKU',
                                    cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvProduct({skuId: row.entity.skuId})" target="_blank">{{ row.entity.skuName }}</a></div></div>'
                                },
                                {
                                    name: 'description',
                                    displayName: 'Description'
                                },
                                {
                                    name: 'eachType',
                                    displayName: 'Each Type'
                                },
                                {
                                    name: 'count',
                                    displayName: 'SKU Count',
                                    cellFilter: 'number'
                                },
                                {
                                    name: 'eachCount',
                                    displayName: 'Each Count',
                                    cellFilter: 'number'
                                },
                                {
                                    name: 'locationTotal',
                                    displayName: 'Total',
                                    cellFilter: 'number'
                                }
                            ]
                        }
                    };
                });

                res.sku = _.groupBy(res.sku, function (sku) { return sku.areaName });

                angular.forEach(res.sku, function (skus, areaName) {
                    res.sku[areaName] = {
                        grid: {
                            data: skus,
                            paginationPageSizes: [25, 50, 75, 100],
                            enableGridMenu: true,
                            exporterMenuPdf: false,
                            exporterCsvFilename: 'Non-Inventory_SKU-Rollup(' + areaName + ').csv',
                            columnDefs: [
                                {
                                    name: 'skuName',
                                    displayName: 'SKU',
                                    cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.nonInvProduct({skuId: row.entity.skuId})" target="_blank">{{ row.entity.skuName }}</a></div></div>'
                                },
                                {
                                    name: 'description',
                                    displayName: 'Description'
                                },
                                {
                                    name: 'eachType',
                                    displayName: 'Each Type'
                                },
                                {
                                    name: 'count',
                                    displayName: 'SKU Count',
                                    cellFilter: 'number'
                                },
                                {
                                    name: 'eachCount',
                                    displayName: 'Each Count',
                                    cellFilter: 'number'
                                },
                                {
                                    name: 'locationTotal',
                                    displayName: 'Total',
                                    cellFilter: 'number'
                                }
                            ]
                        }
                    }
                });

                $scope.dashboard = res;
            } else {
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Non Inv Dashboard'
                };
            };
        }, function (err) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Non Inv Dashboard'
            };
        });
})

.controller('NonInvProductDetails', function ($scope, $rootScope, NonInvAPI, blockUI, $stateParams, $state, ModalService, $http) {

    if (!$stateParams.skuId) {
        $state.go('app.404', null, {
            location: false
        });
        return;
    };

    blockUI.start();

    $scope.pic = {
        forCrop: null,
        forUpload: null
    };

    NonInvAPI.productDetails($stateParams.skuId)
        .then(function (res) {
            blockUI.stop();
            if (res.details.length) {
                res.details = res.details[0];
                res.sum = _.reduce(_.pluck(res.inventory, 'quantity'), function (memo, num) { return memo + num; }, 0);
                $scope.product = res;
                $scope.transactions.data = res.transactions;
                $scope.transactions.exporterCsvFilename = res.details.skuId + '-transactions.csv';
            } else {
                $state.go('app.404', null, {
                    location: false
                });
                return;
            };
        }, function (err) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get productDetails'
            };
        });

    $scope.transactions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterSuppressColumns: ['barcode'],
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'fullName',
                displayName: 'Name',
                cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.wmsId })" target="_blank">{{ row.entity.fullName }}</a></div></div>'
            },
            {
                name: 'kronosId',
                displayName: 'Kronos Id'
            },
            {
                name: 'binName',
                displayName: 'Bin Id'
            },
            {
                name: 'skuName',
                displayName: 'Sku Id'
            },
            {
                name: 'description',
                displayName: 'Description'
            },
            {
                name: 'typeName',
                displayName: 'Each Type'
            },
            {
                name: 'quantity',
                displayName: 'Quantity',
                cellFilter: 'number: 2'
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date: \'short\''
            },
        ]
    };

    $scope.showAll = function () {
        blockUI.start();
        NonInvAPI.Transactions($scope.product.details.skuId, 'sku', 0)
        .then(function (res) {
            if (angular.isArray(res)) {
                $scope.transactions.data = res;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Transactions!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Transactions!'
            };
        });
    };

    $scope.adjust = function (product, location) {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/adjust.html',
            controller: function ($scope, $rootScope, product, location, close, blockUI) {

                $scope.location = location;

                $scope.product = product;

                $scope.form = {
                    areaId: location ? location.areaId : null,
                    binId: location ? location.binId : null,
                    skuId: product.skuId,
                    quantity: null
                };

                $scope.check = {
                    location: null,
                    valid: null
                };

                $scope.checkLocation = function () {
                    blockUI.start();
                    NonInvAPI.validate($scope.check.location, 'location')
                        .then(function (res) {
                            blockUI.stop();
                            if (res.Success) {
                                $scope.check.valid = true;
                                $scope.form.binId = res.Success.Data.binId;
                                $scope.form.areaId = res.Success.Data.areaId;
                            } else {
                                $scope.check.valid = false;
                            };
                        }, function (err) {
                            blockUI.stop();
                            $scope.check.valid = false;
                        });
                };

                $scope.submit = function (form) {
                    if (form.quantity == 0) {
                        return;
                    };

                    NonInvAPI.transaction(form, 2, 5)
                        .then(function (res) {
                            if (res.Success) {
                                close(true);
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            close(false);
                        });
                }
            },
            inputs: {
                product: product,
                location: location || null
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (adjusted) {
                if (adjusted) {
                    $state.reload();
                };
            });
        });
    };

    $scope.transfer = function (product, location) {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/transfer.html',
            controller: function ($scope, $rootScope, product, location, close, blockUI) {

                $scope.location = location;

                $scope.product = product;

                $scope.form = {
                    src: {
                        areaId: location.areaId,
                        binId: location.binId
                    },
                    dest: {
                        areaId: null,
                        binId: null
                    },
                    skuId: product.skuId,
                    quantity: null
                };

                $scope.check = {
                    location: null,
                    valid: null
                };

                $scope.checkLocation = function () {
                    if ($scope.check.location == location.binName) {
                        $scope.check.location = null;
                        return;
                    };

                    blockUI.start();
                    NonInvAPI.validate($scope.check.location, 'location')
                        .then(function (res) {
                            blockUI.stop();
                            if (res.Success) {
                                $scope.check.valid = true;
                                $scope.form.dest.binId = res.Success.Data.binId;
                                $scope.form.dest.areaId = res.Success.Data.areaId;
                            } else {
                                $scope.check.valid = false;
                            };
                        }, function (err) {
                            blockUI.stop();
                            $scope.check.valid = false;
                        });
                };

                $scope.submit = function (form) {
                    if (form.quantity == 0) {
                        return;
                    };

                    NonInvAPI.transaction(form, 3, 6)
                        .then(function (res) {
                            if (res.Success) {
                                close(true);
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            close(false);
                        });
                }
            },
            inputs: {
                product: product,
                location: location || null
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (adjusted) {
                if (adjusted) {
                    $state.reload();
                };
            });
        });
    };

    $scope.edit = function (product) {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/editSku.html',
            controller: function ($scope, $rootScope, product, close, blockUI) {

                $scope.product = angular.copy(product);
                $scope.product.title = angular.copy(product['SKU Description']);

                $scope.submit = function (sku) {
                    blockUI.start();
                    NonInvAPI.editSku(sku)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isNumber(+res) && +res > 0) {
                                close(true);
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            blockUI.stop();
                            close(false);
                        });
                }
            },
            inputs: {
                product: product
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (adjusted) {
                if (adjusted) {
                    $state.reload();
                };
            });
        });
    };

    $scope.uploadImage = function (imageData, skuId) {
        blockUI.start();
        NonInvAPI.uploadImage(imageData.substr(imageData.indexOf(',') + 1), skuId)
            .then(function (res) {
                blockUI.stop();
                if (res.Success) {
                    $rootScope.changeResponse = {
                        success: true,
                        message: res.Success
                    };

                    $scope.product.details.image = imageData;

                    $scope.pic = {
                        forCrop: null,
                        forUpload: null
                    };
                } else if (res.Error) {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    };
                } else {
                    $rootScope.changeResponse = {
                        failure: true,
                        message: 'An Unkown Error Has Occured'
                    };
                };
            }, function (err) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'An Unkown Error Has Occured'
                };
            });
    };

    $scope.delete = function (type, id) {
        blockUI.start();
        NonInvAPI.deleteId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                $state.go('app.nonInvSkus');
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.disable = function (type, id) {
        blockUI.start();
        NonInvAPI.disableId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                $state.reload()
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.enable = function (type, id) {
        blockUI.start();
        NonInvAPI.enableId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                $state.reload()
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.print = function (url) {
        $http.get(url)
            .then(function (data) {
                var image = data.data;
                var popupWin = window.open('', '_blank', 'width=900,height=749');
                popupWin.document.open();
                popupWin.document.write('<html><head></head><body>' + image + '</body></html>');

                setTimeout(function () {
                    popupWin.print();
                    popupWin.close();
                }, 200);
            });
    };
})

.controller('NonInvSkus', function ($scope, $rootScope, $localStorage, NonInvAPI, blockUI, uiGridConstants, ModalService) {

    $scope.gridOptions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableFiltering: true,
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        exporterCsvFilename: 'NonInv-Skus.csv',
        exporterSuppressColumns: ['barcode'],
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'skuName',
                displayName: 'SKU'
            },
            {
                name: 'vendor',
                displayName: 'Vendor'
            },
            {
                name: 'description',
                displayName: 'Description'
            },
            {
                name: 'eachType',
                displayName: 'Each Type'
            },
            {
                name: 'eachCount',
                displayName: 'Each Count'
            },
            {
                name: 'barcode',
                displayName: 'Barcode',
                cellTemplate: '<button class="btn btn-primary btn-sm btn-block" ng-click="grid.appScope.viewBarcode(row.entity)">View</button>'
            },
            {
                name: 'skuId',
                displayName: 'Details',
                cellTemplate: '<a class="btn btn-primary btn-sm btn-block" ui-sref="app.nonInvProduct({skuId: row.entity.skuId})" target="_blank">View</a>'
            }
        ]
    };

    blockUI.start();
    NonInvAPI.SKUs()
        .then(function (res) {
            if (angular.isArray(res)) {
                $scope.gridOptions.data = res;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get SKUs!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get SKUs!'
            };
        });

    $scope.viewBarcode = function (sku) {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/barcode.html',
            controller: function ($scope, $rootScope, sku, $http, ZuPortal_CONFIG) {

                $scope.sku = sku;

                $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/barcode.aspx', { params: { data: $scope.sku.skuName } })
                .then(function (data) {
                    $scope.sku.image = data.data;
                }, function (error) {

                });
            },
            inputs: {
                sku: sku
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close;
        });
    };

    $scope.addSku = function () {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/addSku.html',
            controller: function ($scope, $rootScope, close, blockUI) {

                $scope.form = {};
                $scope.submit = function (form) {
                    blockUI.start();
                    NonInvAPI.addSku(form)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isNumber(+res) && +res > 0) {
                                close({ index: res, sku: form });
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            blockUI.stop();
                            close(false);
                        });
                }
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (added) {
                if (added) {
                    var sku = added.sku;

                    $scope.gridOptions.data.push({
                        skuId: added.index,
                        skuName: "ZUNI" + added.index,
                        vendor: sku.vendor,
                        description: sku.description,
                        eachType: sku.eachType,
                        eachCount: sku.eachPerType
                    });

                    $rootScope.changeResponse = {
                        success: true,
                        message: 'ZUNI' + added.index + ' Successfully Added!'
                    };
                };
            });
        });
    }
})

.controller('NonInvContainers', function ($scope, $rootScope, $localStorage, NonInvAPI, blockUI, uiGridConstants, ModalService, $stateParams, $state, $http) {

    blockUI.start();

    $scope.containers = {};

    var containers = NonInvAPI.Containers()
        .then(function (res) {
            if (angular.isObject(res)) {
                $scope.emptyBins = res.emptyBins;
                res = res.containers
                $scope.raw = angular.copy(res);
                var areaNames = _.pluck(res, 'areaName');
                var areaIds = _.pluck(res, 'areaId');
                $scope.areasArray = _.object(areaNames, areaIds);
                $scope.binsArray = _.without(_.pluck(res, 'binName'), null);
                $scope.prefixesArray = _.without(_.uniq(_.map($scope.binsArray, function (binName) { if (binName) return binName.substr(0, 2) })), null);
                res = _.groupBy(res, function (bin) { return bin.areaName });
                angular.forEach(res, function (area, i) {
                    res[i] = {
                        name: i,
                        prefixes: _.groupBy(area, function (bin) { if (bin.binName) return bin.binName.substr(0, 2) }),
                        binCount: area.length,
                        areaId: area[0].areaId,
                        open: false
                    }
                    angular.forEach(res[i].prefixes, function (bins, prefix) {
                        if (bins[0].binId) {
                            res[i].prefixes[prefix] = {
                                bins: bins,
                                open: false
                            };
                        } else {
                            res[i].prefixes = {};
                            res[i].binCount = 0
                        }
                    })
                });
                $scope.containers = res;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Containers!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Containers!'
            };
        });

    $scope.$watch('raw', function () {
        var areaNames = _.pluck($scope.raw, 'areaName');
        var areaIds = _.pluck($scope.raw, 'areaId');
        $scope.areasArray = _.object(areaNames, areaIds);
        $scope.binsArray = _.without(_.pluck($scope.raw, 'binName'), null);
        $scope.prefixesArray = _.without(_.uniq(_.map($scope.binsArray, function (binName) { if (binName) return binName.substr(0, 2) })), null);
    }, true)

    $scope.activate = function (binId) {

        NonInvAPI.binDetails(binId)
        .then(function (res) {
            blockUI.stop();
            if (angular.isObject(res) && res.details.length > 0) {
                $scope.binInfo = {
                    details: res.details[0],
                    inventory: res.inventory,
                    barcode: res.barcode,
                };

                $scope.transactions.data = res.transactions;

                $scope.transactions.exporterCsvFilename = res.details[0].binName + '-Transactions.csv';

                if ($stateParams.binId) {
                    angular.forEach($scope.containers, function (area, areaName) {
                        if (res.details[0].areaName == areaName) {
                            area.open = true;
                            angular.forEach(area.prefixes, function (data, prefix) {
                                data.bins.forEach(function (bin, i) {
                                    if (bin.binId == res.details[0].binId) {
                                        data.open = true;
                                    };
                                });
                            });
                        };
                    });
                };
            } else {
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get details!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get details!'
            };
        });
    };

    Q.all([containers])
        .then(function () {
            if ($stateParams.binId) {
                $scope.activate($stateParams.binId);
            };
        });


    $scope.binInfo = {
        details: {
            binName: null
        },
        inventory: null,
        barcode: null
    };

    $scope.transactions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'fullName',
                displayName: 'Name',
                cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.wmsId })" target="_blank">{{ row.entity.fullName }}</a></div></div>'
            },
            {
                name: 'kronosId',
                displayName: 'Kronos Id'
            },
            {
                name: 'binName',
                displayName: 'Bin Id'
            },
            {
                name: 'skuName',
                displayName: 'Sku Id'
            },
            {
                name: 'description',
                displayName: 'Description'
            },
            {
                name: 'typeName',
                displayName: 'Each Type'
            },
            {
                name: 'quantity',
                displayName: 'Quantity',
                cellFilter: 'number: 2'
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date: \'short\''
            },
        ]
    };

    $scope.showAll = function () {
        blockUI.start();
        NonInvAPI.Transactions($scope.binInfo.details.binId, 'bin', 0)
        .then(function (res) {
            if (angular.isArray(res)) {
                $scope.transactions.data = res;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Transactions!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Transactions!'
            };
        });
    };

    $scope.addArea = function () {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/addArea.html',
            controller: function ($scope, $rootScope, close, blockUI) {

                $scope.form = {};
                $scope.submit = function (form) {
                    blockUI.start();
                    NonInvAPI.addArea(form)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isNumber(+res) && +res > 0) {
                                form.areaId = res;
                                close(form);
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            blockUI.stop();
                            close(false);
                        });
                }
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (added) {
                if (added) {
                    var areaName = added.name;
                    var areaId = added.areaId;

                    $scope.containers[areaName] = {
                        name: areaName,
                        areaId: areaId,
                        prefixes: {},
                        binCount: 0,
                        open: false
                    };

                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Area ' + areaName + ' Successfully Added!'
                    };
                };
            });
        });
    };

    $scope.delete = function (type, id) {
        blockUI.start();
        NonInvAPI.deleteId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                if ($stateParams.binId == id) {
                    $state.reload()
                } else {
                    $state.go('app.nonInvContainers', { binId: id });
                }
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.disable = function (type, id) {
        blockUI.start();
        NonInvAPI.disableId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                if ($stateParams.binId == id) {
                    $state.reload()
                } else {
                    $state.go('app.nonInvContainers', { binId: id });
                }
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.enable = function (type, id) {
        blockUI.start();
        NonInvAPI.enableId(id, type)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                if ($stateParams.binId == id) {
                    $state.reload()
                } else {
                    $state.go('app.nonInvContainers', { binId: id });
                }
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.save = function (binDetails) {
        NonInvAPI.editBin(binDetails)
        .then(function (res) {
            if (angular.isNumber(+res) && +res > 0) {
                blockUI.stop();
                if ($stateParams.binId == binDetails.binId) {
                    $state.reload()
                } else {
                    $state.go('app.nonInvContainers', { binId: binDetails.binId });
                }
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: res.Error
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'An Unknown Error Occured!'
            };
        });
    };

    $scope.addBin = function (prefix, areaName, areaId) {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/addBin.html',
            controller: function ($scope, $rootScope, data, checks, close, blockUI) {

                $scope.checks = checks;

                $scope.form = {
                    areaId: data.areaId,
                    binName: null,
                    binType: null
                };

                $scope.existing = data.prefix != null;

                $scope.bin = {
                    prefix: data.prefix,
                    floor: null,
                    lane: null,
                    bay: null
                };

                $scope.$watch('bin.prefix', function (newValue, oldValue) {
                    if (newValue != '') {
                        if (newValue && newValue.length > 2) {
                            $scope.bin.prefix = oldValue;
                        };

                        if ($scope.checks.prefixes.indexOf(newValue.toUpperCase()) > -1 && !$scope.existing) {
                            $scope.bin.prefix = null;
                        };
                    };
                });

                $scope.$watch('bin', function (bin, o) {
                    var binName = bin.prefix + '-' + (bin.floor <= 9 ? '0' + bin.floor : bin.floor) + '-' + (bin.lane <= 9 ? '0' + bin.lane : bin.lane) + '-' + bin.bay;

                    $scope.form.binName = binName.toUpperCase();
                }, true)

                $scope.submit = function (bin) {


                    var form = $scope.form;
                    blockUI.start();
                    NonInvAPI.addBin(form)
                        .then(function (res) {
                            blockUI.stop();
                            if (angular.isNumber(+res) && +res > 0) {
                                form.binId = res;
                                close(form);
                            } else {
                                close(false);
                            };
                        }, function (err) {
                            blockUI.stop();
                            close(false);
                        });
                }
            },
            inputs: {
                data: { areaId: areaId, prefix: prefix },
                checks: { bins: $scope.binsArray, prefixes: $scope.prefixesArray }
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (added) {
                if (added) {
                    var binName = added.binName;
                    var binId = added.binId;
                    var binType = added.binType;
                    if (!prefix) {
                        $scope.containers[areaName].prefixes[binName.substr(0, 2)] = {
                            bins: [{
                                areaId: areaId,
                                areaName: areaName,
                                binId: binId,
                                binName: binName,
                                binType: binType,
                                acitve: 1
                            }],
                            open: false
                        }
                    } else {
                        $scope.containers[areaName].prefixes[prefix].bins.push({
                            areaId: areaId,
                            areaName: areaName,
                            binId: binId,
                            binName: binName,
                            binType: binType,
                            acitve: 1
                        });
                    };

                    $scope.containers[areaName].binCount += 1;

                    $scope.raw.push({
                        areaId: areaId,
                        areaName: areaName,
                        binId: binId,
                        binName: binName,
                        binType: binType,
                        acitve: 1
                    });

                    $state.go('app.nonInvContainers', { binId: binId });

                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Bin ' + binName + ' Successfully Added!'
                    };
                };
            });
        });
    };



    $scope.openEmptyBins = function () {
        ModalService.showModal({
            templateUrl: 'templates/NonInv/dialogs/emptyBins.html',
            controller: function ($scope, $rootScope, emptyBins, close, blockUI) {

                $scope.emptyBins = {
                    data: emptyBins,
                    paginationPageSizes: [25, 50, 75, 100],
                    exporterCsvFilename: 'Empty Bins.csv',
                    enableGridMenu: true,
                    enableSelectAll: true,
                    exporterMenuPdf: false,
                    columnDefs: [
                        {
                            name: 'areaName',
                            displayName: 'Area'
                        },
                        {
                            name: 'binName',
                            displayName: 'Bin'
                        }
                    ]
                };
            },
            inputs: {
                emptyBins: $scope.emptyBins
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (added) {
                if (added) {
                    var areaName = added.name;
                    var areaId = added.areaId;

                    $scope.containers[areaName] = {
                        name: areaName,
                        areaId: areaId,
                        prefixes: {},
                        binCount: 0,
                        open: false
                    };

                    $rootScope.changeResponse = {
                        success: true,
                        message: 'Area ' + areaName + ' Successfully Added!'
                    };
                };
            });
        });
    };

    $scope.print = function (url) {
        $http.get(url)
            .then(function (data) {
                var image = data.data;
                var popupWin = window.open('', '_blank', 'width=700,height=749');
                popupWin.document.open();
                popupWin.document.write('<html><head></head><body>' + image + '</body></html>');

                setTimeout(function () {
                    popupWin.print();
                    popupWin.close();
                }, 200);
            });
    };
})

.controller('NonInvActivity', function ($scope, $rootScope, $localStorage, KioskAPI, NonInvAPI, blockUI, uiGridConstants) {
    $scope.fromDate = null;
    $scope.toDate = null;
    $scope.transactions = {
        data: [],
        paginationPageSizes: [25, 50, 75, 100],
        enableGridMenu: true,
        enableSelectAll: true,
        exporterMenuPdf: false,
        onRegisterApi: function registerGridApi(gridApi) {
            $scope.gridApi = gridApi;
        },
        columnDefs: [
            {
                name: 'fullName',
                displayName: 'Name',
                cellTemplate: '<div class="ui-grid-cell"><div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.wmsId })" target="_blank">{{ row.entity.fullName }}</a></div></div>'
            },
            {
                name: 'kronosId',
                displayName: 'Kronos Id'
            },
            {
                name: 'binName',
                displayName: 'Bin Id'
            },
            {
                name: 'skuName',
                displayName: 'Sku Id'
            },
            {
                name: 'description',
                displayName: 'Description'
            },
            {
                name: 'typeName',
                displayName: 'Each Type'
            },
            {
                name: 'quantity',
                displayName: 'Quantity',
                cellFilter: 'number: 2'
            },
            {
                name: 'timestamp',
                displayName: 'Timestamp',
                cellFilter: 'date: \'short\''
            },
        ]
    };

    $scope.select = function (associate) {
        $scope.searchTerm = '';
        $scope.selectedAssociate = associate;
    };

    $scope.showTrans = function (assoc) {
        blockUI.start();
        var fromDate = new Date(angular.copy($scope.fromDate));
        fromDate.setMinutes(fromDate.getMinutes() - fromDate.getTimezoneOffset());
        var toDate = new Date(angular.copy($scope.toDate));
        toDate.setMinutes(toDate.getMinutes() - toDate.getTimezoneOffset());
        NonInvAPI.Transactions({ wmsId: assoc.wmsId, fromDate: fromDate, toDate: toDate }, 'assoc', 0)
            .then(function (res) {
                if (angular.isArray(res)) {
                    $scope.transactions.data = res;
                    blockUI.stop();
                } else {
                    blockUI.stop();
                    $rootScope.changeResponse = {
                        failure: true,
                        message: res.Error
                    };
                }
            }, function (error) {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Transactions!'
                };
            });
    };

    blockUI.start();
    KioskAPI.kioskHighFiveRoster()
        .then(function (res) {
            if (angular.isArray(res.data)) {
                $scope.associates = res.data;
                blockUI.stop();
            } else {
                blockUI.stop();
                $rootScope.changeResponse = {
                    failure: true,
                    message: 'Unable to get Roster!'
                };
            }
        }, function (error) {
            blockUI.stop();
            $rootScope.changeResponse = {
                failure: true,
                message: 'Unable to get Roster!'
            };
        });
})

.factory('HRAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        PendingReturnForms: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/PendingReturnForms.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        UpdateFormStatus: function (info, status) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/ReturnHRForm.aspx', $httpParamSerializer({
                entryId: info.id,
                returnedStatus: 1,
                returnedBy: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    }
})

.controller('PendingReturnForms', function ($scope, $rootScope, HRAPI, uiGridConstants, ModalService, blockUI, ZuPortal_CONFIG) {
    blockUI.start();

    HRAPI.PendingReturnForms()
        .then(function (data) {
            if (angular.isArray(data)) {
                $scope.employerData = {};
                angular.forEach(_.groupBy(data, function (row) { return row.type }), function (data, type) {
                    var count = 0;
                    $scope.employerData[type] = {
                        name: type,
                        managers: _.map(_.filter(data, function (employer) { return employer.type == type; }), function (group) {
                            return {
                                name: group.managerName,
                                pendingDelivery: _.sortBy(_.map(group.pendingDelivery.split(';'), function (assoc) {
                                    count += 1;
                                    assoc = assoc.split('|');
                                    return {
                                        id: assoc[0],
                                        name: assoc[1],
                                        link: assoc[2],
                                        type: assoc[3],
                                        added: new Date(assoc[4]),
                                        deliveryStatus: assoc[5],
                                        deliveredBy: assoc[6],
                                        exemptStatus: assoc[7],
                                        exemptedBy: assoc[8],
                                        exemptNotes: assoc[9],
                                    }
                                }), function (assoc) {
                                    return assoc.name;
                                })
                            }
                        }),
                        logo: 'css/images/' + type.toLowerCase() + '_logo.png',
                        style: type == 'Zulily' ? { 'width': '60px' } : { 'width': '150px' },
                        count: count,
                    }
                });
            };
            blockUI.stop();
        }, function (err) {
            blockUI.stop();
        });

    $scope.activePdf = {
        link: '',
        id: 0
    };

    $rootScope.changeResponse = {};

    $scope.selectedAssoc = {
        info: {},
        managerName: '',
        employer: ''
    };

    $scope.viewPdf = function (assoc, managerName, employer) {
        $scope.selectedAssoc.info = assoc;
        $scope.activePdf.link = ZuPortal_CONFIG.ZuDash_URLS.APIURL + assoc.link.replace('/data', 'data');
        $scope.activePdf.id = Number(assoc.id);
        $scope.selectedAssoc.managerName = managerName;
        $scope.selectedAssoc.employer = employer;
    };

    $scope.changeStatus = function () {
        blockUI.start();
        HRAPI.UpdateFormStatus($scope.selectedAssoc.info, status)
            .then(function (response) {
                if (+response > 0 && angular.isNumber(+response)) {
                    var index = $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery.indexOf($scope.selectedAssoc.info);
                    $scope.employerData[$scope.selectedAssoc.employer].managers[$scope.selectedAssoc.managerName].pendingDelivery.splice(index, 1);
                    $scope.employerData[$scope.selectedAssoc.employer].count += -1;
                    $scope.activePdf = {
                        link: '',
                        id: 0
                    };

                    $scope.selectedAssoc = {
                        info: {},
                        managerName: '',
                        employer: ''
                    };
                    $rootScope.changeResponse.message = 'Form Returned successfully!';
                    $rootScope.changeResponse.success = true;
                } else {
                    $rootScope.changeResponse.message = 'An error occured while returning the form!';
                    $rootScope.changeResponse.failure = true;
                }
                blockUI.stop();
            }, function (err) {
                $rootScope.changeResponse.message = 'An error occured while returning the form!';
                $rootScope.changeResponse.failure = true;
                blockUI.stop();
            });
    };
})

.factory('ICQAAPI', function ($http, $sessionStorage, $localStorage, $cookies, $httpParamSerializer, ZuPortal_CONFIG) {
    return {
        ReportDashboard: function () {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/adjustmentsReportDashboard.aspx', { params: { locationId: $localStorage.locationId } })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        ReportDashboard_Range: function (from, to) {
            return $http.get(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'requests/adjustmentsReportDashboard.aspx', {
                params: {
                    locationId: $localStorage.locationId,
                    from: from,
                    to: to
                }
            })
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        },
        UpdateAdjustment: function (adj) {
            return $http.post(ZuPortal_CONFIG.ZuDash_URLS.APIURL + 'alterations/UpdateAdjustment.aspx', $httpParamSerializer({
                data: adj,
                wmsId: $localStorage.user.id
            }), ZuPortal_CONFIG.ZuDash_API_Options)
                .then(function (data) {
                    return data.data;
                }, function (error) {
                    return error;
                });
        }
    }
})

.controller('AdjustmentDashboard', function ($scope, $rootScope, ICQAAPI, uiGridConstants, ModalService, blockUI, ZuPortal_CONFIG, $localStorage) {

    var productUrls = {
        1: 'http://rno-ui.rno.corp.zulily.com:9060/desktop/#/app/product/',
        2: 'http://cbs-ui.corp.zulily.com:9060/desktop/#/app/product/',
        3: 'http://abe-ui.abe.corp.zulily.com:9060/desktop/#/app/product/',
        4: 'http://zbrrno-ui.rno.corp.zulily.com:9060/desktop/#/app/product/',
        5: 'http://zbrcbs-ui.zebra.corp.zulily.com:9060/desktop/#/app/product/',
        6: 'http://zbrabe-ui.abe.corp.zulily.com:9060/desktop/#/app/product/',
    };

    var locationId = $localStorage.locationId;

    $scope.productUrl = productUrls[locationId];

    $scope.all = {};

    $scope.fillGrids = function (res) {
        var trans = {
            all: res,
            requiresResearch: _.filter(res, function (adj) {
                return adj.overThreshold == 1 && (adj.status == 'Pending' || adj.status == 'Postponed');
            }),
            researchComplete: _.filter(res, function (adj) {
                return adj.overThreshold == 1 && adj.status == 'Resolved';
            })
        };

        $scope.grids = {
            all: {
                data: trans.all,
                paginationPageSizes: [25, 50, 75, 100],
                enableGridMenu: true,
                enableSelectAll: true,
                exporterMenuPdf: false,
                onRegisterApi: function registerGridApi(gridApi) {
                    $scope.gridApi1 = gridApi;
                },
                columnDefs: [
                    {
                        name: 'adjustedByWmsId',
                        displayName: 'Adjusted By',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.adjustedByWmsId })" target="_blank">{{ row.entity.adjustedByName }}</a></div>'
                    },
                    {
                        name: 'vendor',
                        displayName: 'Vendor'
                    },
                    {
                        name: 'container',
                        displayName: 'Container'
                    },
                    {
                        name: 'containerType',
                        displayName: 'Container Type'
                    },
                    {
                        name: 'wmsProductId',
                        displayName: 'Product Id'
                    },
                    {
                        name: 'productTitle',
                        displayName: 'Title'
                    },
                    {
                        name: 'conveyable',
                        displayName: 'Coneyable',
                    },
                    {
                        name: 'productSize',
                        displayName: 'Size',
                    },
                    {
                        name: 'cost',
                        displayName: 'Cost',
                    },
                    {
                        name: 'category',
                        displayName: 'Category',
                    },
                    {
                        name: 'adjustQty',
                        displayName: 'Adjust Qty.',
                    },
                    {
                        name: 'adjustNotes',
                        displayName: 'Adjust Notes',
                    }
                ]
            },
            requiresResearch: {
                data: trans.requiresResearch,
                paginationPageSizes: [25, 50, 75, 100],
                enableGridMenu: true,
                enableSelectAll: true,
                exporterMenuPdf: false,
                onRegisterApi: function registerGridApi(gridApi) {
                    $scope.gridApi2 = gridApi;
                },
                columnDefs: [
                    {
                        name: 'id',
                        displayName: 'Adjust Id',
                        cellTemplate: '<div class="ui-grid-cell-contents"><span class="a" ng-click="grid.appScope.pending(row.entity)">{{ row.entity.id }}</span></div>'
                    },
                    {
                        name: 'adjustedByWmsId',
                        displayName: 'Adjusted By',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.adjustedByWmsId })" target="_blank">{{ row.entity.adjustedByName }}</a></div>'
                    },
                    {
                        name: 'vendor',
                        displayName: 'Vendor'
                    },
                    {
                        name: 'container',
                        displayName: 'Container'
                    },
                    {
                        name: 'containerType',
                        displayName: 'Container Type'
                    },
                    {
                        name: 'productTitle',
                        displayName: 'Product',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{ grid.appScope.productUrl + row.entity.wmsProductId }}" target="_blank">{{ row.entity.productTitle }}</a></div>'
                    },
                    {
                        name: 'adjustQty',
                        displayName: 'Adjust Qty.',
                    },
                ]
            },
            researchComplete: {
                data: trans.researchComplete,
                paginationPageSizes: [25, 50, 75, 100],
                enableGridMenu: true,
                enableSelectAll: true,
                exporterMenuPdf: false,
                onRegisterApi: function registerGridApi(gridApi) {
                    $scope.gridApi3 = gridApi;
                },
                columnDefs: [
                    {
                        name: 'id',
                        displayName: 'Adjust Id',
                        cellTemplate: '<div class="ui-grid-cell-contents"><span class="a" ng-click="grid.appScope.pending(row.entity)">{{ row.entity.id }}</span></div>'
                    },
                    {
                        name: 'adjustedByWmsId',
                        displayName: 'Adjusted By',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="app.userDetails({ userId : row.entity.adjustedByWmsId })" target="_blank">{{ row.entity.adjustedByName }}</a></div>'
                    },
                    {
                        name: 'container',
                        displayName: 'Container'
                    },
                    {
                        name: 'containerType',
                        displayName: 'Container Type'
                    },
                    {
                        name: 'productTitle',
                        displayName: 'Product',
                        cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{ grid.appScope.productUrl + row.entity.wmsProductId }}" target="_blank">{{ row.entity.productTitle }}</a></div>'
                    },
                    {
                        name: 'adjustQty',
                        displayName: 'Adjust Qty.',
                    },
                    {
                        name: 'ticketUrl',
                        displayName: 'Ticket',
                    },
                    {
                        name: 'Comments',
                        displayName: 'Comments',
                    },

                ]
            }
        }
    };

    blockUI.start();
    ICQAAPI.ReportDashboard()
        .then(function (res) {
            blockUI.stop();
            if (angular.isArray(res)) {
                $scope.fillGrids(res);
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
                message: 'An Unknown Error Has Occured'
            };
        });

    $scope.dateRange = function (from, to) {
        from = new Date(from);
        to = new Date(to);
        from.setMinutes(from.getMinutes() - from.getTimezoneOffset());
        to.setMinutes(to.getMinutes() - to.getTimezoneOffset());
        blockUI.start();
        ICQAAPI.ReportDashboard_Range(from.toJSON(), to.toJSON())
            .then(function (res) {
                blockUI.stop();
                if (angular.isArray(res)) {
                    $scope.fillGrids(res);
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
                    message: 'An Unknown Error Has Occured'
                };
            });
    }

    $scope.pending = function (row) {
        ModalService.showModal({
            template: '<div class="modal animated bounceInDown">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" ng-click="close()" data-dismiss="modal" aria-hidden="true">&times;</button>\n                <h4 class="modal-title">Adjust ID #: {{ info.id }}</h4>\n            </div>\n            <div class="modal-body">\n                <uib-tabset>\n                    <uib-tab heading="Adjustment Research">\n                        <table class="table table-condensed table-hover table-striped">\n                            <tbody>\n                                <tr ng-repeat="(key, value) in info" ng-if="adjustComments[key] && (complete && key == \'updatedBy\' ? true : !complete && key != \'updatedBy\' ? true : complete ? true : false)">\n                                    <th class="col-md-5">\n                                        {{ adjustComments[key].header }}:\n                                    </th>\n                                    <td class="col-md-7">\n                                        <input class="form-control" ng-model="info[key]" ng-if="adjustComments[key].type == \'text\'" placeholder="Optional" ng-disabled="complete"></input>\n                                        <textarea class="form-control" ng-model="info[key]" ng-if="adjustComments[key].type == \'textarea\'" rows="6" placeholder="{{ info.status == \'Postponed\' ? \'Required\' : \'Optional\' }}" required ng-disabled="complete"></textarea>\n                                        <select class="form-control" ng-options="option as option for option in adjustComments[key].data | orderBy:\'toString()\'" ng-model="info[key]" ng-if="adjustComments[key].type == \'select\'" ng-disabled="complete"><option disabled value="">Required</option></select>\n                                        <span class="form-control" ng-if="adjustComments[key].type == \'span\' &&complete" disabled>{{ info.updatedBy }}</span>\n                                    </td>\n                                </tr>\n                            </tbody>\n                        </table>\n                    </uib-tab>\n                    <uib-tab heading="Transaction Info">\n                        <table class="table table-condensed table-hover table-striped">\n                            <tbody>\n                                <tr ng-repeat="(key, value) in info" ng-if="transInfo[key]">\n                                    <th class="col-md-5">\n                                        {{ transInfo[key] }}:\n                                    </th>\n                                    <td class="col-md-7">\n                                        {{ value }}\n                                    </td>\n                                </tr>\n                            </tbody>\n                        </table>\n                    </uib-tab>\n                </uib-tabset>\n            </div>\n            <div class="modal-footer">\n                <div class="btn-group">\n                    <button type="button" class="btn btn-danger btn-lg" ng-click="close()" data-dismiss="modal" aria-hidden="true">Cancel</button>\n                    <button type="button" class="btn btn-success btn-lg" ng-click="submit(info)" ng-disabled="!info.department || !info.reason || (!info.comments && info.status == \'Postponed\') || (!info.status || info.status == \'Pending\') || complete" data-dismiss="modal" aria-hidden="true">Submit</button>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n',
            controller: function ($scope, $rootScope, info, close, blockUI) {

                $scope.info = angular.copy(info);

                $scope.complete = info.status == 'Resolved';

                $scope.transInfo = {
                    adjustedByName: 'Adjusted By',
                    vendor: 'Vendor',
                    container: 'Container',
                    containerType: 'Bin',
                    wmsProductId: 'WMS Product ID',
                    productTitle: 'Product Title',
                    conveyable: 'Conveyable',
                    productSize: 'Size',
                    cost: 'Cost',
                    category: 'Category',
                    adjustQty: 'Qty',
                    adjustNotes: 'Notes',
                };

                $scope.adjustComments = {
                    ticketUrl: {
                        header: 'Ticket URL',
                        type: 'text'
                    },
                    department: {
                        header: 'Department',
                        type: 'select',
                        data: [
                            'Donation',
                            'Receive Error',
                            'Xfer Error',
                            'Stow Error',
                            'IC Error',
                            'ZPS Request',
                            'Other',
                        ]
                    },
                    reason: {
                        header: 'Reason Code',
                        type: 'select',
                        data: [
                            'Color',
                            'Style',
                            'Size',
                            'Donation',
                            'Tote Dump',
                            'Ticket',
                            'NYR',
                            'Unknown',
                            'Image',
                            'Catalog',
                            'Vreturn',
                            'Scanned not Stowed',
                            'Stowed not Scanned',
                            'Physically not Found',
                            'Product Drift',
                            'Sku Change'
                        ]
                    },
                    comments: {
                        header: 'Comments',
                        type: 'textarea'
                    },
                    status: {
                        header: 'Status',
                        type: 'select',
                        data: [
                            'Postponed',
                            'Resolved',
                        ]
                    },
                    updatedBy: {
                        header: 'Resolved By',
                        type: 'span'
                    }
                };

                $scope.submit = function (adj) {
                    blockUI.start();
                    ICQAAPI.UpdateAdjustment(JSON.stringify(adj))
                        .then(function (res) {
                            blockUI.stop();
                            close({ adj: adj, res: res });
                        }, function (err) {
                            blockUI.stop();
                            $rootScope.changeResponse = {
                                message: 'AnError has occured.',
                                failure: true
                            };
                        });
                };
            },
            inputs: {
                info: row
            }
        }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
                var adj = result.adj, res = result.res;
                if (adj) {
                    if (res.Success) {
                        var index = $scope.grids.requiresResearch.data.indexOf(row);
                        row.status = adj.status;
                        row.ticketUrl = adj.ticketUrl;
                        row.department = adj.department;
                        row.reason = adj.reason;
                        row.comments = adj.comments;
                        $scope.grids.researchComplete.data.push(row);
                        $scope.grids.requiresResearch.data.splice(index, 1);

                        $rootScope.changeResponse = {
                            message: res.Success,
                            success: true
                        };
                    } else {
                        $rootScope.changeResponse = {
                            message: res.Error,
                            failure: true
                        };
                    };
                };
            });
        });
    };
});