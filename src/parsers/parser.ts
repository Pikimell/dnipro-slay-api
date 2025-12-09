import { chromium } from "playwright";
import { convertToEvent } from "../services/openAI.js";
import { EventCollection } from "../database/models/event.js";

export const quicklyParseItems = async (url: string, selector: string) => {
  console.log("Launch");
  
    const browser = await chromium.launch({ headless: true });
    console.log("OpenPage");
  const page = await browser.newPage();

  try {
    console.log('WAIT FOR LOAD');
    
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 250_000 });
 console.log('WAIT FOR SELECTOR');
    // якщо елемент підвантажується не одразу — дочекаємось
    await page.waitForSelector(selector, { state: "attached", timeout: 25_000 });

    // аналог root.textContent
    const fullText = await page.evaluate(() =>
      (document.documentElement?.textContent ?? "").trim()
    );

    // аналог item?.textContent
    const itemText = await page.$eval(
      selector,
      (el) => (el.textContent ?? "").trim()
    );

    console.log(fullText);
    console.log(itemText);
  } catch (e) {

    console.error(e);
  } finally {
    await page.close();
    await browser.close();
  }
};

export const parseItems = async (htmlItem: string | string[]) => {
  let items: string[] = [];
  if(typeof htmlItem === 'string'){
    items.push(htmlItem)
  }else{
    items = htmlItem
  }

  const itemsPromis = items.map(parseItem)
  const res = await Promise.allSettled(itemsPromis);
  return res.filter(el=>el.status === 'fulfilled').map(el=>el.value);
}

const parseItem = async (html:string)=>{
    const re = /<a[^>]*\bclass="[^"]*\bblock-info__title\b[^"]*"[^>]*\btitle="([^"]+)"/;
    const match = html.match(re);

    if (match) {
     const title =match[1];
     const item = await EventCollection.findOne({title: title}) 
     if(item) {
      throw new Error('skip')
      }
    }
  return await convertToEvent(html);
}