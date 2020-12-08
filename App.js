const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
var moment = require('moment-timezone');

/**
 * Timeout order
 */
const Timeout = (timeout) => {
    console.log('Running timer');
    return new Promise((resolve, reject) => {
        let now;
        let timer = setInterval(() => {
            now = moment().tz("Asia/Jakarta").format('mm:ss');

            if (now == timeout) {
                resolve('starting order');
                clearInterval(timer);
            }
        });
    });
}

const App = async () => {
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Android 8.1.0; Mobile; rv:61.0) Gecko/61.0 Firefox/61.0"',
    ];

    let config = {
        headless: false,
        userDataDir: '/tmp/wd',
        ignoreHTTPSErrors: true,
        args: args,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: '/opt/google/chrome/chrome',
    }

    const browser = await puppeteer.launch(config);
    // const CP = await browser.newPage();
    const PP = await browser.newPage();

    console.time('render product page');
    await PP.goto("https://shopee.co.id/Reebok-SUBLITE-PRIME-Men's-Running-Shoes-Black-i.234490784.6927804397", {waitUntil: "domcontentloaded"});
    console.timeEnd('render product page');

    // timout
    await Timeout('36:30');

    // reload
    console.time('render product page');
    await PP.goto("https://shopee.co.id/Reebok-SUBLITE-PRIME-Men's-Running-Shoes-Black-i.234490784.6927804397", {waitUntil: "domcontentloaded"});
    console.timeEnd('render product page');

    // click the cart button
    
}

App();
