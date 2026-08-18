import { createI18nEntry, type BuildPayloadResult, type I18nService } from '#services/i18n_service'

/**
 * The flat i18n key mapping for the visual page builder (editor modes, toolbar,
 * block tree, block picker and template dialogs).
 */
export const PAGE_EDITOR_MAPPING = {
  status: {
    value: 'builder.status.value',
    draft: 'builder.status.draft',
    published: 'builder.status.published',
    archived: 'builder.status.archived',
  },
  mode: {
    editor: 'builder.mode.editor',
    split: 'builder.mode.split',
    preview: 'builder.mode.preview',
  },
  toolbar: {
    apply_template: 'builder.toolbar.apply_template',
    save_as_template: 'builder.toolbar.save_as_template',
    unpublish: 'builder.toolbar.unpublish',
    publish: 'builder.toolbar.publish',
    revisions: 'builder.toolbar.revisions',
  },
  sidebar: {
    details: 'builder.sidebar.details',
    seo: 'builder.sidebar.seo',
  },
  form: {
    title: {
      value: 'builder.form.title.value',
      placeholder: 'builder.form.title.placeholder',
      slug_placeholder: 'builder.form.title.slug_placeholder',
    },
    meta_title: {
      value: 'builder.form.meta_title.value',
      placeholder: 'builder.form.meta_title.placeholder',
    },
    meta_description: {
      value: 'builder.form.meta_description.value',
      placeholder: 'builder.form.meta_description.placeholder',
    },
  },
  save: {
    button: 'builder.save.button',
    saving: 'builder.save.saving',
    saved: 'builder.save.saved',
    retry: 'builder.save.retry',
  },
  locale: {
    add: 'builder.locale.add',
    new_translation: 'builder.locale.new_translation',
    select: 'builder.locale.select',
    empty_content: 'builder.locale.empty_content',
    copy_from: createI18nEntry('builder.locale.copy_from', { locale: '{locale}' }),
    add_button: 'builder.locale.add_button',
  },
  blocktree: {
    select_to_configure: 'builder.blocktree.select_to_configure',
    insert_template: 'builder.blocktree.insert_template',
    add_block: 'builder.blocktree.add_block',
    save_as_template: 'builder.blocktree.save_as_template',
  },
  block_picker: {
    title: 'builder.block_picker.title',
    search_placeholder: 'builder.block_picker.search_placeholder',
    no_results: 'builder.block_picker.no_results',
  },
  template_picker: {
    title: 'builder.template_picker.title',
    empty: 'builder.template_picker.empty',
    type_placeholder: 'builder.template_picker.type_placeholder',
    page: 'builder.template_picker.page',
    block: 'builder.template_picker.block',
  },
  save_page_template: {
    title: 'builder.save_page_template.title',
    name_label: 'builder.save_page_template.name_label',
    name_placeholder: 'builder.save_page_template.name_placeholder',
    submit: 'builder.save_page_template.submit',
    error: 'builder.save_page_template.error',
    reminder: 'builder.save_page_template.reminder',
  },
  apply_page_template: {
    title: 'builder.apply_page_template.title',
    warning: 'builder.apply_page_template.warning',
    apply_button: 'builder.apply_page_template.apply_button',
  },
  save_block_template: {
    title: 'builder.save_block_template.title',
    name_label: 'builder.save_block_template.name_label',
    name_placeholder: 'builder.save_block_template.name_placeholder',
    submit: 'builder.save_block_template.submit',
    exists_warning: createI18nEntry('builder.save_block_template.exists_warning', {
      name: '{name}',
    }),
    overwrite: 'builder.save_block_template.overwrite',
    cancel: 'builder.save_block_template.cancel',
  },
  blocks: {
    section: {
      label: 'builder.blocks.section.label',
      description: 'builder.blocks.section.description',
    },
    grid: {
      label: 'builder.blocks.grid.label',
      description: 'builder.blocks.grid.description',
    },
    flex: {
      label: 'builder.blocks.flex.label',
      description: 'builder.blocks.flex.description',
    },
    title: {
      label: 'builder.blocks.title.label',
      description: 'builder.blocks.title.description',
    },
    paragraph: {
      label: 'builder.blocks.paragraph.label',
      description: 'builder.blocks.paragraph.description',
    },
    button: {
      label: 'builder.blocks.button.label',
      description: 'builder.blocks.button.description',
    },
    separator: {
      label: 'builder.blocks.separator.label',
      description: 'builder.blocks.separator.description',
    },
    icon: {
      label: 'builder.blocks.icon.label',
      description: 'builder.blocks.icon.description',
    },
    form: {
      label: 'builder.blocks.form.label',
      description: 'builder.blocks.form.description',
    },
    field: {
      label: 'builder.blocks.field.label',
      description: 'builder.blocks.field.description',
    },
    htmltext: {
      label: 'builder.blocks.htmltext.label',
      description: 'builder.blocks.htmltext.description',
    },
    image: {
      label: 'builder.blocks.image.label',
      description: 'builder.blocks.image.description',
    },
    video: {
      label: 'builder.blocks.video.label',
      description: 'builder.blocks.video.description',
    },
    carousel: {
      label: 'builder.blocks.carousel.label',
      description: 'builder.blocks.carousel.description',
    },
    list: {
      label: 'builder.blocks.list.label',
      description: 'builder.blocks.list.description',
    },
    quote: {
      label: 'builder.blocks.quote.label',
      description: 'builder.blocks.quote.description',
    },
    iframe: {
      label: 'builder.blocks.iframe.label',
      description: 'builder.blocks.iframe.description',
    },
  },
}

/**
 * Shape of the resolved translation payload for the visual page builder.
 */
export type PageEditorTranslations = BuildPayloadResult<typeof PAGE_EDITOR_MAPPING>

/**
 * Builds the resolved translation payload for the visual page builder.
 *
 * @param i18n - The request-scoped {@link I18nService}.
 * @returns The page editor `t` object with every UI string resolved.
 */
export function buildPageEditorPayload(i18n: I18nService): PageEditorTranslations {
  return i18n.buildPayload(PAGE_EDITOR_MAPPING)
}
