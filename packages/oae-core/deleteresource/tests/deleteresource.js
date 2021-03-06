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

casper.test.begin('Widget - Delete resource', function(test) {

    /**
     * Open the delete resource modal with assertions
     */
    var verifyDeleteResourceModal = function() {
        casper.waitForSelector('#content-clip-container .oae-clip-content > button', function() {
            casper.click('#content-clip-container .oae-clip-content > button');
            casper.waitForSelector('button.oae-trigger-deleteresource', function() {
                test.assertExists('button.oae-trigger-deleteresource', 'The delete resource trigger is present');
                casper.click('button.oae-trigger-deleteresource');
                casper.waitUntilVisible('#deleteresource-modal', function() {
                    test.assertVisible('#deleteresource-modal', 'Delete resource pane is showing after trigger');
                    casper.click('#content-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Open the delete resource modal without assertions
     *
     * @param  {String}    resourceType    The type of the resource
     */
    var openDeleteResourceModal = function(resourceType) {
        casper.waitForSelector('#' + resourceType + '-clip-container .oae-clip-content > button', function() {
            casper.click('#' + resourceType + '-clip-container .oae-clip-content > button');
            casper.waitForSelector('button.oae-trigger-deleteresource', function() {
                casper.click('button.oae-trigger-deleteresource');
                casper.waitUntilVisible('#deleteresource-modal', function() {
                    casper.click('#' + resourceType + '-clip-container .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Verify that the delete resource elements are present
     */
    var verifyDeleteResourceElements = function() {
        test.assertExists('#deleteresource-modal .modal-body h4', 'Verify that a warning header is shown');
        test.assertExists('#deleteresource-modal .modal-body .alert.alert-danger', 'Verify that a warning alert text is shown');
        test.assertExists('#deleteresource-modal .modal-footer button[data-dismiss="modal"]', 'Verify that the cancel button is shown');
        test.assertExists('#deleteresource-modal .modal-footer button#deleteresource-delete', 'Verify that the delete button is shown');
    };

    /**
     * Verify deleting a resource
     *
     * @param  {String}    resourceType    The type of the resource, used for the casperjs test output
     */
    var verifyDeletingResource = function(resourceType) {
        casper.waitForSelector('#deleteresource-modal .modal-footer button#deleteresource-delete', function() {
            casper.click('#deleteresource-modal .modal-footer button#deleteresource-delete');
            // Verify that deleting the item succeeded
            casper.waitForSelector('#oae-notification-container .alert', function() {
                test.assertDoesntExist('#oae-notification-container .alert.alert-error', 'The ' + resourceType + ' was successfully deleted');
                // Verify that the user gets redirected to the me page
                casper.waitForSelector('#me-clip-container', function() {
                    test.assertExists('#me-clip-container', 'User gets redirected to / after the ' + resourceType + ' is deleted');
                });
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            // Create a file
            casper.then(function() {
                contentUtil.createFile(null, null, null, null, null, null, function(err, contentProfile) {
                    // Create a link
                    contentUtil.createLink(null, null, null, null, null, null, null, function(err, linkProfile) {
                        // Create a discussion
                        discussionUtil.createDiscussion(null, null, null, null, null, function(err, discussionProfile) {
                            // Create a collaborative document
                            contentUtil.createCollabDoc(null, null, null, null, null, null, null, function(err, collabdocProfile) {
                                // Verify that the delete resource modal opens
                                uiUtil.openContentProfile(contentProfile);
                                casper.then(function() {
                                    casper.echo('# Verify open delete resource modal', 'INFO');
                                    verifyDeleteResourceModal();
                                });

                                // Verify that the delete resource elements are present
                                casper.then(function() {
                                    casper.echo('# Verify delete resource elements', 'INFO');
                                    verifyDeleteResourceElements();
                                });

                                // Verify deleting a content item
                                casper.then(function() {
                                    casper.echo('# Verify deleting a content item', 'INFO');
                                    openDeleteResourceModal('content');
                                    verifyDeletingResource('content');
                                });

                                // Verify deleting a link
                                uiUtil.openLinkProfile(linkProfile);
                                casper.then(function() {
                                    casper.echo('# Verify deleting a link', 'INFO');
                                    openDeleteResourceModal('content');
                                    verifyDeletingResource('link');
                                });

                                // Verify deleting a discussion
                                uiUtil.openDiscussionProfile(discussionProfile);
                                casper.then(function() {
                                    casper.echo('# Verify deleting a discussion', 'INFO');
                                    openDeleteResourceModal('discussion');
                                    verifyDeletingResource('discussion');
                                });

                                // Verify deleting a collaborative document
                                uiUtil.openCollabdocProfile(collabdocProfile);
                                casper.then(function() {
                                    casper.echo('# Verify deleting a collaborative document', 'INFO');
                                    openDeleteResourceModal('content');
                                    verifyDeletingResource('collaborative document');
                                });

                                // Log out at the end of the test
                                userUtil.doLogOut();
                            });
                        });
                    });
                });
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
