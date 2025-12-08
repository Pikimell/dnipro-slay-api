import { convertToEvent } from "../services/openAI.js"
import { quicklyParseItems } from "./parser.js"

const SELECTOR = '.gcell.gcell--12.gcell--md-6 > .certificate-block'
const URL = 'https://kava.ua/uk/dnepr/certificates?disable-city=0&city%5B1%5D=1&min-price=0&max-price=27000'

export async function parseKavaItems(){
    const res = await quicklyParseItems(URL, SELECTOR)
    
}


//!======================================================


/* 
const items = document.querySelectorAll('.gcell.gcell--12.gcell--md-6 > .certificate-block');
const itemsValue = [...items].map(el=>el.innerHTML).slice(0,2);
function save(htmlItem){
    const url = 'http://localhost:3000/events/parse-events';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({htmlItem})
    }
    fetch(url, options)
}
itemsValue.forEach(save)
 
*/