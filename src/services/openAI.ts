import OpenAI from 'openai';
import { env } from '../utils/env.js';
import { parseJSON } from '../utils/parseJson.js';

interface OpenAiMessage {
    role: 'system' | 'user';
    content: string;
}
interface OpenAiProps{
    messages: OpenAiMessage[];
    temperature?: number;
    max_tokens?: number;
}
export const getGPTAnswer = async (options: OpenAiProps) => {
    const model = 'gpt-4o-mini';
    const token = env('TOKEN');
    const openai = new OpenAI({ apiKey: token });
  
  try {
    const chat = await openai.chat.completions.create({ model, ...options });
    return chat.choices?.[0]?.message?.content ?? '';
  } catch (err) {
    console.error('OpenAI error:', err);
    throw err;
  }
};


export const convertToEvent = async (info: string) => {
    const prompt = `
Ти — сервіс нормалізації подій. 
На основі наданого тексту витягни та заповни обʼєкт події СУВОРО у форматі JSON, який ПОВИНЕН відповідати цій схемі:

{
  "title": String (обовʼязково),
  "description": String (обовʼязково),
  "dateTime": Date (обовʼязково, формат ISO 8601),
  "image": String (обовʼязково, валідний URL),
  "url": String (обовʼязково, валідний URL),
  "typeOfEvent": String (обовʼязково),
  "place": String (обовʼязково),
  "minPrice": Number (обовязково, ≥ 0),
  "maxPrice": Number (обовязково, ≥ 0),
  "price": Number (обовʼязково, ≥ 0),
  "duration": String (обовʼязково),
  "site": String (обовʼязково)
}

Типи подій: Кіносеанс, Театральна вистава, Опера, Балет, Концерт, Фестиваль, Стендап, Імпровізаційне шоу, Цирк, Шоу ілюзіоніста, Танцювальне шоу, Кабаре, Вечірка, DJ-set, Караоке-вечір, Квіз, Паб-квіз, Вікторина, Квест-кімната, Міський квест, Вечір настільних ігор, Кіберспорт, Турнір з ігор, Спортивний матч, Виставка, Музейна подія, Лекція, Публічна дискусія, Майстер-клас, Літературний вечір, Поетичні читання, Автограф-сесія, Кінопоказ просто неба, Open mic, Ярмарок, Маркет, Дегустація, Презентація, Тематична вечірка, Парк атракціонів, Аквапарк, Прогулянка на кораблику, Екскурсія, Світлове шоу, Шоу дронів, Феєрверк, Святковий салют, Сезонний ярмарок, Фан-зустріч, Планетарій, Наукове шоу, Інше.

СТРОГІ ПРАВИЛА:
1. Відповідь ПОВИННА містити ТІЛЬКИ валідний JSON, без пояснень, без markdown, без коментарів.
2. Всі поля повинні бути заповнені згідно обовʼязковості.
3. Якщо minPrice або maxPrice відсутні в даних — додавай ці поля з таким же значенням як і price.
4. Всі числа повинні бути типу Number, не рядок.
5. dateTime ПОВИНЕН бути в ISO форматі: YYYY-MM-DDTHH:mm:ss.sssZ
6. Якщо ціна одна — вона йде в поле "price".
7. Якщо є діапазон цін — price = minPrice.
8. Якщо тривалість не вказана — визнач її логічно (наприклад: "2 hours", "1 day").
9. Поля image та url ПОВИННІ містити прямі URL.
10. site — це домен або назва сайту-джерела.
11. Якщо якесь обовʼязкове поле НЕМОЖЛИВО визначити — ВСТАВ null, а не вигадуй. Виключення Description. Якщо опису немає може самостійно створити дуже короткий опис події.
`

    const data:OpenAiProps  = {
        messages: [
            {role: 'system', content: prompt},
            {role: 'user', content: info},
        ],
        max_tokens: 12000,
    }
    
    const res = await getGPTAnswer(data);
    return parseJSON(res);
}