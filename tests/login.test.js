import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'index.html')
).href;

describe('Страница входа', () => {
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

  async function login(username, password) {
    await driver.findElement(By.id('username')).sendKeys(username);
    await driver.findElement(By.id('password')).sendKeys(password);
    await driver.findElement(By.id('login-btn')).click();
  }

  async function waitForMessage() {
    const message = await driver.findElement(By.id('message'));
    await driver.wait(until.elementIsVisible(message), 3000);
    return message;
  }

  it('у страницы правильный заголовок', async () => {
    const title = await driver.getTitle();
    assert.equal(title, 'Вход в систему');
  });

  it('вход с верным логином и паролем', async () => {
    await login('student', '12345');
    const message = await waitForMessage();
    assert.equal(await message.getText(), 'Добро пожаловать, student!');
    assert.equal(await message.getAttribute('class'), 'success');
  });

  it('вход с неверным паролем', async () => {
    await login('student', '00000');
    const message = await waitForMessage();
    assert.equal(await message.getText(), 'Неверный логин или пароль');
    assert.equal(await message.getAttribute('class'), 'error');
  });

  it('вход с пустыми полями', async () => {
    await driver.findElement(By.id('login-btn')).click();
    const message = await waitForMessage();
    assert.equal(await message.getText(), 'Заполните все поля');
  });
});