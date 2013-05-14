;(function($){
/*******************************************************************************************/    
// jquery.bvSnippets.js - version 0.1
// A jQuery plugin for injecting common Bazaarvoice Data API snippets
// 
// Copyright (c) 2013, Liam Wiles, Ben Balentine
// Bazaarvoice PRREP Project
// https://github.com/bazaarvoice/HostedUIResources
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
	
	// Begin compatability tests
	/*  define foreach for older browsers */
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function (fn, scope) {
			for (var i = 0, len = this.length; i < len; ++i) {
				fn.call(scope || this, this[i], i, this);
			}
		}
	}
	// End compatability tests

	$.fn.featuredReviews = function(bvhost, displaycode, apikey, options){
		var reviewContent = {}; //used to capture inline rating object callback
		var featuredReviewString = ''; //used to concatenate products for batch query
		var featuredReviewList = {}; //list of products to query

		featuredReviewList = $(this).map(function(){return $(this).attr("data-id");}).get();
		featuredReviewList.forEach(function(element,index,array){
			featuredReviewString+='&resource.'+element+'=reviews&filter.'+element+'=IsFeatured:true&Limit.'+element+'=1&Filter.'+element+'=ProductId:'+element+'&Sort.'+element+'=SubmissionTime:desc';
		});
		featuredReviews(featuredReviewList,function(){
			featuredReviewList.forEach(function(element,index,array){
				if(typeof reviewContent[element+'_location'] === 'string' ) {
					$('#bvReviewProduct_'+element).html(reviewContent[element+'_location']);
					$('#bvReviewProduct_'+element).append(reviewContent[element+'_name']);
					$('#bvReview_'+element).html(reviewContent[element+'_rating']);
					$('#bvReview_'+element).append(reviewContent[element+'_author']);
					$('#bvReview_'+element).append(reviewContent[element+'_text'].substr(0,200));
					$('#bvReview_'+element).append(reviewContent[element+'_link']);
				}
			});
		});

		$.getJSON(bvhost+"data/batch.json?apiversion=5.4&passkey="+apikey+"&"+featuredReviewString+"&include=Products&callback=?", 
			{dataType: 'json'},
			function(json){
				if(typeof options.productId === 'array') { // handle array of products
					options.productId.forEach(function(element,index,array){
						if(typeof json.BatchedResults[element].Includes.Products === 'object') {
							reviewContent[element+'_author'] = "<div class='bvInlineReviewAuthor'><img class='bvInlineReviewAuthorAvatar' src='"+bvhost+"/static/"+displaycode+"/noAvatar.png'></img>"+json.BatchedResults[element].Results[0].UserNickname+"</div>";
							reviewContent[element+'_rating'] = "<img src='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[element].Results[0].Rating+"/"+json.BatchedResults[element].Results[0].RatingRange+"/rating.gif' class='bvInlineRatingImage'></img>";
							reviewContent[element+'_text'] = "<div class='bvInlineReviewText'>"+json.BatchedResults[element].Results[0].ReviewText+"</div>";
							reviewContent[element+'_link'] = "<a href='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[element].Results[0].ProductId+"/review/"+json.BatchedResults[element].Results[0].Id+"/redirect.htm' class='bvInlineReadMore'>Read More</a>";
							reviewContent[element+'_name'] = "<div class='bvInlineReviewProductName'>"+json.BatchedResults[element].Includes.Products[json.BatchedResults[element].Includes.ProductsOrder[0]].Name+"</div>";
							reviewContent[element+'_location'] = "<div class='bvInlineReviewProductLocation'>"+json.BatchedResults[element].Includes.Products[json.BatchedResults[element].Includes.ProductsOrder[0]].Attributes.LocationName.Values[0].Value+"</div>";
						}
					});
				}
				else { // handle single product
					if(typeof json.BatchedResults[options.productId].Includes.Products === 'object') {
						reviewContent[options.productId+'_author'] = "<div class='bvInlineReviewAuthor'><img class='bvInlineReviewAuthorAvatar' src='"+bvhost+"/static/"+displaycode+"/noAvatar.png'></img>"+json.BatchedResults[options.productId].Results[0].UserNickname+"</div>";
						reviewContent[options.productId+'_rating'] = "<img src='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[options.productId].Results[0].Rating+"/"+json.BatchedResults[options.productId].Results[0].RatingRange+"/rating.gif' class='bvInlineRatingImage'></img>";
						reviewContent[options.productId+'_text'] = "<div class='bvInlineReviewText'>"+json.BatchedResults[options.productId].Results[0].ReviewText+"</div>";
						reviewContent[options.productId+'_link'] = "<a href='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[options.productId].Results[0].ProductId+"/review/"+json.BatchedResults[options.productId].Results[0].Id+"/redirect.htm' class='bvInlineReadMore'>Read More</a>";
						reviewContent[options.productId+'_name'] = "<div class='bvInlineReviewProductName'>"+json.BatchedResults[options.productId].Includes.Products[json.BatchedResults[options.productId].Includes.ProductsOrder[0]].Name+"</div>";
						reviewContent[options.productId+'_location'] = "<div class='bvInlineReviewProductLocation'>"+json.BatchedResults[options.productId].Includes.Products[json.BatchedResults[options.productId].Includes.ProductsOrder[0]].Attributes.LocationName.Values[0].Value+"</div>";
					}
				}
				options.callback();
			}
		);
	}

})(jQuery);