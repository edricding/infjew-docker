
// Product Image Slider 
$('.product-image-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    prevArrow: '<i class="las la-angle-left left-arrow"></i>',
    nextArrow: '<i class="las la-angle-right right-arrow"></i>',
    responsive: [{
        breakpoint: 576,
        settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
        }
    }]
});
