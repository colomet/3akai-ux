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

casper.test.begin('Widget - About Discussion', function(test) {

    /**
     * Open the about discussion modal with assertions
     */
    var openAboutDiscussion = function() {
        casper.waitForSelector('#discussion-clip-container .oae-clip-content > button', function() {
            casper.click('#discussion-clip-container .oae-clip-content > button');
            test.assertExists('.oae-trigger-aboutdiscussion', 'About discussion trigger exists');
            casper.click('.oae-trigger-aboutdiscussion');
            casper.waitUntilVisible('#aboutdiscussion-modal', function() {
                test.assertVisible('#aboutdiscussion-modal', 'About discussion pane is showing after trigger');
                casper.click('#discussion-clip-container .oae-clip-content > button');
            });
        });
    };

    /**
     * Verify that all elements for discussions are present in the about discussion modal
     *
     * @param {User}          expectedCreator      The user profile of the user that created the discussion
     * @param {Discussion}    discussionProfile    The created discussion's profile object
     */
    var verifyAboutDiscussionElements = function(expectedCreator, discussionProfile) {
        test.assertExists('#aboutdiscussion-modal .modal-header h3', 'Verify that the modal has a header');
        test.assertSelectorHasText('#aboutdiscussion-modal .modal-header h3', 'About', 'Verify that the modal header reads \'About\'');
        test.assertExists('#aboutdiscussion-modal .modal-body ul.oae-list li', 'Verify that the modal shows who added the discussion');
        test.assertExists('#aboutdiscussion-modal .modal-body ul.oae-list li .oae-listitem-primary-thumbnail', 'Verify that the modal shows the picture of the user who added the discussion');
        test.assertExists('#aboutdiscussion-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', 'Verify that the modal shows the name of the user who added the discussion');
        test.assertSelectorHasText('#aboutdiscussion-modal .modal-body ul.oae-list li .oae-listitem-metadata h3', expectedCreator.displayName, 'Verify that the correct name is shown');
        test.assertExists('#aboutdiscussion-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'Verify that the modal shows the tenant of the user who added the discussion');
        test.assertSelectorHasText('#aboutdiscussion-modal .modal-body ul.oae-list li .oae-listitem-metadata small', 'CasperJS Tenant', 'Verify that the metadata shows the tenant name');
        test.assertExists('#aboutdiscussion-modal .modal-body #aboutdiscussion-metadata-container #aboutdiscussion-title', 'Verify that the modal shows title of the discussion');
        test.assertSelectorHasText('#aboutdiscussion-modal .modal-body #aboutdiscussion-metadata-container #aboutdiscussion-title', discussionProfile.displayName, 'Verify that the correct discussion title is shown');
        test.assertExists('#aboutdiscussion-modal .modal-body #aboutdiscussion-metadata-container time', 'Verify that the modal shows when the discussion was added');
        test.assertEval(function(created) {
            return $('#aboutdiscussion-modal .modal-body #aboutdiscussion-metadata-container time').text() === require('oae.api.l10n').transformDate(created);
        }, 'Verify that the correct time when the discussion was created is shown', discussionProfile.created);
    };

    casper.start(configUtil.tenantUI, function() {
        userUtil.createUsers(2, function(user1, user2) {
            // Login with the first user
            userUtil.doLogIn(user1.username, user1.password);
            uiUtil.openMe();

            // Create a discussion to test with
            discussionUtil.createDiscussion(null, null, null, null, null, function(err, discussionProfile) {
                // Log out from user 1
                userUtil.doLogOut();

                // Log in with user 2 to start the tests
                userUtil.doLogIn(user2.username, user2.password);

                // Open the discussion profile
                uiUtil.openDiscussionProfile(discussionProfile);

                casper.then(function() {
                    casper.echo('Verify open about discussion modal', 'INFO');
                    openAboutDiscussion();
                });

                casper.then(function() {
                    casper.echo('Verify about discussion elements', 'INFO');
                    verifyAboutDiscussionElements(user1, discussionProfile);
                });

                userUtil.doLogOut();
            });
        });

    });

    casper.run(function() {
        test.done();
    });
});
