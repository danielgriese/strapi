'use strict';

const { setCreatorFields, sanitizeEntity } = require('strapi-utils');
const { getService } = require('../utils');
const { validateCreateLocaleInput, validateUpdateLocaleInput } = require('../validation/locales');
const { formatLocale } = require('../domain/locale');

const sanitizeLocale = locale => {
  const model = strapi.getModel('locale', 'i18n');

  return sanitizeEntity(locale, { model });
};

module.exports = {
  async listLocales(ctx) {
    const localesService = getService('locales');

    const locales = await localesService.find();

    ctx.body = sanitizeLocale(locales);
  },

  async createLocale(ctx) {
    const { user } = ctx.state;
    const { body } = ctx.request;

    try {
      await validateCreateLocaleInput(body);
    } catch (err) {
      return ctx.badRequest('ValidationError', err);
    }

    const localesService = getService('locales');

    const existingLocale = await localesService.findByCode(body.code);
    if (existingLocale) {
      return ctx.badRequest('This locale already exists');
    }

    let localeToCreate = formatLocale(body);
    localeToCreate = setCreatorFields({ user })(localeToCreate);

    const locale = await localesService.create(localeToCreate);

    ctx.body = sanitizeLocale(locale);
  },

  async updateLocale(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;
    const { body } = ctx.request;

    try {
      await validateUpdateLocaleInput(body);
    } catch (err) {
      return ctx.badRequest('ValidationError', err);
    }

    const localesService = getService('locales');

    const existingLocale = await localesService.findById(id);
    if (!existingLocale) {
      return ctx.notFound('locale.notFound');
    }

    let updates = { name: body.name };
    updates = setCreatorFields({ user, isEdition: true })(updates);

    const updatedLocale = await localesService.update({ id }, updates);

    ctx.body = sanitizeLocale(updatedLocale);
  },
};