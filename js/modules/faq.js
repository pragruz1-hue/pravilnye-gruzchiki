/**
 * FAQ accordion
 */
export function initFaqAccordion() {
  document.querySelectorAll(".faq-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const faqItem = trigger.closest(".faq-item");
      const panel = faqItem.querySelector(".faq-panel");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Close other items
      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
          const itemTrigger = item.querySelector(".faq-trigger");
          if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
          const itemPanel = item.querySelector(".faq-panel");
          if (itemPanel) itemPanel.style.maxHeight = null;
        }
      });

      // Toggle current
      faqItem.classList.toggle("active");
      trigger.setAttribute("aria-expanded", !isExpanded);
      if (faqItem.classList.contains("active")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = null;
      }
    });
  });
}