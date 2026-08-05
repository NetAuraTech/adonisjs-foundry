import type { I18nService } from '#services/i18n_service'

export function buildPageEditorPayload(i18n: I18nService) {
  return i18n.buildPayload({
    status: {
      value: 'cms.builder.status.value',
      draft: 'cms.builder.status.draft',
      published: 'cms.builder.status.published',
      archived: 'cms.builder.status.archived',
    },
    mode: {
      editor: 'cms.builder.mode.editor',
      split: 'cms.builder.mode.split',
      preview: 'cms.builder.mode.preview',
    },
    toolbar: {
      apply_template: 'cms.builder.toolbar.apply_template',
      save_as_template: 'cms.builder.toolbar.save_as_template',
      unpublish: 'cms.builder.toolbar.unpublish',
      publish: 'cms.builder.toolbar.publish',
      revisions: 'cms.builder.toolbar.revisions',
    },
    sidebar: {
      details: 'cms.builder.sidebar.details',
      seo: 'cms.builder.sidebar.seo',
    },
    form: {
      title: {
        value: 'cms.builder.form.title.value',
        placeholder: 'cms.builder.form.title.placeholder',
        slug_placeholder: 'cms.builder.form.title.slug_placeholder',
      },
      meta_title: {
        value: 'cms.builder.form.meta_title.value',
        placeholder: 'cms.builder.form.meta_title.placeholder',
      },
      meta_description: {
        value: 'cms.builder.form.meta_description.value',
        placeholder: 'cms.builder.form.meta_description.placeholder',
      },
    },
    save: {
      button: 'cms.builder.save.button',
      saving: 'cms.builder.save.saving',
      saved: 'cms.builder.save.saved',
      retry: 'cms.builder.save.retry',
    },
    locale: {
      add: 'cms.builder.locale.add',
      new_translation: 'cms.builder.locale.new_translation',
      select: 'cms.builder.locale.select',
      empty_content: 'cms.builder.locale.empty_content',
      copy_from: i18n.entry('cms.builder.locale.copy_from', { locale: '{locale}' }),
      add_button: 'cms.builder.locale.add_button',
    },
    blocktree: {
      select_to_configure: 'cms.builder.blocktree.select_to_configure',
      insert_template: 'cms.builder.blocktree.insert_template',
      add_block: 'cms.builder.blocktree.add_block',
      save_as_template: 'cms.builder.blocktree.save_as_template',
    },
    block_picker: {
      title: 'cms.builder.block_picker.title',
      search_placeholder: 'cms.builder.block_picker.search_placeholder',
      no_results: 'cms.builder.block_picker.no_results',
    },
    template_picker: {
      title: 'cms.builder.template_picker.title',
      empty: 'cms.builder.template_picker.empty',
      type_placeholder: 'cms.builder.template_picker.type_placeholder',
      page: 'cms.builder.template_picker.page',
      block: 'cms.builder.template_picker.block',
    },
    save_page_template: {
      title: 'cms.builder.save_page_template.title',
      name_label: 'cms.builder.save_page_template.name_label',
      name_placeholder: 'cms.builder.save_page_template.name_placeholder',
      submit: 'cms.builder.save_page_template.submit',
      error: 'cms.builder.save_page_template.error',
      reminder: 'cms.builder.save_page_template.reminder',
    },
    apply_page_template: {
      title: 'cms.builder.apply_page_template.title',
      warning: 'cms.builder.apply_page_template.warning',
      apply_button: 'cms.builder.apply_page_template.apply_button',
    },
    save_block_template: {
      title: 'cms.builder.save_block_template.title',
      name_label: 'cms.builder.save_block_template.name_label',
      name_placeholder: 'cms.builder.save_block_template.name_placeholder',
      submit: 'cms.builder.save_block_template.submit',
      exists_warning: i18n.entry('cms.builder.save_block_template.exists_warning', {
        name: '{name}',
      }),
      overwrite: 'cms.builder.save_block_template.overwrite',
      cancel: 'cms.builder.save_block_template.cancel',
    },
    blocks: {
      section: {
        label: 'cms.builder.blocks.section.label',
        description: 'cms.builder.blocks.section.description',
      },
      grid: {
        label: 'cms.builder.blocks.grid.label',
        description: 'cms.builder.blocks.grid.description',
      },
      flex: {
        label: 'cms.builder.blocks.flex.label',
        description: 'cms.builder.blocks.flex.description',
      },
      title: {
        label: 'cms.builder.blocks.title.label',
        description: 'cms.builder.blocks.title.description',
      },
      paragraph: {
        label: 'cms.builder.blocks.paragraph.label',
        description: 'cms.builder.blocks.paragraph.description',
      },
      button: {
        label: 'cms.builder.blocks.button.label',
        description: 'cms.builder.blocks.button.description',
      },
      separator: {
        label: 'cms.builder.blocks.separator.label',
        description: 'cms.builder.blocks.separator.description',
      },
      icon: {
        label: 'cms.builder.blocks.icon.label',
        description: 'cms.builder.blocks.icon.description',
      },
      form: {
        label: 'cms.builder.blocks.form.label',
        description: 'cms.builder.blocks.form.description',
      },
      field: {
        label: 'cms.builder.blocks.field.label',
        description: 'cms.builder.blocks.field.description',
      },
      htmltext: {
        label: 'cms.builder.blocks.htmltext.label',
        description: 'cms.builder.blocks.htmltext.description',
      },
      image: {
        label: 'cms.builder.blocks.image.label',
        description: 'cms.builder.blocks.image.description',
      },
      video: {
        label: 'cms.builder.blocks.video.label',
        description: 'cms.builder.blocks.video.description',
      },
      carousel: {
        label: 'cms.builder.blocks.carousel.label',
        description: 'cms.builder.blocks.carousel.description',
      },
      list: {
        label: 'cms.builder.blocks.list.label',
        description: 'cms.builder.blocks.list.description',
      },
      quote: {
        label: 'cms.builder.blocks.quote.label',
        description: 'cms.builder.blocks.quote.description',
      },
      iframe: {
        label: 'cms.builder.blocks.iframe.label',
        description: 'cms.builder.blocks.iframe.description',
      },
    },
  })
}
