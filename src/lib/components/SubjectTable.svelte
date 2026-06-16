<script lang="ts">
    import { t } from '$lib/i18n/config';

	import type { Subject } from '$lib/types';
    import Card from '$lib/components/common/Card.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        subjects: Subject[];
        onEdit: (s: Subject) => void;
        onDelete: (s: Subject) => void;
    }
    let { subjects, onEdit, onDelete }: Props = $props();
</script>

<Card>
    <h4 class="card-title">{$t('layout.subjects')}</h4>
    
    <!-- Desktop Table -->
    <table class="table-hover hidden md:block" data-test-id="subject-table">
        <thead>
            <tr>
                <th>{$t('layout.name')}</th>
                <th>{$t('layout.faculty')}</th>
                <th>{$t('layout.actions')}</th>
            </tr>
        </thead>
        <tbody>
            {#each subjects as subject}
                <tr data-test-id="subject-row-{subject.id}">
                    <td data-test-id="subject-name-{subject.id}">{subject.name}</td>
                    <td data-test-id="subject-faculty-name-{subject.id}">{subject.faculty_name}</td>
                    <td>
                        <Button href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods" data-test-id="view-periods-btn-{subject.id}">{$t('layout.view_periods')}</Button>
                        <Button onclick={() => onEdit(subject)} data-test-id="edit-btn-{subject.id}">{$t('common.edit')}</Button>
                        <Button onclick={() => onDelete(subject)} data-test-id="delete-btn-{subject.id}">{$t('common.delete')}</Button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-2" data-test-id="subject-cards-mobile">
        {#each subjects as subject}
            <Card data-test-id="subject-card-mobile-{subject.id}">
                <strong data-test-id="subject-name-mobile-{subject.id}">{subject.name}</strong><br>
                <small data-test-id="subject-faculty-name-mobile-{subject.id}">{subject.faculty_name}</small>
                <div class="flex gap-2 mt-2">
                    <Button href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods" data-test-id="view-periods-btn-mobile-{subject.id}">{$t('layout.view')}</Button>
                    <Button onclick={() => onEdit(subject)} data-test-id="edit-btn-mobile-{subject.id}">{$t('common.edit')}</Button>
                    <Button onclick={() => onDelete(subject)} data-test-id="delete-btn-mobile-{subject.id}">{$t('common.delete')}</Button>
                </div>
            </Card>
        {/each}
    </div>
</Card>
