/* =========================================================
   PieIt.net — contact.js
   Contact form validation + secure AJAX submission
   Posts to contact.php which emails the enquiry.
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("quoteForm");
  if (!form) return;

  var statusBox = document.getElementById("formStatus");
  var submitBtn = document.getElementById("quoteSubmit");
  var btnLabel = submitBtn ? submitBtn.querySelector(".btn-label") : null;
  var FORM_ENDPOINT = form.getAttribute("data-endpoint") || "contact.php";

  var emailRe = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  var phoneRe = /^[+]?[\d\s().-]{7,20}$/;

  function fieldOf(el) { return el.closest(".field"); }

  function setError(el, msg) {
    var f = fieldOf(el);
    if (!f) return;
    f.classList.add("invalid");
    var err = f.querySelector(".err");
    if (err) err.textContent = msg;
  }
  function clearError(el) {
    var f = fieldOf(el);
    if (f) f.classList.remove("invalid");
  }

  function validateField(el) {
    var name = el.name;
    var val = (el.value || "").trim();
    if (el.hasAttribute("required") && !val) {
      setError(el, "This field is required.");
      return false;
    }
    if (name === "email" && val && !emailRe.test(val)) {
      setError(el, "Please enter a valid email address.");
      return false;
    }
    if (name === "phone" && val && !phoneRe.test(val)) {
      setError(el, "Please enter a valid phone number.");
      return false;
    }
    if (name === "name" && val && val.length < 2) {
      setError(el, "Please enter your full name.");
      return false;
    }
    if (name === "message" && val && val.length < 10) {
      setError(el, "Please add a little more detail (min 10 characters).");
      return false;
    }
    clearError(el);
    return true;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"))
    .filter(function (el) { return el.type !== "hidden" && !el.classList.contains("hp-input"); });

  fields.forEach(function (el) {
    el.addEventListener("blur", function () { validateField(el); });
    el.addEventListener("input", function () {
      if (fieldOf(el) && fieldOf(el).classList.contains("invalid")) validateField(el);
    });
  });

  function showStatus(type, html) {
    if (!statusBox) return;
    statusBox.className = "form-status show " + type;
    statusBox.innerHTML = '<i class="fa-solid ' +
      (type === "ok" ? "fa-circle-check" : "fa-triangle-exclamation") +
      '"></i><span>' + html + "</span>";
    statusBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    if (btnLabel) btnLabel.textContent = loading ? "Sending…" : "Send Request";
    var sp = submitBtn.querySelector(".spinner");
    if (sp) sp.style.display = loading ? "inline-block" : "none";
    var ic = submitBtn.querySelector(".btn-ic");
    if (ic) ic.style.display = loading ? "none" : "inline-block";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Honeypot spam trap */
    var hp = form.querySelector('input[name="website"]');
    if (hp && hp.value) return;

    var valid = true, firstBad = null;
    fields.forEach(function (el) {
      if (!validateField(el)) {
        valid = false;
        if (!firstBad) firstBad = el;
      }
    });
    if (!valid) {
      if (firstBad) firstBad.focus();
      showStatus("err", "Please correct the highlighted fields and try again.");
      return;
    }

    var payload = new FormData(form);
    setLoading(true);

    fetch(FORM_ENDPOINT, {
      method: "POST",
      body: payload,
      headers: { "X-Requested-With": "XMLHttpRequest" }
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: false, message: "Unexpected server response." }; });
      })
      .then(function (data) {
        if (data && data.ok) {
          form.reset();
          fields.forEach(clearError);
          showStatus("ok", data.message || "Thank you! Your request has been sent. Our team will contact you shortly.");
        } else {
          showStatus("err", (data && data.message) ||
            "We could not send your message right now. Please email us directly at info@pieit.net.");
        }
      })
      .catch(function () {
        showStatus("err",
          'Network error. Please email us directly at <a href="mailto:info@pieit.net">info@pieit.net</a> or call +880 1700-000000.');
      })
      .finally(function () { setLoading(false); });
  });
})();
