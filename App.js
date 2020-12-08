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
        headless: true,
        userDataDir: 'wd',
        ignoreHTTPSErrors: true,
        args: args,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: '/opt/google/chrome/chrome',
    }

    const browser = await puppeteer.launch(config);
    const PP = await browser.newPage();
    const CP = await browser.newPage();

    console.time('render-init-page');
    await PP.goto("https://shopee.co.id/buyer/login", {waitUntil: "networkidle2"});
    await PP.goto("https://shopee.co.id/%E2%9D%A4%EF%B8%8FGlamouroseshop%E2%9D%A4%EF%B8%8FMake-Over-Color-Hypnose-Creamy-Lipmatte-i.29291937.5647214160", {waitUntil: "domcontentloaded"});
    await CP.goto("https://shopee.co.id/cart", {waitUntil: "domcontentloaded"});
    console.timeEnd('render-init-page');

    // timout
    await Timeout('37:50');

    // reload
    console.time('render product page');
    await PP.goto("https://shopee.co.id/%E2%9D%A4%EF%B8%8FGlamouroseshop%E2%9D%A4%EF%B8%8FMake-Over-Color-Hypnose-Creamy-Lipmatte-i.29291937.5647214160", {waitUntil: "domcontentloaded"});
    console.timeEnd('render product page');

    // waiting atc
    console.time('waiting atc')
    await PP.waitForSelector('.product-bottom-panel__add-to-cart');
    console.timeEnd('waiting atc')

    await PP.click('.product-bottom-panel__add-to-cart');
    
    // setup category
    console.time('setup category')
    await PP.evaluate(() => {


        return new Promise((res, rej) => {
            function strcov(str) {
                return str.toLowerCase().replace(/[^a-z-0-9]+/g, '');
            }

            var categories;
            var sizeCat;
            var subCatName1 = '02 FLIRT'.toLowerCase().replace(/[^a-z-0-9]+/g, '');

            var search = setInterval(() => {
                categories = document.querySelectorAll('._1AG6vA');
                sizeCat = categories.length;

                if (sizeCat != 0) {
                    // loop categories
                    for (var i = 0; i < sizeCat; i++) {
                        if (i == 0) {
                            var subCat = categories[i].querySelectorAll(':not(.EMBVFN)');
                            var subCatSize = subCat.length;
                            
                            // loop sub categories
                            var subCatName;
                            for (var x = 0; x < subCatSize; x++) {
                                subCatName = strcov(subCat[x].textContent); 
                                console.log(strcov(subCatName))

                                if (subCatName == subCatName1) {
                                    subCat[x].click()
                                    document.querySelector('.stardust-button--block').click();
                                    break;
                                }
                            }
                        }
                    }
                    // end loop
                    clearInterval(search);
                    res('done');
                }
            });
        });
    });
    console.timeEnd('setup category')


    // +++++++++++++++++++ cart ++++++++++++++++++++++++
    console.time('reload-cart');
    await CP.goto("https://shopee.co.id/cart", {waitUntil: "domcontentloaded"});
    console.timeEnd('reload-cart');


    // waiting cb
    console.time('waiting-cb');
    await CP.evaluate(() => {
        return new Promise((res, rej) => {
            let cb;

            let finding = setInterval(() => {
                cb = document.querySelector('.stardust-checkbox__input');

                if (cb != null) {
                    res(true);
                    clearInterval(finding);
                }
            });
        });
    });
    console.timeEnd('waiting-cb');

    // finding product
    console.time('finding-product');
    let targetName = '❤️Glamouroseshop❤️Make Over Color Hypnose Creamy Lipmatte';
    await CP.evaluate((targetName) => {
        return new Promise((res, rej) => {
            var productCart = document.querySelectorAll('._17hSZB');
            var productCartSize = productCart.length;
            var targetNameConv = targetName.toLowerCase().replace(/[^a-z]/g, '');

            for (let i = 0; i < productCartSize; i++) {

                let productName = productCart[i].querySelector('._3OP3bk').textContent.toLowerCase().replace(/[^a-z]/g, '');
                if (productName == targetNameConv) {
                    productCart[i].querySelector('.stardust-checkbox__input').click();
                    res(true)
                    break;
                }
            }
        });
    }, targetName);
    console.timeEnd('finding-product');

    await CP.screenshot({path: './public/cart.png'})

    // click checkout button
    await CP.evaluate(() => {
        document.querySelector('.stardust-button--primary').click();
    });

    // wait pay button
    console.time('waiting-pay')
    await CP.evaluate(() => {
        return new Promise((res, rej) => {
            let cb;

            let finding = setInterval(() => {
                cb = document.querySelector('.page-checkout-place-order-section__button');

                if (cb != null) {
                    res(true);
                    clearInterval(finding);
                }
            });
        });
    });
    console.timeEnd('waiting-pay')

    console.log('waiting ready pay')
    console.time('waiting-ready-pay')
    await CP.evaluate(() => {
        return new Promise((res, rej) => {
            let price;
            let payBtn;
            let waitLimit = 15000;
            let waitCount = 0;

            let finding = setInterval(() => {
                price = document.querySelector('.page-checkout-total-payment__price');
                waitCount += 100;

                console.log(waitCount);

                if (waitCount >= waitLimit) {
                    rej('waiting price timeout 15000');
                    clearInterval(finding);
                }

                if (price.textContent != 'Rp') {
                    payBtn = document.querySelector('.page-checkout-place-order-section__button');
                    // payBtn.click();
                    res('pay found');
                    clearInterval(finding);
                }
            }, 100);
        });
    });
    console.timeEnd('waiting-ready-pay')
    // ++++++++++++++++++++ cart end +++++++++++++++++++

    await CP.screenshot({path: './public/pay.png'})
    await browser.close();
    
}

App();
