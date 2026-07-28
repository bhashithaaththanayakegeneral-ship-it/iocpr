/* Form handling — Contact Form 7 REST when data-cf7 / IOCPR.CF7.formId is set. */
(function () {
  const CF7_ID = () =>
    String(window.IOCPR?.CF7?.formId || "").trim();

  async function submitCf7(form, formId) {
    const base = (window.IOCPR?.WP_BASE || "").replace(/\/$/, "");
    const url = `${base}/contact-form-7/v1/contact-forms/${encodeURIComponent(formId)}/feedback`;
    const fd = new FormData(form);
    fd.set("_wpcf7", formId);
    fd.set("_wpcf7_version", "5.9");
    fd.set("_wpcf7_locale", "en_US");
    fd.set("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);
    fd.set("_wpcf7_container_post", "0");
    fd.set("_wpcf7_posted_data_hash", "");

    const res = await fetch(url, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok && !data.status) {
      throw new Error(data.message || `HTTP ${res.status}`);
    }
    if (data.status === "mail_sent") {
      return data.message || "Thank you for your message. It has been sent.";
    }
    const detail =
      data.message ||
      (data.invalid_fields && data.invalid_fields.map((f) => f.message).join(" ")) ||
      "Something went wrong. Please try again.";
    throw new Error(detail);
  }

  document.querySelectorAll("form[data-form]").forEach((form) => {
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button[type=submit], button:not([type])");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const label = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      try {
        const formId = form.dataset.cf7 || CF7_ID();
        if (formId) {
          const msg = await submitCf7(form, formId);
          show("ok", form.dataset.success || msg);
          form.reset();
        } else {
          await new Promise((r) => setTimeout(r, 700));
          show(
            "ok",
            form.dataset.success ||
              "Thank you! Your message has been received — we'll be in touch shortly."
          );
          form.reset();
        }
      } catch (err) {
        show(
          "err",
          (err && err.message) ||
            "Sorry, something went wrong. Please email us at " + window.IOCPR.ORG.email + "."
        );
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = label;
        }
      }
    });

    function show(type, msg) {
      if (!status) {
        alert(msg);
        return;
      }
      status.textContent = msg;
      status.className = "form-status show " + type;
      status.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
})();
