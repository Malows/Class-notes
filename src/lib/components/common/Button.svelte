<script lang="ts">
    interface Props {
        href?: string;
        onclick?: () => void;
        children: any;
        [key: string]: any;
    }

    let { href, onclick, children, ...rest }: Props = $props();
</script>

{#if href}
    <a {href} class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary inline-block" {...rest}>
        {@render children()}
    </a>
{:else}
    <button class="sketch-border sketch-shadow-hover px-4 py-2 bg-primary text-on-primary" {onclick} {...rest}>
        {@render children()}
    </button>
{/if}
