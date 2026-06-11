<script lang="ts">
    interface Props {
        condition: boolean;
        message: string;
        linkHref: string;
        linkText: string;
        children?: import('svelte').Snippet;
    }
    let { condition, message, linkHref, linkText, children }: Props = $props();
</script>

{#if condition}
    {@render children?.()}
{:else}
    <div class="card">
        <div class="card-body">
            <p>{message}</p>
            <a href={linkHref} class="paper-btn btn-primary">{linkText}</a>
        </div>
    </div>
{/if}
