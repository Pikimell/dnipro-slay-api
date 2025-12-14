# Огляд API

Сервер працює поверх Express. Усі шляхи наведені відносно кореня (`/`). Тіло запитів і відповіді — JSON, якщо не зазначено інакше. Токени для мобільних клієнтів передаються в JSON-відповідях; доступ до захищених ресурсів очікує заголовок `Authorization: Bearer <accessToken>`.

## Формат події (`Event`)
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "dateTime": "ISO date | null",
  "image": "url string",
  "url": "url string",
  "typeOfEvent": "один із перелічених у схемі типів або \"Інше\"",
  "place": "string",
  "minPrice": "number | null",
  "maxPrice": "number | null",
  "price": "number",
  "duration": "string",
  "site": "string",
  "coordinates": {
    "latitude": "number | null",
    "longitude": "number | null"
  },
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Auth (`/auth`)
- `POST /auth/register` — реєстрація користувача (AWS Cognito), опціонально додавання до групи.  
  **Body:** `{ email: string, password: string, group?: string }`  
  **201:** `{ message: string, userSub: string }`

- `POST /auth/login` — логін у Cognito. Повертає токени для клієнта; кукі не використовуються.  
  **Body:** `{ email: string, password: string }`  
  **200:** `{ accessToken: string, refreshToken: string, idToken: string, tokenType: "Bearer" }`

- `POST /auth/logout` — вихід (статусний, без кукі).  
  **200:** `{ message: "Logged out successfully!" }`

- `POST /auth/refresh` — оновлення сесії у Cognito за refresh-токеном.  
  **Body:** `{ refreshToken: string }`  
  **200:** `{ accessToken: string, refreshToken: string, idToken: string, tokenType: "Bearer" }`  
  **400:** `{ message: "Missing refreshToken" }`

- `POST /auth/reset/request` — ініціює відправку листа для скидання пароля.  
  **Body:** `{ email: string }`  
  **200:** `{ message: "Password reset email sent" }`

- `POST /auth/reset/confirm` — підтвердження коду та встановлення нового пароля.  
  **Body:** `{ email: string, code: string, newPassword: string }`  
  **200:** `{ message: "Password successfully reset" }`

- `POST /auth/confirm` — підтвердження email у Cognito.  
  **Body:** `{ email: string, code: string }`  
  **200:** `{ message: "Email confirmed successfully!" }`

## Події (`/events`)
- `GET /events` — отримати список подій з пагінацією та фільтрами.  
  **Query (пагінація/сортування):** `page` (default 1), `perPage` (default 10), `sortField` (default `dateTime`), `sortOrder` (`asc|desc`, default `asc`).  
  **Query (фільтри):** `title` або `q`, `typeOfEvent`, `place`, `site`, `from` (ISO дата), `to` (ISO дата), `minPrice`, `maxPrice`.  
  **200:** `{ page, perPage, totalPages, totalItems, hasNextPage, hasPreviousPage, events: Event[] }`

- `GET /events/:eventId` — отримати подію за ідентифікатором.  
  **200:** `Event`  
  **404:** `{ message: "Event not found" }`

- `GET /events/upcoming` — майбутні події (дата `>= now`).  
  **Query:** `limit` (default `perPage` з пагінації або 10).  
  **200:** `Event[]` (відсортовані за `dateTime` зростанням)

- `GET /events/search` — пошук за заголовком/описом/місцем.  
  **Query:** `title` або `q` (обовʼязковий непорожній), `limit` (default 15 або `perPage`). Інші фільтри з `/events` ігноруються.  
  **200:** `Event[]` (відсортовані за `dateTime` зростанням)  
  **400:** `{ message: "Missing search query" }`

- `GET /events/:eventId/coordinates` — отримати координати події. Якщо координати вже збережені, повертаються одразу. Якщо ні — виконується геокодування локації в місті Дніпро (Україна); знайдені координати зберігаються в події. Якщо місце не знайдено, повертається центр міста Дніпро.  
  **200:** `{ latitude: number, longitude: number }`  
  **404:** `{ message: "Event not found" }`

- `POST /events` — створити подію.  
  **Body:** `Event` без службових полів (`_id`, `createdAt`, `updatedAt` генерує БД).  
  **201:** створена `Event`

- `PUT /events/:eventId` — часткове або повне оновлення події.  
  **Body:** частковий `Event`  
  **200:** оновлена `Event`  
  **404:** `{ message: "Event not found" }`

- `DELETE /events/:eventId` — видалити подію.  
  **200:** `{ message: "Event deleted", event: Event }`  
  **404:** `{ message: "Event not found" }`

- `POST /events/parse-events` — масове створення подій з HTML-фрагментів через парсер.  
  **Body:** `{ htmlItem: string | string[] }`  
  **200:** `Event[]` (тільки успішно створені)

## Збережені події (`/saved-events`)
- `GET /saved-events/user/:userId` — список збережених подій користувача (новіші першими).  
  **200:** масив документів savedEvent з популяцією `eventId` (`Event`)

- `GET /saved-events/user/:userId/status/:eventId` — перевірити, чи збережена подія користувачем.  
  **200:** `{ saved: boolean }`

- `POST /saved-events` — додати подію в обране користувача.  
  **Body:** `{ userId: string, eventId: string }`  
  **201:** створений savedEvent документ

- `POST /saved-events/toggle` — додати або прибрати подію з обраного.  
  **Body:** `{ userId: string, eventId: string }`  
  **200:** `{ saved: boolean, savedEvent?: object }` (`savedEvent` тільки коли щойно додано)

- `DELETE /saved-events/:savedEventId` — прибрати збережену подію.  
  **200:** `{ message: "Saved event removed", savedEvent: object }`  
  **404:** `{ message: "Saved event not found" }`
