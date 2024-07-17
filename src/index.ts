import './scss/styles.scss';

import { HandleApi } from './components/handleAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { Basket } from './components/common/basket';
import { Modal } from './components/common//modal';
import { AppState, CatalogEvent } from './components/appState';
import { BasketItem, CatalogItem } from './components/card';
import { Order } from './components/order';
import { Success } from './components/common/success';
import { Page } from './components/page';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IItemCard, IOrderForm, IOrder } from './types';

const events = new EventEmitter();
const api = new HandleApi(API_URL, CDN_URL);

events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const appData = new AppState({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const contactsForm = new Order(cloneTemplate(contactsTemplate), events);
const paymentForm = new Order(cloneTemplate(orderTemplate), events);

// Изменились элементы каталога
events.on<CatalogEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price:
				item.price !== null ? item.price.toString() + ' синапсов' : 'Бесценно',
			category: item.category,
		});
	});

	page.counter = appData.getBasket().length;
});

events.on('card:select', (item: IItemCard) => {
	appData.setPreview(item);
});

// Изменился открытый товар
events.on('preview:changed', (item: IItemCard) => {
	const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => events.emit('item:add', item),
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price !== null ? item.price.toString() + ' синапсов' : '',
			status: {
				status: item.price === null || appData.basket.includes(item.id),
			},
		}),
	});
});

// Добавить товар в корзину
events.on('item:add', (item: IItemCard) => {
	appData.addItemToBasket(item);
	modal.close();
});

// Открыть корзину
events.on('basket:open', () => {
	const items = appData.getBasket().map((item, index) => {
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('item:remove', item),
		});

		return basketItem.render({
			index: index + 1,
			title: item.title,
			price: item.price.toString() + ' синапсов',
		});
	});

	modal.render({
		content: basket.render({
			items,
			total: appData.getTotal(),
		}),
	});
});

// Удалить товар из корзины
events.on('item:remove', (item: IItemCard) => {
	appData.removeItemFromBasket(item);
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
	const items = appData.getBasket();
	const itemsId = items.map((i) => i.id);
	appData.order.items = itemsId;
	api
		.createOrder({
			...appData.order,
			total: appData.getTotal(),
		})
		.then((result) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					events.emit('items:changed');
					events.emit('order:clear');
				},
			});

			modal.render({
				content: success.render({
					title: 'Заказ оформлен',
					description: !result.error
						? `Списано ${result.total} синапсов`
						: result.error,
				}),
			});
		})
		.catch(console.error);
});

// Очистить формы
events.on('order:clear', () => {
	appData.clearBasket();
	appData.clearOrder();
});

// Установить способ оплаты
events.on('payment:set', (data: { paymentMethod: string }) => {
	if (data.paymentMethod === 'cash') {
		data.paymentMethod = 'offline';
	}
	data.paymentMethod = 'online';
	appData.setOrderField('payment', data.paymentMethod);
});

// Изменилось состояние валидации форм
events.on('paymentformErrors:change', (errors: Partial<IOrder>) => {
	const { address, payment } = errors;
	paymentForm.valid = !address && !payment;
	paymentForm.errors = Object.values(errors)
		.filter((i) => !!i)
		.join('; ');
	console.log(errors);
});

events.on('contactsformErrors:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contactsForm.valid = !email && !phone;
	contactsForm.errors = Object.values(errors)
		.filter((i) => !!i)
		.join('; ');
	console.log(errors);
});

// Изменено поле формы
events.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Открыть форму контактов
events.on('order:submit', () => {
	modal.render({
		content: contactsForm.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

// Открыть форму оплаты
events.on('order:open', () => {
	modal.render({
		content: paymentForm.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Блокируем прокрутку страницы, если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем карточки с сервера
api.getProducts().then(appData.setCatalog.bind(appData)).catch(console.error);
