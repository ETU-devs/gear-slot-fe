export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet',
      neutral: 'slate'
    },
    button: { slots: { base: 'rounded-xl' } },
    input: { slots: { base: 'rounded-xl placeholder:text-muted' } },
    select: { slots: { base: 'rounded-xl' } },
    textarea: { slots: { base: 'rounded-xl placeholder:text-muted' } }
  }
})
