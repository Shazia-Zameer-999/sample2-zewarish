/* forms.js — booking + newsletter submission, FAQ accordion */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-item__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("is-open");
      item.parentElement.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("is-open"));
      if (!wasOpen) item.classList.add("is-open");
    });
  });

  /* ---------------- Booking date min = today ---------------- */
  const dateInput = document.getElementById("bf-date");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  /* ---------------- Generic form submit handler ---------------- */
  function clearErrors(form) {
    form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  }
  function showErrors(form, errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const el = form.querySelector(`[data-error-for="${field}"]`);
      if (el) el.textContent = message;
    });
  }
  async function submitForm(form, url, statusEl, successMessage) {
    clearErrors(form);
    if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = "<span>Sending&hellip;</span>"; }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.errors) showErrors(form, data.errors);
        if (statusEl) { statusEl.textContent = data.errors?._general || "Please check the fields above."; statusEl.classList.add("is-error"); }
        return;
      }
      if (statusEl) { statusEl.textContent = data.message || successMessage; statusEl.classList.add("is-success"); }
      form.reset();
      const dateInput = document.getElementById("bf-date");
      if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];
    } catch (err) {
      if (statusEl) { statusEl.textContent = "Network error. Please call us directly."; statusEl.classList.add("is-error"); }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalHTML; }
    }
  }

  const bookingForm = document.getElementById("bookingForm");
  bookingForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(bookingForm, "/api/book", document.getElementById("bookingStatus"), "Consultation requested!");
  });

  const newsletterForm = document.getElementById("newsletterForm");
  newsletterForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(newsletterForm, "/api/newsletter", document.getElementById("newsletterStatus"), "You're on the list.");
  });
});
