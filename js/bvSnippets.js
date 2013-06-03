(function($){
/*******************************************************************************************/    
// jquery.bvSnippets.js - version 1.0
// A jQuery plugin for injecting common Bazaarvoice Data API snippets
// 
// Copyright (c) 2013, Ben Balentine
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

// Copyright 2013 Bazaarvoice, Inc.

// Unless required by applicable law or agreed to in writing, the example code
// below is provided "as is" without warranty of any kind, either express or
// implied, including without limitation any implied warranties of condition,
// uninterrupted use, merchantability, or fitness for a particular purpose.
/*******************************************************************************************/

	$.fn.featuredReviews = function(apikey, options){
		//define option defaults.  this also enumerates all possible options
		options = parseOptions(options);
		
		/* GLOBALS FOR REVIEWS */ 
		var reviewContent = {}; //used to capture inline rating object callback
		var featuredReviewString = ''; //used to concatenate products for batch query
		var featuredReviewList = {}; //list of products to query
		var queryString = '';
		var reviewsTemplate = renderAPIMap('reviews', options);

		$.each(this, function(element, index, array){ //this builds the collection that associates each DOM with its productId and sets up the query string for each product
			var currentProduct = $(this).attr("data-id");
			featuredReviewString += '&resource.'+currentProduct+'=reviews&Filter.'+currentProduct+'=productId:'+currentProduct;
			featuredReviewList[element] = {Node: this, productId: currentProduct};
		});

		queryString = (options.staging !== undefined && !options.staging ? 'http://api.bazaarvoice.com' :'http://stg.api.bazaarvoice.com')+"/data/batch.json?apiversion="+options.apiversion+"&passkey="+apikey+"&"+featuredReviewString+"&filter="+options.filters+"&include=Products&Limit="+options.limit+"&Sort="+options.sort+"&callback=?";

		$.getJSON(queryString, {dataType: 'json'},
			function(json){
				renderResults(json, featuredReviewList, reviewsTemplate);
			}
		);
	};

	$.fn.featuredQuestions = function(apikey, options){
		options = parseOptions(options);

		/* GLOBALS FOR Questions */ 
		var questionContent = {}; //used to capture inline rating object callback
		var featuredQuestionString = ''; //used to concatenate products for batch query
		var featuredQuestionList = {}; //list of products to query
		var queryString = '';
		var questionsTemplate = renderAPIMap('questions', options);

		$.each(this, function(element, index, array){ //this builds the collection that associates each DOM with its productId and sets up the query string for each product
			var currentProduct = $(this).attr("data-id");
			featuredQuestionString += '&resource.'+currentProduct+'=questions&Filter.'+currentProduct+'=productId:'+currentProduct;
			featuredQuestionList[element] = {Node: this, productId: currentProduct};
		});

		queryString = (options.staging !== undefined && !options.staging ? 'http://api.bazaarvoice.com' :'http://stg.api.bazaarvoice.com')+"/data/batch.json?apiversion="+options.apiversion+"&passkey="+apikey+"&"+featuredQuestionString+"&filter="+options.filters+"&include=Products&Limit="+options.limit+"&Sort="+options.sort+"&callback=?";


		$.getJSON(queryString, {dataType: 'json'},
			function(json){
				renderResults(json, featuredQuestionList, questionsTemplate);
			}
		);
	};

	/* UTILITY FUNCTIONS */
	function parseOptions(options){
		return {
			sort: (options.sort !== undefined ? options.sort : 'LastModificationTime:desc'),
			filters: (options.filters !== undefined ? options.filters : 'IsFeatured:true'),
			staging: (options.staging !== undefined ? options.staging : false),
			limit: (options.limit !== undefined ? options.limit : '1'),
			apiversion: (options.apiversion !== undefined ? options.apiversion : '5.4'),
			legacy_hostname: (options.legacy_hostname !== undefined ? options.legacy_hostname : false ), //false indicates C13 client
			legacy_displaycode: (options.displaycode !== undefined ? options.displaycode : false ), //false indicates C13 client
			content_path: (options.legacy_hostname && options.legacy_displaycode ? options.legacy_hostname+( !options.staging ? '' : '/bvstaging' )+'/'+options.legacy_displaycode+'/' : (options.staging ? 'http://display.ugc.bazaarvoice.com' : 'http://display-stg.ugc.bazaarvoice.com'))
		};
	}

	function renderAPIMap(contentType, options) { //Returns the appropriate content API map for each content type.  This may eventually be replaced by a schema validation function or universal node type reference.
		if(contentType == 'reviews') {
			return { //To remove or hide elements from this template, use CSS rather than editing the DOM
				DOM: '\<div class\=\"BVFRWContainer BVRating_{{ReviewRating}}_{{ReviewRatingRange}}\"\>\<div class\=\"BVFRWProductImage\"\>\<img src\=\"{{SubjectImage}}\"\>\</div\>\<div class\=\"BVFRWContainerHeader\"\>\<div class\=\"BVFRWReviewTitle\"\>\<a href\=\"{{ReviewDeepLink}}\"\>{{ReviewTitle}}\</a\>\</div\>\<div class\=\"BVFRWInlineReviewAuthor\"\>\<span class\=\"BVFRWReviewBy\"\>By:\</span\>{{ReviewAuthor}}\</div\>\</div\>\<div class\=\"BVFRWContent\"\>\<div class\=\"BVFWRatingWrapper\"\>\<div class\=\"BVFWRatingBackground\"\>{{ReviewRatingRangeStars}}\</div\>\<div class\=\"BVFRWRating\"\>{{ReviewRatingStars}}\</div\>\</div\>\<div class\=\"BVFRWproductName\"\>{{SubjectName}}\</div\>\<div class\=\"BVFRWReviewText\"\>{{ReviewText}}\</div\>\<a class\=\"BVFRWReadMore\" href\=\"{{ReviewDeepLink}}\"\>Read More\</a\>\</div\>\</div\>',
				Tokens: { //key should be the token, and assigned to path in the json result relative to the individual review
					SubjectImage: 'productNode.ImageUrl',
					ReviewDeepLink: ( !options.legacy_hostname && !options.legacy_displaycode ? 'productNode.ProductPageUrl+"#review/"+contentElement.Id' : '"'+options.content_path+'"+contentElement.ProductId+"/review/"+contentElement.Id+"/redirect.htm"'), //this one is weird, but has to be here and escaped.
					ReviewTitle: 'contentElement.Title',
					ReviewAuthor: 'contentElement.UserNickname',
					ReviewRatingRange: 'contentElement.RatingRange',
					ReviewRating: 'contentElement.Rating',
					ReviewRatingRangeStars: 'renderStars(contentElement.RatingRange)',
					ReviewRatingStars: 'renderStars(contentElement.Rating)',
					SubjectName: 'productNode.Name',
					ReviewText: 'contentElement.ReviewText'
				}
			};
		}
		else if(contentType == 'questions') {
			return { //To remove or hide elements from this template, use CSS rather than editing the DOM
				DOM: '\<div class\=\"BVFQContainer\"\>\<div class\=\"BVFQSubjectImage\"\>\<img src\=\"{{SubjectImage}}\"\>\</div\>\<div class\=\"BVFQContainerHeader\"\>\<div class\=\"BVFQSummary\"\>\<a href\=\"{{QuestionDeepLink}}\"\>{{QuestionSummary}}\</a\>\</div\>\<div class\=\"BVFQAuthor\"\>\<span class\=\"BVFQQuestionBy\"\>By:\</span\>{{QuestionAuthor}}\</div\>\</div\>\<div class\=\"BVFQContent\"\>\<div class\=\"BVFQproductName\"\>{{SubjectName}}\</div\>\<div class\=\"BVFQQuestionText\"\>{{QuestionText}}\</div\>\<a class\=\"BVFQReadMore\" href\=\"{{QuestionDeepLink}}\"\>Read More\</a\>\</div\>\</div\>',
				Tokens: { //key should be the token, and assigned to path in the json result relative to the individual review
					SubjectImage: 'productNode.ImageUrl',
					QuestionDeepLink: ( !options.legacy_hostname && !options.legacy_displaycode ? 'productNode.ProductPageUrl+"#question/"+contentElement.Id' : '"'+options.content_path+'"+contentElement.ProductId+"/question/"+contentElement.Id+"/redirect.htm"'), //this one is weird, but has to be here and escaped.
					QuestionSummary: 'contentElement.QuestionSummary',
					QuestionAuthor: 'contentElement.UserNickname',
					SubjectName: 'productNode.Name',
					QuestionText: 'contentElement.QuestionDetails'
				}
			};
		}
		else {
			console.log('Invalid content type: '+contentType);
			return false;
		}
	}

	function renderResults(resultsJson, resultsList, domTemplate) {
		if(resultsJson.Errors.length > 0){
			console.log(JSON.stringify(resultsJson.Errors));
		}
		$.each(resultsList, function(key, value){
			if(typeof resultsJson.BatchedResults[value.productId] === 'object') {
				var productNode = resultsJson.BatchedResults[value.productId].Includes.Products[resultsJson.BatchedResults[value.productId].Includes.ProductsOrder[0]]; //Product Information
				var contentsNode = resultsJson.BatchedResults[value.productId].Results; //All content Content
				var contentsDOM = ''; //needed to avoid an 'undefined' string appearing in the dom
				contentsNode.forEach(function(contentElement,contentIndex,contentArray){
					contentsDOM += domTemplate.DOM;
					$.each(domTemplate.Tokens, function(key, value){
						contentsDOM = contentsDOM.replace(eval('/{{'+key+'}}/g'),  eval(value)); //searches template for key and replaces it with specified path
					});
				});
				$(value.Node).html(contentsDOM); //push list of contents to the dom
			}
		});
	}

	function renderStars( num ) {
		var star = '&#9733'; //note: star color and background color must be set individually in CSS
		return Array(num + 1).join(star);
	}

}(jQuery));