<template>
    <nav class="bottom-bar" aria-label="Mobile navigation">
        <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="bottom-bar__item"
        :class="{ 'bottom-bar__item--active': isActive(item) }"
        >
        <i :class="['ti', item.icon]" aria-hidden="true" />
        <span class="bottom-bar__label">{{  item.label  }}</span>
        </RouterLink>
    </nav>
</template>

<script setup>
    import { useRoute } from 'vue-router'
    import { useI18n } from '@/composables/useI18n'
    
    const route = useRoute()
    const { t } = useI18n()

    const navItems = [
        { name: 'dashboard', label: t.value.nav_dashboard,  icon: 'ti-layout-dashboard',  to: { name: 'dashboard' },  hint: 'gh' },
        { name: 'decks',     label: t.value.nav_decks,       icon: 'ti-stack-2',          to: { name: 'decks' },      hint: 'gd' },
        { name: 'vocab',     label: t.value.nav_vocab,  icon: 'ti-book-2',                to: { name: 'vocab' },      hint: 'gv' },
        { name: 'immersion', label: t.value.nav_immersion,   icon: 'ti-eye',              to: { name: 'immersion' },  hint: 'gi' },
        { name: 'stats',     label: t.value.nav_stats,  icon: 'ti-chart-line',            to: { name: 'stats' },      hint: 'gt' },
        { name: 'course',    label: t.value.nav_course,      icon: 'ti-road',             to: { name: 'course' },     hint: 'gc' },
    ]

    function isActive(item) {
        return route.name === item.name || route.name?.startsWith(item.name)
    }
</script>

<style scoped>
    .bottom-bar {
        display: none;
    }

    @media (max-width: 768px) {
        .bottom-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: var(--z-sidebar);
            background: var(--color-surface);
            border-top: 1px solid var(--color-border);
            padding: var(--space-2) 0;
            padding-bottom: calc(var(--space-2) + env(safe-area-inset-bottom));
        }


        .bottom-bar__item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: var(--space-1) 0;
            text-decoration: none;
            color: var(--color-text-faint);
            transition: color 160ms;
        }

        .bottom-bar__item .ti {
            font-size: 20px;
        }

        .bottom-bar__item--active {
            color: var(--color-accent);
        }

        .bottom-bar__label {
            font-size: 10px;
            font-weight: 500;
        }
    }
</style>