import { Router } from 'express';

const router = Router();

const eventTypeValues = [
  'Кіносеанс',
  'Театральна вистава',
  'Опера',
  'Балет',
  'Концерт',
  'Фестиваль',
  'Стендап',
  'Імпровізаційне шоу',
  'Цирк',
  'Шоу ілюзіоніста',
  'Танцювальне шоу',
  'Кабаре',
  'Вечірка',
  'DJ-set',
  'Караоке-вечір',
  'Квіз',
  'Паб-квіз',
  'Вікторина',
  'Квест-кімната',
  'Міський квест',
  'Вечір настільних ігор',
  'Кіберспорт',
  'Турнір з ігор',
  'Спортивний матч',
  'Виставка',
  'Музейна подія',
  'Лекція',
  'Публічна дискусія',
  'Майстер-клас',
  'Літературний вечір',
  'Поетичні читання',
  'Автограф-сесія',
  'Кінопоказ просто неба',
  'Open mic',
  'Ярмарок',
  'Маркет',
  'Дегустація',
  'Презентація',
  'Тематична вечірка',
  'Парк атракціонів',
  'Аквапарк',
  'Прогулянка на кораблику',
  'Екскурсія',
  'Світлове шоу',
  'Шоу дронів',
  'Феєрверк',
  'Святковий салют',
  'Сезонний ярмарок',
  'Фан-зустріч',
  'Планетарій',
  'Наукове шоу',
  'Інше',
];

const idParam = (name: string, description: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
});

const jsonBody = (schema: unknown) => ({
  required: true,
  content: {
    'application/json': {
      schema,
    },
  },
});

