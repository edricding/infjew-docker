window.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  GetBanner();
  GetCountingDown();
  GetPreciousList();

  document.body.addEventListener("click", function (event) {

    if (event.target.closest(".jump-to-new")) {
      const clickedElement = event.target.closest(".jump-to-new");


      if (!clickedElement.classList.contains("sold-out-active")) {

        const jumpUrl = clickedElement.dataset.jump;


        if (jumpUrl) {
          window.open(jumpUrl, "_blank");
        }
      }
    }
  });
});

function GetBanner() {
  fetch("/api/public/banners")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !Array.isArray(data.data)) {
        console.error("猫聨路氓聫聳 banner 氓陇卤猫麓楼:", data.message);
        return;
      }
      console.log("data", data);
      const carousel = $(".hero-area-slider");
      console.log("$carousel", carousel);


      if (carousel.hasClass("owl-loaded")) {
        carousel.trigger("destroy.owl.carousel");
        carousel.html("");
        carousel.removeClass("owl-loaded owl-hidden");
      }


      data.data.forEach((banner) => {
        const slideHtml = `
        <div class="single-slide-item">
          <div class="row d-flex align-items-center">
            <div class="col-xl-5 col-lg-5 col-md-6 col-12">
              <div class="hero-area-inner">
                <div class="section-title">
                  <p class="mb-20">${banner.subtitle}</p>
                  <h1>${banner.title1}</h1>
                  <h1>${banner.title2}</h1>
                </div>
                <a href="${banner.url}" class="main-btn mt-40" target="_blank">Shop Now</a>
              </div>
            </div>
            <div class="col-xl-7 col-lg-7 col-md-6 col-12">
              <div class="hero-area-right">
                <div class="hero-area-img">
                  <img src="${banner.picurl}" alt="Banner Image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        carousel.append(slideHtml);
      });


      carousel.owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayTimeout: 5000,
        nav: false,
        dots: false,
        responsiveClass: true,
      });
    })
    .catch((err) => {
      console.error("猫炉路忙卤聜 banner 氓聡潞茅聰聶:", err);
    });
}

function GetCountingDown() {
  fetch("/api/public/countingdown")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success || !data.data || data.data.length === 0) {
        console.error("忙聴聽氓聙聮猫庐隆忙聴露忙聲掳忙聧庐氓聫炉氓卤聲莽陇潞");
        return;
      }

      const item = data.data[0];

      const container = document.getElementById("countingdownContainer");
      if (!container) return;


      container.querySelector(
        "h4"
      ).innerHTML = `Precious Sale <span>${item.percentage} Off</span>`;
      container.querySelector("h2").textContent = item.title;


      const ratingEl = container.querySelector(".item-rating");
      ratingEl.innerHTML = "";
      for (let i = 0; i < 5; i++) {
        const star = document.createElement("i");
        star.className = "las la-star" + (i < item.rating ? "" : " inactive");
        ratingEl.appendChild(star);
      }


      const priceEl = container.querySelector(".item-price p");
      priceEl.innerHTML = `$${item.discount} <span>$${item.price}</span>`;


      const goBtn = document.getElementById("go-for-it-btn");
      if (goBtn) {
        goBtn.href = item.url;
      }


      const imgEl = document.querySelector(".countdown-img img");
      if (imgEl) {
        imgEl.src = item.picurl;
      }


      const ddl = new Date(item.ddl);










      simplyCountdown(".simply-countdown-one", {
        year: ddl.getFullYear(),
        month: ddl.getMonth() + 1,
        day: ddl.getDate(),
      });
    })
    .catch((err) => {
      console.error("猫聨路氓聫聳氓聙聮猫庐隆忙聴露忙聲掳忙聧庐氓陇卤猫麓?", err);
    });
}

function GetPreciousList() {
  fetch("/api/public/preciouslist")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        renderProducts(data.data);
      } else {
        console.error("忙聲掳忙聧庐猫聨路氓聫聳氓陇卤猫麓楼");
      }
    })
    .catch((error) => {
      console.error("猫炉路忙卤聜氓陇卤猫麓楼:", error);
    });
}

function renderProducts(products) {
  const allProductsContainer = document.querySelector("#all-products .row");
  const tabContainer = document.querySelector("#newArrivalTabContainer");
  const tabContent = document.querySelector("#nav-tabContent");


  allProductsContainer.innerHTML = "";
  tabContainer.innerHTML = "";
  tabContent.innerHTML = "";


  const categorizedProducts = categorizeProductsByTag(products);


  const allTabButton = document.createElement("button");
  allTabButton.classList.add("nav-link", "active");
  allTabButton.id = "all-products-tab";
  allTabButton.setAttribute("data-bs-toggle", "tab");
  allTabButton.setAttribute("data-bs-target", "#all-products");
  allTabButton.setAttribute("type", "button");
  allTabButton.setAttribute("role", "tab");
  allTabButton.setAttribute("aria-controls", "all-products");
  allTabButton.setAttribute("aria-selected", "true");
  allTabButton.innerText = "All";
  tabContainer.appendChild(allTabButton);

  const allTabPane = document.createElement("div");
  allTabPane.classList.add("tab-pane", "fade", "show", "active");
  allTabPane.id = "all-products";
  allTabPane.setAttribute("role", "tabpanel");
  allTabPane.setAttribute("aria-labelledby", "all-products-tab");
  const allRow = document.createElement("div");
  allRow.classList.add("row");
  products.forEach((product) => {
    const productCard = createProductCard(product);
    allRow.appendChild(productCard);
  });
  allTabPane.appendChild(allRow);
  tabContent.appendChild(allTabPane);


  for (const [tag, productsInCategory] of Object.entries(categorizedProducts)) {
    const tabButton = document.createElement("button");
    tabButton.classList.add("nav-link");
    tabButton.id = `${tag}-tab`;
    tabButton.setAttribute("data-bs-toggle", "tab");
    tabButton.setAttribute("data-bs-target", `#${tag}`);
    tabButton.setAttribute("type", "button");
    tabButton.setAttribute("role", "tab");
    tabButton.setAttribute("aria-controls", tag);
    tabButton.setAttribute("aria-selected", "false");
    tabButton.innerText = tag.charAt(0).toUpperCase() + tag.slice(1);
    tabContainer.appendChild(tabButton);

    const tabPane = document.createElement("div");
    tabPane.classList.add("tab-pane", "fade");
    tabPane.id = tag;
    tabPane.setAttribute("role", "tabpanel");
    tabPane.setAttribute("aria-labelledby", `${tag}-tab`);
    const row = document.createElement("div");
    row.classList.add("row");
    productsInCategory.forEach((product) => {
      const productCard = createProductCard(product);
      row.appendChild(productCard);
    });
    tabPane.appendChild(row);
    tabContent.appendChild(tabPane);
  }
}


