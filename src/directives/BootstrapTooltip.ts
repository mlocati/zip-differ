import type {Directive} from 'vue';
import {Tooltip} from 'bootstrap';

const elementsWithTooltip: HTMLElement[] = [];

document.addEventListener('fullscreenchange', () => {
  const container = document.fullscreenElement || 'body';
  elementsWithTooltip.forEach((el) => {
    const tooltip = Tooltip.getInstance(el);
    if (tooltip) {
      tooltip.dispose();
      new Tooltip(el, {container});
    }
  });
});

const BootstrapTooltip: Directive<HTMLElement> = {
  mounted(el) {
    if (!Tooltip.getInstance(el)) {
      new Tooltip(el, {container: document.fullscreenElement || 'body'});
    }
    if (!elementsWithTooltip.includes(el)) {
      elementsWithTooltip.push(el);
    }
  },
  beforeUnmount(el) {
    const index = elementsWithTooltip.indexOf(el);
    if (index > -1) {
      elementsWithTooltip.splice(index, 1);
    }
  },
};

export default BootstrapTooltip;
