// ==UserScript==
// @name     Codidact Keyboard Script
// @version  1
// @grant    none
// @include  *.codidact.com/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js 
// ==/UserScript==

css_to_inject = '.__keyboard_help { padding: 1rem; font-family: monospace; white-space: pre-wrap; width: 350px; background-color: rgba(0,0,0,0.8); color: white; border-radius: 0.25rem; position: fixed; left: 1rem; bottom: 1rem; } .__keyboard_selected { outline: 1rem solid red; }';
css = document.createElement("style")
css.innerHTML = css_to_inject;
document.body.appendChild(css);

_CodidactKeyboard = {
  state: 'home',
  selectedItem: null,
  user_id: parseInt($('.header--item.is-complex.is-visible-on-mobile[href^="/users/"').attr('href').split("/").pop()),
  is_mod: !!$('.header--item[href="/mod/flags"]').length,
  categories: function() {
    category_elements = $("a.category-header--tab");
    return_obj = {};
    category_elements.each(function() {
      return_obj[this.innerText] = this.getAttribute('href');
    });
    return return_obj;
  },
  dialog: function(msg) {
    _CodidactKeyboard.dialogClose();
    d = document.createElement("div")
    d.classList.add("__keyboard_help");
    d.innerText = msg;
    document.body.appendChild(d);
  },
  dialogClose: function() {
    $(".__keyboard_help").remove();
    _CodidactKeyboard.state = 'home';
  },
  updateSelected: function() {
    $(".__keyboard_selected").removeClass('__keyboard_selected');
    if(_CodidactKeyboard.selectedItem) {
    	_CodidactKeyboard.selectedItem.classList.add('__keyboard_selected');
    	_CodidactKeyboard.selectedItem.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Use html, so that all prior attempts to access keyup event have priority
$("html").on("keyup", function(e) {
  if(e.target != document.body) return;
  if (e.key == "Escape") {
    _CodidactKeyboard.dialogClose();
  } else if(_CodidactKeyboard.state == 'home') {
    homeMenu(e);
	} else if(_CodidactKeyboard.state == 'goto') {
    gotoMenu(e);
	} else if(_CodidactKeyboard.state == 'goto/category') {
    categoryMenu(e);
	} else if(_CodidactKeyboard.state == 'tools') {
    toolsMenu(e);
	} else if(_CodidactKeyboard.state == 'tools/vote') {
    voteMenu(e);
	}
});

function homeMenu(e) {
  if(e.key == "?") {
    _CodidactKeyboard.dialog('Codidact Keyboard Shortcuts\n' + 
                             '===========================\n' + 
                             '?  Open this help\n' + 
                             'n  New post\n' +
                             '   (in current category)\n' + 
                             's  Search for something\n' + 
                             'g  Go to a page...\n\n' +
                             'a  Go to answer field\n\n' +
                             'Selection shortcuts:\n\n' + 
                             'j  Move one item down\n' + 
                             'k  Move one item up\n' + 
                             't  Use a tool (on selection)\n\n' + 
                             '(Selection shortcuts will select\n' + 
                             'first post, if none selected)'
                             
    );
  } else if(e.key == 'n') {
    new_post_link = $('a.category-header--nav-item.is-button').attr('href');
    if(new_post_link)
    	window.location.href = new_post_link;
  } else if(e.key == 'g') {
    _CodidactKeyboard.dialog('Go to ...\n' + 
                             '=========\n' + 
                             'm  Main page\n' + 
                             'u  User list\n' +
                             'h  Help\n' +
                             'p  Your profile page\n' + 
                             'c  Category ...' + 
  													 (_CodidactKeyboard.is_mod ? '\nf  Flags (mod only)' : '')                       
    );
    _CodidactKeyboard.state = 'goto';
  } else if(e.key == 'k') {
    if(_CodidactKeyboard.selectedItem == null) _CodidactKeyboard.selectedItem = $(".post:first-of-type")[0];
    else {
      _CodidactKeyboard.selectedItem = $(_CodidactKeyboard.selectedItem).nextAll('.post')[0] || _CodidactKeyboard.selectedItem;
    }
    _CodidactKeyboard.updateSelected();
  } else if(e.key == 'j') {
    if(_CodidactKeyboard.selectedItem == null) _CodidactKeyboard.selectedItem = $(".post:first-of-type")[0];
    else {
      _CodidactKeyboard.selectedItem = $(_CodidactKeyboard.selectedItem).prevAll('.post')[0] || _CodidactKeyboard.selectedItem;
    }
    _CodidactKeyboard.updateSelected();
  } else if(e.key == 't') {
    if(_CodidactKeyboard.selectedItem == null) _CodidactKeyboard.selectedItem = $(".post:first-of-type")[0];
    _CodidactKeyboard.updateSelected();
    
    _CodidactKeyboard.dialog('Use tool ...\n' + 
                             '============\n' + 
                             'f  Flag\n' + 
                             'e  Edit\n' +
                             'c  Comment\n' +
                             'l  Get permalink\n' + 
                             'h  View history\n' + 
                             'v  Vote ...'
    );
    _CodidactKeyboard.state = 'tools';
  } else if(e.key == 'a') {
    cl = $('#answer_body_markdown');
    cl[0].scrollIntoView({ behavior: "smooth" });
    cl.focus();
    _CodidactKeyboard.dialogClose();
  }
}

function gotoMenu(e) {
  if(e.key == 'm') {
    window.location.href = '/';
  } else if(e.key == 'u') {
    window.location.href = '/users';
  } else if(e.key == 'h') {
    window.location.href = '/help';
  } else if(e.key == 'p') {
    window.location.href = '/users/' + _CodidactKeyboard.user_id;
  } else if(e.key == 'f') {
    window.location.href = '/mod/flags';
  } else if(e.key == 'f') {
    window.location.href = '/mod/flags';
  } else if(e.key == 'c') {
    data = _CodidactKeyboard.categories();
    data = Object.entries(data);
    string_response = "";
    for(var i=0; i < data.length; i++) {
      entry = data[i];
      string_response += (i+1) + "  " + entry[0] + "\n"
    }
    _CodidactKeyboard.dialog('Go to category ...\n' + 
                             '==================\n' + 
                             string_response.trim()                     
    );
    _CodidactKeyboard.state = 'goto/category';
  }
  
}

function categoryMenu(e) {
  number = parseInt(e.key);
  if(number != NaN) {
    data = _CodidactKeyboard.categories();
    data = Object.entries(data);
    
    category = data[number - 1];
    window.location.href = category[1];    
  }
}

function toolsMenu(e) {
  if(e.key == 'e') {
    window.location.href = $(_CodidactKeyboard.selectedItem).find('.tools--item i.fa.fa-pencil-alt').parent().attr("href");
  } else if(e.key == 'h') {
    window.location.href = $(_CodidactKeyboard.selectedItem).find('.tools--item i.fa.fa-history').parent().attr("href");
  } else if(e.key == 'l') {
    window.location.href = $(_CodidactKeyboard.selectedItem).find('.tools--item i.fa.fa-link').parent().attr("href");
  } else if(e.key == 'c') {
    cl = $(_CodidactKeyboard.selectedItem).find('.js-add-comment');
    cl.nextAll("form").css("display", "block");
    cl.nextAll("form")[0].scrollIntoView({ behavior: "smooth" });
    cl.nextAll("form").find(".js-comment-content").focus();
    _CodidactKeyboard.dialogClose();
  } else if(e.key == 'f') {
    cl = $(_CodidactKeyboard.selectedItem).find('.post--action-dialog.js-flag-box');
    cl.addClass("is-active");
    cl[0].scrollIntoView({ behavior: "smooth" });
    cl.find(".js-flag-comment").focus();
    _CodidactKeyboard.dialogClose();
  } else if(e.key == 'v') {
    _CodidactKeyboard.dialog('Vote ...\n' + 
                             '========\n' + 
                             'u  Up\n' + 
                             'd  Down\n' +
                             'c  Close'
    );
    _CodidactKeyboard.state = 'tools/vote';
  }
  
}

function voteMenu(e) {
  if(e.key == 'u') {
    cl = $(_CodidactKeyboard.selectedItem).find('.vote-button[data-vote-type="1"]');
    cl.click();
    _CodidactKeyboard.dialogClose();
  } else if(e.key == 'd') {
    cl = $(_CodidactKeyboard.selectedItem).find('.vote-button[data-vote-type="-1"]');
    cl.click();
    _CodidactKeyboard.dialogClose();
  } else if(e.key == 'c') {
    cl = $(_CodidactKeyboard.selectedItem).find('.post--action-dialog.js-close-box');
    cl.addClass("is-active");
    cl[0].scrollIntoView({ behavior: "smooth" });
    cl.focus();
    _CodidactKeyboard.dialogClose();
  }
  
}
