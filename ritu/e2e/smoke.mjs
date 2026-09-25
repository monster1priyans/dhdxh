// End-to-end smoke test against a running build: npm run build && npm run preview, then npm run e2e.
// The clock is fixed to 20 June 2026 so the golden G1 dates give "16 July" as the next period.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
const OUT = process.env.E2E_OUT ?? 'e2e/out';
mkdirSync(OUT + '/shots', { recursive: true });
const URL = process.env.E2E_URL ?? 'http://localhost:4173';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.clock.setFixedTime(new Date('2026-06-20T10:00:00'));
const shot = n => page.screenshot({ path: OUT + '/shots/' + n + '.png', fullPage: true });
const noHScroll = async n => { const w = await page.evaluate(() => document.documentElement.scrollWidth); if (w > 360) throw new Error(n + ' scrolls horizontally: ' + w); };
const next = () => page.getByRole('button', { name: 'Next', exact: true }).click();
const ok = m => console.log('✓', m);

await page.goto(URL + '/');
await page.waitForURL('**/onboarding');
await page.getByRole('button', { name: 'English' }).click(); await next();
await shot('01-privacy'); await next();
await page.getByRole('button', { name: /^Me/ }).click(); await next();
await page.getByLabel('Name').fill('Asha'); await shot('02-name'); await noHScroll('name'); await next();
await page.getByLabel('Birth year').fill('1996'); await next();
await page.getByLabel('First day of the last period').fill('2026-06-18'); await next();
await next(); // lengths
await shot('03-fertility'); await next();
await page.getByRole('button', { name: 'No PIN' }).click();
await page.getByText('Asha is ready').waitFor(); ok('profile 1 created');
await page.getByRole('button', { name: 'Add another profile' }).click();
await page.getByRole('button', { name: /Someone I care for/ }).click(); await next();
await page.getByLabel('Name').fill('प्रिया'); await next();
await page.getByLabel('Birth year').fill('2013'); await next();
await page.getByRole('switch', { name: /I don't remember/ }).click(); await next();
await next();
if (await page.getByRole('switch', { name: 'Show fertile days' }).getAttribute('aria-checked') !== 'false') throw new Error('fertile should default off for a minor');
ok('fertile days default off for managed minor');
await next();
await page.getByRole('button', { name: 'Add a PIN' }).click();
for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
await page.getByText('Enter the PIN again').waitFor();
for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
await page.getByText('प्रिया is ready').waitFor(); ok('profile 2 created with PIN');
await page.getByRole('button', { name: 'Done' }).click();
await page.getByText('On period, day 3').waitFor(); ok('home: Asha "On period, day 3"');
await page.getByRole('button', { name: 'Period ended' }).waitFor();
await shot('04-home'); await noHScroll('home');

// enter the other G1 periods through the calendar log sheet
await page.getByRole('link', { name: 'Calendar' }).click();
await page.getByRole('radio', { name: /Asha/ }).click();
const month = async target => { for (let i = 0; i < 12; i++) { if (await page.getByRole('heading', { name: target }).count()) return; await page.getByRole('button', { name: 'Previous month' }).click(); } throw new Error('month ' + target); };
const logPeriod = async day => {
  await page.locator('[role=gridcell] button').filter({ hasText: new RegExp('^' + day + '$') }).first().click();
  await page.getByRole('switch', { name: /^Period/ }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText('Saved', { exact: true }).waitFor();
  await page.waitForTimeout(150);
};
for (const [m, days] of [['May 2026', [21]], ['April 2026', [23]], ['March 2026', [26]], ['February 2026', [26]], ['January 2026', [29, 1]]]) {
  await month(m);
  for (const d of days) await logPeriod(d);
}
ok('6 earlier periods logged via calendar');
await shot('05-calendar-jan');

await page.getByRole('link', { name: 'Home' }).click();
await page.getByRole('button', { name: /Asha/ }).first().click();
await page.getByText('Next periods').waitFor();
const txt = await page.locator('main').innerText();
if (!/Thu 16 July/.test(txt) || !txt.includes('± 1 day')) throw new Error('prediction not shown as expected:\n' + txt);
ok('profile page: next period Thu 16 July, ± 1 day');
await shot('06-profile'); await noHScroll('profile');
await page.getByRole('button', { name: 'Cramps' }).click();
await page.getByText('Saved', { exact: true }).waitFor(); ok('quick-log chip saved');
await page.getByRole('button', { name: 'Log more' }).click();
await page.getByRole('dialog').waitFor();
await shot('07-logsheet');
await page.getByRole('button', { name: 'Close' }).click();

await page.getByRole('link', { name: 'Calendar' }).click();
await page.getByRole('link', { name: 'Home' }).click();
await page.getByRole('link', { name: 'Calendar' }).click();
await page.getByRole('heading', { name: 'June 2026' }).waitFor();
await page.getByRole('button', { name: 'Next month' }).click();
await page.getByRole('heading', { name: 'July 2026' }).waitFor();
const cell16 = await page.locator('[role=gridcell] button').filter({ hasText: /^16$/ }).getAttribute('aria-label');
const cell14 = await page.locator('[role=gridcell] button').filter({ hasText: /^14$/ }).getAttribute('aria-label');
if (!cell16.includes('Predicted period') || cell14.includes('Predicted period')) throw new Error('calendar paint: ' + cell16 + ' / ' + cell14);
ok('calendar: 16 July painted as predicted period, 14 July not');
await shot('08-calendar-july'); await noHScroll('calendar');
await page.getByRole('radio', { name: 'Everyone' }).click();
await shot('09-calendar-everyone');

await page.getByRole('link', { name: 'Insights' }).click();
await page.getByText('Average cycle').waitFor();
await page.getByText('Cycle length').first().waitFor();
await shot('10-insights'); await noHScroll('insights'); ok('insights render');
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Doctor report' }).click()]);
const pdf = readFileSync(await dl.path());
if (pdf.subarray(0, 4).toString() !== '%PDF' || pdf.length < 5000) throw new Error('bad pdf');
ok('doctor report PDF (' + pdf.length + ' bytes)');

// reload: PIN profile is locked everywhere
await page.goto(URL + '/');
await page.getByText('प्रिया').waitFor();
const row = (await page.locator('main li').allInnerTexts()).find(r => r.includes('प्रिया'));
if (row.trim() !== 'प्रिया') throw new Error('locked row shows more than the name: ' + JSON.stringify(row));
ok('locked profile row shows only the name');
await shot('11-home-locked');
await page.getByRole('button', { name: /प्रिया/ }).click();
for (const d of '1111') await page.getByRole('button', { name: d, exact: true }).click();
await page.getByText('Wrong PIN. 4 tries left.').waitFor(); ok('wrong PIN rejected');
for (const d of '1234') await page.getByRole('button', { name: d, exact: true }).click();
await page.getByText('No periods logged yet').first().waitFor(); ok('right PIN unlocks');
await shot('12-priya');

// backup
await page.getByRole('link', { name: 'Settings', exact: true }).click();
const [bk] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save backup' }).click()]);
const b = JSON.parse(readFileSync(await bk.path(), 'utf8'));
if (b.profiles.length !== 2 || b.profiles[0].periods.length !== 7) throw new Error('backup contents');
ok('backup file has 2 profiles, 7 periods for Asha');
await shot('13-settings');

// Hindi + dark
await page.getByText('हिंदी').click();
await page.getByRole('link', { name: 'होम' }).click();
await page.getByText('पीरियड चल रहा है, दिन 3').waitFor(); ok('Hindi status line');
await shot('14-home-hi');
await page.emulateMedia({ colorScheme: 'dark' });
await page.getByRole('button', { name: /Asha/ }).first().click();
await page.getByText('अगले पीरियड').waitFor();
await shot('15-profile-hi-dark'); await noHScroll('profile hi');
console.log(errors.length ? 'PAGE ERRORS:\n' + errors.join('\n') : '✓ no page errors');
await browser.close();
