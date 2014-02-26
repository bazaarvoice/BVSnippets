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

    // IE8 backwards compatibility
    // if(console == 'undefined'){
    //  var console = {
    //      log: function(){}
    //  };
    // }
    $.fn.customSnippet = function(apikey, options){
        //basic function that can be overridden with a custom query type and
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: options.apiQueryType,
            template: options.template
        };
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.inlineRatings = function(apikey, options){
        //define option defaults for inline ratings.  this also enumerates all possible options
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: "products",
            template: options.template || "inline_ratings"
        };
        options.stats = 'reviews';
        options.staticResourceName = 'products'; //this must match contentString
        options.contentString = '&resource.products=products&filter.products=Id:' + $(this).map(function(){return $(this).attr("data-id");}).get().join(","); //overrides query to use a single batch rather than one batch per product
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredReviews = function(apikey, options){
        //define option defaults for inline ratings.  this also enumerates all possible options
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: "reviews",
            template: options.template || "reviews"
        };
        options.filter = 'IsFeatured:true';
        options.sort = 'LastModificationTime:desc';
        options.limit = 1;
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredQuestions = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: "questions",
            template: options.template || "questions"
        };
        options.sort = 'LastModificationTime:desc';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.featuredStories = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: "stories",
            template: options.template || "stories"
        };
        options.sort = 'LastModificationTime:desc';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    $.fn.mediaGallery = function(apikey, options){
        var defaultConfiguration = {
            selectedElements: this,
            apiQueryType: "reviews",
            template: options.template || "media_gallery"
        };
        options.filter = 'HasPhotos:true';
        options = parseOptions(options);
        
        defaultSnippet(defaultConfiguration, apikey, options);
    };

    /* UTILITY FUNCTIONS */
    function defaultSnippet(contentType, apikey, options){
        var contentString; //used to concatenate products for batch query
        var contentList = {}; //list of products to query
        var queryString;
        var newtemplate;

        $.each(contentType.selectedElements, function(element, index, array){ //this builds the collection that associates each DOM with its productId and sets up the query string for each product
            var currentProduct = $(this).attr("data-id");
            contentString += '&resource.'+currentProduct+'='+contentType.apiQueryType+(contentType.apiQueryType === 'products' ? '&Filter.'+currentProduct+'=Id:'+currentProduct : '&Filter.'+currentProduct+'=productId:'+currentProduct );
            contentList[element] = {Node: this, productId: currentProduct};
        });
        queryPrefix = (options.ssl ? 'https://': 'http://') + (options.staging !== undefined && !options.staging ? 'api.bazaarvoice.com' :'stg.api.bazaarvoice.com');
        queryString = queryPrefix+"/data/batch.json?apiversion="+options.apiversion+"&passkey="+apikey+"&"+(options.contentString || contentString)+"&filter="+options.filter+"&include="+(options.include || "products")+"&stats="+options.stats+"&Limit="+options.limit+"&Sort="+options.sort+"&callback=?";

        $.when(
            newtemplate = renderAPIMap(contentType.template, options)
        ).done(function(){
            $.getJSON(queryString, {dataType: 'json'},
                function(json){
                    renderResults(json, contentList, newtemplate, options);
                }
            );
        });
    }

    function renderAPIMap(contentType, options) { //Returns the appropriate content API map for each content type.  This may eventually be replaced by a schema validation function or universal node type reference.
        defineHelpers(options);
        
        // find template and load it based on content type
        var currentTemplate;
        $.ajax({
            url: localPath+"BVtemplates/"+contentType+(contentType.indexOf('.') !== -1 ? "" : ".html"),
            success: function(data) {
                console.log("Loading Template: "+contentType+(contentType.indexOf('.') !== -1 ? "" : ".html"));
                currentTemplate = Handlebars.compile(data);
            },
            async: false
        }).fail(function(e){
            console.log('Failed loading content type: '+contentType);
        });
        return currentTemplate;
    }

    function renderResults(resultsJson, resultsList, domTemplate, options) {
        if(resultsJson.Errors.length > 0){
            console.log(JSON.stringify(resultsJson.Errors));
        }
        $.each(resultsList, function(key, value){
            var resourceName = options.staticResourceName || value.productId;
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
                            contentsNode.Includes['ProductsOrder'].push(product['Id']);
                            contentsNode.Includes['Products'][product['Id']] = contentsNode['Results'][index];
                        }
                    });
                }
                if(typeof contentsNode.Includes.ProductsOrder == 'object') {
                    contentsNode['product'] = contentsNode.Includes.Products[value.productId] || contentsNode; //Product Information
                    var contentsDOM = ''; //needed to avoid an 'undefined' string appearing in the dom
                    console.log("Applying overrides, if present: ");
                    $.extend(true, contentsNode, options.model_override);
                    console.log("Pushing JSON to template: ");
                    console.log(contentsNode);
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
            sort: '',
            filter: '',
            stats: '',
            include: 'products',
            model_override: {},
            contentString: '',
            staging: false,
            limit: 100,
            apiversion: '5.4',
            legacy_hostname: false, //false indicates C13 client
            legacy_displaycode: false, //false indicates C13 client
            ssl: false,
            abbreviate_text: false,
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