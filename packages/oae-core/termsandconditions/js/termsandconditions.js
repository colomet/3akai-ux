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

    return function(uid, showSettings) {

        // The widget container
        var $rootel = $('#' + uid);

        /**
         * Accept the invitation in the URL state, if any
         */
        var acceptInvitation = function() {
            var invitationToken = oae.api.util.url().param('invitationToken');
            if (!invitationToken) {
                // Do not continue if there is no invitation info
                return;
            }

            // Accept the invitation
            oae.api.user.acceptInvitation(invitationToken, function(err, result) {
                if (err && err.code !== 404) {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__EMAIL_INVITATION_FAILED__'),
                        oae.api.i18n.translate('__MSG__AN_ERROR_OCCURRED_WHILE_ACCEPTING_YOUR_INVITATION__'),
                        'error');
                }
            });
        };

        /**
         * Fetch the Terms and Conditions and render the parsed markdown into the widget.
         */
        var renderTermsAndConditions = function() {
            oae.api.user.getTC(function(err, data) {
                // Render the modal body
                oae.api.util.template().render($('#termsandconditions-template', $rootel), {
                    'terms': data.text
                }, $('.modal-body', $rootel));

                // Render the modal footer
                oae.api.util.template().render($('#termsandconditions-footer-template', $rootel), {
                    needsToAccept: showSettings
                }, $('.modal-footer', $rootel));
            });
        };

        /**
         * Reaccept the Terms and Conditions and hide the modal dialog when completed
         */
        var reAcceptTermsAndConditions = function() {
            oae.api.user.acceptTC(function(err) {
                if (!err) {
                    // Unlock the modal when the Terms and Conditions have been accepted
                    $('#termsandconditions-modal', $rootel).modal('unlock');
                    // Hide the modal when the Terms and Conditions have been accepted
                    $('#termsandconditions-modal', $rootel).modal('hide');

                    // Accept any resource invitations that we have delayed to
                    // show the T&C
                    acceptInvitation();
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__TERMS_AND_CONDITIONS_NOT_ACCEPTED__', 'termsandconditions'),
                        oae.api.i18n.translate('__MSG__TERMS_AND_CONDITIONS_COULD_NOT_BE_ACCEPTED__', 'termsandconditions'),
                        'error');
                }
            });
        };

        /**
         * Initialize the Terms and Conditions widget.
         * When `showSettings` is `true` the user needs to reaccept the Terms and Conditions.
         */
        var setUpTermsAndConditions = function() {
            // Accept the terms and conditions
            $rootel.on('click', '#termsandconditions-accept', reAcceptTermsAndConditions);

            if (showSettings) {
                // Show the modal
                $('#termsandconditions-modal', $rootel).modal();
                // Lock the modal so it can't be clicked away
                $('#termsandconditions-modal', $rootel).modal('lock');
                // Render the terms and conditions modal
                renderTermsAndConditions();
            } else {
                // If the user is just viewing the Terms and Conditions we only show the modal
                $(document).on('click', '.oae-trigger-termsandconditions', function() {
                    // Show the modal
                    $('#termsandconditions-modal', $rootel).modal();
                    // Render the terms and conditions modal
                    renderTermsAndConditions();
                });
            }
        };

        setUpTermsAndConditions();

    };
});
