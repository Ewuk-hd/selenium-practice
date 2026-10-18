import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, Key, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'register.html')
).href;

describe('Регистрация', () => {
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

  async function register(name, email, age, city) {
    await driver.findElement(By.id('name')).sendKeys(name);
    await driver.findElement(By.id('email')).sendKeys(email);
    await driver.findElement(By.id('age')).sendKeys(age);
    if (city !== '') {
      await driver.findElement(By.css(`#city option[value="${city}"]`)).click();
    }
    await driver.findElement(By.id('agree')).click();
    await driver.findElement(By.id('submit')).click();
  }

  async function getErrors() {
    const errorElements = await driver.findElements(By.css('#errors li'));
    const errorTexts = [];
    for (const el of errorElements) {
      errorTexts.push(await el.getText());
    }
    return errorTexts;
  }

  it('При открытии чекбокс не отмечен, а кнопка «Зарегистрироваться» неактивна', async () => {
    const agree = await driver.findElement(By.id('agree'));
    const submit = await driver.findElement(By.id('submit'));
    assert.equal(await agree.isSelected(), false);
    assert.equal(await submit.isEnabled(), false);
  });

  it('После клика по чекбоксу кнопка становится активной, после второго клика — снова неактивной', async () => {
    const agree = await driver.findElement(By.id('agree'));
    const submit = await driver.findElement(By.id('submit'));

    await agree.click();
    assert.equal(await submit.isEnabled(), true);

    await agree.click();
    assert.equal(await submit.isEnabled(), false);
  });

  it('Корректные данные (Иван, ivan@mail.ru, 15, Казань) → «Регистрация успешна: Иван, Казань», ошибок нет', async () => {
    await register('Иван', 'ivan@mail.ru', '15', 'kazan');
    const result = await driver.findElement(By.id('result')).getText();
    assert.equal(result, 'Регистрация успешна: Иван, Казань');
    assert.deepEqual(await getErrors(), []);
  });

  it('Пустая форма (только галочка согласия) → ровно 4 ошибки в списке #errors li', async () => {
    await register('', '', '', '');
    assert.equal((await getErrors()).length, 4);
  });

  it('Email без символа @ при остальных верных полях → ровно одна ошибка «Некорректный email»', async () => {
    await register('Иван', 'ivan.mail.ru', '15', 'kazan');
    assert.deepEqual(await getErrors(), ['Некорректный email']);
  });

  it('Возраст 13 → ошибка про возраст; возраст 14 → ошибки нет (проверка граничного значения)', async () => {
    await register('Иван', 'ivan@mail.ru', '13', 'kazan');
    assert.ok((await getErrors()).includes('Возраст должен быть от 14 до 100'));

    const age = await driver.findElement(By.id('age'));
    await age.clear();
    await age.sendKeys('14');
    await driver.findElement(By.id('submit')).click();
    assert.deepEqual(await getErrors(), []);
  });

  it('Имя из одной буквы → ошибка «Имя должно быть не короче 2 символов»', async () => {
    await register('И', 'ivan@mail.ru', '15', 'kazan');
    assert.deepEqual(await getErrors(), ['Имя должно быть не короче 2 символов']);
  });

  // БОНУС: найденный баг.
  // Форма проверяет только наличие символа @, поэтому принимает email "@"
  // без имени ящика и без домена. Тест специально падает - он показывает баг.
  it('БАГ: email «@» должен считаться некорректным', async () => {
    await register('Иван', '@', '15', 'kazan');
    assert.ok((await getErrors()).includes('Некорректный email'));
  });
});