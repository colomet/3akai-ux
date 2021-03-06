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

define(['jquery','underscore','oae.core'], function($, _, oae) {

    return function(uid, showSettings) {

	// The widget container
	var $rootel = $('#' + uid);

	/**
	 * Verify whether or not the entered username already exists as a login id on the current tenant.
	 * The ajax request in this function executes synchronously to allow a username to be checked for
	 * existence before the user is created.
	 *
	 * @param  {String}     username                The username we want to check the existence of
	 * @param  {Function}   callback                Standard callback function.
	 * @param  {Boolean}    callback.available      Whether or not the username is available
	 */
	var isUserNameAvailable = function(username, callback) {
            $.ajax({
		url: '/api/auth/exists/' + username,
		async: false,
		success: function() {
                    // The username already exists
                    callback(true);
		},
		error: function(xhr, textStatus, thrownError) {
                    // The username is still available
                    callback(false);
		}
            });
	};

	/**
	 * Set up the validation on the register form, including the error messages
	 */
	var setUpValidation = function() {
        var validateOpts = {
		'rules': {
            'username': {
			'minlength': 3,
			'nospaces': true,
			'validchars': true,
			'usernameavailable': true
            }
        },
		'messages': {
            'username': {
                'required': oae.api.i18n.translate('__MSG__PLEASE_ENTER_YOUR_USERNAME__'),
                'minlength': oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULD_BE_AT_LEAST_THREE_CHARACTERS_LONG__', 'register'),
                'nospaces': oae.api.i18n.translate('__MSG__THE_USERNAME_SHOULDNT_CONTAIN_SPACES__')
            }
		},
		'methods': {
            'validchars': {
			    'method': function(value, element) {
                return this.optional(element) || !(/[<>\\\/{}\[\]!#\$%\^&\*,:]+/i.test(value));
			},
			'text': oae.api.i18n.translate('__MSG__ACCOUNT_INVALIDCHAR__')
        },
        'usernameavailable': {
            'method': function(value, element) {
                var response = false;
                isUserNameAvailable(value, function(available) {
                    response = available;
                });
                return response;
			},
                'text': oae.api.i18n.translate('__MSG__USER_DOES_NOT_EXIST__')
            }
        },
            'submitHandler': getSecret
        };
        oae.api.util.validation().validate($('#resetpassword-input-username', $rootel), validateOpts);
	};

	/**
	 * Get Secret: A start point for resetting passord
	 */
	var getSecret = function(form, event) {
        // Get the form values
        var values = $('#resetpassword-input-username').serializeObject();

	    // disable redirect to other page
	    event.preventDefault();

	    var username = values.username;

	    $.ajax({
            'url': '/api/auth/local/reset/secret/' + username,
            'type': 'GET',
            'data': null,
            'success': function(data) {
                $('#resetpassword-modal').modal('hide');
                oae.api.util.notification(oae.api.i18n.translate('__MSG__CONGRATULATIONS__'), oae.api.i18n.translate('__MSG__AN_EMAIL_HAS_BEEN_SENT_TO_YOUR_EMAIL_ADDRESS__'));
            },
            'error': function(data) {
                oae.api.util.notification(oae.api.i18n.translate('__MSG__SORRY__'), oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_WHILE_SENDING_EMAIL_PLEASE_TRY_AGAIN__'));
            }
	    });
	};

	/**
	 * Show the resetpassword form
	 */
	var showResetForm = function() {
	    $('#resetpassword-input-username', $rootel).show();
	};

	var closeSigninForm = function() {
	    $('#signin-modal').modal('hide');
	};

	/**
	 * Set focus to input text-box
	 */
	var setFocus = function(){
	    $('#resetpassword-modal').on('shown.bs.modal', function () {
		    $('#resetpassword-username').focus();
	    });
	};

	/**
	 * Initialize the resetpassword modal dialog
	 */
	var initResetpassword = function() {
	    $(document).on('click', '.oae-trigger-resetpassword', function() {
            closeSigninForm();
            // Show the register form and hide the Terms and Conditions
            showResetForm();
            // set focus
            setFocus();
            // Trigger the modal dialog
            $('#resetpassword-modal', $rootel).modal({
                'toggle':'show',
                'backdrop': 'static'
            });
	    });
	};

	initResetpassword();
	setUpValidation();
    };
});
