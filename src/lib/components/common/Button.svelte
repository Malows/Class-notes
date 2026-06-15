<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    
    import { goto } from "$app/navigation"

    interface Props extends HTMLButtonAttributes {
        href?: string;
        onclick?: () => void;
    }

    let { href, onclick, children, ...rest }: Props = $props();

    function handleHref() {
        if (!href) return;
        if (href.startsWith('http')) {
            window.open(href, '_blank');
        } else {
            goto(href);
        }
    }

    function handleClick() {
        if (onclick) {
            onclick();
        } else {
            handleHref();
        }
    }
</script>

<button class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary" onclick={handleClick} {...rest}>
    {@render children?.()}
</button>
