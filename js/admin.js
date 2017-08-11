jQuery(document).ready(function() {
	jQuery( '#bulk-entry-toolbar-add-posts' ).click(function( eventobj ){
		var card_content = '';
		var type = jQuery( '#bulk-entry-add-post-type' ).val();
		var count = jQuery( '#bulk-entry-add-post-count' ).val();
		var status = jQuery( '#bulk-entry-add-post-status' ).val();
		var nonce = jQuery( '#bulk-entry-toolbar-nonce' ).val();


		var loading = jQuery('<div class="bulk-entry--loading bulk-entry-block"><div class="bulk-entry-block--left"><div class="bulk-entry-block--label">&nbsp;</div></div><div class="bulk-entry-block--right">loading...</div></div>');


		var loadingheight = loading.height();
		loadingheight = Math.max(loadingheight,30);
		loading.css('opacity','0');
		jQuery( '#bulk-entry-canvas' ).prepend( loading );
		loading.animate({
			opacity: 1
		}, 200, function() {
			//
		});

		jQuery.ajax({
			url: ajaxurl,
			type: "post",
			data: {
				action: 'bulk_entry_new_card',
				bulk_entry_posttype: type,
				bulk_entry_postcount: count,
				bulk_entry_poststatus: status,
				bulkentry_toolbar_nonce: nonce
			},
			success: function( data ){
				data = jQuery.parseJSON( data );
				var cards = jQuery( data.content );
				var height = cards.height();
				height = Math.max(height,30);
				cards.css('opacity','0').css('margin-top',"-"+height+"px");
				jQuery( '#bulk-entry-canvas' ).prepend( cards );
				tinyMCE_bulk_entry_init( data );
				cards.animate({
					opacity: 1,
					"margin-top":"0"
				}, 200, function() {
					//
				});
				loading.css( 'position', 'relative' ).animate({
					opacity: 0,
					height:0
				}, 200, function() {
					loading.remove();
				});
			},
			error: function(){
				var card = jQuery('<div class="bulk-entry-message bulk-entry-block"><form method="post" action=""><div class="bulk-entry-block--left"><div class="bulk-entry-block--label">&nbsp;</div></div><div class="bulk-entry-block--right"><div class="bulk-entry-block--content bulk-entry-card--content"><p><a href="#" class="bulk-entry-card-delete">x</a> Server returned an error, try again shortly</p></div></div></form></div>');
				card.css( 'opacity', '0' ).css( 'margin-top', "-" + height + "px" );
				jQuery( '#bulk-entry-canvas' ).prepend( card );
				card.animate({
					opacity: 1,
					"margin-top": "0"
				}, 200, function() {
					//
				});
				loading.css( 'position', 'relative' ).animate({
					opacity: 0,
					height: 0
				}, 200, function() {
					loading.remove();
				});
			}
		});
	});

	jQuery( document).on( 'click', '.bulk-entry-card-delete', function ( e ) {
		var formobj = jQuery( this ).closest( '.bulk-entry-block' );
		var height = formobj.height();
		height = Math.max(height,30);
		formobj.css( 'position', 'relative' ).animate({
			opacity: 0,
			left: '+500px',
			"margin-bottom":"-"+height+"px"
		}, 200, function() {
			formobj.remove();
		});
		return false;
	});

	jQuery( document ).on( 'submit' , '.bulk-entry-canvas form', function ( e ) {
		// submit AJAX request for stuff
		var formobj = jQuery(this);
		var type = formobj.find( 'input[name="bulk_entry_posttype"]').val();
		var editor_id = formobj.find( 'input[name="bulk_entry_editor_id"]').val();
		var status = formobj.find( 'input[name="bulk_entry_poststatus"]').val();
		var nonce = formobj.find( 'input[name="bulk_entry_editor_nonce"]').val();
		var content = formobj.find( '.wp-editor-area:first-child').val();
		var title = formobj.find(".bulk-entry-card--title:first-child").val();

		jQuery.ajax({
			url: ajaxurl,
			type: "post",
			data: {
				action: 'bulk_entry_submit_post',
				bulk_entry_posttype: type,
				bulk_entry_poststatus: status,
				bulk_entry_postcontent: content,
				bulk_entry_posttitle: title,
				bulk_entry_post_nonce: nonce,
				bulk_entry_editor_id: editor_id
			},
			success: function( data ){
				data = jQuery.parseJSON( data );
				var cards = jQuery( data.content );
				var height = cards.height();
				height = Math.max( height, 30 );
				cards.css( 'opacity', '0' ).css( 'margin-top', "-" + height + "px" );
				jQuery( '#bulk-entry-canvas' ).prepend( cards );
				cards.animate({
					opacity: 1,
					"margin-top": "0"
				}, 200, function() {
					//
				});
				formobj.css( 'position', 'relative' ).css('margin-top',height+'px').animate({
					opacity: 0,
					left: '+500px',
					"margin-top": 0,
					"margin-bottom":"-"+formobj.height()+"px"
				}, 200, function() {
					formobj.remove();
				});
				//tinyMCE_bulk_entry_init( data );
			},
			error: function(){
				var card = jQuery('<div class="bulk-entry-message bulk-entry-block"><form method="post" action=""><div class="bulk-entry-block--left"><div class="bulk-entry-block--label">&nbsp;</div></div><div class="bulk-entry-block--right"><div class="bulk-entry-block--content bulk-entry-card--content"><p><a href="#" class="bulk-entry-card-delete">x</a> Server returned an error, try again shortly</p></div></div></form></div>');
				card.css( 'opacity', '0' ).css( 'margin-top', "-" + height + "px" );
				jQuery( '#bulk-entry-canvas' ).prepend( card );
				card.animate({
					opacity: 1,
					"margin-top": "0"
				}, 200, function() {
					//
				});
			}
		});
		return false;
	})
});


function tinyMCE_bulk_entry_init( response ) {
	var i;

	if ( typeof(tinymce) == 'object' ) {
		var init = tinyMCEPreInit.mceInit[Object.keys(tinyMCEPreInit.mceInit)[0]];
		for ( i in response.editor_ids ) {
			var ed_id = response.editor_ids[i];
			var mcinit = init;
			mcinit['elements'] = ed_id;
			mcinit['body_class'] = ed_id;
			mcinit['succesful'] =  false;
			try {
				tinymce.init(mcinit);
				tinymce.execCommand( 'mceAddEditor', true, ed_id );
			} catch ( e ) {
				console.log('failed to initialise TinyMCE instance');
				console.log( e );
			}
		}

	} else {
		console.log('failed to initialise TinyMCE instance, tinymce is not of type "object"');
	}
}




