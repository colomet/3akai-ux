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

casper.test.begin('Widget - Comments', function(test) {

    /**
     * Verify that a comment can be placed on a content item
     */
    var verifyPlacingComment = function() {
        casper.waitForSelector('.comments-new-comment-form', function() {
            // Verify that the form exists
            test.assertExists('.comments-new-comment-form', 'The comments form is present');
            // Verify the textarea in the form exists
            test.assertExists('.comments-new-comment-form textarea#comments-new-comment', 'The comments comment textarea is present');
            // Verify the submit button in the form exists
            test.assertExists('.comments-new-comment-form button[type="submit"]', 'The comments submit button is present');
            // Fill the form
            casper.fill('.comments-new-comment-form', {
                'comments-new-comment': 'New Test comment'
            }, true);
            // Wait for the comment to show up in the list
            casper.waitForSelector('.comments-level-0', function() {
                // Verify that the comment was placed
                test.assertSelectorHasText('.comments-level-0 .media-body', 'Test comment', 'The comment was successfully placed');
                // Verify there is a reply button
                test.assertExists('.comments-level-0 .media-body .comments-reply-button', 'The reply button is present on the new comment');
                // Verify there is a delete button
                test.assertExists('.comments-level-0 .media-body .oae-trigger-deletecomment', 'The delete button is present on the new comment');
            });
        });
    };

    /**
     * Verify that replies can be made on comments
     */
    var verifyReplyToComment = function() {
        // Click the reply button
        casper.click('.comments-level-0 .media-body .comments-reply-button');
        // Verify that the reply form is shown
        test.assertExists('.comments-reply-container form.comments-new-reply-form', 'The reply form is present');
        // Verify that the reply textarea is shown
        test.assertExists('.comments-reply-container form.comments-new-reply-form textarea', 'The reply textarea is present');
        // Verify that the reply form submit button is shown
        test.assertExists('.comments-reply-container form.comments-new-reply-form button[type="submit"]', 'The reply submit button is present');
        // Fill and submit the form
        casper.fill('.comments-reply-container form.comments-new-reply-form', {
            'comments-new-reply': 'New reply to comment'
        }, true);
        // Wait for the reply to show up in the list
        casper.waitForSelector('.comments-level-1', function() {
            // Verify that the comment was placed
            test.assertSelectorHasText('.comments-level-1 .media-body', 'New reply to comment', 'The reply was successfully placed');
            // Verify there is a reply button
            test.assertExists('.comments-level-1 .media-body .comments-reply-button', 'The reply button is present on the new reply');
            // Verify there is a delete button
            test.assertExists('.comments-level-1 .media-body .oae-trigger-deletecomment', 'The delete button is present on the new reply');
        });
    };

    /**
     * Verify comments and replies can be deleted
     */
    var verifyDeletingComment = function() {
        // Delete the top level comment
        casper.click('.comments-level-0 .media-body .oae-trigger-deletecomment');
        // Wait for the confirmation modal to pop up
        casper.waitForSelector('#deletecomment-modal', function() {
            // Verify that all delete confirmation elements are present
            test.assertExists('#deletecomment-modal .alert-danger', 'The confirmation message is shown in the delete comment modal');
            test.assertExists('#deletecomment-modal .modal-footer button[data-dismiss="modal"]', 'The cancel button is shown in the delete comment modal');
            test.assertExists('#deletecomment-modal .modal-footer button#deletecomment-delete', 'The confirmation button is shown in the delete comment modal');
            // Confirm that the comment should be deleted
            casper.click('#deletecomment-modal .modal-footer button#deletecomment-delete');
            // Verify the top level comment was soft-deleted
            casper.waitForSelector('.comments-level-0.deleted', function() {
                test.assertExists('.comments-level-0.deleted', 'The top level comment was successfully soft deleted');
                // Delete the reply to the top level comment
                casper.click('.comments-level-1 .media-body .oae-trigger-deletecomment');
                // Wait for the confirmation modal to pop up
                casper.waitForSelector('#deletecomment-modal', function() {
                    // Confirm that the comment should be deleted
                    casper.click('#deletecomment-modal .modal-footer button#deletecomment-delete');
                    // Verify the reply was deleted
                    casper.waitWhileSelector('.comments-level-1', function() {
                        test.assertDoesntExist('.comments-level-1', 'The reply to the top level comment was successfully deleted');
                    });
                });
            });
        });
    };

    /**
     * Verify formatting of Markdown in comment body
     */
    var verifyFormattingComment = function() {
        casper.waitForSelector('.comments-new-comment-form', function() {

            var comment = [
                'Absolute Link: [Absolute Link](http://oaeproject.org)',
                '',
                'Relative Link: [Link](/path/to/file)',
                '',
                'Bare Tenant Link: ' + configUtil.tenantUI + '/path/to/file',
                '',
                'Image: ![Alternate Text](http://www.oaeproject.org/themes/oae/logo.png)',
                '',
                '- Bullet Item',
                '',
                '_Emphasized Text_',
                '',
                '**Strong Text**',
                '',
                '`Preformatted Text`',
                '',
                '# First Level Heading',
                '',
                '## Second Level Heading',
                '',
                '### Third Level Heading',
                '',
                '#### Fourth Level Heading',
                '',
                '##### Fifth Level Heading',
                '',
                '###### Sixth Level Heading',
                '',
                'Paragraph with',
                'line break',
                '',
                '<script>alert("XSS attack")</script>'
            ].join('\n');

            // Fill the form
            casper.fill('.comments-new-comment-form', {
                'comments-new-comment': comment
            }, true);

            // Wait for the comment to show up in the list
            casper.waitForSelector('.comments-level-0', function() {

                // Verify links
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(1) a', 'Absolute Link', 'Links are correcty formatted');
                test.assertExists('.comments-level-0 .media-body .oae-markdown p:nth-of-type(1) a[href="http://oaeproject.org"]', 'Absolute links have correct href attributes');
                test.assertExists('.comments-level-0 .media-body .oae-markdown p:nth-of-type(2) a[href="/path/to/file"]', 'Relative links have correct href attributes');
                test.assertExists('.comments-level-0 .media-body .oae-markdown p:nth-of-type(3) a[href="/path/to/file"]', 'Tenant links have relative href attributes');

                // Verify images
                test.assertElementCount('.comments-level-0 .media-body .oae-markdown p:nth-of-type(4) img', 1, 'Images are correcty embedded');
                test.assertExists('.comments-level-0 .media-body .oae-markdown p:nth-of-type(4) img[src="http://www.oaeproject.org/themes/oae/logo.png"]', 'Images have correct src attributes');
                test.assertExists('.comments-level-0 .media-body .oae-markdown p:nth-of-type(4) img[alt="Alternate Text"]', 'Images have correct alt attributes');

                // Verify lists
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown ul li', 'Bullet Item', 'List items are correcty formatted');

                // Verify text formating
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(5) em', 'Emphasized Text', 'Emphasized text is correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(6) strong', 'Strong Text', 'Strong text is correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(7) code', 'Preformatted Text', 'Preformatted text is correcty formatted');

                // Verify headings
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h1', 'First Level Heading', 'First-level headings are correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h2', 'Second Level Heading', 'Second-level headings are correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h3', 'Third Level Heading', 'Third-level headings are correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h4', 'Fourth Level Heading', 'Fourth-level headings are correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h5', 'Fifth Level Heading', 'Fifth-level headings are correcty formatted');
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown h6', 'Sixth Level Heading', 'Sixth-level headings are correcty formatted');

                // Verify paragraphs
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(8)', 'Paragraph withline break', 'Paragraphs are correctly formatted');
                test.assertElementCount('.comments-level-0 .media-body .oae-markdown p:nth-of-type(8) br', 1, 'Line breaks are correcty embedded in paragraphs');

                // Verify sanitizing HTML
                test.assertSelectorHasText('.comments-level-0 .media-body .oae-markdown p:nth-of-type(9)', '<script>alert("XSS attack")</script>', 'Scripts are correcty escaped');
            });
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test comments with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            // Create a content item
            contentUtil.createFile(null, null, null, null, null, null, function(err, contentProfile) {
                uiUtil.openContentProfile(contentProfile);

                // Verify placing a comment
                casper.then(function() {
                    casper.echo('# Verify placing a new comment', 'INFO');
                    verifyPlacingComment();
                });

                // Verify replying to a comment
                casper.then(function() {
                    casper.echo('# Verify replying to a comment', 'INFO');
                    verifyReplyToComment();
                });

                // Verify deleting a comment
                casper.then(function() {
                    casper.echo('# Verify deleting a comment', 'INFO');
                    verifyDeletingComment();
                });

                // Verify formatting a comment
                casper.then(function() {
                    casper.echo('# Verify formatting a comment', 'INFO');
                    verifyFormattingComment();
                });
            });

            // Log user out
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
