/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the enabled authentication strategies
         */
        var renderLogin = function() {
            var authStrategyInfo = oae.api.authentication.getStrategyInfo();
            var externalAuthOpts = {
                'data': {
                    'redirectUrl': window.location.pathname
                }
            };

            oae.api.util.template().render($('#adminlogin-authentication-template', $rootel), {
                'authStrategyInfo': authStrategyInfo,
                'externalAuthOpts': externalAuthOpts
            }, $('#adminlogin-authentication-container', $rootel));
        };

        /**
         * Add validation to the local login form
         */
        var setUpLocalLoginValidation = function() {
            var $localLoginForm = $('#adminlogin-local', $rootel);
            var validateOpts = {
                'messages': {
                    'adminlogin-local-username': {
                        'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_USERNAME__'),
                        'adminlogin-failed-attempt': oae.api.i18n.translate('__MSG__INVALID_USERNAME_OR_PASSWORD__')
                    },
                    'adminlogin-local-password': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_PASSWORD__')
                },
                'methods': {
                    'adminlogin-failed-attempt': {
                        'method': function(value, element) {
                            // This class will be added after a failed login attempt and is used
                            // to tell jquery.validate to mark the field as invalid
                            return false;
                        }
                    }
                },
                'submitHandler': doLogin
            };
            oae.api.util.validation().validate($localLoginForm, validateOpts);
        };

        /**
         * Attempt to log the user into the administration UI with the provided username and password using either
         * the LDAP login strategy or the local login strategy. If only one of them is enabled, only that strategy
         * will be attempted. If both of them are enabled, an LDAP login will be attempted first. If that is unsuccessful,
         * a local login will be attempted next. This function will only be executed when form validation has passed.
         */
        var doLogin = function() {
            // Check whether or not the LDAP login strategy is enabled
            var LDAPEnabled = oae.api.config.getValue('oae-authentication', 'ldap', 'enabled');
            // Check whether or not the local login strategy is enabled
            var LocalEnabled = oae.api.config.getValue('oae-authentication', 'local', 'enabled');

            // Get the entered username and password
            var username = $.trim($('#adminlogin-local-username', $rootel).val());
            var password = $.trim($('#adminlogin-local-password', $rootel).val());

            // Both LDAP and local are enabled. We try LDAP first, and try local next if LDAP has failed
            if (LDAPEnabled && LocalEnabled) {
                oae.api.authentication.LDAPLogin(username, password, function(err) {
                    if (err) {
                        oae.api.authentication.localLogin(username, password, finishLogin);
                    } else {
                        finishLogin();
                    }
                });
            // Only LDAP is enabled
            } else if (LDAPEnabled) {
                oae.api.authentication.LDAPLogin(username, password, finishLogin);
            // Only local authentication is enabled
            } else {
                oae.api.authentication.localLogin(username, password, finishLogin);
            }
        };

        /**
         * Finish the login process by showing the correct validation message in case of a failed
         * login attempt, or by redirecting the user in case of a successful login attempt
         *
         * @param  {Error}      err        Error object containing error code and error message
         */
        var finishLogin = function(err) {
            if (err) {
                // Set a `adminlogin-failed-attempt` on the fields to tell jquery.validate
                // that the field is invalid
                $('#adminlogin-local-username', $rootel).addClass('adminlogin-failed-attempt');
                $('#adminlogin-local', $rootel).valid();
                $('#adminlogin-local-username', $rootel).removeClass('adminlogin-failed-attempt');
                // Clear the password field
                $('#adminlogin-local-password', $rootel).val('');
                // Focus into the username field
                $('#adminlogin-local-username', $rootel).focus();
            } else {
                window.location.reload(true);
            }
        };

        /**
         * Initialize the adminlogin widget
         */
        var initLogin = function() {
            renderLogin();
            setUpLocalLoginValidation();
        };

        initLogin();

    };
});
