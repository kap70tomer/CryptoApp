// (function(){ 
// @@ Var 'banners'<Array> - Model for the memoriezed banners to easly set to local storage.
const banners = [];

//@@ func - Handle Submit btn clicked event,Getter for form values, Prevent Deafult refresh behavior.
const onSubmitClicked = (event) => {
    event.preventDefault();
    // Set banner-list as element for insert children "target".
    const element_id = "banners-list";
    // Get form values 
    let redirect_link = document.getElementById('banner-redirectLink').value;
    let banner_img = document.getElementById('banner-imgUrl').value;
    //Call create, Provide functions deps with ui data.
    createNewBanner(element_id, redirect_link, banner_img);
};

// @@ func - createNewBanner, takes in 3 paramethers to create a new 'Banner' element.
const createNewBanner = (element_id, redirect_link, banner_img) => {
    //Banners Factory function returns new Banner HTML Element.
    let be = bannersElementFactory(redirect_link, banner_img);
    //Insert a banner element to DOM with given id.
    insertBannerByElementId(element_id, be);
    //Clean up func for form fields.
    initializeForm();
    // Push the new banner to the banners array, as Model.
    banners.push({ redirect_link, banner_img });
};

// @@ func - Create a banner DOM element and set 'Click' event listener,
// return - new banner Element.
const bannersElementFactory = (redirect_link, banner_img) => {
    //Create new image DOM element. 
    const bannerElement = document.createElement('img');
    //Set source attribute of the crated banner element as given banner_img. 
    bannerElement.src = banner_img;
    //Banner's Styles using js.
    bannerElement.style.height = '320px';
    bannerElement.style.width = '320px';
    //Set redirect link to show as tooltip.
    bannerElement.title = "Click me to move here: "+ redirect_link;
    //Add Event listener to invoke redirection by Click on UI.
    bannerElement.addEventListener('click', () => window.open(redirect_link, '_blank'));
    //return the new html Element.
    return bannerElement;
};

// @@ func - Takes in banner element to insert as child of given DOM element by its id.
const insertBannerByElementId = (element_id, bannerElement) => {
    //Append created banner to the requested element by element's id.
    document.getElementById(element_id).appendChild(bannerElement);
};
// @@ func - Clear the banner-form fields.
const initializeForm = () => {
    document.forms['banner-form'].reset();
};
// @@ func - Stores the banners array model, Under 'banners-data' Key cach local storage.
const saveBannersOnLocalStorage = () => {
    localStorage.setItem('banners-data', JSON.stringify(banners));
    console.log("saved!", JSON.stringify(banners));
    alert('Your Progress Has been Saved for the next Session!');
}
// @@ func - Clear cached banners data from localStorage, Under 'banners-data' Key.
const clearBannersOnLocalStorage = () => {
    localStorage.removeItem('banners-data');
    console.log("Cleared local storage!", JSON.stringify(localStorage));
    alert('Data Cleared!');
}

// @@ func - 'loadCachedBanners' - Load saved bannners from local storage on page load.    
const loadCachedBanners = () => {
    // Get saved banners from local storage and parse them into an array.
    const cachedBanners = JSON.parse(localStorage.getItem('banners-data')) || [];
    //Check if any Saved loaded before populating.
    if(cachedBanners.length > 0){
        // Iterate saved banners array.
        cachedBanners.forEach((banner) => {
            // Populating banners array to be updated with cached banners.
            banners.push(banner);
            // Creates a banner element each.
            let be = bannersElementFactory(banner.redirect_link, banner.banner_img);
            // Insert each banner To View.
            insertBannerByElementId('banners-list', be);
        });
    }
};

//Get the button
let topbutton = document.getElementById("topBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    topbutton.style.display = "block";
  } else {
    topbutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// }) - " ### TODO - tryed to prevent using Global vars, Costs me subbmiting from form behavior refresh".