(function ($) {
  "use strict";


  $(window).on("load", function () {
    $("#infjew_preloader").delay(500).fadeOut(300);
    $("#infjew_preloader").delay(500).fadeOut(300);
  });


  if ($(".search-trigger").length) {
    $(".search-trigger").on("click", function () {
      $("body").addClass("search-active");
    });
    $(".close-search, .search-back-drop").on("click", function () {
      $("body").removeClass("search-active");
    });
  }



  $("[data-background").each(function () {
    $(this).css(
      "background-image",
      "url( " + $(this).attr("data-background") + "  )"
    );
  });















  $(".menu-trigger").on("click", function () {
    $(".extra-info,.offcanvas-overly").addClass("active");
    return false;
  });
  $(".menu-close,.offcanvas-overly").on("click", function () {
    $(".extra-info,.offcanvas-overly").removeClass("active");
  });


  $(".navbar-toggler").on("click", function () {
    $(this).toggleClass("active");
  });
  $(".navbar-nav li a").on("click", function () {
    $(".sub-nav-toggler").removeClass("active");
  });
  var subMenu = $(".navbar-nav .sub-menu");
  if (subMenu.length) {
    subMenu
      .parent("li")
      .children("a")
      .append(function () {
        return '<button class="sub-nav-toggler"> <i class="las la-angle-down"></i> </button>';
      });

    var subMenuToggler = $(".navbar-nav .sub-nav-toggler");

    subMenuToggler.on("click", function () {
      $(this).parent().parent().children(".sub-menu").slideToggle();
      return false;
    });
  }

















































  $(".testimonial-carousel").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: false,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    responsive: {
      575: {
        items: 1,
        nav: false,
        dots: false,
      },

      767: {
        items: 1,
        nav: false,
        dots: false,
      },

      990: {
        items: 2,
        loop: true,
      },
      1200: {
        items: 3,
        dots: true,
        loop: true,
      },
    },
  });


  $(".testimonial-carousel-2").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: true,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    navText: [
      "<i class='las la-arrow-left'></i>",
      "<i class='las la-arrow-right'></i>",
    ],
    responsive: {
      575: {
        items: 1,
        nav: false,
        dots: false,
      },

      767: {
        items: 1,
        nav: false,
        dots: false,
      },

      990: {
        items: 2,
        loop: true,
      },
      1200: {
        items: 2,
        dots: true,
        loop: true,
      },
    },
  });

  $(".client-carousel").owlCarousel({
    items: 1,
    dots: true,
    nav: false,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    responsive: {
      0: {
        items: 2,
        nav: false,
        dots: false,
      },

      530: {
        items: 3,
        nav: false,
        dots: false,
      },

      767: {
        items: 3,
        nav: false,
        dots: false,
      },

      930: {
        items: 4,
        loop: true,
      },

      1100: {
        items: 5,
        loop: true,
      },
      1200: {
        items: 5,
        dots: true,
        loop: true,
      },
    },
  });

  $(".feature-product-carousel").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: true,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    navText: [
      "<i class='las la-arrow-left'></i>",
      "<i class='las la-arrow-right'></i>",
    ],
    responsive: {
      0: {
        items: 1,
        nav: false,
        dots: false,
      },

      530: {
        items: 2,
        nav: false,
        dots: false,
      },

      767: {
        items: 2,
        nav: false,
        dots: false,
      },

      930: {
        items: 3,
        loop: true,
      },

      1100: {
        items: 3,
        loop: true,
      },
      1200: {
        items: 4,
        dots: true,
        loop: true,
      },
    },
  });

  $(".top-category-carousel").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: true,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    navText: [
      "<i class='las la-arrow-left'></i>",
      "<i class='las la-arrow-right'></i>",
    ],
    responsive: {
      0: {
        items: 1,
        nav: false,
        dots: false,
      },

      530: {
        items: 2,
        nav: false,
        dots: false,
      },

      767: {
        items: 2,
        nav: false,
        dots: false,
      },

      930: {
        items: 3,
        loop: true,
      },

      1200: {
        items: 3,
        dots: true,
        loop: true,
      },
    },
  });



  $(".product-wrap-slider").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: true,
    loop: true,
    autoplay: true,
    responsiveClass: true,
    navText: [
      "<i class='las la-arrow-left'></i>",
      "<i class='las la-arrow-right'></i>",
    ],
    responsive: {
      0: {
        items: 1,
        nav: false,
        dots: false,
      },

      530: {
        items: 2,
        nav: false,
        dots: false,
      },

      767: {
        items: 2,
        nav: false,
        dots: false,
      },

      930: {
        items: 3,
        loop: true,
      },

      1200: {
        items: 4,
        dots: true,
        loop: true,
      },
    },
  });


  $(".port-menu li").on("click", function () {
    var selector = $(this).attr("data-filter");

    $(".port-menu li").removeClass("active");

    $(this).addClass("active");

    $(".portfolio-list").isotope({
      filter: selector,
      percentPosition: true,
    });
  });


  $(".sticky-area").sticky({
    topSpacing: 0,
  });


  new WOW().init();



  new PureCounter();
  new PureCounter({
    filesizing: true,
    selector: ".filesizecount",
    pulse: 2,
  });


  $(".video-play-btn").magnificPopup({
    type: "iframe",
  });


  $(".testimonial-wrap").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: false,
    loop: true,
    autoplay: true,
    smartSpeed: 700,
    responsiveClass: true,
    responsive: {
      575: {
        items: 1,
        nav: false,
        dots: false,
      },

      767: {
        items: 1,
        nav: false,
      },

      990: {
        items: 1,
        loop: true,
      },
      1200: {
        items: 1,
        dots: true,
        loop: true,
      },
    },
  });


  $(".testimonial_carousel").owlCarousel({
    items: 1,
    margin: 30,
    dots: true,
    nav: false,
    loop: true,
    autoplay: true,
    smartSpeed: 700,
    responsiveClass: true,
    responsive: {
      575: {
        items: 1,
        nav: false,
        dots: false,
      },

      767: {
        items: 2,
        nav: false,
      },

      990: {
        items: 2,
        loop: true,
      },
      1200: {
        items: 3,
        dots: true,
        loop: true,
      },
    },
  });



  $(".testimonial-wrapper").owlCarousel({
    items: 1,
    dots: false,
    nav: true,
    loop: true,
    autoplay: false,
    autoplayTimeout: 5000,
    smartSpeed: 3000,
    slideSpeed: 300,
    margin: 30,
    navText: [
      "<i class='las la-arrow-left'></i>",
      "<i class='las la-arrow-right'></i>",
    ],
  });


  var QtyPlusMinus = $(".qty-plus-minus");
  QtyPlusMinus.prepend('<div class="dec gi-qtybtn">-</div>');
  QtyPlusMinus.append('<div class="inc gi-qtybtn">+</div>');

  $("body").on("click", ".gi-qtybtn", function () {
    var $qtybutton = $(this);
    var QtyoldValue = $qtybutton.parent().find("input").val();
    if ($qtybutton.text() === "+") {
      var QtynewVal = parseFloat(QtyoldValue) + 1;
    } else {
      if (QtyoldValue > 1) {
        var QtynewVal = parseFloat(QtyoldValue) - 1;
      } else {
        QtynewVal = 1;
      }
    }
    $qtybutton.parent().find("input").val(QtynewVal);
  });


  $(".zoom-image-hover").zoom();




  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 705) {
      $(".go-top").fadeIn(200);
    } else {
      $(".go-top").fadeOut(200);
    }
  });


  $(".go-top").on("click", function (event) {
    event.preventDefault();

    $("html, body").animate(
      {
        scrollTop: 0,
      },
      100
    );
  });


  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    var $action = $(this).prop("action");
    var $data = $(this).serialize();
    var $this = $(this);

    $this.prevAll(".alert").remove();

    $.post(
      $action,
      $data,
      function (data) {
        if (data.response == "error") {
          $this.before(
            '<div class="alert alert-danger">' + data.message + "</div>"
          );
        }

        if (data.response == "success") {
          $this.before(
            '<div class="alert alert-success">' + data.message + "</div>"
          );
          $this.find("input, textarea").val("");
        }
      },
      "json"
    );
  });


  $(".sub-menu ul li").on("click", function () {
    $(".sub-menu").removeAttribute("style");
    $(this).addClass("active");
  });

  $("a.nav-link").on("mouseover", function () {
    $("a.nav-link").removeClass("active");
    $(this).addClass("active");
  });

  $("ul.category-list-inner li").on("mouseover", function () {
    $("ul.category-list-inner li").removeClass("active");
    $(this).addClass("active");
  });

  $(".jump-to-new").on("click", function () {
    if (!$(this).hasClass("sold-out-active")) {
      window.open($(this).attr("data-jump"));
    }
  });

  $(".jump-to-recent").on("click", function () {
    window.location.href = $(this).attr("data-jump");
  });

  $("#contact-form-btn").on("click", function () {
    if (
      $("#contact-form-name").val() != "" &&
      $("#contact-form-email").val() != "" &&
      $("#contact-form-message").val() != ""
    ) {
      fetch("https:
        .then((response) => response.json())
        .then((data) => {
          let message = {
            name: $("#contact-form-name").val(),
            email: $("#contact-form-email").val(),
            message: $("#contact-form-message").val(),
            country: data.country_name,
            city: data.city,
            ip: data.ip,
          };
          console.log(message);
        })
        .catch((error) => {
          console.error("猫聨路氓聫聳 IP 氓陇卤猫麓楼", error);
        });
    }
  });
})(window.jQuery);
