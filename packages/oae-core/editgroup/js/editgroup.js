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

        // Variable that keeps track of the group profile
        var groupProfile = null;

        // The selector to use to select the item that should be focussed when the modal opens
        var focusSelector = null;

        /**
         * Render the edit group form and initialize its validation
         */
        var setUpEditGroup = function() {
            // Render the form elements
            oae.api.util.template().render($('#editgroup-template', $rootel), {
                'group': groupProfile
            }, $('.modal-body', $rootel));

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editGroup
            };
            oae.api.util.validation().validate($('#editgroup-form', $rootel), validateOpts);
        };

        /**
         * Edit the group
         */
        var editGroup = function() {
            // Disable the form
            $('#editgroup-form *', $rootel).prop('disabled', true);

            var params = {
                'displayName': $.trim($('#editgroup-name', $rootel).val()),
                'description': $.trim($('#editgroup-description', $rootel).val()),
                'joinable': $('.oae-large-options-container input[type="radio"]:checked', $rootel).val()
            };

            // Edit the group
            oae.api.group.updateGroup(groupProfile.id, params, function(err, data) {
                if (!err) {
                    // If the update succeeded, trigger the `oae.editgroup.done` event,
                    // show a success notification and close the modal
                    $('#editgroup-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__GROUP_EDITED__', 'editgroup'),
                        oae.api.i18n.translate('__MSG__GROUP_EDIT_SUCCESS__', 'editgroup'),
                        'success');
                    $(document).trigger('oae.editgroup.done', data);
                // If the update failed, enable the form and show an error notification
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__GROUP_NOT_EDITED__', 'editgroup'),
                        oae.api.i18n.translate('__MSG__GROUP_EDIT_FAIL__', 'editgroup'),
                        'error');
                    // Enable the form
                    $('#editgroup-form *', $rootel).prop('disabled', false);
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
            $('#editgroup-modal').on('shown.bs.modal hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#editgroup-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                // Enable the form
                $('#editgroup-form *', $rootel).prop('disabled', false);
                $('#editgroup-form button[type="submit"]', $rootel).prop('disabled', true);
            });

            // When the modal is closed, reset any kind of default focus that was set when the
            // modal was last triggered
            $('#editgroup-modal').on('hidden.bs.modal', function() {
                focusSelector = null;
            });
        };

        /**
         * Initialize the edit group modal dialog
         */
        var setUpEditGroupModal = function() {
            $(document).on('click', '.group-trigger-editgroup', function() {
                focusSelector = $(this).attr('data-editgroup-focus');
                $('#editgroup-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                $(document).trigger('oae.context.get', 'editgroup');
            });

            $(document).on('oae.context.send.editgroup', function(ev, data) {
                groupProfile = data;
                setUpEditGroup();
            });

            // Catch changes in the joinability radio group
            $rootel.on('change', '.oae-large-options-container input[type="radio"]', function() {
                $('.oae-large-options-container label', $rootel).removeClass('checked');
                $(this).parents('label').addClass('checked');
            });

            // Detect changes in the form and enable the submit button
            $('#editgroup-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function() {
                $('#editgroup-form button[type="submit"]', $rootel).prop('disabled', false);
            });

            $('#editgroup-modal', $rootel).on('shown.bs.modal', function () {
                // Set focus to the specified field, defaulting to the group name field
                $(focusSelector || '#editgroup-name', $rootel).focus();
            });
        };

        setUpReset();
        setUpEditGroupModal();

    };
});
