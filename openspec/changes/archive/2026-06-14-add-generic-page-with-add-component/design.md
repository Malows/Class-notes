# Design: Generic `PageWithAdd`

## Component API

```svelte
<PageWithAdd
    title={string}
    onAdd={() => void}
    addLabelKey?: string (default: 'common.add')
>
    {#snippet children()}
        <!-- Content -->
    {/snippet}
</PageWithAdd>
```

## Implementation Strategy

- The component will import `CommonPage`.
- It will define the `extra` snippet internally to render the button.
- It will access the global `t` store to translate the label key.
- Styling of the button (`paper-btn btn-primary-outline`) will be encapsulated.

## i18n

- Default usage: `common.add`.
- Custom usage: Supports any valid i18n key via `addLabelKey` prop.
