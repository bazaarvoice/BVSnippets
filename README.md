BVSnippets
==========

Jquery plugin that injects BV snippets onto a page (i.e. a featured review, inline ratings, etc.)  Must have a valid API key provided to use this library.

Example Usage for Conversations 2013 Clients
============================================
The first part in this example, 'BVFeaturedReviewC13' can be any valid jquery selector.  The featuredReviews function takes two parameters: an API key and an arguments collection.  API keys are specific to staging or production, be sure to specify 'staging: true' in the arguments object if you are using a staging key.
```
$(".BVFeaturedReviewC13").featuredReviews('305i5xcijnuk5ykdjltwco1q8', { staging: true });
```

Example Usage For Legacy PRR Clients
=====================================
If you are using Bazaarvoice's legacy PRR platform be sure to add your BV hostname and displaycode as arguments.
```
$(".BVFeaturedReview").featuredReviews('72n07szwiwjspk7x6idcry4ch', {
	staging: true,
	legacy_hostname: 'http://reviews.myshco.com',
	legacy_displaycode: '9344-en_us'
});
```

Examples of Configuration Options
=====================================
```
$(".BVFeaturedReview").featuredReviews('305i5xcijnuk5ykdjltwco1q8', {
	sort: 'LastModificationTime:desc',
	filters: 'IsFeatured:true&Filter=Rating:lte:4',
	staging: false,
	limit: 100,
	apiversion: '5.4',
	legacy_hostname: false, //false indicates C13 client
	legacy_displaycode: false, //false indicates C13 client
	abbreviate_text: 200
});
```

DOM Syntax
===================
```
<div class="BVFeaturedReview" data-id="1000001"></div>
```

The class or ID is used as the selector, data-id equals the product ID as it appears in the externalId in the product feed.  This should have at least one featured review.
<b>IMPORTANT</b>
`data-id` is a required attribute.

Optional Parameters
===================
<pre>sort - This may be any valid sort listed here: https://developer.bazaarvoice.com/docs/read/Home
filters - This may be any valid filter listed here: https://developer.bazaarvoice.com/docs/read/Home
staging - True indicates staging servers will be used, By default this is False and production servers are used.
limit - Defaults to 1, may be up to 100 per product.
legacy_hostname - This is used by legacy PRR/Conversations 1.0 and 2.0 clients.  Leave this blank if provisioned on Conversations 2013.
legacy_displaycode - This is used by legacy PRR/Conversations 1.0 and 2.0 clients.  Leave this blank if provisioned on Conversations 2013.
abbreviate_text - Enables content abbreviation. If the main text is longer than this value (by character count) then the text will be truncated and appended with an ellipsis. Must be a numeric value.
</pre>

Notes
=====
The sort and filters parameters accept multiple parameters stringed together.  If using more than one, be sure to prepend the second with either `$sort=` or `&filter=` or the query will fail.

Styles
=====

This widget has a pre-built theme with basic styles. It also has four pre-built layouts.

The pre-built theme defines the styles of the text, stars, image, button, and heading. It also displays the widget in a vertical layout.
To use the pre-built theme with basic styles, simply add the class `BVFeaturedReviewContainer` to the div:
```
<div class="BVFeaturedReview" data-id="1000001"></div>
```

The other available layouts are the following:

1. Vertical Layout.
2. No Image Layout
3. Horizontal Layout, Image Left Aligned
4. Horizontal Layout, Image Right Aligned

To use one of the pre-built layouts add one of the following classes to the parent div containing the widget:


1. Vertical Layout. You only need the class `BVFeaturedReview`. You don't need additional classes for the vertical layout:
```
<div class="BVFeaturedReview" data-id="1000001"></div>
```

2. No Image Layout. Add the class `BVFRCNoImage` to the parent div:
```
<div class="clientRow BVFRCNoImage">
	<div class="BVFeaturedReviewContainer" data-id="1000001"></div>
</div>
```

3. Horizontal Layout, Image Left Aligned. Add the class `BVFRCHorizontalLeft` to the parent div:
```
<div class="clientRow BVFRCHorizontalLeft">
	<div class="BVFeaturedReviewContainer" data-id="1000001"></div>
</div>
```

4. Horizontal Layout, Image Right Aligned. Add the class `BVFRCHorizontalRight` to the parent div:
```
<div class="clientRow BVFRCHorizontalRight">
	<div class="BVFeaturedReviewContainer" data-id="1000001"></div>
</div>
```
