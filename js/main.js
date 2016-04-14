$(document).ready(function () {
	var menuIcons = ["content/icons/hat.png", "content/icons/direction.png", "content/icons/calendar.png", "content/icons/screwdriver1.png"];
	var menuIconsChosen = ["content/icons/hatDark.png", "content/icons/directionDark.png", "content/icons/calendarDark.png", "content/icons/screwdriver1Dark.png"];

	var pageID = "#allCourses";
	$(pageID).attr("style","width:100%;display:block");
	var isAuthorised = true;
	if (document.cookie != "")
		isAuthorised = true;

	
	$('.item').click(function(event) {
		resetMenuIcons()
		$('.item').removeClass("chosen");
		$(this).addClass("chosen");
		var elem = this.id;	

		switch (elem) {
			case 'one': {
				//color = "#39b5c9";
				if (isAuthorised) {
					animatePageChange("#userInfo", this, 0);
				} else {
					//$('.item').addClass("chosen");
					//$(this).removeClass("chosen");
					login_selected();
				}
			}break;
			case 'two': {
				//color = "#3997c9";
				animatePageChange("#allCourses", this, 1);
			}break;
			case 'three': {
				//color = "#3979c9";
				animatePageChange("#calendar", this, 2);
			}break;
			case 'four': {
				//color = "#3965c9";
				animatePageChange("#settings", this, 3);
			}
		}
		
		
	});

	function animatePageChange(newPageID, elem, iconIndex){
		$(pageID).animate({ width:"0" },400, function() {
			$(pageID).attr("style","display:none");
			pageID = newPageID;
			$(pageID).attr("style","display:block");
			$(pageID).animate({ width:"100%" },400);
		});
		var img = elem.firstChild.nextSibling;
		console.log(img);
		img.src = menuIconsChosen[iconIndex];
	}

	function resetMenuIcons() {
		var items = document.getElementsByClassName("item");
		for (var i = 0; i < items.length; i++) {
			var item = items[i].firstChild.nextSibling;
			item.src = menuIcons[i];
		}
	}

 $(function() {

  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 400);
        return false;
      }
    }
  });
});

	$('#user').click(function(event) { 
		login_selected();
	});





//pop-up for sign-in/sign-up

var formModal = $('.cd-user-modal'),
		formLogin = formModal.find('#cd-login'),
		formSignup = formModal.find('#cd-signup'),
		formForgotPassword = formModal.find('#cd-reset-password'),
		formModalTab = $('.cd-switcher'),
		tabLogin = formModalTab.children('li').eq(0).children('a'),
		tabSignup = formModalTab.children('li').eq(1).children('a'),
		forgotPasswordLink = formLogin.find('.cd-form-bottom-message a'),
		backToLoginLink = formForgotPassword.find('.cd-form-bottom-message a')

	//close modal
	formModal.on('click', function(event){
		if( $(event.target).is(formModal) || $(event.target).is('.cd-close-form') ) {
			formModal.removeClass('is-visible');
		}	
	});
	//close modal when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		formModal.removeClass('is-visible');
	    }
    });

	//switch from a tab to another
	formModalTab.on('click', function(event) {
		event.preventDefault();
		( $(event.target).is( tabLogin ) ) ? login_selected() : signup_selected();
	});

	//hide or show password
	$('.hide-password').on('click', function(){
		var togglePass= $(this),
			passwordField = togglePass.prev('input');
		
		( 'password' == passwordField.attr('type') ) ? passwordField.attr('type', 'text') : passwordField.attr('type', 'password');
		( 'Hide' == togglePass.text() ) ? togglePass.text('Show') : togglePass.text('Hide');
		//focus and move cursor to the end of input field
		passwordField.putCursorAtEnd();
	});

	//show forgot-password form 
	forgotPasswordLink.on('click', function(event){
		event.preventDefault();
		forgot_password_selected();
	});

	//back to login from the forgot-password form
	backToLoginLink.on('click', function(event){
		event.preventDefault();
		login_selected();
	});

	function login_selected(){
		//mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.addClass('is-selected');
		formSignup.removeClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.addClass('selected');
		tabSignup.removeClass('selected');
	}

	function signup_selected(){
		//mainNav.children('ul').removeClass('is-visible');
		formModal.addClass('is-visible');
		formLogin.removeClass('is-selected');
		formSignup.addClass('is-selected');
		formForgotPassword.removeClass('is-selected');
		tabLogin.removeClass('selected');
		tabSignup.addClass('selected');
	}

	function forgot_password_selected(){
		formLogin.removeClass('is-selected');
		formSignup.removeClass('is-selected');
		formForgotPassword.addClass('is-selected');
	}

	//REMOVE THIS - it's just to show error messages 
/*	formLogin.find('input[type="submit"]').on('click', function(event){
		event.preventDefault();
		formLogin.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
	});
	formSignup.find('input[type="submit"]').on('click', function(event){
		event.preventDefault();
		formSignup.find('input[type="email"]').toggleClass('has-error').next('span').toggleClass('is-visible');
	});
*/

	//IE9 placeholder fallback
	//credits http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
	if(!Modernizr.input.placeholder){
		$('[placeholder]').focus(function() {
			var input = $(this);
			if (input.val() == input.attr('placeholder')) {
				input.val('');
		  	}
		}).blur(function() {
		 	var input = $(this);
		  	if (input.val() == '' || input.val() == input.attr('placeholder')) {
				input.val(input.attr('placeholder'));
		  	}
		}).blur();
		$('[placeholder]').parents('form').submit(function() {
		  	$(this).find('[placeholder]').each(function() {
				var input = $(this);
				if (input.val() == input.attr('placeholder')) {
			 		input.val('');
				}
		  	})
		});
	}
});

//credits http://css-tricks.com/snippets/jquery/move-cursor-to-end-of-textarea-or-input/
jQuery.fn.putCursorAtEnd = function() {
	return this.each(function() {
    	// If this function exists...
    	if (this.setSelectionRange) {
      		// ... then use it (Doesn't work in IE)
      		// Double the length because Opera is inconsistent about whether a carriage return is one character or two. Sigh.
      		var len = $(this).val().length * 2;
      		this.focus();
      		this.setSelectionRange(len, len);
    	} else {
    		// ... otherwise replace the contents with itself
    		// (Doesn't work in Google Chrome)
      		$(this).val($(this).val());
    	}
	});
};

function show_subcategories(elem) {
	var subcourses = elem.firstChild.nextSibling.nextSibling.nextSibling;
	subcourses.style.display = "block";
}

function hide_subcategories(elem) {
	var subcourses = elem.firstChild.nextSibling.nextSibling.nextSibling;
	subcourses.style.display = "none";
}