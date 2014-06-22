(function($){
/*******************************************************************************************/    
// jquery.bvSnippets.js - version 1.3
// A jQuery plugin for injecting common Bazaarvoice Data API snippets
// 
// Copyright (c) 2014 Ben Balentine, Bazaarvoice
// Bazaarvoice PRREP Project
// https://github.com/bazaarvoice/BVSnippets
// Created: 2013-05-10
//
// This example shows the javascript syntax
// for displaying a featured review

// The following element(s) are requried:
// - apikey

// If you omit any optional elements, be sure to exclude the element
// completely instead of providing an empty element.
// Note that PRR clients must specify a legacy_hostname and legacy_displaycode in order for deep links to render correctly

// Copyright [2014] [Bazaarvoice]

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/*******************************************************************************************/

//get current script path
var scriptEls = document.getElementsByTagName( 'script' );
var thisScriptEl = scriptEls[scriptEls.length - 1];
var scriptPath = thisScriptEl.src;

var localPath = scriptPath.substr(0, scriptPath.lastIndexOf( '/js' )+1 );

    $.fn.customSnippet = function(apikey, options){
        //basic function that can be overridden with a custom query type and
        var defaultConfiguration = {
            selectedElements: this,
        };
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.inlineRatings = function(apikey, options){
        //define option defaults for inline ratings.  this also enumerates all possible options
        var defaultConfiguration = {
            selectedElements: this
        };
        options.template = 'inline_ratings';
        options.apiQueryType = 'statistics';
        options.stats = 'reviews';
        options.contentString = 'resource.'+options.apiQueryType+'='+options.apiQueryType;
        options.filter_global = true;
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredReviews = function(apikey, options){
        //define option defaults for inline ratings.  this also enumerates all possible options
        var defaultConfiguration = {
            selectedElements: this
        };
        options.template = 'reviews';
        options.apiQueryType = 'reviews';
        options.filter = 'IsFeatured:true';
        options.sort = 'LastModificationTime:desc';
        options.limit = 1;
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredQuestions = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this
        };
        options.template = 'questions';
        options.apiQueryType = 'questions';
        options.sort = 'LastModificationTime:desc';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredStories = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this
        };
        options.template = 'stories';
        options.apiQueryType = 'stories';
        options.sort = 'LastModificationTime:desc';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.mediaGallery = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this
        };
        options.template = 'media_gallery';
        options.apiQueryType = 'reviews';
        options.filter = 'HasPhotos:true';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    /* UTILITY FUNCTIONS */
    function defaultSnippet(contentType, apikey, options){
        var newtemplate;
        var offset = 0;
        var maxQuerySize = 100;
        var queryList = []; //This is an array of objects.  Each object contains a query string and an element

        while(contentType.selectedElements.length > 0 && offset <= options.limit){
            var elementChunk = contentType.selectedElements.splice(0,maxQuerySize); //This is the loop iterator
            var queryChunk = {
                contentString: '',
                contentList: {}, //list of products to query
                queryString: ''
            };
            var GlobalProductList = $.map(elementChunk, function(value, index){return $(value).attr('data-id');});
            $.each(elementChunk, function(element, index, array){ //this builds the collection that associates each DOM with its productId and sets up the query string for each product
                var currentProduct = $(this).attr("data-id");
                queryChunk.contentString += '&resource.'+currentProduct+'='+options.apiQueryType+'&Filter.'+currentProduct+'=productId:'+currentProduct;
                queryChunk.contentList[element] = {Node: this, ProductId: currentProduct};
            });
            queryPrefix = (options.ssl ? 'https://': 'http://') + (options.staging !== undefined && !options.staging ? 'api.bazaarvoice.com' :'stg.api.bazaarvoice.com');
            queryChunk.queryString = queryPrefix+"/data/batch.json?apiversion="+options.apiversion+"&passkey="+apikey+"&"+(options.contentString || queryChunk.contentString)+"&filter="+options.filter+"&include="+(options.include || "products")+(options.filter_global ? '&Filter='+(options.apiQueryType!=='statistics'?'Id':'productId')+':'+GlobalProductList.join(',') :'')+"&stats="+options.stats+"&Limit="+options.limit+"&Sort="+options.sort+"&callback=?";
            offset += maxQuerySize;
            queryList.push(queryChunk);
        }
        $.when(
            newtemplate = renderAPIMap(options)
        ).done(function(){
            // Loop through pages of queries since BV API limits all calls to 100 results
            $.each(queryList, function(index, value){
                $.getJSON(value.queryString, {dataType: 'json'},
                    function(json){
                        renderResults(json, value.contentList, newtemplate, options);
                    }
                );
            });
        });
    }

    function renderAPIMap(options) { //Returns the appropriate content API map for each content type.  This may eventually be replaced by a schema validation function or universal node type reference.
        defineHelpers(options);
        // find template and load it based on content type
        var currentTemplate;
        var templatePath = options.template;
        if(options.template.indexOf('http') === -1){
            templatePath = localPath+"templates/"+options.template+(options.template.indexOf('.') !== -1 ? "" : ".html");
        }
        $.ajax({
            url: templatePath,
            success: function(data) {
                currentTemplate = Handlebars.compile(data);
            },
            async: false
        }).fail(function(e){
            console.log('Failed loading content type: '+options.template);
        });
        return currentTemplate;
    }

    function renderResults(resultsJson, resultsList, domTemplate, options) {
        if(resultsJson.Errors.length > 0){
            console.log(JSON.stringify(resultsJson.Errors));
        }
        $.each(resultsList, function(key, value){
            var resourcePrefix = options.apiQueryType!=='statistics'?'Id':'ProductId';
            var resourceName = (options.apiQueryType==='statistics' || options.apiQueryType==='products')?options.apiQueryType:value.ProductId;
            var contentsNode = resultsJson.BatchedResults[resourceName]; //All content Content
            contentsNode = $.extend(true, {
                Includes: {
                    Products: {},
                    ProductsOrder: []
                }
            },contentsNode); //initializes products heirarchy if it doesn't already exist
            if(typeof contentsNode == 'object') {
                if(contentsNode['Id'] == resourceName) { //if true, it's a products call and not a content call.  this requires moving the products into the expected includes node
                    $.each(contentsNode['Results'], function(index, product){
                        if(typeof product === 'object'){
                            if(typeof product[resourcePrefix] !== 'undefined'){
                                contentsNode.Includes['ProductsOrder'].push(product[resourcePrefix]);
                                contentsNode.Includes['Products'][product[resourcePrefix]] = contentsNode['Results'][index];
                            }
                            if(typeof product['ProductStatistics'] === 'object' && typeof product['ProductStatistics'][resourcePrefix] !== 'undefined'){
                                contentsNode.Includes['ProductsOrder'].push(product['ProductStatistics'][resourcePrefix]);
                                contentsNode.Includes['Products'][product['ProductStatistics'][resourcePrefix]] = product['ProductStatistics'];
                            }
                        }
                    });
                }
                if(typeof contentsNode.Includes.ProductsOrder == 'object') {
                    contentsNode['product'] = contentsNode.Includes.Products[value.ProductId] || contentsNode; //Product Information
                    var contentsDOM = ''; //needed to avoid an 'undefined' string appearing in the dom
                    $.extend(true, contentsNode, options.model_override); //apply model overrides
                    contentsDOM = domTemplate(contentsNode);
                    $(value.Node).html(contentsDOM); //push list of contents to the dom
                }
                else {
                    console.log('Product node incomplete');
                    console.log(typeof contentsNode.Includes.ProductsOrder);
                }
            }
            else {
                console.log('API response incomplete');
            }
        });
    }

    function parseOptions(options){
        options["content_path"] = (options.legacy_hostname && options.legacy_displaycode ? options.legacy_hostname+( !options.staging ? '' : '/bvstaging' )+'/'+options.legacy_displaycode+'/' : (options.ssl === true ? 'https://': 'http://')+(!options.staging ? 'display.ugc.bazaarvoice.com' : 'display-stg.ugc.bazaarvoice.com'));

        return $.extend({
            abbreviate_text: false,
            apiversion: '5.4',
            contentString: '',
            filter: '',
            filter_global: false, //Used for products API calls.  
            include: 'products',
            limit: 100,
            legacy_hostname: false, //false indicates C13 client
            legacy_displaycode: false, //false indicates C13 client
            model_override: {},
            sort: '',
            stats: '',
            staging: false,
            ssl: false,
            callback: function(){}
        }, options);
    }

    function defineHelpers(options){
        Handlebars.registerHelper('starRatings', function(num) {
            num = num || 5;
            var star = '&#9733;'; //note: star color and background color must be set individually in CSS
            return Array(num + 1).join(star);
        });
        Handlebars.registerHelper('starGraphic', function(value) {
            value = value || 0;
            var roundedValue = (Math.round(10*value)/10).toString().split(".").join("_");
            var starpath = options["content_path"]+roundedValue+"/5/ratingSecondary.png";
            return starpath;
        });
        Handlebars.registerHelper('rangeToPercentage', function(value,max) {
            value = value || 0;
            max = max || 5;
            return Math.round(10*((value/max)*100))/10;
        });
        Handlebars.registerHelper('roundValue', function(value) {
            value = value || 0;
            return Math.round(10*value)/10;
        });
        Handlebars.registerHelper('reviewDeepLink', function(Id,pdp,pid) { //id is the review id, pdp is the product page url, pid is the product external id
            var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#review/"+Id : options.content_path+pid+"/review/"+Id+"/redirect.htm");
            return link;
        }); 
        Handlebars.registerHelper('reviewSubmissionLink', function(pid) { //pid is the product external id
            var link = options.content_path+pid+"/writereview.htm?return="+window.location.href;
            return link;
        }); 
        Handlebars.registerHelper('questionDeepLink', function(Id,pdp,pid) { //id is the question id, pdp is the product page url, pid is the product external id
            var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#question/"+Id : options.content_path+pid+"/question/"+Id+"/redirect.htm");
            return link;
        });
        Handlebars.registerHelper('questionSubmissionLink', function(pid) { //pid is the product external id
            var link = options.legacy_hostname+"/answers/"+ options.legacy_displaycode +"/product/"+pid+"/askquestion.htm";
            return link;
        });
        Handlebars.registerHelper('answerSubmissionLink', function(Id,pid) { //id is the question id, pid is the product external id
            var link = options.legacy_hostname+"/answers/"+ options.legacy_displaycode +"/product/"+pid+"/question/"+Id+"/answerquestion.htm";
            return link;
        });
        Handlebars.registerHelper('storyDeepLink', function(Id,pdp,pid) { //id is the story id, pdp is the product page url, pid is the product external id
            var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#story/"+Id : options.content_path+pid+"/story/"+Id+"/redirect.htm");
            return link;
        });
        Handlebars.registerHelper('contentText', function(content) { //id is the question id, pdp is the product page url, pid is the product external id
            var text = ( !options.abbreviate_text ? content : (content != null && content.length > options.abbreviate_text ? content.substring(0,options.abbreviate_text)+'...' : content ) );
            return text;
        });
        Handlebars.registerHelper('postedDate', function(postedDate) {
            var submissionTime = new Date(postedDate);
            return (submissionTime.getMonth() + 1) + "/" + submissionTime.getDate() + "/" + submissionTime.getFullYear();
        });
    }

}(jQuery));