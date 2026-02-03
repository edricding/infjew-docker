window.bannerList = [];
window.countingDown = [];

// ç»å½ç¶ææ£æ¥æ¨¡å?
window.addEventListener("DOMContentLoaded", function () {
  fetch("/api/banners", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // å¦æéè¦æºå¸?Cookie
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Banner æ°æ®ï¼?, data.data);
        bannerList = data.data; // åè®¾è¿åçæ°æ®æ ¼å¼æ¯ { success: true, data: [...] }
        renderBannerTable(bannerList);
        toggleAddBannerButton(bannerList);
      } else {
        console.log("è·å Banner å¤±è´¥:", data.message);
      }
    })
    .catch((error) => {
      console.error("è¯·æ±å¤±è´¥:", error);
    });

  fetch("/api/countingdown", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // å¦æéè¦æºå¸?Cookie
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("CountingDown æ°æ®ï¼?, data.data);
        countingDown = data.data[0]; // åè®¾è¿åçæ°æ®æ ¼å¼æ¯ { success: true, data: {...} }
        renderCountingDownTable(countingDown);
      } else {
        console.log("è·å CountingDown å¤±è´¥:", data.message);
      }
    })
    .catch((error) => {
      console.error("è¯·æ±å¤±è´¥:", error);
    });

  // ä½¿ç¨äºä»¶å§æçå¬ .banner-delete-trash çç¹å»äºä»?
  document.addEventListener("click", function (e) {
    // å¤æ­æ¯å¦ç¹å»çæ¯ .banner-delete-trash åç´ 
    if (e.target.closest(".banner-delete-trash")) {
      const target = e.target.closest(".banner-delete-trash");
      const bannerId = target.getAttribute("data-banner-id"); // è·å data-banner-id çå?

      // è®¾ç½® #delete-banner-id åç´ çåå®¹ä¸º bannerId
      const idContainer = document.getElementById("delete-banner-id");
      if (idContainer) {
        idContainer.innerHTML = bannerId;
      }
    }
  });

  document
    .getElementById("confirm-delete-banner-btn")
    .addEventListener("click", function () {
      const id = parseInt(
        document.getElementById("delete-banner-id").innerHTML.trim()
      );
      // ç®æ  URLï¼æ ¹æ®ä½ çåç«¯æ¥å£æ¹æçå®å°å
      deleteBanner(id);
    });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target && target.id === "add-banner-btn") {
      fetch("/api/banner/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getAddBannerForm()),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("â?Banner æ°å¢æå");
            renderBannerTable(data.data); // éæ°æ¸²æ banner è¡¨æ ¼
            toggleAddBannerButton(data.data); // æ´æ°æ·»å æé®ç¶æ?

            // æååå¯èªå¨å³é­ Modal
            const modal = bootstrap.Modal.getInstance(
              document.getElementById("AddBannerModal")
            );
            if (modal) modal.hide();
          } else {
            console.error("â?æ°å¢å¤±è´¥: ", data.message);
          }
        })
        .catch((err) => {
          console.error("â?è¯·æ±éè¯¯: ", err);
        });
    }
  });
});

function getAddBannerForm() {
  const newBanner = {
    title1: document.getElementById("add-banner-title-1").value.trim(),
    title2: document.getElementById("add-banner-title-2").value.trim(),
    subtitle: document.getElementById("add-banner-subtitle").value.trim(),
    url: document.getElementById("add-banner-url").value.trim(),
    picurl: document.getElementById("add-banner-picture-url").value.trim(),
  };
  return newBanner;
}

function getCountingDownPreciousForm() {
  const priceValue = parseFloat(
    document.getElementById("edit-countingdown-price").value.trim()
  );
  const discountValue = parseFloat(
    document.getElementById("edit-countingdown-discount").value.trim()
  );

  let percentageValue = 0;
  if (priceValue && discountValue) {
    percentageValue = -Math.round(
      ((priceValue - discountValue) / priceValue) * 100
    );
  }
  const editCountingDownPreciousData = {
    title: document.getElementById("edit-countingdown-title").value.trim(),
    price: parseInt(
      document.getElementById("edit-countingdown-price").value.trim()
    ),
    discount: parseInt(
      document.getElementById("edit-countingdown-discount").value.trim()
    ),
    percentage: `${percentageValue}%`,
    rating: parseInt(
      document.getElementById("edit-countingdown-rating-select").value
    ),
    ddl: document.getElementById("edit-countingdown-ddl").value.trim(),
    url: document.getElementById("edit-countingdown-precious-url").value.trim(),
    picurl: document
      .getElementById("edit-countingdown-precious-picture-url")
      .value.trim(),
  };

  console.log("æäº¤çæ°æ®ï¼", editCountingDownPreciousData);
  return editCountingDownPreciousData;
}

// function renderCountingDownData(data) {
//   // ç¡®ä¿ result æè¶³å¤çå­æ®µ
//   if (!data || data.length < 8) return;

//   // å¡«åå¯¹åºå­æ®µ
//   document.getElementById("inner-countingdown-precious-image").src =
//     data.pictureUrl;

//   // å¡«åææ¬åå®¹
//   document.getElementById("inner-countingdown-precious-title").innerText =
//     data.title;
//   document.getElementById("inner-countingdown-precious-price").innerText =
//     data.price;
//   document.getElementById("inner-countingdown-precious-discount").innerText =
//     data.discount;
//   document.getElementById("inner-countingdown-precious-percentage").innerText =
//     data.percentage;
//   document.getElementById("inner-countingdown-precious-rating").innerText =
//     data.rating;
//   document.getElementById("inner-countingdown-precious-ddl").innerText =
//     data.ddl;

