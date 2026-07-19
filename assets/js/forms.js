/* Progressive form handling for contact / volunteer forms.
   These submit client-side and show a friendly confirmation. Wire the
   endpoint to a WordPress plugin (e.g. Contact Form 7 / WPForms REST) or a
   serverless function by replacing the submit() body below. */
(function () {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit], button:not([type])");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      try {
        // --- Replace with a real endpoint when the backend form is ready ---
        await new Promise((r) => setTimeout(r, 700));
        show("ok", form.dataset.success || "Thank you! Your message has been received — we'll be in touch shortly.");
        form.reset();
      } catch {
        show("err", "Sorry, something went wrong. Please email us at " + window.IOCPR.ORG.email + ".");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });

    function show(type, msg) {
      if (!status) { alert(msg); return; }
      status.textContent = msg;
      status.className = "form-status show " + type;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
