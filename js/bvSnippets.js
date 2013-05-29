(function($){
/*******************************************************************************************/    
// jquery.bvSnippets.js - version 0.1
// A jQuery plugin for injecting common Bazaarvoice Data API snippets
// 
// Copyright (c) 2013, Liam Wiles, Ben Balentine
// Bazaarvoice PRREP Project
// https://github.com/bazaarvoice/BVSnippets
// Created: 2013-05-10
//
// This example shows the javascript syntax
// for displaying a featured review

// The following elements are requried:
// - bvhost
// - displaycode
// - apikey

// If you omit any optional elements, be sure to exclude the element
// completely instead of providing an empty element.

// Copyright 2013 Bazaarvoice, Inc.

// Unless required by applicable law or agreed to in writing, the example code
// below is provided "as is" without warranty of any kind, either express or
// implied, including without limitation any implied warranties of condition,
// uninterrupted use, merchantability, or fitness for a particular purpose.
/*******************************************************************************************/


	$.fn.featuredReviews = function(displaycode, apikey, options){

		var renderStars = function( num ) {
			var star = '&#9733';
			return Array(num + 1).join(star);
		};

		var myThis = this;
		
		var productId = [];
		var reviewContent = {}; //used to capture inline rating object callback
		var featuredReviewString = ''; //used to concatenate products for batch query
		var featuredReviewList = {}; //list of products to query

		var template = 
		'\<div class\=\"BVFRWContainer\"\>\<div class\=\"BVFRWProductImage\"\>\<img src\=\"{{SubjectImage}}\"\>\</div\>\<div class\=\"BVFRWContainerHeader\"\>\<div class\=\"BVFRWReviewTitle\"\>\<a href\=\"{{ReviewDeepLink}}\"\>{{ReviewTitle}}\</a\>\</div\>\<div class\=\"BVFRWInlineReviewAuthor\"\>\<span class\=\"BVFRWReviewBy\"\>By:\</span\>{{ReviewAuthor}}\</div\>\</div\>\<div class\=\"BVFRWContent\"\>\<div class\=\"BVFRWRatingImage\"\>{{ReviewRating}}/{{ReviewRatingRange}}\</div\>\<div class\=\"BVFRWproductName\"\>{{SubjectName}}\</div\>\<div class\=\"BVFRWReviewText\"\>{{ReviewText}}\</div\>\<a class\=\"BVFRWReadMore\" href\=\"{{ReviewDeepLink}}\"\>Read More\</a\>\</div\>\</div\>';

		this.each(function(element, index, array){
			var currentProduct = $(this).attr("data-id");
			productId.push(currentProduct);
			featuredReviewString+='&resource.'+currentProduct+'=reviews&filter.'+currentProduct+'=IsFeatured:true&Limit.'+currentProduct+'=1&Filter.'+currentProduct+'=productId:'+currentProduct+'&Sort.'+currentProduct+'='+( options !== undefined && options.sort !== undefined ? options.sort : 'LastModificationTime:desc' );
			featuredReviewList[currentProduct] = this;
		});

		$.getJSON((options.staging !== undefined && options.staging == false ? 'http://api.bazaarvoice.com' :'http://stg.api.bazaarvoice.com')+"/data/batch.json?apiversion=5.4&passkey="+apikey+"&"+featuredReviewString+"&include=Products&callback=?", 
			{dataType: 'json'},
			function(json){
				productId.forEach(function(element,index,array){
					if(typeof json.BatchedResults[element].Includes.Products === 'object') {
						var productNode = json.BatchedResults[element].Includes.Products[json.BatchedResults[element].Includes.ProductsOrder[0]]; //Product Information
						var reviewsNode = json.BatchedResults[element].Results[0]; //Review Content
						reviewContent[element] = template
							.replace(/{{SubjectImage}}/g,  productNode.ImageUrl)
							.replace(/{{ReviewDeepLink}}/g,  productNode.ProductPageUrl + '#review/' + json.BatchedResults[element].Results[0].Id)
							.replace(/{{ReviewRating}}/g,  renderStars(reviewsNode.Rating))
							.replace(/{{ReviewRatingRange}}/g,  reviewsNode.RatingRange)
							.replace(/{{ReviewTitle}}/g,  reviewsNode.Title)
							.replace(/{{ReviewAuthor}}/g,  reviewsNode.UserNickname)
							.replace(/{{SubjectName}}/g,  productNode.Name)
							.replace(/{{ReviewText}}/g,  reviewsNode.ReviewText);
					}
				});
				$.each(featuredReviewList, function(index, value){
					if(typeof reviewContent[index] === 'string') {
						$(value).html(reviewContent[index]);
					}
					else {
						console.log('Error:' + reviewContent);
						console.log('Error:' + index);
						console.log('Error:' + value);
					}
				});
			}
		);
		console.log(myThis);
	};

}(jQuery));