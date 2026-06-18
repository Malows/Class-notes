<script lang="ts">
  type Props = {
    href: string;
    label: string;
    shortLabel: string;
    isCollapsed: boolean;
    isActive?: boolean;
  };

  let { href, label, shortLabel, isCollapsed, isActive = false }: Props = $props();
</script>

<li class:active={isActive} class:collapsed={isCollapsed}>
  <a {href} title={label}>
    {isCollapsed ? shortLabel : label}
  </a>
</li>

<style>
  li {
    /* margin-bottom: 0.25rem; */
    font-size: 0.9rem;
    /* border-radius: 4px; */
  }

  li::before {
    display: none;
  }

  li.active {
    border-bottom-left-radius: 15px 3px;
    border-bottom-right-radius: 15px 5px;
    border-bottom: solid 2px var(--border-color);
  }

  li.active a {
    font-weight: bold;
  }

  a {
    text-decoration: none;
    color: inherit;
    display: block;
    padding: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-image: none;
  }

  li.collapsed {
    text-align: center;
  }
</style>
