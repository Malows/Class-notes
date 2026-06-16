<script lang="ts">
    import type { HTMLButtonAttributes } from 'svelte/elements';
    
    import { goto } from "$app/navigation"

    interface Props extends HTMLButtonAttributes {
        href?: string;
        onclick?: (event: MouseEvent) => void;
    }

    let { href, onclick, children, ...rest }: Props = $props();

    function handleClick(event: MouseEvent) {
        if (href) {
            event.preventDefault();
            try {
                const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
                if (isExternal) {
                    const url = new URL(href, window.location.origin);
                    if (url.origin !== window.location.origin) {
                        window.location.href = href;
                        return;
                    }
                }
                goto(href);
            } catch (e) {
                console.error('Navigation error:', e);
                window.location.href = href;
            }
        } else if (onclick) {
            onclick(event);
        }
    }
</script>

<button 
    type="button"
    class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary" 
    onclick={handleClick} 
    {...rest}
>
    {@render children?.()}
</button>
