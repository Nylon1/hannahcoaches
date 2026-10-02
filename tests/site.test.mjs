import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pages, renderPage } from '../src/site.mjs';

for (const base of ['/', '/hannahcoaches/']) {
  test(`All seven pages, navigation, local assets and fragments resolve at ${base}`, () => {
    assert.equal(pages.length, 7);
    const documents = new Map(pages.map(page => [base + page.slug + (page.slug ? '/' : ''), renderPage(page, base)]));
    for (const [path, html] of documents) {
      assert.equal((html.match(/<h1>/g) || []).length, 1, path);
      assert.equal((html.match(/aria-current="page"/g) || []).length, 1, path);
      assert.match(html, /<html lang="en-GB">/);
      assert.ok(!html.includes('\u2014'), `Em dash found on ${path}`);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
      assert.equal(new Set(ids).size, ids.length, `Duplicate IDs on ${path}`);
      for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^(mailto:|tel:|https?:)/.test(link)) continue;
        const target = new URL(link, 'https://test.invalid' + path);
        if (target.pathname.startsWith(base + 'assets/')) {
          const name = target.pathname.slice((base + 'assets/').length);
          assert.ok(existsSync('src/' + name) || existsSync('assets/' + name), `Missing asset: ${link}`);
        } else {
          const targetHtml = documents.get(target.pathname);
          assert.ok(targetHtml, `Broken link: ${link} on ${path}`);
          if (target.hash) assert.ok(targetHtml.includes(`id="${target.hash.slice(1)}"`), `Missing fragment: ${link}`);
        }
      }
      const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
      assert.equal(schema.telephone, '+447971117677');
      assert.equal(schema.email, 'safetravel77@outlook.com');
    }
  });
}

test('Every advertised service can be selected in the enquiry form', () => {
  const contact = renderPage(pages.find(page => page.slug === 'contact'));
  const options = [...contact.matchAll(/<option(?:[^>]*)>([^<]+)<\/option>/g)].map(match => match[1]);
  for (const page of pages) {
    for (const [, encoded] of renderPage(page).matchAll(/\?service=([^"#]+)/g)) {
      const service = new URLSearchParams('service=' + encoded).get('service');
      assert.ok(options.includes(service), `Missing enquiry option: ${service}`);
    }
  }
});
