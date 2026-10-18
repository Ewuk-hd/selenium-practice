import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'calculator.html')
).href;

describe('Калькулятор', () => {
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

  //ввести числа, выбрать операцию, нажать "=" и вернуть результат
  async function calculate(a, op, b) {
    await driver.findElement(By.id('a')).sendKeys(a);
    await driver.findElement(By.css(`#op option[value="${op}"]`)).click();
    await driver.findElement(By.id('b')).sendKeys(b);
    await driver.findElement(By.id('calc')).click();
    return driver.findElement(By.id('result')).getText();
  }

  it('2 + 3 = 5', async () => {
    assert.equal(await calculate('2', '+', '3'), '5');
  });

  it('10 − 4 = 6', async () => {
    assert.equal(await calculate('10', '-', '4'), '6');
  });

  it('6 × 7 = 42', async () => {
    assert.equal(await calculate('6', '*', '7'), '42');
  });

  it('8 ÷ 2 = 4', async () => {
    assert.equal(await calculate('8', '/', '2'), '4');
  });

  it('5 ÷ 0 → текст «Ошибка: деление на ноль»', async () => {
    assert.equal(await calculate('5', '/', '0'), 'Ошибка: деление на ноль');
  });

  it('Пустое второе поле → текст «Введите оба числа»', async () => {
    assert.equal(await calculate('5', '+', ''), 'Введите оба числа');
  });

  it('Работа с отрицательными числами: -5 + 2 = -3', async () => {
    assert.equal(await calculate('-5', '+', '2'), '-3');
  });

  // БОНУС: найденный баг.
  // Ожидаем 0.3, но калькулятор показывает 0.30000000000000004:
  // дробные числа в JavaScript хранятся неточно, а калькулятор не округляет результат.
  // Тест специально падает - он показывает баг.
  it('БАГ: 0.1 + 0.2 должно быть 0.3', async () => {
    assert.equal(await calculate('0.1', '+', '0.2'), '0.3');
  });
});