function categorizeProductsByTag(products) {
  const categorized = {};

  products.forEach((product) => {
    if (!categorized[product.tag]) {
      categorized[product.tag] = [];
    }
    categorized[product.tag].push(product);
  });

  return categorized;
}

function createProductCard(product) {
  const col = document.createElement("div");
  col.classList.add("col-xl-3", "col-lg-4", "col-md-6", "col-12");

  const card = document.createElement("div");
  card.classList.add("top-product-wrapper", "jump-to-new");
  card.dataset.jump = product.url;


  const isSoldOut = product.status === 0;
  if (isSoldOut) {
    card.classList.add("sold-out-active");
  }

  const inner = document.createElement("div");
  inner.classList.add(
    "top-product-inner",
    "d-flex",
    "justify-content-center",
    "align-items-center"
  );


  if (isSoldOut) {
    const soldOut = document.createElement("div");
    soldOut.classList.add("sold-out-inner");
    soldOut.innerHTML = "<span>Sold out</span>";
    inner.appendChild(soldOut);
  }

  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("top-prod-thumb");
  const image = document.createElement("img");
  image.src = product.picurl;
  image.alt = product.title;
  imageWrapper.appendChild(image);


  if (product.status === 2 && product.discount < product.price) {
    const discountPercentage = Math.floor(
      ((product.price - product.discount) / product.price) * 100
    );
    const discountTag = document.createElement("span");
    discountTag.classList.add("new");
    discountTag.innerHTML = `-${discountPercentage}%`;
    const flags = document.createElement("span");
    flags.classList.add("flags");
    flags.appendChild(discountTag);
    imageWrapper.appendChild(flags);
  }

  inner.appendChild(imageWrapper);
  card.appendChild(inner);

  const content = document.createElement("div");
  content.classList.add("top-prod-content");

  const title = document.createElement("h5");
  title.classList.add("top-product-title");
  title.innerHTML = product.title;
  content.appendChild(title);

  const rating = document.createElement("div");
  rating.classList.add("product-rating");
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.classList.add("las", "la-star");
    if (i >= product.rating) {
      star.classList.add("inactive");
    }
    rating.appendChild(star);
  }
  content.appendChild(rating);

  const price = document.createElement("div");
  price.classList.add("product-price");
  const priceText = document.createElement("p");
  if (product.discount < product.price) {
    const originalPrice = document.createElement("span");
    originalPrice.innerHTML = `$${product.price.toFixed(2)}`;
    originalPrice.classList.add("original-price");
    priceText.innerHTML = `$${product.discount.toFixed(2)} `;
    priceText.appendChild(originalPrice);
  } else {
    priceText.innerHTML = `$${product.discount.toFixed(2)}`;
  }
  price.appendChild(priceText);
  content.appendChild(price);

  card.appendChild(content);
  col.appendChild(card);

  return col;
}
