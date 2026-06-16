<script lang="ts">
    interface Props {
        title: string;
        href: string;
        isCollapsed: boolean;
        icon: string;
        active?: boolean;
    }

    let { title, href, isCollapsed, icon, active } : Props = $props();
</script>

<a href={href} title={title} class:active={active} data-test-id="sidebar-item-{title.toLowerCase().trim().replace(/\s+/g, '-')}">
    {isCollapsed ? icon : title}
</a>

<style>
    a {
        background: none;
        color: inherit;
        display: block;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-decoration: none;
        text-overflow: ellipsis;
        font-size: 0.9rem;
    }

    a.active {
        font-weight: bold;
        color: var(--primary);
    }

    a:hover {
        transform: translateY(4px);
        /* background: var(--border-color); */
        /* color: var(--background-body); */
    }


</style>