const paginationParameters = [
  {
    name: 'page',
    in: 'query',
    description: 'Номер сторінки. Починається з 1.',
    schema: { type: 'integer', default: 1, minimum: 1 },
  },
  {
    name: 'perPage',
    in: 'query',
    description: 'Кількість подій на сторінці.',
    schema: { type: 'integer', default: 10, minimum: 1 },
  },
];

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Dnipro Slay API',
    version: '3.0.0',
    description:
      'Документація REST API для подій, авторизації та збережених подій.',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Auth', description: 'Реєстрація, логін і керування сесією' },
    { name: 'Events', description: 'Події, пошук, фільтри та імпорт' },
    { name: 'Saved events', description: 'Обране користувача' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      AuthCredentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          userId: { type: 'string' },
        },
      },
      AuthSession: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
        },
      },
      Coordinates: {
        type: 'object',
        properties: {
          latitude: { type: 'number', nullable: true },
          longitude: { type: 'number', nullable: true },
        },
      },
      Event: {
        type: 'object',
        required: [
          'title',
          'description',
          'image',
          'url',
          'typeOfEvent',
          'place',
          'price',
          'duration',
          'site',
        ],
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          dateTime: { type: 'string', format: 'date-time', nullable: true },
          image: { type: 'string', format: 'uri' },
          url: { type: 'string', format: 'uri' },
          typeOfEvent: { type: 'string', enum: eventTypeValues },
          place: { type: 'string' },
          minPrice: { type: 'number', nullable: true, minimum: 0 },
          maxPrice: { type: 'number', nullable: true, minimum: 0 },
          price: { type: 'number', minimum: 0 },
          duration: { type: 'string' },
          site: { type: 'string' },
          coordinates: { $ref: '#/components/schemas/Coordinates' },
          viewsCount: {
            type: 'integer',
            minimum: 0,
            description: 'Кількість переглядів події.',
            default: 0,
          },
          savedCount: {
            type: 'integer',
            minimum: 0,
            description: 'Кількість додавань події в обране.',
            default: 0,
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      EventsPage: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          perPage: { type: 'integer' },
          totalPages: { type: 'integer' },
          totalItems: { type: 'integer' },
          hasNextPage: {
            type: 'boolean',
            description: 'true, якщо існує наступна сторінка.',
          },
          hasPreviousPage: {
            type: 'boolean',
            description: 'true, якщо існує попередня сторінка.',
          },
          events: {
            type: 'array',
            items: { $ref: '#/components/schemas/Event' },
          },
        },
      },
      SavedEvent: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          eventId: {
            oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Event' }],
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      SaveEventRequest: {
        type: 'object',
        required: ['userId', 'eventId'],
        properties: {
          userId: { type: 'string' },
          eventId: { type: 'string' },
        },
      },
      ToggleSavedEventResponse: {
        type: 'object',
        properties: {
          saved: { type: 'boolean' },
          savedEvent: { $ref: '#/components/schemas/SavedEvent' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Зареєструвати користувача',
        requestBody: jsonBody({ $ref: '#/components/schemas/RegisterRequest' }),
        responses: {
          '201': {
            description: 'Користувача створено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Увійти в акаунт',
        requestBody: jsonBody({ $ref: '#/components/schemas/AuthCredentials' }),
        responses: {
          '200': {
            description: 'Токени сесії',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSession' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Вийти з акаунта',
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody({
          type: 'object',
          properties: { refreshToken: { type: 'string' } },
        }),
        responses: {
          '200': {
            description: 'Успішний вихід',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Оновити сесію через refresh token',
        requestBody: jsonBody({
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        }),
        responses: {
          '200': {
            description: 'Оновлені токени',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSession' },
              },
            },
          },
          '400': {
            description: 'Refresh token не передано',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/auth/reset/request': {
      post: {
        tags: ['Auth'],
        summary: 'Запит скидання пароля',
        requestBody: jsonBody({
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        }),
        responses: {
          '501': {
            description: 'Надсилання листів для скидання пароля не налаштоване',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/auth/reset/confirm': {
      post: {
        tags: ['Auth'],
        summary: 'Скидання пароля',
        requestBody: jsonBody({
          type: 'object',
          required: ['email', 'newPassword'],
          properties: {
            email: { type: 'string', format: 'email' },
            newPassword: { type: 'string', format: 'password' },
          },
        }),
        responses: {
          '501': {
            description: 'Скидання пароля не налаштоване',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'Отримати список подій',
        description:
          'Повертає сторінку подій. Для пагінації використовуйте `page` і `perPage`; відповідь містить metadata `totalPages`, `totalItems`, `hasNextPage` і `hasPreviousPage`.',
        parameters: [
          ...paginationParameters,
          {
            name: 'sortField',
            in: 'query',
            schema: { type: 'string', default: 'dateTime' },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
          },
          { name: 'title', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          {
            name: 'typeOfEvent',
            in: 'query',
            schema: { type: 'string', enum: eventTypeValues },
          },
          { name: 'place', in: 'query', schema: { type: 'string' } },
          { name: 'site', in: 'query', schema: { type: 'string' } },
          {
            name: 'from',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'to',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
          },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
        ],
        responses: {
          '200': {
            description: 'Сторінка подій',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventsPage' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Створити подію',
        requestBody: jsonBody({ $ref: '#/components/schemas/Event' }),
        responses: {
          '201': {
            description: 'Подію створено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
        },
      },
    },
    '/events/search': {
      get: {
        tags: ['Events'],
        summary: 'Пошук подій',
        description:
          'Пошук за заголовком, описом або місцем. Відповідь пагінована так само, як `GET /events`.',
        parameters: [
          { name: 'title', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          ...paginationParameters,
        ],
        responses: {
          '200': {
            description: 'Сторінка знайдених подій',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventsPage' },
              },
            },
          },
          '400': {
            description: 'Пошуковий запит не передано',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/events/popular': {
      get: {
        tags: ['Events'],
        summary: 'Отримати популярні події',
        description:
          'Повертає популярні майбутні події. Популярність рахується на сервері за сигналами інтересу: додавання в обране має більшу вагу, ніж перегляд (`savedCount * 3 + viewsCount`).',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Максимальна кількість популярних подій у відповіді.',
            schema: { type: 'integer', default: 10, minimum: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Популярні події',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
        },
      },
    },
    '/events/upcoming': {
      get: {
        tags: ['Events'],
        summary: 'Отримати майбутні події',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Майбутні події',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
        },
      },
    },
    '/events/{eventId}': {
      get: {
        tags: ['Events'],
        summary: 'Отримати подію за id',
        parameters: [idParam('eventId', 'ID події')],
        responses: {
          '200': {
            description: 'Подія',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          '404': {
            description: 'Подію не знайдено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Events'],
        summary: 'Оновити подію',
        parameters: [idParam('eventId', 'ID події')],
        requestBody: jsonBody({ $ref: '#/components/schemas/Event' }),
        responses: {
          '200': {
            description: 'Оновлена подія',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Event' },
              },
            },
          },
          '404': {
            description: 'Подію не знайдено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Видалити подію',
        parameters: [idParam('eventId', 'ID події')],
        responses: {
          '200': {
            description: 'Подію видалено',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    event: { $ref: '#/components/schemas/Event' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Подію не знайдено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/events/{eventId}/coordinates': {
      get: {
        tags: ['Events'],
        summary: 'Отримати координати події',
        parameters: [idParam('eventId', 'ID події')],
        responses: {
          '200': {
            description: 'Координати події',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Coordinates' },
              },
            },
          },
          '404': {
            description: 'Подію не знайдено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/events/parse-events': {
      post: {
        tags: ['Events'],
        summary: 'Створити події з HTML-фрагментів',
        requestBody: jsonBody({
          type: 'object',
          required: ['htmlItem'],
          properties: {
            htmlItem: {
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } },
              ],
            },
          },
        }),
        responses: {
          '200': {
            description: 'Успішно створені події',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Event' },
                },
              },
            },
          },
        },
      },
    },
    '/saved-events/user/{userId}': {
      get: {
        tags: ['Saved events'],
        summary: 'Отримати збережені події користувача',
        security: [{ bearerAuth: [] }],
        parameters: [idParam('userId', 'ID користувача')],
        responses: {
          '200': {
            description: 'Збережені події',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/SavedEvent' },
                },
              },
            },
          },
        },
      },
    },
    '/saved-events/user/{userId}/status/{eventId}': {
      get: {
        tags: ['Saved events'],
        summary: 'Перевірити, чи подія збережена',
        security: [{ bearerAuth: [] }],
        parameters: [
          idParam('userId', 'ID користувача'),
          idParam('eventId', 'ID події'),
        ],
        responses: {
          '200': {
            description: 'Статус збереження',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { saved: { type: 'boolean' } },
                },
              },
            },
          },
        },
      },
    },
    '/saved-events': {
      post: {
        tags: ['Saved events'],
        summary: 'Додати подію в обране',
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody({
          $ref: '#/components/schemas/SaveEventRequest',
        }),
        responses: {
          '201': {
            description: 'Подію збережено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SavedEvent' },
              },
            },
          },
        },
      },
    },
    '/saved-events/toggle': {
      post: {
        tags: ['Saved events'],
        summary: 'Додати або прибрати подію з обраного',
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody({
          $ref: '#/components/schemas/SaveEventRequest',
        }),
        responses: {
          '200': {
            description: 'Результат перемикання',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ToggleSavedEventResponse',
                },
              },
            },
          },
        },
      },
    },
    '/saved-events/{savedEventId}': {
      delete: {
        tags: ['Saved events'],
        summary: 'Видалити збережену подію',
        security: [{ bearerAuth: [] }],
        parameters: [idParam('savedEventId', 'ID запису saved event')],
        responses: {
          '200': {
            description: 'Збережену подію видалено',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    savedEvent: { $ref: '#/components/schemas/SavedEvent' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Збережену подію не знайдено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
  },
};

const swaggerHtml = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dnipro Slay API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #ffffff; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/docs/swagger.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
    </script>
  </body>
</html>`;

router.get(['', '/'], (_req, res) => {
  res.type('html').send(swaggerHtml);
});

router.get('/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});

export default router;
