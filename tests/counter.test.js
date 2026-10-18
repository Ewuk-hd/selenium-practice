import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'counter.html')
).href;

describe('Счётчик', () => {
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(PAGE_URL);
  });

  it('Заголовок страницы — «Счётчик»', async () => {
    assert.equal(await driver.getTitle(), 'Счётчик');
  });

  it('При открытии счётчик равен 0', async () => {
    const counter = await driver.findElement(By.id('counter'));
    assert.equal(await counter.getText(), '0');
  });

  it('После трёх нажатий на «+» счётчик равен 3', async () => {
    const plus = await driver.findElement(By.id('plus'));
    for (let i = 0; i < 3; i++) {
      await plus.click();
    }

    const counter = await driver.findElement(By.id('counter'));
    assert.equal(await counter.getText(), '3');
  });

  it('«+», «+», «−» → счётчик равен 1', async () => {
    const plus = await driver.findElement(By.id('plus'));
    const minus = await driver.findElement(By.id('minus'));

    await plus.click();
    await plus.click();
    await minus.click();

    const counter = await driver.findElement(By.id('counter'));
    assert.equal(await counter.getText(), '1');
  });

  it('Нажатие «−» при нуле не делает счётчик отрицательным (остаётся 0)', async () => {
    await driver.findElement(By.id('minus')).click();

    const counter = await driver.findElement(By.id('counter'));
    assert.equal(await counter.getText(), '0');
  });

  it('«Сбросить» после нескольких нажатий «+» возвращает 0', async () => {
    const plus = await driver.findElement(By.id('plus'));
    for (let i = 0; i < 4; i++) {
      await plus.click();
    }

    await driver.findElement(By.id('reset')).click();

    const counter = await driver.findElement(By.id('counter'));
    assert.equal(await counter.getText(), '0');
  });
});