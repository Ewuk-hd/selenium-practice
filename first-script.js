// 1. Подключаем нужные инструменты
import { Builder, By, until } from 'selenium-webdriver';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// 2. Собираем адрес нашей страницы (file:///.../app/index.html)
const pageUrl = pathToFileURL(path.join(import.meta.dirname, 'app', 'index.html')).href;

// 3. Запускаем браузер Chrome
const driver = await new Builder().forBrowser('chrome').build();

try {
  // 4. Открываем страницу
  await driver.get(pageUrl);
  console.log('Заголовок страницы:', await driver.getTitle());

  // 5. Находим поля и вводим текст
  await driver.findElement(By.id('username')).sendKeys('student');
  await driver.findElement(By.id('password')).sendKeys('12345');

  // 6. Нажимаем кнопку
  await driver.findElement(By.id('login-btn')).click();

  // 7. Ждём (не дольше 3 секунд), пока сообщение станет видимым
  const message = await driver.findElement(By.id('message'));
  await driver.wait(until.elementIsVisible(message), 3000);
  console.log('Сообщение на странице:', await message.getText());

  // 8. Пауза 2 секунды, чтобы ты успел посмотреть на результат
  await driver.sleep(2000);
} finally {
  // 9. Закрываем браузер ВСЕГДА, даже если была ошибка
  await driver.quit();
}