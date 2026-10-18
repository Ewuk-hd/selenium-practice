import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Builder, By, Key, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const PAGE_URL = pathToFileURL(
  path.join(import.meta.dirname, '..', 'app', 'todo.html')
).href;

describe('Список дел', () => {
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

  async function addTask(text) {
    await driver.findElement(By.id('new-task')).sendKeys(text);
    await driver.findElement(By.id('add-btn')).click();
  }

  async function getTasks() {
    return driver.findElements(By.css('#task-list li'));
  }

  async function getTaskTexts() {
    const spans = await driver.findElements(By.css('#task-list li .text'));
    const texts = [];
    for (const span of spans) {
      texts.push(await span.getText());
    }
    return texts;
  }

  async function getCount() {
    return driver.findElement(By.id('count')).getText();
  }

  it('При открытии список пуст (0 элементов li), а счётчик показывает «Задач: 0»', async () => {
    assert.equal((await getTasks()).length, 0);
    assert.equal(await getCount(), 'Задач: 0');
  });

  it('После добавления задачи «Купить хлеб» в списке один элемент с таким текстом', async () => {
    await addTask('Купить хлеб');
    assert.deepEqual(await getTaskTexts(), ['Купить хлеб']);
  });

  it("После добавления задачи поле ввода становится пустым (getAttribute('value') равен '')", async () => {
    await addTask('Купить хлеб');
    const input = await driver.findElement(By.id('new-task'));
    assert.equal(await input.getAttribute('value'), '');
  });

  it('Три добавленные задачи → 3 элемента и «Задач: 3»', async () => {
    await addTask('Первая');
    await addTask('Вторая');
    await addTask('Третья');
    assert.equal((await getTasks()).length, 3);
    assert.equal(await getCount(), 'Задач: 3');
  });

  it('Удаление второй из трёх задач → осталось 2, и среди них нет удалённой', async () => {
    await addTask('Первая');
    await addTask('Вторая');
    await addTask('Третья');

    const tasks = await getTasks();
    await tasks[1].findElement(By.css('.delete')).click();

    const texts = await getTaskTexts();
    assert.equal(texts.length, 2);
    assert.ok(!texts.includes('Вторая'));
    assert.equal(await getCount(), 'Задач: 2');
  });

  it('Пустая строка и строка из пробелов не добавляются', async () => {
    await addTask('');
    await addTask('   ');
    assert.equal((await getTasks()).length, 0);
    assert.equal(await getCount(), 'Задач: 0');
  });

  it('Задачу можно добавить клавишей Enter, без нажатия кнопки', async () => {
    await driver.findElement(By.id('new-task')).sendKeys('Сделать уроки', Key.ENTER);
    assert.deepEqual(await getTaskTexts(), ['Сделать уроки']);
  });
});