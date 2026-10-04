/* ==========================================================================
   FoodBridge — Online Food Donation System
   Front-end only prototype.
   ========================================================================== */

(function () {
  "use strict";

  const STATUS_STEPS = ["Pending", "Accepted", "Collected", "Delivered"];

  /* ---------------------------------------------------------------------
     In-memory state
  --------------------------------------------------------------------- */
  const state = {
    currentUser: null,

    donors: [
      {
        id: "d1",
        name: "Ganesh Caterers",
        email: "ganesh@caterers.example",
        verified: true
      },
      {
        id: "d2",
        name: "Green Leaf Bakery",
        email: "hello@greenleaf.example",
        verified: true
      },
      {
        id: "d3",
        name: "Anand Wedding Hall",
        email: "events@anandhall.example",
        verified: false
      }
    ],

    donations: [
      {
        id: "don1",
        donorName: "Ganesh Caterers",
        foodType: "Veg biryani, packed",
        quantity: "Serves 60",
        location: "Erode, TN",
        availableFrom: "2026-08-19T18:00",
        availableTo: "2026-08-19T21:00",
        notes: "Ready for pickup after 6 PM.",
        status: "Pending",
        requestedBy: null,
        volunteer: null
      },
      {
        id: "don2",
        donorName: "Green Leaf Bakery",
        foodType: "Bread loaves & pastries",
        quantity: "40 units",
        location: "Perundurai, TN",
        availableFrom: "2026-08-19T09:00",
        availableTo: "2026-08-19T13:00",
        notes: "Best consumed same day.",
        status: "Accepted",
        requestedBy: "Sunrise Orphanage",
        volunteer: null
      },
      {
        id: "don3",
        donorName: "Anand Wedding Hall",
        foodType: "Mixed rice & curries",
        quantity: "Serves 120",
        location: "Bhavani, TN",
        availableFrom: "2026-08-18T20:00",
        availableTo: "2026-08-18T23:00",
        notes: "",
        status: "Collected",
        requestedBy: "Hope NGO",
        volunteer: "Ravi Kumar"
      },
      {
        id: "don4",
        donorName: "Ganesh Caterers",
        foodType: "Fruit boxes",
        quantity: "50 boxes",
        location: "Erode, TN",
        availableFrom: "2026-08-17T10:00",
        availableTo: "2026-08-17T14:00",
        notes: "",
        status: "Delivered",
        requestedBy: "Sunrise Orphanage",
        volunteer: "Meena S"
      }
    ]
  };

  let nextDonationId = 5;

  let receiverFilter = "Pending";
  let receiverSearch = "";

  let volunteerFilter = "Accepted";

  /* ---------------------------------------------------------------------
     Small helpers
  --------------------------------------------------------------------- */

  const $ = (sel, root = document) => root.querySelector(sel);

  const $$ = (sel, root = document) =>
    Array.from(root.querySelectorAll(sel));

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  function formatWindow(fromStr, toStr) {
    const opts = {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    };

    try {
      const from = new Date(fromStr).toLocaleString(undefined, opts);
      const to = new Date(toStr).toLocaleString(undefined, opts);

      return `${from} → ${to}`;
    } catch (e) {
      return `${fromStr} → ${toStr}`;
    }
  }

  function showToast(message) {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(showToast._t);

    showToast._t = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  function stepper(status, light) {
    const currentIndex = STATUS_STEPS.indexOf(status);

    const steps = STATUS_STEPS.map((label, i) => {
      let cls = "stepper__step";

      if (i < currentIndex) {
        cls += " is-done";
      }

      if (i === currentIndex) {
        cls += " is-current";
      }

      return `
        <div class="${cls}">
          <span class="stepper__dot"></span>
          <span class="stepper__label">${label}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="stepper${light ? " stepper--light" : ""}">
        ${steps}
      </div>
    `;
  }

  function badge(status) {
    return `
      <span class="badge badge--${status}">
        ${status}
      </span>
    `;
  }

  /* ---------------------------------------------------------------------
     View switching
  --------------------------------------------------------------------- */

  function setView(name) {
    $$(".view").forEach((v) => {
      v.classList.toggle(
        "is-active",
        v.dataset.viewPanel === name
      );
    });

    $$(".nav__link").forEach((b) => {
      b.classList.toggle(
        "is-active",
        b.dataset.view === name
      );
    });

    const mainNav = $("#mainNav");

    if (mainNav) {
      mainNav.classList.remove("is-open");
    }

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

    renderAll();
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-view]");

    if (trigger) {
      setView(trigger.dataset.view);
    }
  });

  const hamburger = $("#hamburger");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      $("#mainNav").classList.toggle("is-open");
    });
  }

  /* ---------------------------------------------------------------------
     Auth
  --------------------------------------------------------------------- */

  const loginForm = $("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(e.target);

      const role = data.get("role");
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();

      if (!name) {
        showToast("Please enter your name.");
        return;
      }

      state.currentUser = {
        name,
        role,
        email
      };

      updateSessionBadge();

      showToast(`Welcome back, ${name}.`);

      setView(
        role === "receiver"
          ? "receiver"
          : role
      );

      e.target.reset();
    });
  }

  const registerForm = $("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(e.target);

      const role = data.get("role");
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();

      if (!name) {
        showToast("Please enter your name.");
        return;
      }

      if (role === "donor") {
        state.donors.push({
          id: "d" + (state.donors.length + 1),
          name,
          email,
          verified: false
        });
      }

      state.currentUser = {
        name,
        role,
        email
      };

      updateSessionBadge();

      showToast(
        role === "donor"
          ? `Account created. An admin will verify ${name} shortly.`
          : `Account created. Welcome, ${name}.`
      );

      setView(
        role === "receiver"
          ? "receiver"
          : role
      );

      e.target.reset();
    });
  }

  function updateSessionBadge() {
    const badgeEl = $("#sessionBadge");

    if (!badgeEl) return;

    if (state.currentUser) {
      badgeEl.hidden = false;

      badgeEl.textContent =
        `${state.currentUser.name} · ${state.currentUser.role}`;
    } else {
      badgeEl.hidden = true;
    }
  }

  /* ---------------------------------------------------------------------
     Donor Portal
  --------------------------------------------------------------------- */

  const donationForm = $("#donationForm");

  if (donationForm) {
    donationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(e.target);

      const donorName = (data.get("donorName") || "").trim();
      const foodType = (data.get("foodType") || "").trim();
      const quantity = (data.get("quantity") || "").trim();
      const district = (data.get("district") || "").trim();
      const from = data.get("availableFrom");
      const to = data.get("availableTo");
      const notes = (data.get("notes") || "").trim();

      /* ---------------------------------------------------------------
         REQUIRED FIELD VALIDATION
      --------------------------------------------------------------- */

      if (
        !donorName ||
        !foodType ||
        !quantity ||
        !district
      ) {
        showToast("Please fill all required fields.");
        return;
      }

      /* ---------------------------------------------------------------
         DATE/TIME VALIDATION
      --------------------------------------------------------------- */

      if (!from || !to) {
        showToast("Please select availability start and end time.");
        return;
      }

      if (new Date(to) <= new Date(from)) {
        showToast(
          "Availability end must be after the start time."
        );
        return;
      }

      /* ---------------------------------------------------------------
         CREATE DONATION
      --------------------------------------------------------------- */

      state.donations.unshift({
        id: "don" + nextDonationId++,

        donorName: donorName,

        foodType: foodType,

        quantity: quantity,

        /* IMPORTANT:
           district from the form is stored as location */
        location: district,

        availableFrom: from,

        availableTo: to,

        notes: notes,

        status: "Pending",

        requestedBy: null,

        volunteer: null
      });

      showToast(
        "Donation published and marked Pending."
      );

      e.target.reset();

      renderDonor();
      renderAdmin();
      renderHome();
      renderReceiver();
    });
  }

  function renderDonor() {
    const list = $("#donorList");

    if (!list) return;

    const donorName =
      state.currentUser &&
      state.currentUser.role === "donor"
        ? state.currentUser.name
        : null;

    const items = donorName
      ? state.donations.filter(
          (d) => d.donorName === donorName
        )
      : state.donations;

    const donorCount = $("#donorCount");

    if (donorCount) {
      donorCount.textContent = items.length;
    }

    if (!items.length) {
      list.innerHTML = `
        <div class="empty-state">
          No donations listed yet.
          Use the form to publish your first one.
        </div>
      `;

      return;
    }

    list.innerHTML = items.map((d) => `
      <div class="donation-card">

        <div class="donation-card__top">

          <div>
            <h4>${escapeHtml(d.foodType)}</h4>

            <p class="donation-card__meta">
              ${escapeHtml(d.donorName)}
              ·
              ${escapeHtml(d.location)}
            </p>
          </div>

          ${badge(d.status)}

        </div>

        <p class="donation-card__meta">
          ${escapeHtml(d.quantity)}
          ·
          ${formatWindow(
            d.availableFrom,
            d.availableTo
          )}
        </p>

        ${
          d.notes
            ? `
              <p class="donation-card__notes">
                "${escapeHtml(d.notes)}"
              </p>
            `
            : ""
        }

        ${stepper(d.status, false)}

      </div>
    `).join("");
  }

  /* ---------------------------------------------------------------------
     Receiver Dashboard
  --------------------------------------------------------------------- */

  const receiverTabs = $("#receiverTabs");

  if (receiverTabs) {
    receiverTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");

      if (!tab) return;

      $$(".tab", receiverTabs).forEach((t) => {
        t.classList.remove("is-active");
      });

      tab.classList.add("is-active");

      receiverFilter = tab.dataset.filter;

      renderReceiver();
    });
  }

  const receiverSearchInput = $("#receiverSearch");

  if (receiverSearchInput) {
    receiverSearchInput.addEventListener("input", (e) => {
      receiverSearch =
        e.target.value.trim().toLowerCase();

      renderReceiver();
    });
  }

  function requestDonation(id) {
    const d = state.donations.find(
      (x) => x.id === id
    );

    if (!d || d.status !== "Pending") {
      return;
    }

    const receiverName =
      state.currentUser &&
      state.currentUser.role === "receiver"
        ? state.currentUser.name
        : "Guest NGO";

    d.status = "Accepted";

    d.requestedBy = receiverName;

    showToast(
      "Request sent — donation moved to Accepted."
    );

    renderReceiver();
    renderAdmin();
    renderVolunteer();
    renderHome();
  }

  /* Make requestDonation available if needed by HTML */
  window.__foodbridge_requestDonation =
    requestDonation;

  function renderReceiver() {
    const container = $("#receiverList");

    if (!container) return;

    const receiverName =
      state.currentUser &&
      state.currentUser.role === "receiver"
        ? state.currentUser.name
        : null;

    let items;

    if (receiverFilter === "mine") {
      items = state.donations.filter((d) =>
        receiverName
          ? d.requestedBy === receiverName
          : d.requestedBy !== null
      );
    } else {
      items = state.donations.filter(
        (d) => d.status === "Pending"
      );
    }

    if (receiverSearch) {
      items = items.filter((d) =>
        d.foodType
          .toLowerCase()
          .includes(receiverSearch) ||
        d.location
          .toLowerCase()
          .includes(receiverSearch)
      );
    }

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          ${
            receiverFilter === "mine"
              ? "You haven't requested any donations yet."
              : "No open donations match right now — check back soon."
          }
        </div>
      `;

      return;
    }

    container.innerHTML = items.map((d) => `
      <div class="donation-card">

        <div class="donation-card__top">

          <div>
            <h4>${escapeHtml(d.foodType)}</h4>

            <p class="donation-card__meta">
              ${escapeHtml(d.donorName)}
              ·
              ${escapeHtml(d.location)}
            </p>
          </div>

          ${badge(d.status)}

        </div>

        <p class="donation-card__meta">
          ${escapeHtml(d.quantity)}
          ·
          ${formatWindow(
            d.availableFrom,
            d.availableTo
          )}
        </p>

        ${
          d.notes
            ? `
              <p class="donation-card__notes">
                "${escapeHtml(d.notes)}"
              </p>
            `
            : ""
        }

        <div class="donation-card__foot">

          ${
            d.requestedBy
              ? `
                <span class="donation-card__meta">
                  Requested by
                  ${escapeHtml(d.requestedBy)}
                </span>
              `
              : "<span></span>"
          }

          ${
            d.status === "Pending"
              ? `
                <button
                  class="btn btn--solid btn--sm"
                  data-request="${d.id}">
                  Request pickup
                </button>
              `
              : ""
          }

        </div>

      </div>
    `).join("");

    $$("[data-request]", container)
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => requestDonation(btn.dataset.request)
        );
      });
  }

  /* ---------------------------------------------------------------------
     Volunteer Coordination
  --------------------------------------------------------------------- */

  const volunteerTabs = $("#volunteerTabs");

  if (volunteerTabs) {
    volunteerTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");

      if (!tab) return;

      $$(".tab", volunteerTabs).forEach((t) => {
        t.classList.remove("is-active");
      });

      tab.classList.add("is-active");

      volunteerFilter = tab.dataset.filter;

      renderVolunteer();
    });
  }

  function assignVolunteer(id) {
    const d = state.donations.find(
      (x) => x.id === id
    );

    if (!d || d.status !== "Accepted") {
      return;
    }

    const name =
      state.currentUser &&
      state.currentUser.role === "volunteer"
        ? state.currentUser.name
        : "Guest Volunteer";

    d.volunteer = name;

    showToast(
      `Route assigned to ${name}.`
    );

    renderVolunteer();
    renderAdmin();
  }

  function advanceStatus(id) {
    const d = state.donations.find(
      (x) => x.id === id
    );

    if (!d) return;

    if (
      d.status === "Accepted" &&
      d.volunteer
    ) {
      d.status = "Collected";

      showToast(
        "Marked as Collected."
      );
    } else if (
      d.status === "Collected"
    ) {
      d.status = "Delivered";

      showToast(
        "Delivered — thank you!"
      );
    }

    renderVolunteer();
    renderAdmin();
    renderReceiver();
    renderDonor();
    renderHome();
  }

  window.__foodbridge_advance =
    advanceStatus;

  function renderVolunteer() {
    const container = $("#volunteerList");

    if (!container) return;

    const volunteerName =
      state.currentUser &&
      state.currentUser.role === "volunteer"
        ? state.currentUser.name
        : null;

    let items;

    if (volunteerFilter === "mine") {
      items = state.donations.filter((d) =>
        volunteerName
          ? d.volunteer === volunteerName
          : d.volunteer !== null
      );
    } else {
      items = state.donations.filter(
        (d) =>
          d.status === "Accepted" ||
          d.status === "Collected"
      );
    }

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          ${
            volunteerFilter === "mine"
              ? "No routes assigned to you yet."
              : "Nothing ready for pickup right now."
          }
        </div>
      `;

      return;
    }

    container.innerHTML = items.map((d) => `
      <div class="donation-card">

        <div class="donation-card__top">

          <div>
            <h4>${escapeHtml(d.foodType)}</h4>

            <p class="donation-card__meta">
              ${escapeHtml(d.donorName)}
              →
              ${escapeHtml(
                d.requestedBy ||
                "Unassigned receiver"
              )}
            </p>
          </div>

          ${badge(d.status)}

        </div>

        <p class="donation-card__meta">
          ${escapeHtml(d.location)}
          ·
          ${formatWindow(
            d.availableFrom,
            d.availableTo
          )}
        </p>

        ${
          d.volunteer
            ? `
              <p class="donation-card__meta">
                Volunteer:
                ${escapeHtml(d.volunteer)}
              </p>
            `
            : ""
        }

        <div class="donation-card__foot">

          <span></span>

          ${
            !d.volunteer
              ? `
                <button
                  class="btn btn--outline btn--sm"
                  data-assign="${d.id}">
                  Assign myself
                </button>
              `
              : `
                <button
                  class="btn btn--solid btn--sm"
                  data-advance="${d.id}">
                  Mark ${
                    d.status === "Accepted"
                      ? "Collected"
                      : "Delivered"
                  }
                </button>
              `
          }

        </div>

      </div>
    `).join("");

    $$("[data-assign]", container)
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => assignVolunteer(btn.dataset.assign)
        );
      });

    $$("[data-advance]", container)
      .forEach((btn) => {
        btn.addEventListener(
          "click",
          () => advanceStatus(btn.dataset.advance)
        );
      });
  }

  /* ---------------------------------------------------------------------
     Admin Controls
  --------------------------------------------------------------------- */

  function renderAdmin() {
    const adminStats = $("#adminStats");

    if (adminStats) {
      const counts = STATUS_STEPS.reduce(
        (acc, s) => {
          acc[s] = 0;
          return acc;
        },
        {}
      );

      state.donations.forEach((d) => {
        counts[d.status] =
          (counts[d.status] || 0) + 1;
      });

      adminStats.innerHTML =
        STATUS_STEPS.map((s) => `
          <div class="stat-card">
            <b>${counts[s] || 0}</b>
            <span>${s}</span>
          </div>
        `).join("");
    }

    const tbody = $("#adminTableBody");

    if (tbody) {
      if (!state.donations.length) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5">
              No donations yet.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML =
          state.donations.map((d) => `
            <tr>

              <td>
                ${escapeHtml(d.foodType)}
              </td>

              <td>
                ${escapeHtml(d.donorName)}
              </td>

              <td>
                ${escapeHtml(d.location)}
              </td>

              <td>
                ${badge(d.status)}
              </td>

              <td>
                <button
                  class="btn btn--ghost btn--sm"
                  data-remove="${d.id}">
                  Remove
                </button>
              </td>

            </tr>
          `).join("");

        $$("[data-remove]", tbody)
          .forEach((btn) => {
            btn.addEventListener(
              "click",
              () => {

                state.donations =
                  state.donations.filter(
                    (d) =>
                      d.id !== btn.dataset.remove
                  );

                showToast(
                  "Donation removed by admin."
                );

                renderAll();
              }
            );
          });
      }
    }

    const verifyList = $("#donorVerifyList");

    if (!verifyList) return;

    verifyList.innerHTML =
      state.donors.map((donor) => `
        <div class="verify-row">

          <div>

            <p class="verify-row__name">
              ${escapeHtml(donor.name)}
            </p>

            <p class="verify-row__email">
              ${escapeHtml(donor.email)}
            </p>

          </div>

          <div
            style="
              display:flex;
              align-items:center;
              gap:10px;
            "
          >

            <span
              class="
                verify-tag
                ${
                  donor.verified
                    ? "verify-tag--yes"
                    : "verify-tag--no"
                }
              "
            >
              ${
                donor.verified
                  ? "Verified"
                  : "Pending"
              }
            </span>

            <button
              class="
                btn
                btn--sm
                ${
                  donor.verified
                    ? "btn--ghost"
                    : "btn--solid"
                }
              "
              data-toggle-verify="${donor.id}"
            >
              ${
                donor.verified
                  ? "Revoke"
                  : "Verify"
              }
            </button>

          </div>

        </div>
      `).join("");

    $$("[data-toggle-verify]", verifyList)
      .forEach((btn) => {

        btn.addEventListener(
          "click",
          () => {

            const donor =
              state.donors.find(
                (d) =>
                  d.id ===
                  btn.dataset.toggleVerify
              );

            if (!donor) return;

            donor.verified =
              !donor.verified;

            showToast(
              `${donor.name} ${
                donor.verified
                  ? "verified"
                  : "verification revoked"
              }.`
            );

            renderAdmin();
          }
        );

      });
  }

  /* ---------------------------------------------------------------------
     Home Hero
  --------------------------------------------------------------------- */

  function renderHome() {
    const heroStats = $("#heroStats");

    if (!heroStats) return;

    const total =
      state.donations.length;

    const delivered =
      state.donations.filter(
        (d) => d.status === "Delivered"
      ).length;

    const active =
      state.donations.filter(
        (d) =>
          d.status === "Pending" ||
          d.status === "Accepted"
      ).length;

    heroStats.innerHTML = `
      <div class="stat">
        <b>${total}</b>
        <span>Listings tracked</span>
      </div>

      <div class="stat">
        <b>${delivered}</b>
        <span>Delivered</span>
      </div>

      <div class="stat">
        <b>${active}</b>
        <span>In progress</span>
      </div>
    `;

    const featured =
      state.donations[0];

    const heroTracker =
      $("#heroTracker");

    if (!heroTracker) return;

    heroTracker.innerHTML =
      featured
        ? stepper(
            featured.status,
            true
          )
        : `
          <p
            style="
              color:#fff;
              opacity:.7;
              font-size:13px;
            "
          >
            No donations yet.
          </p>
        `;
  }

  /* ---------------------------------------------------------------------
     Render everything
  --------------------------------------------------------------------- */

  function renderAll() {
    renderHome();
    renderDonor();
    renderReceiver();
    renderVolunteer();
    renderAdmin();
  }

  /* ---------------------------------------------------------------------
     Start Application
  --------------------------------------------------------------------- */

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      updateSessionBadge();
      setView("home");
    }
  );

})();