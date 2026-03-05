const browser = 'chrome'; //firefox, EDGE, chrome

async function pause(driver) {
    await driver.manage().setTimeouts({ implicit: 10000 }); // Неявное время ожидания (implicit wait): Неявное время ожидания - это время, которое WebDriver ожидает до того, как выдать ошибку, если элемент не найден. Это позволяет избежать слишком быстрых запросов к элементам на странице, пока они еще не загружены или не появились на странице. 
    await driver.sleep(3000); // пауза между действиями
}

async function afterHook(driver) {
    // Здесь вы можете добавить логику для закрытия браузера или оставить его открытым
    await driver.quit(); // quit, sleep Закрытие браузера
}

module.exports = { browser, pause, afterHook };