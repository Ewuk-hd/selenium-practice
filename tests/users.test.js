import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, Key, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'users.html')
).href;

describe('Пользователи', () => {
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

  //нажать загрузить и дождаться окончания загрузки.
  // Кнопка блокируется сразу при клике и разблокируется, когда данные пришли.
  async function loadUsers() {
    const loadBtn = await driver.findElement(By.id('load'));
    await loadBtn.click();
    await driver.wait(until.elementIsEnabled(loadBtn), 5000); // ждём до 5 секунд
  }

  //вернуть все строки таблицы
  async function getRows() {
    return driver.findElements(By.css('#users tbody tr'));
  }

  it('При открытии таблица, загрузчик и модальное окно скрыты (isDisplayed() → false)', async () => {
    assert.equal(await driver.findElement(By.id('users')).isDisplayed(), false);
    assert.equal(await driver.findElement(By.id('loader')).isDisplayed(), false);
    assert.equal(await driver.findElement(By.id('modal')).isDisplayed(), false);
  });

  it('Сразу после нажатия «Загрузить» виден текст «Загрузка...», а кнопка заблокирована', async () => {
    const loadBtn = await driver.findElement(By.id('load'));
    await loadBtn.click();

    const loader = await driver.findElement(By.id('loader'));
    assert.equal(await loader.isDisplayed(), true);
    assert.equal(await loader.getText(), 'Загрузка...');
    assert.equal(await loadBtn.isEnabled(), false);
  });

  it('После загрузки в таблице ровно 3 строки (#users tbody tr)', async () => {
    await loadUsers();
    assert.equal((await getRows()).length, 3);
  });

  it('Первая строка: имя «Анна», роль «Тестировщик»', async () => {
    await loadUsers();
    const rows = await getRows();
    const cells = await rows[0].findElements(By.css('td'));
    assert.equal(await cells[0].getText(), 'Анна');
    assert.equal(await cells[1].getText(), 'Тестировщик');
  });

  it('После загрузки загрузчик исчезает, а кнопка снова активна', async () => {
    const loadBtn = await driver.findElement(By.id('load'));
    const loader = await driver.findElement(By.id('loader'));

    await loadBtn.click();
    await driver.wait(until.elementIsNotVisible(loader), 5000);

    assert.equal(await loader.isDisplayed(), false);
    assert.equal(await loadBtn.isEnabled(), true);
  });

  it('Кнопка «О программе» открывает окно, и в нём есть текст «Версия 1.0»', async () => {
    await driver.findElement(By.id('open-modal')).click();

    const modal = await driver.findElement(By.id('modal'));
    await driver.wait(until.elementIsVisible(modal), 3000);

    const text = await driver.findElement(By.id('modal-text')).getText();
    assert.ok(text.includes('Версия 1.0'));
  });

  it('Кнопка «Закрыть» скрывает модальное окно', async () => {
    await driver.findElement(By.id('open-modal')).click();
    const modal = await driver.findElement(By.id('modal'));
    await driver.wait(until.elementIsVisible(modal), 3000);

    await driver.findElement(By.id('close-modal')).click();
    await driver.wait(until.elementIsNotVisible(modal), 3000);

    assert.equal(await modal.isDisplayed(), false);
  });

  // БОНУС: повторная загрузка не должна дублировать строки
  it('повторная загрузка оставляет 3 строки, а не 6', async () => {
    await loadUsers();
    await loadUsers();
    assert.equal((await getRows()).length, 3);
  });
});