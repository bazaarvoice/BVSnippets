BVSnippets
==========

Jquery plugin that injects BV snippets onto a page (i.e. a featured review, inline ratings, etc.)

Example Usage for Conversations 2013 Clients
============================================
$(".BVFeaturedReviewC13").featuredReviews('305i5xcijnuk5ykdjltwco1q8', { staging: true });

Example Usage For Lergacy PRR Clients
=====================================
$(".BVFeaturedReview").featuredReviews('72n07szwiwjspk7x6idcry4ch', {
	sort: 'LastModificationTime:desc',
	filters: 'IsFeatured:true&Filter=Rating:lte:4',
	staging: true,
	limit: 3,
	legacy_hostname: 'http://reviews.myshco.com',
	legacy_displaycode: '9344-en_us'
});

DOM Syntax
===================
<div class="BVFeaturedReview" data-id="1000001"></div>

The class or ID is used as the selector, data-id equals the product ID as it appears in the externalId in the product feed.  This should have at least one featured review.

Optional Parameters
===================
sort
filters
staging
limit
legacy_hostname
legacy_displaycode
