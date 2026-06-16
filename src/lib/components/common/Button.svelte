<script lang="ts">
    import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
    
    import { goto } from "$app/navigation"

    type Props = 
        | (HTMLButtonAttributes & { href?: never; onclick?: () => void })
        | (HTMLAnchorAttributes & { href: string; onclick?: () => void });

    let { href, onclick, children, ...rest } = $props() as any;

    function handleClick(event: MouseEvent) {
        if (onclick) {
            onclick();
        }
    }
</script>

{#if href}
    <a {href} class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary inline-block text-center" onclick={handleClick} {...rest}>
        {@render children?.()}
    </a>
{:else}
    <button class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary" onclick={handleClick} {...rest}>
        {@render children?.()}
    </button>
{/if}
