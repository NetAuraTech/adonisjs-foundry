import type { I18nService } from '#services/i18n_service'

export function buildPageEditorPayload(i18n: I18nService) {
  return i18n.buildPayload({
    status: {
      value: 'admin.builder.status.value',
      draft: 'admin.builder.status.draft',
      published: 'admin.builder.status.published',
      archived: 'admin.builder.status.archived',
    },
    mode: {
      editor: 'admin.builder.mode.editor',
      split: 'admin.builder.mode.split',
      preview: 'admin.builder.mode.preview',
    },
    toolbar: {
      apply_template: 'admin.builder.toolbar.apply_template',
      save_as_template: 'admin.builder.toolbar.save_as_template',
      unpublish: 'admin.builder.toolbar.unpublish',
      publish: 'admin.builder.toolbar.publish',
      revisions: 'admin.builder.toolbar.revisions',
    },
    sidebar: {
      details: 'admin.builder.sidebar.details',
      seo: 'admin.builder.sidebar.seo',
    },
    form: {
      title: {
        value: 'admin.builder.form.title.value',
        placeholder: 'admin.builder.form.title.placeholder',
        slug_placeholder: 'admin.builder.form.title.slug_placeholder',
      },
      meta_title: {
        value: 'admin.builder.form.meta_title.value',
        placeholder: 'admin.builder.form.meta_title.placeholder',
      },
      meta_description: {
        value: 'admin.builder.form.meta_description.value',
        placeholder: 'admin.builder.form.meta_description.placeholder',
      },
    },
    save: {
      button: 'admin.builder.save.button',
      saving: 'admin.builder.save.saving',
      saved: 'admin.builder.save.saved',
      retry: 'admin.builder.save.retry',
    },
    locale: {
      add: 'admin.builder.locale.add',
      new_translation: 'admin.builder.locale.new_translation',
      select: 'admin.builder.locale.select',
      empty_content: 'admin.builder.locale.empty_content',
      copy_from: i18n.entry('admin.builder.locale.copy_from', { locale: '{locale}' }),
      add_button: 'admin.builder.locale.add_button',
    },
    blocktree: {
      select_to_configure: 'admin.builder.blocktree.select_to_configure',
      insert_template: 'admin.builder.blocktree.insert_template',
      add_block: 'admin.builder.blocktree.add_block',
      save_as_template: 'admin.builder.blocktree.save_as_template',
    },
    block_picker: {
      title: 'admin.builder.block_picker.title',
      search_placeholder: 'admin.builder.block_picker.search_placeholder',
      no_results: 'admin.builder.block_picker.no_results',
    },
    template_picker: {
      title: 'admin.builder.template_picker.title',
      empty: 'admin.builder.template_picker.empty',
      type_placeholder: 'admin.builder.template_picker.type_placeholder',
      page: 'admin.builder.template_picker.page',
      block: 'admin.builder.template_picker.block',
    },
    save_page_template: {
      title: 'admin.builder.save_page_template.title',
      name_label: 'admin.builder.save_page_template.name_label',
      name_placeholder: 'admin.builder.save_page_template.name_placeholder',
      submit: 'admin.builder.save_page_template.submit',
      error: 'admin.builder.save_page_template.error',
      reminder: 'admin.builder.save_page_template.reminder',
    },
    apply_page_template: {
      title: 'admin.builder.apply_page_template.title',
      warning: 'admin.builder.apply_page_template.warning',
      apply_button: 'admin.builder.apply_page_template.apply_button',
    },
    save_block_template: {
      title: 'admin.builder.save_block_template.title',
      name_label: 'admin.builder.save_block_template.name_label',
      name_placeholder: 'admin.builder.save_block_template.name_placeholder',
      submit: 'admin.builder.save_block_template.submit',
      exists_warning: i18n.entry('admin.builder.save_block_template.exists_warning', {
        name: '{name}',
      }),
      overwrite: 'admin.builder.save_block_template.overwrite',
      cancel: 'admin.builder.save_block_template.cancel',
    },
    blocks: {
      section: {
        label: 'admin.builder.blocks.section.label',
        description: 'admin.builder.blocks.section.description',
      },
      grid: {
        label: 'admin.builder.blocks.grid.label',
        description: 'admin.builder.blocks.grid.description',
      },
      flex: {
        label: 'admin.builder.blocks.flex.label',
        description: 'admin.builder.blocks.flex.description',
      },
      title: {
        label: 'admin.builder.blocks.title.label',
        description: 'admin.builder.blocks.title.description',
      },
      paragraph: {
        label: 'admin.builder.blocks.paragraph.label',
        description: 'admin.builder.blocks.paragraph.description',
      },
      button: {
        label: 'admin.builder.blocks.button.label',
        description: 'admin.builder.blocks.button.description',
      },
      separator: {
        label: 'admin.builder.blocks.separator.label',
        description: 'admin.builder.blocks.separator.description',
      },
      icon: {
        label: 'admin.builder.blocks.icon.label',
        description: 'admin.builder.blocks.icon.description',
      },
      form: {
        label: 'admin.builder.blocks.form.label',
        description: 'admin.builder.blocks.form.description',
      },
      field: {
        label: 'admin.builder.blocks.field.label',
        description: 'admin.builder.blocks.field.description',
      },
      htmltext: {
        label: 'admin.builder.blocks.htmltext.label',
        description: 'admin.builder.blocks.htmltext.description',
      },
      image: {
        label: 'admin.builder.blocks.image.label',
        description: 'admin.builder.blocks.image.description',
      },
      video: {
        label: 'admin.builder.blocks.video.label',
        description: 'admin.builder.blocks.video.description',
      },
      carousel: {
        label: 'admin.builder.blocks.carousel.label',
        description: 'admin.builder.blocks.carousel.description',
      },
      list: {
        label: 'admin.builder.blocks.list.label',
        description: 'admin.builder.blocks.list.description',
      },
      quote: {
        label: 'admin.builder.blocks.quote.label',
        description: 'admin.builder.blocks.quote.description',
      },
      iframe: {
        label: 'admin.builder.blocks.iframe.label',
        description: 'admin.builder.blocks.iframe.description',
      },
    },
  })
}
