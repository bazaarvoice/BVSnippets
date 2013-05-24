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


	$.fn.featuredReviews = function(bvhost, displaycode, apikey, options){

		var myThis = this;
		
		bvhost = (bvhost.substr(-1) == '/' ? bvhost=bvhost.substr(0, bvhost.length - 1) : bvhost); //removes trailing slash if present

		var productId = [];
		var reviewContent = {}; //used to capture inline rating object callback
		var featuredReviewString = ''; //used to concatenate products for batch query
		var featuredReviewList = {}; //list of products to query

		this.each(function(element, index, array){
			var currentProduct = $(this).attr("data-id");
			productId.push(currentProduct);
			console.log(currentProduct);
			featuredReviewString+='&resource.'+currentProduct+'=reviews&filter.'+currentProduct+'=IsFeatured:true&Limit.'+currentProduct+'=1&Filter.'+currentProduct+'=productId:'+currentProduct+'&Sort.'+currentProduct+'=SubmissionTime:desc';
			featuredReviewList[currentProduct] = this;
		});

		$.getJSON(bvhost+"/data/batch.json?apiversion=5.4&passkey="+apikey+"&"+featuredReviewString+"&include=Products&callback=?", 
			{dataType: 'json'},
			function(json){
				productId.forEach(function(element,index,array){
					if(typeof json.BatchedResults[element].Includes.Products === 'object') {
						reviewContent[element+'_author'] = "<div class='bvInlineReviewAuthor'><img class='bvInlineReviewAuthorAvatar' src='"+bvhost+"/static/"+displaycode+"/noAvatar.gif'></img>"+json.BatchedResults[element].Results[0].UserNickname+"</div>";
						reviewContent[element+'_rating'] = "<img src='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[element].Results[0].Rating+"/"+json.BatchedResults[element].Results[0].RatingRange+"/rating.gif' class='bvInlineRatingImage'></img>";
						reviewContent[element+'_text'] = "<div class='bvInlineReviewText'>"+json.BatchedResults[element].Results[0].ReviewText+"</div>";
						reviewContent[element+'_link'] = "<a href='"+bvhost+"/"+displaycode+"/"+json.BatchedResults[element].Results[0].ProductId+"/review/"+json.BatchedResults[element].Results[0].Id+"/redirect.htm' class='bvInlineReadMore'>Read More</a>";
						reviewContent[element+'_name'] = "<div class='bvInlineReviewProductName'>"+json.BatchedResults[element].Includes.Products[json.BatchedResults[element].Includes.ProductsOrder[0]].Name+"</div>";
					}
				});
				$.each(featuredReviewList, function(index, value){
					if(typeof reviewContent[index+'_name'] === 'string') {
						$(value).html(reviewContent[index+'_name']);
						$(value).append(reviewContent[index+'_rating']);
						$(value).append(reviewContent[index+'_author']);
						$(value).append(reviewContent[index+'_text'].substr(0,200));
						$(value).append(reviewContent[index+'_link']);
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