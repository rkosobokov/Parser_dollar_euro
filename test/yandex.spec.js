const { By, Key, Browser, until, Actions } = require('selenium-webdriver')
const { suite } = require('selenium-webdriver/testing')
const assert = require('assert')
//const { addScreenshotToReport } = require('mochawesome-screenshots') // Импортируем функцию addScreenshotToReport
//const addContext = require("mochawesome/addContext")
const { url } = require('inspector')
const { Builder } = require('selenium-webdriver');
const { browser, pause, afterHook } = require('../config/config');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require("path");
const { generateChart } = require('./generateChart'); // путь к вашему файлу CVG
const csvDir = path.resolve(process.cwd(), 'reports');
if (!fs.existsSync(csvDir)) {
    fs.mkdirSync(csvDir, { recursive: true });
}
const downloadDir = path.resolve(process.cwd(), 'downloads'); // Папка для скачивания
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
describe('Проверка yandex страницы', function () {
    let driver
    let browserOptions;
    browserOptions = new chrome.Options();
    // browserOptions.addArguments('--auto-open-devtools-for-tabs'); // открывает DevTools для вкладок
    //  browserOptions.addArguments('--window-size=1920,1080');


  //  browserOptions.addArguments('--start-maximized');
    browserOptions.addArguments("--headless");
    if (process.env.HEADLESS === 'true') {
    browserOptions.addArguments('--headless', '--no-sandbox', '--disable-gpu');
} // Добавляем headless режим для Chrome
    // broeserOptions.addArguments("--ignore-certificate-errors");
    browserOptions.addArguments('--allow-file-access-from-files');
    browserOptions.setUserPreferences({
        'download.default_directory': downloadDir,
        'download.prompt_for_download': false,
        'plugins.always_open_pdf_externally': false,
        'safebrowsing.enabled': true
    });


    before(async function () {
        const csvDir = path.resolve(process.cwd(), 'reports');
        if (!fs.existsSync(csvDir)) {
            fs.mkdirSync(csvDir, { recursive: true });
        }
        driver = await new Builder().forBrowser(browser).setChromeOptions(browserOptions).build();   // Установка браузера, берется из конфиг файла

    })
    beforeEach(async function () {

    })
    afterEach(async function () {
        await pause(driver);
    })
    after(async function () {
        await afterHook(driver);
        await generateChart();

    });

    it('Открытие главной страницы Яндекс', async function () {
        await driver.get('https://yandex.ru/');
        console.log('Страница Яндекс открыта');
    });
    it('Забрать доллар', async function () {
        // Попытка найти элемент с курсом доллара
        const elements = await driver.findElements(By.xpath('/html/body/div[8]/div[2]/div[1]/div/div[1]/div/div/div[1]/div[2]/div[1]/a[1]/span'));
        let dollarValue = 'Не найден';

        if (elements.length > 0) {
            dollarValue = await elements[0].getText();
        }

        // === ОЧИСТКА ЗНАЧЕНИЯ КУРСА ===
        let cleanRate = dollarValue;
        if (dollarValue !== 'Не найден') {
            cleanRate = dollarValue
                .replace(/\$/g, '')      // удаляем все символы $
                .replace(/\s+/g, '')     // удаляем все пробелы
            // .replace('.', ',');      // заменяем запятую на точку (для числа)
        }
        // Попытка найти элемент с курсом euro
        const elements1 = await driver.findElements(By.xpath('/html/body/div[8]/div[2]/div[1]/div/div[1]/div/div/div[1]/div[2]/div[1]/a[2]/span'));
        let euroValue = 'Не найден';

        if (elements1.length > 0) {
            euroValue = await elements1[0].getText();
        }

        // === ОЧИСТКА ЗНАЧЕНИЯ КУРСА ===
        let cleanRate1 = euroValue;
        if (euroValue !== 'Не найден') {
            cleanRate1 = euroValue
                .replace(/\€/g, '')      // удаляем все символы €
                .replace(/\s+/g, '')     // удаляем все пробелы
            // .replace('.', ',');      // заменяем запятую на точку (для числа)
        }


        // Подготавливаем данные даты
        const now1 = new Date();
        const moscowDate = now1.toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
            // hour: '2-digit',
            // minute: '2-digit',
            // second: '2-digit'
        }).replace(',', ''); // ← удаляем запятую после даты;
        // Подготавливаем данные времени
        const now2 = new Date();
        const moscowTime = now2.toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            //  year: 'numeric',
            //  month: '2-digit',
            //  day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(',', ''); // ← удаляем запятую после даты;

        // Путь к CSV
        const csvFilePath = path.join(csvDir, 'exchange_rates.csv');

        // Создаём CSV-запись
        const csvWriter = createCsvWriter({
            path: csvFilePath,
            header: [
                { id: 'timestamp', title: 'DATE' },
                { id: 'currency', title: 'Time' },
                { id: 'rateDollar', title: 'Dollar' },
                { id: 'rateEuro', title: 'Euro' }
            ],
            fieldDelimiter: ';', // ←←← КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
            append: fs.existsSync(csvFilePath) // дописывать, если файл уже есть
        });

        await csvWriter.writeRecords([{
            timestamp: moscowDate,
            currency: moscowTime,
            rateDollar: cleanRate, //dollarValue,
            rateEuro: cleanRate1 //dollarValue
        }]);

       
    });
})

//END