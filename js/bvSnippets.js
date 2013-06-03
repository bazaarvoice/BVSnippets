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

// The following elements are requried:
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
		options = {
			sort: (options.sort !== undefined ? options.sort : 'LastModificationTime:desc'),
			filters: (options.filters !== undefined ? options.filters : 'IsFeatured:true'),
			staging: (options.staging !== undefined ? options.staging : false),
			limit: (options.limit !== undefined ? options.limit : '1'),
			apiversion: (options.apiversion !== undefined ? options.apiversion : '5.4'),
			legacy_hostname: (options.legacy_hostname !== undefined ? options.legacy_hostname : false ), //false indicates C13 client
			legacy_displaycode: (options.displaycode !== undefined ? options.displaycode : false ), //false indicates C13 client
			content_path: (options.legacy_hostname && options.legacy_displaycode ? options.legacy_hostname+( !options.staging ? '' : '/bvstaging' )+'/'+options.legacy_displaycode+'/' : (options.staging ? 'http://display.ugc.bazaarvoice.com' : 'http://display-stg.ugc.bazaarvoice.com'))
		};
		
		/* GLOBALS FOR REVIEWS */ 
		var reviewContent = {}; //used to capture inline rating object callback
		var featuredReviewString = ''; //used to concatenate products for batch query
		var featuredReviewList = {}; //list of products to query
		var queryString = '';

		var reviewsTemplate = {
			DOM: '\<div class\=\"BVFRWContainer\"\>\<div class\=\"BVFRWProductImage\"\>\<img src\=\"{{SubjectImage}}\"\>\</div\>\<div class\=\"BVFRWContainerHeader\"\>\<div class\=\"BVFRWReviewTitle\"\>\<a href\=\"{{ReviewDeepLink}}\"\>{{ReviewTitle}}\</a\>\</div\>\<div class\=\"BVFRWInlineReviewAuthor\"\>\<span class\=\"BVFRWReviewBy\"\>By:\</span\>{{ReviewAuthor}}\</div\>\</div\>\<div class\=\"BVFRWContent\"\>\<div class\=\"BVFWRatingWrapper\"\>\<div class\=\"BVFWRatingBackground\"\>{{ReviewRatingRange}}\</div\>\<div class\=\"BVFRWRating\"\>{{ReviewRating}}\</div\>\</div\>\<div class\=\"BVFRWproductName\"\>{{SubjectName}}\</div\>\<div class\=\"BVFRWReviewText\"\>{{ReviewText}}\</div\>\<a class\=\"BVFRWReadMore\" href\=\"{{ReviewDeepLink}}\"\>Read More\</a\>\</div\>\</div\>',
			Tokens: { //key should be the token, and assigned to path in the json result relative to the individual review
				SubjectImage: 'productNode.ImageUrl',
				ReviewDeepLink: ( !options.legacy_hostname && !options.legacy_displaycode ? 'productNode.ProductPageUrl+"#review/"+reviewElement.Id' : '"'+options.content_path+'"+reviewElement.ProductId+"/review/"+reviewElement.Id+"/redirect.htm"'), //this one is weird, but has to be here and escaped.
				ReviewTitle: 'reviewElement.Title',
				ReviewAuthor: 'reviewElement.UserNickname',
				ReviewRatingRange: 'renderStars(reviewElement.RatingRange)',
				ReviewRating: 'renderStars(reviewElement.Rating)',
				SubjectName: 'productNode.Name',
				ReviewText: 'reviewElement.ReviewText',
			}
		}; //To remove or hide elements from this template, use CSS rather than editing the DOM

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

	function renderResults(resultsJson, resultsList, domTemplate) {
		if(resultsJson.Errors.length > 0){
			console.log(JSON.stringify(resultsJson.Errors));
		}
		$.each(resultsList, function(key, value){
			if(typeof resultsJson.BatchedResults[value.productId] === 'object') {
				var productNode = resultsJson.BatchedResults[value.productId].Includes.Products[resultsJson.BatchedResults[value.productId].Includes.ProductsOrder[0]]; //Product Information
				var contentsNode = resultsJson.BatchedResults[value.productId].Results; //All Review Content
				var contentsDOM = ''; //needed to avoid an 'undefined' string appearing in the dom
				contentsNode.forEach(function(reviewElement,reviewIndex,reviewArray){
					contentsDOM += domTemplate.DOM;
					$.each(domTemplate.Tokens, function(key, value){
						contentsDOM = contentsDOM.replace(eval('/{{'+key+'}}/g'),  eval(value)); //searches template for key and replaces it with specified path
					});
				});
				$(value.Node).html(contentsDOM); //push list of reviews to the dom
			}
		});
	}

	function renderStars( num ) {
		var star = '&#9733'; //note: star color and background color must be set individually in CSS
		return Array(num + 1).join(star);
	}

}(jQuery));