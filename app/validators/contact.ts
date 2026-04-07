import vine from '@vinejs/vine'

const fieldValue = () => vine.string().trim().maxLength(2000)

export const contactValidator = vine.create({
  pageId: vine.number().positive(),
  locale: vine.string().trim().maxLength(10),
  recipientEmail: vine.string().trim().email().maxLength(254),
  fields: vine.array(
    vine.object({
      name: vine.string().trim().maxLength(100),
      value: fieldValue(),
    })
  ),
})
