(function($){
/*******************************************************************************************/    
// jquery.bvSnippets.js - version 1.1
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

	$.fn.featuredStories = function(apikey, options){
		options = parseOptions(options);

		/* GLOBALS FOR Questions */ 
		var storyContent = {}; //used to capture inline rating object callback
		var featuredStoryString = ''; //used to concatenate products for batch query
		var featuredStoryList = {}; //list of products to query
		var queryString = '';
		var storiesTemplate = renderAPIMap('stories', options);

		$.each(this, function(element, index, array){ //this builds the collection that associates each DOM with its productId and sets up the query string for each product
			var currentProduct = $(this).attr("data-id");
			featuredStoryString += '&resource.'+currentProduct+'=stories&Filter.'+currentProduct+'=productId:'+currentProduct;
			featuredStoryList[element] = {Node: this, productId: currentProduct};
		});

		queryString = (options.staging !== undefined && !options.staging ? 'http://api.bazaarvoice.com' :'http://stg.api.bazaarvoice.com')+"/data/batch.json?apiversion="+options.apiversion+"&passkey="+apikey+"&"+featuredStoryString+"&filter="+options.filters+"&include=Products&Limit="+options.limit+"&Sort="+options.sort+"&callback=?";


		$.getJSON(queryString, {dataType: 'json'},
			function(json){
				renderResults(json, featuredStoryList, storiesTemplate);
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
			content_path: (options.legacy_hostname && options.legacy_displaycode ? options.legacy_hostname+( !options.staging ? '' : '/bvstaging' )+'/'+options.legacy_displaycode+'/' : (options.staging ? 'http://display.ugc.bazaarvoice.com' : 'http://display-stg.ugc.bazaarvoice.com')),
			abbreviate_text: (options.abbreviate_text !== undefined ? options.abbreviate_text : false)
		};
	}

	function renderAPIMap(contentType, options) { //Returns the appropriate content API map for each content type.  This may eventually be replaced by a schema validation function or universal node type reference.

		Handlebars.registerHelper('starRatings', function(num) {
			var star = '&#9733;'; //note: star color and background color must be set individually in CSS
			return Array(num + 1).join(star);
		});

		Handlebars.registerHelper('reviewDeepLink', function(Id,pdp,pid) { //id is the review id, pdp is the product page url, pid is the product external id
			var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#review/"+Id : options.content_path+pid+"/review/"+Id+"/redirect.htm")
			return link;
		});

		Handlebars.registerHelper('questionDeepLink', function(Id,pdp,pid) { //id is the question id, pdp is the product page url, pid is the product external id
			var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#question/"+Id : options.content_path+pid+"/question/"+Id+"/redirect.htm")
			return link;
		});

		Handlebars.registerHelper('storyDeepLink', function(Id,pdp,pid) { //id is the story id, pdp is the product page url, pid is the product external id
			var link = ( !options.legacy_hostname && !options.legacy_displaycode ? pdp+"#story/"+Id : options.content_path+pid+"/story/"+Id+"/redirect.htm")
			return link;
		});
		
		Handlebars.registerHelper('contentText', function(content) { //id is the question id, pdp is the product page url, pid is the product external id
			var text = ( !options.abbreviate_text ? content : (content != null && content.length > options.abbreviate_text ? content.substring(0,options.abbreviate_text)+'...' : content ) );
			return text;
		});

		if(contentType == 'reviews') {
			return Handlebars.compile(' \
				<div class="BVFRWContainer BVRating_{{Rating}}_{{RatingRange}}"> \
					<div class="BVFRWProductImage"> \
						<img src="{{product.ImageUrl}}"> \
					</div> \
					<div class="BVFRWContainerHeader"> \
						<div class="BVFRWReviewTitle"> \
							<a href="{{reviewDeepLink Id product.ProductPageUrl productId}}">{{Title}}</a> \
						</div> \
						<div class="BVFRWInlineReviewAuthor"> \
							<span class="BVFRWReviewBy">By:</span> \
							<span class="BVFRWReviewAuthor">{{UserNickname}}</span> \
						</div> \
					</div> \
					<div class="BVFRWContent"> \
						<div class="BVFWRatingWrapper"> \
							<div class="BVFWRatingBackground">{{{starRatings RatingRange}}}</div> \
							<div class="BVFRWRating">{{{starRatings Rating}}}</div> \
						</div> \
						<div class="BVFRWproductName">{{product.Name}}</div> \
						<div class="BVFRWReviewText">{{contentText ReviewText}}</div> \
						<a class="BVFRWReadMore" href="{{reviewDeepLink Id product.ProductPageUrl productId}}">Read More</a> \
					</div> \
				</div>');
		}
		else if(contentType == 'questions') {
			return Handlebars.compile(' \
				<div class="BVFQContainer"> \
					<div class="BVFQSubjectImage"> \
						<img src="{{product.ImageUrl}}"> \
					</div> \
					<div class="BVFQContainerHeader"> \
						<div class="BVFQSummary"> \
							<a href="{{questionDeepLink Id product.ProductPageUrl productId}}">{{QuestionSummary}}</a> \
						</div> \
						<div class="BVFQAuthor"> \
							<span class="BVFQQuestionBy">By:</span> \
							<span class="BVFQQuestionAuthor">{{UserNickname}}</span> \
						</div> \
					</div> \
					<div class="BVFQContent"> \
						<div class="BVFQproductName">{{product.Name}}</div> \
						<div class="BVFQQuestionText">{{contentText QuestionDetails}}</div> \
						<a class="BVFQReadMore" href="{{questionDeepLink Id product.ProductPageUrl productId}}">Read More</a> \
					</div> \
				</div>');
		}
		else if(contentType == 'stories') {
			return Handlebars.compile(' \
				<div class="BVFSYContainer"> \
					<div class="BVFSYSubjectImage"> \
						<img src="{{product.ImageUrl}}"> \
					</div> \
					<div class="BVFSYContainerHeader"> \
						<div class="BVFSYSummary"> \
							<a href="{{storyDeepLink Id product.ProductPageUrl productId}}">{{Title}}</a> \
						</div> \
						<div class="BVFSYAuthor"> \
							<span class="BVFSYQuestionBy">By:</span> \
							<span class="BVFSYQuestionAuthor">{{UserNickname}}</span> \
						</div> \
					</div> \
					<div class="BVFSYContent"> \
						<div class="BVFSYproductName">{{product.Name}}</div> \
						<div class="BVFSYStoryText">{{StoryText}}</div> \
						<a class="BVFSYReadMore" href="{{storyDeepLink Id product.ProductPageUrl productId}}">Read More</a> \
					</div> \
				</div>');
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
					contentElement['product'] = productNode; //pass product info to object for nested rendering
					contentsDOM += domTemplate(contentElement); //passes individual review data to template function which returns final DOM
				});
				$(value.Node).html(contentsDOM); //push list of contents to the dom
			}
		});
	}

}(jQuery));