//   // è®¾ç½®é¾æ¥
//   const urlElement = document.getElementById("inner-countingdown-precious-url");
//   urlElement.href = data.Url;
//   urlElement.setAttribute("data-bs-title", data.Url);
// }
function renderCountingDownTable(data) {
  const tbody = document.getElementById("index-counting-down-tbody");

  // æ¸ç©ºåå§åå®¹
  tbody.innerHTML = "";

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>
      <img
        src="${data.picurl}"
        alt="table-user"
        class="me-2 avatar-xl"
      />
    </td>
    <td>${data.title}</td>
    <td>$${data.price}</td>
    <td>$${data.discount}</td>
    <td>
      <span class="badge bg-infjew fs-12 p-1">${data.percentage}</span>
    </td>
    <td>${data.rating}</td>
    <td>${data.ddl}</td>
    <td class="text-muted">
      <a
        href="javascript:void(0);"
        class="link-reset fs-20 p-1 text-infjew"
        data-bs-toggle="tooltip"
        data-bs-trigger="hover"
        data-bs-title="${data.url}"
      >
        <i class="ti ti-link"></i>
      </a>
    </td>
    <td class="text-muted">
      <a
        href="javascript:void(0);"
        class="link-reset fs-20 p-1"
        data-bs-toggle="modal"
        data-bs-target="#EditCountingDownModal"
        id="countingdown-precious-edit-btn"
      >
        <i class="ti ti-pencil"></i>
      </a>
    </td>
  `;

  tbody.appendChild(row);

  // æ¿æ´?tooltip
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (el) {
    new bootstrap.Tooltip(el);
  });

  document
    .getElementById("countingdown-precious-edit-btn")
    .addEventListener("click", function () {
      fillCountingDownModal(countingDown);
    });

  document.addEventListener("click", function (e) {
    const target = e.target;
    if (target && target.id === "save-countingdown-precious-btn") {
      const updatedData = getCountingDownPreciousForm();

      fetch("/api/countingdown/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // å¸¦ä¸ Cookie
        body: JSON.stringify(updatedData),
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            console.log("â?æ´æ°æå");

            // éæ°è·åææ?countingDown æ°æ®
            fetch("/api/countingdown", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  countingDown = data.data[0];
                  renderCountingDownTable(countingDown);

                  // æååå¯èªå¨å³é­ Modal
                  const modal = bootstrap.Modal.getInstance(
                    document.getElementById("EditCountingDownModal")
                  );
                  if (modal) modal.hide();
                } else {
                  console.error("â?æ´æ°åæåææ°æ°æ®å¤±è´?", data.message);
                }
              });
          } else {
            console.error("â?æ´æ°å¤±è´¥:", res.message);
          }
        })
        .catch((err) => {
          console.error("â?è¯·æ±æ´æ°å¤±è´¥:", err);
        });
    }
  });
}

function fillCountingDownModal(data) {
  // å¡«å¥ modal è¡¨åä¸­çå­æ®µ
  document.getElementById("edit-countingdown-title").value = data.title || "";
  document.getElementById("edit-countingdown-price").value = data.price || "";
  document.getElementById("edit-countingdown-discount").value =
    data.discount || "";
  document.getElementById("edit-countingdown-rating-select").value =
    data.rating || "1";
  document.getElementById("edit-countingdown-ddl").value = data.ddl || "";
  document.getElementById("edit-countingdown-precious-url").value =
    data.url || "";
  document.getElementById("edit-countingdown-precious-picture-url").value =
    data.picurl || "";
}

function renderBannerTable(data) {
  const tableBody = document.getElementById("index-banner-list-tbody");

  // æ¸ç©ºæ§åå®?
  tableBody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <img
          src="${item.picurl}"
          alt="table-user"
          class="me-2 avatar-xl"
        />
      </td>
      <td>${item.id}</td>
      <td>${item.title1}</td>
      <td>${item.title2}</td>
      <td>${item.subtitle}</td>
      <td class="text-muted">
        <a
          href="javascript:void(0);"
          class="link-reset fs-20 p-1 text-infjew"
          data-bs-toggle="tooltip"
          data-bs-trigger="hover"
          data-bs-title="${item.url}"
        >
          <i class="ti ti-link"></i>
        </a>
      </td>
      <td class="text-muted">
        <a
          href="javascript:void(0);"
          class="link-reset fs-20 p-1 banner-delete-trash" data-banner-id="${item.id}"
          data-bs-toggle="modal"
        data-bs-target="#banner-delete-warning-modal"
          
        >
          <i class="ti ti-trash"></i>
        </a>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // éæ°æ¿æ´?Bootstrap Tooltipï¼å¿é¡»çï¼?
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

function toggleAddBannerButton(data) {
  const addButton = document.getElementById("add-banner-modal-btn");
  const maxBannerCount = 3;

  if (data.length >= maxBannerCount) {
    addButton.classList.add("disabled");
    addButton.setAttribute("disabled", "disabled");
  } else {
    addButton.classList.remove("disabled");
    addButton.removeAttribute("disabled");
  }
}

function deleteBanner(bannerId) {
  fetch("/api/banner/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: bannerId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Banner å é¤æå");
        // å é¤æååéæ°æ¸²æ?banner åè¡¨
        renderBannerTable(data.data); // éæ°æ¸²æ
        toggleAddBannerButton(data.data); // æ´æ°æ·»å æé®ç¶æ?
      } else {
        console.log("Banner å é¤å¤±è´¥:", data.message);
      }
    })
    .catch((error) => {
      console.error("è¯·æ±å¤±è´¥:", error);
    });
}
