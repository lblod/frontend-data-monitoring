import { htmlSafe } from '@ember/template';

export default function printAsJson(ob: unknown) {
  return htmlSafe(
    `<span style="white-space: pre-line;"><pre>${JSON.stringify(
      ob,
      undefined,
      '&Tab;'
    )}</</span>`
  );
}
