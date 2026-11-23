/* beem — waitlist form
 *
 * HOW SIGN-UPS GET TO YOU
 * -----------------------
 * A static website has no database, so the form needs somewhere to send the data.
 * Paste a form endpoint into ENDPOINT below and every sign-up will arrive there.
 * Easy options (all free to start):
 *   - Formspree  → https://formspree.io  (gives you https://formspree.io/f/xxxx)
 *   - Web3Forms / Getform / Basin (same idea)
 *   - A Google Sheets "Apps Script" web app URL
 * Leave ENDPOINT empty and the form still works for testing, but sign-ups are
 * only saved in the visitor's own browser, so you will NOT receive them.
 */
(function () {
  "use strict";

  var ENDPOINT = ""; // <-- paste your form endpoint here

  var SHADES = {
    tube: [
      { name: "Milk", color: "#f4e6dc" },
      { name: "Petal", color: "#e3b1a5" },
      { name: "Merlot", color: "#6b1427" }
    ],
    gloss: [
      { name: "Soft Nude", color: "#d9a08e" },
      { name: "Rosé", color: "#e08a97" },
      { name: "Berry", color: "#c4284a" },
      { name: "Merlot", color: "#7a1230" }
    ]
  };

  var form = document.getElementById("waitlist-form");
  if (!form) return;

  var card = document.getElementById("waitlist-card");
  var shadeBox = document.getElementById("shade-chips");
  var shadeField = document.getElementById("shade-field");
  var errorBox = document.getElementById("form-error");
  var submitBtn = document.getElementById("submit-btn");
  var testNote = document.getElementById("test-note");

  var isLocal = location.protocol === "file:" || /^(localhost|127\.)/.test(location.hostname);
  if (!ENDPOINT && isLocal && testNote) testNote.hidden = false;

  /* ----- shades follow the product choice ----- */
  function selectedProducts() {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="products"]:checked'),
      function (i) { return i.value; }
    );
  }

  function renderShades(preselect) {
    var products = selectedProducts();
    shadeBox.innerHTML = "";
    if (!products.length) { shadeField.hidden = true; return; }
    shadeField.hidden = false;

    var seen = {};
    products.forEach(function (p) {
      SHADES[p].forEach(function (s) {
        if (seen[s.name]) return;
        seen[s.name] = true;
        var label = document.createElement("label");
        label.className = "chip";
        label.innerHTML =
          '<input type="checkbox" name="shades" value="' + s.name + '">' +
          '<span><i style="--c:' + s.color + '"></i>' + s.name + "</span>";
        if (preselect && preselect === s.name) label.querySelector("input").checked = true;
        shadeBox.appendChild(label);
      });
    });
  }

  form.querySelectorAll('input[name="products"]').forEach(function (i) {
    i.addEventListener("change", function () { renderShades(); });
  });

  /* ----- prefill from shop page links (?product=tube&shade=Petal) ----- */
  var params = new URLSearchParams(location.search);
  var pParam = params.get("product");
  var sParam = params.get("shade");
  if (pParam && SHADES[pParam]) {
    var box = form.querySelector('input[name="products"][value="' + pParam + '"]');
    if (box) box.checked = true;
  }
  renderShades(sParam);

  /* ----- validation ----- */
  function setError(fieldEl, on) {
    if (fieldEl) fieldEl.classList.toggle("has-error", on);
  }

  function validate() {
    var ok = true;
    var name = form.elements["name"];
    var email = form.elements["email"];
    var phone = form.elements["phone"];

    var nameOk = name.value.trim().length >= 2;
    setError(name.closest(".field"), !nameOk);
    ok = ok && nameOk;

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    setError(email.closest(".field"), !emailOk);
    ok = ok && emailOk;

    // Phone is optional, but if given it should look like a real number
    var digits = phone.value.replace(/\D/g, "");
    var phoneOk = phone.value.trim() === "" || (digits.length >= 10 && digits.length <= 15);
    setError(phone.closest(".field"), !phoneOk);
    ok = ok && phoneOk;

    var prodOk = selectedProducts().length > 0;
    setError(document.getElementById("product-field"), !prodOk);
    ok = ok && prodOk;

    var consentOk = form.elements["consent"].checked;
    setError(form.elements["consent"].closest(".field"), !consentOk);
    ok = ok && consentOk;

    if (!ok) {
      var first = form.querySelector(".has-error");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return ok;
  }

  form.addEventListener("input", function (e) {
    var f = e.target.closest(".field");
    if (f && f.classList.contains("has-error")) f.classList.remove("has-error");
  });

  /* ----- submit ----- */
  function collect() {
    var fd = new FormData(form);
    return {
      name: fd.get("name").trim(),
      email: fd.get("email").trim().toLowerCase(),
      phone: (fd.get("phone") || "").trim(),
      city: (fd.get("city") || "").trim(),
      products: fd.getAll("products"),
      shades: fd.getAll("shades"),
      heard_from: fd.get("heard") || "",
      joined_at: new Date().toISOString(),
      source: "beem-website-waitlist"
    };
  }

  function saveLocal(data) {
    try {
      var list = JSON.parse(localStorage.getItem("beem_waitlist") || "[]");
      list.push(data);
      localStorage.setItem("beem_waitlist", JSON.stringify(list));
    } catch (e) { /* storage may be blocked; ignore */ }
  }

  function showSuccess(name) {
    card.classList.add("is-done");
    var first = name.split(" ")[0];
    document.getElementById("success-name").textContent = first;
    var s = document.getElementById("success");
    s.classList.add("is-visible");
    s.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.classList.remove("is-visible");

    // Honeypot: real people never fill this in
    if (form.elements["company"].value) return;
    if (!validate()) return;

    var data = collect();
    submitBtn.disabled = true;
    submitBtn.textContent = "Joining…";

    if (!ENDPOINT) {
      saveLocal(data);
      console.warn("[beem] No ENDPOINT set in js/waitlist.js — sign-up saved in this browser only.", data);
      showSuccess(data.name);
      return;
    }

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response " + res.status);
        saveLocal(data);
        showSuccess(data.name);
      })
      .catch(function () {
        errorBox.classList.add("is-visible");
        submitBtn.disabled = false;
        submitBtn.textContent = "Join the waitlist";
      });
  });
})();
