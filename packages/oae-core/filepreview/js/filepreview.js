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

define(['require', 'jquery', 'oae.core'], function(require, $, oae) {

    return function(uid, showSettings, widgetData) {

        // Cache the widget container
        var $rootel = $('#' + uid);

        // Maximum file size in bytes to render previews for markdown documents
        var MAX_TEXT_PREVIEW_SIZE = 1048576; // 1MB


        /////////////////////
        // DEFAULT PREVIEW //
        /////////////////////

        /**
         * Render the default preview for all files that don't have a particular in-line preview
         */
        var renderDefault = function() {
            // If the preview status is pending, we show a "Generating" message
            if (widgetData.previews && widgetData.previews.status === 'pending') {
                oae.api.util.template().render($('#filepreview-default-pending-template', $rootel), {'content': widgetData}, $('#filepreview-container', $rootel));
            } else {
                oae.api.util.template().render($('#filepreview-default-template', $rootel), {
                    'content': widgetData,
                    'displayOptions': {
                        'addLink': false,
                        'addVisibilityIcon': false,
                        'size': 'large'
                    }
                }, $('#filepreview-container', $rootel));
            }
        };


        ///////////////////
        // IMAGE PREVIEW //
        ///////////////////

        /**
         * Render an image preview by embedding the image into the document
         */
        var renderImagePreview = function() {
            oae.api.util.template().render($('#filepreview-image-template', $rootel), {'content': widgetData}, $('#filepreview-container', $rootel));
        };


        ///////////////////////
        // MEDIACORE PREVIEW //
        ///////////////////////

        /**
         * Render a preview using MediaCore
         */
        var renderMediaCorePreview = function() {
            $.ajax({
                'url': '/api/mediacore/embed/' + widgetData.id,
                'success': function(data) {
                    oae.api.util.template().render($('#filepreview-mediacore-template', $rootel), {
                      'isAudio': widgetData.mime.substring(0, 6).toLowerCase() === 'audio/',
                      'embedCode': data.html
                    }, $('#filepreview-container', $rootel));
                }
            });
        };


        //////////////////////
        // MARKDOWN PREVIEW //
        //////////////////////

        /**
         * Render Markdown preview
         * @see http://daringfireball.net/projects/markdown/
         */
        var renderMarkdownPreview = function() {
            $.ajax({
                'url': widgetData.downloadPath,
                'crossDomain': true,
                'success': function(data) {
                    oae.api.util.template().render($('#filepreview-markdown-template', $rootel), {
                        'content': data
                    }, $('#filepreview-container', $rootel));
                }
            });
        };


        ////////////////////
        // INITIALISATION //
        ////////////////////

        /**
         * Render the file's preview based on its type
         */
        var setUpFilePreview = function() {
            // Image preview
            if (widgetData.mime.substring(0, 6).toLowerCase() === 'image/') {
                renderImagePreview();
            // MediaCore preview
            // @see http://mediacore.com/
            } else if (widgetData.previews.mediaCoreId) {
                renderMediaCorePreview();
            } else if (widgetData.mime.toLowerCase() === 'text/x-markdown' && widgetData.size <= MAX_TEXT_PREVIEW_SIZE) {
                renderMarkdownPreview();
            // Default preview
            } else {
                renderDefault();
            }
        };

        setUpFilePreview();

    };
});
