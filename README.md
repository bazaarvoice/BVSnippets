BVSnippets
==========

Jquery plugin that injects BV snippets onto a page (i.e. a featured review, inline ratings, etc.)  Must have a valid API key provided to use this library.

Example Usage for Conversations 2013 Clients
============================================
The first part in this example, 'BVFeaturedReviewC13' can be any valid jquery selector.  The featuredReviews function takes two parameters: an API key and an arguments collection.  API keys are specific to staging or production, be sure to specify 'staging: true' in the arguments object if you are using a staging key.
```
$(".BVFeaturedReviewC13").featuredReviews('305i5xcijnuk5ykdjltwco1q8', { staging: true });
```

Example Usage For Lergacy PRR Clients
=====================================
If you are using Bazaarvoice's legacy PRR platform be sure to add your BV hostname and displaycode as arguments.
```
$(".BVFeaturedReview").featuredReviews('72n07szwiwjspk7x6idcry4ch', {
	sort: 'LastModificationTime:desc',
	filters: 'IsFeatured:true&Filter=Rating:lte:4',
	staging: true,
	limit: 3,
	legacy_hostname: 'http://reviews.myshco.com',
	legacy_displaycode: '9344-en_us'
});
```

DOM Syntax
===================
```
<div class="BVFeaturedReview" data-id="1000001"></div>
```

The class or ID is used as the selector, data-id equals the product ID as it appears in the externalId in the product feed.  This should have at least one featured review.

Optional Parameters
===================
<pre>sort - This may be any valid sort listed here: https://developer.bazaarvoice.com/docs/read/Home
filters - This may be any valid filter listed here: https://developer.bazaarvoice.com/docs/read/Home
staging - True indicates staging servers will be used, By default this is False and production servers are used.
limit - Defaults to 1, may be up to 100 per product.
legacy_hostname - This is used by legacy PRR/Conversations 1.0 and 2.0 clients.  Leave this blank if provisioned on Conversations 2013.
legacy_displaycode - This is used by legacy PRR/Conversations 1.0 and 2.0 clients.  Leave this blank if provisioned on Conversations 2013.
</pre>

Notes
=====
The sort and filters parameters accept multiple parameters stringed together.  If using more than one, be sure to prepend the second with either '$sort=' or '&filter=' or the query will fail.
