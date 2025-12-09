import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique:true,
    },
    description: {
      type: String,
      required: true,
    },
    dateTime: {
      type: Date,
      required: false,
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    typeOfEvent: {
      type: String,
      required: true,
      enum: ["Кіносеанс","Театральна вистава","Опера","Балет","Концерт","Фестиваль","Стендап","Імпровізаційне шоу","Цирк","Шоу ілюзіоніста","Танцювальне шоу","Кабаре","Вечірка","DJ-set","Караоке-вечір","Квіз","Паб-квіз","Вікторина","Квест-кімната","Міський квест","Вечір настільних ігор","Кіберспорт","Турнір з ігор","Спортивний матч","Виставка","Музейна подія","Лекція","Публічна дискусія","Майстер-клас","Літературний вечір","Поетичні читання","Автограф-сесія","Кінопоказ просто неба","Open mic","Ярмарок","Маркет","Дегустація","Презентація","Тематична вечірка","Парк атракціонів","Аквапарк","Прогулянка на кораблику","Екскурсія","Світлове шоу","Шоу дронів","Феєрверк","Святковий салют","Сезонний ярмарок","Фан-зустріч","Планетарій","Наукове шоу", 'Інше'],
      default: 'Інше'
    },
    place: {
      type: String,
      required: true,
    },
    minPrice: {
      type: Number,
      required: false,
      min: 0,
    },
    maxPrice: {
      type: Number,
      required: false,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    site: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

eventSchema.index({ title: 1 });

export type Event = InferSchemaType<typeof eventSchema>;
export type EventType = "Кіносеанс" |"Театральна вистава" |"Опера" |"Балет" |"Концерт" |"Фестиваль" |"Стендап" |"Імпровізаційне шоу" |"Цирк" |"Шоу ілюзіоніста" |"Танцювальне шоу" |"Кабаре" |"Вечірка" |"DJ-set" |"Караоке-вечір" |"Квіз" |"Паб-квіз" |"Вікторина" |"Квест-кімната" |"Міський квест" |"Вечір настільних ігор" |"Кіберспорт" |"Турнір з ігор" |"Спортивний матч" |"Виставка" |"Музейна подія" |"Лекція" |"Публічна дискусія" |"Майстер-клас" |"Літературний вечір" |"Поетичні читання" |"Автограф-сесія" |"Кінопоказ просто неба" |"Open mic" |"Ярмарок" |"Маркет" |"Дегустація" |"Презентація" |"Тематична вечірка" |"Парк атракціонів" |"Аквапарк" |"Прогулянка на кораблику" |"Екскурсія" |"Світлове шоу" |"Шоу дронів" |"Феєрверк" |"Святковий салют" |"Сезонний ярмарок" |"Фан-зустріч" |"Планетарій" |"Наукове шоу" | 'Інше';
export type EventDocument = HydratedDocument<Event>;

export const EventCollection = model<Event>("events" , eventSchema);
