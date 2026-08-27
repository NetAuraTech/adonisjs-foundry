import { HttpContextFactory } from '@adonisjs/core/factories/http';
import { test } from '@japa/runner';
import MissingRevisionException from '#cms/exceptions/page/missing_revision_exception';
import MissingTranslationException from '#cms/exceptions/page/missing_translation_exception';
import InvalidTemplateTypeException from '#cms/exceptions/template/invalid_template_type_exception';

async function testExceptionHandle(error: any, assert: any) {
	const ctxJson = new HttpContextFactory().create();
	ctxJson.request.wantsJSON = () => true;
	ctxJson.i18n = { t: () => 'translated message' } as any;

	let jsonResponse: any = null;
	let jsonStatus: number | null = null;
	ctxJson.response.status = function (this: any, s: number) {
		jsonStatus = s;
		return this;
	} as any;
	ctxJson.response.send = function (this: any, body: any) {
		jsonResponse = body;
		return this;
	} as any;

	await error.handle(error, ctxJson);

	assert.equal(jsonStatus, error.status);
	assert.equal(jsonResponse.error.code, error.code);
	assert.equal(jsonResponse.error.message, 'translated message');

	const ctxHtml = new HttpContextFactory().create();
	ctxHtml.request.wantsJSON = () => false;
	ctxHtml.i18n = { t: () => 'translated message' } as any;

	let flashedKey: string | null = null;
	let flashedValue: any = null;
	ctxHtml.session = {
		flash: (key: string, val: any) => {
			flashedKey = key;
			flashedValue = val;
		},
	} as any;

	let redirectedBack = false;
	let redirectedRoute: string | null = null;
	ctxHtml.response.redirect = function (this: any) {
		return {
			back: () => {
				redirectedBack = true;
			},
			toRoute: (route: string) => {
				redirectedRoute = route;
			},
		};
	} as any;

	await error.handle(error, ctxHtml);

	assert.equal(flashedKey, 'error');
	assert.equal(flashedValue, 'translated message');
	assert.isTrue(redirectedBack || redirectedRoute !== null);
}

test.group('CMS Exceptions', () => {
	test('MissingTranslationException properties and handle()', async ({ assert }) => {
		const error = new MissingTranslationException('fr', 1);
		assert.equal(error.status, 404);
		assert.equal(error.code, 'E_MISSING_TRANSLATION');
		await testExceptionHandle(error, assert);
	});

	test('MissingRevisionException properties and handle()', async ({ assert }) => {
		const error = new MissingRevisionException(42);
		assert.equal(error.status, 404);
		assert.equal(error.code, 'E_MISSING_REVISION');
		await testExceptionHandle(error, assert);
	});

	test('InvalidTemplateTypeException properties and handle()', async ({ assert }) => {
		const error = new InvalidTemplateTypeException();
		assert.equal(error.status, 422);
		assert.equal(error.code, 'E_INVALID_TEMPLATE_TYPE');
		await testExceptionHandle(error, assert);
	});
});
