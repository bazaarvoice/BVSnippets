BVSnippets
==========

Jquery plugin that injects BV snippets onto a page (i.e. a featured review, inline ratings, etc.)


Example Usage
=============
  	$(".BVFeaturedReview").featuredReviews('72n07szwiwjspk7x6idcry4ch', {
			sort: 'LastModificationTime:desc',
			filters: 'IsFeatured:true&Filter=Rating:lte:4',
			staging: true,
			limit: 3,
			legacy_hostname: 'http://reviews.myshco.com',
			legacy_displaycode: '9344-en_us'
		});
