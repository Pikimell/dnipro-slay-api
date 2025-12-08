import { quicklyParseItems } from "./parser.js";

const SELECTOR = '#events-list';// console.log('WAIT FOR LOAD');
const urlList = [
    'https://dnepr.kontramarka.ua/uk/concert/dnepropetrovskaa-filarmonia-im-lbkogana-178.html',
    'https://dnepr.kontramarka.ua/uk/concert/planetarium-noosphere-2654.html',
    'https://dnepr.kontramarka.ua/uk/concert/koncert-holl-opera-concert-hall-opera-367.html',
    'https://dnepr.kontramarka.ua/uk/concert/dk-masinostroitelej-187.html',
    'https://dnepr.kontramarka.ua/uk/concert/dk-sinnik-183.html',
    'https://dnepr.kontramarka.ua/uk/concert/dnepropetrovskij-akademiceskij-teatr-opery-i-baleta-103.html',
    'https://dnepr.kontramarka.ua/uk/concert/dnepropetrovskij-akademiceskij-teatr-russkoj-dramy-im-m-gorkogo-174.html',
    'https://dnepr.kontramarka.ua/uk/theatre/dk-sinnik-183.html',
    'https://dnepr.kontramarka.ua/uk/theatre/dnepropetrovskij-akademiceskij-teatr-opery-i-baleta-103.html',
    'https://dnepr.kontramarka.ua/uk/theatre/dnepropetrovskij-akademiceskij-teatr-russkoj-dramy-im-m-gorkogo-174.html',
    'https://dnepr.kontramarka.ua/uk/circus/dnepropetrovskij-akademiceskij-teatr-opery-i-baleta-103.html',
    'https://dnepr.kontramarka.ua/uk/filarmony/dnepropetrovskaa-filarmonia-im-lbkogana-178.html',
    'https://kontramarka.ua/uk/standUp/budinok-na-troickij-1892.html',
    'https://dnepr.kontramarka.ua/uk/standUp/nobelmusehall-2565.html',
    'https://dnepr.kontramarka.ua/uk/standUp/first-wave-pizza-bar-2223.html',
    'https://dnepr.kontramarka.ua/uk/standUp/dk-sinnik-183.html',
    'https://dnepr.kontramarka.ua/uk/black-friday/dnepropetrovskij-akademiceskij-teatr-russkoj-dramy-im-m-gorkogo-174.html',
    'https://dnepr.kontramarka.ua/uk/black-friday/dk-masinostroitelej-187.html',
    'https://dnepr.kontramarka.ua/uk/concert/dnepropetrovskaa-filarmonia-im-lbkogana-178.html',
]

export async function parseKontramarkaItems(){
    const res = await quicklyParseItems(urlList[0], SELECTOR)
    
}

