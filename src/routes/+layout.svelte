<script lang="ts">
	import 'papercss/dist/paper.min.css';
	import '../app.css';
    import { initStoreContext } from '$lib/stores/context-initializer';
    import ClassNoteFooter from '$lib/components/layout/ClassNoteFooter.svelte';
    import NavBar from '$lib/components/layout/NavBar.svelte';
    import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';
	let { children } = $props();
    initStoreContext();
</script>

<div class="paper">
	<div class="container-fluid">

        <NavBar />

        <div class="layout-body">
            <Sidebar />
            
            <main class="main-content">
                <div class="page-container">
                    {@render children()}
                </div>
            </main>
        </div>

		<ClassNoteFooter />
	</div>
</div>

<style>
	.paper {
		margin: 0;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
	}

    .container-fluid {
        height: 100%;
        padding: 0 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .layout-body {
        height: 100%;
        display: flex;
        flex: 1;
        gap: 1rem;
    }

    .main-content {
        height: 100%;
        flex: 1;
        min-width: 0;
        padding-top: 1rem;
    }

    .page-container {
        padding: 1rem 0;
        height: 100%;
    }

    @media (max-width: 768px) {
        .layout-body {
            flex-direction: column;
        }
    }
</style>