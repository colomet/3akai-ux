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

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the content profile
        var contentProfile = null;

        /**
         * Render the edit folder form and initialize its validation
         */
        var setUpEditContent = function() {
            // Render the form elements
            oae.api.util.template().render($('#editcontent-template', $rootel), {
                'content': contentProfile
            }, $('.modal-body', $rootel));

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editContent
            };
            oae.api.util.validation().validate($('#editcontent-form', $rootel), validateOpts);
        };

        /**
         * Edit the content
         */
        var editContent = function() {
            // Disable the form
            $('#editcontent-form *', $rootel).prop('disabled', true);

            var params = {
                'displayName': $.trim($('#editcontent-name', $rootel).val()),
                'description': $.trim($('#editcontent-description', $rootel).val())
            };

            if (contentProfile.resourceSubType === 'link') {
                params.link = $.trim($('#editcontent-link', $rootel).val());
            }

            oae.api.content.updateContent(contentProfile.id, params, function (err, data) {
                // If the update succeeded, trigger the `oae.editcontent.done` event,
                // show a success notification and close the modal
                var notificationBody = oae.api.util.template().render($('#editcontent-notification-template'), {
                    'content': contentProfile,
                    'err': err
                });
                if (!err) {
                    $('#editcontent-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__DETAILS_EDITED__', 'editcontent'),
                        notificationBody);
                    $(document).trigger('oae.editcontent.done', data);
                // If the update failed, enable the form and show an error notification
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__DETAILS_NOT_EDITED__', 'editcontent'),
                        notificationBody,
                        'error');
                    // Enable the form
                    $('#editcontent-form *', $rootel).prop('disabled', false);
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Reset the widget to its original state when the modal dialog is opened and closed.
         * Ideally this would only be necessary when the modal is hidden, but IE10+ fires `input`
         * events while Bootstrap is rendering the modal, and those events can "undo" parts of the
         * reset. Hooking into the `shown` event provides the chance to compensate.
         */
        var setUpReset = function() {
            $('#editcontent-modal', $rootel).on('shown.bs.modal hidden.bs.modal', function () {
                // Reset the form
                var $form = $('#editcontent-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                // Enable the form and disable the submit button
                $('#editcontent-form *', $rootel).prop('disabled', false);
                $('#editcontent-form button[type="submit"]', $rootel).prop('disabled', true);
            });
        };

        /**
         * Initialize the edit content modal dialog
         */
        var setUpEditContentModal = function() {
            $(document).on('click', '.oae-trigger-editcontent', function() {
                $('#editcontent-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                $(document).trigger('oae.context.get', 'editcontent');
            });

            $(document).on('oae.context.send.editcontent', function(ev, data) {
                contentProfile = data;
                setUpEditContent();
            });

            // Detect changes in the form and enable the submit button
            $('#editcontent-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function() {
                $('#editcontent-form button[type="submit"]', $rootel).prop('disabled', false);
            });

            $('#editcontent-modal', $rootel).on('shown.bs.modal', function() {
                // Set focus to the content name field
                $('#editcontent-name', $rootel).focus();
            });
        };

        setUpReset();
        setUpEditContentModal();

    };
});
