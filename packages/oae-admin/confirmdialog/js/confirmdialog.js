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
         * Shows a confirmation dialog to the user using predefined data
         * usage
         * showConfirmationModal({
         *     'title' (required): 'Delete tenant Cambridge University',
         *     'message' (required): 'You cannot undo this operation. Are you sure you want to delete this tenant?',
         *     'confirm' (required): 'Yes, delete tenant',
         *     'confirmclass': (optional): 'danger' (for possible values see http://getbootstrap.com/css/#buttons)
         *     'confirmed' (required): function() {
         *         // Add handling for confirmation
         *         // Hide the dialog when done (optionally show a success message)
         *         $('#deletetenant-modal').modal('hide');
         *     }
         * });
         *
         * @param {Object}  data    Data object used to render the modal dialog. All required elements are shown above in 'usage' and should be provided
         */
        var showConfirmationModal = function(data) {
            // Render the dialog with the parameters given
            oae.api.util.template().render($('#confirmdialog-modal-template', $rootel), {
                'modal': data
            }, $('#confirmdialog-modal-container', $rootel));

            // Show the modal dialog
            $('#confirmdialog-modal').modal({
                'backdrop': 'static'
            });

            // Bind the confirmation handler
            $('#confirmdialog-confirm', $rootel).click(function() {
                $('.modal').modal('hide');
                data.confirmed();
            });
        };

        /**
         * Initialize the confirmdialog widget
         */
        var initConfirmDialog = function() {
            $(document).on('oae.trigger.confirmdialog', function(ev, data) {
                showConfirmationModal(data);
            });
        };

        initConfirmDialog();

    };
});
